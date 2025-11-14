"use client";

import React, { useState, useEffect } from "react";
import styles from "./withdrawals.module.css";
import {
  FiRefreshCw,
  FiEye,
  FiCheck,
  FiX,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";
import axiosInstance from "@/lib/axios";

interface Withdrawal {
  id: string;
  internal_reference: string;
  amount: string;
  processing_fee: string;
  net_amount: string;
  status: string;
  status_display: string;
  account_details: Record<string, any>;
  admin_notes: string;
  gateway_reference: string;
  requested_at: string;
  processed_at: string | null;
  payment_method_name: string;
  payment_method_gateway: string;
  user_username: string;
  processed_by_username: string | null;
  formatted_amount: string;
  formatted_processing_fee: string;
  formatted_net_amount: string;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_count: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
}

interface Analytics {
  total_withdrawals: number;
  pending_withdrawals: number;
  completed_withdrawals: number;
  rejected_withdrawals: number;
  today_withdrawals: {
    count: number;
    total_amount: number;
  };
  month_withdrawals: {
    count: number;
    total_amount: number;
  };
}

const statusColors: Record<string, string> = {
  REQUESTED: "#FFA500",
  COMPLETED: "#47b216",
  REJECTED: "#ff4444",
  PROCESSING: "#3498db",
};

const WithdrawalsPage: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<Withdrawal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processingAction, setProcessingAction] = useState<
    "APPROVE" | "REJECT" | null
  >(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processLoading, setProcessLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
    fetchAnalytics();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/api/admin/withdrawals");
      if (response.data.success) {
        setWithdrawals(response.data.data.results || []);
        setPagination(response.data.data.pagination || null);
      }
    } catch (err: any) {
      console.error("Error fetching withdrawals:", err);
      setError(err.response?.data?.message || "Failed to fetch withdrawals");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const response = await axiosInstance.get(
        "/api/admin/withdrawals/analytics",
      );
      if (response.data.success) {
        setAnalytics(response.data.data.analytics);
      }
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchWithdrawalDetail = async (id: string) => {
    try {
      const response = await axiosInstance.get(`/api/admin/withdrawals/${id}`);
      if (response.data.success) {
        setSelectedWithdrawal(response.data.data.withdrawal);
        setShowDetailModal(true);
      }
    } catch (err: any) {
      console.error("Error fetching withdrawal detail:", err);
      setError(
        err.response?.data?.message || "Failed to fetch withdrawal details",
      );
    }
  };

  const handleProcessWithdrawal = async () => {
    if (!selectedWithdrawal || !processingAction) return;

    setProcessLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append("action", processingAction);
      if (adminNotes.trim()) {
        formData.append("admin_notes", adminNotes.trim());
      }

      const response = await axiosInstance.post(
        `/api/admin/withdrawals/${selectedWithdrawal.id}/process`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        setSuccessMessage(
          response.data.data.message || "Withdrawal processed successfully",
        );
        setShowProcessModal(false);
        setShowDetailModal(false);
        setAdminNotes("");
        setProcessingAction(null);
        fetchWithdrawals();
        fetchAnalytics();

        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err: any) {
      console.error("Error processing withdrawal:", err);
      setError(err.response?.data?.message || "Failed to process withdrawal");
    } finally {
      setProcessLoading(false);
    }
  };

  const openProcessModal = (action: "APPROVE" | "REJECT") => {
    setProcessingAction(action);
    setShowProcessModal(true);
  };

  const closeModals = () => {
    setShowDetailModal(false);
    setShowProcessModal(false);
    setProcessingAction(null);
    setAdminNotes("");
    setError(null);
  };

  const filteredWithdrawals =
    filter === "ALL"
      ? withdrawals
      : withdrawals.filter((w) => {
        console.log("Filtering:", {
          status: w.status,
          filter: filter,
          match: w.status === filter,
        });
        return w.status === filter;
      });

  console.log("Filter state:", filter);
  console.log("Total withdrawals:", withdrawals.length);
  console.log("Filtered withdrawals:", filteredWithdrawals.length);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Withdrawal Management</h1>
          <p className={styles.subtitle}>
            Manage and process user withdrawal requests
          </p>
        </div>
        <button
          className={styles.refreshButton}
          onClick={() => {
            fetchWithdrawals();
            fetchAnalytics();
          }}
        >
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {successMessage && (
        <div className={styles.successMessage}>
          <FiCheckCircle /> {successMessage}
        </div>
      )}

      {error && !showDetailModal && (
        <div className={styles.errorMessage}>
          <FiAlertCircle /> {error}
        </div>
      )}

      {/* Analytics Cards */}
      {analyticsLoading ? (
        <div className={styles.statsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.statCardSkeleton}></div>
          ))}
        </div>
      ) : analytics ? (
        <div className={styles.statsGrid}>
          {/* Total Withdrawals */}
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiDollarSign />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Total Withdrawals</p>
              <h3 className={styles.statValue}>{analytics.total_withdrawals}</h3>
              <p className={styles.statSubtext}>All withdrawal requests</p>
            </div>
          </div>

          {/* Pending */}
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiClock />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Pending</p>
              <h3 className={styles.statValue}>{analytics.pending_withdrawals}</h3>
              <p className={styles.statSubtext}>Awaiting action</p>
            </div>
          </div>

          {/* Completed */}
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiCheckCircle />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Completed</p>
              <h3 className={styles.statValue}>
                {analytics.completed_withdrawals}
              </h3>
              <p className={styles.statSubtext}>Successfully processed</p>
            </div>
          </div>

          {/* Rejected */}
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiXCircle />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Rejected</p>
              <h3 className={styles.statValue}>{analytics.rejected_withdrawals}</h3>
              <p className={styles.statSubtext}>Rejected requests</p>
            </div>
          </div>
        </div>
      ) : null}


      {/* Filters */}
      <div className={styles.filters}>
        {["ALL", "REQUESTED", "COMPLETED", "REJECTED"].map((f) => (
          <button
            key={f}
            className={`${styles.filterButton} ${filter === f ? styles.active : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          <h3>Withdrawal Requests</h3>
          <span className={styles.tableCount}>
            {filteredWithdrawals.length}{" "}
            {filteredWithdrawals.length === 1 ? "request" : "requests"}
          </span>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading withdrawals...</p>
          </div>
        ) : filteredWithdrawals.length === 0 ? (
          <div className={styles.emptyState}>
            <FiDollarSign className={styles.emptyIcon} />
            <p>No withdrawal requests found</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Fee</th>
                  <th>Net Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Requested At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id}>
                    <td className={styles.referenceCell}>
                      {withdrawal.internal_reference ||
                        withdrawal.gateway_reference}
                    </td>
                    <td>{withdrawal.user_username}</td>
                    <td className={styles.amountCell}>
                      {withdrawal.formatted_amount}
                    </td>
                    <td className={styles.feeCell}>
                      {withdrawal.formatted_processing_fee}
                    </td>
                    <td className={styles.netAmountCell}>
                      {withdrawal.formatted_net_amount}
                    </td>
                    <td>
                      <span className={styles.paymentMethodBadge}>
                        {withdrawal.payment_method_name}
                      </span>
                    </td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{
                          backgroundColor: `${statusColors[withdrawal.status]}22`,
                          color: statusColors[withdrawal.status],
                          borderColor: statusColors[withdrawal.status],
                        }}
                      >
                        {withdrawal.status_display}
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {formatDate(withdrawal.requested_at)}
                    </td>
                    <td>
                      <button
                        className={styles.actionButton}
                        onClick={() => fetchWithdrawalDetail(withdrawal.id)}
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedWithdrawal && (
        <div className={styles.modalOverlay} onClick={closeModals}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Withdrawal Details</h2>
              <button className={styles.closeButton} onClick={closeModals}>
                <FiX />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>Basic Information</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>Internal Reference:</label>
                    <span>
                      {selectedWithdrawal.internal_reference || "N/A"}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Gateway Reference:</label>
                    <span>{selectedWithdrawal.gateway_reference}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>User:</label>
                    <span className={styles.highlightText}>
                      {selectedWithdrawal.user_username}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Payment Method:</label>
                    <span className={styles.paymentMethodBadge}>
                      {selectedWithdrawal.payment_method_name}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Status:</label>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: `${statusColors[selectedWithdrawal.status]}22`,
                        color: statusColors[selectedWithdrawal.status],
                        borderColor: statusColors[selectedWithdrawal.status],
                      }}
                    >
                      {selectedWithdrawal.status_display}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Financial Details</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>Amount:</label>
                    <span className={styles.amountText}>
                      {selectedWithdrawal.formatted_amount}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Processing Fee:</label>
                    <span className={styles.feeText}>
                      {selectedWithdrawal.formatted_processing_fee}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Net Amount:</label>
                    <span className={styles.netAmountText}>
                      {selectedWithdrawal.formatted_net_amount}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Account Details</h3>
                <div className={styles.accountDetails}>
                  {Object.entries(selectedWithdrawal.account_details).map(
                    ([key, value]) => (
                      <div key={key} className={styles.detailItem}>
                        <label>
                          {key
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                          :
                        </label>
                        <span>{String(value)}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Timeline</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>Requested At:</label>
                    <span>{formatDate(selectedWithdrawal.requested_at)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Processed At:</label>
                    <span>{formatDate(selectedWithdrawal.processed_at)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Processed By:</label>
                    <span>
                      {selectedWithdrawal.processed_by_username || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedWithdrawal.admin_notes && (
                <div className={styles.detailSection}>
                  <h3>Admin Notes</h3>
                  <div className={styles.adminNotesDisplay}>
                    {selectedWithdrawal.admin_notes}
                  </div>
                </div>
              )}
            </div>

            {selectedWithdrawal.status === "REQUESTED" && (
              <div className={styles.modalFooter}>
                <button
                  className={`${styles.processButton} ${styles.rejectButton}`}
                  onClick={() => openProcessModal("REJECT")}
                >
                  <FiX /> Reject
                </button>
                <button
                  className={`${styles.processButton} ${styles.approveButton}`}
                  onClick={() => openProcessModal("APPROVE")}
                >
                  <FiCheck /> Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Process Modal */}
      {showProcessModal && processingAction && selectedWithdrawal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowProcessModal(false)}
        >
          <div
            className={styles.processModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>
                {processingAction === "APPROVE" ? "Approve" : "Reject"}{" "}
                Withdrawal
              </h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowProcessModal(false)}
              >
                <FiX />
              </button>
            </div>

            <div className={styles.modalBody}>
              {error && (
                <div className={styles.errorMessage}>
                  <FiAlertCircle /> {error}
                </div>
              )}

              <div className={styles.processInfo}>
                <p>
                  You are about to{" "}
                  <strong>{processingAction.toLowerCase()}</strong> withdrawal
                  request:
                </p>
                <div className={styles.processInfoDetails}>
                  <span>
                    <strong>Reference:</strong>{" "}
                    {selectedWithdrawal.internal_reference ||
                      selectedWithdrawal.gateway_reference}
                  </span>
                  <span>
                    <strong>User:</strong> {selectedWithdrawal.user_username}
                  </span>
                  <span>
                    <strong>Amount:</strong>{" "}
                    {selectedWithdrawal.formatted_net_amount}
                  </span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="adminNotes">
                  Admin Notes{" "}
                  {processingAction === "REJECT" && (
                    <span className={styles.required}>*</span>
                  )}
                </label>
                <textarea
                  id="adminNotes"
                  className={styles.textarea}
                  placeholder={`Enter notes for ${processingAction === "APPROVE" ? "approval" : "rejection"}...`}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  required={processingAction === "REJECT"}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowProcessModal(false)}
                disabled={processLoading}
              >
                Cancel
              </button>
              <button
                className={`${styles.confirmButton} ${processingAction === "REJECT"
                    ? styles.confirmReject
                    : styles.confirmApprove
                  }`}
                onClick={handleProcessWithdrawal}
                disabled={
                  processLoading ||
                  (processingAction === "REJECT" && !adminNotes.trim())
                }
              >
                {processLoading ? (
                  <>
                    <div className={styles.buttonSpinner}></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {processingAction === "APPROVE" ? <FiCheck /> : <FiX />}
                    Confirm{" "}
                    {processingAction === "APPROVE" ? "Approval" : "Rejection"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalsPage;
