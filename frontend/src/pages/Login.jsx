import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === "seller") navigate("/seller/dashboard");
      else if (user.role === "admin") navigate("/admin/dashboard");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="text-xs text-slate-500">
            Log in to manage your orders, wishlist, and profile.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-50 text-slate-800 text-sm rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-slate-50 text-slate-800 text-sm rounded-xl pl-9 pr-10 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-emerald-900/20 hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98 text-sm"
          >
            {loading ? "Signing in..." : "Log In"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center pt-2 border-t border-slate-100">
          Don't have an account yet?{" "}
          <Link to="/register" className="text-emerald-700 hover:underline font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
