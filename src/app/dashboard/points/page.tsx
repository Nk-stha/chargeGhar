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
} from "react-icons/fi";

interface PointsTransaction {
  id: string;
  user_id: string;
  username: string;
  points: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

interface PointsStats {
  total_points_issued: number;
  total_active_users: number;
  average_points_per_user: number;
  total_points_redeemed: number;
}

const PointsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    PointsTransaction[]
  >([]);
  const [stats, setStats] = useState<PointsStats>({
    total_points_issued: 0,
    total_active_users: 0,
    average_points_per_user: 0,
    total_points_redeemed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPointsData();
  }, []);

  useEffect(() => {
    if (!Array.isArray(transactions)) {
      setFilteredTransactions([]);
      return;
    }

    if (searchTerm) {
      const filtered = transactions.filter(
        (transaction) =>
          transaction?.username
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction?.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction?.transaction_type
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [searchTerm, transactions]);

  const fetchPointsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulated data - replace with actual API call
      // const response = await axiosInstance.get("/api/admin/points");

      // Mock data for demonstration
      const mockTransactions: PointsTransaction[] = [
        {
          id: "1",
          user_id: "user1",
          username: "john_doe",
          points: 500,
          transaction_type: "EARNED",
          description: "Rental completion bonus",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          user_id: "user2",
          username: "jane_smith",
          points: -200,
          transaction_type: "REDEEMED",
          description: "Coupon redemption",
          created_at: new Date().toISOString(),
        },
        {
          id: "3",
          user_id: "user3",
          username: "mike_wilson",
          points: 1000,
          transaction_type: "EARNED",
          description: "Referral bonus",
          created_at: new Date().toISOString(),
        },
      ];

      const mockStats: PointsStats = {
        total_points_issued: 15420,
        total_active_users: 248,
        average_points_per_user: 62,
        total_points_redeemed: 8750,
      };

      const transactionsData = Array.isArray(mockTransactions)
        ? mockTransactions
        : [];
      setTransactions(transactionsData);
      setFilteredTransactions(transactionsData);
      setStats(mockStats);
    } catch (err: any) {
      console.error("Error fetching points data:", err);
      setError("Failed to load points data. Please try again.");
      setTransactions([]);
      setFilteredTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionColor = (type: string) => {
    return type === "EARNED" ? styles.pointsEarned : styles.pointsRedeemed;
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
          </div>
          <button
            className={styles.addButton}
            onClick={() => alert("Add points feature coming soon")}
          >
            <FiPlus /> Award Points
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
          </div>
        )}

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiAward />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Total Points Issued</p>
              <h3 className={styles.statValue}>
                {stats.total_points_issued.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiUsers />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Active Users</p>
              <h3 className={styles.statValue}>
                {stats.total_active_users.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiTrendingUp />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Avg Points/User</p>
              <h3 className={styles.statValue}>
                {stats.average_points_per_user}
              </h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiCheckCircle />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Points Redeemed</p>
              <h3 className={styles.statValue}>
                {stats.total_points_redeemed.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by username, type or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button className={styles.refreshBtn} onClick={fetchPointsData}>
            <FiRefreshCw />
          </button>
        </div>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <FiAward className={styles.icon} /> Points Transactions
            </div>
            <p className={styles.cardSubText}>
              Recent points earned and redeemed by users
            </p>
          </div>

          {loading ? (
            <div className={styles.loadingContainer}>
              <FiRefreshCw className={styles.spinner} />
              <p>Loading points data...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className={styles.emptyState}>
              <FiAward className={styles.emptyIcon} />
              <p>No transactions found</p>
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
                    <th>Username</th>
                    <th>Points</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(filteredTransactions) &&
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>
                          <span className={styles.username}>
                            {transaction.username}
                          </span>
                        </td>
                        <td>
                          <span
                            className={getTransactionColor(
                              transaction.transaction_type,
                            )}
                          >
                            {transaction.points > 0 ? "+" : ""}
                            {transaction.points} pts
                          </span>
                        </td>
                        <td>
                          <span className={styles.transactionType}>
                            {transaction.transaction_type}
                          </span>
                        </td>
                        <td className={styles.description}>
                          {transaction.description}
                        </td>
                        <td className={styles.date}>
                          {formatDate(transaction.created_at)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PointsPage;
