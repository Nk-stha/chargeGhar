"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./kyc.module.css";
import {
  FiFileText,
  FiSearch,
  FiEye,
  FiFilter,
  FiRefreshCw,
  FiEdit,
  FiSave,
  FiClock,
  FiCheckCircle,
  FiXCircle,
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
  const [selectedSubmission, setSelectedSubmission] =
    useState<KYCSubmission | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [editStatus, setEditStatus] = useState<string>("");
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
      setError(
        err.response?.data?.message || "Failed to fetch KYC submissions",
      );
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

  const handleEditClick = (submission: KYCSubmission) => {
    setSelectedSubmission(submission);
    setModalMode("edit");
    setEditStatus(submission.status);
    setRejectionReason(submission.rejection_reason || "");
    setShowModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedSubmission) return;

    if (editStatus === "REJECTED" && !rejectionReason.trim()) {
      alert("Please provide a rejection reason when status is REJECTED");
      return;
    }

    if (!editStatus) {
      alert("Please select a status");
      return;
    }

    setProcessing(true);
    try {
      const response = await axiosInstance.patch(
        `/api/admin/kyc/${selectedSubmission.id}`,
        {
          status: editStatus,
          rejection_reason:
            editStatus === "REJECTED" ? rejectionReason : undefined,
        },
      );

      if (response.data.success) {
        await fetchSubmissions();
        setShowModal(false);
        setSelectedSubmission(null);
        setRejectionReason("");
        setEditStatus("");
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
          sub.document_type.toLowerCase().includes(q),
      );
    }

    return list;
  }, [submissions, search, statusFilter]);

  const closeModal = () => {
    setShowModal(false);
    setSelectedSubmission(null);
    setModalMode("view");
    setEditStatus("");
    setRejectionReason("");
  };

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
        {/* Total Submissions */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiFileText />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Submissions</p>
            <h3 className={styles.statValue}>
              {pagination?.total_count || 0}
            </h3>
            <p className={styles.statSubtext}>All KYC requests</p>
          </div>
        </div>

        {/* Pending */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiClock />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Pending</p>
            <h3 className={styles.statValue}>
              {submissions.filter((s) => s.status === "PENDING").length}
            </h3>
            <p className={styles.statSubtext}>Awaiting review</p>
          </div>
        </div>

        {/* Approved */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiCheckCircle />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Approved</p>
            <h3 className={styles.statValue}>
              {submissions.filter((s) => s.status === "APPROVED").length}
            </h3>
            <p className={styles.statSubtext}>Successfully verified</p>
          </div>
        </div>

        {/* Rejected */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiXCircle />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Rejected</p>
            <h3 className={styles.statValue}>
              {submissions.filter((s) => s.status === "REJECTED").length}
            </h3>
            <p className={styles.statSubtext}>Need resubmission</p>
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
                        <div className={styles.userEmail}>
                          {submission.email}
                        </div>
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
                        className={`${styles.statusBadge} ${submission.status === "APPROVED"
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
                        <button
                          className={styles.editBtn}
                          onClick={() => handleEditClick(submission)}
                          title="Edit KYC status"
                        >
                          <FiEdit />
                        </button>
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
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modalMode === "view"
                  ? "KYC Submission Details"
                  : "Edit KYC Status"}
              </h2>
              <button className={styles.modalClose} onClick={closeModal}>
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
                  {selectedSubmission.phone_number && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Phone:</span>
                      <span className={styles.detailValue}>
                        {selectedSubmission.phone_number}
                      </span>
                    </div>
                  )}
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
                      className={`${styles.statusBadge} ${selectedSubmission.status === "APPROVED"
                        ? styles.statusApproved
                        : selectedSubmission.status === "REJECTED"
                          ? styles.statusRejected
                          : styles.statusPending
                        }`}
                    >
                      {selectedSubmission.status}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Submitted:</span>
                    <span className={styles.detailValue}>
                      {new Date(selectedSubmission.created_at).toLocaleString()}
                    </span>
                  </div>
                  {selectedSubmission.verified_by_username && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Verified By:</span>
                      <span className={styles.detailValue}>
                        {selectedSubmission.verified_by_username}
                      </span>
                    </div>
                  )}
                  {selectedSubmission.verified_at && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Verified At:</span>
                      <span className={styles.detailValue}>
                        {new Date(
                          selectedSubmission.verified_at,
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
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
                  <div className={styles.editForm}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>User:</span>
                      <span className={styles.detailValue}>
                        {selectedSubmission.username} (
                        {selectedSubmission.email})
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>
                        Current Status:
                      </span>
                      <span
                        className={`${styles.statusBadge} ${selectedSubmission.status === "APPROVED"
                          ? styles.statusApproved
                          : selectedSubmission.status === "REJECTED"
                            ? styles.statusRejected
                            : styles.statusPending
                          }`}
                      >
                        {selectedSubmission.status}
                      </span>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="statusSelect">
                        New Status <span style={{ color: "#ff4444" }}>*</span>
                      </label>
                      <select
                        id="statusSelect"
                        className={styles.selectInput}
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                      >
                        <option value="">Select Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>

                    {editStatus === "REJECTED" && (
                      <div className={styles.formGroup}>
                        <label htmlFor="rejectionReason">
                          Rejection Reason{" "}
                          <span style={{ color: "#ff4444" }}>*</span>
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

                    {editStatus && editStatus !== selectedSubmission.status && (
                      <div className={styles.changeNotice}>
                        <p>
                          <strong>Status Change:</strong>{" "}
                          {selectedSubmission.status} → {editStatus}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              {modalMode === "view" ? (
                <>
                  <button
                    className={styles.modalBtnSecondary}
                    onClick={closeModal}
                  >
                    Close
                  </button>
                  <button
                    className={styles.modalBtnPrimary}
                    onClick={() => {
                      setModalMode("edit");
                      setEditStatus(selectedSubmission.status);
                    }}
                  >
                    <FiEdit /> Edit Status
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={styles.modalBtnSecondary}
                    onClick={closeModal}
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.modalBtnPrimary}
                    onClick={handleStatusUpdate}
                    disabled={processing || !editStatus}
                  >
                    {processing ? (
                      <>
                        <FiRefreshCw className={styles.spinIcon} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave /> Save Changes
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
