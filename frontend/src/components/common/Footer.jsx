import React from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  ArrowRight,
  Mail,
  Heart,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-800/80 py-8 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Free Express Shipping</h4>
                <p className="text-xs text-slate-400">On all orders above ₹499</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">100% Genuine Products</h4>
                <p className="text-xs text-slate-400">Directly from verified sellers</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">7-Day Easy Returns</h4>
                <p className="text-xs text-slate-400">Hassle-free refund policy</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Dedicated Support</h4>
                <p className="text-xs text-slate-400">Quick assistance on orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 text-white group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-900/30">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                ShopSphere
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Curated everyday essentials, premium electronics, fashion, and lifestyle collections delivered seamlessly to your door.
            </p>
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Join our newsletter
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex max-w-sm gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1 active:scale-95"
                >
                  Join
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Explore
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/?category=electronics" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link to="/?category=fashion" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Fashion & Apparel
                </Link>
              </li>
              <li>
                <Link to="/?category=home" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Home & Living
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Saved Items
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Customer Care
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/orders" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Track Your Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Account Settings
                </Link>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Return Policy
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Help & FAQs
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Contact Support
                </span>
              </li>
            </ul>
          </div>

          {/* Seller / Partners */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              For Partners
            </h5>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/register" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Sell on ShopSphere
                </Link>
              </li>
              <li>
                <Link to="/seller/dashboard" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Merchant Guidelines
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Affiliate Program
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Payment Badges */}
      <div className="border-t border-slate-800/80 py-6 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ShopSphere Marketplace. All rights reserved.</p>

          <div className="flex items-center gap-3">
            <span className="bg-slate-800 px-2 py-1 rounded text-slate-400 font-medium">UPI</span>
            <span className="bg-slate-800 px-2 py-1 rounded text-slate-400 font-medium">Cards</span>
            <span className="bg-slate-800 px-2 py-1 rounded text-slate-400 font-medium">NetBanking</span>
            <span className="bg-slate-800 px-2 py-1 rounded text-slate-400 font-medium">COD</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Privacy</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Terms</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
