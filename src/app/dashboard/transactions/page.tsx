"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./transactions.module.css";
import { FiDownload, FiFilter, FiRefreshCw, FiSearch } from "react-icons/fi";
import axiosInstance from "../../../lib/axios";

interface User {
  id: string;
  username?: string;
  email?: string;
}

interface Transaction {
  id: string;
  user: string | User;
  user_phone?: string;
  amount: number;
  payment_method?: string;
  status: string;
  transaction_type?: string;
  created_at: string;
  updated_at?: string;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    results: Transaction[];
    pagination: Pagination;
  };
}

const statusColors: Record<string, string> = {
  SUCCESS: "#47b216",
  COMPLETED: "#47b216",
  PENDING: "#ffc107",
  FAILED: "#dc3545",
  CANCELLED: "#6c757d",
};

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("page_size", "50");

      if (filter !== "All") {
        params.append("status", filter.toUpperCase());
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await axiosInstance.get<ApiResponse>(
        `/api/admin/transactions?${params.toString()}`,
      );

      if (response.data.success) {
        setTransactions(response.data.data.results);
        setPagination(response.data.data.pagination);
      } else {
        setError("Failed to load transactions");
      }
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load transactions. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, filter, searchTerm]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    if (dropdownOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  // Sort logic
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortBy === "amount") return b.amount - a.amount;
    if (sortBy === "status") return a.status.localeCompare(b.status);
    // Default sort by date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // CSV download
  const downloadCSV = () => {
    const headers = [
      "Transaction ID",
      "User",
      "Amount",
      "Method",
      "Status",
      "Date",
    ];
    const rows = sortedTransactions.map((t) => [
      t.id,
      t.user_phone ||
        (typeof t.user === "object"
          ? t.user?.username || t.user?.email || "N/A"
          : t.user),
      `Rs.${(t.amount || 0).toFixed(2)}`,
      t.payment_method || "N/A",
      t.status,
      new Date(t.created_at).toLocaleString(),
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.total_pages) {
      setCurrentPage(newPage);
    }
  };

  const handleRefresh = () => {
    fetchTransactions();
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>All Transactions</h1>
          <p className={styles.subtitle}>
            View and manage all current and past transactions
          </p>
        </div>
        <button
          className={styles.refreshButton}
          onClick={handleRefresh}
          disabled={loading}
        >
          <FiRefreshCw className={loading ? styles.spinning : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <button onClick={fetchTransactions}>Retry</button>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.filters}>
          {["All", "SUCCESS", "PENDING", "FAILED", "CANCELLED"].map((f) => (
            <button
              key={f}
              className={`${styles.filterButton} ${filter === f ? styles.active : ""}`}
              onClick={() => {
                setFilter(f);
                setCurrentPage(1);
              }}
              disabled={loading}
            >
              {f === "All" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className={styles.rightControls}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by user or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div
            className={styles.sortWrapper}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.sortButton}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <FiFilter /> <span>Sort By</span>
            </button>

            {dropdownOpen && (
              <div className={styles.dropdown}>
                <div
                  className={`${styles.dropdownItem} ${sortBy === "date" ? styles.selected : ""}`}
                  onClick={() => {
                    setSortBy("date");
                    setDropdownOpen(false);
                  }}
                >
                  Date
                </div>
                <div
                  className={`${styles.dropdownItem} ${sortBy === "amount" ? styles.selected : ""}`}
                  onClick={() => {
                    setSortBy("amount");
                    setDropdownOpen(false);
                  }}
                >
                  Amount
                </div>
                <div
                  className={`${styles.dropdownItem} ${sortBy === "status" ? styles.selected : ""}`}
                  onClick={() => {
                    setSortBy("status");
                    setDropdownOpen(false);
                  }}
                >
                  Status
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          <div className={styles.tableInfo}>
            <h3>Recent Transactions</h3>
            {pagination && (
              <span className={styles.resultCount}>
                Showing {transactions.length} of {pagination.total_count}{" "}
                transactions
              </span>
            )}
          </div>
          <button
            className={styles.csvButton}
            onClick={downloadCSV}
            disabled={loading || transactions.length === 0}
          >
            <FiDownload /> Export CSV
          </button>
        </div>

        {loading && transactions.length === 0 ? (
          <div className={styles.loadingContainer}>
            <FiRefreshCw className={styles.spinner} size={32} />
            <p>Loading transactions...</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date/Time</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.length > 0 ? (
                  sortedTransactions.map((t) => (
                    <tr key={t.id}>
                      <td className={styles.transactionId}>{t.id}</td>
                      <td>
                        {t.user_phone ||
                          (typeof t.user === "object"
                            ? t.user?.username || t.user?.email || "N/A"
                            : t.user)}
                      </td>
                      <td className={styles.amount}>
                        Rs. {(t.amount || 0).toFixed(2)}
                      </td>
                      <td>{t.payment_method || "N/A"}</td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{
                            backgroundColor:
                              statusColors[t.status.toUpperCase()] || "#6c757d",
                          }}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className={styles.dateTime}>
                        {formatDate(t.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className={styles.noData}>
                      {searchTerm || filter !== "All"
                        ? "No transactions found matching your criteria"
                        : "No transactions available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {pagination && pagination.total_pages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageButton}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.has_previous || loading}
                >
                  Previous
                </button>
                <div className={styles.pageInfo}>
                  Page {pagination.current_page} of {pagination.total_pages}
                </div>
                <button
                  className={styles.pageButton}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.has_next || loading}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Transactions;
