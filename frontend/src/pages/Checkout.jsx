import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useCart } from "../context/CartContext";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  Lock,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";

const PAYMENT_OPTIONS = [
  {
    id: "cod",
    name: "Cash on Delivery (COD)",
    desc: "Pay in cash or UPI when your order is delivered to your doorstep.",
    icon: Banknote,
  },
  {
    id: "upi",
    name: "UPI (Google Pay, PhonePe, Paytm)",
    desc: "Fast, contactless payment via any UPI app or QR code.",
    icon: Smartphone,
  },
  {
    id: "card",
    name: "Credit or Debit Card",
    desc: "Accepting Visa, Mastercard, RuPay, and American Express.",
    icon: CreditCard,
  },
  {
    id: "netbanking",
    name: "Net Banking",
    desc: "Secure direct transfer from all major Indian banks.",
    icon: Building,
  },
];

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const items = cart.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.priceAtAdd || 0) * (item.quantity || 1), 0);
  const shippingFee = subtotal >= 499 || subtotal === 0 ? 0 : 49;
  const grandTotal = subtotal + shippingFee;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!address.line1 || !address.city || !address.state || !address.pincode) {
      setError("Please fill in all mandatory shipping address fields.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/orders/checkout", {
        shippingAddress: address,
        paymentMethod,
      });
      await fetchCart();
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Checkout failed. Please review your information and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Your bag is empty</h2>
        <p className="text-slate-500 mt-2 text-sm">Please add items to your cart before proceeding to checkout.</p>
        <Link
          to="/"
          className="inline-block mt-6 bg-emerald-600 text-white font-medium px-6 py-2.5 rounded-full hover:bg-emerald-500 transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Checkout Steps Header */}
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <Link to="/cart" className="hover:text-emerald-600 transition-colors">
          Bag
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-emerald-700">Shipping & Payment</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>Confirmation</span>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-slate-500 text-sm mt-1">Please enter your shipping address and choose a payment method.</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Shipping Address & Payment Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Shipping Details */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Shipping Address</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  placeholder="House number, apartment, building name, street"
                  value={address.line1}
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                  className="w-full bg-slate-50 text-slate-800 text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Apartment, Suite, Unit (optional)
                </label>
                <input
                  placeholder="Floor, landmark, wing"
                  value={address.line2}
                  onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                  className="w-full bg-slate-50 text-slate-800 text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="e.g. Mumbai"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full bg-slate-50 text-slate-800 text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="e.g. Maharashtra"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full bg-slate-50 text-slate-800 text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PIN Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="6 digits PIN code"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="w-full bg-slate-50 text-slate-800 text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone Number (for delivery updates)
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full bg-slate-50 text-slate-800 text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Payment Method */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Payment Option</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PAYMENT_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = paymentMethod === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm text-slate-800">
                          {opt.name}
                        </span>
                      </div>

                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-emerald-600 bg-emerald-600" : "border-slate-300"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed mt-1">{opt.desc}</p>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Review Sticky Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6 sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              Order Review
            </h3>

            {/* Items List Preview */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div key={item._id} className="flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.product?.thumbnailUrl ? (
                        <img
                          src={item.product.thumbnailUrl}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">{item.product?.title}</p>
                      <p className="text-slate-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-800 shrink-0">
                    ₹{((item.priceAtAdd || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>
                  {shippingFee === 0 ? (
                    <strong className="text-emerald-700 font-semibold uppercase">Free</strong>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Taxes</span>
                <span>Included</span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-base font-bold text-slate-900">Total</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 px-6 rounded-2xl shadow-md shadow-emerald-900/20 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 active:scale-98"
            >
              {loading ? (
                "Placing Order..."
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Place Order • ₹{grandTotal.toLocaleString("en-IN")}
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-bit Bank Grade Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
