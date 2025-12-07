"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import styles from "./powerbanks.module.css";
import {
  FiBattery,
  FiSearch,
  FiRefreshCw,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiBarChart2,
  FiMapPin,
  FiClock,
  FiActivity,
  FiDollarSign,
  FiTrendingUp,
} from "react-icons/fi";
import { powerBankService } from "../../../lib/api/powerbank.service";
import {
  PowerBankListItem,
  PowerBankStatus,
  Pagination,
  AnalyticsData,
} from "../../../types/powerbank.types";

export default function PowerBanksPage() {
  const router = useRouter();
  const [powerbanks, setPowerbanks] = useState<PowerBankListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "analytics">("list");
  const [statusFilter, setStatusFilter] = useState<PowerBankStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch powerbanks
  const fetchPowerBanks = async (page: number = 1, status?: PowerBankStatus | "ALL") => {
    try {
      setLoading(true);
      setError(null);

      const filters: { page: number; status?: PowerBankStatus } = { page };
      if (status && status !== "ALL") {
        filters.status = status;
      }

      const response = await powerBankService.getPowerBanks(filters);

      if (response.success) {
        setPowerbanks(response.data.results);
        setPagination(response.data.pagination);
      } else {
        setError("Failed to fetch powerbanks");
      }
    } catch (err: unknown) {
      console.error("Error fetching powerbanks:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load powerbanks";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const response = await powerBankService.getAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  useEffect(() => {
    fetchPowerBanks(currentPage, statusFilter === "ALL" ? undefined : statusFilter);
    fetchAnalytics();
  }, [currentPage, statusFilter]);

  // Filter by search
  const filteredPowerBanks = useMemo(() => {
    if (!search.trim()) return powerbanks;
    const query = search.toLowerCase();
    return powerbanks.filter(
      (pb) =>
        pb.serial_number.toLowerCase().includes(query) ||
        pb.model.toLowerCase().includes(query) ||
        pb.current_station?.name.toLowerCase().includes(query) ||
        pb.current_rental?.username.toLowerCase().includes(query)
    );
  }, [powerbanks, search]);

  const handleStatusFilterChange = (status: PowerBankStatus | "ALL") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowClick = (powerbankId: string) => {
    router.push(`/dashboard/powerbanks/${powerbankId}`);
  };

  const handleRefresh = () => {
    fetchPowerBanks(currentPage, statusFilter === "ALL" ? undefined : statusFilter);
    fetchAnalytics();
  };

  // Loading state
  if (loading && powerbanks.length === 0) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading powerbanks...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error && powerbanks.length === 0) {
    return (
      <main className={styles.container}>
        <div className={styles.errorContainer}>
          <FiAlertCircle className={styles.errorIcon} />
          <p className={styles.errorText}>{error}</p>
          <button onClick={handleRefresh} className={styles.retryBtn}>
            <FiRefreshCw /> Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>PowerBanks</h1>
          <p className={styles.subtitle}>Manage and monitor your powerbank fleet</p>
        </div>
        <button onClick={handleRefresh} className={styles.refreshBtn} title="Refresh">
          <FiRefreshCw />
        </button>
      </header>

      {/* Tab Navigation */}
      <div className={styles.tabContainer}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "list" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("list")}
          >
            <FiBattery className={styles.tabIcon} />
            <span className={styles.tabText}>All PowerBanks</span>
            <span className={styles.tabBadge}>{pagination?.total_count || 0}</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === "analytics" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <FiBarChart2 className={styles.tabIcon} />
            <span className={styles.tabText}>Analytics</span>
          </button>
        </div>
      </div>

      {/* List View */}
      {activeTab === "list" && (
        <>
          {/* Controls */}
          <div className={styles.controls}>
            <div className={styles.searchWrapper}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by serial, model, station..."
                className={styles.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} className={styles.clearSearch}>
                  ×
                </button>
              )}
            </div>

            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterBtn} ${statusFilter === "ALL" ? styles.filterActive : ""}`}
                onClick={() => handleStatusFilterChange("ALL")}
              >
                All
              </button>
              <button
                className={`${styles.filterBtn} ${statusFilter === "AVAILABLE" ? styles.filterActive : ""}`}
                onClick={() => handleStatusFilterChange("AVAILABLE")}
              >
                Available
              </button>
              <button
                className={`${styles.filterBtn} ${statusFilter === "RENTED" ? styles.filterActive : ""}`}
                onClick={() => handleStatusFilterChange("RENTED")}
              >
                Rented
              </button>
              <button
                className={`${styles.filterBtn} ${statusFilter === "MAINTENANCE" ? styles.filterActive : ""}`}
                onClick={() => handleStatusFilterChange("MAINTENANCE")}
              >
                Maintenance
              </button>
              <button
                className={`${styles.filterBtn} ${statusFilter === "DAMAGED" ? styles.filterActive : ""}`}
                onClick={() => handleStatusFilterChange("DAMAGED")}
              >
                Damaged
              </button>
            </div>
          </div>

          {/* PowerBank List */}
          <div className={styles.card}>
            {filteredPowerBanks.length === 0 ? (
              <div className={styles.emptyState}>
                <FiBattery className={styles.emptyIcon} />
                <p>No powerbanks found</p>
                <span>Try adjusting your filters or search</span>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Serial Number</th>
                        <th>Model</th>
                        <th>Status</th>
                        <th>Battery</th>
                        <th>Station</th>
                        <th>Rental Info</th>
                        <th>Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPowerBanks.map((pb) => (
                        <tr
                          key={pb.id}
                          className={styles.tableRow}
                          onClick={() => handleRowClick(pb.id)}
                        >
                          <td>
                            <span className={styles.serialNumber}>{pb.serial_number}</span>
                          </td>
                          <td>
                            <span className={styles.model}>{pb.model}</span>
                          </td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                              <span
                                className={styles.statusBadge}
                                style={{
                                  backgroundColor: powerBankService.getStatusBgColor(pb.status),
                                  color: powerBankService.getStatusColor(pb.status),
                                }}
                              >
                                {pb.status}
                              </span>
                              {pb.current_rental && (
                                <span
                                  className={styles.statusBadge}
                                  style={{
                                    backgroundColor: pb.current_rental.status === "OVERDUE" 
                                      ? "rgba(239, 68, 68, 0.1)" 
                                      : "rgba(59, 130, 246, 0.1)",
                                    color: pb.current_rental.status === "OVERDUE" 
                                      ? "#ef4444" 
                                      : "#3b82f6",
                                    fontSize: "0.65rem",
                                  }}
                                >
                                  {pb.current_rental.status}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className={styles.batteryContainer}>
                              <div className={styles.batteryOuter}>
                                <div
                                  className={styles.batteryInner}
                                  style={{
                                    width: `${pb.battery_level}%`,
                                    backgroundColor: powerBankService.getBatteryColor(pb.battery_level),
                                  }}
                                />
                              </div>
                              <span className={styles.batteryText}>{pb.battery_level}%</span>
                            </div>
                          </td>
                          <td>
                            {pb.current_station ? (
                              <span className={styles.stationName}>
                                <FiMapPin /> {pb.current_station.name}
                              </span>
                            ) : (
                              <span className={styles.noData}>—</span>
                            )}
                          </td>
                          <td>
                            {pb.current_rental ? (
                              <div className={styles.rentalInfo}>
                                <span className={styles.rentalUser} style={{ fontWeight: "600", color: "#fff" }}>
                                  {pb.current_rental.username}
                                </span>
                                <span style={{ fontSize: "0.75rem", color: "#888" }}>
                                  Due: {new Date(pb.current_rental.due_at).toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <span className={styles.noData}>—</span>
                            )}
                          </td>
                          <td>
                            <span className={styles.lastUpdated}>
                              {powerBankService.getTimeAgo(pb.last_updated)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className={styles.mobileCards}>
                  {filteredPowerBanks.map((pb) => (
                    <div
                      key={pb.id}
                      className={styles.mobileCard}
                      onClick={() => handleRowClick(pb.id)}
                    >
                      <div className={styles.mobileCardHeader}>
                        <span className={styles.serialNumber}>{pb.serial_number}</span>
                        <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                          <span
                            className={styles.statusBadge}
                            style={{
                              backgroundColor: powerBankService.getStatusBgColor(pb.status),
                              color: powerBankService.getStatusColor(pb.status),
                            }}
                          >
                            {pb.status}
                          </span>
                          {pb.current_rental && (
                            <span
                              className={styles.statusBadge}
                              style={{
                                backgroundColor: pb.current_rental.status === "OVERDUE" 
                                  ? "rgba(239, 68, 68, 0.1)" 
                                  : "rgba(59, 130, 246, 0.1)",
                                color: pb.current_rental.status === "OVERDUE" 
                                  ? "#ef4444" 
                                  : "#3b82f6",
                              }}
                            >
                              {pb.current_rental.status}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={styles.mobileCardBody}>
                        <div className={styles.mobileCardRow}>
                          <span className={styles.mobileLabel}>Model:</span>
                          <span>{pb.model}</span>
                        </div>
                        <div className={styles.mobileCardRow}>
                          <span className={styles.mobileLabel}>Battery:</span>
                          <div className={styles.batteryContainer}>
                            <div className={styles.batteryOuter}>
                              <div
                                className={styles.batteryInner}
                                style={{
                                  width: `${pb.battery_level}%`,
                                  backgroundColor: powerBankService.getBatteryColor(pb.battery_level),
                                }}
                              />
                            </div>
                            <span className={styles.batteryText}>{pb.battery_level}%</span>
                          </div>
                        </div>
                        {pb.current_station && (
                          <div className={styles.mobileCardRow}>
                            <span className={styles.mobileLabel}>Station:</span>
                            <span>{pb.current_station.name}</span>
                          </div>
                        )}
                        {pb.current_rental && (
                          <>
                            <div className={styles.mobileCardRow}>
                              <span className={styles.mobileLabel}>Rented by:</span>
                              <span style={{ fontWeight: "600", color: "#fff" }}>{pb.current_rental.username}</span>
                            </div>
                            <div className={styles.mobileCardRow}>
                              <span className={styles.mobileLabel}>Due:</span>
                              <span style={{ color: pb.current_rental.status === "OVERDUE" ? "#ef4444" : "#888" }}>
                                {new Date(pb.current_rental.due_at).toLocaleString()}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className={styles.mobileCardFooter}>
                        <span className={styles.lastUpdated}>
                          Updated {powerBankService.getTimeAgo(pb.last_updated)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.total_pages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className={styles.pageBtn}
                      disabled={!pagination.has_previous}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <FiChevronLeft />
                    </button>
                    <span className={styles.pageInfo}>
                      Page {pagination.current_page} of {pagination.total_pages}
                    </span>
                    <button
                      className={styles.pageBtn}
                      disabled={!pagination.has_next}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Analytics View */}
      {activeTab === "analytics" && analytics && (
        <div className={styles.analyticsContainer}>
          {/* Overview Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: "rgba(130, 234, 128, 0.1)", color: "#82ea80" }}>
                <FiBattery />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Total PowerBanks</span>
                <span className={styles.statValue}>{analytics.overview.total_powerbanks}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                <FiActivity />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Available</span>
                <span className={styles.statValue}>{analytics.overview.status_breakdown.available}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                <FiClock />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Rented</span>
                <span className={styles.statValue}>{analytics.overview.status_breakdown.rented}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: "rgba(234, 179, 8, 0.1)", color: "#eab308" }}>
                <FiAlertCircle />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Needs Attention</span>
                <span className={styles.statValue}>{analytics.overview.needs_attention}</span>
              </div>
            </div>
          </div>

          {/* Utilization Stats */}
          <div className={styles.analyticsRow}>
            <div className={styles.analyticsCard}>
              <h3 className={styles.cardTitle}>
                <FiTrendingUp /> Utilization
              </h3>
              <div className={styles.utilizationStats}>
                <div className={styles.utilizationItem}>
                  <span className={styles.utilizationLabel}>Total Rentals</span>
                  <span className={styles.utilizationValue}>{analytics.utilization.total_rentals}</span>
                </div>
                <div className={styles.utilizationItem}>
                  <span className={styles.utilizationLabel}>Active Rentals</span>
                  <span className={styles.utilizationValue}>{analytics.utilization.active_rentals}</span>
                </div>
                <div className={styles.utilizationItem}>
                  <span className={styles.utilizationLabel}>Completed</span>
                  <span className={styles.utilizationValue}>{analytics.utilization.completed_rentals}</span>
                </div>
                <div className={styles.utilizationItem}>
                  <span className={styles.utilizationLabel}>Utilization Rate</span>
                  <span
                    className={styles.utilizationValue}
                    style={{ color: powerBankService.getUtilizationColor(analytics.utilization.utilization_rate) }}
                  >
                    {analytics.utilization.utilization_rate}%
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.analyticsCard}>
              <h3 className={styles.cardTitle}>
                <FiDollarSign /> Revenue
              </h3>
              <div className={styles.revenueDisplay}>
                <span className={styles.revenueAmount}>
                  {powerBankService.formatCurrency(analytics.utilization.total_revenue)}
                </span>
                <span className={styles.revenueLabel}>Total Revenue</span>
              </div>
            </div>
          </div>

          {/* Top Performers & Station Distribution */}
          <div className={styles.analyticsRow}>
            <div className={styles.analyticsCard}>
              <h3 className={styles.cardTitle}>
                <FiTrendingUp /> Top Performers
              </h3>
              <div className={styles.topPerformers}>
                {analytics.top_performers.slice(0, 5).map((performer, index) => (
                  <div key={performer.serial_number} className={styles.performerItem}>
                    <span className={styles.performerRank}>#{index + 1}</span>
                    <div className={styles.performerInfo}>
                      <span className={styles.performerSerial}>{performer.serial_number}</span>
                      <span className={styles.performerModel}>{performer.model}</span>
                    </div>
                    <div className={styles.performerStats}>
                      <span>{performer.rental_count} rentals</span>
                      <span>{powerBankService.formatCurrency(performer.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.analyticsCard}>
              <h3 className={styles.cardTitle}>
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
          </div>
        </div>
      )}
    </main>
  );
}
