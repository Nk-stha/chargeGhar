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
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { useStations } from "../../../hooks/useStations";
import stationsService from "../../../lib/api/stations.service";
import { Station } from "../../../types/station.types";
import DataTable from "../../../components/DataTable/dataTable";

const StationsPage: React.FC = () => {
  const router = useRouter();
  const {
    stations,
    pagination,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    search,
    refetch,
    setPage,
    setSearch,
  } = useStations(10);

  const [searchInput, setSearchInput] = useState("");
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    station: Station | null;
  }>({ show: false, station: null });
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Server-side search is handled by the hook, no client-side filtering needed
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setSearch(searchInput);
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
  };

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
        deleteModal.station.serial_number
      );

      if (response.success) {
        await refetch();
        setDeleteModal({ show: false, station: null });
      } else {
        setDeleteError("Failed to delete station");
      }
    } catch (err: any) {
      setDeleteError(
        err.response?.data?.message ||
        "Failed to delete station. It may have active rentals."
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
    router.push(`/dashboard/stations/${station.serial_number}/edit`);
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
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    const intervalId = setInterval(() => refetch(), 30000);
    return () => clearInterval(intervalId);
  }, [autoRefresh, refetch]);

  const columns = [
    { header: "#", accessor: "index" },
    {
      header: "Station Name",
      accessor: "station_name",
      render: (_: any, row: Station) => (
        <div className={styles.stationNameCell}>
          <span className={styles.stationName}>
            <FiMapPin className={styles.icon} /> {row.station_name}
          </span>
          <span className={styles.serialNumber}>{row.serial_number}</span>
        </div>
      ),
    },
    {
      header: "Location",
      accessor: "address",
      render: (_: any, row: Station) => (
        <div className={styles.locationCell}>
          <span className={styles.address}>{row.address}</span>
          {row.landmark && <span className={styles.landmark}>{row.landmark}</span>}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (value: string, row: Station) => (
        <div className={styles.statusCell}>
          <span className={`${styles.status} ${styles[value.toLowerCase()]}`}>
            {value}
          </span>
          {row.is_maintenance && (
            <span className={styles.maintenanceBadge}>Maintenance</span>
          )}
        </div>
      ),
    },
    {
      header: "Slots",
      accessor: "total_slots",
      render: (_: any, row: Station) => (
        <div className={styles.slotsCell}>
          <span className={styles.totalSlots}>{row.total_slots} Total</span>
          <span className={styles.slotBreakdown}>
            {row.available_slots} Available / {row.occupied_slots} Occupied
          </span>
        </div>
      ),
    },
    {
      header: "PowerBanks",
      accessor: "total_powerbanks",
      render: (_: any, row: Station) => (
        <div className={styles.powerbanksCell}>
          <span className={styles.totalPowerbanks}>{row.total_powerbanks} Total</span>
          <span className={styles.availablePowerbanks}>
            {row.available_powerbanks} Available
          </span>
        </div>
      ),
    },
    {
      header: "Utilization",
      accessor: "utilization",
      render: (_: any, row: Station) => {
        const percent = stationsService.calculateUtilization(row);
        return (
          <div className={styles.utilizationCell}>
            <div className={styles.utilizationBar}>
              <div
                className={styles.utilizationFill}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className={styles.utilizationText}>{percent}%</span>
          </div>
        );
      },
    },
    {
      header: "Amenities",
      accessor: "amenities",
      render: (_: any, row: Station) => (
        <div className={styles.amenitiesCell}>
          {row.amenities && row.amenities.length > 0 ? (
            <span className={styles.amenitiesCount}>{row.amenities.length} amenities</span>
          ) : (
            <span className={styles.noAmenities}>None</span>
          )}
        </div>
      ),
    },
    {
      header: "Last Heartbeat",
      accessor: "last_heartbeat",
      render: (value: string | null) => (
        <span className={styles.heartbeat}>
          {value ? new Date(value).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }) : "Never"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (_: any, row: Station) => (
        <div className={styles.actions}>
          <button
            className={styles.editButton}
            onClick={(e) => handleEdit(row, e)}
          >
            <FiEdit />
          </button>
          <button
            className={styles.deleteButton}
            onClick={(e) => handleDeleteClick(row, e)}
          >
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ];

  const tableData = stations.map((station, index) => ({
    ...station,
    index: (currentPage - 1) * 10 + index + 1,
  }));

  if (loading && stations.length === 0) return <div className={styles.container}>Loading...</div>;
  if (error && stations.length === 0) return <div className={styles.container}>{error}</div>;

  return (
    <div className={styles.StationsPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Stations</h1>
        <p className={styles.subtitle}>Add and Manage stations configurations</p>

        <div className={styles.header}>
          <div className={styles.headerActions}>
            <div className={styles.searchBox}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name, serial number, or location (Press Enter)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              {searchInput && (
                <button
                  className={styles.clearSearchBtn}
                  onClick={handleClearSearch}
                  type="button"
                >
                  <FiX />
                </button>
              )}
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
                className={`${styles.autoRefreshButton} ${autoRefresh ? styles.active : ""
                  }`}
                onClick={toggleAutoRefresh}
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

        <DataTable
          title="Station List"
          subtitle={`Showing ${tableData.length} of ${totalCount} stations`}
          columns={columns}
          data={tableData}
          loading={loading}
          emptyMessage="No stations found."
          onRowClick={(row) => handleRowClick(row)}
        />

        {/* Pagination */}
        {totalPages > 1 && !loading && stations.length > 0 && (
          <div className={styles.pagination}>
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loading}
              className={styles.paginationBtn}
            >
              <FiChevronLeft /> Previous
            </button>
            <span className={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loading}
              className={styles.paginationBtn}
            >
              Next <FiChevronRight />
            </button>
          </div>
        )}

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
