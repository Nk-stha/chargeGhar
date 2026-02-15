"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./RecentAds.module.css";
import { FiTv, FiLoader, FiXCircle, FiArrowRight } from "react-icons/fi";
import axiosInstance from "@/lib/axios";

interface AdRequest {
  id: string;
  full_name: string;
  title: string | null;
  station_count: number;
  duration_days: number | null;
  admin_price: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
}

const RecentAds: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<AdRequest[]>([]);
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
      const response = await axiosInstance.get("/api/ads/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response?.data?.success) {
        setData((response.data.data ?? []).slice(0, 5));
      } else {
        setError("Failed to load data");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string | null) => {
    if (!amount) return "N/A";
    const numAmount = parseFloat(amount);
    return `NPR ${numAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SUBMITTED: "#888",
      PENDING_PAYMENT: "#f59e0b",
      PAID: "#10b981",
      COMPLETED: "#3b82f6",
      REJECTED: "#ef4444",
    };
    return colors[status] || "#888";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      SUBMITTED: "Submitted",
      PENDING_PAYMENT: "Pending Payment",
      PAID: "Paid",
      COMPLETED: "Completed",
      REJECTED: "Rejected",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <FiLoader className={styles.spinner} />
          <p>Loading recent ads...</p>
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
          <FiTv className={styles.headerIcon} />
          <h2 className={styles.title}>Recent Ad Campaigns</h2>
        </div>
        <button 
          className={styles.viewAllBtn}
          onClick={() => router.push('/dashboard/ads')}
        >
          View All
          <FiArrowRight />
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Advertiser</th>
              <th>Campaign Title</th>
              <th>Stations</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Status</th>
              <th>Start / End Date</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((ad) => (
                <tr 
                  key={ad?.id ?? Math.random()}
                  onClick={() => router.push(`/dashboard/ads/${ad?.id}`)}
                  className={styles.tableRow}
                >
                  <td>
                    <span className={styles.advertiser}>{ad?.full_name ?? "N/A"}</span>
                  </td>
                  <td>
                    <span className={styles.title}>{ad?.title ?? "Untitled"}</span>
                  </td>
                  <td>
                    <span className={styles.stations}>{ad?.station_count ?? 0}</span>
                  </td>
                  <td>
                    <span className={styles.duration}>
                      {ad?.duration_days ? `${ad.duration_days} days` : "N/A"}
                    </span>
                  </td>
                  <td>
                    <span className={styles.price}>{formatAmount(ad?.admin_price)}</span>
                  </td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: `${getStatusColor(ad?.status ?? "SUBMITTED")}22`,
                        color: getStatusColor(ad?.status ?? "SUBMITTED"),
                        borderColor: getStatusColor(ad?.status ?? "SUBMITTED"),
                      }}
                    >
                      {getStatusLabel(ad?.status ?? "SUBMITTED")}
                    </span>
                  </td>
                  <td>
                    <div className={styles.dateRange}>
                      <span className={styles.date}>{formatDate(ad?.start_date)}</span>
                      <span className={styles.dateSeparator}>→</span>
                      <span className={styles.date}>{formatDate(ad?.end_date)}</span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className={styles.emptyState}>
                  No ad campaigns found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Card Layout for Mobile */}
      <div className={styles.cardLayout}>
        {data && data.length > 0 ? (
          data.map((ad) => (
            <div
              key={ad?.id ?? Math.random()}
              className={styles.card}
              onClick={() => router.push(`/dashboard/ads/${ad?.id}`)}
            >
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Advertiser</span>
                <span className={styles.cardValue}>{ad?.full_name ?? "N/A"}</span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Campaign</span>
                <span className={styles.cardValue}>{ad?.title ?? "Untitled"}</span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Stations</span>
                <span className={styles.stations}>{ad?.station_count ?? 0}</span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Duration</span>
                <span className={styles.duration}>
                  {ad?.duration_days ? `${ad.duration_days} days` : "N/A"}
                </span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Price</span>
                <span className={styles.price}>{formatAmount(ad?.admin_price)}</span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Status</span>
                <span
                  className={styles.statusBadge}
                  style={{
                    backgroundColor: `${getStatusColor(ad?.status ?? "SUBMITTED")}22`,
                    color: getStatusColor(ad?.status ?? "SUBMITTED"),
                    borderColor: getStatusColor(ad?.status ?? "SUBMITTED"),
                  }}
                >
                  {getStatusLabel(ad?.status ?? "SUBMITTED")}
                </span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Campaign Period</span>
                <div className={styles.dateRange}>
                  <span className={styles.date}>{formatDate(ad?.start_date)}</span>
                  <span className={styles.dateSeparator}>→</span>
                  <span className={styles.date}>{formatDate(ad?.end_date)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>No ad campaigns found</div>
        )}
      </div>
    </div>
  );
};

export default RecentAds;
