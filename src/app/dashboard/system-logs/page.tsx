"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./system-logs.module.css";
import {
  FiInfo,
  FiAlertTriangle,
  FiXCircle,
  FiRefreshCw,
  FiFilter,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import axiosInstance from "../../../lib/axios";

interface SystemLog {
  id: string;
  level: string;
  message: string;
  source?: string;
  module?: string;
  timestamp: string;
  details?: string;
  user?: string;
  ip_address?: string;
  created_at: string;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    results: SystemLog[];
    pagination: Pagination;
  };
}

const SystemLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const fetchLogs = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append("page", currentPage.toString());
        params.append("page_size", "50");

        if (filterLevel !== "all") {
          params.append("level", filterLevel.toUpperCase());
        }

        if (searchTerm) {
          params.append("search", searchTerm);
        }

        const response = await axiosInstance.get<ApiResponse>(
          `/api/admin/system-logs?${params.toString()}`
        );

        if (response.data.success) {
          setLogs(response.data.data.results);
          setPagination(response.data.data.pagination);
          setLastUpdate(new Date());
        } else {
          setError("Failed to load system logs");
        }
      } catch (err: any) {
        console.error("Error fetching system logs:", err);
        setError(
          err.response?.data?.message ||
          "Failed to load system logs. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [currentPage, filterLevel, searchTerm]
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLogs(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const getLevelIcon = (level: string) => {
    const levelUpper = level.toUpperCase();
    switch (levelUpper) {
      case "INFO":
        return <FiInfo className={styles.iconInfo} />;
      case "WARNING":
        return <FiAlertTriangle className={styles.iconWarning} />;
      case "ERROR":
      case "CRITICAL":
        return <FiXCircle className={styles.iconError} />;
      default:
        return <FiInfo className={styles.iconInfo} />;
    }
  };

  const getLevelClass = (level: string) => {
    const levelUpper = level.toUpperCase();
    switch (levelUpper) {
      case "INFO":
        return styles.levelInfo;
      case "WARNING":
        return styles.levelWarning;
      case "ERROR":
      case "CRITICAL":
        return styles.levelError;
      case "DEBUG":
        return styles.levelDebug;
      default:
        return styles.levelInfo;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleRefresh = () => {
    fetchLogs(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.total_pages) {
      setCurrentPage(newPage);
    }
  };

  const toggleLogExpansion = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  const levels = ["all", "info", "warning", "error", "debug", "critical"];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>System Logs</h1>
          <p className={styles.subtitle}>
            Monitor system events, errors, and warnings in real-time
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.refreshButton}
            onClick={handleRefresh}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? styles.spinning : ""} />
            Refresh
          </button>
          <label className={styles.autoRefreshLabel}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh</span>
          </label>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <button onClick={handleRefresh}>Retry</button>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search logs by message, source, or module..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <button
          className={styles.filterToggle}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter />
          Filters
          {showFilters ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label>Log Level:</label>
            <div className={styles.levelFilters}>
              {levels.map((level) => (
                <button
                  key={level}
                  className={`${styles.levelButton} ${filterLevel === level ? styles.active : ""
                    }`}
                  onClick={() => {
                    setFilterLevel(level);
                    setCurrentPage(1);
                  }}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Total Logs:</span>
          <span className={styles.statValue}>
            {pagination?.total_count || 0}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Showing:</span>
          <span className={styles.statValue}>{logs.length}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Last Updated:</span>
          <span className={styles.statValue}>
            {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {loading && logs.length === 0 ? (
        <div className={styles.loadingContainer}>
          <FiRefreshCw className={styles.spinner} size={32} />
          <p>Loading system logs...</p>
        </div>
      ) : (
        <>
          <div className={styles.logsContainer}>
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className={styles.logCard}>
                  <div className={styles.logHeader}>
                    <div className={styles.logLevel}>
                      {getLevelIcon(log.level)}
                      <span className={getLevelClass(log.level)}>
                        {log.level.toUpperCase()}
                      </span>
                    </div>
                    <div className={styles.logMeta}>
                      {log.source && (
                        <span className={styles.logSource}>
                          {log.source}
                        </span>
                      )}
                      {log.module && (
                        <span className={styles.logModule}>
                          {log.module}
                        </span>
                      )}
                      <span className={styles.logTimestamp}>
                        {formatDate(log.timestamp || log.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.logMessage}>{log.message}</div>

                  {(log.details || log.user || log.ip_address) && (
                    <>
                      <button
                        className={styles.expandButton}
                        onClick={() => toggleLogExpansion(log.id)}
                      >
                        {expandedLog === log.id ? (
                          <>
                            <FiChevronUp /> Hide Details
                          </>
                        ) : (
                          <>
                            <FiChevronDown /> Show Details
                          </>
                        )}
                      </button>

                      {expandedLog === log.id && (
                        <div className={styles.logDetails}>
                          {log.details && (
                            <div className={styles.detailItem}>
                              <strong>Details:</strong>
                              <pre>{log.details}</pre>
                            </div>
                          )}
                          {log.user && (
                            <div className={styles.detailItem}>
                              <strong>User:</strong>
                              <span>{log.user}</span>
                            </div>
                          )}
                          {log.ip_address && (
                            <div className={styles.detailItem}>
                              <strong>IP Address:</strong>
                              <span>{log.ip_address}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.noLogs}>
                <FiInfo size={48} />
                <p>No system logs found</p>
                {(searchTerm || filterLevel !== "all") && (
                  <p className={styles.noLogsHint}>
                    Try adjusting your filters or search terms
                  </p>
                )}
              </div>
            )}
          </div>

          {pagination && pagination.total_pages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageButton}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.has_previous || loading}
              >
                Previous
              </button>
              <div className={styles.pageInfo}>
                Page {pagination.current_page} of {pagination.total_pages}
              </div>
              <button
                className={styles.pageButton}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.has_next || loading}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SystemLogsPage;
