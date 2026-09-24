import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import Loader from "../../components/common/Loader";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // admin-only endpoint — returns every product regardless of status
      const { data } = await axiosInstance.get("/products/admin/all");
      setProducts(data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axiosInstance.patch(`/products/${id}/status`, { status });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update product");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Products</h1>

      {products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p._id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{p.title}</p>
                <p className="text-sm text-gray-500">{p.store?.storeName} · ₹{p.basePrice}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full capitalize">
                  {p.status.replace("_", " ")}
                </span>
                {p.status === "pending_review" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(p._id, "active")}
                      className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-md hover:bg-green-200"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(p._id, "rejected")}
                      className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-md hover:bg-red-200"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageProducts;