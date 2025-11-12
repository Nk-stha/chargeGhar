"use client";

import React, { useState, useEffect, useMemo } from "react";
import styles from "./late-fee-configs.module.css";
import {
  FiDollarSign,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiFilter,
  FiX,
} from "react-icons/fi";
import LateFeeConfigModal from "./LateFeeConfigModal";
import {
  LateFeeConfiguration,
  LateFeeConfigsResponse,
} from "@/types/lateFeeConfig";

export default function LateFeeConfigsPage() {
  const [configurations, setConfigurations] = useState<LateFeeConfiguration[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<LateFeeConfiguration | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterFeeType, setFilterFeeType] = useState<string>("");
  const [filterIsActive, setFilterIsActive] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState({
    total_configurations: 0,
    active_configurations: 0,
    inactive_configurations: 0,
  });

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      const queryParams = new URLSearchParams();

      if (search) queryParams.append("search", search);
      if (filterFeeType) queryParams.append("fee_type", filterFeeType);
      if (filterIsActive) queryParams.append("is_active", filterIsActive);
      queryParams.append("page", currentPage.toString());
      queryParams.append("page_size", "20");

      const queryString = queryParams.toString();
      const url = `/api/admin/late-fee-configs${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: LateFeeConfigsResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch configurations");
      }

      setConfigurations(data.data.configurations);
      setTotalPages(data.data.pagination.total_pages);
      setTotalCount(data.data.pagination.total_count);
      setSummary(data.data.summary);
    } catch (err: any) {
      console.error("Error fetching late fee configurations:", err);
      setError(err.message || "Failed to fetch configurations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, [currentPage, search, filterFeeType, filterIsActive]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleDelete = async (id: string, name: string, isActive: boolean) => {
    if (isActive) {
      alert(
        "Cannot delete an active configuration. Please deactivate it first."
      );
      return;
    }

    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      setDeleteLoading(id);
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`/api/admin/late-fee-configs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete configuration");
      }

      setSuccessMessage(`Configuration "${name}" deleted successfully`);
      fetchConfigurations();
    } catch (err: any) {
      console.error("Error deleting configuration:", err);
      setError(err.message || "Failed to delete configuration");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (config: LateFeeConfiguration) => {
    setEditingConfig(config);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingConfig(null);
  };

  const handleModalSuccess = () => {
    setSuccessMessage(
      editingConfig
        ? "Configuration updated successfully"
        : "Configuration created successfully"
    );
    fetchConfigurations();
  };

  const clearFilters = () => {
    setFilterFeeType("");
    setFilterIsActive("");
    setSearch("");
    setCurrentPage(1);
  };

  const hasActiveFilters = search || filterFeeType || filterIsActive;

  const getFeeTypeBadgeColor = (feeType: string) => {
    switch (feeType) {
      case "MULTIPLIER":
        return styles.badgeMultiplier;
      case "FLAT_RATE":
        return styles.badgeFlat;
      case "COMPOUND":
        return styles.badgeCompound;
      default:
        return "";
    }
  };

  if (loading && configurations.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <FiLoader className={styles.spinner} size={40} />
          <p>Loading configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Late Fee Configurations</h1>
          <p className={styles.subtitle}>
            Manage late fee calculation rules and settings
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={() => {
            setEditingConfig(null);
            setShowModal(true);
          }}
        >
          <FiPlus /> Add Configuration
        </button>
      </div>

      {successMessage && (
        <div className={styles.successBanner}>
          <FiCheckCircle />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className={styles.errorBanner}>
          <FiAlertCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)} className={styles.closeBanner}>
            <FiX />
          </button>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search configurations..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.search}
          />
          {search && (
            <button
              className={styles.clearSearch}
              onClick={() => {
                setSearch("");
                setCurrentPage(1);
              }}
            >
              ×
            </button>
          )}
        </div>

        <div className={styles.filterSection}>
          <button
            className={`${styles.filterButton} ${showFilters ? styles.filterButtonActive : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> Filters
            {hasActiveFilters && <span className={styles.filterBadge}>•</span>}
          </button>

          {hasActiveFilters && (
            <button className={styles.clearFiltersButton} onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label>Fee Type</label>
            <select
              value={filterFeeType}
              onChange={(e) => {
                setFilterFeeType(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.filterSelect}
            >
              <option value="">All Types</option>
              <option value="MULTIPLIER">Multiplier</option>
              <option value="FLAT_RATE">Flat Rate</option>
              <option value="COMPOUND">Compound</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Status</label>
            <select
              value={filterIsActive}
              onChange={(e) => {
                setFilterIsActive(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.filterSelect}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.statItem}>
          Total: <strong>{summary.total_configurations}</strong>
        </div>
        <div className={styles.statItem}>
          Active:{" "}
          <strong className={styles.activeCount}>
            {summary.active_configurations}
          </strong>
        </div>
        <div className={styles.statItem}>
          Inactive: <strong>{summary.inactive_configurations}</strong>
        </div>
      </div>

      {configurations.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <FiDollarSign className={styles.emptyIcon} />
            <p>No late fee configurations found</p>
            {hasActiveFilters ? (
              <button className={styles.emptyButton} onClick={clearFilters}>
                Clear Filters
              </button>
            ) : (
              <button
                className={styles.emptyButton}
                onClick={() => setShowModal(true)}
              >
                <FiPlus /> Create First Configuration
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <FiDollarSign className={styles.icon} />
                Configurations
              </div>
              <p className={styles.cardSubText}>
                Showing {configurations.length} of {totalCount} configurations
              </p>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Fee Type</th>
                    <th>Multiplier</th>
                    <th>Flat Rate</th>
                    <th>Grace Period</th>
                    <th>Max Daily Rate</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {configurations.map((config) => (
                    <tr key={config.id}>
                      <td>
                        <div className={styles.nameCell}>
                          <div>
                            <div className={styles.configName}>
                              {config.name}
                            </div>
                            {config.metadata?.description && (
                              <div className={styles.description}>
                                {config.metadata.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.feeTypeBadge} ${getFeeTypeBadgeColor(config.fee_type)}`}
                        >
                          {config.fee_type}
                        </span>
                      </td>
                      <td>
                        <span className={styles.value}>
                          {parseFloat(config.multiplier) > 0
                            ? `${config.multiplier}x`
                            : "-"}
                        </span>
                      </td>
                      <td>
                        <span className={styles.value}>
                          {parseFloat(config.flat_rate_per_hour) > 0
                            ? `NPR ${parseFloat(config.flat_rate_per_hour).toFixed(2)}`
                            : "-"}
                        </span>
                      </td>
                      <td>
                        <span className={styles.value}>
                          {config.grace_period_minutes > 0
                            ? `${config.grace_period_minutes} min`
                            : "None"}
                        </span>
                      </td>
                      <td>
                        <span className={styles.value}>
                          {parseFloat(config.max_daily_rate) > 0
                            ? `NPR ${parseFloat(config.max_daily_rate).toFixed(2)}`
                            : "No Limit"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            config.is_active
                              ? styles.statusActive
                              : styles.statusInactive
                          }
                        >
                          {config.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.editBtn}
                            onClick={() => handleEdit(config)}
                            title="Edit configuration"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() =>
                              handleDelete(config.id, config.name, config.is_active)
                            }
                            disabled={
                              deleteLoading === config.id || config.is_active
                            }
                            title={
                              config.is_active
                                ? "Cannot delete active configuration"
                                : "Delete configuration"
                            }
                          >
                            {deleteLoading === config.id ? (
                              <FiLoader className={styles.spinner} />
                            ) : (
                              <FiTrash2 />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationButton}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className={styles.paginationInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className={styles.paginationButton}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <LateFeeConfigModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        config={editingConfig}
      />
    </div>
  );
}
