import axios from "axios";

const BASE_URL = "https://shopsphere-4c0v.onrender.com/api";

const axiosInstance = axios.create({ 
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do NOT run refresh logic for login/register endpoints!
    const isAuthEndpoint = originalRequest.url.includes("/auth/login") || originalRequest.url.includes("/auth/register");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");

        // Use plain axios to avoid infinite loops
        const { data } = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
        
        localStorage.setItem("accessToken", data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        // Clear storage without triggering hard reload on auth pages
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;