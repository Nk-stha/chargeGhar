"use client";

import React from "react";
import { FiAlertCircle, FiLogOut, FiRefreshCw, FiShield } from "react-icons/fi";
import styles from "./ApiErrorDisplay.module.css";

interface ApiErrorDisplayProps {
  error: any;
  onRetry?: () => void;
  message?: string;
}

const ApiErrorDisplay: React.FC<ApiErrorDisplayProps> = ({
  error,
  onRetry,
  message,
}) => {
  const getErrorDetails = () => {
    const status = error?.response?.status || error?.status;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      message ||
      "An error occurred";

    switch (status) {
      case 403:
        return {
          icon: <FiShield />,
          title: "Access Forbidden",
          description:
            "You don't have permission to access this resource. Please ensure you are logged in with an admin account.",
          color: "#ffc107",
          showLogout: true,
        };
      case 401:
        return {
          icon: <FiAlertCircle />,
          title: "Authentication Required",
          description:
            "Your session has expired or you are not logged in. Please log in again.",
          color: "#ff4444",
          showLogout: true,
        };
      case 404:
        return {
          icon: <FiAlertCircle />,
          title: "Not Found",
          description:
            "The requested resource could not be found. It may have been deleted or moved.",
          color: "#888",
          showLogout: false,
        };
      case 500:
      case 502:
      case 503:
        return {
          icon: <FiAlertCircle />,
          title: "Server Error",
          description:
            "The server encountered an error. Please try again later or contact support if the problem persists.",
          color: "#ff4444",
          showLogout: false,
        };
      default:
        return {
          icon: <FiAlertCircle />,
          title: "Error",
          description: errorMessage,
          color: "#ff4444",
          showLogout: false,
        };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  };

  const details = getErrorDetails();

  return (
    <div className={styles.container}>
      <div className={styles.errorCard}>
        <div
          className={styles.iconContainer}
          style={{ backgroundColor: `${details.color}22` }}
        >
          <div className={styles.icon} style={{ color: details.color }}>
            {details.icon}
          </div>
        </div>

        <h2 className={styles.title}>{details.title}</h2>
        <p className={styles.description}>{details.description}</p>

        {error?.response?.data?.detail && (
          <div className={styles.technicalDetails}>
            <code>{error.response.data.detail}</code>
          </div>
        )}

        <div className={styles.actions}>
          {onRetry && (
            <button className={styles.retryButton} onClick={onRetry}>
              <FiRefreshCw /> Try Again
            </button>
          )}
          {details.showLogout && (
            <button className={styles.logoutButton} onClick={handleLogout}>
              <FiLogOut /> Logout & Login Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiErrorDisplay;
