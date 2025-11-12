import axios from "axios";

const instance = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add the auth token to headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Function to get CSRF token from cookies
export const getCsrfToken = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const csrfCookie = document.cookie
    .split(";")
    .find((cookie) => cookie.trim().startsWith("csrftoken="));
  return csrfCookie ? csrfCookie.split("=")[1] : null;
};

// Response interceptor to handle token refresh and authorization errors
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 403 Forbidden - User doesn't have required permissions
    if (error.response?.status === 403) {
      console.error(
        "Access forbidden: User does not have required permissions",
      );

      // Check if token is expired by trying to refresh
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          const csrfToken = getCsrfToken();

          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          const { data } = await axios.post(
            "/api/refresh",
            { refresh: refreshToken },
            {
              headers: {
                "X-CSRFTOKEN": csrfToken,
              },
            },
          );
          const { accessToken } = data;

          localStorage.setItem("accessToken", accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Retry the original request with new token
          return instance(originalRequest);
        } catch (refreshError) {
          console.error(
            "Token refresh failed or insufficient permissions:",
            refreshError,
          );
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - Token is invalid or expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const csrfToken = getCsrfToken();

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const { data } = await axios.post(
          "/api/refresh",
          { refresh: refreshToken },
          {
            headers: {
              "X-CSRFTOKEN": csrfToken,
            },
          },
        );
        const { accessToken } = data;

        localStorage.setItem("accessToken", accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return instance(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed, logging out:", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
