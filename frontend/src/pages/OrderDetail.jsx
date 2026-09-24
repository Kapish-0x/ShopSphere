// import React, { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import axiosInstance from "../api/axiosInstance";
// import Loader from "../components/common/Loader";
// import {
//   Package,
//   Calendar,
//   MapPin,
//   Truck,
//   CheckCircle,
//   Clock,
//   RotateCcw,
//   ArrowLeft,
//   AlertCircle,
//   Check,
//   ShoppingBag,
// } from "lucide-react";

// const TIMELINE_STEPS = ["placed", "confirmed", "shipped", "delivered"];

// const OrderTimeline = ({ currentStatus }) => {
//   const normalizedStatus = currentStatus?.toLowerCase() || "placed";
//   const currentIndex = TIMELINE_STEPS.indexOf(normalizedStatus);
//   const isCancelled = normalizedStatus === "cancelled";
//   const isReturned = normalizedStatus === "returned" || normalizedStatus === "refunded";

//   if (isCancelled || isReturned) {
//     return (
//       <div className="p-4 rounded-2xl bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
//         <RotateCcw className="w-4 h-4 text-slate-500" />
//         Order Status: {normalizedStatus}
//       </div>
//     );
//   }

//   return (
//     <div className="py-4">
//       <div className="relative flex items-center justify-between">
//         {/* Progress connecting line */}
//         <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-100 -z-0">
//           <div
//             className="h-full bg-emerald-500 transition-all duration-500"
//             style={{
//               width: `${Math.max(0, Math.min(100, (currentIndex / (TIMELINE_STEPS.length - 1)) * 100))}%`,
//             }}
//           />
//         </div>

//         {TIMELINE_STEPS.map((step, idx) => {
//           const isComplete = idx <= currentIndex;
//           const isCurrent = idx === currentIndex;
//           return (
//             <div key={step} className="flex flex-col items-center relative z-10">
//               <div
//                 className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
//                   isComplete
//                     ? "bg-emerald-600 text-white ring-4 ring-emerald-50"
//                     : "bg-white text-slate-400 border-2 border-slate-200"
//                 }`}
//               >
//                 {isComplete ? <Check className="w-4 h-4" /> : idx + 1}
//               </div>
//               <span
//                 className={`text-[11px] mt-2 capitalize font-semibold ${
//                   isCurrent ? "text-emerald-700" : isComplete ? "text-slate-700" : "text-slate-400"
//                 }`}
//               >
//                 {step}
//               </span>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// const OrderDetail = () => {
//   const { id } = useParams();
//   const [order, setOrder] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [returnMsg, setReturnMsg] = useState("");
//   const [returnError, setReturnError] = useState("");

//   useEffect(() => {
//     fetchOrder();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   const fetchOrder = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axiosInstance.get(`/orders/${id}`);
//       setOrder(data.order);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReturnRequest = async (subOrder, item) => {
//     const reason = window.prompt("Please state the reason for requesting a return:");
//     if (!reason || !reason.trim()) return;

//     try {
//       setReturnMsg("");
//       setReturnError("");
//       await axiosInstance.post("/returns", {
//         orderId: order._id,
//         subOrderId: subOrder._id,
//         items: [{ product: item.product, variantId: item.variantId, quantity: item.quantity }],
//         reason: reason.trim(),
//       });
//       setReturnMsg("Return request submitted successfully. Our team will review it shortly.");
//     } catch (err) {
//       setReturnError(err.response?.data?.message || "Could not request return at this time.");
//     }
//   };

//   if (loading) return <Loader message="Fetching order details..." />;
//   if (!order) {
//     return (
//       <div className="max-w-2xl mx-auto px-4 py-24 text-center">
//         <h2 className="text-2xl font-bold text-slate-800">Order not found</h2>
//         <Link to="/orders" className="text-emerald-600 underline font-medium mt-4 inline-block">
//           Back to all orders
//         </Link>
//       </div>
//     );
//   }

//   const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   });

//   return (
//     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
//       {/* Back Button & Header */}
//       <div className="space-y-3">
//         <Link
//           to="/orders"
//           className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
//         >
//           <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
//         </Link>

