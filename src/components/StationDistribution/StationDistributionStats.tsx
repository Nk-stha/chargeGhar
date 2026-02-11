"use client";

import React from "react";
import { FiGitBranch, FiCheckCircle, FiClock } from "react-icons/fi";
import styles from "./StationDistribution.module.css";
import { StationDistribution } from "../../types/stationDistribution";

interface StationDistributionStatsProps {
  distributions: StationDistribution[];
  loading?: boolean;
}

const StationDistributionStats: React.FC<StationDistributionStatsProps> = ({
  distributions,
  loading = false,
}) => {
  const totalDistributions = distributions.length;
  const activeAllocations = distributions.filter((d) => d.is_active).length;

  // Get most recent distribution by created_at date
  const recentDistribution =
    distributions.length > 0
      ? [...distributions].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]
      : null;

  if (loading) {
    return (
      <div className={styles.statsGrid}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`${styles.statCard} animate-pulse`}>
            <div
              style={{
                height: "1rem",
                width: "60%",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "0.375rem",
              }}
            />
            <div
              style={{
                height: "2.25rem",
                width: "40%",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "0.375rem",
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.statsGrid}>
      {/* Total Distributions */}
      <div className={styles.statCard}>
        <div className={styles.statGlow} />
        <div className={styles.statContent}>
          <div>
            <p className={styles.statLabel}>Total Distributions</p>
            <h3 className={styles.statValue}>{totalDistributions}</h3>
          </div>
          <div className={styles.statIcon}>
            <FiGitBranch />
          </div>
        </div>
      </div>

      {/* Active Allocations */}
      <div className={styles.statCard}>
        <div className={styles.statGlow} />
        <div className={styles.statContent}>
          <div>
            <p className={styles.statLabel}>Active Allocations</p>
            <h3 className={styles.statValueHighlight}>{activeAllocations}</h3>
          </div>
          <div className={styles.statIcon}>
            <FiCheckCircle />
          </div>
        </div>
      </div>

      {/* Recent Distribution */}
      <div className={styles.statCard}>
        <div className={styles.statGlow} />
        <div className={styles.statContent}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p className={styles.statLabel}>Recent Distribution</p>
            <h3 className={styles.statValueSmall}>
              {recentDistribution?.station_name || "—"}
            </h3>
          </div>
          <div className={styles.statIcon}>
            <FiClock />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationDistributionStats;
