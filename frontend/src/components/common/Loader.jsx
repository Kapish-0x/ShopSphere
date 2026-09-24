import React from "react";
import { Loader2 } from "lucide-react";

const Loader = ({ message = "Loading..." }) => (
  <div className="flex flex-col justify-center items-center py-24 px-4 min-h-[300px]">
    <div className="relative flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
      <div className="absolute w-6 h-6 rounded-full bg-emerald-500/10 animate-ping" />
    </div>
    {message && (
      <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">{message}</p>
    )}
  </div>
);

export default Loader;
