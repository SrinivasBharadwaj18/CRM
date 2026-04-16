import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/",
});

// Request: Attach Access Token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: Catch 401 and Refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Status 401 = Token Expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 
      const refreshToken = localStorage.getItem("refresh");

      if (refreshToken && refreshToken !== "undefined") {
        try {
          // Use a fresh axios call here, NOT axiosInstance
          const response = await axios.post("/api/token/refresh/", {
            refresh: refreshToken,
          });

          const newAccess = response.data.access;
          localStorage.setItem("access", newAccess);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // If refresh fails (refresh token also expired), wipe and exit
          console.error("Session expired. Please log in again.");
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;