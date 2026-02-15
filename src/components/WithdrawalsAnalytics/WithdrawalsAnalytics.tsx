"use client";

import React, { useState, useEffect } from "react";
import styles from "./WithdrawalsAnalytics.module.css";
import { FiDollarSign, FiTrendingUp, FiClock, FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import axiosInstance from "@/lib/axios";

interface WithdrawalStats {
  total_withdrawals: number;
  total_amount: string;
  pending_count: number;
  pending_amount: string;
  completed_count: number;
  completed_amount: string;
  rejected_count: number;
  rejected_amount: string;
  average_amount: string;
}

interface StatusDistribution {
  status: string;
  count: number;
  amount: string;
}

interface WithdrawalsAnalyticsData {
  stats: WithdrawalStats;
  status_distribution: StatusDistribution[];
  recent_trend: Array<{
    date: string;
    count: number;
    amount: string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  COMPLETED: "#10b981",
  REJECTED: "#ef4444",
  PROCESSING: "#3b82f6",
};

const WithdrawalsAnalytics: React.FC = () => {
  const [data, setData] = useState<WithdrawalsAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.get("/api/admin/withdrawals/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response?.data?.success) {
        setData(response.data.data);
      } else {
        setError("Failed to load analytics");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <FiLoader className={styles.spinner} />
          <p>Loading withdrawals analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <FiXCircle className={styles.errorIcon} />
          <p>{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  const pieData = data.status_distribution?.map((item) => ({
    name: item?.status ?? "Unknown",
    value: item?.count ?? 0,
    amount: item?.amount ?? "0",
  })) ?? [];

  const trendData = data.recent_trend?.map((item) => ({
    date: item?.date ?? "",
    count: item?.count ?? 0,
    amount: parseFloat(item?.amount ?? "0"),
  })) ?? [];

  // Calculate dynamic height for bar chart based on data length
  const barChartHeight = Math.max(250, trendData.length * 40);

  return (
    <div className={styles.container}>
      <h2 style={{ 
        fontSize: '1rem', 
        fontWeight: 600, 
        color: '#e0e0e0', 
        margin: '0 0 0.5rem 0',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <FiDollarSign /> Withdrawals Analytics
      </h2>
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.borderTotal}`}>
          <p className={styles.statLabel}>Total Amount</p>
          <p className={styles.statValue}>{data.stats?.total_amount ?? "0"}</p>
        </div>

        <div className={`${styles.statCard} ${styles.borderPending}`}>
          <p className={styles.statLabel}>Pending</p>
          <p className={styles.statValue}>{data.stats?.pending_amount ?? "0"}</p>
        </div>

        <div className={`${styles.statCard} ${styles.borderCompleted}`}>
          <p className={styles.statLabel}>Completed</p>
          <p className={styles.statValue}>{data.stats?.completed_amount ?? "0"}</p>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.sectionTitle}>
            <FiDollarSign /> Status Distribution
          </h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#8884d8"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #2a2a2a",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              <div className={styles.legend} style={{ display: "none" }}>
                {pieData.map((item) => (
                  <div key={item.name} className={styles.legendItem}>
                    <span className={styles.legendColor} style={{ backgroundColor: STATUS_COLORS[item.name] }} />
                    <span className={styles.legendLabel}>{item.name}</span>
                    <span className={styles.legendValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className={styles.emptyText}>No status data available</p>
          )}
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.sectionTitle}>
            <FiTrendingUp /> Recent Trend
          </h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={barChartHeight}>
                <BarChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#aaa"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#aaa" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === "count") return [value, "Withdrawals"];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
          ) : (
            <p className={styles.emptyText}>No trend data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalsAnalytics;
