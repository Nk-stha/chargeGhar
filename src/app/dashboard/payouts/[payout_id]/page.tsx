"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FiInfo,
  FiDollarSign,
  FiUser,
  FiCalendar,
  FiFileText,
  FiAlertCircle,
  FiCheckCircle,
  FiCreditCard,
  FiArrowLeft,
} from "react-icons/fi";
import axiosInstance from "@/lib/axios";
import { PayoutDetail } from "@/types/payout.types";
import PayoutActionModal from "../components/PayoutActionModal";
import styles from "./payoutDetail.module.css";

export default function PayoutDetailPage() {
  const router = useRouter();
  const params = useParams();
  const payoutId = params.payout_id as string;

  const [payout, setPayout] = useState<PayoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchPayoutDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        if (!token) {
          setError("Authentication required. Please login.");
          return;
        }

        const response = await axiosInstance.get(
          `/api/admin/partners/payouts/${payoutId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setPayout(response.data.data);
        } else {
          setError(response.data.message || "Failed to load payout details");
        }
      } catch (err: any) {
        // Handle different error types
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
        } else if (err.response?.status === 403) {
          setError("You don't have permission to view this payout.");
        } else if (err.response?.status === 404) {
          setError("Payout not found. It may have been deleted.");
        } else if (err.response?.status >= 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load payout details. Please check your connection."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (payoutId) {
      fetchPayoutDetail();
    }
  }, [payoutId]);

  const refreshPayoutDetail = async () => {
    try {
      setIsRefreshing(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("Authentication required. Please login.");
        return;
      }

      const response = await axiosInstance.get(
        `/api/admin/partners/payouts/${payoutId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setPayout(response.data.data);
        setError(null);
      } else {
        setError(response.data.message || "Failed to refresh payout details");
      }
    } catch (err: any) {
      // Handle different error types
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to view this payout.");
      } else if (err.response?.status === 404) {
        setError("Payout not found. It may have been deleted.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to refresh payout details. Please check your connection."
        );
      }
    } finally {
      setIsRefreshing(false);
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "#FFA500",
      PROCESSING: "#3B82F6",
      APPROVED: "#10B981",
      COMPLETED: "#47b216",
      REJECTED: "#EF4444",
    };
    return colors[status] || "#aaa";
  };

  const getPayoutTypeLabel = (type: string) => {
    return type === "CHARGEGHAR_TO_FRANCHISE"
      ? "ChargeGhar to Franchise"
      : "ChargeGhar to Vendor";
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading payout details...</p>
        </div>
      </div>
    );
  }

  if (error || !payout) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <FiAlertCircle />
          <p>{error || "Payout not found"}</p>
          <button onClick={() => router.back()} className={styles.backBtn}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <FiArrowLeft /> Back to Payouts
        </button>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1>{formatAmount(payout.amount)}</h1>
            <p className={styles.headerSubtitle}>
              Payout Request • {payout.reference_id}
            </p>
          </div>
          <div className={styles.headerRight}>
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
            {payout.status !== "COMPLETED" && payout.status !== "REJECTED" && (
              <button
                className={styles.actionButton}
                onClick={() => setIsModalOpen(true)}
                disabled={isRefreshing}
              >
                Take Action
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}>
            <FiDollarSign />
          </div>
          <div>
            <p className={styles.statLabel}>Gross Amount</p>
            <p className={styles.statValue}>{formatAmount(payout.amount)}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.orange}`}>
            <FiDollarSign />
          </div>
          <div>
            <p className={styles.statLabel}>VAT Deducted</p>
            <p className={styles.statValue}>{payout.vat_deducted}%</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.purple}`}>
            <FiDollarSign />
          </div>
          <div>
            <p className={styles.statLabel}>Service Charge</p>
            <p className={styles.statValue}>{payout.service_charge_deducted}%</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}>
            <FiCheckCircle />
          </div>
          <div>
            <p className={styles.statLabel}>Net Amount</p>
            <p className={styles.statValue}>{formatAmount(payout.net_amount)}</p>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className={styles.infoGrid}>
        {/* Payout Information */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiInfo />
            <h3>Payout Information</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Payout ID</span>
              <span className={styles.value}>{payout.id}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Reference ID</span>
              <span className={styles.codeValue}>{payout.reference_id}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Payout Type</span>
              <span className={styles.value}>
                {getPayoutTypeLabel(payout.payout_type)}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Status</span>
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
            </div>
          </div>
        </div>

        {/* Partner Information */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiUser />
            <h3>Partner Information</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Partner Name</span>
              <span className={styles.valueHighlight}>{payout.partner_name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Partner Code</span>
              <span className={styles.codeValue}>{payout.partner_code}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Partner ID</span>
              <span className={styles.value}>{payout.partner_id}</span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiDollarSign />
            <h3>Financial Breakdown</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Gross Amount</span>
              <span className={styles.valueHighlight}>
                {formatAmount(payout.amount)}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>VAT Deducted</span>
              <span className={styles.value}>{payout.vat_deducted}%</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Service Charge</span>
              <span className={styles.value}>
                {payout.service_charge_deducted}%
              </span>
            </div>
            <div className={`${styles.infoRow} ${styles.borderTop}`}>
              <span className={styles.labelBold}>Net Payout Amount</span>
              <span className={styles.valueHighlight}>
                {formatAmount(payout.net_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiCreditCard />
            <h3>Bank Details</h3>
          </div>
          <div className={styles.cardBody}>
            {payout.bank_name ? (
              <>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Bank Name</span>
                  <span className={styles.value}>{payout.bank_name}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Account Number</span>
                  <span className={styles.codeValue}>
                    {payout.account_number}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Account Holder</span>
                  <span className={styles.value}>
                    {payout.account_holder_name}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.noData}>
                <FiAlertCircle />
                <p>Bank details not provided</p>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiCalendar />
            <h3>Timeline</h3>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Created At</span>
              <span className={styles.value}>{formatDate(payout.created_at)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Last Updated</span>
              <span className={styles.value}>{formatDate(payout.updated_at)}</span>
            </div>
            {payout.processed_at && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Processed At</span>
                <span className={styles.value}>
                  {formatDate(payout.processed_at)}
                </span>
              </div>
            )}
            {payout.processed_by_name && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Processed By</span>
                <span className={styles.value}>{payout.processed_by_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes & Remarks */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiFileText />
            <h3>Notes & Remarks</h3>
          </div>
          <div className={styles.cardBody}>
            {payout.admin_notes ? (
              <div className={styles.notesBox}>
                <p className={styles.notesLabel}>Admin Notes:</p>
                <p className={styles.notesText}>{payout.admin_notes}</p>
              </div>
            ) : (
              <div className={styles.noData}>
                <p>No admin notes</p>
              </div>
            )}

            {payout.rejection_reason && (
              <div className={`${styles.notesBox} ${styles.rejectionBox}`}>
                <p className={styles.notesLabel}>Rejection Reason:</p>
                <p className={styles.notesText}>{payout.rejection_reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      <PayoutActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payoutId={payoutId}
        currentStatus={payout.status}
        onSuccess={refreshPayoutDetail}
      />
    </div>
  );
}
