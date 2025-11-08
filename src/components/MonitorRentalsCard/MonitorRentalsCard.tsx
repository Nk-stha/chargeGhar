"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./MonitorRentalsCard.module.css";
import {
  FiClock,
  FiZap,
  FiMapPin,
  FiUser,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";
import { rentalsService } from "../../lib/api/rentals.service";
import { RentalListItem, RentalStatus } from "../../types/rentals.types";

const MonitorRentalsCard: React.FC = () => {
  const [rentals, setRentals] = useState<RentalListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchActiveRentals = useCallback(async () => {
    try {
      setError(null);
      const response = await rentalsService.getRentals({
        page: 1,
        page_size: 5,
      });

      if (response.success) {
        setRentals(response.data.results);
      } else {
        setError("Failed to fetch rentals");
      }
    } catch (err: any) {
      console.error("Error fetching recent rentals:", err);
      setError("Unable to load rentals data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveRentals();
  }, [fetchActiveRentals]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchActiveRentals();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchActiveRentals]);

  const getStatusClass = (status: RentalStatus): string => {
    switch (status) {
      case "ACTIVE":
        return styles.active;
      case "COMPLETED":
        return styles.completed;
      case "PENDING":
        return styles.pending;
      case "CANCELLED":
        return styles.cancelled;
      case "OVERDUE":
        return styles.overdue;
      default:
        return styles.pending;
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchActiveRentals();
  };

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Monitor Rentals</h2>
          <span className={styles.subtitle}>Recent Activity</span>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading recent rentals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Monitor Rentals</h2>
          <span className={styles.subtitle}>Recent Activity</span>
        </div>
        <div className={styles.errorContainer}>
          <FiAlertCircle className={styles.errorIcon} />
          <p className={styles.errorText}>{error}</p>
          <button onClick={handleRefresh} className={styles.retryButton}>
            <FiRefreshCw /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (rentals.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2>Monitor Rentals</h2>
            <span className={styles.subtitle}>Recent Activity</span>
          </div>
          <button
            onClick={handleRefresh}
            className={styles.refreshButton}
            title="Refresh"
          >
            <FiRefreshCw />
          </button>
        </div>
        <div className={styles.noData}>
          <FiZap className={styles.noDataIcon} />
          <p>No recent rentals at the moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Monitor Rentals</h2>
          <span className={styles.subtitle}>
            Recent {rentals.length} Rental{rentals.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className={styles.headerRight}>
          <label className={styles.autoRefreshLabel}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto</span>
          </label>
          <button
            onClick={handleRefresh}
            className={styles.refreshButton}
            title="Refresh"
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>

      <div className={styles.list}>
        {rentals.map((rental) => {
          const isOverdue = rentalsService.isOverdue(rental);
          const timeInfo = rental.due_at
            ? rentalsService.getTimeUntilDue(rental.due_at)
            : "N/A";

          return (
            <div key={rental.id} className={styles.item}>
              <div className={styles.iconContainer}>
                <FiZap className={styles.icon} />
              </div>

              <div className={styles.details}>
                <div className={styles.mainInfo}>
                  <h3 className={styles.rentalCode}>{rental.rental_code}</h3>
                  <div
                    className={`${styles.status} ${getStatusClass(
                      isOverdue ? "OVERDUE" : rental.status,
                    )}`}
                  >
                    {isOverdue
                      ? "Overdue"
                      : rentalsService.getStatusLabel(rental.status)}
                  </div>
                </div>

                <div className={styles.subInfo}>
                  <div className={styles.infoItem}>
                    <FiUser size={12} />
                    <span>{rental.username}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <FiMapPin size={12} />
                    <span>{rental.station_name}</span>
                  </div>
                </div>

                <div className={styles.timeInfo}>
                  <FiClock size={14} />
                  <span
                    className={
                      isOverdue ? styles.overdueTime : styles.normalTime
                    }
                  >
                    {timeInfo}
                  </span>
                </div>
              </div>

              <div className={styles.packageInfo}>
                <div className={styles.packageName}>{rental.package_name}</div>
                <div className={styles.packageDuration}>
                  {rentalsService.formatDuration(rental.package_duration)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <span className={styles.lastUpdated}>
          Auto-refresh: {autoRefresh ? "On" : "Off"}
        </span>
        <a href="/dashboard/rentals" className={styles.viewAllLink}>
          View All Rentals →
        </a>
      </div>
    </div>
  );
};

export default MonitorRentalsCard;
