"use client";

import React, { useState, useEffect } from "react";
import styles from "./AchievementsAnalytics.module.css";
import { FiAward, FiTarget, FiLoader, FiXCircle } from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import axiosInstance from "@/lib/axios";

interface AchievementsAnalyticsData {
  total_achievements: number;
  active_achievements: number;
  inactive_achievements: number;
  user_achievements: {
    total_unlocked: number;
    total_claimed: number;
    pending_claims: number;
    claim_rate: number;
  };
  total_points_awarded: number;
  most_unlocked_achievements: Array<{
    achievement_id: string;
    name: string;
    unlock_count: number;
    reward_value: number;
  }>;
  completion_by_criteria_type: Array<{
    criteria_type: string;
    total_achievements: number;
    total_unlocked: number;
    total_claimed: number;
    unlock_rate: number;
    claim_rate: number;
  }>;
}

const CRITERIA_COLORS: Record<string, string> = {
  rental_count: "#3b82f6",
  timely_return_count: "#10b981",
  referral_count: "#f59e0b",
  OTHER: "#6b7280",
};

const AchievementsAnalytics: React.FC = () => {
  const [data, setData] = useState<AchievementsAnalyticsData | null>(null);
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
      const response = await axiosInstance.get("/api/admin/achievements/analytics", {
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
          <p>Loading achievements analytics...</p>
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

  const pieData = data.completion_by_criteria_type?.map((item) => ({
    name: item?.criteria_type ?? "Unknown",
    value: item?.total_unlocked ?? 0,
    unlock_rate: item?.unlock_rate ?? 0,
  })) ?? [];

  const popularAchievements = data.most_unlocked_achievements?.slice(0, 5).map((item) => ({
    name: item?.name ?? "Unknown",
    unlock_count: item?.unlock_count ?? 0,
    reward_value: item?.reward_value ?? 0,
  })) ?? [];

  // Calculate dynamic height for bar chart based on data length
  const barChartHeight = Math.max(250, popularAchievements.length * 50);

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
        <FiAward /> Achievements Analytics
      </h2>
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.borderTotal}`}>
          <p className={styles.statLabel}>Total Achievements</p>
          <p className={styles.statValue}>{data.total_achievements ?? 0}</p>
        </div>

        <div className={`${styles.statCard} ${styles.borderCompletion}`}>
          <p className={styles.statLabel}>Claim Rate</p>
          <p className={styles.statValue}>{data.user_achievements?.claim_rate ?? 0}%</p>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.sectionTitle}>
            <FiTarget /> Popular Achievements
          </h3>
          {popularAchievements.length > 0 ? (
            <ResponsiveContainer width="100%" height={barChartHeight}>
                <BarChart data={popularAchievements} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis type="number" stroke="#aaa" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#aaa" 
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === "unlock_count") return [value, "Unlocks"];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="unlock_count" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
          ) : (
            <p className={styles.emptyText}>No achievement data available</p>
          )}
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.sectionTitle}>
            <FiAward /> Completion by Criteria Type
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
                        <Cell key={`cell-${index}`} fill={CRITERIA_COLORS[entry.name] || "#8884d8"} />
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
                    <span className={styles.legendColor} style={{ backgroundColor: CRITERIA_COLORS[item.name] }} />
                    <span className={styles.legendLabel}>{item.name}</span>
                    <span className={styles.legendValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className={styles.emptyText}>No category data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementsAnalytics;
