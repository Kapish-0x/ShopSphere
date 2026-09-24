import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (user?.role !== "customer") {
      setWishlist([]);
      return;
    }
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/wishlist");
      setWishlist(data.wishlist || []);
    } catch (err) {
      console.error("Could not fetch wishlist:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      return wishlist.some(
        (item) => (item._id || item) === productId || (item._id || item).toString() === productId.toString()
      );
    },
    [wishlist]
  );

  const toggleWishlist = async (product) => {
    if (!user) {
      return { success: false, reason: "unauthorized" };
    }
    if (user.role !== "customer") {
      return { success: false, reason: "not_customer" };
    }

    const productId = product._id || product;
    const currentlyIn = isInWishlist(productId);

    // Optimistic UI update
    if (currentlyIn) {
      setWishlist((prev) => prev.filter((item) => (item._id || item) !== productId));
    } else {
      setWishlist((prev) => [...prev, typeof product === "object" ? product : { _id: productId }]);
    }

    try {
      if (currentlyIn) {
        await axiosInstance.delete(`/wishlist/${productId}`);
      } else {
        await axiosInstance.post(`/wishlist/${productId}`);
      }
      return { success: true, added: !currentlyIn };
    } catch (err) {
      // Revert if request fails
      fetchWishlist();
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const removeFromWishlist = async (productId) => {
    setWishlist((prev) => prev.filter((item) => (item._id || item) !== productId));
    try {
      await axiosInstance.delete(`/wishlist/${productId}`);
      return true;
    } catch (err) {
      fetchWishlist();
      return false;
    }
  };

  const itemCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        itemCount,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
