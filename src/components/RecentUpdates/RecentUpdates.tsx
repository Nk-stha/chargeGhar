"use client";

import React, { useState, useEffect } from "react";
import styles from "./RecentUpdates.module.css";
import {
  FiInfo,
  FiCheckCircle,
  FiAlertTriangle,
  FiExternalLink,
} from "react-icons/fi";
import axiosInstance from "../../lib/axios";
import { useRouter } from "next/navigation";

interface ActionLog {
  id: string;
  action_type: string;
  target_model: string;
  target_id: string;
  changes: Record<string, any>;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  admin_username: string;
  admin_email: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: ActionLog[];
}

const RecentUpdates: React.FC = () => {
  const router = useRouter();
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActionLogs();
  }, []);

  const fetchActionLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get<ApiResponse>(
        "/api/admin/action-logs",
      );

      if (response.data.success) {
        // Get the 5 most recent logs
        setActionLogs(response.data.data.slice(0, 5));
      } else {
        setError(response.data.message || "Failed to load updates");
      }
    } catch (err: any) {
      console.error("Error fetching action logs:", err);
      setError("Failed to load recent updates");
    } finally {
      setLoading(false);
    }
  };

  const getUpdateType = (
    actionType: string,
  ): "info" | "success" | "warning" => {
    const successActions = ["CREATE_", "UPDATE_", "APPROVE", "ACTIVE"];
    const warningActions = ["DELETE_", "REJECT", "SUSPEND", "INACTIVE"];

    if (successActions.some((action) => actionType.includes(action))) {
      return "success";
    }
    if (warningActions.some((action) => actionType.includes(action))) {
      return "warning";
    }
    return "info";
  };

  const getIcon = (type: "info" | "success" | "warning") => {
    switch (type) {
      case "success":
        return <FiCheckCircle className={styles.successIcon} />;
      case "warning":
        return <FiAlertTriangle className={styles.warningIcon} />;
      default:
        return <FiInfo className={styles.infoIcon} />;
    }
  };

  const formatTimeAgo = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / 60000);
      const diffInHours = Math.floor(diffInMs / 3600000);
      const diffInDays = Math.floor(diffInMs / 86400000);

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60)
        return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
      if (diffInHours < 24)
        return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
      if (diffInDays < 7)
        return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

      return date.toLocaleDateString();
    } catch {
      return timestamp;
    }
  };

  const formatTitle = (actionType: string): string => {
    return actionType
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleSystemLogsClick = () => {
    router.push("/dashboard/admin-logs");
  };

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Recent Updates</h2>
          <span className={styles.subtitle}>System Logs</span>
        </div>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Recent Updates</h2>
          <span className={styles.subtitle}>System Logs</span>
        </div>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>Recent Updates</h2>
        <span
          className={styles.subtitle}
          onClick={handleSystemLogsClick}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          System Logs <FiExternalLink size={14} />
        </span>
      </div>

      <div className={styles.list}>
        {actionLogs.length === 0 ? (
          <div className={styles.noData}>No recent updates available</div>
        ) : (
          actionLogs.map((log) => {
            const updateType = getUpdateType(log.action_type);
            return (
              <div key={log.id} className={styles.updateItem}>
                <div className={styles.iconContainer}>
                  {getIcon(updateType)}
                </div>
                <div className={styles.details}>
                  <h3>{formatTitle(log.action_type)}</h3>
                  <p>{log.description}</p>
                  <span className={styles.time}>
                    {formatTimeAgo(log.created_at)} • by {log.admin_username}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentUpdates;