//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
//               Order #{order.orderNumber}
//             </h1>
//             <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
//               <Calendar className="w-3.5 h-3.5 text-slate-400" />
//               Placed on {orderDate}
//             </p>
//           </div>

//           <div className="text-left sm:text-right">
//             <span className="text-xs text-slate-400 block">Total Amount</span>
//             <span className="text-2xl font-black text-slate-900">
//               ₹{(order.grandTotal || 0).toLocaleString("en-IN")}
//             </span>
//           </div>
//         </div>
//       </div>

//       {returnMsg && (
//         <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs flex items-center gap-2">
//           <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
//           <span>{returnMsg}</span>
//         </div>
//       )}
//       {returnError && (
//         <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs flex items-center gap-2">
//           <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
//           <span>{returnError}</span>
//         </div>
//       )}

//       {/* Shipping Address Card */}
//       <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex items-start gap-4">
//         <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
//           <MapPin className="w-5 h-5" />
//         </div>
//         <div className="space-y-1 text-sm">
//           <h3 className="font-bold text-slate-900">Delivery Address</h3>
//           <p className="text-slate-600">
//             {order.shippingAddress?.line1}
//             {order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ""}
//           </p>
//           <p className="text-slate-600">
//             {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
//             <span className="font-semibold">{order.shippingAddress?.pincode}</span>
//           </p>
//           {order.shippingAddress?.phone && (
//             <p className="text-slate-500 text-xs pt-1">Contact: {order.shippingAddress.phone}</p>
//           )}
//         </div>
//       </div>

//       {/* Sub-orders & Delivery Timeline */}
//       <div className="space-y-6">
//         <h2 className="text-lg font-bold text-slate-900">Shipment Details</h2>

//         {order.subOrders?.map((subOrder, sIdx) => (
//           <div
//             key={subOrder._id || sIdx}
//             className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6"
//           >
//             {/* Sub-order Header */}
//             <div className="flex items-center justify-between pb-4 border-b border-slate-100">
//               <div className="flex items-center gap-2">
//                 <Package className="w-4 h-4 text-emerald-600" />
//                 <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
//                   Shipment #{sIdx + 1}
//                 </span>
//               </div>
//               <span className="text-xs font-semibold text-slate-500">
//                 Subtotal: ₹{(subOrder.total || 0).toLocaleString("en-IN")}
//               </span>
//             </div>

//             {/* Visual Timeline Tracker */}
//             <OrderTimeline currentStatus={subOrder.status} />

//             {/* Sub-order Items List */}
//             <div className="divide-y divide-slate-100">
//               {subOrder.items?.map((item, iIdx) => (
//                 <div key={iIdx} className="py-4 flex items-center justify-between gap-4">
//                   <div className="flex items-center gap-3">
//                     <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
//                       <ShoppingBag className="w-5 h-5" />
//                     </div>
//                     <div>
//                       <p className="font-semibold text-sm text-slate-800">{item.title}</p>
//                       <p className="text-xs text-slate-400">
//                         Qty: {item.quantity} × ₹{(item.price || 0).toLocaleString("en-IN")}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="text-right space-y-1">
//                     <span className="font-bold text-sm text-slate-900 block">
//                       ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
//                     </span>

//                     {subOrder.status === "delivered" && (
//                       <button
//                         onClick={() => handleReturnRequest(subOrder, item)}
//                         className="text-xs font-medium text-emerald-700 hover:text-emerald-800 underline"
//                       >
//                         Request Return
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default OrderDetail;










import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Loader from "../components/common/Loader";
import {
  Package,
  Calendar,
  MapPin,
  Truck,
  CheckCircle,
  Clock,
  RotateCcw,
  ArrowLeft,
  AlertCircle,
  Check,
  ShoppingBag,
} from "lucide-react";

const TIMELINE_STEPS = ["placed", "confirmed", "shipped", "delivered"];

