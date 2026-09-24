// import React, { useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import { useCart } from "../../context/CartContext";
// import { useWishlist } from "../../context/WishlistContext";
// import {
//   ShoppingBag,
//   ShoppingCart,
//   Heart,
//   User,
//   Search,
//   Menu,
//   X,
//   LogOut,
//   LayoutDashboard,
//   Package,
//   Sparkles,
//   ChevronDown,
// } from "lucide-react";

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const { itemCount } = useCart();
//   const { itemCount: wishlistCount } = useWishlist();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [userDropdownOpen, setUserDropdownOpen] = useState(false);
//   const [navSearch, setNavSearch] = useState("");

//   const handleLogout = async () => {
//     await logout();
//     setUserDropdownOpen(false);
//     navigate("/login");
//   };

//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     if (navSearch.trim()) {
//       navigate(`/?search=${encodeURIComponent(navSearch.trim())}`);
//       setNavSearch("");
//     }
//   };

//   const dashboardLink = () => {
//     if (user?.role === "seller") return "/seller/dashboard";
//     if (user?.role === "admin") return "/admin/dashboard";
//     return null;
//   };

//   return (
//     <>
//       {/* Top Announcement Bar */}
//       <div className="bg-slate-900 text-white text-xs py-2 px-4">
//         <div className="max-w-7xl mx-auto flex items-center justify-between">
//           <div className="flex items-center gap-2 mx-auto sm:mx-0">
//             <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full text-[10px] border border-emerald-500/30">
//               <Sparkles className="w-2.5 h-2.5" /> SPECIAL OFFER
//             </span>
//             <span className="text-slate-200">
//               Free Express Delivery on orders over ₹499 • Use code{" "}
//               <strong className="text-emerald-400 font-mono tracking-wide">SPHERE10</strong> for 10% off
//             </span>
//           </div>

//           <div className="hidden sm:flex items-center gap-4 text-slate-400 text-xs">
//             <span>24/7 Support</span>
//             <span>•</span>
//             <Link to={user?.role === "seller" ? "/seller/dashboard" : "/register"} className="hover:text-emerald-400 transition-colors">
//               Sell on ShopSphere
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* Main Navbar */}
//       <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
//             {/* Logo */}
//             <Link to="/" className="flex items-center gap-2.5 group shrink-0">
//               <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
//                 <ShoppingBag className="w-5 h-5 text-white" />
//               </div>
//               <div className="flex flex-col">
//                 <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
//                   ShopSphere
//                 </span>
//                 <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 -mt-1">
//                   Marketplace
//                 </span>
//               </div>
//             </Link>

//             {/* Quick Navigation Links */}
//             <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
//               <Link
//                 to="/"
//                 className={`transition-colors hover:text-emerald-600 ${
//                   location.pathname === "/" ? "text-emerald-600 font-semibold" : ""
//                 }`}
//               >
//                 Shop
//               </Link>
//               <Link
//                 to="/?category=electronics"
//                 className="transition-colors hover:text-emerald-600"
//               >
//                 Electronics
//               </Link>
//               <Link
//                 to="/?category=fashion"
//                 className="transition-colors hover:text-emerald-600"
//               >
//                 Fashion
//               </Link>
//               <Link
//                 to="/?category=home"
//                 className="transition-colors hover:text-emerald-600"
//               >
//                 Home Living
//               </Link>
//             </nav>

//             {/* Search Bar */}
//             <form
//               onSubmit={handleSearchSubmit}
//               className="hidden md:flex flex-1 max-w-xs lg:max-w-sm relative"
//             >
//               <input
//                 type="text"
//                 placeholder="Search products, brands, categories..."
//                 value={navSearch}
//                 onChange={(e) => setNavSearch(e.target.value)}
//                 className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 text-sm rounded-full pl-10 pr-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-slate-400"
//               />
//               <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
//             </form>

//             {/* Actions: Wishlist, Cart, Profile */}
//             <div className="flex items-center gap-2 sm:gap-3">
//               {/* Wishlist Link */}
//               {user?.role === "customer" && (
//                 <Link
//                   to="/wishlist"
//                   title="Wishlist"
//                   className="relative p-2 sm:p-2.5 rounded-full text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
//                 >
//                   <Heart className="w-5 h-5" />
//                   {wishlistCount > 0 && (
//                     <span className="absolute top-0 right-0 bg-rose-500 text-white text-[11px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center ring-2 ring-white">
//                       {wishlistCount}
//                     </span>
//                   )}
//                 </Link>
//               )}

//               {/* Cart Link */}
//               {user?.role === "customer" && (
//                 <Link
//                   to="/cart"
//                   title="Cart"
//                   className="relative p-2 sm:p-2.5 rounded-full text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
//                 >
//                   <ShoppingCart className="w-5 h-5" />
//                   {itemCount > 0 && (
//                     <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[11px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center ring-2 ring-white animate-pulse">
//                       {itemCount}
//                     </span>
//                   )}
//                 </Link>
//               )}

