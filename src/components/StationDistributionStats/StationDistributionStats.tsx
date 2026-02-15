"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./StationDistributionStats.module.css";
import { FiMapPin, FiUsers, FiPieChart, FiTrendingUp, FiLayers, FiLoader } from "react-icons/fi";
import { toast } from "sonner";

interface StationDistribution {
  id: string;
  station_id: string;
  station_name: string;
  station_code: string;
  partner_id: string;
  partner_name: string;
  partner_code: string;
  distribution_type: string;
  effective_date: string;
  expiry_date: string | null;
  is_active: boolean;
  created_at: string;
}

interface StationDistributionResponse {
  success: boolean;
  message: string;
  data: {
    results: StationDistribution[];
    count: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

const StationDistributionStats: React.FC = () => {
  const router = useRouter();
  const [distributions, setDistributions] = useState<StationDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDistributions();
  }, []);

  const fetchDistributions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/admin/partners/stations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data: StationDistributionResponse = await response.json();

      if (data.success) {
        setDistributions(data.data.results);
      } else {
        setError("Failed to load station distributions");
        toast.error("Failed to load station distributions");
      }
    } catch {
      setError("Failed to load station distributions");
      toast.error("Failed to load station distributions");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <FiLoader className={styles.spinner} />
          <p>Loading station distribution statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !distributions) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p>{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalActiveStations = new Set(
    distributions.filter((d) => d.is_active).map((d) => d.station_id)
  ).size;

  const totalPartners = new Set(distributions.map((d) => d.partner_id)).size;

  const distributionTypes = distributions.reduce((acc, d) => {
    acc[d.distribution_type] = (acc[d.distribution_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const xfCount = distributionTypes["CHARGEGHAR_TO_FRANCHISE"] || 0;
  const yvCount = distributionTypes["CHARGEGHAR_TO_VENDOR"] || 0;
  const zfvCount = distributionTypes["FRANCHISE_TO_VENDOR"] || 0;

  const stationsPerPartner = totalPartners > 0 ? (totalActiveStations / totalPartners).toFixed(1) : "0";

  // Calculate monthly growth
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthDistributions = distributions.filter((d) => {
    const date = new Date(d.created_at);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const previousMonthDistributions = distributions.filter((d) => {
    const date = new Date(d.created_at);
    return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
  }).length;

  const monthlyGrowth =
    previousMonthDistributions > 0
      ? (((currentMonthDistributions - previousMonthDistributions) / previousMonthDistributions) * 100).toFixed(1)
      : "0";

  const getDistributionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CHARGEGHAR_TO_FRANCHISE: "To Franchise",
      CHARGEGHAR_TO_VENDOR: "To Vendor",
      FRANCHISE_TO_VENDOR: "F → V",
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <FiLayers /> Station Distribution Statistics
        </h2>
      </div>

      <div className={styles.content}>
        <div className={styles.metricsGrid}>
          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/stations")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(130, 234, 128, 0.1)", color: "#82ea80" }}>
              <FiMapPin />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Total Active Stations</span>
              <span className={styles.metricValue}>{totalActiveStations}</span>
            </div>
          </div>

          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/partners")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
              <FiUsers />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Total Partners</span>
              <span className={styles.metricValue}>{totalPartners}</span>
            </div>
          </div>

          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/partners/station-distributions")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(168, 85, 247, 0.1)", color: "#a855f7" }}>
              <FiPieChart />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Distribution Type Ratio</span>
              <span className={styles.metricValue}>
                {xfCount} / {yvCount} / {zfvCount}
              </span>
              <span className={styles.metricSubtext}>XF / YV / ZFV</span>
            </div>
          </div>

          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/partners/station-distributions")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
              <FiLayers />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Stations per Partner</span>
              <span className={styles.metricValue}>{stationsPerPartner}</span>
            </div>
          </div>

          <div
            className={styles.metricCard}
            onClick={() => router.push("/dashboard/partners/station-distributions")}
          >
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(251, 146, 60, 0.1)", color: "#fb923c" }}>
              <FiTrendingUp />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Monthly Growth</span>
              <span className={`${styles.metricValue} ${parseFloat(monthlyGrowth) >= 0 ? styles.positive : styles.negative}`}>
                {parseFloat(monthlyGrowth) >= 0 ? "+" : ""}{monthlyGrowth}%
              </span>
            </div>
          </div>
        </div>

        {/* Recent Distributions */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <FiMapPin /> Recent Distributions
          </h3>
          <div className={styles.distributionList}>
            {distributions.slice(0, 5).map((dist) => (
              <div key={dist.id} className={styles.distributionItem}>
                <div className={styles.distributionInfo}>
                  <span className={styles.distributionStation}>{dist.station_name}</span>
                  <span className={styles.distributionPartner}>{dist.partner_name}</span>
                </div>
                <div className={styles.distributionDetails}>
                  <span
                    className={styles.distributionType}
                    style={{
                      backgroundColor: `${getDistributionTypeColor(dist.distribution_type)}22`,
                      color: getDistributionTypeColor(dist.distribution_type),
                    }}
                  >
                    {getDistributionTypeLabel(dist.distribution_type)}
                  </span>
                  <span className={styles.distributionStatus} style={{ color: dist.is_active ? "#22c55e" : "#ef4444" }}>
                    {dist.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution Type Breakdown */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <FiPieChart /> Distribution Type Breakdown
          </h3>
          <div className={styles.breakdownList}>
            <div className={styles.breakdownItem}>
              <div className={styles.breakdownHeader}>
                <span className={styles.breakdownLabel}>ChargeGhar → Franchise</span>
                <span className={styles.breakdownValue}>{xfCount}</span>
              </div>
              <div className={styles.breakdownBar}>
                <div
                  className={styles.breakdownFill}
                  style={{
                    width: `${distributions.length > 0 ? (xfCount / distributions.length) * 100 : 0}%`,
                    background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                  }}
                />
              </div>
            </div>

            <div className={styles.breakdownItem}>
              <div className={styles.breakdownHeader}>
                <span className={styles.breakdownLabel}>ChargeGhar → Vendor</span>
                <span className={styles.breakdownValue}>{yvCount}</span>
              </div>
              <div className={styles.breakdownBar}>
                <div
                  className={styles.breakdownFill}
                  style={{
                    width: `${distributions.length > 0 ? (yvCount / distributions.length) * 100 : 0}%`,
                    background: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
                  }}
                />
              </div>
            </div>

            <div className={styles.breakdownItem}>
              <div className={styles.breakdownHeader}>
                <span className={styles.breakdownLabel}>Franchise → Vendor</span>
                <span className={styles.breakdownValue}>{zfvCount}</span>
              </div>
              <div className={styles.breakdownBar}>
                <div
                  className={styles.breakdownFill}
                  style={{
                    width: `${distributions.length > 0 ? (zfvCount / distributions.length) * 100 : 0}%`,
                    background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationDistributionStats;
