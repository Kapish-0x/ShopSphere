import React from 'react';
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ProtectedRoute from "./components/common/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

import SellerDashboard from "./pages/seller/SellerDashboard";
import MyStore from "./pages/seller/MyStore";
import MyProducts from "./pages/seller/MyProducts";
import AddEditProduct from "./pages/seller/AddEditProduct";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerReturns from "./pages/seller/SellerReturns";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStores from "./pages/admin/ManageStores";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageCategories from "./pages/admin/ManageCategories";

import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import SupportDashboard from "./pages/support/SupportDashboard";
import SupportWidget from "./components/common/SupportWidget";
import MyTickets from "./pages/MyTickets";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* Customer only */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Seller only */}
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/store"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <MyStore />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <MyProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products/new"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <AddEditProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <AddEditProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/orders"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/returns"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <SellerReturns />
              </ProtectedRoute>
            }
          />

          {/* Delivery Partner */}
          <Route
            path="/delivery/dashboard"
            element={
              <ProtectedRoute allowedRoles={["delivery"]}>
                <DeliveryDashboard />
              </ProtectedRoute>
            }
          />

          {/* Support Agent */}
          <Route
            path="/support/dashboard"
            element={
              <ProtectedRoute allowedRoles={["support"]}>
                <SupportDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stores"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ManageStores />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ManageProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ManageCategories />
              </ProtectedRoute>
            }
          />
          {/* Customer Support Tickets */}
          <Route
            path="/support-tickets"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <MyTickets />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />

      {/* Floating Support Widget */}
      <SupportWidget />
    </div>
  );
}

export default App;