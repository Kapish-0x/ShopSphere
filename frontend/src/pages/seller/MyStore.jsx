import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/common/Loader";
import {
  Store,
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const MyStore = () => {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    storeName: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.sellerProfile?.storeId) {
      axiosInstance
        .get(`/stores/${user.sellerProfile.storeId}`)
        .then(({ data }) => setStore(data.store))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCreateStore = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post("/stores", form);
      setStore(data.store);
      setMessage("Store profile created! Awaiting admin verification.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not create store profile");
    }
  };

  if (loading) return <Loader message="Loading store details..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to="/seller/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Store Profile
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your merchant presence and customer contact channels.
        </p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {!store ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Set Up Your Storefront</h2>
              <p className="text-xs text-slate-500">Provide details for your merchant brand</p>
            </div>
          </div>

          <form onSubmit={handleCreateStore} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Store Name <span className="text-rose-500">*</span>
              </label>
              <input
                required
                placeholder="e.g. Heritage Leatherworks"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full bg-slate-50 text-slate-800 text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Store Bio & Description
              </label>
              <textarea
                rows={3}
                placeholder="Tell customers about your story and product craftsmanship..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-slate-50 text-slate-800 text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Support Email
                </label>
                <input
                  type="email"
                  placeholder="support@yourstore.com"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  className="w-full bg-slate-50 text-slate-800 text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Customer inquiry phone"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  className="w-full bg-slate-50 text-slate-800 text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-xs transition-colors"
            >
              Create Storefront
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{store.storeName}</h2>
                <p className="text-xs text-slate-400">Merchant Storefront</p>
              </div>
            </div>

            <span
              className={`self-start sm:self-auto text-xs font-semibold px-3 py-1 rounded-full border capitalize flex items-center gap-1.5 ${
                store.status === "approved"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : store.status === "pending"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {store.status === "approved" && <CheckCircle className="w-3.5 h-3.5" />}
              {store.status === "pending" && <Clock className="w-3.5 h-3.5" />}
              Status: {store.status}
            </span>
          </div>

          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Description
              </h3>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl">
                {store.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <Mail className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Email</p>
                  <p className="text-xs font-medium text-slate-800">{store.contactEmail || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <Phone className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Phone</p>
                  <p className="text-xs font-medium text-slate-800">{store.contactPhone || "N/A"}</p>
                </div>
              </div>
            </div>

            {store.status === "pending" && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2 mt-4">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Your storefront is currently in verification queue. Once an administrator approves it, your products will become publicly visible.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyStore;
