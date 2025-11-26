"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./SystemHealth.module.css";
import {
  FiActivity,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiCpu,
  FiHardDrive,
  FiDatabase,
  FiServer,
} from "react-icons/fi";
import axiosInstance from "../../lib/axios";

interface SystemHealthData {
  database_status: string;
  redis_status: string;
  celery_status: string;
  storage_status: string;
  response_time_avg: number;
  error_rate: number;
  uptime_percentage: number;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  pending_tasks: number;
  failed_tasks: number;
  last_updated: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: SystemHealthData;
}

export const SystemHealth: React.FC = () => {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthData = useCallback(async () => {
    try {
      setError(null);
      const response = await axiosInstance.get<ApiResponse>(
        "/api/admin/system-health"
      );

      if (response.data.success) {
        setHealthData(response.data.data);
      } else {
        setError("Failed to fetch system health data");
      }
    } catch (err: any) {
      console.error("Error fetching system health:", err);
      setError("Unable to load system health data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchHealthData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchHealthData]);

  const getStatusIcon = (status: string) => {
    return status === "healthy" ? (
      <FiCheckCircle className={styles.iconHealthy} />
    ) : (
      <FiXCircle className={styles.iconUnhealthy} />
    );
  };

  const getStatusClass = (status: string) => {
    return status === "healthy" ? styles.statusHealthy : styles.statusUnhealthy;
  };

  const getUsageColor = (usage: number) => {
    if (usage < 60) return "#47b216";
    if (usage < 80) return "#ffc107";
    return "#dc3545";
  };

  const formatUptime = (percentage: number) => {
    return `${percentage.toFixed(2)}%`;
  };

  const formatResponseTime = (ms: number) => {
    return `${ms.toFixed(1)}ms`;
  };

  const formatErrorRate = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <FiActivity className={styles.headerIcon} />
            <h3>System Health</h3>
          </div>
        </div>
        <div className={styles.loadingState}>
          <FiRefreshCw className={styles.spinner} />
          <p>Loading system health...</p>
        </div>
      </div>
    );
  }

  if (error || !healthData) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <FiActivity className={styles.headerIcon} />
            <h3>System Health</h3>
          </div>
        </div>
        <div className={styles.errorState}>
          <FiXCircle />
          <p>{error || "No data available"}</p>
          <button onClick={fetchHealthData} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <FiActivity className={styles.headerIcon} />
          <h3>System Health</h3>
        </div>
        <div className={styles.headerRight}>
          <label className={styles.autoRefreshLabel}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh</span>
          </label>
          <button
            onClick={fetchHealthData}
            className={styles.refreshButton}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? styles.spinning : ""} />
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Services Status */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Services</h4>
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <FiDatabase className={styles.serviceIcon} />
              <div className={styles.serviceInfo}>
                <span className={styles.serviceName}>Database</span>
                <div className={styles.serviceStatus}>
                  {getStatusIcon(healthData.database_status)}
                  <span
                    className={getStatusClass(healthData.database_status)}
                  >
                    {healthData.database_status}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.serviceCard}>
              <FiServer className={styles.serviceIcon} />
              <div className={styles.serviceInfo}>
                <span className={styles.serviceName}>Redis</span>
                <div className={styles.serviceStatus}>
                  {getStatusIcon(healthData.redis_status)}
                  <span className={getStatusClass(healthData.redis_status)}>
                    {healthData.redis_status}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.serviceCard}>
              <FiActivity className={styles.serviceIcon} />
              <div className={styles.serviceInfo}>
                <span className={styles.serviceName}>Celery</span>
                <div className={styles.serviceStatus}>
                  {getStatusIcon(healthData.celery_status)}
                  <span className={getStatusClass(healthData.celery_status)}>
                    {healthData.celery_status}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.serviceCard}>
              <FiHardDrive className={styles.serviceIcon} />
              <div className={styles.serviceInfo}>
                <span className={styles.serviceName}>Storage</span>
                <div className={styles.serviceStatus}>
                  {getStatusIcon(healthData.storage_status)}
                  <span className={getStatusClass(healthData.storage_status)}>
                    {healthData.storage_status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Usage */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Resource Usage</h4>
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <FiCpu className={styles.metricIcon} />
                <span className={styles.metricLabel}>CPU Usage</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${healthData.cpu_usage}%`,
                    backgroundColor: getUsageColor(healthData.cpu_usage),
                  }}
                />
              </div>
              <span className={styles.metricValue}>
                {healthData.cpu_usage.toFixed(1)}%
              </span>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <FiServer className={styles.metricIcon} />
                <span className={styles.metricLabel}>Memory Usage</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${healthData.memory_usage}%`,
                    backgroundColor: getUsageColor(healthData.memory_usage),
                  }}
                />
              </div>
              <span className={styles.metricValue}>
                {healthData.memory_usage.toFixed(1)}%
              </span>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <FiHardDrive className={styles.metricIcon} />
                <span className={styles.metricLabel}>Disk Usage</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${healthData.disk_usage}%`,
                    backgroundColor: getUsageColor(healthData.disk_usage),
                  }}
                />
              </div>
              <span className={styles.metricValue}>
                {healthData.disk_usage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Performance</h4>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Uptime</span>
              <span className={styles.statValue}>
                {formatUptime(healthData.uptime_percentage)}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Avg Response Time</span>
              <span className={styles.statValue}>
                {formatResponseTime(healthData.response_time_avg)}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Error Rate</span>
              <span className={styles.statValue}>
                {formatErrorRate(healthData.error_rate)}
              </span>
            </div>
          </div>
        </div>

        {/* Task Queue */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Task Queue</h4>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Pending Tasks</span>
              <span className={styles.statValue}>
                {healthData.pending_tasks}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Failed Tasks</span>
              <span
                className={styles.statValue}
                style={{
                  color: healthData.failed_tasks > 0 ? "#dc3545" : "#47b216",
                }}
              >
                {healthData.failed_tasks}
              </span>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className={styles.footer}>
          <span className={styles.lastUpdated}>
            Last updated: {formatLastUpdated(healthData.last_updated)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
