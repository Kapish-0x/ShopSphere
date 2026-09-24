import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Loader from "../../components/common/Loader";

const emptyVariant = () => ({ sku: "", price: "", stock: "", attributes: {} });

const AddEditProduct = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    variants: [emptyVariant()],
  });

  useEffect(() => {
    axiosInstance.get("/categories").then(({ data }) => setCategories(data.categories));
    if (isEdit) {
      axiosInstance.get(`/products/${id}`).then(({ data }) => {
        const p = data.product;
        setForm({
          title: p.title,
          description: p.description || "",
          category: p.category?._id || "",
          tags: (p.tags || []).join(", "),
          variants: p.variants.map((v) => ({
            _id: v._id,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            attributes: v.attributes || {},
          })),
        });
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateVariant = (index, field, value) => {
    const updated = [...form.variants];
    updated[index][field] = value;
    setForm({ ...form, variants: updated });
  };

  const addVariant = () => setForm({ ...form, variants: [...form.variants, emptyVariant()] });
  const removeVariant = (index) => setForm({ ...form, variants: form.variants.filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        variants: form.variants.map((v) => ({
          sku: v.sku,
          price: Number(v.price),
          stock: Number(v.stock),
          attributes: v.attributes,
        })),
      };

      if (isEdit) {
        await axiosInstance.patch(`/products/${id}`, payload);
      } else {
        await axiosInstance.post("/products", payload);
      }
      navigate("/seller/products");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!isEdit) return setError("Save the product first, then generate a description.");
    setAiLoading(true);
    try {
      const { data } = await axiosInstance.post(`/ai/generate-description/${id}`);
      setForm({ ...form, description: data.description });
    } catch (err) {
      setError(err.response?.data?.message || "AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEdit ? "Edit Product" : "Add Product"}</h1>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-4">
        <input
          required
          placeholder="Product title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border rounded-md px-3 py-2"
        />

        <select
          required
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full border rounded-md px-3 py-2"
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-gray-600">Description</label>
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={aiLoading}
              className="text-xs text-primary-600 hover:underline disabled:opacity-50"
            >
              {aiLoading ? "Generating..." : "✨ Generate with AI"}
            </button>
          </div>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <input
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full border rounded-md px-3 py-2"
        />

        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-gray-700">Variants</h2>
            <button type="button" onClick={addVariant} className="text-sm text-primary-600 hover:underline">
              + Add variant
            </button>
          </div>

          {form.variants.map((v, i) => (
            <div key={i} className="border rounded-md p-3 mb-2 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <input
                  required
                  placeholder="SKU"
                  value={v.sku}
                  onChange={(e) => updateVariant(i, "sku", e.target.value)}
                  className="border rounded-md px-2 py-1.5 text-sm"
                />
                <input
                  required
                  type="number"
                  placeholder="Price"
                  value={v.price}
                  onChange={(e) => updateVariant(i, "price", e.target.value)}
                  className="border rounded-md px-2 py-1.5 text-sm"
                />
                <input
                  required
                  type="number"
                  placeholder="Stock"
                  value={v.stock}
                  onChange={(e) => updateVariant(i, "stock", e.target.value)}
                  className="border rounded-md px-2 py-1.5 text-sm"
                />
              </div>
              {form.variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove variant
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
};

export default AddEditProduct;
