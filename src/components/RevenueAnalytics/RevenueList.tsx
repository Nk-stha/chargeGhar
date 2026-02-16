"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import styles from "./RevenueAnalytics.module.css";
import {
  RevenueTransaction,
  RevenueAnalyticsSummary,
} from "../../types/revenueAnalytics";
import { getRevenueAnalytics } from "../../lib/api/revenueAnalytics";
import RevenueTransactionDetail from "./RevenueTransactionDetail";
import { extractApiError } from "../../lib/apiErrors";
import { toast } from "sonner";

interface RevenueListProps {
  onSummaryUpdate?: (summary: RevenueAnalyticsSummary) => void;
}

const RevenueList: React.FC<RevenueListProps> = ({ onSummaryUpdate }) => {
  const [transactions, setTransactions] = useState<RevenueTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<RevenueTransaction | null>(null);
  const [createdDate, setCreatedDate] = useState<string>("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [createdDate]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getRevenueAnalytics({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
      });

      if (response.success) {
        let filteredTransactions = response.data.results;
        
        // Filter by created_at on frontend if date is selected
        if (createdDate) {
          filteredTransactions = filteredTransactions.filter((transaction: RevenueTransaction) => {
            const transactionDate = new Date(transaction.created_at).toISOString().split('T')[0];
            return transactionDate === createdDate;
          });
          
          // Recalculate summary for filtered data
          const filteredSummary = {
            total_transactions: filteredTransactions.length,
            total_gross: filteredTransactions.reduce((sum, t) => sum + parseFloat(t.gross_amount || "0"), 0),
            total_vat: filteredTransactions.reduce((sum, t) => sum + parseFloat(t.vat_amount || "0"), 0),
            total_service_charge: filteredTransactions.reduce((sum, t) => sum + parseFloat(t.service_charge || "0"), 0),
            total_net: filteredTransactions.reduce((sum, t) => sum + parseFloat(t.net_amount || "0"), 0),
            total_chargeghar_share: filteredTransactions.reduce((sum, t) => sum + parseFloat(t.chargeghar_share || "0"), 0),
            total_franchise_share: filteredTransactions.reduce((sum, t) => sum + parseFloat(t.franchise_share || "0"), 0),
            total_vendor_share: filteredTransactions.reduce((sum, t) => sum + parseFloat(t.vendor_share || "0"), 0),
          };
          
          setTransactions(filteredTransactions);
          setTotalCount(filteredTransactions.length);
          setTotalPages(Math.ceil(filteredTransactions.length / pageSize));
          if (onSummaryUpdate) {
            onSummaryUpdate(filteredSummary);
          }
        } else {
          setTransactions(response.data.results);
          setTotalCount(response.data.pagination.total_count);
          setTotalPages(response.data.pagination.total_pages);
          if (onSummaryUpdate) {
            onSummaryUpdate(response.data.summary);
          }
        }
      } else {
        setError(response.message || "Failed to fetch revenue data");
        setTransactions([]);
      }
    } catch (err: unknown) {
      const apiError = extractApiError(err, "An error occurred while fetching revenue data");
      if (apiError.statusCode === 404) {
        toast.error("Revenue analytics feature is not yet available. Please contact your administrator.");
      } else {
        toast.error(apiError.message);
      }
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, createdDate, onSummaryUpdate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return styles.statusCompleted;
      case "PENDING":
        return styles.statusPending;
      case "FAILED":
        return styles.statusFailed;
      case "REFUNDED":
        return styles.statusRefunded;
      default:
        return "";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "Completed";
      case "PENDING":
        return "Pending";
      case "FAILED":
        return "Failed";
      case "REFUNDED":
        return "Refunded";
      default:
        return status;
    }
  };

  const formatAmount = (amount: string) => `NPR ${parseFloat(amount).toFixed(2)}`;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className={styles.searchSection}>
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search Rental Codes or Transaction IDs..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.dateFilterWrapper}>
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

      {/* Desktop Table */}
      <div className={`${styles.tableContainer} ${styles.desktopOnly}`}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Rental Code</th>
                <th>Station Name (SN)</th>
                <th>Gross Amount</th>
                <th>Net Amount</th>
                <th>Distribution (CG/FR/VN)</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} style={{ padding: "1.5rem" }}>
                      <div
                        style={{
                          height: "1rem",
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: "0.25rem",
                          width: "100%",
                        }}
                      />
                    </td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "#6b7280",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span style={{ fontSize: "1.875rem" }}>🔍</span>
                      <p>No transactions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`${styles.tableRow} ${styles.tableRowClickable} ${
                      selectedTransaction?.id === tx.id ? styles.tableRowSelected : ""
                    }`}
                    onClick={() => setSelectedTransaction(tx)}
                  >
                    <td>
                      <span className={styles.rentalCode}>
                        {tx.rental_code || tx.transaction_id}
                      </span>
                    </td>
                    <td>
                      <span className={styles.stationName}>
                        {tx.station_name}
                      </span>
                      <span className={styles.stationSerial}>
                        {tx.station_sn}
                      </span>
                    </td>
                    <td>
                      <span className={styles.amountText}>
                        {formatAmount(tx.gross_amount)}
                      </span>
                    </td>
                    <td>
                      <span className={styles.amountText}>
                        {formatAmount(tx.net_amount)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.distributionWrapper}>
                        <span className={styles.distCg}>
                          CG: {parseFloat(tx.chargeghar_share).toFixed(2)}
                        </span>
                        <span className={styles.distSeparator}>/</span>
                        <span className={styles.distFr}>
                          FR: {parseFloat(tx.franchise_share).toFixed(2)}
                        </span>
                        <span className={styles.distSeparator}>/</span>
                        <span className={styles.distVn}>
                          VN: {parseFloat(tx.vendor_share).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${getStatusClass(
                          tx.transaction_status
                        )}`}
                      >
                        <span className={styles.statusDot} />
                        {getStatusLabel(tx.transaction_status)}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className={styles.dateText}>
                        {formatDate(tx.created_at)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > 0 && (
          <div className={styles.paginationFooter}>
            <div>
              Showing {transactions.length} of {totalCount} transactions
            </div>
            <div className={styles.paginationControls}>
              <button
                className={styles.paginationButton}
                disabled={page === 1 || loading}
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </button>
              <button
                className={styles.paginationButton}
                disabled={page >= totalPages || loading}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className={styles.mobileOnly}>
        {loading ? (
          <div className={styles.cardGrid}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`${styles.transactionCard} animate-pulse`}
              >
                <div style={{ padding: "1.25rem" }}>
                  <div
                    style={{
                      height: "1rem",
                      width: "50%",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "0.25rem",
                      marginBottom: "0.75rem",
                    }}
                  />
                  <div
                    style={{
                      height: "0.75rem",
                      width: "70%",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "0.25rem",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className={styles.emptyState}>
            <span style={{ fontSize: "2.5rem" }}>🔍</span>
            <p>No transactions found</p>
          </div>
        ) : (
          <>
            <div className={styles.cardGrid}>
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className={styles.transactionCard}
                  onClick={() => setSelectedTransaction(tx)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>
                      <span className={styles.rentalCode}>
                        {tx.rental_code || tx.transaction_id}
                      </span>
                      <span className={styles.stationSerial}>
                        {tx.station_name}
                      </span>
                    </div>
                    <span
                      className={`${styles.statusBadge} ${getStatusClass(
                        tx.transaction_status
                      )}`}
                    >
                      <span className={styles.statusDot} />
                      {getStatusLabel(tx.transaction_status)}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Gross</span>
                      <span className={styles.cardValue}>
                        {formatAmount(tx.gross_amount)}
                      </span>
                    </div>
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Net</span>
                      <span className={styles.cardValue}>
                        {formatAmount(tx.net_amount)}
                      </span>
                    </div>

                    <hr className={styles.cardDivider} />

                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Distribution</span>
                      <div className={styles.distributionWrapper}>
                        <span className={styles.distCg}>
                          CG: {parseFloat(tx.chargeghar_share).toFixed(2)}
                        </span>
                        <span className={styles.distSeparator}>/</span>
                        <span className={styles.distFr}>
                          FR: {parseFloat(tx.franchise_share).toFixed(2)}
                        </span>
                        <span className={styles.distSeparator}>/</span>
                        <span className={styles.distVn}>
                          VN: {parseFloat(tx.vendor_share).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Date</span>
                      <span className={styles.dateText}>
                        {formatDate(tx.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalCount > 0 && (
              <div className={styles.mobilePagination}>
                <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  Showing <strong>{transactions.length}</strong> of{" "}
                  <strong>{totalCount}</strong>
                </span>
                <div className={styles.paginationControls}>
                  <button
                    className={styles.paginationButton}
                    disabled={page === 1 || loading}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    <FiChevronLeft />
                  </button>
                  <div
                    style={{
                      padding: "0 0.75rem",
                      fontWeight: 700,
                      color: "#54bc28",
                      fontSize: "0.875rem",
                    }}
                  >
                    {page} / {totalPages}
                  </div>
                  <button
                    className={styles.paginationButton}
                    disabled={page >= totalPages || loading}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transaction Detail Panel */}
      {selectedTransaction && (
        <RevenueTransactionDetail
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
};

export default RevenueList;
