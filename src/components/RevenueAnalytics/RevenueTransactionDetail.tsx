"use client";

import React, { useEffect } from "react";
import {
  FiX,
  FiInfo,
  FiDollarSign,
  FiGitBranch,
  FiClock,
  FiZap,
  FiCreditCard,
  FiPlay,
  FiSquare,
} from "react-icons/fi";
import styles from "./RevenueAnalytics.module.css";
import { RevenueTransaction } from "../../types/revenueAnalytics";

interface RevenueTransactionDetailProps {
  transaction: RevenueTransaction;
  onClose: () => void;
}

const RevenueTransactionDetail: React.FC<RevenueTransactionDetailProps> = ({
  transaction: tx,
  onClose,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const formatAmount = (amount: string) => `NPR ${parseFloat(amount).toFixed(2)}`;

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("en-CA"),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
    };
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

  const createdAt = formatDateTime(tx.created_at);
  const startedAt = formatDateTime(tx.started_at);
  const endedAt = formatDateTime(tx.ended_at);

  return (
    <div
      className={styles.detailOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.detailPanel} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.detailHeader}>
          <div>
            <h2 className={styles.detailTitle}>Transaction Details</h2>
            <p className={styles.detailSubtitle}>
              {tx.rental_code ? (
                <>
                  For Rental{" "}
                  <span className={styles.rentalCode}>{tx.rental_code}</span>
                </>
              ) : (
                <>
                  Transaction{" "}
                  <span className={styles.rentalCode}>{tx.transaction_id}</span>
                </>
              )}
            </p>
          </div>
          <button
            className={styles.detailCloseButton}
            onClick={onClose}
            aria-label="Close detail panel"
          >
            <FiX />
          </button>
        </div>

        <div className={styles.detailContent}>
          {/* Section 1: Core Transaction Information */}
          <section className={styles.detailSection}>
            <div className={styles.sectionHeader}>
              <FiInfo className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>
                Core Transaction Information
              </h3>
            </div>
            <div className={`${styles.detailGrid} ${styles.detailGrid4}`}>
              <div>
                <label className={styles.detailFieldLabel}>
                  Transaction ID
                </label>
                <p className={styles.detailFieldValue}>{tx.transaction_id}</p>
              </div>
              <div>
                <label className={styles.detailFieldLabel}>Rental Code</label>
                <p className={styles.detailFieldValue}>
                  {tx.rental_code || "N/A"}
                </p>
              </div>
              <div>
                <label className={styles.detailFieldLabel}>Status</label>
                <div style={{ paddingTop: "0.25rem" }}>
                  <span
                    className={`${styles.statusBadge} ${getStatusClass(
                      tx.transaction_status
                    )}`}
                  >
                    <span className={styles.statusDot} />
                    {tx.transaction_status}
                  </span>
                </div>
              </div>
              <div>
                <label className={styles.detailFieldLabel}>
                  Payment Method
                </label>
                <div className={styles.paymentMethodBadge}>
                  <FiCreditCard className={styles.paymentMethodIcon} />
                  <span>{tx.payment_method}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Financial Breakdown */}
          <section className={styles.detailSection} style={{ position: "relative", overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "8rem",
                height: "8rem",
                background: "rgba(84, 188, 40, 0.05)",
                filter: "blur(48px)",
                borderRadius: "50%",
                marginRight: "-4rem",
                marginTop: "-4rem",
                pointerEvents: "none",
              }}
            />
            <div className={styles.sectionHeader}>
              <FiDollarSign className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Financial Breakdown</h3>
            </div>
            <div className={`${styles.detailGrid} ${styles.detailGrid4}`}>
              <div className={styles.financeCard}>
                <label className={styles.financeLabel}>Gross Amount</label>
                <div className={styles.financeValue}>
                  {formatAmount(tx.gross_amount)}
                </div>
              </div>
              <div className={styles.financeCard}>
                <label className={styles.financeLabel}>VAT Amount (13%)</label>
                <div className={styles.financeValue}>
                  {formatAmount(tx.vat_amount)}
                </div>
              </div>
              <div className={styles.financeCard}>
                <label className={styles.financeLabel}>Service Charge</label>
                <div className={styles.financeValue}>
                  {formatAmount(tx.service_charge)}
                </div>
              </div>
              <div
                className={`${styles.financeCard} ${styles.financeCardHighlight}`}
              >
                <label
                  className={`${styles.financeLabel} ${styles.financeLabelHighlight}`}
                >
                  Net Amount
                </label>
                <div className={styles.financeValueHighlight}>
                  {formatAmount(tx.net_amount)}
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Revenue Distribution */}
          <section className={styles.detailSection}>
            <div className={styles.distributionHeader}>
              <div className={styles.sectionHeader} style={{ marginBottom: 0 }}>
                <FiGitBranch className={styles.sectionIcon} />
                <h3 className={styles.sectionTitle}>Revenue Distribution</h3>
              </div>
              <div className={styles.distributedBadge}>
                <span className={styles.distributedLabel}>Distributed At</span>
                <span className={styles.distributedDate}>
                  {tx.distributed_at
                    ? formatDateTime(tx.distributed_at)?.date +
                      " " +
                      formatDateTime(tx.distributed_at)?.time
                    : "—"}
                </span>
                <span
                  className={`${
                    tx.is_distributed
                      ? styles.distributedTag
                      : `${styles.distributedTag} ${styles.distributedTagPending}`
                  }`}
                >
                  {tx.is_distributed ? "DISTRIBUTED" : "PENDING"}
                </span>
              </div>
            </div>
            <div className={`${styles.detailGrid} ${styles.detailGrid3}`}>
              <div className={styles.shareCard}>
                <div className={styles.shareInfo}>
                  <p>ChargeGhar Share</p>
                  <p>{formatAmount(tx.chargeghar_share)}</p>
                </div>
                <div
                  className={`${styles.shareIcon} ${
                    parseFloat(tx.chargeghar_share) > 0
                      ? styles.shareIconPrimary
                      : styles.shareIconMuted
                  }`}
                >
                  <FiZap />
                </div>
              </div>
              <div className={styles.shareCard}>
                <div className={styles.shareInfo}>
                  <p>Franchise Share</p>
                  <p>{formatAmount(tx.franchise_share)}</p>
                </div>
                <div
                  className={`${styles.shareIcon} ${
                    parseFloat(tx.franchise_share) > 0
                      ? styles.shareIconPrimary
                      : styles.shareIconMuted
                  }`}
                >
                  <FiDollarSign />
                </div>
              </div>
              <div className={styles.shareCard}>
                <div className={styles.shareInfo}>
                  <p>Vendor Share</p>
                  <p>{formatAmount(tx.vendor_share)}</p>
                </div>
                <div
                  className={`${styles.shareIcon} ${
                    parseFloat(tx.vendor_share) > 0
                      ? styles.shareIconPrimary
                      : styles.shareIconMuted
                  }`}
                >
                  <FiDollarSign />
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Hardware & Timing */}
          <section className={styles.detailSection}>
            <div className={styles.sectionHeader}>
              <FiClock className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Hardware &amp; Timing</h3>
            </div>
            <div className={`${styles.detailGrid} ${styles.detailGrid3}`}>
              {/* Station Information */}
              <div className={styles.timingItem}>
                <span className={styles.timingLabel}>Station Information</span>
                <div className={styles.timingContent}>
                  <div className={styles.timingIcon}>
                    <FiZap />
                  </div>
                  <div>
                    <p className={styles.timingDate}>{tx.station_name}</p>
                    <p className={styles.stationSerial}>SN: {tx.station_sn}</p>
                  </div>
                </div>
              </div>

              {/* Start Time */}
              <div className={styles.timingItem}>
                <span className={styles.timingLabel}>Start Time</span>
                <div className={styles.timingContent}>
                  <div className={styles.timingIcon}>
                    <FiPlay />
                  </div>
                  <div>
                    {startedAt ? (
                      <>
                        <p className={styles.timingDate}>{startedAt.date}</p>
                        <p className={styles.timingTime}>{startedAt.time}</p>
                      </>
                    ) : (
                      <p className={styles.timingNa}>Not available</p>
                    )}
                  </div>
                </div>
              </div>

              {/* End Time */}
              <div className={styles.timingItem}>
                <span className={styles.timingLabel}>End Time</span>
                <div className={styles.timingContent}>
                  <div className={styles.timingIcon}>
                    <FiSquare />
                  </div>
                  <div>
                    {endedAt ? (
                      <>
                        <p className={styles.timingDate}>{endedAt.date}</p>
                        <p
                          className={`${styles.timingTime} ${styles.timingTimeEnd}`}
                        >
                          {endedAt.time}
                        </p>
                      </>
                    ) : (
                      <p className={styles.timingNa}>Not available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RevenueTransactionDetail;
