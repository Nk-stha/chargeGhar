"use client";

import React, { useState, useEffect } from "react";
import styles from "./refunds.module.css";
import {
  FiRefreshCw,
  FiEye,
  FiCheck,
  FiX,
  FiRotateCcw,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";
import axiosInstance from "@/lib/axios";

interface Refund {
  id: string;
  amount: string;
  reason: string;
  status: string;
  gateway_reference: string;
  admin_notes: string;
  requested_at: string;
  processed_at: string | null;
  transaction_id: string;
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

const statusColors: Record<string, string> = {
  REQUESTED: "#FFA500",
  APPROVED: "#47b216",
  REJECTED: "#ff4444",
};

const RefundsPage: React.FC = () => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
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
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/api/admin/refunds");
      if (response.data.success) {
        setRefunds(response.data.data.results || []);
        setPagination(response.data.data.pagination || null);
      }
    } catch (err: any) {
      console.error("Error fetching refunds:", err);
      setError(err.response?.data?.message || "Failed to fetch refunds");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedRefund || !processingAction) return;

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
        `/api/admin/refunds/${selectedRefund.id}/process`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage(
          response.data.message || "Refund processed successfully"
        );
        setShowProcessModal(false);
        setShowDetailModal(false);
        setAdminNotes("");
        setProcessingAction(null);
        fetchRefunds();

        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err: any) {
      console.error("Error processing refund:", err);
      setError(err.response?.data?.message || "Failed to process refund");
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

  const openDetailModal = (refund: Refund) => {
    setSelectedRefund(refund);
    setShowDetailModal(true);
  };

  const filteredRefunds =
    filter === "ALL"
      ? refunds
      : refunds.filter((r) => r.status === filter);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatAmount = (amount: string) => {
    return `NPR ${parseFloat(amount).toLocaleString()}`;
  };

  // Calculate statistics
  const stats = {
    total: refunds.length,
    requested: refunds.filter((r) => r.status === "REQUESTED").length,
    approved: refunds.filter((r) => r.status === "APPROVED").length,
    rejected: refunds.filter((r) => r.status === "REJECTED").length,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Refund Management</h1>
          <p className={styles.subtitle}>
            Manage and process user refund requests
          </p>
        </div>
        <button className={styles.refreshButton} onClick={fetchRefunds}>
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

      {/* Statistics Cards */}
      <div className={styles.analyticsGrid}>
        <div className={styles.analyticsCard}>
          <div
            className={styles.analyticsIcon}
            style={{ backgroundColor: "#3498db33" }}
          >
            <FiRotateCcw style={{ color: "#3498db" }} />
          </div>
          <div className={styles.analyticsContent}>
            <p className={styles.analyticsLabel}>Total Refunds</p>
            <h3 className={styles.analyticsValue}>{stats.total}</h3>
          </div>
        </div>

        <div className={styles.analyticsCard}>
          <div
            className={styles.analyticsIcon}
            style={{ backgroundColor: "#FFA50033" }}
          >
            <FiClock style={{ color: "#FFA500" }} />
          </div>
          <div className={styles.analyticsContent}>
            <p className={styles.analyticsLabel}>Pending</p>
            <h3 className={styles.analyticsValue}>{stats.requested}</h3>
          </div>
        </div>

        <div className={styles.analyticsCard}>
          <div
            className={styles.analyticsIcon}
            style={{ backgroundColor: "#47b21633" }}
          >
            <FiCheckCircle style={{ color: "#47b216" }} />
          </div>
          <div className={styles.analyticsContent}>
            <p className={styles.analyticsLabel}>Approved</p>
            <h3 className={styles.analyticsValue}>{stats.approved}</h3>
          </div>
        </div>

        <div className={styles.analyticsCard}>
          <div
            className={styles.analyticsIcon}
            style={{ backgroundColor: "#ff444433" }}
          >
            <FiXCircle style={{ color: "#ff4444" }} />
          </div>
          <div className={styles.analyticsContent}>
            <p className={styles.analyticsLabel}>Rejected</p>
            <h3 className={styles.analyticsValue}>{stats.rejected}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        {["ALL", "REQUESTED", "APPROVED", "REJECTED"].map((f) => (
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
          <h3>Refund Requests</h3>
          <span className={styles.tableCount}>
            {filteredRefunds.length}{" "}
            {filteredRefunds.length === 1 ? "request" : "requests"}
          </span>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading refunds...</p>
          </div>
        ) : filteredRefunds.length === 0 ? (
          <div className={styles.emptyState}>
            <FiRotateCcw className={styles.emptyIcon} />
            <p>No refund requests found</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Gateway Reference</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Requested At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.map((refund) => (
                  <tr key={refund.id}>
                    <td className={styles.referenceCell}>
                      {refund.transaction_id}
                    </td>
                    <td className={styles.gatewayCell}>
                      {refund.gateway_reference}
                    </td>
                    <td className={styles.amountCell}>
                      {formatAmount(refund.amount)}
                    </td>
                    <td className={styles.reasonCell}>{refund.reason}</td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{
                          backgroundColor: `${statusColors[refund.status]}22`,
                          color: statusColors[refund.status],
                          borderColor: statusColors[refund.status],
                        }}
                      >
                        {refund.status.charAt(0) +
                          refund.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className={styles.dateCell}>
                      {formatDate(refund.requested_at)}
                    </td>
                    <td>
                      <button
                        className={styles.actionButton}
                        onClick={() => openDetailModal(refund)}
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
      {showDetailModal && selectedRefund && (
        <div className={styles.modalOverlay} onClick={closeModals}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Refund Details</h2>
              <button className={styles.closeButton} onClick={closeModals}>
                <FiX />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>Basic Information</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>Transaction ID:</label>
                    <span className={styles.highlightText}>
                      {selectedRefund.transaction_id}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Gateway Reference:</label>
                    <span>{selectedRefund.gateway_reference}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Amount:</label>
                    <span className={styles.amountText}>
                      {formatAmount(selectedRefund.amount)}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Status:</label>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: `${statusColors[selectedRefund.status]}22`,
                        color: statusColors[selectedRefund.status],
                        borderColor: statusColors[selectedRefund.status],
                      }}
                    >
                      {selectedRefund.status.charAt(0) +
                        selectedRefund.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Refund Reason</h3>
                <div className={styles.reasonDisplay}>{selectedRefund.reason}</div>
              </div>

              <div className={styles.detailSection}>
                <h3>Timeline</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>Requested At:</label>
                    <span>{formatDate(selectedRefund.requested_at)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>Processed At:</label>
                    <span>{formatDate(selectedRefund.processed_at)}</span>
                  </div>
                </div>
              </div>

              {selectedRefund.admin_notes && (
                <div className={styles.detailSection}>
                  <h3>Admin Notes</h3>
                  <div className={styles.adminNotesDisplay}>
                    {selectedRefund.admin_notes}
                  </div>
                </div>
              )}
            </div>

            {selectedRefund.status === "REQUESTED" && (
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
      {showProcessModal && processingAction && selectedRefund && (
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
                {processingAction === "APPROVE" ? "Approve" : "Reject"} Refund
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
                  <strong>{processingAction.toLowerCase()}</strong> refund
                  request:
                </p>
                <div className={styles.processInfoDetails}>
                  <span>
                    <strong>Transaction ID:</strong>{" "}
                    {selectedRefund.transaction_id}
                  </span>
                  <span>
                    <strong>Amount:</strong> {formatAmount(selectedRefund.amount)}
                  </span>
                  <span>
                    <strong>Reason:</strong> {selectedRefund.reason}
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
                className={`${styles.confirmButton} ${
                  processingAction === "REJECT"
                    ? styles.confirmReject
                    : styles.confirmApprove
                }`}
                onClick={handleProcessRefund}
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

export default RefundsPage;
