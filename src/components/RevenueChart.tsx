"use client";

import React, { useState, useEffect } from "react";
import styles from "./RevenueChart.module.css";
import TotalBadge from "./common/TotalBadge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { analyticsService } from "../lib/api/analytics.service";
import {
  RevenueAnalyticsData,
  AnalyticsPeriod,
} from "../types/analytics.types";

const RevenueChart: React.FC = () => {
  const [period, setPeriod] = useState<AnalyticsPeriod>("daily");
  const [data, setData] = useState<RevenueAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Detect screen size for responsive labels
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchRevenueData = async (selectedPeriod: AnalyticsPeriod) => {
    try {
      setLoading(true);
      setError(null);

      const dateRange = analyticsService.getDefaultDateRange(selectedPeriod);
      const response = await analyticsService.getRevenueOverTime({
        period: selectedPeriod,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      });

      if (response.success) {
        setData(response.data);
      } else {
        setError("Failed to fetch revenue data");
      }
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      setError("Error loading revenue data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData(period);
  }, [period]);

  const handlePeriodChange = (newPeriod: AnalyticsPeriod) => {
    setPeriod(newPeriod);
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString("en-US")}`;
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
          {payload.map((entry: any, index: number) => (
            <p key={index} className={styles.tooltipValue} style={{ color: entry.color }}>
              {entry.name}: {data?.currency} {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading revenue data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.card}>
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error}</p>
          <button onClick={() => fetchRevenueData(period)} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.chart_data.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.noData}>
          <p>No revenue data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3>Revenue Over Time</h3>
          <TotalBadge 
            label="Total" 
            value={`${data.currency} ${formatCurrency(data.total_revenue)}`}
            color="green"
          />
        </div>

        <div className={styles.toggle}>
          {(["daily", "weekly", "monthly"] as AnalyticsPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`${styles.toggleBtn} ${period === p ? styles.active : ""}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data.chart_data}
            margin={{ 
              top: 10, 
              right: isMobile ? 5 : 10, 
              left: isMobile ? -10 : 0, 
              bottom: 0 
            }}
          >
            <defs>
              <linearGradient id="rentalRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#47b216" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#47b216" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="rentalDueRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ea80" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ea80" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="topupRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#2196f3" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fineRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ff9800" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
            <XAxis
              dataKey="label"
              stroke="#888"
              style={{ fontSize: isMobile ? "11px" : "12px", fontWeight: 500 }}
              angle={-45}
              textAnchor="end"
              height={isMobile ? 60 : 70}
              interval={isMobile ? 2 : 1}
              tick={{ fill: "#888" }}
              tickFormatter={formatXAxisTick}
            />
            <YAxis
              stroke="#888"
              style={{ fontSize: isMobile ? "11px" : "12px", fontWeight: 500 }}
              tickFormatter={formatCurrency}
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
            {/* Non-stacked areas - each visible independently */}
            <Area
              type="monotone"
              dataKey="rental_revenue"
              name="Rental"
              stroke="#47b216"
              strokeWidth={2}
              fill="url(#rentalRevenue)"
              fillOpacity={1}
            />
            <Area
              type="monotone"
              dataKey="rental_due_revenue"
              name="Rental Due"
              stroke="#82ea80"
              strokeWidth={2}
              fill="url(#rentalDueRevenue)"
              fillOpacity={1}
            />
            <Area
              type="monotone"
              dataKey="topup_revenue"
              name="Top-up"
              stroke="#2196f3"
              strokeWidth={2}
              fill="url(#topupRevenue)"
              fillOpacity={1}
            />
            <Area
              type="monotone"
              dataKey="fine_revenue"
              name="Fine"
              stroke="#ff9800"
              strokeWidth={2}
              fill="url(#fineRevenue)"
              fillOpacity={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.dateRange}>
        Showing data from {data.start_date} to {data.end_date}
      </div>
    </div>
  );
};

export default RevenueChart;
