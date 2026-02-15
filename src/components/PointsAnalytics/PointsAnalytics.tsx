"use client";

import React, { useState, useEffect } from "react";
import styles from "./PointsAnalytics.module.css";
import { FiAward, FiTrendingUp, FiUsers, FiActivity, FiLoader, FiXCircle } from "react-icons/fi";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import axiosInstance from "@/lib/axios";

interface PointsAnalyticsData {
  total_transactions: number;
  earned: {
    total_points: number;
    transaction_count: number;
  };
  spent: {
    total_points: number;
    transaction_count: number;
  };
  adjustments: {
    total_points: number;
    transaction_count: number;
  };
  source_breakdown: Array<{
    source: string;
    total_points: number;
    transaction_count: number;
  }>;
  top_earners: Array<{
    user_id: string;
    username: string;
    total_earned: number;
  }>;
  recent_activity: Array<{
    transaction_type: string;
    total_points: number;
    count: number;
  }>;
  period: {
    start_date: string | null;
    end_date: string | null;
  };
}

const SOURCE_COLORS: Record<string, string> = {
  ON_TIME_RETURN: "#10b981",
  SOCIAL_SIGNUP: "#3b82f6",
  SIGNUP: "#8b5cf6",
  COUPON: "#f59e0b",
  REFERRAL_INVITEE: "#ec4899",
  REFERRAL_INVITER: "#06b6d4",
  KYC: "#14b8a6",
  RENTAL: "#6366f1",
  ACHIEVEMENT: "#f97316",
  TOPUP: "#84cc16",
  PROFILE: "#a855f7",
  OTHER: "#6b7280",
};

const PointsAnalytics: React.FC = () => {
  const [data, setData] = useState<PointsAnalyticsData | null>(null);
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
      const response = await axiosInstance.get("/api/admin/points/analytics", {
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
          <p>Loading points analytics...</p>
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

  const pieData = data.source_breakdown?.map((item) => ({
    name: item?.source ?? "Unknown",
    value: item?.total_points ?? 0,
  })) ?? [];

  const activityData = data.recent_activity?.map((item) => ({
    type: item?.transaction_type ?? "",
    points: item?.total_points ?? 0,
    count: item?.count ?? 0,
  })) ?? [];

  // Calculate dynamic height for bar chart based on data length
  const barChartHeight = Math.max(250, activityData.length * 80);

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
        <FiAward /> Points Analytics
      </h2>
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.borderIssued}`}>
          <p className={styles.statLabel}>Points Earned</p>
          <p className={styles.statValue}>{(data.earned?.total_points ?? 0).toLocaleString()}</p>
        </div>

        <div className={`${styles.statCard} ${styles.borderRedeemed}`}>
          <p className={styles.statLabel}>Points Spent</p>
          <p className={styles.statValue}>{(data.spent?.total_points ?? 0).toLocaleString()}</p>
        </div>

        <div className={`${styles.statCard} ${styles.borderActive}`}>
          <p className={styles.statLabel}>Total Transactions</p>
          <p className={styles.statValue}>{(data.total_transactions ?? 0).toLocaleString()}</p>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.sectionTitle}>
            <FiTrendingUp /> Recent Activity
          </h3>
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={barChartHeight}>
                <BarChart data={activityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis 
                    dataKey="type" 
                    stroke="#aaa"
                    tick={{ fontSize: 12 }}
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
                      if (name === "points") return [value.toLocaleString(), "Points"];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="points" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
          ) : (
            <p className={styles.emptyText}>No activity data available</p>
          )}
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.sectionTitle}>
            <FiAward /> Points by Source
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
                        <Cell key={`cell-${index}`} fill={SOURCE_COLORS[entry.name] || "#8884d8"} />
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
              <div className={styles.legend}>
                {pieData.map((item) => (
                  <div key={item.name} className={styles.legendItem}>
                    <span className={styles.legendColor} style={{ backgroundColor: SOURCE_COLORS[item.name] }} />
                    <span className={styles.legendLabel}>{item.name}</span>
                    <span className={styles.legendValue}>{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className={styles.emptyText}>No source data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PointsAnalytics;
