"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiPlus,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiTrash2,
  FiDownload,
} from "react-icons/fi";
import styles from "./StationDistribution.module.css";
import { getStationDistributions, deactivateStationDistribution } from "../../lib/api/stationDistributions";
import { StationDistribution } from "../../types/stationDistribution";
import { extractApiError } from "../../lib/apiErrors";
import { toast } from "sonner";

interface StationDistributionListProps {
  onStatsUpdate?: (distributions: StationDistribution[]) => void;
}

const StationDistributionList: React.FC<StationDistributionListProps> = ({
  onStatsUpdate,
}) => {
  const [distributions, setDistributions] = useState<StationDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchDistributions = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getStationDistributions({
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
        is_active: true,
      });

      if (response.success) {
        setDistributions(response.data.results);
        setTotalCount(response.data.count);
        setTotalPages(response.data.total_pages);
      } else {
        setError(response.message || "Failed to fetch station distributions");
        setDistributions([]);
      }
    } catch (err: unknown) {
      console.error("Error fetching station distributions:", err);
      const apiError = extractApiError(err, "An error occurred while fetching station distributions");
      if (apiError.statusCode === 404) {
        toast.error("Station distribution feature is not yet available. Please contact your administrator.");
      } else {
        toast.error(apiError.message);
      }
      setDistributions([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch]);

  useEffect(() => {
    fetchDistributions();
  }, [fetchDistributions]);

  // Notify parent of data for stats
  useEffect(() => {
    if (onStatsUpdate) {
      onStatsUpdate(distributions);
    }
  }, [distributions, onStatsUpdate]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleDeactivate = async (e: React.MouseEvent, dist: StationDistribution) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `Are you sure you want to deactivate the distribution for "${dist.station_name}" → "${dist.partner_name}"?`
    );
    if (!confirmed) return;

    try {
      setDeactivatingId(dist.id);
      await deactivateStationDistribution(dist.id);
      fetchDistributions();
    } catch (err: unknown) {
      console.error("Error deactivating distribution:", err);
      const apiError = extractApiError(err, "Failed to deactivate distribution. Please try again.");
      toast.error(apiError.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setDeactivatingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions */}
      <div className={styles.searchSection}>
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search station or partner names..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.buttonGroup}>
          <button
            className={styles.secondaryButton}
            onClick={() => fetchDistributions()}
            disabled={loading}
            title="Refresh List"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button className={styles.secondaryButton} title="Export CSV">
            <FiDownload />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button className={styles.addButton}>
            <FiPlus />
            <span>New Distribution</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className={`${styles.tableContainer} ${styles.desktopOnly}`}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Station Name (Code)</th>
                <th>Partner Name (Code)</th>
                <th>Type</th>
                <th>Effective Date</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} style={{ padding: "1.5rem" }}>
                      <div
                        style={{
                          height: "1rem",
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: "0.375rem",
                          width: "100%",
                        }}
                      />
                    </td>
                  </tr>
                ))
              ) : distributions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "#6b7280",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span style={{ fontSize: "1.875rem" }}>🔍</span>
                      <p>No distributions found matching your search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                distributions.map((dist) => (
                  <tr key={dist.id} className={styles.tableRow}>
                    <td>
                      <span className={styles.stationName}>
                        {dist.station_name}
                      </span>
                      <span className={styles.stationCode}>
                        {dist.station_code}
                      </span>
                    </td>
                    <td>
                      <span className={styles.partnerName}>
                        {dist.partner_name}
                      </span>
                      <span className={styles.partnerCode}>
                        {dist.partner_code}
                      </span>
                    </td>
                    <td>
                      <span className={styles.typeBadge}>
                        {dist.distribution_type}
                      </span>
                    </td>
                    <td>
                      <span className={styles.dateText}>
                        {formatDate(dist.effective_date)}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        className={`${styles.statusBadge} ${
                          dist.is_active
                            ? styles.statusActive
                            : styles.statusInactive
                        }`}
                      >
                        {dist.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        className={styles.actionButton}
                        title="View details"
                      >
                        <FiEye />
                      </button>
                      <button
                        className={styles.actionButton}
                        title="Deactivate distribution"
                        onClick={(e) => handleDeactivate(e, dist)}
                        disabled={deactivatingId === dist.id}
                        style={deactivatingId === dist.id ? { opacity: 0.5 } : {}}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <div className={styles.paginationFooter}>
            <span className={styles.paginationInfo}>
              Showing {distributions.length} of {totalCount} distributions
              {totalPages > 1 && (
                <span
                  style={{
                    marginLeft: "0.5rem",
                    opacity: 0.6,
                    fontSize: "0.75rem",
                  }}
                >
                  Page {page} of {totalPages}
                </span>
              )}
            </span>
            <div className={styles.paginationControls}>
              <button
                className={styles.paginationButton}
                disabled={page === 1 || loading}
                onClick={() => handlePageChange(page - 1)}
              >
                <FiChevronLeft />
              </button>
              <button
                className={styles.paginationButton}
                disabled={page >= totalPages || loading}
                onClick={() => handlePageChange(page + 1)}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className={styles.mobileOnly}>
        {loading ? (
          <div className={styles.cardGrid}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`${styles.distributionCard} animate-pulse`}
              >
                <div style={{ padding: "1.5rem" }}>
                  <div
                    style={{
                      height: "1rem",
                      width: "75%",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "0.375rem",
                      marginBottom: "0.75rem",
                    }}
                  />
                  <div
                    style={{
                      height: "0.75rem",
                      width: "50%",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "0.375rem",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : distributions.length === 0 ? (
          <div className={styles.emptyState}>
            <span style={{ fontSize: "2.5rem" }}>🔍</span>
            <p style={{ color: "#6b7280" }}>
              No distributions found matching your search
            </p>
          </div>
        ) : (
          <>
            <div className={styles.cardGrid}>
              {distributions.map((dist) => (
                <div key={dist.id} className={styles.distributionCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                      <h3>{dist.station_name}</h3>
                      <span className={styles.stationCode}>
                        {dist.station_code}
                      </span>
                    </div>
                    <span
                      className={`${styles.statusBadge} ${
                        dist.is_active
                          ? styles.statusActive
                          : styles.statusInactive
                      }`}
                    >
                      {dist.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Partner</span>
                      <span className={styles.cardValue}>
                        {dist.partner_name}
                      </span>
                    </div>

                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Type</span>
                      <span className={styles.typeBadge}>
                        {dist.distribution_type}
                      </span>
                    </div>

                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Effective</span>
                      <span className={styles.cardValue}>
                        {formatDate(dist.effective_date)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <button className={styles.cardActionButton}>
                      <FiEye />
                      View
                    </button>
                    <button
                      className={styles.cardActionButton}
                      onClick={(e) => handleDeactivate(e, dist)}
                      disabled={deactivatingId === dist.id}
                      style={deactivatingId === dist.id ? { opacity: 0.5 } : {}}
                    >
                      <FiTrash2 />
                      {deactivatingId === dist.id ? "Deactivating..." : "Deactivate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Pagination */}
            {totalCount > 0 && (
              <div className={styles.mobilePagination}>
                <span className={styles.paginationInfo}>
                  Showing <strong>{distributions.length}</strong> of{" "}
                  <strong>{totalCount}</strong>
                </span>
                <div className={styles.paginationControls}>
                  <button
                    className={styles.paginationButton}
                    disabled={page === 1 || loading}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    <FiChevronLeft />
                  </button>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "0 0.75rem",
                      fontWeight: 700,
                      color: "#54bc28",
                    }}
                  >
                    {page} / {totalPages}
                  </div>
                  <button
                    className={styles.paginationButton}
                    disabled={page >= totalPages || loading}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StationDistributionList;
