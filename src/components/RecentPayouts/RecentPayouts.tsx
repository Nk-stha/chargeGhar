"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./RecentPayouts.module.css";
import { FiDollarSign, FiLoader, FiXCircle, FiArrowRight } from "react-icons/fi";
import axiosInstance from "@/lib/axios";

interface PayoutRequest {
  id: string;
  partner_name: string;
  partner_code: string;
  payout_type: string;
  amount: string;
  status: string;
  created_at: string;
  processed_by_name: string | null;
}

interface PayoutData {
  results: PayoutRequest[];
  count: number;
}

const RecentPayouts: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<PayoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.get("/api/admin/partners/payouts?page=1&page_size=5", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response?.data?.success) {
        setData(response.data.data);
      } else {
        setError("Failed to load data");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string) => {
    const numAmount = parseFloat(amount ?? "0");
    return `NPR ${numAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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
      PENDING: "#FFA500",
      PROCESSING: "#3B82F6",
      APPROVED: "#10B981",
      COMPLETED: "#47b216",
      REJECTED: "#EF4444",
    };
    return colors[status] || "#888";
  };

  const getPayoutTypeLabel = (type: string) => {
    return type === "CHARGEGHAR_TO_FRANCHISE" ? "Franchise" : "Vendor";
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <FiLoader className={styles.spinner} />
          <p>Loading recent payouts...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <FiXCircle className={styles.errorIcon} />
          <p>{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <FiDollarSign className={styles.headerIcon} />
          <h2 className={styles.title}>Recent Payouts</h2>
        </div>
        <button 
          className={styles.viewAllBtn}
          onClick={() => router.push('/dashboard/payouts')}
        >
          View All
          <FiArrowRight />
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Partner Name</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Requested Date</th>
              <th>Processed By</th>
            </tr>
          </thead>
          <tbody>
            {data.results && data.results.length > 0 ? (
              data.results.map((payout) => (
                <tr 
                  key={payout?.id ?? Math.random()}
                  onClick={() => router.push(`/dashboard/payouts/${payout?.id}`)}
                  className={styles.tableRow}
                >
                  <td>
                    <div className={styles.partnerInfo}>
                      <span className={styles.partnerName}>{payout?.partner_name ?? "N/A"}</span>
                      <span className={styles.partnerCode}>{payout?.partner_code ?? "N/A"}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.typeBadge}>
                      {getPayoutTypeLabel(payout?.payout_type ?? "")}
                    </span>
                  </td>
                  <td>
                    <span className={styles.amount}>{formatAmount(payout?.amount ?? "0")}</span>
                  </td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: `${getStatusColor(payout?.status ?? "PENDING")}22`,
                        color: getStatusColor(payout?.status ?? "PENDING"),
                        borderColor: getStatusColor(payout?.status ?? "PENDING"),
                      }}
                    >
                      {payout?.status ?? "PENDING"}
                    </span>
                  </td>
                  <td>
                    <span className={styles.date}>{formatDate(payout?.created_at ?? "")}</span>
                  </td>
                  <td>
                    <span className={styles.processedBy}>
                      {payout?.processed_by_name ?? "-"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  No payout requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Card Layout for Mobile */}
      <div className={styles.cardLayout}>
        {data.results && data.results.length > 0 ? (
          data.results.map((payout) => (
            <div
              key={payout?.id ?? Math.random()}
              className={styles.card}
              onClick={() => router.push(`/dashboard/payouts/${payout?.id}`)}
            >
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Partner</span>
                <div className={styles.cardValue}>
                  <div>{payout?.partner_name ?? "N/A"}</div>
                  <div className={styles.cardSubtext}>{payout?.partner_code ?? "N/A"}</div>
                </div>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Type</span>
                <span className={styles.typeBadge}>
                  {getPayoutTypeLabel(payout?.payout_type ?? "")}
                </span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Amount</span>
                <span className={styles.amount}>{formatAmount(payout?.amount ?? "0")}</span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Status</span>
                <span
                  className={styles.statusBadge}
                  style={{
                    backgroundColor: `${getStatusColor(payout?.status ?? "PENDING")}22`,
                    color: getStatusColor(payout?.status ?? "PENDING"),
                    borderColor: getStatusColor(payout?.status ?? "PENDING"),
                  }}
                >
                  {payout?.status ?? "PENDING"}
                </span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Requested</span>
                <span className={styles.date}>{formatDate(payout?.created_at ?? "")}</span>
              </div>

              {payout?.processed_by_name && (
                <div className={styles.cardRow}>
                  <span className={styles.cardLabel}>Processed By</span>
                  <span className={styles.processedBy}>{payout.processed_by_name}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>No payout requests found</div>
        )}
      </div>
    </div>
  );
};

export default RecentPayouts;
