"use client";

import React, { useState, useEffect } from "react";
import styles from "./referrals.module.css";
import Navbar from "../../../components/Navbar/Navbar";
import {
  FiUsers,
  FiSearch,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiTrendingUp,
  FiClock,
  FiX,
  FiXCircle,
  FiUserCheck,
  FiAward,
} from "react-icons/fi";
import { rewardsService } from "../../../lib/api";
import type { ReferralsAnalytics } from "../../../types/rewards.types";

const ReferralsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<ReferralsAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchReferralsAnalytics();
  }, []);

  const fetchReferralsAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await rewardsService.getReferralsAnalytics();

      if (response.success) {
        setAnalytics(response.data);
      } else {
        setError("Failed to load referrals analytics");
      }
    } catch (err: any) {
      console.error("Error fetching referrals analytics:", err);
      const errorMessage =
        err.response?.data?.error?.message ||
        "Failed to load referrals analytics. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredTopReferrers = analytics?.top_referrers.filter((referrer) =>
    referrer.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Referrals</h1>
          <p className={styles.subtitle}>
            Track and manage user referrals and rewards
          </p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchReferralsAnalytics}>
          <FiRefreshCw /> Refresh
        </button>
      </header>

      {successMessage && (
        <div className={styles.successBanner}>
          <FiCheckCircle /> {successMessage}
          <button
            className={styles.closeError}
            onClick={() => setSuccessMessage(null)}
          >
            <FiX />
          </button>
        </div>
      )}

      {error && (
        <div className={styles.errorBanner}>
          <FiAlertCircle /> {error}
          <button
            className={styles.closeError}
            onClick={() => setError(null)}
          >
            <FiX />
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles.loadingContainer}>
          <FiRefreshCw className={styles.spinner} />
          <p>Loading referrals analytics...</p>
        </div>
      ) : analytics ? (
        <>
          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FiUsers />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Total Referrals</p>
                <h3 className={styles.statValue}>
                  {analytics.total_referrals.toLocaleString()}
                </h3>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FiCheckCircle />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Successful</p>
                <h3 className={styles.statValue}>
                  {analytics.successful_referrals.toLocaleString()}
                </h3>
                <p className={styles.statSubtext}>
                  {analytics.conversion_rate.toFixed(1)}% conversion
                </p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FiClock />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Pending</p>
                <h3 className={styles.statValue}>
                  {analytics.pending_referrals.toLocaleString()}
                </h3>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FiXCircle />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Expired</p>
                <h3 className={styles.statValue}>
                  {analytics.expired_referrals.toLocaleString()}
                </h3>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>
                <FiAward />
              </div>
              <div className={styles.metricContent}>
                <p className={styles.metricLabel}>Total Points Awarded</p>
                <h3 className={styles.metricValue}>
                  {analytics.total_points_awarded.toLocaleString()} pts
                </h3>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>
                <FiTrendingUp />
              </div>
              <div className={styles.metricContent}>
                <p className={styles.metricLabel}>Avg. Time to Complete</p>
                <h3 className={styles.metricValue}>
                  {analytics.average_time_to_complete}
                </h3>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>
                <FiUserCheck />
              </div>
              <div className={styles.metricContent}>
                <p className={styles.metricLabel}>Conversion Rate</p>
                <h3 className={styles.metricValue}>
                  {analytics.conversion_rate.toFixed(1)}%
                </h3>
              </div>
            </div>
          </div>

          {/* Top Referrers Section */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <FiTrendingUp className={styles.icon} /> Top Referrers
              </h2>
              <p className={styles.cardSubText}>
                Users with the most successful referrals
              </p>
            </div>

            <div className={styles.controls}>
              <div className={styles.searchContainer}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>

            {filteredTopReferrers && filteredTopReferrers.length === 0 ? (
              <div className={styles.emptyState}>
                <FiUsers className={styles.emptyIcon} />
                <p>No referrers found</p>
                {searchTerm && (
                  <button
                    className={styles.clearSearch}
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Username</th>
                      <th>Total Referrals</th>
                      <th>Success Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTopReferrers?.map((referrer, index) => (
                      <tr key={referrer.user_id}>
                        <td>
                          <span className={styles.rank}>#{index + 1}</span>
                        </td>
                        <td>
                          <span className={styles.username}>
                            {referrer.username}
                          </span>
                        </td>
                        <td>
                          <span className={styles.referralCount}>
                            {referrer.referral_count.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className={styles.successRate}>
                            {analytics.total_referrals > 0
                              ? (
                                (referrer.referral_count /
                                  analytics.total_referrals) *
                                100
                              ).toFixed(1)
                              : 0}
                            %
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Referral Status Breakdown */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <FiUsers className={styles.icon} /> Referral Status Breakdown
              </h2>
              <p className={styles.cardSubText}>
                Overview of referral statuses
              </p>
            </div>

            <div className={styles.breakdownGrid}>
              <div className={styles.breakdownCard}>
                <div className={styles.breakdownIconSuccess}>
                  <FiCheckCircle />
                </div>
                <div className={styles.breakdownContent}>
                  <p className={styles.breakdownLabel}>Successful</p>
                  <h3 className={styles.breakdownValue}>
                    {analytics.successful_referrals.toLocaleString()}
                  </h3>
                  <p className={styles.breakdownPercentage}>
                    {analytics.total_referrals > 0
                      ? (
                        (analytics.successful_referrals /
                          analytics.total_referrals) *
                        100
                      ).toFixed(1)
                      : 0}
                    % of total
                  </p>
                </div>
              </div>

              <div className={styles.breakdownCard}>
                <div className={styles.breakdownIconPending}>
                  <FiClock />
                </div>
                <div className={styles.breakdownContent}>
                  <p className={styles.breakdownLabel}>Pending</p>
                  <h3 className={styles.breakdownValue}>
                    {analytics.pending_referrals.toLocaleString()}
                  </h3>
                  <p className={styles.breakdownPercentage}>
                    {analytics.total_referrals > 0
                      ? (
                        (analytics.pending_referrals /
                          analytics.total_referrals) *
                        100
                      ).toFixed(1)
                      : 0}
                    % of total
                  </p>
                </div>
              </div>

              <div className={styles.breakdownCard}>
                <div className={styles.breakdownIconExpired}>
                  <FiXCircle />
                </div>
                <div className={styles.breakdownContent}>
                  <p className={styles.breakdownLabel}>Expired</p>
                  <h3 className={styles.breakdownValue}>
                    {analytics.expired_referrals.toLocaleString()}
                  </h3>
                  <p className={styles.breakdownPercentage}>
                    {analytics.total_referrals > 0
                      ? (
                        (analytics.expired_referrals /
                          analytics.total_referrals) *
                        100
                      ).toFixed(1)
                      : 0}
                    % of total
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Info Card */}
          <div className={styles.infoCard}>
            <FiAlertCircle className={styles.infoIcon} />
            <div className={styles.infoContent}>
              <h4>About Referrals</h4>
              <p>
                Users earn points when they successfully refer friends who complete
                their first rental. Track referral performance and manage the
                referral program from this dashboard.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.emptyState}>
          <FiUsers className={styles.emptyIcon} />
          <p>No referrals data available</p>
        </div>
      )}
    </div>
  );
};

export default ReferralsPage;
