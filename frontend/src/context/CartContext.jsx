import React from 'react';
import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === "customer") {
      fetchCart();
    } else {
      setCart({ items: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/cart");
      setCart(data.cart);
    } catch (err) {
      console.error("Could not fetch cart:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, variantId, quantity = 1) => {
    const { data } = await axiosInstance.post("/cart/items", { productId, variantId, quantity });
    setCart(data.cart);
  };

  const updateQuantity = async (itemId, quantity) => {
    const { data } = await axiosInstance.patch(`/cart/items/${itemId}`, { quantity });
    setCart(data.cart);
  };

  const removeItem = async (itemId) => {
    const { data } = await axiosInstance.delete(`/cart/items/${itemId}`);
    setCart(data.cart);
  };

  const clearCart = async () => {
    const { data } = await axiosInstance.delete("/cart");
    setCart(data.cart);
  };

  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, itemCount, fetchCart, addToCart, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
