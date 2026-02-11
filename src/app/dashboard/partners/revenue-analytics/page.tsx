"use client";

import React, { useState, useCallback } from "react";
import { RevenueStats, RevenueList } from "@/components/RevenueAnalytics";
import { RevenueAnalyticsSummary } from "@/types/revenueAnalytics";
import styles from "./revenueAnalytics.module.css";

const DEFAULT_SUMMARY: RevenueAnalyticsSummary = {
  total_transactions: 0,
  total_gross: 0,
  total_vat: 0,
  total_service_charge: 0,
  total_net: 0,
  total_chargeghar_share: 0,
  total_franchise_share: 0,
  total_vendor_share: 0,
};

export default function RevenueAnalyticsPage() {
  const [summary, setSummary] = useState<RevenueAnalyticsSummary>(DEFAULT_SUMMARY);
  const [loading, setLoading] = useState(true);

  const handleSummaryUpdate = useCallback((data: RevenueAnalyticsSummary) => {
    setSummary(data);
    setLoading(false);
  }, []);

  return (
    <div className={styles.pageContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Revenue Analytics</h1>
          <p className={styles.pageSubtitle}>
            Detailed breakdown of rental transactions and revenue distribution
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.statsSection}>
        <RevenueStats summary={summary} loading={loading} />
      </div>

      {/* List Section */}
      <div className={styles.listSection}>
        <RevenueList onSummaryUpdate={handleSummaryUpdate} />
      </div>
    </div>
  );
}
