import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Loader from "../components/common/Loader";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  CheckCircle2,
} from "lucide-react";

const FREE_SHIPPING_THRESHOLD = 499;

const Cart = () => {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  if (loading) return <Loader message="Loading your bag..." />;

  const items = cart.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.priceAtAdd || 0) * (item.quantity || 1), 0);

  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = subtotal === 0 || isFreeShipping ? 0 : 49;
  const grandTotal = Math.max(0, subtotal - discount + shippingFee);

  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError("");
    if (couponCode.trim().toUpperCase() === "SPHERE10") {
      setCouponApplied(true);
    } else {
      setCouponError("Invalid promo code. Try 'SPHERE10' for 10% off.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShoppingBag className="w-10 h-10 stroke-1" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Your Cart is Empty</h1>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm leading-relaxed">
          Looks like you haven't added any items to your bag yet. Explore our latest products and find something you love!
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-8 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-full text-sm shadow-md shadow-emerald-900/20 transition-all active:scale-95"
        >
          Explore Catalog
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Shopping Cart ({items.length} {items.length === 1 ? "item" : "items"})
        </h1>
        <p className="text-slate-500 text-sm mt-1">Review your selected items before proceeding to checkout.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Free Shipping Progress Card */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                {isFreeShipping
                  ? "🎉 You've unlocked FREE Express Shipping!"
                  : `Add ₹${amountNeededForFreeShipping} more to unlock FREE Delivery`}
              </span>
              <span>{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items Container */}
          <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {items.map((item) => {
              const itemTotal = (item.priceAtAdd || 0) * (item.quantity || 1);
              return (
                <div key={item._id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  {/* Item Image and Title */}
                  <div className="flex items-center gap-4 flex-1">
                    <Link
                      to={`/products/${item.product?._id}`}
                      className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center"
                    >
                      {item.product?.thumbnailUrl ? (
                        <img
                          src={item.product.thumbnailUrl}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="w-8 h-8 text-slate-300" />
                      )}
                    </Link>

                    <div className="space-y-1">
                      <Link
                        to={`/products/${item.product?._id}`}
                        className="font-semibold text-sm text-slate-800 hover:text-emerald-600 transition-colors line-clamp-2"
                      >
                        {item.product?.title || "Product"}
                      </Link>
                      <p className="text-xs text-slate-400">
                        ₹{(item.priceAtAdd || 0).toLocaleString("en-IN")} each
                      </p>
                    </div>
                  </div>

                  {/* Quantity Stepper & Subtotal & Remove */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-4 self-end sm:self-center">
                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                        className="p-1 rounded text-slate-500 hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="p-1 rounded text-slate-500 hover:bg-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total for item */}
                    <div className="text-right min-w-[70px]">
                      <span className="text-sm font-bold text-slate-900">
                        ₹{itemTotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item._id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2 text-xs text-slate-500">
            <Link to="/" className="text-emerald-700 hover:underline font-medium">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6 sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Promo or Voucher Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SPHERE10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 uppercase text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shrink-0"
                >
                  Apply
                </button>
              </div>
              {couponApplied && (
                <p className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 10% coupon discount applied!
                </p>
              )}
              {couponError && <p className="text-xs text-rose-600">{couponError}</p>}
            </form>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              {couponApplied && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Promo Discount (10%)</span>
                  <span>-₹{discount.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>
                  {isFreeShipping ? (
                    <strong className="text-emerald-700 uppercase font-semibold">Free</strong>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Taxes</span>
                <span>Included in price</span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
              <div>
                <span className="text-base font-bold text-slate-900">Total Amount</span>
                <p className="text-[10px] text-slate-400">All payment options available</p>
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 px-6 rounded-2xl shadow-md shadow-emerald-900/20 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-98"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust Assurance */}
            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Guaranteed safe & secure checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
