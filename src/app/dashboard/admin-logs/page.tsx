"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./admin-logs.module.css";
import Navbar from "../../../components/Navbar/Navbar";
import {
  FiInfo,
  FiCheckCircle,
  FiAlertTriangle,
  FiRefreshCw,
  FiFilter,
  FiSearch,
  FiX,
} from "react-icons/fi";
import axiosInstance from "../../../lib/axios";

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

const AdminLogsPage: React.FC = () => {
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showFilters, setShowFilters] = useState(false);

  const fetchActionLogs = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      const response = await axiosInstance.get<ApiResponse>(
        "/api/admin/action-logs",
      );

      if (response.data.success) {
        setActionLogs(response.data.data);
        setLastUpdate(new Date());
      } else {
        setError(response.data.message || "Failed to load logs");
      }
    } catch (err: any) {
      console.error("Error fetching action logs:", err);
      setError("Failed to load system logs");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActionLogs();
  }, [fetchActionLogs]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchActionLogs(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchActionLogs]);

  // Filter and search logs
  useEffect(() => {
    let filtered = [...actionLogs];

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((log) =>
        log.action_type.toLowerCase().includes(filterType.toLowerCase()),
      );
    }

    // Search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.description.toLowerCase().includes(search) ||
          log.admin_username.toLowerCase().includes(search) ||
          log.action_type.toLowerCase().includes(search) ||
          log.target_model.toLowerCase().includes(search),
      );
    }

    setFilteredLogs(filtered);
  }, [actionLogs, searchTerm, filterType]);

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

  const formatDateTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
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

  const getUniqueActionTypes = (): string[] => {
    const types = actionLogs.map((log) => log.action_type);
    return Array.from(new Set(types)).sort();
  };

  const handleRefresh = () => {
    fetchActionLogs(true);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className={styles.systemLogsPage}>
      <Navbar />
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1>System Logs</h1>
            <p className={styles.subtitle}>Real-time admin action audit logs</p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={`${styles.autoRefreshBtn} ${autoRefresh ? styles.active : ""}`}
              onClick={() => setAutoRefresh(!autoRefresh)}
              title={autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            >
              <FiRefreshCw
                className={autoRefresh ? styles.spinning : ""}
                size={16}
              />
              {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </button>
            <button
              className={styles.refreshBtn}
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh logs"
            >
              <FiRefreshCw size={18} />
            </button>
          </div>
        </header>

        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                className={styles.clearBtn}
                onClick={clearSearch}
                title="Clear search"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          <button
            className={styles.filterToggle}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter size={16} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGroup}>
              <label>Action Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="kyc">KYC Actions</option>
                <option value="coupon">Coupon Actions</option>
                <option value="withdrawal">Withdrawal Actions</option>
              </select>
            </div>
          </div>
        )}

        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Total Logs:</span>
            <span className={styles.statValue}>{actionLogs.length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Filtered:</span>
            <span className={styles.statValue}>{filteredLogs.length}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Last Update:</span>
            <span className={styles.statValue}>
              {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {loading && actionLogs.length === 0 ? (
          <div className={styles.loadingContainer}>
            <FiRefreshCw className={styles.spinner} size={32} />
            <p>Loading system logs...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <FiAlertTriangle size={32} />
            <p>{error}</p>
            <button className={styles.retryBtn} onClick={handleRefresh}>
              Try Again
            </button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className={styles.emptyContainer}>
            <FiInfo size={32} />
            <p>No logs found matching your criteria</p>
          </div>
        ) : (
          <div className={styles.logsContainer}>
            {filteredLogs.map((log) => {
              const updateType = getUpdateType(log.action_type);
              return (
                <div key={log.id} className={styles.logCard}>
                  <div className={styles.logHeader}>
                    <div className={styles.logTitle}>
                      <div className={styles.iconContainer}>
                        {getIcon(updateType)}
                      </div>
                      <div>
                        <h3>{formatTitle(log.action_type)}</h3>
                        <span className={styles.targetModel}>
                          {log.target_model}
                        </span>
                      </div>
                    </div>
                    <div className={styles.logMeta}>
                      <span className={styles.timeAgo}>
                        {formatTimeAgo(log.created_at)}
                      </span>
                      <span className={styles.timestamp}>
                        {formatDateTime(log.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.logBody}>
                    <p className={styles.description}>{log.description}</p>

                    {Object.keys(log.changes).length > 0 && (
                      <div className={styles.changesContainer}>
                        <h4>Changes:</h4>
                        <div className={styles.changes}>
                          {Object.entries(log.changes).map(([key, value]) => (
                            <div key={key} className={styles.changeItem}>
                              <span className={styles.changeKey}>{key}:</span>
                              <span className={styles.changeValue}>
                                {typeof value === "object"
                                  ? JSON.stringify(value)
                                  : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.logFooter}>
                    <div className={styles.adminInfo}>
                      <span className={styles.adminName}>
                        {log.admin_username}
                      </span>
                      <span className={styles.adminEmail}>
                        {log.admin_email}
                      </span>
                    </div>
                    <div className={styles.technicalInfo}>
                      <span className={styles.ipAddress}>{log.ip_address}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogsPage;
