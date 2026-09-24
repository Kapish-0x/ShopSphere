import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Loader from "../../components/common/Loader";
import {
  Users,
  Store,
  ShoppingBag,
  Package,
  Layers,
  ChevronRight,
  Shield,
  Clock,
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/dashboard/admin")
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader message="Loading admin control center..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header and Nav Links */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Admin Control Center
            </h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Global marketplace governance, store verifications, and catalog management.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/admin/stores"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
          >
            <Store className="w-3.5 h-3.5" /> Stores
          </Link>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Products
          </Link>
          <Link
            to="/admin/categories"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5" /> Categories
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
          >
            <Users className="w-3.5 h-3.5" /> Users
          </Link>
        </div>
      </div>

      {stats && (
        <>
          {/* 4 Admin Stat Cards — reading the actual nested response shape */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              icon={Users}
              label="Registered Users"
              value={(stats.users?.total ?? 0).toLocaleString("en-IN")}
              color="blue"
            />
            <StatCard
              icon={Store}
              label="Active Stores"
              value={(stats.stores?.total ?? 0).toLocaleString("en-IN")}
              color="emerald"
            />
            <StatCard
              icon={ShoppingBag}
              label="Total Products"
              value={(stats.products?.total ?? 0).toLocaleString("en-IN")}
              color="purple"
            />
            <StatCard
              icon={Package}
              label="Completed Orders"
              value={(stats.orders?.total ?? 0).toLocaleString("en-IN")}
              color="slate"
            />
          </div>

          {/* Pending Approvals Notification Card */}
          {(stats.stores?.pendingApproval > 0 || stats.products?.pendingApproval > 0) && (
            <div className="bg-amber-50/90 border border-amber-200 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-700" />
                <h2 className="text-base font-bold text-amber-950">Pending Review & Approvals</h2>
              </div>
              <p className="text-xs text-amber-800">
                Action required on new store applications or product submissions before they go live on ShopSphere.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {stats.stores?.pendingApproval > 0 && (
                  <Link
                    to="/admin/stores"
                    className="p-3 bg-white rounded-2xl border border-amber-200 text-xs font-semibold text-slate-800 hover:border-amber-400 transition-colors flex items-center justify-between"
                  >
                    <span>{stats.stores.pendingApproval} Merchant stores awaiting approval</span>
                    <ChevronRight className="w-4 h-4 text-amber-600" />
                  </Link>
                )}
                {stats.products?.pendingApproval > 0 && (
                  <Link
                    to="/admin/products"
                    className="p-3 bg-white rounded-2xl border border-amber-200 text-xs font-semibold text-slate-800 hover:border-amber-400 transition-colors flex items-center justify-between"
                  >
                    <span>{stats.products.pendingApproval} Products awaiting catalog review</span>
                    <ChevronRight className="w-4 h-4 text-amber-600" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${colorMap[color] || colorMap.slate}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
  );
};

export default AdminDashboard;