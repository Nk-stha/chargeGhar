"use client";

import React, { useEffect, useState } from "react";
import styles from "./RentalDetailModal.module.css";
import { FiX, FiUser, FiMapPin, FiBatteryCharging, FiPackage, FiClock, FiDollarSign, FiAlertCircle } from "react-icons/fi";
import { rentalsService } from "../../lib/api/rentals.service";
import { RentalDetail, RentalStatus, PaymentStatus } from "../../types/rentals.types";

interface RentalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  rentalId: string;
}

const RentalDetailModal: React.FC<RentalDetailModalProps> = ({
  isOpen,
  onClose,
  rentalId,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rental, setRental] = useState<RentalDetail | null>(null);

  useEffect(() => {
    if (isOpen && rentalId) {
      fetchRentalDetail();
    }
  }, [isOpen, rentalId]);

  const fetchRentalDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await rentalsService.getRentalDetail(rentalId);

      if (response.success) {
        setRental(response.data);
      } else {
        setError("Failed to fetch rental details");
      }
    } catch (err: any) {
      console.error("Error fetching rental detail:", err);
      setError("Unable to load rental details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: RentalStatus): string => {
    switch (status) {
      case "ACTIVE":
        return styles.statusActive;
      case "COMPLETED":
        return styles.statusCompleted;
      case "PENDING":
        return styles.statusPending;
      case "CANCELLED":
        return styles.statusCancelled;
      case "OVERDUE":
        return styles.statusOverdue;
      default:
        return "";
    }
  };

  const getPaymentStatusClass = (status: PaymentStatus): string => {
    switch (status) {
      case "PAID":
        return styles.paymentPaid;
      case "PENDING":
        return styles.paymentPending;
      case "FAILED":
        return styles.paymentFailed;
      case "REFUNDED":
        return styles.paymentRefunded;
      default:
        return "";
    }
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Rental Details</h2>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <FiX />
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
              <p>Loading rental details...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <FiAlertCircle className={styles.errorIcon} />
              <p className={styles.errorText}>{error}</p>
              <button onClick={fetchRentalDetail} className={styles.retryBtn}>
                Try Again
              </button>
            </div>
          ) : rental ? (
            <>
              {/* Rental Code & Status */}
              <div className={styles.section}>
                <div className={styles.rentalHeader}>
                  <div>
                    <span className={styles.label}>Rental Code</span>
                    <h3 className={styles.rentalCode}>{rental.rental_code}</h3>
                  </div>
                  <div className={styles.statusGroup}>
                    <span className={`${styles.statusBadge} ${getStatusClass(rental.status)}`}>
                      {rentalsService.getStatusLabel(rental.status)}
                    </span>
                    <span className={`${styles.paymentBadge} ${getPaymentStatusClass(rental.payment_status)}`}>
                      {rentalsService.getPaymentStatusLabel(rental.payment_status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <FiUser className={styles.sectionIcon} />
                  <h4 className={styles.sectionTitle}>User Information</h4>
                </div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Username</span>
                    <span className={styles.infoValue}>{rental.user.username}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email</span>
                    <span className={styles.infoValue}>{rental.user.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Phone</span>
                    <span className={styles.infoValue}>
                      {rental.user.phone_number || "N/A"}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>User ID</span>
                    <span className={styles.infoValue}>{rental.user.id}</span>
                  </div>
                </div>
              </div>

              {/* Station Information */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <FiMapPin className={styles.sectionIcon} />
                  <h4 className={styles.sectionTitle}>Station Information</h4>
                </div>
                <div className={styles.stationsContainer}>
                  <div className={styles.stationCard}>
                    <span className={styles.stationLabel}>Pickup Station</span>
                    <h5 className={styles.stationName}>{rental.station.station_name}</h5>
                    <p className={styles.stationSerial}>{rental.station.serial_number}</p>
                    <p className={styles.stationAddress}>{rental.station.address}</p>
                    <span className={styles.slotNumber}>Slot #{rental.slot_number}</span>
                  </div>
                  <div className={styles.stationCard}>
                    <span className={styles.stationLabel}>Return Station</span>
                    <h5 className={styles.stationName}>{rental.return_station.station_name}</h5>
                    <p className={styles.stationSerial}>{rental.return_station.serial_number}</p>
                    <p className={styles.stationAddress}>{rental.return_station.address}</p>
                  </div>
                </div>
              </div>

              {/* Powerbank Information */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <FiBatteryCharging className={styles.sectionIcon} />
                  <h4 className={styles.sectionTitle}>Powerbank Information</h4>
                </div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Serial Number</span>
                    <span className={styles.infoValue}>{rental.powerbank.serial_number}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Model</span>
                    <span className={styles.infoValue}>{rental.powerbank.model}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Battery Level</span>
                    <div className={styles.batteryContainer}>
                      <div className={styles.batteryBar}>
                        <div
                          className={styles.batteryFill}
                          style={{ width: `${rental.powerbank.battery_level}%` }}
                        />
                      </div>
                      <span className={styles.batteryPercent}>{rental.powerbank.battery_level}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Information */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <FiPackage className={styles.sectionIcon} />
                  <h4 className={styles.sectionTitle}>Package Information</h4>
                </div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Package Name</span>
                    <span className={styles.infoValue}>{rental.package.name}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Duration</span>
                    <span className={styles.infoValue}>
                      {rentalsService.formatDuration(rental.package.duration_minutes)}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Package Price</span>
                    <span className={styles.infoValue}>
                      {rentalsService.formatAmount(rental.package.price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rental Timeline */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <FiClock className={styles.sectionIcon} />
                  <h4 className={styles.sectionTitle}>Rental Timeline</h4>
                </div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Created At</span>
                    <span className={styles.infoValue}>
                      {rentalsService.formatDateTime(rental.created_at)}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Started At</span>
                    <span className={styles.infoValue}>
                      {rental.started_at ? rentalsService.formatDateTime(rental.started_at) : "Not started"}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Due At</span>
                    <span className={styles.infoValue}>
                      {rentalsService.formatDateTime(rental.due_at)}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Ended At</span>
                    <span className={styles.infoValue}>
                      {rental.ended_at ? rentalsService.formatDateTime(rental.ended_at) : "Not ended"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment & Charges */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <FiDollarSign className={styles.sectionIcon} />
                  <h4 className={styles.sectionTitle}>Payment & Charges</h4>
                </div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Amount Paid</span>
                    <span className={styles.infoValue}>
                      {rentalsService.formatAmount(rental.amount_paid)}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Overdue Amount</span>
                    <span className={`${styles.infoValue} ${parseFloat(rental.overdue_amount) > 0 ? styles.overdueAmount : ""}`}>
                      {rentalsService.formatAmount(rental.overdue_amount)}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Returned On Time</span>
                    <span className={styles.infoValue}>
                      {rental.is_returned_on_time ? (
                        <span className={styles.successText}>Yes</span>
                      ) : (
                        <span className={styles.errorText}>No</span>
                      )}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Bonus Awarded</span>
                    <span className={styles.infoValue}>
                      {rental.timely_return_bonus_awarded ? (
                        <span className={styles.successText}>Yes</span>
                      ) : (
                        <span className={styles.mutedText}>No</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h4 className={styles.sectionTitle}>Additional Information</h4>
                </div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Extensions Count</span>
                    <span className={styles.infoValue}>{rental.extensions_count}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Issues Count</span>
                    <span className={styles.infoValue}>
                      {rental.issues_count > 0 ? (
                        <span className={styles.warningText}>{rental.issues_count}</span>
                      ) : (
                        rental.issues_count
                      )}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Last Updated</span>
                    <span className={styles.infoValue}>
                      {rentalsService.formatDateTime(rental.updated_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metadata (if exists) */}
              {rental.rental_metadata && Object.keys(rental.rental_metadata).length > 0 && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h4 className={styles.sectionTitle}>Metadata</h4>
                  </div>
                  <div className={styles.metadataContainer}>
                    <pre className={styles.metadata}>
                      {JSON.stringify(rental.rental_metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default RentalDetailModal;
