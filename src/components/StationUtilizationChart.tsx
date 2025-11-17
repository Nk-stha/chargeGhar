"use client";

import React, { useState } from "react";
import TotalBadge from "./common/TotalBadge";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { FiRefreshCw, FiAlertCircle, FiPieChart } from "react-icons/fi";
import { useDashboardData } from "../contexts/DashboardDataContext";
import styles from "./StationUtilizationChart.module.css";

const COLORS = [
  "#47b216",
  "#82ea80",
  "#66bb6a",
  "#3c8c3c",
  "#2e7d32",
  "#1b5e20",
];

const StationUtilizationChart: React.FC = () => {
  const { stationsData, loading, error, refetchStations } = useDashboardData();
  const [refreshing, setRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size for responsive chart
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (refetchStations) {
        refetchStations();
      }
    } catch (err) {
      console.error("Error refreshing station data:", err);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2>Station Utilization</h2>
            <span className={styles.subtitle}>Slot Usage Overview</span>
          </div>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading station utilization...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2>Station Utilization</h2>
            <span className={styles.subtitle}>Slot Usage Overview</span>
          </div>
        </div>
        <div className={styles.errorContainer}>
          <FiAlertCircle className={styles.errorIcon} />
          <p className={styles.errorText}>{error}</p>
          <button onClick={handleRefresh} className={styles.retryButton}>
            <FiRefreshCw /> Retry
          </button>
        </div>
      </div>
    );
  }

  const stations = stationsData?.results || [];

  const chartData = stations.map((station: any) => {
    const utilizedSlots = station.total_slots - station.available_slots;
    const utilizationPercentage =
      station.total_slots > 0 ? (utilizedSlots / station.total_slots) * 100 : 0;
    return {
      name: station.station_name,
      value: parseFloat(utilizationPercentage.toFixed(2)),
    };
  });

  if (chartData.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2>Station Utilization</h2>
            <span className={styles.subtitle}>Slot Usage Overview</span>
          </div>
          <button
            onClick={handleRefresh}
            className={styles.refreshButton}
            disabled={refreshing}
            title="Refresh"
          >
            <FiRefreshCw className={refreshing ? styles.spinning : ""} />
          </button>
        </div>
        <div className={styles.noData}>
          <FiPieChart className={styles.noDataIcon} />
          <p>No station data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Station Utilization</h2>
          <TotalBadge 
            label="Stations" 
            value={chartData.length}
            color="purple"
          />
        </div>
        <button
          onClick={handleRefresh}
          className={styles.refreshButton}
          disabled={refreshing}
          title="Refresh"
        >
          <FiRefreshCw className={refreshing ? styles.spinning : ""} />
        </button>
      </div>
      <div className={styles.chartContainer}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={isMobile ? 70 : 90}
              fill="#47b216"
              dataKey="value"
              label={!isMobile}
              labelLine={!isMobile}
            >
              {chartData.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#0b0b0b",
                border: "1px solid #47b216",
                color: "#fff",
                borderRadius: "6px",
                fontSize: isMobile ? "12px" : "13px",
                fontWeight: 500,
              }}
              formatter={(value: any) => `${value}%`}
            />
            <Legend
              wrapperStyle={{
                color: "#ccc",
                fontSize: isMobile ? "12px" : "13px",
                paddingTop: isMobile ? "12px" : "18px",
                fontWeight: 500,
              }}
              iconSize={isMobile ? 9 : 11}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StationUtilizationChart;
