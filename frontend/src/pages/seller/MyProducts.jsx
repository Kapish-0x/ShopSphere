import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/common/Loader";
import {
  Package,
  Plus,
  Edit3,
  Archive,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

const statusConfig = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-700 border-slate-200" },
  pending_review: { label: "In Review", className: "bg-amber-50 text-amber-700 border-amber-200" },
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", className: "bg-rose-50 text-rose-700 border-rose-200" },
  archived: { label: "Archived", className: "bg-slate-100 text-slate-500 border-slate-200" },
};

const MyProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.sellerProfile?.storeId) {
      axiosInstance
        .get(`/stores/${user.sellerProfile.storeId}/products`)
        .then(({ data }) => setProducts(data.products || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to archive this product?")) return;
    await axiosInstance.delete(`/products/${id}`);
    setProducts(products.filter((p) => p._id !== id));
  };

  if (loading) return <Loader message="Loading your catalog..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/seller/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Store Inventory
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {products.length} {products.length === 1 ? "product" : "products"} listed in your catalog.
          </p>
        </div>

        <Link
          to="/seller/products/new"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-full shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8 stroke-1" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">No products listed yet</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Create your first product listing with pricing, image, and options to begin selling.
          </p>
          <Link
            to="/seller/products/new"
            className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-colors"
          >
            Create Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {products.map((p) => {
            const status = statusConfig[p.status] || {
              label: p.status,
              className: "bg-slate-100 text-slate-700",
            };
            return (
              <div
                key={p._id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                    {p.thumbnailUrl ? (
                      <img src={p.thumbnailUrl} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-bold text-sm text-slate-900 truncate">{p.title}</p>
                    <p className="text-xs font-semibold text-emerald-700">
                      ₹{(p.basePrice || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end self-end sm:self-center">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${status.className}`}
                  >
                    {status.label}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/products/${p._id}`}
                      target="_blank"
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                      title="View live product"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/seller/products/${p._id}/edit`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Archive product"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyProducts;
