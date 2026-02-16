"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import styles from "./rentalDetail.module.css";
import {
  FiArrowLeft,
  FiUser,
  FiMapPin,
  FiPackage,
  FiClock,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiLoader,
  FiCalendar,
  FiTrendingUp,
} from "react-icons/fi";
import { toast } from "sonner";

interface RentalDetail {
  id: string;
  rental_code: string;
  status: string;
  payment_status: string;
  user: {
    id: number;
    username: string | null;
    phone_number: string | null;
    email: string;
  };
  station: {
    id: string;
    station_name: string;
    serial_number: string;
    address: string;
  };
  return_station: {
    id: string;
    station_name: string;
    serial_number: string;
    address: string;
  } | null;
  slot_number: number;
  powerbank: {
    id: string;
    serial_number: string;
    model: string;
  } | null;
  package: {
    id: string;
    name: string;
    duration_minutes: number;
    price: string;
  };
  started_at: string;
  ended_at: string | null;
  due_at: string;
  created_at: string;
  updated_at: string;
  amount_paid: string;
  overdue_amount: string;
  is_returned_on_time: boolean;
  timely_return_bonus_awarded: boolean;
  extensions_count: number;
  issues_count: number;
  rental_metadata: Record<string, any>;
}

export default function RentalDetailPage({
  params,
}: {
  params: Promise<{ rental_id: string }>;
}) {
  const router = useRouter();
  const { rental_id } = use(params);
  const [rental, setRental] = useState<RentalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRentalDetail();
  }, [rental_id]);

  const fetchRentalDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/admin/rentals/${rental_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setRental(data.data);
      } else {
        setError(data.message || "Failed to load rental details");
        toast.error("Failed to load rental details");
      }
    } catch {
      setError("Failed to load rental details");
      toast.error("Failed to load rental details");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: string) => {
    return `Rs. ${parseFloat(amount).toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "#3b82f6",
      COMPLETED: "#22c55e",
      PENDING: "#f59e0b",
      CANCELLED: "#ef4444",
      OVERDUE: "#dc2626",
    };
    return colors[status] || "#888";
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PAID: "#22c55e",
      PENDING: "#f59e0b",
      FAILED: "#ef4444",
      REFUNDED: "#8b5cf6",
    };
    return colors[status] || "#888";
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <FiLoader className={styles.spinner} />
          <p>Loading rental details...</p>
        </div>
      </div>
    );
  }

  if (error || !rental) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <FiXCircle className={styles.errorIcon} />
          <p>{error || "Rental not found"}</p>
          <button onClick={() => router.back()} className={styles.backButton}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <FiArrowLeft /> Back
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Rental Details</h1>
          <span className={styles.rentalCode}>{rental.rental_code}</span>
        </div>
        <div className={styles.statusBadges}>
          <span
            className={styles.statusBadge}
            style={{
              backgroundColor: `${getStatusColor(rental.status)}22`,
              color: getStatusColor(rental.status),
            }}
          >
            {rental.status}
          </span>
          <span
            className={styles.paymentBadge}
            style={{
              backgroundColor: `${getPaymentStatusColor(rental.payment_status)}22`,
              color: getPaymentStatusColor(rental.payment_status),
            }}
          >
            {rental.payment_status}
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={styles.grid}>
        {/* User Information */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiUser className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>User Information</h2>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Username</span>
              <span className={styles.value}>{rental.user.username || "N/A"}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Phone Number</span>
              <span className={styles.value}>{rental.user.phone_number || "N/A"}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>{rental.user.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>User ID</span>
              <span className={styles.value}>#{rental.user.id}</span>
            </div>
          </div>
        </div>

        {/* Station Information */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiMapPin className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Station Information</h2>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Pickup Station</span>
              <span className={styles.value}>{rental.station.station_name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Serial Number</span>
              <span className={styles.value}>{rental.station.serial_number}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Address</span>
              <span className={styles.value}>{rental.station.address}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Slot Number</span>
              <span className={styles.value}>#{rental.slot_number}</span>
            </div>
          </div>
        </div>

        {/* Return Station Information */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiMapPin className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Return Station</h2>
          </div>
          <div className={styles.cardContent}>
            {rental.return_station ? (
              <>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Station Name</span>
                  <span className={styles.value}>{rental.return_station.station_name}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Serial Number</span>
                  <span className={styles.value}>{rental.return_station.serial_number}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Address</span>
                  <span className={styles.value}>{rental.return_station.address}</span>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <FiAlertCircle />
                <span>Not returned yet</span>
              </div>
            )}
          </div>
        </div>

        {/* PowerBank Information */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiPackage className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>PowerBank Information</h2>
          </div>
          <div className={styles.cardContent}>
            {rental.powerbank ? (
              <>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Serial Number</span>
                  <span className={styles.value}>{rental.powerbank.serial_number}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Model</span>
                  <span className={styles.value}>{rental.powerbank.model}</span>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <FiAlertCircle />
                <span>No powerbank assigned</span>
              </div>
            )}
          </div>
        </div>

        {/* Package Information */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiPackage className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Package Details</h2>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Package Name</span>
              <span className={styles.value}>{rental.package.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Duration</span>
              <span className={styles.value}>{rental.package.duration_minutes} minutes</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Package Price</span>
              <span className={styles.value}>{formatAmount(rental.package.price)}</span>
            </div>
          </div>
        </div>

        {/* Timeline Information */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiClock className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Timeline</h2>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Created At</span>
              <span className={styles.value}>{formatDateTime(rental.created_at)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Started At</span>
              <span className={styles.value}>{formatDateTime(rental.started_at)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Due At</span>
              <span className={styles.value}>{formatDateTime(rental.due_at)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Ended At</span>
              <span className={styles.value}>{formatDateTime(rental.ended_at)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Updated At</span>
              <span className={styles.value}>{formatDateTime(rental.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiDollarSign className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Payment Details</h2>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Amount Paid</span>
              <span className={`${styles.value} ${styles.amountPaid}`}>
                {formatAmount(rental.amount_paid)}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Overdue Amount</span>
              <span className={`${styles.value} ${parseFloat(rental.overdue_amount) > 0 ? styles.overdueAmount : ""}`}>
                {formatAmount(rental.overdue_amount)}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Payment Status</span>
              <span
                className={styles.badge}
                style={{
                  backgroundColor: `${getPaymentStatusColor(rental.payment_status)}22`,
                  color: getPaymentStatusColor(rental.payment_status),
                }}
              >
                {rental.payment_status}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiTrendingUp className={styles.cardIcon} />
            <h2 className={styles.cardTitle}>Additional Information</h2>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Returned On Time</span>
              <span className={styles.value}>
                {rental.is_returned_on_time ? (
                  <span className={styles.successBadge}>
                    <FiCheckCircle /> Yes
                  </span>
                ) : (
                  <span className={styles.errorBadge}>
                    <FiXCircle /> No
                  </span>
                )}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Timely Return Bonus</span>
              <span className={styles.value}>
                {rental.timely_return_bonus_awarded ? (
                  <span className={styles.successBadge}>
                    <FiCheckCircle /> Awarded
                  </span>
                ) : (
                  <span className={styles.mutedText}>Not awarded</span>
                )}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Extensions Count</span>
              <span className={styles.value}>{rental.extensions_count}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Issues Count</span>
              <span className={styles.value}>{rental.issues_count}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
