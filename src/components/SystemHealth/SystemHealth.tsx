"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./SystemHealth.module.css";
import {
  FiActivity,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
} from "react-icons/fi";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
  Legend,
  Tooltip,
} from "recharts";
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

  const getUsageColor = (usage: number) => {
    if (usage < 50) return "#47b216";
    if (usage < 75) return "#ffc107";
    if (usage < 90) return "#BB2D3B";
    return "#dc3545";
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{payload[0].name}</p>
          <p className={styles.tooltipValue}>{payload[0].value.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={styles.card}>
        <h2>System Health</h2>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading system health...</p>
        </div>
      </div>
    );
  }

  if (error || !healthData) {
    return (
      <div className={styles.card}>
        <h2>System Health</h2>
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error || "No data available"}</p>
          <button onClick={fetchHealthData} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data for resource usage
  const resourceData = [
    {
      name: "CPU Usage",
      value: healthData.cpu_usage,
      fill: getUsageColor(healthData.cpu_usage),
    },
    {
      name: "Memory Usage",
      value: healthData.memory_usage,
      fill: getUsageColor(healthData.memory_usage),
    },
    {
      name: "Disk Usage",
      value: healthData.disk_usage,
      fill: getUsageColor(healthData.disk_usage),
    },
  ];

  // Calculate overall system health score
  const allServicesHealthy =
    healthData.database_status === "healthy" &&
    healthData.redis_status === "healthy" &&
    healthData.celery_status === "healthy" &&
    healthData.storage_status === "healthy";

  const avgResourceUsage =
    (healthData.cpu_usage + healthData.memory_usage + healthData.disk_usage) /
    3;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>System Health</h2>
          <div className={styles.statusBadge}>
            {allServicesHealthy ? (
              <>
                <FiCheckCircle className={styles.statusIconHealthy} />
                <span className={styles.statusTextHealthy}>All Systems Operational</span>
              </>
            ) : (
              <>
                <FiXCircle className={styles.statusIconUnhealthy} />
                <span className={styles.statusTextUnhealthy}>Service Issues Detected</span>
              </>
            )}
          </div>
        </div>
        <div className={styles.headerRight}>
          <label className={styles.autoRefreshLabel}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto</span>
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

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="15%"
            outerRadius="95%"
            data={resourceData}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: "#1a1a1a" }}
              dataKey="value"
              cornerRadius={8}
              label={{
                position: "insideStart",
                fill: "#fff",
                fontSize: 11,
                fontWeight: 600,
                formatter: (value: any) =>
                  typeof value === "number" ? `${value.toFixed(0)}%` : "",
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "12px",
                color: "#ccc",
              }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* Compact Summary */}
      <div className={styles.summaryInfo}>
        Uptime: {healthData.uptime_percentage.toFixed(2)}% • 
        Response: {healthData.response_time_avg.toFixed(1)}ms • 
        Errors: <span style={{ color: healthData.error_rate > 0.05 ? "#dc3545" : "#47b216" }}>
          {(healthData.error_rate * 100).toFixed(2)}%
        </span> • 
        Updated: {formatLastUpdated(healthData.last_updated)}
      </div>
    </div>
  );
};

export default SystemHealth;
