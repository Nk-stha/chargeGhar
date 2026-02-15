"use client";

import React, { useState, useEffect } from "react";
import styles from "./ReferralsAnalytics.module.css";
import { FiUsers, FiTrendingUp, FiAward, FiLoader, FiXCircle } from "react-icons/fi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axiosInstance from "@/lib/axios";

interface ReferralsAnalyticsData {
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  expired_referrals: number;
  conversion_rate: number;
  total_points_awarded: number;
  average_time_to_complete: number;
  top_referrers: Array<{
    user_id: string;
    username: string;
    referral_count: number;
  }>;
  monthly_breakdown: Array<{
    month: string;
    referrals: number;
    successful: number;
  }>;
}

const ReferralsAnalytics: React.FC = () => {
  const [data, setData] = useState<ReferralsAnalyticsData | null>(null);
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
      const response = await axiosInstance.get("/api/admin/referrals/analytics", {
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
          <p>Loading referrals analytics...</p>
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

  const trendData = data.monthly_breakdown?.map((item) => ({
    month: item?.month ?? "",
    referrals: item?.referrals ?? 0,
    successful: item?.successful ?? 0,
  })) ?? [];

  const topReferrers = data.top_referrers ?? [];

  // Calculate dynamic height for bar chart based on data length
  const chartHeight = Math.max(250, trendData.length * 40);

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
        <FiUsers /> Referrals Analytics
      </h2>
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.borderTotal}`}>
          <p className={styles.statLabel}>Total Referrals</p>
          <p className={styles.statValue}>{data.total_referrals ?? 0}</p>
        </div>

        <div className={`${styles.statCard} ${styles.borderConversion}`}>
          <p className={styles.statLabel}>Conversion Rate</p>
          <p className={styles.statValue}>{data.conversion_rate ?? 0}%</p>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.sectionTitle}>
            <FiTrendingUp /> Referral Trend
          </h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis 
                    dataKey="month" 
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
                      if (name === "referrals") return [value, "Total Referrals"];
                      if (name === "successful") return [value, "Successful"];
                      return [value, name];
                    }}
                  />
                  <Line type="monotone" dataKey="referrals" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
                  <Line type="monotone" dataKey="successful" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
          ) : (
            <p className={styles.emptyText}>No monthly data available</p>
          )}
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.sectionTitle}>
            <FiAward /> Top Referrers
          </h3>
          <div className={styles.topReferrers}>
            {topReferrers.length > 0 ? (
              topReferrers.map((referrer, index) => (
                <div key={referrer?.user_id ?? index} className={styles.referrerItem}>
                  <div className={styles.referrerRank}>#{index + 1}</div>
                  <div className={styles.referrerInfo}>
                    <p className={styles.referrerName}>{referrer?.username ?? "Unknown"}</p>
                    <p className={styles.referrerStats}>
                      {referrer?.referral_count ?? 0} referrals
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>No referrers yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralsAnalytics;
