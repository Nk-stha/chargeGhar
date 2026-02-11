"use client";

import React, { useState, useCallback } from "react";
import { StationDistributionList, StationDistributionStats } from "@/components/StationDistribution";
import { StationDistribution } from "@/types/stationDistribution";
import styles from "./stationDistributions.module.css";

export default function StationDistributionsPage() {
  const [distributions, setDistributions] = useState<StationDistribution[]>([]);

  const handleStatsUpdate = useCallback((data: StationDistribution[]) => {
    setDistributions(data);
  }, []);

  return (
    <div className={styles.pageContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Station Distributions</h1>
        <p className={styles.pageSubtitle}>
          Manage and track the allocation of charging stations to partners
        </p>
      </div>

      {/* Stats Section */}
      <div className={styles.statsSection}>
        <StationDistributionStats distributions={distributions} />
      </div>

      {/* List Section */}
      <div className={styles.listSection}>
        <StationDistributionList onStatsUpdate={handleStatsUpdate} />
      </div>
    </div>
  );
}
