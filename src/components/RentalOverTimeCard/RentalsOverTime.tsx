"use client";

import React, { useState, useEffect } from "react";
import styles from "./RentalsOverTime.module.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { analyticsService } from "../../lib/api/analytics.service";
import {
  RentalAnalyticsData,
  AnalyticsPeriod,
} from "../../types/analytics.types";

const RentalOverTime: React.FC = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>("daily");
  const [data, setData] = useState<RentalAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRentalsData = async (selectedPeriod: AnalyticsPeriod) => {
    try {
      setLoading(true);
      setError(null);

      const dateRange = analyticsService.getDefaultDateRange(selectedPeriod);
      const response = await analyticsService.getRentalsOverTime({
        period: selectedPeriod,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      });

      if (response.success) {
        setData(response.data);
      } else {
        setError("Failed to fetch rentals data");
      }
    } catch (err) {
      console.error("Error fetching rentals data:", err);
      setError("Error loading rentals data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalsData(period);
  }, [period]);

  const handlePeriodChange = (newPeriod: AnalyticsPeriod) => {
    setPeriod(newPeriod);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          <div className={styles.tooltipContent}>
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }}>
                {entry.name}: {entry.value}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={styles.card}>
        <h2>Rental Over Time</h2>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading rentals data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.card}>
        <h2>Rental Over Time</h2>
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error}</p>
          <button
            onClick={() => fetchRentalsData(period)}
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.chart_data.length === 0) {
    return (
      <div className={styles.card}>
        <h2>Rental Over Time</h2>
        <div className={styles.noData}>
          <p>No rentals data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2>Rental Over Time</h2>
          <p className={styles.totalRentals}>
            Total Rentals: {data.total_rentals.toLocaleString()}
          </p>
        </div>
        <div className={styles.toggle}>
          {(["daily", "weekly", "monthly"] as AnalyticsPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`${styles.toggleBtn} ${period === p ? styles.active : ""}`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data.chart_data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis
              dataKey="label"
              stroke="#aaa"
              style={{ fontSize: "12px" }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#aaa" style={{ fontSize: "12px" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: "10px",
                fontSize: "12px",
              }}
              iconType="circle"
            />
            <Bar
              dataKey="completed"
              name="Completed"
              fill="#47b216"
              radius={[4, 4, 0, 0]}
              stackId="rentals"
            />
            <Bar
              dataKey="active"
              name="Active"
              fill="#2196f3"
              radius={[4, 4, 0, 0]}
              stackId="rentals"
            />
            <Bar
              dataKey="pending"
              name="Pending"
              fill="#ffc107"
              radius={[4, 4, 0, 0]}
              stackId="rentals"
            />
            <Bar
              dataKey="cancelled"
              name="Cancelled"
              fill="#6c757d"
              radius={[4, 4, 0, 0]}
              stackId="rentals"
            />
            <Bar
              dataKey="overdue"
              name="Overdue"
              fill="#dc3545"
              radius={[4, 4, 0, 0]}
              stackId="rentals"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      {data.summary && (
        <div className={styles.summaryContainer}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Avg per period:</span>
            <span className={styles.summaryValue}>
              {data.summary.avg_per_period.toFixed(1)}
            </span>
          </div>
          {data.summary.peak_date && (
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Peak:</span>
              <span className={styles.summaryValue}>
                {data.summary.peak_count} on{" "}
                {new Date(data.summary.peak_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Date Range Info */}
      <div className={styles.dateRange}>
        Showing data from {data.start_date} to {data.end_date}
      </div>
    </div>
  );
};

export default RentalOverTime;
