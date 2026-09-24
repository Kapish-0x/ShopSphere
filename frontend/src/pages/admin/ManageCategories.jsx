import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import Loader from "../../components/common/Loader";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: "", description: "", parent: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await axiosInstance.get("/categories");
      setCategories(data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/categories", {
        ...newCategory,
        parent: newCategory.parent || undefined,
      });
      setNewCategory({ name: "", description: "", parent: "" });
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Could not create category");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axiosInstance.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete category");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Categories</h1>

      <form onSubmit={handleCreate} className="bg-white border rounded-lg p-4 space-y-2 mb-6">
        <p className="text-sm font-medium text-gray-700">Add category</p>
        <input
          required
          placeholder="Name"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <input
          placeholder="Description"
          value={newCategory.description}
          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <select
          value={newCategory.parent}
          onChange={(e) => setNewCategory({ ...newCategory, parent: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        >
          <option value="">No parent (top-level)</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm">
          Add Category
        </button>
      </form>

      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c._id} className="bg-white border rounded-lg p-3 flex justify-between items-center">
            <p className="text-sm text-gray-700">
              {c.name} {c.parent && <span className="text-xs text-gray-400">(subcategory)</span>}
            </p>
            <button onClick={() => handleDelete(c._id)} className="text-xs text-red-500 hover:underline">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageCategories;
