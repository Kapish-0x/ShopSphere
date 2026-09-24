import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Star, ShoppingBag, ArrowRight } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

const ProductCard = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isSaved = isInWishlist(product._id);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    await toggleWishlist(product);
  };

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.basePrice || 0);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Container with Badges & Wishlist */}
      <Link to={`/products/${product._id}`} className="aspect-square bg-slate-50 relative overflow-hidden block">
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-100/70">
            <ShoppingBag className="w-10 h-10 stroke-1 mb-1" />
            <span className="text-xs font-medium text-slate-400">No image</span>
          </div>
        )}

        {/* Store & Feature Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {product.store?.storeName && (
            <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
              {product.store.storeName}
            </span>
          )}
          {product.ratingAverage >= 4.5 && (
            <span className="bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-white" /> Popular
            </span>
          )}
        </div>

        {/* Floating Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10 shadow-sm ${
            isSaved
              ? "bg-rose-50 text-rose-500 scale-105"
              : "bg-white/90 backdrop-blur-md text-slate-400 hover:text-rose-500 hover:scale-110"
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform ${isSaved ? "fill-rose-500 text-rose-500 scale-110" : ""}`} />
        </button>
      </Link>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category or SKU */}
          {product.category?.name && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 mb-1">
              {product.category.name}
            </p>
          )}

          {/* Title */}
          <Link to={`/products/${product._id}`}>
            <h3 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-2 text-sm leading-snug">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Rating and Price row */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              {formattedPrice}
            </span>
          </div>

          {/* Rating */}
          {product.ratingCount > 0 ? (
            <div className="flex items-center gap-1 text-xs text-slate-600 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>{product.ratingAverage}</span>
              <span className="text-slate-400 text-[10px]">({product.ratingCount})</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400">New arrival</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
