"use client";

import React, { useState, useEffect } from "react";
import styles from "./PowerBankPerformance.module.css";
import { FiTrendingUp, FiMapPin, FiDollarSign, FiActivity, FiLoader, FiFilter } from "react-icons/fi";
import { powerBankService } from "../../lib/api/powerbank.service";
import { AnalyticsData, PowerBankListItem } from "../../types/powerbank.types";

const PowerBankPerformance: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [powerbanks, setPowerbanks] = useState<PowerBankListItem[]>([]);
  const [filteredPowerbanks, setFilteredPowerbanks] = useState<PowerBankListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cycleFilter, setCycleFilter] = useState<"all" | "high" | "medium" | "low" | "custom">("all");
  const [minCycles, setMinCycles] = useState<string>("");
  const [maxCycles, setMaxCycles] = useState<string>("");
  const [showCustomRange, setShowCustomRange] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [analyticsResponse, powerbanksResponse] = await Promise.all([
          powerBankService.getAnalytics(),
          powerBankService.getPowerBanks({ page: 1, page_size: 100 })
        ]);
        
        if (analyticsResponse.success) {
          setAnalytics(analyticsResponse.data);
        } else {
          setError("Failed to load analytics");
        }

        if (powerbanksResponse.success) {
          setPowerbanks(powerbanksResponse.data.results);
        }
      } catch (err) {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...powerbanks];
    
    // Apply cycle filter
    if (cycleFilter === "high") {
      filtered = filtered.filter(pb => parseFloat(pb.total_cycles || "0") >= 100);
    } else if (cycleFilter === "medium") {
      filtered = filtered.filter(pb => {
        const cycles = parseFloat(pb.total_cycles || "0");
        return cycles >= 50 && cycles < 100;
      });
    } else if (cycleFilter === "low") {
      filtered = filtered.filter(pb => parseFloat(pb.total_cycles || "0") < 50);
    } else if (cycleFilter === "custom") {
      const min = minCycles ? parseFloat(minCycles) : 0;
      const max = maxCycles ? parseFloat(maxCycles) : Infinity;
      filtered = filtered.filter(pb => {
        const cycles = parseFloat(pb.total_cycles || "0");
        return cycles >= min && cycles <= max;
      });
    }

    // Sort by total_cycles descending
    filtered.sort((a, b) => parseFloat(b.total_cycles || "0") - parseFloat(a.total_cycles || "0"));
    
    setFilteredPowerbanks(filtered);
  }, [powerbanks, cycleFilter, minCycles, maxCycles]);

  const handleCustomFilter = () => {
    setCycleFilter("custom");
  };

  const handleResetCustom = () => {
    setMinCycles("");
    setMaxCycles("");
    setCycleFilter("all");
    setShowCustomRange(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <FiLoader className={styles.spinner} />
          <p>Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p>{error || "No data available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <FiTrendingUp /> PowerBank Performance
        </h2>
      </div>

      <div className={styles.content}>
        {/* Performance Metrics */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(130, 234, 128, 0.1)", color: "#82ea80" }}>
              <FiActivity />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Utilization Rate</span>
              <span 
                className={styles.metricValue}
                style={{ color: powerBankService.getUtilizationColor(analytics.utilization.utilization_rate) }}
              >
                {analytics.utilization.utilization_rate}%
              </span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
              <FiTrendingUp />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Total Rentals</span>
              <span className={styles.metricValue}>{analytics.utilization.total_rentals}</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
              <FiDollarSign />
            </div>
            <div className={styles.metricInfo}>
              <span className={styles.metricLabel}>Total Revenue</span>
              <span className={styles.metricValue}>
                {powerBankService.formatCurrency(analytics.utilization.total_revenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <FiTrendingUp /> Top Performers
          </h3>
          <div className={styles.performersList}>
            {analytics.top_performers.slice(0, 5).map((performer, index) => (
              <div key={performer.serial_number} className={styles.performerItem}>
                <span className={styles.performerRank}>#{index + 1}</span>
                <div className={styles.performerInfo}>
                  <span className={styles.performerSerial}>{performer.serial_number}</span>
                  <span className={styles.performerModel}>{performer.model}</span>
                </div>
                <div className={styles.performerStats}>
                  <span className={styles.performerRentals}>{performer.rental_count} rentals</span>
                  <span className={styles.performerCycles}>{parseFloat(performer.total_cycles || "0").toFixed(2)} cycles</span>
                  <span className={styles.performerRevenue}>
                    {powerBankService.formatCurrency(performer.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Station Distribution */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <FiMapPin /> Station Distribution
          </h3>
          <div className={styles.distributionList}>
            {analytics.station_distribution.slice(0, 6).map((dist) => (
              <div key={dist.station} className={styles.distributionItem}>
                <span className={styles.distributionStation}>{dist.station}</span>
                <div className={styles.distributionBar}>
                  <div
                    className={styles.distributionFill}
                    style={{
                      width: `${(dist.count / analytics.overview.total_powerbanks) * 100}%`,
                    }}
                  />
                </div>
                <span className={styles.distributionCount}>{dist.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cycle Count Table */}
        <div className={styles.section}>
          <div className={styles.tableHeader}>
            <h3 className={styles.sectionTitle}>
              <FiActivity /> PowerBanks by Cycle Count
            </h3>
            <div className={styles.filterContainer}>
              <div className={styles.cycleFilters}>
                <button
                  className={`${styles.cycleFilterBtn} ${cycleFilter === "all" ? styles.active : ""}`}
                  onClick={() => {
                    setCycleFilter("all");
                    setShowCustomRange(false);
                  }}
                >
                  All
                </button>
                <button
                  className={`${styles.cycleFilterBtn} ${cycleFilter === "high" ? styles.active : ""}`}
                  onClick={() => {
                    setCycleFilter("high");
                    setShowCustomRange(false);
                  }}
                >
                  High (≥100)
                </button>
                <button
                  className={`${styles.cycleFilterBtn} ${cycleFilter === "medium" ? styles.active : ""}`}
                  onClick={() => {
                    setCycleFilter("medium");
                    setShowCustomRange(false);
                  }}
                >
                  Medium (50-99)
                </button>
                <button
                  className={`${styles.cycleFilterBtn} ${cycleFilter === "low" ? styles.active : ""}`}
                  onClick={() => {
                    setCycleFilter("low");
                    setShowCustomRange(false);
                  }}
                >
                  Low (&lt;50)
                </button>
                <button
                  className={`${styles.cycleFilterBtn} ${showCustomRange ? styles.active : ""}`}
                  onClick={() => setShowCustomRange(!showCustomRange)}
                >
                  <FiFilter /> Custom Range
                </button>
              </div>
              
              {showCustomRange && (
                <div className={styles.customRangeContainer}>
                  <div className={styles.rangeInputs}>
                    <div className={styles.inputGroup}>
                      <label>Min Cycles</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={minCycles}
                        onChange={(e) => setMinCycles(e.target.value)}
                        className={styles.rangeInput}
                        min="0"
                      />
                    </div>
                    <span className={styles.rangeSeparator}>to</span>
                    <div className={styles.inputGroup}>
                      <label>Max Cycles</label>
                      <input
                        type="number"
                        placeholder="∞"
                        value={maxCycles}
                        onChange={(e) => setMaxCycles(e.target.value)}
                        className={styles.rangeInput}
                        min="0"
                      />
                    </div>
                  </div>
                  <div className={styles.rangeActions}>
                    <button
                      className={styles.applyBtn}
                      onClick={handleCustomFilter}
                      disabled={!minCycles && !maxCycles}
                    >
                      Apply
                    </button>
                    <button
                      className={styles.resetBtn}
                      onClick={handleResetCustom}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className={styles.tableWrapper}>
            <table className={styles.cycleTable}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Serial Number</th>
                  <th>Model</th>
                  <th>Status</th>
                  <th>Total Cycles</th>
                  <th>Rental Count</th>
                  <th>Battery</th>
                </tr>
              </thead>
              <tbody>
                {filteredPowerbanks.length > 0 ? (
                  filteredPowerbanks.slice(0, 20).map((pb, index) => (
                    <tr key={pb.id}>
                      <td className={styles.rankCell}>#{index + 1}</td>
                      <td className={styles.serialCell}>{pb.serial_number}</td>
                      <td className={styles.modelCell}>{pb.model}</td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{
                            backgroundColor: powerBankService.getStatusBgColor(pb.status),
                            color: powerBankService.getStatusColor(pb.status),
                          }}
                        >
                          {pb.status}
                        </span>
                      </td>
                      <td className={styles.cycleCell}>
                        <span className={styles.cycleValue}>
                          {parseFloat(pb.total_cycles || "0").toFixed(2)}
                        </span>
                      </td>
                      <td className={styles.rentalCell}>{pb.rental_count}</td>
                      <td>
                        <div className={styles.batteryDisplay}>
                          <div className={styles.batteryBar}>
                            <div
                              className={styles.batteryFill}
                              style={{
                                width: `${pb.battery_level}%`,
                                backgroundColor: powerBankService.getBatteryColor(pb.battery_level),
                              }}
                            />
                          </div>
                          <span className={styles.batteryText}>{pb.battery_level}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className={styles.emptyCell}>
                      No powerbanks found for this filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {filteredPowerbanks.length > 20 && (
            <div className={styles.tableFooter}>
              <span className={styles.footerText}>
                Showing top 20 of {filteredPowerbanks.length} powerbanks
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PowerBankPerformance;
