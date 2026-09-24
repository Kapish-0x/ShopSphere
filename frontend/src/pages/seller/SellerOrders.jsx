import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Loader from "../../components/common/Loader";
import { Package, ArrowLeft, Calendar, CheckCircle2 } from "lucide-react";

const nextStatusOptions = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
  returned: [],
  refunded: [],
};

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axiosInstance.get("/orders");
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, subOrderId, status) => {
    try {
      await axiosInstance.patch(`/orders/${orderId}/suborders/${subOrderId}/status`, { status });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Could not update status");
    }
  };

  if (loading) return <Loader message="Loading store orders..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to="/seller/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Merchant Order Queue
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review incoming customer purchases and update dispatch progress.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
          <Package className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">No store orders yet</h2>
          <p className="text-xs text-slate-500">New customer orders will appear here for processing.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) =>
            order.subOrders?.map((subOrder) => (
              <div
                key={subOrder._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">
                    {subOrder.status}
                  </span>
                </div>

                <div className="space-y-2">
                  {subOrder.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs text-slate-700">
                      <span>
                        <strong>{item.title}</strong> × {item.quantity}
                      </span>
                      <span className="font-semibold text-slate-900">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                {nextStatusOptions[subOrder.status]?.length > 0 && (
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 flex-wrap">
                    <span className="text-xs font-medium text-slate-400">Advance status:</span>
                    {nextStatusOptions[subOrder.status].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(order._id, subOrder._id, status)}
                        className="text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 px-3 py-1.5 rounded-xl capitalize transition-colors"
                      >
                        Mark as {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
