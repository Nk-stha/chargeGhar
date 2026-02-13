"use client";

import React, { useState, useEffect } from "react";
import styles from "./PowerBankPerformance.module.css";
import { FiTrendingUp, FiMapPin, FiDollarSign, FiActivity, FiLoader } from "react-icons/fi";
import { powerBankService } from "../../lib/api/powerbank.service";
import { AnalyticsData } from "../../types/powerbank.types";

const PowerBankPerformance: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await powerBankService.getAnalytics();
        if (response.success) {
          setAnalytics(response.data);
        } else {
          setError("Failed to load analytics");
        }
      } catch (err) {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <FiLoader className={styles.spinner} />
          <p>Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p>{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <FiTrendingUp /> PowerBank Performance
        </h2>
      </div>

      <div className={styles.content}>
        {/* Performance Metrics */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(130, 234, 128, 0.1)", color: "#82ea80" }}>
              <FiActivity />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Utilization Rate</span>
              <span 
                className={styles.metricValue}
                style={{ color: powerBankService.getUtilizationColor(analytics.utilization.utilization_rate) }}
              >
                {analytics.utilization.utilization_rate}%
              </span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
              <FiTrendingUp />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Total Rentals</span>
              <span className={styles.metricValue}>{analytics.utilization.total_rentals}</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
              <FiDollarSign />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Total Revenue</span>
              <span className={styles.metricValue}>
                {powerBankService.formatCurrency(analytics.utilization.total_revenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <FiTrendingUp /> Top Performers
          </h3>
          <div className={styles.performersList}>
            {analytics.top_performers.slice(0, 5).map((performer, index) => (
              <div key={performer.serial_number} className={styles.performerItem}>
                <span className={styles.performerRank}>#{index + 1}</span>
                <div className={styles.performerInfo}>
                  <span className={styles.performerSerial}>{performer.serial_number}</span>
                  <span className={styles.performerModel}>{performer.model}</span>
                </div>
                <div className={styles.performerStats}>
                  <span className={styles.performerRentals}>{performer.rental_count} rentals</span>
                  <span className={styles.performerRevenue}>
                    {powerBankService.formatCurrency(performer.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Station Distribution */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <FiMapPin /> Station Distribution
          </h3>
          <div className={styles.distributionList}>
            {analytics.station_distribution.slice(0, 6).map((dist) => (
              <div key={dist.station} className={styles.distributionItem}>
                <span className={styles.distributionStation}>{dist.station}</span>
                <div className={styles.distributionBar}>
                  <div
                    className={styles.distributionFill}
                    style={{
                      width: `${(dist.count / analytics.overview.total_powerbanks) * 100}%`,
                    }}
                  />
                </div>
                <span className={styles.distributionCount}>{dist.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerBankPerformance;
