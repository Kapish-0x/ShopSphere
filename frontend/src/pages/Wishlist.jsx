import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/product/ProductCard";
import Loader from "../components/common/Loader";
import { Heart, ArrowRight, ShoppingBag } from "lucide-react";

const Wishlist = () => {
  const { wishlist, loading, fetchWishlist } = useWishlist();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  if (loading) return <Loader message="Loading your saved wishlist..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Saved Wishlist
          </h1>
        </div>
        <p className="text-slate-500 text-sm mt-1">
          {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved for later.
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="max-w-md mx-auto py-20 text-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 stroke-1" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Your wishlist is empty</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Click the heart icon on any product to save it here for later reference or purchase.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-6 py-3 rounded-full shadow-md transition-all active:scale-95"
          >
            Explore Catalog
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
