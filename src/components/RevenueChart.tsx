"use client";

import React, { useState, useEffect } from "react";
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "#0b0b0b",
            border: "1px solid #47b216",
            borderRadius: "8px",
            padding: "12px",
            color: "#fff",
          }}
        >
          <p
            style={{ color: "#82ea80", fontWeight: "600", marginBottom: "8px" }}
          >
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              style={{
                color: entry.color,
                fontSize: "14px",
                margin: "4px 0",
              }}
            >
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
      <div
        style={{
          width: "100%",
          minHeight: "400px",
          background: "#121212",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "#82ea80" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid #1a1a1a",
              borderTop: "4px solid #47b216",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p>Loading revenue data...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "400px",
          background: "#121212",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <p style={{ color: "#dc3545", fontSize: "16px" }}>{error}</p>
        <button
          onClick={() => fetchRevenueData(period)}
          style={{
            background: "#47b216",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "10px 20px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || data.chart_data.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "400px",
          background: "#121212",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#888" }}>No revenue data available</p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "400px",
        background: "#121212",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
      }}
    >
      {/* Header with Title and Period Filter */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h3
            style={{
              color: "#82ea80",
              margin: "0 0 0.5rem 0",
              fontSize: "1.25rem",
            }}
          >
            Revenue Over Time
          </h3>
          <p style={{ color: "#888", margin: 0, fontSize: "14px" }}>
            Total: {data.currency} {formatCurrency(data.total_revenue)}
          </p>
        </div>

        {/* Period Toggle */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            background: "#1a1a1a",
            borderRadius: "8px",
            padding: "4px",
          }}
        >
          {(["daily", "weekly", "monthly"] as AnalyticsPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              style={{
                background: period === p ? "#47b216" : "transparent",
                color: period === p ? "#fff" : "#888",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s ease",
                textTransform: "capitalize",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={data.chart_data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="rentalRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#47b216" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#47b216" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="rentalDueRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ea80" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#82ea80" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="topupRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2196f3" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2196f3" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fineRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff9800" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ff9800" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
          <XAxis
            dataKey="label"
            stroke="#888"
            style={{ fontSize: "12px" }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            stroke="#888"
            style={{ fontSize: "12px" }}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
              fontSize: "14px",
            }}
            iconType="circle"
          />
          <Area
            type="monotone"
            dataKey="rental_revenue"
            name="Rental"
            stroke="#47b216"
            fillOpacity={1}
            fill="url(#rentalRevenue)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="rental_due_revenue"
            name="Rental Due"
            stroke="#82ea80"
            fillOpacity={1}
            fill="url(#rentalDueRevenue)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="topup_revenue"
            name="Top-up"
            stroke="#2196f3"
            fillOpacity={1}
            fill="url(#topupRevenue)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="fine_revenue"
            name="Fine"
            stroke="#ff9800"
            fillOpacity={1}
            fill="url(#fineRevenue)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Date Range Info */}
      <div
        style={{
          marginTop: "1rem",
          padding: "0.75rem",
          background: "#1a1a1a",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#888",
          textAlign: "center",
        }}
      >
        Showing data from {data.start_date} to {data.end_date}
      </div>
    </div>
  );
};

export default RevenueChart;