const OrderTimeline = ({ currentStatus }) => {
  const normalizedStatus = currentStatus?.toLowerCase() || "placed";
  const currentIndex = TIMELINE_STEPS.indexOf(normalizedStatus);
  const isCancelled = normalizedStatus === "cancelled";
  const isReturned = normalizedStatus === "returned" || normalizedStatus === "refunded";

  if (isCancelled || isReturned) {
    return (
      <div className="p-4 rounded-2xl bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
        <RotateCcw className="w-4 h-4 text-slate-500" />
        Order Status: {normalizedStatus}
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="relative flex items-center justify-between">
        {/* Progress connecting line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-100 -z-0">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{
              width: `${Math.max(0, Math.min(100, (currentIndex / (TIMELINE_STEPS.length - 1)) * 100))}%`,
            }}
          />
        </div>

        {TIMELINE_STEPS.map((step, idx) => {
          const isComplete = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div key={step} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isComplete
                    ? "bg-emerald-600 text-white ring-4 ring-emerald-50"
                    : "bg-white text-slate-400 border-2 border-slate-200"
                }`}
              >
                {isComplete ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`text-[11px] mt-2 capitalize font-semibold ${
                  isCurrent ? "text-emerald-700" : isComplete ? "text-slate-700" : "text-slate-400"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [returnMsg, setReturnMsg] = useState("");
  const [returnError, setReturnError] = useState("");

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/orders/${id}`);
      setOrder(data.order);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnRequest = async (subOrder, item) => {
    const reason = window.prompt("Please state the reason for requesting a return:");
    if (!reason || !reason.trim()) return;

    try {
      setReturnMsg("");
      setReturnError("");
      await axiosInstance.post("/returns", {
        orderId: order._id,
        subOrderId: subOrder._id,
        items: [
          {
            product: item.product?._id || item.product,
            variantId: item.variantId || null,
            quantity: item.quantity,
          },
        ],
        reason: reason.trim(),
      });
      setReturnMsg("Return request submitted successfully. Our team will review it shortly.");
    } catch (err) {
      setReturnError(err.response?.data?.message || "Could not request return at this time.");
    }
  };

  if (loading) return <Loader message="Fetching order details..." />;
  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Order not found</h2>
        <Link to="/orders" className="text-emerald-600 underline font-medium mt-4 inline-block">
          Back to all orders
        </Link>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Button & Header */}
      <div className="space-y-3">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Placed on {orderDate}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Total Amount</span>
            <span className="text-2xl font-black text-slate-900">
              ₹{(order.grandTotal || 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {returnMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{returnMsg}</span>
        </div>
      )}
      {returnError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{returnError}</span>
        </div>
      )}

      {/* Shipping Address Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-sm">
          <h3 className="font-bold text-slate-900">Delivery Address</h3>
          <p className="text-slate-600">
            {order.shippingAddress?.line1}
            {order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ""}
          </p>
          <p className="text-slate-600">
            {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
            <span className="font-semibold">{order.shippingAddress?.pincode}</span>
          </p>
          {order.shippingAddress?.phone && (
            <p className="text-slate-500 text-xs pt-1">Contact: {order.shippingAddress.phone}</p>
          )}
        </div>
      </div>

      {/* Sub-orders & Delivery Timeline */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900">Shipment Details</h2>

        {order.subOrders?.map((subOrder, sIdx) => (
          <div
            key={subOrder._id || sIdx}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6"
          >
            {/* Sub-order Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Shipment #{sIdx + 1}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Subtotal: ₹{(subOrder.total || 0).toLocaleString("en-IN")}
              </span>
            </div>

            {/* Visual Timeline Tracker */}
            <OrderTimeline currentStatus={subOrder.status} />

            {/* Sub-order Items List */}
            <div className="divide-y divide-slate-100">
              {subOrder.items?.map((item, iIdx) => (
                <div key={iIdx} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-400">
                        Qty: {item.quantity} × ₹{(item.price || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="font-bold text-sm text-slate-900 block">
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                    </span>

                    {subOrder.status === "delivered" && (
                      <button
                        onClick={() => handleReturnRequest(subOrder, item)}
                        className="text-xs font-medium text-emerald-700 hover:text-emerald-800 underline"
                      >
                        Request Return
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderDetail;