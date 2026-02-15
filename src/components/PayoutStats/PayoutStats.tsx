"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./PayoutStats.module.css";
import { FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiAlertTriangle, FiLoader } from "react-icons/fi";
import { toast } from "sonner";

interface Payout {
  id: string;
  partner_id: string;
  partner_name: string;
  partner_code: string;
  payout_type: string;
  amount: string;
  net_amount: string;
  bank_name: string | null;
  account_number: string | null;
  account_holder_name: string | null;
  status: string;
  reference_id: string;
  created_at: string;
  processed_at: string | null;
  processed_by_name: string | null;
}

interface PayoutResponse {
  success: boolean;
  message: string;
  data: {
    results: Payout[];
    count: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

const PayoutStats: React.FC = () => {
  const router = useRouter();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/admin/partners/payouts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data: PayoutResponse = await response.json();

      if (data.success) {
        setPayouts(data.data.results);
      } else {
        setError("Failed to load payout statistics");
        toast.error("Failed to load payout statistics");
      }
    } catch {
      setError("Failed to load payout statistics");
      toast.error("Failed to load payout statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <FiLoader className={styles.spinner} />
          <p>Loading payout statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !payouts) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p>{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalAmount = payouts.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);
  const pendingPayouts = payouts.filter((p) => p.status === "PENDING");
  const pendingAmount = pendingPayouts.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);
  const approvedPayouts = payouts.filter((p) => p.status === "APPROVED");
  const approvedAmount = approvedPayouts.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);
  const rejectedPayouts = payouts.filter((p) => p.status === "REJECTED");
  const payoutsWithoutBankInfo = payouts.filter(
    (p) => !p.bank_name || !p.account_number || !p.account_holder_name
  );

  const formatAmount = (amount: string) => {
    return `Rs. ${parseFloat(amount || "0").toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "#fb923c",
      APPROVED: "#22c55e",
      REJECTED: "#ef4444",
      COMPLETED: "#3b82f6",
    };
    return colors[status] || "#888";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <FiDollarSign /> Payout Statistics
        </h2>
      </div>

      <div className={styles.content}>
        <div className={styles.metricsGrid}>
          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/payouts")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(130, 234, 128, 0.1)", color: "#82ea80" }}>
              <FiDollarSign />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Total Payout Amount</span>
              <span className={styles.metricValue}>Rs. {totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/payouts?status=PENDING")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(251, 146, 60, 0.1)", color: "#fb923c" }}>
              <FiClock />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Pending Payouts</span>
              <span className={styles.metricValue}>{pendingPayouts.length}</span>
              <span className={styles.metricSubtext}>Rs. {pendingAmount.toLocaleString()}</span>
            </div>
          </div>

          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/payouts?status=APPROVED")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
              <FiCheckCircle />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Approved Payouts</span>
              <span className={styles.metricValue}>{approvedPayouts.length}</span>
              <span className={styles.metricSubtext}>Rs. {approvedAmount.toLocaleString()}</span>
            </div>
          </div>

          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/payouts?status=REJECTED")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
              <FiXCircle />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Rejected Payouts</span>
              <span className={styles.metricValue}>{rejectedPayouts.length}</span>
            </div>
          </div>

          <div
            className={`${styles.metricCard} ${styles.fraudIndicator}`}
            onClick={() => router.push("/dashboard/payouts")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
              <FiAlertTriangle />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Payouts Without Bank Info</span>
              <span className={styles.metricValue}>{payoutsWithoutBankInfo.length}</span>
              <span className={styles.metricSubtext}>⚠️ Requires attention</span>
            </div>
          </div>
        </div>

        {/* Recent Payouts */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <FiClock /> Recent Payout Requests
          </h3>
          <div className={styles.payoutList}>
            {payouts.slice(0, 5).map((payout) => (
              <div key={payout.id} className={styles.payoutItem}>
                <div className={styles.payoutInfo}>
                  <span className={styles.payoutPartner}>{payout.partner_name}</span>
                  <span className={styles.payoutDate}>{formatDate(payout.created_at)}</span>
                </div>
                <div className={styles.payoutDetails}>
                  <span className={styles.payoutAmount}>{formatAmount(payout.amount)}</span>
                  <span
                    className={styles.payoutStatus}
                    style={{
                      backgroundColor: `${getStatusColor(payout.status)}22`,
                      color: getStatusColor(payout.status),
                    }}
                  >
                    {payout.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayoutStats;
