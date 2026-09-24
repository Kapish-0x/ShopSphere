import React, { useState } from "react";
import { MessageSquare, X, Send, LifeBuoy, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance"; // Import your configured axios instance

const SupportWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    subject: "",
    category: "order_issue",
    message: "",
  });

  // Hide widget for support and admin roles
  if (user?.role === "admin" || user?.role === "support") {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Retrieve token stored by AuthContext
    const token = localStorage.getItem("accessToken");

    if (!token || !user) {
      setErrorMsg("Please log in as a customer to submit a ticket.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      // Send request using axiosInstance with accessToken
      await axiosInstance.post(
        "/support",
        {
          subject: formData.subject,
          category: formData.category,
          message: formData.message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubmitted(true);
      setFormData({ subject: "", category: "order_issue", message: "" });
    } catch (err) {
      if (err.response?.status === 401) {
        setErrorMsg("Session expired or unauthorized. Please log in again.");
      } else {
        setErrorMsg(err.response?.data?.message || "Could not create ticket. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setSubmitted(false);
            setErrorMsg("");
          }}
          className="group relative flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Open Support"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-sm font-semibold">
            Need Help?
          </span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div className="w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Support Operations</h3>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                  Agents Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 max-h-[420px] overflow-y-auto">
            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Ticket Submitted!</h4>
                <p className="text-xs text-slate-500 max-w-[240px] mx-auto">
                  Our agents have received your ticket and will update you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-semibold text-emerald-600 hover:underline"
                >
                  Submit another ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                {errorMsg && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-[11px]">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  >
                    <option value="order_issue">Order Issue</option>
                    <option value="refund">Return & Refund</option>
                    <option value="product_question">Product Inquiry</option>
                    <option value="account">Account & Settings</option>
                    <option value="general">General Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="Brief description"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Message</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="How can we help you today?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
                  />
                </div>

                {!user && (
                  <p className="text-[11px] text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    You must be logged in as a customer to submit tickets.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !user}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? "Sending..." : <><Send className="w-3.5 h-3.5" /> Submit Ticket</>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportWidget;