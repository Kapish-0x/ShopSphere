import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import ProductCard from "../components/product/ProductCard";
import Loader from "../components/common/Loader";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  PackageX,
  X,
} from "lucide-react";

const DEFAULT_CATEGORIES = [
  { id: "all", name: "All Products" },
  { id: "electronics", name: "Electronics" },
  { id: "fashion", name: "Fashion & Apparel" },
  { id: "home", name: "Home & Living" },
  { id: "beauty", name: "Beauty & Personal Care" },
  { id: "accessories", name: "Accessories" },
];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "all";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [sortBy, setSortBy] = useState("-createdAt");

  // Keep internal state synced when URL search params change (e.g. from Navbar)
  useEffect(() => {
    setSearch(urlSearch);
    setSelectedCategory(urlCategory || "all");
  }, [urlSearch, urlCategory]);

  // Fetch backend categories if available
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axiosInstance.get("/categories");
        if (data.categories && data.categories.length > 0) {
          const fetched = data.categories.map((c) => ({
            id: c.slug || c._id,
            name: c.name,
            backendId: c._id,
          }));
          setCategories([{ id: "all", name: "All Products" }, ...fetched]);
        }
      } catch (err) {
        // Fallback to default categories
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (selectedCategory && selectedCategory !== "all") {
        // Find if category has a backendId
        const match = categories.find((c) => c.id === selectedCategory);
        params.category = match?.backendId || selectedCategory;
      }

      if (sortBy) {
        params.sort = sortBy;
      }

      const { data } = await axiosInstance.get("/products", { params });
      setProducts(data.products || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, sortBy, categories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setSearchParams({ search: search.trim(), category: selectedCategory });
    } else {
      searchParams.delete("search");
      setSearchParams(searchParams);
    }
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    if (catId === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", catId);
    }
    setSearchParams(searchParams);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSortBy("-createdAt");
    setSearchParams({});
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Editorial Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              New Season Collections
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Curated Essentials. <br />
              <span className="text-emerald-400">Exceptional Quality.</span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
              Discover handpicked items across electronics, fashion, and home lifestyle from verified independent merchants.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#catalog"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg shadow-emerald-900/40 hover:shadow-emerald-700/50 transition-all duration-200 active:scale-95"
              >
                Explore Catalog
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={() => handleCategorySelect("electronics")}
                className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-5 py-3 rounded-full text-sm font-medium border border-slate-700 transition-colors"
              >
                Top Tech Deals
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights Strip */}
        <div className="max-w-7xl mx-auto mt-14 pt-8 border-t border-slate-800/80">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium">Free Express Delivery ₹499+</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium">100% Genuine Guaranteed</span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium">7-Day Easy Replacement</span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium">Safe & Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Container */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all shrink-0 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Search, Filter & Sort Controls Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by title, tag, or store..."
              className="w-full bg-slate-50 text-slate-800 text-sm rounded-xl pl-10 pr-9 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  searchParams.delete("search");
                  setSearchParams(searchParams);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Sort Selector & Stats */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <label htmlFor="sortBy" className="text-xs text-slate-500 font-medium">
                Sort by:
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="-createdAt">Newest Arrivals</option>
                <option value="basePrice">Price: Low to High</option>
                <option value="-basePrice">Price: High to Low</option>
                <option value="-ratingAverage">Top Rated</option>
              </select>
            </div>

            <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2.5 py-1.5 rounded-lg shrink-0">
              {products.length} {products.length === 1 ? "product" : "products"}
            </span>
          </div>
        </div>

        {/* Active Filters Display */}
        {(search || selectedCategory !== "all") && (
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
            <span className="font-semibold text-slate-400">Active Filters:</span>
            {search && (
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                Keyword: "{search}"
                <button
                  onClick={() => {
                    setSearch("");
                    searchParams.delete("search");
                    setSearchParams(searchParams);
                  }}
                >
                  <X className="w-3 h-3 hover:text-emerald-900" />
                </button>
              </span>
            )}
            {selectedCategory !== "all" && (
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                Category: {categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}
                <button onClick={() => handleCategorySelect("all")}>
                  <X className="w-3 h-3 hover:text-emerald-900" />
                </button>
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-xs text-slate-500 hover:text-rose-600 underline font-medium ml-1"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Product Grid or Loader or Empty State */}
        {loading ? (
          <Loader message="Fetching products..." />
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto my-12 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <PackageX className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No products found</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              We couldn't find any products matching your current filters. Try changing keywords or resetting categories.
            </p>
            <button
              onClick={handleClearFilters}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
