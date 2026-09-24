import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Loader from "../components/common/Loader";
import {
  Package,
  Calendar,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  XCircle,
} from "lucide-react";

const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "placed":
      return {
        label: "Placed",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
      };
    case "confirmed":
    case "packed":
      return {
        label: status === "packed" ? "Packed" : "Confirmed",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Package,
      };
    case "shipped":
      return {
        label: "Out for Delivery",
        className: "bg-purple-50 text-purple-700 border-purple-200",
        icon: Truck,
      };
    case "delivered":
      return {
        label: "Delivered",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-rose-50 text-rose-700 border-rose-200",
        icon: XCircle,
      };
    case "returned":
    case "refunded":
      return {
        label: status === "refunded" ? "Refunded" : "Returned",
        className: "bg-slate-100 text-slate-700 border-slate-200",
        icon: RotateCcw,
      };
    default:
      return {
        label: status || "Processing",
        className: "bg-slate-100 text-slate-700 border-slate-200",
        icon: Package,
      };
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/orders")
      .then(({ data }) => setOrders(data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader message="Retrieving your orders..." />;

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 stroke-1" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">No Orders Yet</h1>
        <p className="text-slate-500 mt-2 text-sm max-w-sm mx-auto">
          You haven't placed any orders yet. Discover our curated catalog and place your first order today!
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-8 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-full text-sm shadow-md transition-all active:scale-95"
        >
          Explore Catalog
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Your Order History
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Track and manage your past purchases and delivery statuses.
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              {/* Order Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {orderDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total</span>
                    <span className="text-lg font-bold text-slate-900">
                      ₹{(order.grandTotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <Link
                    to={`/orders/${order._id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-colors border border-emerald-200/60"
                  >
                    Details
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Sub-orders Status Strip */}
              <div className="space-y-2">
                {order.subOrders?.map((so) => {
                  const badge = getStatusBadge(so.status);
                  const BadgeIcon = badge.icon;
                  return (
                    <div
                      key={so._id}
                      className="flex items-center justify-between bg-slate-50/70 rounded-2xl p-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-full border text-[11px] ${badge.className}`}
                        >
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                        <span className="text-slate-500 font-medium">
                          {so.items?.length || 0} {so.items?.length === 1 ? "item" : "items"}
                        </span>
                      </div>

                      <span className="text-slate-600 font-medium">
                        Subtotal: ₹{(so.total || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
