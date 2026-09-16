import { Router } from "express";
import { ProductModel } from "../models/ProductModel.js";
import { StoreModel } from "../models/StoreModel.js";
import { verifyToken, verifyRole } from "../middleware/verifyToken.js";

const router = Router();

// cosine similarity — measures how close two embedding vectors are in meaning.
// 1 = near-identical meaning, 0 = unrelated. Kept right here, no separate file needed.
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA?.length || !vecB?.length || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }

  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
};

// calls Groq's chat completion endpoint — used for description generation.
// Groq is OpenAI-compatible for chat, so the request/response shape is identical —
// only the base URL, API key, and model name change.
const callChatCompletion = async (prompt) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error: ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

// Groq does not offer an embeddings endpoint, so embeddings go through Gemini instead —
// free tier available via Google AI Studio, no card required.
// This is the ONLY place Gemini is used — description generation is Groq.
const getEmbedding = async (text) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/gemini-embedding-001",
        content: { parts: [{ text }] },
        outputDimensionality: 768, // smaller = faster cosine similarity, plenty accurate for this scale
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${errText}`);
  }

  const data = await response.json();
  return data.embedding.values;
};

// POST /api/ai/generate-description/:productId — [seller/owner]
// Uses the product's structured attributes to generate a description + selling points
router.post(
  "/generate-description/:productId",
  verifyToken,
  verifyRole("seller"),
  async (req, res) => {
    try {
      const product = await ProductModel.findById(req.params.productId).populate("category");
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const store = await StoreModel.findOne({ seller: req.user._id });
      if (!store || product.store.toString() !== store._id.toString()) {
        return res.status(403).json({ message: "You do not own this product" });
      }

      const attributesText = Object.entries(Object.fromEntries(product.attributes || []))
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");

      const prompt = `You are writing a product listing for an e-commerce marketplace.

Product title: ${product.title}
Category: ${product.category?.name || "N/A"}
Attributes: ${attributesText || "none provided"}

Write:
1. A compelling product description (2-3 sentences, no marketing fluff/hype words)
2. Exactly 4 key selling points as short bullet phrases (not full sentences)

Respond ONLY in this exact JSON format, nothing else:
{"description": "...", "sellingPoints": ["...", "...", "...", "..."]}`;

      const raw = await callChatCompletion(prompt);
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      product.aiGeneratedDescription = parsed.description;
      product.aiKeySellingPoints = parsed.sellingPoints;
      await product.save();

      res.status(200).json({
        message: "Description generated",
        description: parsed.description,
        sellingPoints: parsed.sellingPoints,
      });
    } catch (err) {
      res.status(500).json({ message: "Could not generate description", error: err.message });
    }
  }
);

// POST /api/ai/index-product/:productId — [seller/owner or admin]
// Generates and stores the searchable embedding for a product.
// Call this after creating a product or after admin approval.
router.post("/index-product/:productId", verifyToken, verifyRole("seller", "admin"), async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.user.role === "seller") {
      const store = await StoreModel.findOne({ seller: req.user._id });
      if (!store || product.store.toString() !== store._id.toString()) {
        return res.status(403).json({ message: "You do not own this product" });
      }
    }

    // combine everything meaningful about the product into one text blob to embed
    const textToEmbed = [
      product.title,
      product.description,
      product.aiGeneratedDescription,
      (product.tags || []).join(", "),
    ]
      .filter(Boolean)
      .join(". ");

    const embedding = await getEmbedding(textToEmbed);

    product.searchEmbedding = embedding;
    await product.save();

    res.status(200).json({ message: "Product indexed for semantic search" });
  } catch (err) {
    res.status(500).json({ message: "Could not index product", error: err.message });
  }
});

// GET /api/ai/semantic-search?q=... — public, meaning-based product search
// Brute-force cosine similarity over active products. Fine at this project's scale;
// a production system with millions of products would use a vector database instead.
router.get("/semantic-search", async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Query parameter 'q' is required" });
    }

    const queryEmbedding = await getEmbedding(q);

    // only fetch products that have already been indexed
    const products = await ProductModel.find({
      status: "active",
      isActive: true,
      searchEmbedding: { $exists: true, $ne: [] },
    }).select("+searchEmbedding");

    const ranked = products
      .map((product) => ({
        product,
        score: cosineSimilarity(queryEmbedding, product.searchEmbedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Number(limit));

    res.status(200).json({
      results: ranked.map((r) => ({ product: r.product, relevance: r.score })),
    });
  } catch (err) {
    res.status(500).json({ message: "Semantic search failed", error: err.message });
  }
});

export default router;