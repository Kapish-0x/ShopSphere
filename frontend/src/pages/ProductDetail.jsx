import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import Loader from "../components/common/Loader";
import {
  Star,
  ShoppingBag,
  ShoppingCart,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  Store,
  ChevronRight,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/products/${id}`);
      setProduct(data.product);
      if (data.product.variants && data.product.variants.length > 0) {
        setSelectedVariant(data.product.variants[0]);
        setActiveImage(data.product.variants[0].imageUrls?.[0] || data.product.thumbnailUrl || "");
      } else {
        setActiveImage(data.product.thumbnailUrl || "");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axiosInstance.get(`/reviews/product/${id}`);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    if (variant.imageUrls?.[0]) {
      setActiveImage(variant.imageUrls[0]);
    }
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "customer") {
      setErrorMsg("Only customer accounts can add products to cart.");
      return;
    }

    try {
      setAddingToCart(true);
      setErrorMsg("");
      await addToCart(product._id, selectedVariant?._id, quantity);
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Could not add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <Loader message="Loading product details..." />;
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-slate-500 mt-2">The product you are looking for is unavailable or has been removed.</p>
        <Link
          to="/"
          className="inline-block mt-6 bg-emerald-600 text-white font-medium px-6 py-2.5 rounded-full hover:bg-emerald-500 transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const availableStock = selectedVariant
    ? selectedVariant.stock - (selectedVariant.reservedStock || 0)
    : 0;

  const currentPrice = selectedVariant?.price ?? product.basePrice ?? 0;
  const isSaved = isInWishlist(product._id);

  // Collect all unique images
  const allImages = [
    product.thumbnailUrl,
    ...(selectedVariant?.imageUrls || []),
    ...(product.variants?.flatMap((v) => v.imageUrls || []) || []),
  ].filter(Boolean);
  const uniqueImages = Array.from(new Set(allImages));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-emerald-600 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        {product.category?.name && (
          <>
            <Link
              to={`/?category=${product.category.slug || product.category._id}`}
              className="hover:text-emerald-600 transition-colors"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </>
        )}
        <span className="text-slate-800 font-medium truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left Column: Photo Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-3xl border border-slate-200/80 overflow-hidden relative shadow-xs flex items-center justify-center">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <ShoppingBag className="w-16 h-16 stroke-1 mb-2" />
                <span className="text-sm">No image available</span>
              </div>
            )}

            {/* In stock badge */}
            <div className="absolute top-4 left-4">
              {availableStock > 0 ? (
                <span className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  In Stock ({availableStock})
                </span>
              ) : (
                <span className="bg-rose-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail Strip */}
          {uniqueImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {uniqueImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                    activeImage === img
                      ? "border-emerald-600 ring-2 ring-emerald-500/20"
                      : "border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Trust Value Cards */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200">
            <div className="p-3 bg-white rounded-2xl border border-slate-200/80 text-center space-y-1">
              <Truck className="w-5 h-5 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Fast Shipping</p>
              <p className="text-[10px] text-slate-500">Free over ₹499</p>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-slate-200/80 text-center space-y-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-slate-800">100% Genuine</p>
              <p className="text-[10px] text-slate-500">Verified Seller</p>
            </div>
            <div className="p-3 bg-white rounded-2xl border border-slate-200/80 text-center space-y-1">
              <RotateCcw className="w-5 h-5 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Easy Return</p>
              <p className="text-[10px] text-slate-500">7-Day window</p>
            </div>
          </div>
        </div>

        {/* Right Column: Product Details & Actions */}
        <div className="space-y-6">
          {/* Store / Merchant Pill */}
          {product.store && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
              <Store className="w-3.5 h-3.5 text-slate-500" />
              <span>Sold by: <strong>{product.store.storeName}</strong></span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {product.title}
          </h1>

          {/* Rating Summary */}
          <div className="flex items-center gap-3">
            {product.ratingCount > 0 ? (
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span className="text-sm font-bold text-amber-900">{product.ratingAverage}</span>
                <span className="text-xs text-amber-700">({product.ratingCount} reviews)</span>
              </div>
            ) : (
              <span className="text-xs text-slate-400">No ratings yet</span>
            )}
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Category: {product.category?.name || "General"}
            </span>
          </div>

          {/* Price */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              ₹{currentPrice.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-full">
              Inclusive of all taxes
            </span>
          </div>

          {/* Description */}
          <div className="prose prose-sm text-slate-600 leading-relaxed">
            <p>{product.aiGeneratedDescription || product.description}</p>
          </div>

          {/* Key Features / Selling Points */}
          {product.aiKeySellingPoints?.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Key Highlights
              </h4>
              <ul className="space-y-1.5">
                {product.aiKeySellingPoints.map((point, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Variant Selector */}
          {product.variants?.length > 1 && (
            <div className="space-y-2.5 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Option / Variant
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?._id === v._id;
                  const label =
                    Object.values(v.attributes || {}).join(" / ") || v.sku || "Default";
                  return (
                    <button
                      key={v._id}
                      onClick={() => handleVariantChange(v)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20 font-semibold"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {label} (₹{v.price})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Add to Cart Actions */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center justify-between border border-slate-200 rounded-xl bg-white px-2 py-1.5 w-36">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || availableStock < 1}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold text-slate-800 text-sm">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                  disabled={quantity >= availableStock || availableStock < 1}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={availableStock < 1 || addingToCart}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl shadow-md shadow-emerald-900/20 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 active:scale-98"
              >
                <ShoppingCart className="w-4 h-4" />
                {addingToCart
                  ? "Adding..."
                  : cartSuccess
                  ? "✓ Added to Cart!"
                  : availableStock < 1
                  ? "Out of Stock"
                  : `Add to Cart • ₹${(currentPrice * quantity).toLocaleString("en-IN")}`}
              </button>

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                aria-label="Wishlist toggle"
                className={`p-3 rounded-xl border transition-all ${
                  isSaved
                    ? "border-rose-200 bg-rose-50 text-rose-500"
                    : "border-slate-200 bg-white text-slate-400 hover:text-rose-500 hover:border-slate-300"
                }`}
              >
                <Heart className={`w-5 h-5 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
              </button>
            </div>

            {/* Error or Success feedback */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {cartSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                <span className="font-medium">Item successfully added to your cart!</span>
                <Link to="/cart" className="font-bold underline hover:text-emerald-950">
                  View Cart
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Verified Customer Reviews</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </span>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <p className="text-sm">No reviews yet for this product.</p>
            <p className="text-xs text-slate-500">
              Be the first to share your thoughts after your order arrives!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div
                key={r._id}
                className="bg-slate-50/70 border border-slate-200/60 rounded-2xl p-5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-800">
                    {r.customer?.name || "Customer"}
                  </span>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-xs font-bold text-amber-900">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                    <span>{r.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>

                {r.sellerReply?.text && (
                  <div className="mt-3 pl-3 border-l-2 border-emerald-500 text-xs text-slate-500 bg-white/70 p-2 rounded-r-lg">
                    <strong className="text-emerald-700">Seller reply:</strong> {r.sellerReply.text}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetail;
