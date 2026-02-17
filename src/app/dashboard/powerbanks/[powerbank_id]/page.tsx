"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import styles from "./powerbank-detail.module.css";
import {
  FiBattery,
  FiArrowLeft,
  FiRefreshCw,
  FiAlertCircle,
  FiMapPin,
  FiClock,
  FiUser,
  FiDollarSign,
  FiCalendar,
  FiEdit3,
  FiX,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
} from "react-icons/fi";
import { powerBankService } from "../../../../lib/api/powerbank.service";
import {
  PowerBankDetail,
  HistoryItem,
  Pagination,
  PowerBankStatus,
} from "../../../../types/powerbank.types";

interface PageParams {
  powerbank_id: string;
}

export default function PowerBankDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { powerbank_id } = use(params);
  const router = useRouter();

  const [powerbank, setPowerbank] = useState<PowerBankDetail | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyPagination, setHistoryPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Update Modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<"AVAILABLE" | "MAINTENANCE" | "DAMAGED">("AVAILABLE");
  const [statusReason, setStatusReason] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");

  const [historyPage, setHistoryPage] = useState(1);

  // Fetch powerbank detail
  const fetchPowerBankDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await powerBankService.getPowerBankDetail(powerbank_id);

      if (response.success) {
        setPowerbank(response.data);
      } else {
        setError("Failed to fetch powerbank details");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load powerbank details";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch rental history
  const fetchHistory = async (page: number = 1) => {
    try {
      const response = await powerBankService.getPowerBankHistory(powerbank_id, page);

      if (response.success) {
        setHistory(response.data.results);
        setHistoryPagination(response.data.pagination);
      }
    } catch (err) {
    }
  };

  useEffect(() => {
    fetchPowerBankDetail();
    fetchHistory(historyPage);
  }, [powerbank_id, historyPage]);

  const handleBack = () => {
    router.push("/dashboard/powerbanks");
  };

  const handleRefresh = () => {
    fetchPowerBankDetail();
    fetchHistory(historyPage);
  };

  const handleOpenStatusModal = () => {
    if (powerbank) {
      setNewStatus(
        powerbank.status === "RENTED" ? "AVAILABLE" : (powerbank.status as "AVAILABLE" | "MAINTENANCE" | "DAMAGED")
      );
      setStatusReason("");
      setStatusError("");
      setShowStatusModal(true);
    }
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setStatusReason("");
    setStatusError("");
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!statusReason.trim()) {
      setStatusError("Please provide a reason for the status change");
      return;
    }

    try {
      setStatusLoading(true);
      setStatusError("");

      const response = await powerBankService.updatePowerBankStatus(
        powerbank_id,
        newStatus,
        statusReason
      );

      if (response.success) {
        handleCloseStatusModal();
        fetchPowerBankDetail();
      } else {
        setStatusError("Failed to update status");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update status";
      setStatusError(errorMessage);
    } finally {
      setStatusLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading powerbank details...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !powerbank) {
    return (
      <main className={styles.container}>
        <div className={styles.errorContainer}>
          <FiAlertCircle className={styles.errorIcon} />
          <p className={styles.errorText}>{error || "PowerBank not found"}</p>
          <button onClick={handleBack} className={styles.backBtn}>
            <FiArrowLeft /> Back to PowerBanks
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button onClick={handleBack} className={styles.backBtn}>
          <FiArrowLeft /> Back
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>
            <FiBattery className={styles.titleIcon} />
            {powerbank.serial_number}
          </h1>
          <p className={styles.subtitle}>{powerbank.model}</p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={handleRefresh} className={styles.actionBtn} title="Refresh">
            <FiRefreshCw />
          </button>
          {powerbank.status !== "RENTED" && (
            <button onClick={handleOpenStatusModal} className={styles.statusBtn}>
              <FiEdit3 /> Update Status
            </button>
          )}
        </div>
      </header>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Left Column - Details */}
        <div className={styles.leftColumn}>
          {/* Status Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FiInfo /> Basic Information
            </h3>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Serial Number</span>
                <span className={styles.detailValue}>{powerbank.serial_number}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Model</span>
                <span className={styles.detailValue}>{powerbank.model}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Status</span>
                <span
                  className={styles.statusBadge}
                  style={{
                    backgroundColor: powerBankService.getStatusBgColor(powerbank.status),
                    color: powerBankService.getStatusColor(powerbank.status),
                  }}
                >
                  {powerbank.status}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Battery Level</span>
                <div className={styles.batteryContainer}>
                  <div className={styles.batteryOuter}>
                    <div
                      className={styles.batteryInner}
                      style={{
                        width: `${powerbank.battery_level}%`,
                        backgroundColor: powerBankService.getBatteryColor(powerbank.battery_level),
                      }}
                    />
                  </div>
                  <span className={styles.batteryText}>{powerbank.battery_level}%</span>
                </div>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Capacity</span>
                <span className={styles.detailValue}>{powerbank.capacity_mah?.toLocaleString() || 'N/A'} mAh</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Created</span>
                <span className={styles.detailValue}>
                  {new Date(powerbank.created_at).toLocaleString()}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Last Updated</span>
                <span className={styles.detailValue}>
                  {new Date(powerbank.last_updated).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Hardware Information */}
          {powerbank.hardware_info && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <FiInfo /> Hardware Information
              </h3>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Current</span>
                  <span className={styles.detailValue}>{powerbank.hardware_info.current ?? 'N/A'} A</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Voltage</span>
                  <span className={styles.detailValue}>{powerbank.hardware_info.voltage ?? 'N/A'} V</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Temperature</span>
                  <span className={styles.detailValue}>{powerbank.hardware_info.temperature ?? 'N/A'}°C</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Area Code</span>
                  <span className={styles.detailValue}>{powerbank.hardware_info.area_code ?? 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Micro Switch</span>
                  <span className={styles.detailValue}>{powerbank.hardware_info.micro_switch ?? 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Solenoid Valve</span>
                  <span className={styles.detailValue}>{powerbank.hardware_info.solenoid_valve ?? 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Software Version</span>
                  <span className={styles.detailValue}>{powerbank.hardware_info.soft_version ?? 'N/A'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Hardware Version</span>
                  <span className={styles.detailValue}>{powerbank.hardware_info.hard_version ?? 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Current Location */}
          {powerbank.current_station && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <FiMapPin /> Current Location
              </h3>
              <div className={styles.locationInfo}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Station</span>
                  <span className={styles.detailValue}>{powerbank.current_station.name}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Serial Number</span>
                  <span className={styles.detailValue}>{powerbank.current_station.serial_number}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Address</span>
                  <span className={styles.detailValue}>{powerbank.current_station.address}</span>
                </div>
                {powerbank.current_slot && (
                  <>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Slot Number</span>
                      <span className={styles.detailValue}>{powerbank.current_slot.slot_number}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Slot Status</span>
                      <span className={styles.statusBadge} style={{
                        backgroundColor: powerbank.current_slot.status === 'AVAILABLE' ? 'rgba(71, 178, 22, 0.2)' : 'rgba(255, 193, 7, 0.2)',
                        color: powerbank.current_slot.status === 'AVAILABLE' ? '#47b216' : '#ffc107'
                      }}>
                        {powerbank.current_slot.status}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Current Rental */}
          {powerbank.current_rental && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <FiUser /> Current Rental
              </h3>
              <div className={styles.rentalDetails}>
                <div className={styles.rentalRow}>
                  <span className={styles.rentalLabel}>Rental Code</span>
                  <span className={styles.rentalValue}>{powerbank.current_rental.rental_code}</span>
                </div>
                <div className={styles.rentalRow}>
                  <span className={styles.rentalLabel}>User</span>
                  <span className={styles.rentalValue}>{powerbank.current_rental.user.username}</span>
                </div>
                <div className={styles.rentalRow}>
                  <span className={styles.rentalLabel}>Package</span>
                  <span className={styles.rentalValue}>{powerbank.current_rental.package.name}</span>
                </div>
                <div className={styles.rentalRow}>
                  <span className={styles.rentalLabel}>Started</span>
                  <span className={styles.rentalValue}>
                    {powerBankService.formatDateTime(powerbank.current_rental.started_at)}
                  </span>
                </div>
                <div className={styles.rentalRow}>
                  <span className={styles.rentalLabel}>Due</span>
                  <span className={styles.rentalValue}>
                    {powerBankService.formatDateTime(powerbank.current_rental.due_at)}
                  </span>
                </div>
                <div className={styles.rentalRow}>
                  <span className={styles.rentalLabel}>Status</span>
                  <span
                    className={styles.rentalStatusBadge}
                    style={{
                      backgroundColor: powerBankService.getRentalStatusBgColor(powerbank.current_rental.status),
                      color: powerBankService.getRentalStatusColor(powerbank.current_rental.status),
                    }}
                  >
                    {powerbank.current_rental.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Statistics & History */}
        <div className={styles.rightColumn}>
          {/* Statistics */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: "rgba(130, 234, 128, 0.1)", color: "#82ea80" }}>
                <FiClock />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{powerbank.statistics?.total_rentals ?? 0}</span>
                <span className={styles.statLabel}>Total Rentals</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                <FiCheck />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{powerbank.statistics?.completed_rentals ?? 0}</span>
                <span className={styles.statLabel}>Completed</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                <FiDollarSign />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>
                  ₹{powerbank.statistics?.total_revenue ?? '0'}
                </span>
                <span className={styles.statLabel}>Revenue</span>
              </div>
            </div>
          </div>

          {/* Lifecycle Information */}
          {powerbank.lifecycle && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <FiBattery /> Lifecycle Information
              </h3>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Total Cycles</span>
                  <span className={styles.detailValue}>{parseFloat(powerbank.lifecycle.total_cycles || '0').toFixed(2)}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Total Rentals</span>
                  <span className={styles.detailValue}>{powerbank.lifecycle.total_rentals ?? 0}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Avg Cycles/Rental</span>
                  <span className={styles.detailValue}>{powerbank.lifecycle.avg_cycles_per_rental ?? '0'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Avg Discharge/Rental</span>
                  <span className={styles.detailValue}>{powerbank.lifecycle.avg_discharge_per_rental ?? '0'}%</span>
                </div>
              </div>

              {/* Recent Cycle Logs */}
              {powerbank.lifecycle.recent_cycle_logs && powerbank.lifecycle.recent_cycle_logs.length > 0 && (
                <>
                  <h4 className={styles.subTitle}>Recent Cycle Logs</h4>
                  <div className={styles.cycleLogsList}>
                    {powerbank.lifecycle.recent_cycle_logs.map((log: any, index: number) => (
                      <div key={index} className={styles.cycleLogItem}>
                        <div className={styles.cycleLogRow}>
                          <span className={styles.detailLabel}>Cycles</span>
                          <span className={styles.detailValue}>{log.cycles ?? 'N/A'}</span>
                        </div>
                        <div className={styles.cycleLogRow}>
                          <span className={styles.detailLabel}>Discharge</span>
                          <span className={styles.detailValue}>{log.discharge ?? 'N/A'}%</span>
                        </div>
                        <div className={styles.cycleLogRow}>
                          <span className={styles.detailLabel}>Date</span>
                          <span className={styles.detailValue}>
                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Recent History */}
          {powerbank.recent_history && powerbank.recent_history.length > 0 && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <FiClock /> Recent Activity
              </h3>
              <div className={styles.historyList}>
                {powerbank.recent_history.map((item: any, index: number) => (
                  <div key={index} className={styles.historyItem}>
                    <div className={styles.historyHeader}>
                      <span className={styles.historyCode}>{item.event_type ?? 'Event'}</span>
                      <span className={styles.historyDate}>
                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    {item.description && (
                      <div className={styles.historyBody}>
                        <p className={styles.historyDescription}>{item.description}</p>
                      </div>
                    )}
                    {item.details && (
                      <div className={styles.historyDetails}>
                        {Object.entries(item.details).map(([key, value]) => (
                          <div key={key} className={styles.historyRow}>
                            <span className={styles.detailLabel}>{key}</span>
                            <span className={styles.detailValue}>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rental History */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FiCalendar /> Rental History
            </h3>
            {history.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No rental history found</p>
              </div>
            ) : (
              <>
                <div className={styles.historyList}>
                  {history.map((item) => (
                    <div key={item.rental_code} className={styles.historyItem}>
                      <div className={styles.historyHeader}>
                        <span className={styles.historyCode}>{item.rental_code}</span>
                        <span
                          className={styles.historyStatus}
                          style={{
                            backgroundColor: powerBankService.getRentalStatusBgColor(item.status),
                            color: powerBankService.getRentalStatusColor(item.status),
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className={styles.historyBody}>
                        <div className={styles.historyRow}>
                          <FiUser /> {item.user.username}
                        </div>
                        <div className={styles.historyRow}>
                          <FiMapPin /> {item.pickup_station.name}
                          {item.return_station && <span> → {item.return_station.name}</span>}
                        </div>
                        <div className={styles.historyRow}>
                          <FiClock /> {powerBankService.formatDateTime(item.started_at)}
                          {item.ended_at && <span> - {powerBankService.formatDateTime(item.ended_at)}</span>}
                        </div>
                        <div className={styles.historyRow}>
                          <FiDollarSign /> {powerBankService.formatCurrency(item.amount_paid)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* History Pagination */}
                {historyPagination && historyPagination.total_pages > 1 && (
                  <div className={styles.pagination}>
                    <button
                      className={styles.pageBtn}
                      disabled={!historyPagination.has_previous}
                      onClick={() => setHistoryPage(historyPage - 1)}
                    >
                      <FiChevronLeft />
                    </button>
                    <span className={styles.pageInfo}>
                      {historyPagination.current_page} / {historyPagination.total_pages}
                    </span>
                    <button
                      className={styles.pageBtn}
                      disabled={!historyPagination.has_next}
                      onClick={() => setHistoryPage(historyPage + 1)}
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className={styles.modalOverlay} onClick={handleCloseStatusModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Update PowerBank Status</h3>
              <button onClick={handleCloseStatusModal} className={styles.modalClose}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleStatusUpdate}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>New Status</label>
                  <div className={styles.statusOptions}>
                    <button
                      type="button"
                      className={`${styles.statusOption} ${newStatus === "AVAILABLE" ? styles.statusOptionActive : ""}`}
                      onClick={() => setNewStatus("AVAILABLE")}
                    >
                      Available
                    </button>
                    <button
                      type="button"
                      className={`${styles.statusOption} ${newStatus === "MAINTENANCE" ? styles.statusOptionActive : ""}`}
                      onClick={() => setNewStatus("MAINTENANCE")}
                    >
                      Maintenance
                    </button>
                    <button
                      type="button"
                      className={`${styles.statusOption} ${newStatus === "DAMAGED" ? styles.statusOptionActive : ""}`}
                      onClick={() => setNewStatus("DAMAGED")}
                    >
                      Damaged
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Reason *</label>
                  <textarea
                    className={styles.formTextarea}
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder="Enter reason for status change..."
                    rows={3}
                  />
                </div>

                {statusError && (
                  <div className={styles.formError}>
                    <FiAlertCircle /> {statusError}
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button type="button" onClick={handleCloseStatusModal} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={statusLoading}>
                  {statusLoading ? "Updating..." : "Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