//               {/* Dashboard Link for Seller/Admin */}
//               {dashboardLink() && (
//                 <Link
//                   to={dashboardLink()}
//                   className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200/60"
//                 >
//                   <LayoutDashboard className="w-3.5 h-3.5" />
//                   Dashboard
//                 </Link>
//               )}

//               {/* User Dropdown or Auth Buttons */}
//               {user ? (
//                 <div className="relative">
//                   <button
//                     onClick={() => setUserDropdownOpen(!userDropdownOpen)}
//                     className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all text-sm font-medium text-slate-700"
//                   >
//                     <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold uppercase">
//                       {user.name ? user.name.charAt(0) : "U"}
//                     </div>
//                     <span className="hidden sm:inline text-slate-800 max-w-[100px] truncate">
//                       {user.name}
//                     </span>
//                     <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
//                   </button>

//                   {/* Dropdown Menu */}
//                   {userDropdownOpen && (
//                     <div
//                       className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
//                       onMouseLeave={() => setUserDropdownOpen(false)}
//                     >
//                       <div className="px-4 py-2 border-b border-slate-100">
//                         <p className="text-xs text-slate-400">Signed in as</p>
//                         <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
//                         <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50">
//                           {user.role}
//                         </span>
//                       </div>

//                       <div className="py-1">
//                         <Link
//                           to="/profile"
//                           onClick={() => setUserDropdownOpen(false)}
//                           className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
//                         >
//                           <User className="w-4 h-4 text-slate-400" />
//                           Profile & Addresses
//                         </Link>

//                         {user.role === "customer" && (
//                           <Link
//                             to="/orders"
//                             onClick={() => setUserDropdownOpen(false)}
//                             className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
//                           >
//                             <Package className="w-4 h-4 text-slate-400" />
//                             My Orders
//                           </Link>
//                         )}

//                         {dashboardLink() && (
//                           <Link
//                             to={dashboardLink()}
//                             onClick={() => setUserDropdownOpen(false)}
//                             className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
//                           >
//                             <LayoutDashboard className="w-4 h-4 text-slate-400" />
//                             Dashboard
//                           </Link>
//                         )}
//                       </div>

//                       <div className="border-t border-slate-100 pt-1">
//                         <button
//                           onClick={handleLogout}
//                           className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
//                         >
//                           <LogOut className="w-4 h-4" />
//                           Sign Out
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-2">
//                   <Link
//                     to="/login"
//                     className="text-sm font-semibold text-slate-700 hover:text-emerald-600 px-3 py-1.5 rounded-full transition-colors"
//                   >
//                     Log In
//                   </Link>
//                   <Link
//                     to="/register"
//                     className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
//                   >
//                     Sign Up
//                   </Link>
//                 </div>
//               )}

//               {/* Mobile Menu Button */}
//               <button
//                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                 className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
//                 aria-label="Toggle Navigation"
//               >
//                 {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//               </button>
//             </div>
//           </div>

//           {/* Mobile Search Bar */}
//           <div className="pb-3 md:hidden">
//             <form onSubmit={handleSearchSubmit} className="relative">
//               <input
//                 type="text"
//                 placeholder="Search products..."
//                 value={navSearch}
//                 onChange={(e) => setNavSearch(e.target.value)}
//                 className="w-full bg-slate-50 text-slate-800 text-sm rounded-full pl-9 pr-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
//               />
//               <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
//             </form>
//           </div>
//         </div>

//         {/* Mobile Navigation Drawer */}
//         {mobileMenuOpen && (
//           <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-4 duration-200">
//             <div className="grid grid-cols-2 gap-2 text-sm font-medium">
//               <Link
//                 to="/"
//                 onClick={() => setMobileMenuOpen(false)}
//                 className="px-3 py-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
//               >
//                 All Products
//               </Link>
//               <Link
//                 to="/?category=electronics"
//                 onClick={() => setMobileMenuOpen(false)}
//                 className="px-3 py-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
//               >
//                 Electronics
//               </Link>
//               <Link
//                 to="/?category=fashion"
//                 onClick={() => setMobileMenuOpen(false)}
//                 className="px-3 py-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
//               >
//                 Fashion
//               </Link>
//               <Link
//                 to="/?category=home"
//                 onClick={() => setMobileMenuOpen(false)}
//                 className="px-3 py-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
//               >
//                 Home Living
//               </Link>
//             </div>

