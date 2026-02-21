import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// REQUEST INTERCEPTOR: Automatically add the Access Token to every header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// RESPONSE INTERCEPTOR: Handle 401 errors and Refresh Token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const userId = localStorage.getItem("userId");

        // Call your Refresh API endpoint
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/Home/Refresh`,
          {
            refreshToken,
            userId,
          },
        );

        if (response.status === 200) {
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Save new tokens
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If Refresh Token is also expired, force logout
        localStorage.clear();
        window.location.href = "/auth";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
