import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft } from "lucide-react";

const NotFound = () => (
  <div className="max-w-md mx-auto px-4 py-28 text-center space-y-6">
    <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
      <ShoppingBag className="w-10 h-10 stroke-1" />
    </div>

    <div className="space-y-2">
      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
        404 Error
      </span>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight pt-2">
        Page Not Found
      </h1>
      <p className="text-sm text-slate-500 leading-relaxed">
        The link you followed may be broken, or the page may have been relocated or removed.
      </p>
    </div>

    <div>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-6 py-3 rounded-full shadow-md shadow-emerald-900/20 transition-all active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Homepage
      </Link>
    </div>
  </div>
);

export default NotFound;
