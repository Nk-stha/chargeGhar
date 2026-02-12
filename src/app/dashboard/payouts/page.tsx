"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FiDollarSign,
  FiSearch,
  FiRefreshCw,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";
import axiosInstance from "@/lib/axios";
import { PayoutRequest, PayoutStatus, PayoutType } from "@/types/payout.types";
import styles from "./payouts.module.css";

const statusTabs: (PayoutStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "PROCESSING",
  "APPROVED",
  "COMPLETED",
  "REJECTED",
];

export default function PayoutsPage() {
  const router = useRouter();
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PayoutStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [payoutTypeFilter, setPayoutTypeFilter] = useState<PayoutType | "ALL">("ALL");

  const fetchPayouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Authentication required. Please login.");
        setLoading(false);
        return;
      }

      const params: Record<string, string> = {
        page: page.toString(),
        page_size: pageSize.toString(),
      };

      if (activeTab !== "ALL") {
        params.status = activeTab;
      }

      if (payoutTypeFilter !== "ALL") {
        params.payout_type = payoutTypeFilter;
      }

      const queryString = new URLSearchParams(params).toString();
      const response = await axiosInstance.get(`/api/admin/partners/payouts?${queryString}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setPayouts(response.data.data.results || []);
        setTotalCount(response.data.data.count || 0);
        setTotalPages(response.data.data.total_pages || 1);
      } else {
        setError(response.data.message || "Failed to fetch payout requests");
      }
    } catch (err: any) {
      // Handle different error types
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to view payouts.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(err.response?.data?.message || err.message || "Failed to fetch payout requests. Please check your connection.");
      }
      setPayouts([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, activeTab, payoutTypeFilter]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleTabClick = (tab: PayoutStatus | "ALL") => {
    setActiveTab(tab);
    setPage(1);
  };

  const handlePayoutTypeChange = (type: PayoutType | "ALL") => {
    setPayoutTypeFilter(type);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const formatAmount = (amount: string) => {
    return `NPR ${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: PayoutStatus) => {
    const colors: Record<PayoutStatus, string> = {
      PENDING: "#FFA500",
      PROCESSING: "#3B82F6",
      APPROVED: "#10B981",
      COMPLETED: "#47b216",
      REJECTED: "#EF4444",
    };
    return colors[status];
  };

  const getPayoutTypeLabel = (type: PayoutType) => {
    return type === "CHARGEGHAR_TO_FRANCHISE" ? "To Franchise" : "To Vendor";
  };

  const filteredPayouts = payouts.filter((payout) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      payout.partner_name.toLowerCase().includes(query) ||
      payout.partner_code.toLowerCase().includes(query) ||
      payout.reference_id.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: totalCount,
    pending: payouts.filter((p) => p.status === "PENDING").length,
    processing: payouts.filter((p) => p.status === "PROCESSING").length,
    completed: payouts.filter((p) => p.status === "COMPLETED").length,
  };

  if (loading && payouts.length === 0) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingContainer}>
          <FiLoader className={styles.spinner} />
          <p>Loading payout requests...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Payout Requests</h1>
          <p className={styles.subtitle}>
            Manage partner payout requests and transactions
          </p>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.refreshButton}
            onClick={fetchPayouts}
            disabled={loading}
            title="Refresh"
          >
            <FiRefreshCw className={loading ? styles.spinning : ""} />
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <div className={styles.errorBanner}>
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}>
            <FiDollarSign />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Requests</p>
            <h3 className={styles.statValue}>{stats.total}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.orange}`}>
            <FiDollarSign />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Pending</p>
            <h3 className={styles.statValue}>{stats.pending}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.purple}`}>
            <FiDollarSign />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Processing</p>
            <h3 className={styles.statValue}>{stats.processing}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}>
            <FiDollarSign />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Completed</p>
            <h3 className={styles.statValue}>{stats.completed}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            className={styles.search}
            placeholder="Search by partner name, code, or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className={styles.clearSearch}
              onClick={() => setSearchQuery("")}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className={styles.filterGroup}>
          <FiFilter className={styles.filterIcon} />
          <select
            className={styles.select}
            value={payoutTypeFilter}
            onChange={(e) => handlePayoutTypeChange(e.target.value as PayoutType | "ALL")}
          >
            <option value="ALL">All Types</option>
            <option value="CHARGEGHAR_TO_FRANCHISE">To Franchise</option>
            <option value="CHARGEGHAR_TO_VENDOR">To Vendor</option>
          </select>
        </div>
      </div>

      {/* Status Tabs */}
      <div className={styles.tabs}>
        {statusTabs.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
            onClick={() => handleTabClick(tab)}
            disabled={loading}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Partner</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Bank Details</th>
              <th>Reference ID</th>
              <th>Status</th>
              <th>Created</th>
              <th>Processed By</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className={styles.loadingState}>
                  <FiLoader className={styles.spinner} />
                  Loading...
                </td>
              </tr>
            ) : filteredPayouts.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.emptyState}>
                  {searchQuery
                    ? "No payout requests match your search"
                    : "No payout requests found"}
                </td>
              </tr>
            ) : (
              filteredPayouts.map((payout) => (
                <tr 
                  key={payout.id} 
                  className={styles.tableRow}
                  onClick={() => router.push(`/dashboard/payouts/${payout.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div className={styles.partnerInfo}>
                      <span className={styles.partnerName}>{payout.partner_name}</span>
                      <span className={styles.partnerCode}>{payout.partner_code}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.typeBadge}>
                      {getPayoutTypeLabel(payout.payout_type)}
                    </span>
                  </td>
                  <td>
                    <div className={styles.amountInfo}>
                      <span className={styles.amount}>{formatAmount(payout.amount)}</span>
                      {payout.net_amount !== payout.amount && (
                        <span className={styles.netAmount}>
                          Net: {formatAmount(payout.net_amount)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {payout.bank_name ? (
                      <div className={styles.bankInfo}>
                        <span className={styles.bankName}>{payout.bank_name}</span>
                        <span className={styles.accountNumber}>
                          {payout.account_number}
                        </span>
                        <span className={styles.accountHolder}>
                          {payout.account_holder_name}
                        </span>
                      </div>
                    ) : (
                      <span className={styles.noData}>Not provided</span>
                    )}
                  </td>
                  <td>
                    <span className={styles.referenceId}>{payout.reference_id}</span>
                  </td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: `${getStatusColor(payout.status)}22`,
                        color: getStatusColor(payout.status),
                        borderColor: getStatusColor(payout.status),
                      }}
                    >
                      {payout.status}
                    </span>
                  </td>
                  <td>
                    <span className={styles.date}>{formatDate(payout.created_at)}</span>
                  </td>
                  <td>
                    {payout.processed_by_name ? (
                      <div className={styles.processedInfo}>
                        <span className={styles.processedBy}>
                          {payout.processed_by_name}
                        </span>
                        {payout.processed_at && (
                          <span className={styles.processedDate}>
                            {formatDate(payout.processed_at)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className={styles.noData}>-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Card Layout for Small Devices */}
      <div className={styles.cardLayout}>
        {loading ? (
          <div className={styles.loadingState}>
            <FiLoader className={styles.spinner} />
            Loading...
          </div>
        ) : filteredPayouts.length === 0 ? (
          <div className={styles.emptyState}>
            {searchQuery
              ? "No payout requests match your search"
              : "No payout requests found"}
          </div>
        ) : (
          filteredPayouts.map((payout) => (
            <div
              key={payout.id}
              className={styles.cardLayoutItem}
              onClick={() => router.push(`/dashboard/payouts/${payout.id}`)}
            >
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Partner</span>
                <div style={{ textAlign: 'right' }}>
                  <div className={styles.cardValue}>{payout.partner_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>
                    {payout.partner_code}
                  </div>
                </div>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Type</span>
                <span className={styles.cardBadge} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
                  {getPayoutTypeLabel(payout.payout_type)}
                </span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Amount</span>
                <div style={{ textAlign: 'right' }}>
                  <div className={styles.cardValue}>{formatAmount(payout.amount)}</div>
                  {payout.net_amount !== payout.amount && (
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>
                      Net: {formatAmount(payout.net_amount)}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Bank</span>
                <div style={{ textAlign: 'right' }}>
                  {payout.bank_name ? (
                    <>
                      <div className={styles.cardValue}>{payout.bank_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>
                        {payout.account_number}
                      </div>
                    </>
                  ) : (
                    <span style={{ color: '#666' }}>Not provided</span>
                  )}
                </div>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Reference</span>
                <span style={{ fontFamily: 'monospace', color: '#aaa', fontSize: '0.8rem' }}>
                  {payout.reference_id}
                </span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Status</span>
                <span
                  className={styles.cardBadge}
                  style={{
                    backgroundColor: `${getStatusColor(payout.status)}22`,
                    color: getStatusColor(payout.status),
                    border: `1px solid ${getStatusColor(payout.status)}`,
                  }}
                >
                  {payout.status}
                </span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Created</span>
                <span style={{ color: '#aaa', fontSize: '0.8rem' }}>
                  {formatDate(payout.created_at)}
                </span>
              </div>

              {payout.processed_by_name && (
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Processed By</span>
                  <div style={{ textAlign: 'right' }}>
                    <div className={styles.cardValue} style={{ fontSize: '0.9rem' }}>
                      {payout.processed_by_name}
                    </div>
                    {payout.processed_at && (
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>
                        {formatDate(payout.processed_at)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Showing {payouts.length} of {totalCount} requests
          </span>
          <div className={styles.paginationControls}>
            <button
              className={styles.paginationButton}
              disabled={page === 1 || loading}
              onClick={() => handlePageChange(page - 1)}
            >
              <FiChevronLeft />
            </button>

            <span className={styles.pageNumber}>
              Page {page} of {totalPages}
            </span>

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
    </main>
  );
}
