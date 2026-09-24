import React from 'react';
import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      const savedUser = localStorage.getItem("user");
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const { data } = await axiosInstance.get("/users/me");
          setUser(data.user);
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await axiosInstance.post("/auth/login", { email, password });
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
  try {
    const { data } = await axiosInstance.post("/auth/register", formData);
    
    if (data?.accessToken && data?.user) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    }
    
    return data.user;
  } catch (err) {
    console.error("AuthContext Register Error:", err.response?.data || err.message);
    throw err;
  }
};

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await axiosInstance.post("/auth/logout", { refreshToken });
    } catch {
      // ignore — clear local state regardless
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
