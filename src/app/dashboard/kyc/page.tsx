"use client";

import React, { useState, useEffect, useMemo } from "react";
import styles from "./kyc.module.css";
import {
  FiFileText,
  FiSearch,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiFilter,
  FiRefreshCw,
} from "react-icons/fi";
import axiosInstance from "@/lib/axios";

interface KYCSubmission {
  id: string;
  user_id: string;
  username: string;
  email: string;
  phone_number: string | null;
  document_type: string;
  document_number: string;
  document_front_url: string;
  document_back_url: string | null;
  status: string;
  verified_at: string | null;
  verified_by_username: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
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

export default function KYCPage() {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showModal, setShowModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "approve" | "reject">("view");
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/api/admin/kyc");
      if (response.data.success) {
        setSubmissions(response.data.data.kyc_submissions);
        setPagination(response.data.data.pagination);
      } else {
        setError("Failed to fetch KYC submissions");
      }
    } catch (err: any) {
      console.error("Error fetching KYC submissions:", err);
      setError(err.response?.data?.message || "Failed to fetch KYC submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleViewSubmission = (submission: KYCSubmission) => {
    setSelectedSubmission(submission);
    setModalMode("view");
    setShowModal(true);
  };

  const handleApproveClick = (submission: KYCSubmission) => {
    setSelectedSubmission(submission);
    setModalMode("approve");
    setRejectionReason("");
    setShowModal(true);
  };

  const handleRejectClick = (submission: KYCSubmission) => {
    setSelectedSubmission(submission);
    setModalMode("reject");
    setRejectionReason("");
    setShowModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedSubmission) return;

    if (modalMode === "reject" && !rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setProcessing(true);
    try {
      const response = await axiosInstance.patch(
        `/api/admin/kyc/${selectedSubmission.id}`,
        {
          status: modalMode === "approve" ? "APPROVED" : "REJECTED",
          rejection_reason: modalMode === "reject" ? rejectionReason : undefined,
        }
      );

      if (response.data.success) {
        await fetchSubmissions();
        setShowModal(false);
        setSelectedSubmission(null);
        setRejectionReason("");
      } else {
        alert("Failed to update KYC status");
      }
    } catch (err: any) {
      console.error("Error updating KYC status:", err);
      alert(err.response?.data?.message || "Failed to update KYC status");
    } finally {
      setProcessing(false);
    }
  };

  const filteredSubmissions = useMemo(() => {
    let list = [...submissions];

    // Filter by status
    if (statusFilter !== "ALL") {
      list = list.filter((sub) => sub.status === statusFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (sub) =>
          sub.username.toLowerCase().includes(q) ||
          sub.email.toLowerCase().includes(q) ||
          sub.document_number.toLowerCase().includes(q) ||
          sub.document_type.toLowerCase().includes(q)
      );
    }

    return list;
  }, [submissions, search, statusFilter]);

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingContainer}>
          <FiRefreshCw className={styles.spinIcon} />
          <p>Loading KYC submissions...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>KYC Verification</h1>
        <p className={styles.subtitle}>
          Review and manage user KYC document submissions
        </p>
      </header>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Submissions</div>
          <div className={styles.statValue}>{pagination?.total_count || 0}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Pending</div>
          <div className={styles.statValue} style={{ color: "#ff8c00" }}>
            {submissions.filter((s) => s.status === "PENDING").length}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Approved</div>
          <div className={styles.statValue} style={{ color: "#32cd32" }}>
            {submissions.filter((s) => s.status === "APPROVED").length}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Rejected</div>
          <div className={styles.statValue} style={{ color: "#ff4444" }}>
            {submissions.filter((s) => s.status === "REJECTED").length}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            className={styles.search}
            placeholder="Search by username, email, document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className={styles.clearBtn}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className={styles.filterWrapper}>
          <FiFilter className={styles.filterIcon} />
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <button className={styles.refreshBtn} onClick={fetchSubmissions}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {/* KYC Submissions Table */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <FiFileText className={styles.icon} /> KYC Submissions
          </div>
          <p className={styles.cardSubText}>
            Review user document submissions and verify identity
          </p>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Document Type</th>
                <th>Document Number</th>
                <th>Status</th>
                <th>Submitted Date</th>
                <th>Verified By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyState}>
                    {search || statusFilter !== "ALL"
                      ? "No submissions match your filters"
                      : "No KYC submissions found"}
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>
                          {submission.username}
                        </div>
                        <div className={styles.userEmail}>{submission.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.docType}>
                        {submission.document_type}
                      </span>
                    </td>
                    <td>{submission.document_number}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          submission.status === "APPROVED"
                            ? styles.statusApproved
                            : submission.status === "REJECTED"
                            ? styles.statusRejected
                            : styles.statusPending
                        }`}
                      >
                        {submission.status}
                      </span>
                    </td>
                    <td>
                      {new Date(submission.created_at).toLocaleDateString()}
                    </td>
                    <td>{submission.verified_by_username || "—"}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.viewBtn}
                          onClick={() => handleViewSubmission(submission)}
                          title="View details"
                        >
                          <FiEye />
                        </button>
                        {submission.status === "PENDING" && (
                          <>
                            <button
                              className={styles.approveBtn}
                              onClick={() => handleApproveClick(submission)}
                              title="Approve"
                            >
                              <FiCheckCircle />
                            </button>
                            <button
                              className={styles.rejectBtn}
                              onClick={() => handleRejectClick(submission)}
                              title="Reject"
                            >
                              <FiXCircle />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal */}
      {showModal && selectedSubmission && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalMode === "view"
                  ? "KYC Submission Details"
                  : modalMode === "approve"
                  ? "Approve KYC Submission"
                  : "Reject KYC Submission"}
              </h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {modalMode === "view" ? (
                <>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>User:</span>
                    <span className={styles.detailValue}>
                      {selectedSubmission.username} ({selectedSubmission.email})
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Document Type:</span>
                    <span className={styles.detailValue}>
                      {selectedSubmission.document_type}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Document Number:</span>
                    <span className={styles.detailValue}>
                      {selectedSubmission.document_number}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Status:</span>
                    <span
                      className={`${styles.statusBadge} ${
                        selectedSubmission.status === "APPROVED"
                          ? styles.statusApproved
                          : selectedSubmission.status === "REJECTED"
                          ? styles.statusRejected
                          : styles.statusPending
                      }`}
                    >
                      {selectedSubmission.status}
                    </span>
                  </div>
                  {selectedSubmission.rejection_reason && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>
                        Rejection Reason:
                      </span>
                      <span className={styles.detailValue}>
                        {selectedSubmission.rejection_reason}
                      </span>
                    </div>
                  )}
                  <div className={styles.documentsSection}>
                    <h3>Documents</h3>
                    <div className={styles.documentImages}>
                      {selectedSubmission.document_front_url && (
                        <div className={styles.docImageWrapper}>
                          <p>Front</p>
                          <img
                            src={selectedSubmission.document_front_url}
                            alt="Document Front"
                            className={styles.docImage}
                          />
                        </div>
                      )}
                      {selectedSubmission.document_back_url && (
                        <div className={styles.docImageWrapper}>
                          <p>Back</p>
                          <img
                            src={selectedSubmission.document_back_url}
                            alt="Document Back"
                            className={styles.docImage}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className={styles.confirmText}>
                    {modalMode === "approve"
                      ? `Are you sure you want to approve the KYC submission for ${selectedSubmission.username}?`
                      : `Are you sure you want to reject the KYC submission for ${selectedSubmission.username}?`}
                  </p>
                  {modalMode === "reject" && (
                    <div className={styles.formGroup}>
                      <label htmlFor="rejectionReason">
                        Rejection Reason <span style={{ color: "#ff4444" }}>*</span>
                      </label>
                      <textarea
                        id="rejectionReason"
                        className={styles.textarea}
                        placeholder="Please provide a reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              {modalMode === "view" ? (
                <>
                  <button
                    className={styles.modalBtnSecondary}
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  {selectedSubmission.status === "PENDING" && (
                    <>
                      <button
                        className={styles.modalBtnApprove}
                        onClick={() => {
                          setModalMode("approve");
                        }}
                      >
                        <FiCheckCircle /> Approve
                      </button>
                      <button
                        className={styles.modalBtnReject}
                        onClick={() => {
                          setModalMode("reject");
                        }}
                      >
                        <FiXCircle /> Reject
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <button
                    className={styles.modalBtnSecondary}
                    onClick={() => setShowModal(false)}
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    className={
                      modalMode === "approve"
                        ? styles.modalBtnApprove
                        : styles.modalBtnReject
                    }
                    onClick={handleStatusUpdate}
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <FiRefreshCw className={styles.spinIcon} />
                        Processing...
                      </>
                    ) : (
                      <>
                        {modalMode === "approve" ? (
                          <>
                            <FiCheckCircle /> Confirm Approval
                          </>
                        ) : (
                          <>
                            <FiXCircle /> Confirm Rejection
                          </>
                        )}
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
