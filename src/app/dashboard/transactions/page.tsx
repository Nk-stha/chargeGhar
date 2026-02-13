"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import styles from "./transactions.module.css";
import { FiFilter, FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import axiosInstance from "../../../lib/axios";
import Table from "../../../components/DataTable/dataTable";

interface User {
  id: string;
  username?: string;
  email?: string;
}

interface Transaction {
  source: string;
  id: string;
  transaction_id: string;
  user: User;
  type: string;
  amount?: number;
  points?: number;
  points_source?: string;
  status: string;
  balance_before?: number;
  balance_after?: number;
  created_at: string;
  description: string;
}

interface Pagination {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    results: Transaction[];
    pagination: Pagination;
  };
}

const sourceColors: Record<string, string> = {
  wallet: "#47b216",
  points: "#ffc107",
  payment: "#17a2b8",
};

const statusColors: Record<string, string> = {
  SUCCESS: "#47b216",
  COMPLETED: "#47b216",
  PENDING: "#ffc107",
  FAILED: "#dc3545",
  CANCELLED: "#6c757d",
  REJECTED: "#dc3545",
};

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
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
      
      if (filter !== "all") {
        params.append("source", filter);
      }

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await axiosInstance.get<ApiResponse>(
        `/api/admin/transactions?${params.toString()}`
      );

      if (response.data.success) {
        setTransactions(response.data.data.results || []);
        setPagination(response.data.data.pagination);
      } else {
        const errorMessage = "Failed to load transactions";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to load transactions. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filter, searchTerm]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    if (dropdownOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortBy === "amount") {
      const amountA = a?.amount ?? a?.points ?? 0;
      const amountB = b?.amount ?? b?.points ?? 0;
      return amountB - amountA;
    }
    if (sortBy === "status") return (a?.status || "").localeCompare(b?.status || "");
    return new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime();
  });

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.total_pages) {
      setCurrentPage(newPage);
    }
  };

  const handleRefresh = () => {
    fetchTransactions();
  };

  // ✅ Reusable table column definitions
  const columns = [
    {
      header: "Transaction ID",
      accessor: "transaction_id",
      render: (value: string) => value || "N/A",
    },
    {
      header: "User",
      accessor: "user",
      render: (value: any) => value?.username || value?.email || "N/A",
    },
    {
      header: "Amount/Points",
      accessor: "amount",
      render: (_: any, row: Transaction) =>
        row?.amount
          ? `Rs. ${(row.amount ?? 0).toFixed(2)}`
          : `${row?.points ?? 0} points`,
    },
    {
      header: "Source",
      accessor: "source",
      render: (value: string) => (
        <span
          style={{
            backgroundColor: sourceColors[(value || "").toLowerCase()] || "#6c757d",
            color: "#000",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "0.8rem",
            fontWeight: 600,
          }}
        >
          {value || "N/A"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (value: string) => (
        <span
          style={{
            backgroundColor: statusColors[(value || "").toUpperCase()] || "#6c757d",
            color: "#000",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "0.8rem",
            fontWeight: 600,
          }}
        >
          {value || "N/A"}
        </span>
      ),
    },
    {
      header: "Date/Time",
      accessor: "created_at",
      render: (value: string) =>
        value ? new Date(value).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) : "N/A",
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
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
          {["all", "wallet", "points", "payment"].map((f) => (
            <button
              key={f}
              className={`${styles.filterButton} ${
                filter === f ? styles.active : ""
              }`}
              onClick={() => {
                setFilter(f);
                setCurrentPage(1);
              }}
              disabled={loading}
            >
              {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
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
            {searchTerm && (
              <button
                className={styles.clearButton}
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
                <FiX />
              </button>
            )}
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
                  className={`${styles.dropdownItem} ${
                    sortBy === "date" ? styles.selected : ""
                  }`}
                  onClick={() => {
                    setSortBy("date");
                    setDropdownOpen(false);
                  }}
                >
                  Date
                </div>
                <div
                  className={`${styles.dropdownItem} ${
                    sortBy === "amount" ? styles.selected : ""
                  }`}
                  onClick={() => {
                    setSortBy("amount");
                    setDropdownOpen(false);
                  }}
                >
                  Amount
                </div>
                <div
                  className={`${styles.dropdownItem} ${
                    sortBy === "status" ? styles.selected : ""
                  }`}
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
        </div>

        <Table
          title=""
          subtitle=""
          columns={columns}
          data={sortedTransactions}
          loading={loading}
          emptyMessage={
            searchTerm || filter !== "all"
              ? "No transactions found matching your criteria"
              : "No transactions available"
          }
        />

        {pagination && pagination.total_pages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
            >
              Previous
            </button>
            <div className={styles.pageInfo}>
              Page {currentPage} of {pagination.total_pages}
            </div>
            <button
              className={styles.pageButton}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.total_pages || loading}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
