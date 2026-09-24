import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Loader from "../../components/common/Loader";
import {
  TrendingUp,
  Package,
  ShoppingBag,
  AlertTriangle,
  Store,
  Plus,
  ArrowRight,
  ChevronRight,
  Boxes,
} from "lucide-react";

const SellerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/dashboard/seller")
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader message="Loading seller analytics..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Seller Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor sales revenue, active inventory, and store orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/seller/store"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
          >
            <Store className="w-3.5 h-3.5" /> My Store
          </Link>
          <Link
            to="/seller/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
          >
            <Package className="w-3.5 h-3.5" /> Orders
          </Link>
          <Link
            to="/seller/products/new"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Product
          </Link>
        </div>
      </div>

      {stats ? (
        <>
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              icon={TrendingUp}
              label="Total Revenue"
              value={`₹${(stats.totalRevenue ?? 0).toLocaleString("en-IN")}`}
              color="emerald"
            />
            <StatCard
              icon={Package}
              label="Total Orders"
              value={(stats.totalOrders ?? 0).toLocaleString("en-IN")}
              color="blue"
            />
            <StatCard
              icon={Boxes}
              label="Listed Products"
              value={(stats.totalProducts ?? 0).toLocaleString("en-IN")}
              color="purple"
            />
            <StatCard
              icon={AlertTriangle}
              label="Low Stock Alerts"
              value={stats.lowStockCount ?? 0}
              color="amber"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Low Stock Alerts Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h2 className="text-base font-bold text-slate-900">Low Stock Inventory</h2>
                </div>
                <Link
                  to="/seller/products"
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Manage All
                </Link>
              </div>

              {stats.lowStockProducts?.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {stats.lowStockProducts.map((p) => (
                    <li key={p._id} className="py-3 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 truncate max-w-xs">{p.title}</span>
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                        Running Low
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 py-4">No low stock items. All inventory levels are healthy!</p>
              )}
            </div>

            {/* Top Products Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-base font-bold text-slate-900">Top Performing Products</h2>
                </div>
                <Link
                  to="/seller/products"
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  View All
                </Link>
              </div>

              {stats.topProducts?.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {stats.topProducts.map((p, idx) => (
                    <li key={p._id} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-slate-800 truncate">{p.title}</span>
                      </div>
                      <span className="text-emerald-700 font-semibold shrink-0">Featured</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 py-4">No sales records yet. Share your store link to start selling!</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto space-y-4">
          <Store className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Set Up Your Store</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Configure your store details to start listing products and monitoring analytics.
          </p>
          <Link
            to="/seller/store"
            className="inline-block bg-emerald-600 text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-emerald-500 transition-colors"
          >
            Configure Store
          </Link>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${colorMap[color] || colorMap.emerald}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  );
};

export default SellerDashboard;
