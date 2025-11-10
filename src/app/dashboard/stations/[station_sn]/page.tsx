"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./stationDetails.module.css";
import {
  FiEdit,
  FiArrowLeft,
  FiMapPin,
  FiActivity,
  FiWifi,
  FiWifiOff,
  FiAlertCircle,
  FiRefreshCw,
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";
import stationsService from "../../../../lib/api/stations.service";
import { StationDetail } from "../../../../types/station.types";

export default function StationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const stationSn = params.station_sn as string;

  const [station, setStation] = useState<StationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStationDetails = useCallback(
    async (isRefresh: boolean = false) => {
      if (!stationSn) {
        setError("Station ID not provided");
        setLoading(false);
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        const response = await stationsService.getStation(stationSn);
        if (response.success && response.data) {
          setStation(response.data);
          setError(null);
        } else {
          setError("Failed to load station details");
        }
      } catch (err: any) {
        console.error("Error fetching station:", err);
        setError(
          err.response?.data?.message || "Failed to load station details",
        );
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [stationSn],
  );

  useEffect(() => {
    fetchStationDetails();
  }, [fetchStationDetails]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh || !stationSn) return;

    const intervalId = setInterval(() => {
      fetchStationDetails(true);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [autoRefresh, stationSn, fetchStationDetails]);

  const handleEdit = () => {
    router.push(`/dashboard/stations/${stationSn}/edit`);
  };

  const handleBack = () => {
    router.push("/dashboard/stations");
  };

  const handleManualRefresh = () => {
    fetchStationDetails(true);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading station details...</p>
        </div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={handleBack}>
          <FiArrowLeft /> Back
        </button>
        <div className={styles.errorContainer}>
          <FiAlertCircle className={styles.errorIcon} />
          <h2>Error Loading Station</h2>
          <p>{error || "Station not found"}</p>
          <button
            className={styles.retryBtn}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const utilizationPercent = stationsService.calculateUtilization(station);
  const statusColor = stationsService.getStatusColor(station.status);

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={handleBack}>
        <FiArrowLeft /> Back to Stations
      </button>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{station.station_name}</h1>
          <p className={styles.subtitle}>
            <FiMapPin className={styles.icon} />
            {station.address}
            {station.landmark && ` • ${station.landmark}`}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.refreshBtn}
            onClick={handleManualRefresh}
            disabled={refreshing}
            title="Refresh"
          >
            <FiRefreshCw className={refreshing ? styles.spinning : ""} />
          </button>
          <button
            className={`${styles.autoRefreshBtn} ${autoRefresh ? styles.active : ""}`}
            onClick={toggleAutoRefresh}
            title={autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          >
            {autoRefresh ? <FiToggleRight /> : <FiToggleLeft />}
            {autoRefresh ? "Auto" : "Manual"}
          </button>
          <button className={styles.editBtn} onClick={handleEdit}>
            <FiEdit /> Edit Station
          </button>
        </div>
      </div>

      <div className={styles.statusBar}>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Status</span>
          <span
            className={`${styles.statusBadge} ${styles[station.status.toLowerCase()]}`}
            style={{ backgroundColor: `${statusColor}22`, color: statusColor }}
          >
            {station.status === "ONLINE" ? <FiWifi /> : <FiWifiOff />}
            {station.status}
          </span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Maintenance</span>
          <span
            className={
              station.is_maintenance
                ? styles.maintenanceOn
                : styles.maintenanceOff
            }
          >
            {station.is_maintenance ? "Yes" : "No"}
          </span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Utilization</span>
          <div className={styles.utilizationContainer}>
            <div className={styles.utilizationBar}>
              <div
                className={styles.utilizationFill}
                style={{ width: `${utilizationPercent}%` }}
              />
            </div>
            <span className={styles.utilizationText}>
              {utilizationPercent}%
            </span>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Basic Information Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Basic Information</h2>
          <div className={styles.cardContent}>
            <div className={styles.row}>
              <label>Station ID:</label>
              <span>{station.id}</span>
            </div>
            <div className={styles.row}>
              <label>Station Name:</label>
              <span>{station.station_name}</span>
            </div>
            <div className={styles.row}>
              <label>Serial Number:</label>
              <span className={styles.monospace}>{station.serial_number}</span>
            </div>
            <div className={styles.row}>
              <label>IMEI:</label>
              <span className={styles.monospace}>{station.imei}</span>
            </div>
            <div className={styles.row}>
              <label>Total Slots:</label>
              <span>{station.total_slots}</span>
            </div>
            <div className={styles.row}>
              <label>Available Slots:</label>
              <span>
                {station.slots?.filter((s) => s.status === "AVAILABLE")
                  .length || 0}
              </span>
            </div>
            <div className={styles.row}>
              <label>Occupied Slots:</label>
              <span>
                {station.slots?.filter((s) => s.status === "OCCUPIED").length ||
                  0}
              </span>
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Location</h2>
          <div className={styles.cardContent}>
            <div className={styles.row}>
              <label>Address:</label>
              <span>{station.address}</span>
            </div>
            {station.landmark && (
              <div className={styles.row}>
                <label>Landmark:</label>
                <span>{station.landmark}</span>
              </div>
            )}
            <div className={styles.row}>
              <label>Latitude:</label>
              <span className={styles.monospace}>{station.latitude}</span>
            </div>
            <div className={styles.row}>
              <label>Longitude:</label>
              <span className={styles.monospace}>{station.longitude}</span>
            </div>
            <div className={styles.mapContainer}>
              <iframe
                title="Station Location"
                width="100%"
                height="200"
                style={{ border: 0, borderRadius: "8px" }}
                loading="lazy"
                src={`https://www.google.com/maps?q=${station.latitude},${station.longitude}&z=15&output=embed`}
              />
            </div>
          </div>
        </div>

        {/* Hardware Information Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Hardware Information</h2>
          <div className={styles.cardContent}>
            {station.hardware_info?.firmware_version && (
              <div className={styles.row}>
                <label>Firmware Version:</label>
                <span>{station.hardware_info.firmware_version}</span>
              </div>
            )}
            {station.hardware_info?.hardware_version && (
              <div className={styles.row}>
                <label>Hardware Version:</label>
                <span>{station.hardware_info.hardware_version}</span>
              </div>
            )}
            {station.hardware_info?.signal_strength !== undefined && (
              <div className={styles.row}>
                <label>Signal Strength:</label>
                <span>{station.hardware_info.signal_strength}%</span>
              </div>
            )}
            {station.hardware_info?.protocol_version && (
              <div className={styles.row}>
                <label>Protocol Version:</label>
                <span>{station.hardware_info.protocol_version}</span>
              </div>
            )}
            <div className={styles.row}>
              <label>Last Heartbeat:</label>
              <span>
                {station.last_heartbeat ? (
                  <>
                    <FiActivity className={styles.icon} />
                    {new Date(station.last_heartbeat).toLocaleString()}
                  </>
                ) : (
                  <span className={styles.noData}>No heartbeat</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Powerbanks Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Powerbanks</h2>
          <div className={styles.cardContent}>
            <div className={styles.row}>
              <label>Total Powerbanks:</label>
              <span>{station.powerbanks?.length || 0}</span>
            </div>
            <div className={styles.row}>
              <label>Available Powerbanks:</label>
              <span>
                {station.powerbanks?.filter((pb) => pb.status === "AVAILABLE")
                  .length || 0}
              </span>
            </div>
            <div className={styles.row}>
              <label>Rented Powerbanks:</label>
              <span>
                {station.powerbanks?.filter((pb) => pb.status === "RENTED")
                  .length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Media/Images Card */}
        {station.media && station.media.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Station Images</h2>
            <div className={styles.cardContent}>
              <div className={styles.mediaGrid}>
                {station.media.map((media) => (
                  <div key={media.id} className={styles.mediaItem}>
                    <img
                      src={media.thumbnail_url || media.file_url}
                      alt={media.title}
                      className={styles.mediaImage}
                    />
                    <div className={styles.mediaInfo}>
                      <span className={styles.mediaTitle}>{media.title}</span>
                      {media.is_primary && (
                        <span className={styles.primaryBadge}>Primary</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Amenities Card */}
        {station.amenities && station.amenities.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Amenities</h2>
            <div className={styles.cardContent}>
              <div className={styles.amenitiesList}>
                {station.amenities.map((amenity) => (
                  <span key={amenity.id} className={styles.amenityTag}>
                    {amenity.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Timestamps Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Timestamps</h2>
          <div className={styles.cardContent}>
            <div className={styles.row}>
              <label>Created At:</label>
              <span>{new Date(station.created_at).toLocaleString()}</span>
            </div>
            <div className={styles.row}>
              <label>Updated At:</label>
              <span>{new Date(station.updated_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slots Section */}
      {station.slots && station.slots.length > 0 && (
        <div className={styles.slotsSection}>
          <h2 className={styles.sectionTitle}>Slots Overview</h2>
          <div className={styles.slotsGrid}>
            {station.slots.map((slot) => (
              <div
                key={slot.id}
                className={`${styles.slotCard} ${styles[slot.status.toLowerCase()]}`}
              >
                <div className={styles.slotHeader}>
                  <span className={styles.slotNumber}>
                    Slot {slot.slot_number}
                  </span>
                  <span className={styles.slotStatus}>{slot.status}</span>
                </div>
                <div className={styles.slotBody}>
                  {slot.powerbank ? (
                    <>
                      <p className={styles.slotInfo}>
                        <strong>SN:</strong> {slot.powerbank.serial_number}
                      </p>
                      <p className={styles.slotInfo}>
                        <strong>Battery:</strong> {slot.battery_level}%
                      </p>
                      <div className={styles.batteryBar}>
                        <div
                          className={styles.batteryFill}
                          style={{ width: `${slot.battery_level}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className={styles.emptySlot}>Empty</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
