"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./RentalStats.module.css";
import { FiShoppingBag, FiDollarSign, FiClock, FiCheckCircle, FiAlertCircle, FiLoader } from "react-icons/fi";
import { toast } from "sonner";

interface RentalItem {
  id: string;
  rental_code: string;
  status: string;
  payment_status: string;
  user_id: number;
  username: string | null;
  user_phone: string | null;
  station_id: string;
  station_name: string;
  station_serial: string;
  return_station_id: string | null;
  return_station_name: string | null;
  powerbank_serial: string | null;
  package_name: string;
  package_duration: number;
  started_at: string;
  ended_at: string | null;
  due_at: string;
  amount_paid: string;
  overdue_amount: string;
  is_returned_on_time: boolean;
  created_at: string;
}

interface RentalResponse {
  success: boolean;
  message: string;
  data: {
    results: RentalItem[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      page_size: number;
      has_next: boolean;
      has_previous: boolean;
      next_page: number | null;
      previous_page: number | null;
    };
  };
}

const RentalStats: React.FC = () => {
  const router = useRouter();
  const [rentals, setRentals] = useState<RentalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    fetchRentals();
  }, [startDate, endDate]);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      
      let url = "/api/admin/rentals?page=1&page_size=100";
      
      // Add date filters if present
      if (startDate) {
        const startDateTime = new Date(startDate + 'T00:00:00');
        url += `&start_date=${encodeURIComponent(startDateTime.toISOString())}`;
        
        if (!endDate) {
          const endDateTime = new Date(startDate + 'T23:59:59');
          url += `&end_date=${encodeURIComponent(endDateTime.toISOString())}`;
        }
      }
      
      if (endDate) {
        const endDateTime = new Date(endDate + 'T23:59:59');
        url += `&end_date=${encodeURIComponent(endDateTime.toISOString())}`;
      }
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data: RentalResponse = await response.json();

      if (data.success) {
        setRentals(data.data.results);
      } else {
        setError("Failed to load rental statistics");
        toast.error("Failed to load rental statistics");
      }
    } catch {
      setError("Failed to load rental statistics");
      toast.error("Failed to load rental statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <FiLoader className={styles.spinner} />
          <p>Loading rental statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !rentals) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p>{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalRentals = rentals.length;
  const completedRentals = rentals.filter((r) => r.status === "COMPLETED").length;
  const activeRentals = rentals.filter((r) => r.status === "ACTIVE").length;
  const overdueRentals = rentals.filter((r) => r.status === "OVERDUE").length;
  
  const totalRevenue = rentals.reduce((sum, r) => sum + parseFloat(r.amount_paid || "0"), 0);
  const totalOverdueAmount = rentals.reduce((sum, r) => sum + parseFloat(r.overdue_amount || "0"), 0);
  
  const onTimeReturns = rentals.filter((r) => r.is_returned_on_time).length;
  const onTimePercentage = totalRentals > 0 ? ((onTimeReturns / totalRentals) * 100).toFixed(1) : "0";

  const formatAmount = (amount: string | number) => {
    return `NPR ${parseFloat(amount.toString()).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      COMPLETED: "#22c55e",
      ACTIVE: "#3b82f6",
      OVERDUE: "#ef4444",
      PENDING: "#f59e0b",
      CANCELLED: "#6b7280",
    };
    return colors[status] || "#888";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <FiShoppingBag /> Rental Statistics
        </h2>
      </div>

      {/* Date Filters */}
      <div className={styles.dateFilters}>
        <div className={styles.dateInputGroup}>
          <label htmlFor="rentalStartDate" className={styles.dateLabel}>Start Date:</label>
          <input
            type="date"
            id="rentalStartDate"
            value={startDate}
            onChange={handleStartDateChange}
            className={styles.dateInput}
          />
        </div>
        <div className={styles.dateInputGroup}>
          <label htmlFor="rentalEndDate" className={styles.dateLabel}>End Date:</label>
          <input
            type="date"
            id="rentalEndDate"
            value={endDate}
            onChange={handleEndDateChange}
            className={styles.dateInput}
          />
        </div>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={handleClearFilters}
            className={styles.clearFiltersBtn}
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.metricsGrid}>
          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/rentals")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(130, 234, 128, 0.1)", color: "#82ea80" }}>
              <FiShoppingBag />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Total Rentals</span>
              <span className={styles.metricValue}>{totalRentals}</span>
            </div>
          </div>

          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/rentals?status=COMPLETED")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
              <FiCheckCircle />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Completed</span>
              <span className={styles.metricValue}>{completedRentals}</span>
            </div>
          </div>

          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/rentals?status=ACTIVE")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
              <FiClock />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Active</span>
              <span className={styles.metricValue}>{activeRentals}</span>
            </div>
          </div>

          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/rentals?status=OVERDUE")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
              <FiAlertCircle />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Overdue</span>
              <span className={styles.metricValue}>{overdueRentals}</span>
            </div>
          </div>

          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/rentals")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
              <FiDollarSign />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Total Revenue</span>
              <span className={styles.metricValue}>{formatAmount(totalRevenue)}</span>
            </div>
          </div>

          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/rentals")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
              <FiCheckCircle />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>On-Time Returns</span>
              <span className={styles.metricValue}>{onTimePercentage}%</span>
              <span className={styles.metricSubtext}>{onTimeReturns} of {totalRentals}</span>
            </div>
          </div>
        </div>

        {/* Recent Rentals */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <FiShoppingBag /> Recent Rentals
          </h3>
          <div className={styles.rentalList}>
            {rentals.slice(0, 5).map((rental) => (
              <div
                key={rental.id}
                className={styles.rentalItem}
                onClick={() => router.push(`/dashboard/rentals/${rental.id}`)}
              >
                <div className={styles.rentalInfo}>
                  <span className={styles.rentalCode}>{rental.rental_code}</span>
                  <span className={styles.rentalUser}>
                    {rental.username || rental.user_phone || `User #${rental.user_id}`}
                  </span>
                  <span className={styles.rentalStation}>{rental.station_name}</span>
                </div>
                <div className={styles.rentalDetails}>
                  <span className={styles.rentalAmount}>{formatAmount(rental.amount_paid)}</span>
                  <span
                    className={styles.rentalStatus}
                    style={{ color: getStatusColor(rental.status) }}
                  >
                    {rental.status}
                  </span>
                  <span className={styles.rentalDate}>{formatDate(rental.started_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalStats;