//             {user?.role === "customer" && (
//               <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm">
//                 <Link
//                   to="/wishlist"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className="flex items-center gap-1.5 text-slate-600 hover:text-rose-600"
//                 >
//                   <Heart className="w-4 h-4" /> Wishlist ({wishlistCount})
//                 </Link>
//                 <Link
//                   to="/orders"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-600"
//                 >
//                   <Package className="w-4 h-4" /> Orders
//                 </Link>
//                 <Link
//                   to="/cart"
//                   onClick={() => setMobileMenuOpen(false)}
//                   className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-600"
//                 >
//                   <ShoppingCart className="w-4 h-4" /> Cart ({itemCount})
//                 </Link>
//               </div>
//             )}
//           </div>
//         )}
//       </header>
//     </>
//   );
// };

// export default Navbar;




import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Package,
  Sparkles,
  ChevronDown,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/?search=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch("");
    }
  };

  // Fixed dashboardLink to include delivery and support roles
  const dashboardLink = () => {
    if (user?.role === "seller") return "/seller/dashboard";
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "delivery") return "/delivery/dashboard";
    if (user?.role === "support") return "/support/dashboard";
    return null;
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded-full text-[10px] border border-emerald-500/30">
              <Sparkles className="w-2.5 h-2.5" /> SPECIAL OFFER
            </span>
            <span className="text-slate-200">
              Free Express Delivery on orders over ₹499 • Use code{" "}
              <strong className="text-emerald-400 font-mono tracking-wide">SPHERE10</strong> for 10% off
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-slate-400 text-xs">
            <span>24/7 Support</span>
            <span>•</span>
            <Link to={user?.role === "seller" ? "/seller/dashboard" : "/register"} className="hover:text-emerald-400 transition-colors">
              Sell on ShopSphere
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                  ShopSphere
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 -mt-1">
                  Marketplace
                </span>
              </div>
            </Link>

            {/* Quick Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link
                to="/"
                className={`transition-colors hover:text-emerald-600 ${
                  location.pathname === "/" ? "text-emerald-600 font-semibold" : ""
                }`}
              >
                Shop
              </Link>
              <Link
                to="/?category=electronics"
                className="transition-colors hover:text-emerald-600"
              >
                Electronics
              </Link>
              <Link
                to="/?category=fashion"
                className="transition-colors hover:text-emerald-600"
              >
                Fashion
              </Link>
              <Link
                to="/?category=home"
                className="transition-colors hover:text-emerald-600"
              >
                Home Living
              </Link>
            </nav>

            {/* Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-xs lg:max-w-sm relative"
            >
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 text-sm rounded-full pl-10 pr-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </form>

            {/* Actions: Wishlist, Cart, Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Wishlist Link */}
              {user?.role === "customer" && (
                <Link
                  to="/wishlist"
                  title="Wishlist"
                  className="relative p-2 sm:p-2.5 rounded-full text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0 right-0 bg-rose-500 text-white text-[11px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center ring-2 ring-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Cart Link */}
              {user?.role === "customer" && (
                <Link
                  to="/cart"
                  title="Cart"
                  className="relative p-2 sm:p-2.5 rounded-full text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[11px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center ring-2 ring-white animate-pulse">
                      {itemCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Dashboard Link for Seller/Admin/Delivery/Support */}
              {dashboardLink() && (
                <Link
                  to={dashboardLink()}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200/60"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
              )}

              {/* User Dropdown or Auth Buttons */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all text-sm font-medium text-slate-700"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold uppercase">
                      {user.name ? user.name.charAt(0) : "U"}
                    </div>
                    <span className="hidden sm:inline text-slate-800 max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          Profile & Addresses
                        </Link>

                        {user.role === "customer" && (
                          <Link
                            to="/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                          >
                            <Package className="w-4 h-4 text-slate-400" />
                            My Orders
                          </Link>
                        )}

                        {dashboardLink() && (
                          <Link
                            to={dashboardLink()}
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            Dashboard
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-slate-700 hover:text-emerald-600 px-3 py-1.5 rounded-full transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="pb-3 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-sm rounded-full pl-9 pr-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-4 duration-200">
            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
              >
                All Products
              </Link>
              <Link
                to="/?category=electronics"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
              >
                Electronics
              </Link>
              <Link
                to="/?category=fashion"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
              >
                Fashion
              </Link>
              <Link
                to="/?category=home"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
              >
                Home Living
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm">
              {user?.role === "customer" && (
                <>
                  <Link
                    to="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-rose-600"
                  >
                    <Heart className="w-4 h-4" /> Wishlist ({wishlistCount})
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-600"
                  >
                    <Package className="w-4 h-4" /> Orders
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-600"
                  >
                    <ShoppingCart className="w-4 h-4" /> Cart ({itemCount})
                  </Link>
                </>
              )}

              {dashboardLink() && (
                <Link
                  to={dashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-1.5 font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;