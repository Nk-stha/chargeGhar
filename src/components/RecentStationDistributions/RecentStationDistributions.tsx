"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./RecentStationDistributions.module.css";
import { FiLayers, FiLoader, FiXCircle, FiArrowRight } from "react-icons/fi";
import axiosInstance from "@/lib/axios";

interface StationDistribution {
  id: string;
  station_name: string;
  station_code: string;
  partner_name: string;
  partner_code: string;
  distribution_type: string;
  effective_date: string;
  is_active: boolean;
}

interface DistributionData {
  results: StationDistribution[];
  count: number;
}

const RecentStationDistributions: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<DistributionData | null>(null);
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
      const response = await axiosInstance.get("/api/admin/partners/stations?page=1&page_size=5", {
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDistributionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CHARGEGHAR_TO_FRANCHISE: "To Franchise",
      CHARGEGHAR_TO_VENDOR: "To Vendor",
      FRANCHISE_TO_VENDOR: "Franchise → Vendor",
    };
    return labels[type] || type;
  };

  const getDistributionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      CHARGEGHAR_TO_FRANCHISE: "#3b82f6",
      CHARGEGHAR_TO_VENDOR: "#8b5cf6",
      FRANCHISE_TO_VENDOR: "#f59e0b",
    };
    return colors[type] || "#888";
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <FiLoader className={styles.spinner} />
          <p>Loading station distributions...</p>
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
          <FiLayers className={styles.headerIcon} />
          <h2 className={styles.title}>Recent Station Distributions</h2>
        </div>
        <button 
          className={styles.viewAllBtn}
          onClick={() => router.push('/dashboard/partners/station-distributions')}
        >
          View All
          <FiArrowRight />
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Station Name</th>
              <th>Station Code</th>
              <th>Partner</th>
              <th>Partner Code</th>
              <th>Distribution Type</th>
              <th>Effective Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.results && data.results.length > 0 ? (
              data.results.map((dist) => (
                <tr 
                  key={dist?.id ?? Math.random()}
                  onClick={() => router.push('/dashboard/partners/station-distributions')}
                  className={styles.tableRow}
                >
                  <td>
                    <span className={styles.stationName}>{dist?.station_name ?? "N/A"}</span>
                  </td>
                  <td>
                    <span className={styles.stationCode}>{dist?.station_code ?? "N/A"}</span>
                  </td>
                  <td>
                    <span className={styles.partnerName}>{dist?.partner_name ?? "N/A"}</span>
                  </td>
                  <td>
                    <span className={styles.partnerCode}>{dist?.partner_code ?? "N/A"}</span>
                  </td>
                  <td>
                    <span
                      className={styles.typeBadge}
                      style={{
                        backgroundColor: `${getDistributionTypeColor(dist?.distribution_type ?? "")}22`,
                        color: getDistributionTypeColor(dist?.distribution_type ?? ""),
                        borderColor: getDistributionTypeColor(dist?.distribution_type ?? ""),
                      }}
                    >
                      {getDistributionTypeLabel(dist?.distribution_type ?? "")}
                    </span>
                  </td>
                  <td>
                    <span className={styles.date}>{formatDate(dist?.effective_date ?? "")}</span>
                  </td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: dist?.is_active ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: dist?.is_active ? "#10b981" : "#ef4444",
                        borderColor: dist?.is_active ? "#10b981" : "#ef4444",
                      }}
                    >
                      {dist?.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className={styles.emptyState}>
                  No station distributions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Card Layout for Mobile */}
      <div className={styles.cardLayout}>
        {data.results && data.results.length > 0 ? (
          data.results.map((dist) => (
            <div
              key={dist?.id ?? Math.random()}
              className={styles.card}
              onClick={() => router.push('/dashboard/partners/station-distributions')}
            >
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Station</span>
                <div className={styles.cardValue}>
                  <div>{dist?.station_name ?? "N/A"}</div>
                  <div className={styles.cardSubtext}>{dist?.station_code ?? "N/A"}</div>
                </div>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Partner</span>
                <div className={styles.cardValue}>
                  <div>{dist?.partner_name ?? "N/A"}</div>
                  <div className={styles.cardSubtext}>{dist?.partner_code ?? "N/A"}</div>
                </div>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Distribution Type</span>
                <span
                  className={styles.typeBadge}
                  style={{
                    backgroundColor: `${getDistributionTypeColor(dist?.distribution_type ?? "")}22`,
                    color: getDistributionTypeColor(dist?.distribution_type ?? ""),
                    borderColor: getDistributionTypeColor(dist?.distribution_type ?? ""),
                  }}
                >
                  {getDistributionTypeLabel(dist?.distribution_type ?? "")}
                </span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Effective Date</span>
                <span className={styles.date}>{formatDate(dist?.effective_date ?? "")}</span>
              </div>

              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Status</span>
                <span
                  className={styles.statusBadge}
                  style={{
                    backgroundColor: dist?.is_active ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                    color: dist?.is_active ? "#10b981" : "#ef4444",
                    borderColor: dist?.is_active ? "#10b981" : "#ef4444",
                  }}
                >
                  {dist?.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>No station distributions found</div>
        )}
      </div>
    </div>
  );
};

export default RecentStationDistributions;
