"use client";

import React, { useState, useEffect } from "react";
import styles from "./points.module.css";
import Navbar from "../../../components/Navbar/Navbar";
import {
  FiAward,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiUsers,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiMinus,
  FiX,
} from "react-icons/fi";
import { rewardsService } from "../../../lib/api";
import type {
  PointsAnalytics,
  AdjustPointsInput,
  AdjustmentType,
} from "../../../types/rewards.types";

const PointsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<PointsAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    user_id: "",
    adjustment_type: "add" as AdjustmentType,
    points: "",
    reason: "",
  });
  const [adjustmentLoading, setAdjustmentLoading] = useState(false);

  useEffect(() => {
    fetchPointsAnalytics();
  }, []);

  const fetchPointsAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await rewardsService.getPointsAnalytics();

      if (response.success) {
        setAnalytics(response.data);
      } else {
        setError("Failed to load points analytics");
      }
    } catch (err: any) {
      console.error("Error fetching points analytics:", err);
      const errorMessage =
        err.response?.data?.error?.message ||
        "Failed to load points analytics. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustPoints = async (e: React.FormEvent) => {
    e.preventDefault();

    const input: AdjustPointsInput = {
      user_id: Number(adjustmentForm.user_id),
      adjustment_type: adjustmentForm.adjustment_type,
      points: Number(adjustmentForm.points),
      reason: adjustmentForm.reason,
    };

    // Validate input
    const validation = rewardsService.validateAdjustPoints(input);
    if (!validation.valid) {
      setError(validation.error || "Invalid input");
      return;
    }

    try {
      setAdjustmentLoading(true);
      setError(null);

      const response = await rewardsService.adjustUserPoints(input);

      if (response.success) {
        setSuccessMessage(
          `Successfully ${input.adjustment_type === "add" ? "added" : "deducted"} ${input.points} points ${input.adjustment_type === "add" ? "to" : "from"} user ${response.data.username}`,
        );
        setShowAdjustModal(false);
        setAdjustmentForm({
          user_id: "",
          adjustment_type: "add",
          points: "",
          reason: "",
        });
        // Refresh analytics
        fetchPointsAnalytics();

        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setError("Failed to adjust points");
      }
    } catch (err: any) {
      console.error("Error adjusting points:", err);
      const errorMessage =
        err.response?.data?.error?.message ||
        "Failed to adjust points. Please try again.";
      setError(errorMessage);
    } finally {
      setAdjustmentLoading(false);
    }
  };

  const filteredTopEarners = analytics?.top_earners.filter((earner) =>
    earner.username.toLowerCase().includes(searchTerm.toLowerCase()),
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
    <div className={styles.pointsPage}>
      <Navbar />
      <main className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Points Management</h1>
            <p className={styles.subtitle}>
              Track and manage user points and rewards
            </p>
            {analytics?.period &&
              analytics.period.start_date &&
              analytics.period.end_date && (
                <p className={styles.dateRange}>
                  Period: {formatDate(analytics.period.start_date)} -{" "}
                  {formatDate(analytics.period.end_date)}
                </p>
              )}
          </div>
          <button
            className={styles.addButton}
            onClick={() => setShowAdjustModal(true)}
          >
            <FiPlus /> Adjust Points
          </button>
        </header>

        {successMessage && (
          <div className={styles.successBanner}>
            <FiCheckCircle /> {successMessage}
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
            <p>Loading points analytics...</p>
          </div>
        ) : analytics ? (
          <>
            {/* Summary Stats Cards */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FiAward />
                </div>
                <div className={styles.statContent}>
                  <p className={styles.statLabel}>Total Points Earned</p>
                  <h3 className={styles.statValue}>
                    {analytics.earned.total_points.toLocaleString()}
                  </h3>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FiTrendingDown />
                </div>
                <div className={styles.statContent}>
                  <p className={styles.statLabel}>Total Points Spent</p>
                  <h3 className={styles.statValue}>
                    {analytics.spent.total_points.toLocaleString()}
                  </h3>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FiActivity />
                </div>
                <div className={styles.statContent}>
                  <p className={styles.statLabel}>Net Points</p>
                  <h3 className={styles.statValue}>
                    {(
                      analytics.earned.total_points -
                      analytics.spent.total_points
                    ).toLocaleString()}
                  </h3>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FiTrendingUp />
                </div>
                <div className={styles.statContent}>
                  <p className={styles.statLabel}>Total Transactions</p>
                  <h3 className={styles.statValue}>
                    {analytics.total_transactions.toLocaleString()}
                  </h3>
                </div>
              </div>
            </div>

            {/* Transaction Breakdown */}
            <div className={styles.breakdownSection}>
              <h2 className={styles.sectionTitle}>Transaction Breakdown</h2>
              <div className={styles.breakdownGrid}>
                <div className={styles.breakdownCard}>
                  <div className={styles.breakdownIcon}>
                    <FiTrendingUp />
                  </div>
                  <div className={styles.breakdownContent}>
                    <p className={styles.breakdownLabel}>Earned</p>
                    <h3 className={styles.breakdownValue}>
                      {analytics.earned.total_points.toLocaleString()}
                    </h3>
                    <p className={styles.breakdownSubtext}>
                      {analytics.earned.transaction_count} transactions
                    </p>
                  </div>
                </div>

                <div className={styles.breakdownCard}>
                  <div className={styles.breakdownIcon}>
                    <FiTrendingDown />
                  </div>
                  <div className={styles.breakdownContent}>
                    <p className={styles.breakdownLabel}>Spent</p>
                    <h3 className={styles.breakdownValue}>
                      {analytics.spent.total_points.toLocaleString()}
                    </h3>
                    <p className={styles.breakdownSubtext}>
                      {analytics.spent.transaction_count} transactions
                    </p>
                  </div>
                </div>

                <div className={styles.breakdownCard}>
                  <div className={styles.breakdownIcon}>
                    <FiActivity />
                  </div>
                  <div className={styles.breakdownContent}>
                    <p className={styles.breakdownLabel}>Adjustments</p>
                    <h3 className={styles.breakdownValue}>
                      {analytics.adjustments.total_points.toLocaleString()}
                    </h3>
                    <p className={styles.breakdownSubtext}>
                      {analytics.adjustments.transaction_count} transactions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Points by Source */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <FiAward className={styles.icon} /> Points by Source
                </h2>
                <p className={styles.cardSubText}>
                  Distribution of points across different sources
                </p>
              </div>
              <div className={styles.sourceGrid}>
                {analytics.source_breakdown.map((item, index) => (
                  <div key={index} className={styles.sourceItem}>
                    <p className={styles.sourceLabel}>
                      {item.source
                        .replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                    <p className={styles.sourceValue}>
                      {item.total_points.toLocaleString()} pts
                    </p>
                    <p className={styles.sourceCount}>
                      {item.transaction_count} transactions
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Earners */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <FiTrendingUp className={styles.icon} /> Top Earners
                </div>
                <p className={styles.cardSubText}>
                  Users with the highest points earned
                </p>
              </div>

              <div className={styles.controls}>
                <div className={styles.searchContainer}>
                  <FiSearch className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search by username or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
                <button
                  className={styles.refreshBtn}
                  onClick={fetchPointsAnalytics}
                >
                  <FiRefreshCw />
                </button>
              </div>

              {filteredTopEarners && filteredTopEarners.length === 0 ? (
                <div className={styles.emptyState}>
                  <FiAward className={styles.emptyIcon} />
                  <p>No top earners found</p>
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
                        <th>User ID</th>
                        <th>Total Points Earned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTopEarners?.map((earner, index) => (
                        <tr key={earner.user_id}>
                          <td>{index + 1}</td>
                          <td>
                            <span className={styles.username}>
                              {earner.username}
                            </span>
                          </td>
                          <td>
                            <span className={styles.userId}>
                              ID: {earner.user_id}
                            </span>
                          </td>
                          <td>
                            <span className={styles.points}>
                              {earner.total_earned.toLocaleString()} pts
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : (
          <div className={styles.emptyState}>
            <FiAward className={styles.emptyIcon} />
            <p>No points data available</p>
          </div>
        )}

        {/* Adjust Points Modal */}
        {showAdjustModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowAdjustModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Adjust User Points</h2>
                <button
                  className={styles.closeModal}
                  onClick={() => setShowAdjustModal(false)}
                >
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleAdjustPoints} className={styles.modalForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="user_id">User ID *</label>
                  <input
                    type="number"
                    id="user_id"
                    value={adjustmentForm.user_id}
                    onChange={(e) =>
                      setAdjustmentForm({
                        ...adjustmentForm,
                        user_id: e.target.value,
                      })
                    }
                    placeholder="Enter user ID"
                    required
                    min="1"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="adjustment_type">Adjustment Type *</label>
                  <select
                    id="adjustment_type"
                    value={adjustmentForm.adjustment_type}
                    onChange={(e) =>
                      setAdjustmentForm({
                        ...adjustmentForm,
                        adjustment_type: e.target.value as AdjustmentType,
                      })
                    }
                    required
                  >
                    <option value="add">Add Points</option>
                    <option value="deduct">Deduct Points</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="points">Points *</label>
                  <input
                    type="number"
                    id="points"
                    value={adjustmentForm.points}
                    onChange={(e) =>
                      setAdjustmentForm({
                        ...adjustmentForm,
                        points: e.target.value,
                      })
                    }
                    placeholder="Enter points amount"
                    required
                    min="1"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="reason">Reason *</label>
                  <textarea
                    id="reason"
                    value={adjustmentForm.reason}
                    onChange={(e) =>
                      setAdjustmentForm({
                        ...adjustmentForm,
                        reason: e.target.value,
                      })
                    }
                    placeholder="Enter reason for adjustment (min 3 characters)"
                    required
                    rows={3}
                    minLength={3}
                  />
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowAdjustModal(false)}
                    disabled={adjustmentLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={adjustmentLoading}
                  >
                    {adjustmentLoading ? (
                      <>
                        <FiRefreshCw className={styles.spin} /> Processing...
                      </>
                    ) : (
                      <>
                        {adjustmentForm.adjustment_type === "add" ? (
                          <FiPlus />
                        ) : (
                          <FiMinus />
                        )}{" "}
                        {adjustmentForm.adjustment_type === "add"
                          ? "Add Points"
                          : "Deduct Points"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PointsPage;
