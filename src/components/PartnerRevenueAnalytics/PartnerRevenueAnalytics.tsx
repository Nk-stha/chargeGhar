"use client";

import React, { useState, useEffect } from "react";
import styles from "./PartnerRevenueAnalytics.module.css";
import { FiBriefcase, FiTrendingUp, FiLoader, FiXCircle } from "react-icons/fi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axiosInstance from "@/lib/axios";

interface RevenueTransaction {
  id: string;
  created_at: string;
  gross_amount: string;
  net_amount: string;
  chargeghar_share: string;
  franchise_share: string;
  vendor_share: string;
  franchise_code: string | null;
  franchise_name: string | null;
  vendor_code: string | null;
  vendor_name: string | null;
}

interface RevenueSummary {
  total_transactions: number;
  total_gross: number;
  total_net: number;
  total_chargeghar_share: number;
  total_franchise_share: number;
  total_vendor_share: number;
}

interface PartnerRevenueData {
  results: RevenueTransaction[];
  summary: RevenueSummary;
}

const PartnerRevenueAnalytics: React.FC = () => {
  const [data, setData] = useState<PartnerRevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createdDate, setCreatedDate] = useState<string>("");

  useEffect(() => {
    fetchAnalytics();
  }, [createdDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.get("/api/admin/partners/revenue-analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response?.data?.success) {
        let transactions = response.data.data.results;
        
        // Filter by created_at on frontend if date is selected
        if (createdDate) {
          transactions = transactions.filter((transaction: RevenueTransaction) => {
            const transactionDate = new Date(transaction.created_at).toISOString().split('T')[0];
            return transactionDate === createdDate;
          });
          
          // Recalculate summary for filtered data
          const filteredSummary = {
            total_transactions: transactions.length,
            total_gross: transactions.reduce((sum: number, t: RevenueTransaction) => sum + parseFloat(t.gross_amount || "0"), 0),
            total_net: transactions.reduce((sum: number, t: RevenueTransaction) => sum + parseFloat(t.net_amount || "0"), 0),
            total_chargeghar_share: transactions.reduce((sum: number, t: RevenueTransaction) => sum + parseFloat(t.chargeghar_share || "0"), 0),
            total_franchise_share: transactions.reduce((sum: number, t: RevenueTransaction) => sum + parseFloat(t.franchise_share || "0"), 0),
            total_vendor_share: transactions.reduce((sum: number, t: RevenueTransaction) => sum + parseFloat(t.vendor_share || "0"), 0),
          };
          
          setData({
            results: transactions,
            summary: filteredSummary,
          });
        } else {
          setData(response.data.data);
        }
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
          <p>Loading partner revenue analytics...</p>
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

  // Calculate partner statistics from transaction data
  const partnerMap = new Map<string, { name: string; revenue: number; transactions: number }>();
  
  data.results?.forEach((transaction) => {
    // Process franchise partners
    if (transaction.franchise_code && transaction.franchise_name) {
      const key = transaction.franchise_code;
      const existing = partnerMap.get(key) || { name: transaction.franchise_name, revenue: 0, transactions: 0 };
      existing.revenue += parseFloat(transaction.franchise_share || "0");
      existing.transactions += 1;
      partnerMap.set(key, existing);
    }
    
    // Process vendor partners
    if (transaction.vendor_code && transaction.vendor_name) {
      const key = transaction.vendor_code;
      const existing = partnerMap.get(key) || { name: transaction.vendor_name, revenue: 0, transactions: 0 };
      existing.revenue += parseFloat(transaction.vendor_share || "0");
      existing.transactions += 1;
      partnerMap.set(key, existing);
    }
  });

  const topPartners = Array.from(partnerMap.entries())
    .map(([code, data]) => ({
      partner_code: code,
      partner_name: data.name,
      revenue: data.revenue.toFixed(2),
      transaction_count: data.transactions,
    }))
    .sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue))
    .slice(0, 5);

  // Calculate revenue trend by date
  const trendMap = new Map<string, number>();
  data.results?.forEach((transaction) => {
    const date = transaction.created_at?.split('T')[0] || "";
    if (date) {
      const existing = trendMap.get(date) || 0;
      const revenue = parseFloat(transaction.franchise_share || "0") + parseFloat(transaction.vendor_share || "0");
      trendMap.set(date, existing + revenue);
    }
  });

  const trendData = Array.from(trendMap.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7); // Last 7 days

  // Calculate dynamic height for line chart based on data length
  const chartHeight = Math.max(250, trendData.length * 40);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <FiBriefcase /> Partner Revenue Analytics
        </h2>
        <div className={styles.dateFilter}>
          <label htmlFor="revenueCreatedDate" className={styles.dateLabel}>Date:</label>
          <input
            type="date"
            id="revenueCreatedDate"
            value={createdDate}
            onChange={(e) => setCreatedDate(e.target.value)}
            className={styles.dateInput}
          />
          {createdDate && (
            <button
              type="button"
              onClick={() => setCreatedDate("")}
              className={styles.clearDateBtn}
              title="Clear date filter"
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.borderTotal}`}>
          <p className={styles.statLabel}>Total Partners</p>
          <p className={styles.statValue}>{partnerMap.size}</p>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3 className={styles.sectionTitle}>
            <FiTrendingUp /> Revenue Trend (Last 7 Days)
          </h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    formatter={(value: any) => [`NPR ${parseFloat(value).toFixed(2)}`, "Revenue"]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
          ) : (
            <p className={styles.emptyText}>No trend data available</p>
          )}
        </div>

        <div className={styles.chartCard}>
          <h3 className={styles.sectionTitle}>
            <FiBriefcase /> Top Earning Partners
          </h3>
          <div className={styles.topPartners}>
            {topPartners.length > 0 ? (
              topPartners.map((partner, index) => (
                <div key={partner?.partner_code ?? index} className={styles.partnerItem}>
                  <div className={styles.partnerRank}>#{index + 1}</div>
                  <div className={styles.partnerInfo}>
                    <p className={styles.partnerName}>{partner?.partner_name ?? "Unknown"}</p>
                    <p className={styles.partnerStats}>
                      NPR {partner?.revenue ?? "0"} • {partner?.transaction_count ?? 0} transactions
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>No partner data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerRevenueAnalytics;
