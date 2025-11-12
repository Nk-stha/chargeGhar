"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "./points-history.module.css";
import Navbar from "../../../../../components/Navbar/Navbar";
import {
  FiAward,
  FiSearch,
  FiRefreshCw,
  FiAlertCircle,
  FiArrowLeft,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiClock,
  FiFilter,
} from "react-icons/fi";
import Link from "next/link";
import { rewardsService } from "../../../../../lib/api";
import type {
  UserPointsHistory,
  PointsTransaction,
} from "../../../../../types/rewards.types";

const UserPointsHistoryPage: React.FC = () => {
  const params = useParams();
  const userId = params.id as string;

  const [history, setHistory] = useState<UserPointsHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    if (userId) {
      fetchPointsHistory();
    }
  }, [userId, transactionTypeFilter, currentPage]);

  const fetchPointsHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await rewardsService.getUserPointsHistory({
        user_id: Number(userId),
        transaction_type: transactionTypeFilter !== "all" ? transactionTypeFilter as any : undefined,
        page: currentPage,
        page_size: pageSize,
      });

      if (response.success) {
        setHistory(response.data);
      } else {
        setError("Failed to load points history");
      }
    } catch (err: any) {
      console.error("Error fetching points history:", err);
      const errorMessage =
        err.response?.data?.error?.message ||
        "Failed to load points history. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = history?.transactions.filter(
    (transaction) =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transaction_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earned":
        return <FiTrendingUp className={styles.earnedIcon} />;
      case "spent":
        return <FiTrendingDown className={styles.spentIcon} />;
      case "adjustment":
        return <FiActivity className={styles.adjustmentIcon} />;
      default:
        return <FiAward />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "earned":
        return styles.earnedText;
      case "spent":
        return styles.spentText;
      case "adjustment":
        return styles.adjustmentText;
      default:
        return "";
    }
  };

  const getPointsDisplay = (points: number) => {
    const sign = points > 0 ? "+" : "";
    return `${sign}${points.toLocaleString()}`;
  };

  return (
    <div className={styles.pointsHistoryPage}>
      <Navbar />
      <main className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <Link href="/dashboard/users" className={styles.backButton}>
              <FiArrowLeft /> Back to Users
            </Link>
          </div>
          <div className={styles.headerMain}>
            <div>
              <h1 className={styles.title}>User Points History</h1>
              {history && (
                <>
                  <p className={styles.subtitle}>
                    {history.user.username} ({history.user.email})
                  </p>
                  <p className={styles.userId}>User ID: {userId}</p>
                </>
              )}
            </div>
            <button className={styles.refreshBtn} onClick={fetchPointsHistory}>
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className={styles.errorBanner}>
            <FiAlertCircle /> {error}
          </div>
        )}

        {loading ? (
          <div className={styles.loadingContainer}>
            <FiRefreshCw className={styles.spinner} />
            <p>Loading points history...</p>
          </div>
        ) : history ? (
          <>
            {/* Summary Cards */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FiAward />
                </div>
                <div className={styles.statContent}>
                  <p className={styles.statLabel}>Current Balance</p>
                  <h3 className={styles.statValue}>
                    {history.user.current_points.toLocaleString()} pts
                  </h3>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FiTrendingUp />
                </div>
                <div className={styles.statContent}>
                  <p className={styles.statLabel}>Total Earned</p>
                  <h3 className={styles.statValue}>
                    {history.user.total_points_earned.toLocaleString()} pts
                  </h3>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FiTrendingDown />
                </div>
                <div className={styles.statContent}>
                  <p className={styles.statLabel}>Total Transactions</p>
                  <h3 className={styles.statValue}>
                    {history.pagination.total_count.toLocaleString()}
                  </h3>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <FiActivity />
                </div>
                <div className={styles.statContent}>
                  <p className={styles.statLabel}>Current Page</p>
                  <h3 className={styles.statValue}>
                    {history.pagination.current_page} / {history.pagination.total_pages}
                  </h3>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className={styles.controls}>
              <div className={styles.searchContainer}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <FiFilter className={styles.filterIcon} />
                <select
                  className={styles.filterSelect}
                  value={transactionTypeFilter}
                  onChange={(e) => {
                    setTransactionTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="earned">Earned</option>
                  <option value="spent">Spent</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </div>
            </div>

            {/* Transactions Table */}
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <FiClock className={styles.icon} /> Transaction History
                </h2>
                <p className={styles.cardSubText}>
                  Showing {history.transactions.length} of {history.pagination.total_count} transactions
                </p>
              </div>

              {filteredTransactions && filteredTransactions.length === 0 ? (
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
                <>
                  <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Points</th>
                          <th>Description</th>
                          <th>Source</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions?.map((transaction) => (
                          <tr key={transaction.id}>
                            <td>
                              <div className={styles.transactionType}>
                                {getTransactionIcon(transaction.transaction_type)}
                                <span className={getTransactionColor(transaction.transaction_type)}>
                                  {transaction.transaction_type}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`${styles.points} ${getTransactionColor(transaction.transaction_type)}`}
                              >
                                {getPointsDisplay(transaction.points)}
                              </span>
                            </td>
                            <td className={styles.description}>
                              {transaction.description}
                            </td>
                            <td className={styles.source}>
                              {transaction.source || "-"}
                            </td>
                            <td className={styles.date}>
                              {formatDate(transaction.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {history.pagination.total_pages > 1 && (
                    <div className={styles.pagination}>
                      <button
                        className={styles.pageBtn}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      <span className={styles.pageInfo}>
                        Page {currentPage} of {history.pagination.total_pages}
                      </span>
                      <button
                        className={styles.pageBtn}
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(history.pagination.total_pages, p + 1)
                          )
                        }
                        disabled={currentPage === history.pagination.total_pages}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        ) : (
          <div className={styles.emptyState}>
            <FiAward className={styles.emptyIcon} />
            <p>No points history available</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserPointsHistoryPage;
