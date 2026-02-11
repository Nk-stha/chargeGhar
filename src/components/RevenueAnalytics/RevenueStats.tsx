"use client";

import React from "react";
import { FiFileText, FiDollarSign, FiCreditCard } from "react-icons/fi";
import styles from "./RevenueAnalytics.module.css";
import { RevenueAnalyticsSummary } from "../../types/revenueAnalytics";

interface RevenueStatsProps {
  summary: RevenueAnalyticsSummary;
  loading?: boolean;
}

const RevenueStats: React.FC<RevenueStatsProps> = ({
  summary,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className={styles.statsGrid}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`${styles.statCard} animate-pulse`}>
            <div
              style={{
                width: "3rem",
                height: "3rem",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "0.75rem",
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: "0.75rem",
                  width: "60%",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "0.25rem",
                  marginBottom: "0.5rem",
                }}
              />
              <div
                style={{
                  height: "1.5rem",
                  width: "40%",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "0.25rem",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const formatAmount = (amount: number) => amount.toFixed(2);

  return (
    <div className={styles.statsGrid}>
      {/* Total Transactions */}
      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <FiFileText />
        </div>
        <div>
          <p className={styles.statLabel}>Total Transactions</p>
          <p className={styles.statValue}>{summary.total_transactions}</p>
        </div>
      </div>

      {/* Total Gross Revenue */}
      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <FiDollarSign />
        </div>
        <div>
          <p className={styles.statLabel}>Total Gross Revenue</p>
          <p className={styles.statValue}>
            <span className={styles.statCurrency}>NPR</span>
            {formatAmount(summary.total_gross)}
          </p>
        </div>
      </div>

      {/* Total VAT Collected */}
      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <FiCreditCard />
        </div>
        <div>
          <p className={styles.statLabel}>Total VAT Collected</p>
          <p className={styles.statValue}>
            <span className={styles.statCurrency}>NPR</span>
            {formatAmount(summary.total_vat)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevenueStats;
