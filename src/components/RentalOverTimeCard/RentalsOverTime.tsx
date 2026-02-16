"use client";

import React, { useState, useEffect } from "react";
import styles from "./RentalsOverTime.module.css";
import TotalBadge from "../common/TotalBadge";
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
import { FiCalendar, FiFilter } from "react-icons/fi";

const RentalOverTime: React.FC = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>("daily");
  const [data, setData] = useState<RentalAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Detect screen size for responsive labels
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchRentalsData = async (selectedPeriod: AnalyticsPeriod) => {
    try {
      setLoading(true);
      setError(null);

      const dateRange = analyticsService.getDefaultDateRange(selectedPeriod);
      const params: any = {
        period: selectedPeriod,
        start_date: startDate || dateRange.start_date,
        end_date: endDate || dateRange.end_date,
      };

      if (status) {
        params.status = status;
      }

      const response = await analyticsService.getRentalsOverTime(params);

      if (response.success) {
        setData(response.data);
      } else {
        setError("Failed to fetch rentals data");
      }
    } catch (err) {
      setError("Error loading rentals data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalsData(period);
  }, [period, status, startDate, endDate]);

  const handlePeriodChange = (newPeriod: AnalyticsPeriod) => {
    setPeriod(newPeriod);
  };

  // Format X-axis tick to show shorter dates
  const formatXAxisTick = (value: string) => {
    if (!value) return "";
    try {
      const date = new Date(value);
      // For daily: show "18 Oct" format
      if (period === "daily") {
        return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
      }
      // For weekly: keep as is or shorten
      if (period === "weekly") {
        return value.replace("Week ", "W");
      }
      // For monthly: show "Jan" format
      if (period === "monthly") {
        return date.toLocaleDateString("en-US", { month: "short" });
      }
      return value;
    } catch {
      return value;
    }
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
          <TotalBadge 
            label="Total Rentals" 
            value={data.total_rentals.toLocaleString()}
            color="blue"
          />
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

      {/* Filters Section */}
      <div className={styles.filtersSection}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <FiFilter className={styles.filterIcon} />
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <FiCalendar className={styles.filterIcon} />
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={styles.filterInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>
            <FiCalendar className={styles.filterIcon} />
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={styles.filterInput}
          />
        </div>

        {(status || startDate || endDate) && (
          <button
            onClick={() => {
              setStatus("");
              setStartDate("");
              setEndDate("");
            }}
            className={styles.clearFiltersBtn}
            title="Clear all filters"
          >
            Clear
          </button>
        )}
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.chart_data}
            margin={{ 
              top: 10, 
              right: isMobile ? 5 : 10, 
              left: isMobile ? -10 : 0, 
              bottom: 0 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis
              dataKey="label"
              stroke="#aaa"
              style={{ fontSize: isMobile ? "11px" : "12px", fontWeight: 500 }}
              angle={-45}
              textAnchor="end"
              height={isMobile ? 60 : 70}
              interval={isMobile ? 2 : 1}
              tick={{ fill: "#aaa" }}
              tickFormatter={formatXAxisTick}
            />
            <YAxis 
              stroke="#aaa" 
              style={{ fontSize: isMobile ? "11px" : "12px", fontWeight: 500 }}
              width={isMobile ? 45 : 55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: isMobile ? "12px" : "18px",
                fontSize: isMobile ? "11px" : "13px",
                fontWeight: 500,
              }}
              iconType="circle"
              iconSize={isMobile ? 9 : 11}
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

      {/* Compact Summary */}
      <div className={styles.dateRange}>
        {data.summary && (
          <>
            Avg: {data.summary.avg_per_period.toFixed(1)} per period
            {data.summary.peak_date && (
              <> • Peak: {data.summary.peak_count} on {new Date(data.summary.peak_date).toLocaleDateString()}</>
            )}
            {" • "}
          </>
        )}
        {data.start_date} to {data.end_date}
      </div>
    </div>
  );
};

export default RentalOverTime;
