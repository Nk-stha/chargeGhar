"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./stations.module.css";
import { useRouter } from "next/navigation";
import {
  FiMapPin,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiAlertCircle,
  FiX,
  FiRefreshCw,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";
import { useDashboardData } from "../../../contexts/DashboardDataContext";
import stationsService from "../../../lib/api/stations.service";
import { Station } from "../../../types/station.types";

const StationsPage: React.FC = () => {
  const router = useRouter();
  const { stationsData, loading, error, refetchStations } = useDashboardData();

  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    station: Station | null;
  }>({ show: false, station: null });
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const stations: Station[] = stationsData?.results || [];

  const filteredStations = stations.filter(
    (s: Station) =>
      s.station_name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDeleteClick = (station: Station, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({ show: true, station });
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.station) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const response = await stationsService.deleteStation(
        deleteModal.station.serial_number,
      );

      if (response.success) {
        // Refresh stations list
        await refetchStations();
        // Close modal
        setDeleteModal({ show: false, station: null });
      } else {
        setDeleteError("Failed to delete station");
      }
    } catch (err: any) {
      console.error("Error deleting station:", err);
      setDeleteError(
        err.response?.data?.message ||
          "Failed to delete station. It may have active rentals.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, station: null });
    setDeleteError(null);
  };

  const handleEdit = (station: Station, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/stations/${station.serial_number}`);
  };

  const handleRowClick = (station: Station) => {
    router.push(`/dashboard/stations/${station.serial_number}`);
  };

  const handleAdd = () => {
    router.push(`/dashboard/stations/add`);
  };

  const handleManualRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchStations();
    } finally {
      setRefreshing(false);
    }
  }, [refetchStations]);

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      refetchStations();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [autoRefresh, refetchStations]);

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (error) return <div className={styles.container}>{error}</div>;

  return (
    <div className={styles.StationsPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Stations</h1>
        <p className={styles.subtitle}>
          Add and Manage stations configurations
        </p>

        <div className={styles.header}>
          <div className={styles.headerActions}>
            <div className={styles.searchBox}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name or location"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className={styles.actionButtons}>
              <button
                className={styles.refreshButton}
                onClick={handleManualRefresh}
                disabled={refreshing || loading}
                title="Refresh"
              >
                <FiRefreshCw className={refreshing ? styles.spinning : ""} />
              </button>
              <button
                className={`${styles.autoRefreshButton} ${autoRefresh ? styles.active : ""}`}
                onClick={toggleAutoRefresh}
                title={autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
              >
                {autoRefresh ? <FiToggleRight /> : <FiToggleLeft />}
                {autoRefresh ? "Auto" : "Manual"}
              </button>
              <button className={styles.addButton} onClick={handleAdd}>
                <FiPlus /> Add Station
              </button>
            </div>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Station Name</th>
                <th>Location</th>
                <th>Status</th>
                <th>Chargers</th>
                <th>Utilization</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStations.length > 0 ? (
                filteredStations.map((station: Station, index: number) => {
                  const utilizationPercent =
                    stationsService.calculateUtilization(station);

                  return (
                    <tr
                      key={station.id}
                      className={styles.clickableRow}
                      onClick={() => handleRowClick(station)}
                    >
                      <td>{index + 1}</td>
                      <td>
                        <FiMapPin className={styles.icon} />{" "}
                        {station.station_name}
                      </td>
                      <td>{station.address}</td>
                      <td>
                        <span
                          className={`${styles.status} ${
                            styles[station.status.toLowerCase()]
                          }`}
                        >
                          {station.status}
                        </span>
                      </td>
                      <td>{station.total_slots}</td>
                      <td>
                        <div className={styles.utilizationBar}>
                          <div
                            className={styles.utilizationFill}
                            style={{ width: `${utilizationPercent}%` }}
                          />
                        </div>
                        <span className={styles.utilizationText}>
                          {utilizationPercent}%
                        </span>
                      </td>
                      <td className={styles.actions}>
                        <button
                          className={styles.editButton}
                          onClick={(e) => handleEdit(station, e)}
                          title="Edit station"
                        >
                          <FiEdit />
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={(e) => handleDeleteClick(station, e)}
                          title="Delete station"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className={styles.noResults}>
                    No stations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Confirm Delete</h3>
                <button
                  className={styles.closeButton}
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                >
                  <FiX />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.warningIcon}>
                  <FiAlertCircle />
                </div>
                <p>
                  Are you sure you want to delete station{" "}
                  <strong>{deleteModal.station?.station_name}</strong>?
                </p>
                <p className={styles.warningText}>
                  This action cannot be undone. The station can only be deleted
                  if it has no active rentals.
                </p>
                {deleteError && (
                  <div className={styles.errorBox}>
                    <FiAlertCircle />
                    <span>{deleteError}</span>
                  </div>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelButton}
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className={styles.deleteConfirmButton}
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete Station"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StationsPage;
