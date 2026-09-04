import { Router } from "express";
import { CategoryModel } from "../models/Categorymodel.js";
import { verifyToken, verifyRole } from "../middleware/verifyToken.js";

const router = Router();

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

// GET /api/categories — public, returns flat list with parent refs
// (frontend builds the tree from parent/child relationships)
router.get("/", async (req, res) => {
  try {
    const categories = await CategoryModel.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ categories });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch categories", error: err.message });
  }
});

// POST /api/categories — [admin] create
router.post("/", verifyToken, verifyRole("admin"), async (req, res) => {
  try {
    const { name, description, imageUrl, parent } = req.body;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    let slug = slugify(name);
    const slugExists = await CategoryModel.findOne({ slug });
    if (slugExists) {
      return res.status(409).json({ message: "A category with this name already exists" });
    }

    // if a parent is provided, make sure it actually exists
    if (parent) {
      const parentExists = await CategoryModel.findById(parent);
      if (!parentExists) {
        return res.status(400).json({ message: "Parent category not found" });
      }
    }

    const category = await CategoryModel.create({
      name,
      slug,
      description,
      imageUrl,
      parent: parent || null,
    });

    res.status(201).json({ message: "Category created", category });
  } catch (err) {
    res.status(500).json({ message: "Could not create category", error: err.message });
  }
});

// PATCH /api/categories/:id — [admin] update
router.patch("/:id", verifyToken, verifyRole("admin"), async (req, res) => {
  try {
    const { name, description, imageUrl, parent, isActive } = req.body;

    const category = await CategoryModel.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // prevent a category from becoming its own parent (direct self-reference)
    if (parent && parent === req.params.id) {
      return res.status(400).json({ message: "A category cannot be its own parent" });
    }

    if (name !== undefined) {
      category.name = name;
      category.slug = slugify(name);
    }
    if (description !== undefined) category.description = description;
    if (imageUrl !== undefined) category.imageUrl = imageUrl;
    if (parent !== undefined) category.parent = parent || null;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    res.status(200).json({ message: "Category updated", category });
  } catch (err) {
    res.status(500).json({ message: "Could not update category", error: err.message });
  }
});

// DELETE /api/categories/:id — [admin] delete
router.delete("/:id", verifyToken, verifyRole("admin"), async (req, res) => {
  try {
    // block deletion if child categories exist under this one
    const hasChildren = await CategoryModel.exists({ parent: req.params.id });
    if (hasChildren) {
      return res.status(400).json({
        message: "Cannot delete a category that has subcategories. Delete or reassign them first.",
      });
    }

    const category = await CategoryModel.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Could not delete category", error: err.message });
  }
});

export default router;