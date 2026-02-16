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
import iotService from "../../../../lib/api/iot.service";
import { StationDetail } from "../../../../types/station.types";
import { toast } from "sonner";
import WiFiScanModal from "../../../../components/StationManagement/WiFiScanModal";
import WiFiConnectModal from "../../../../components/StationManagement/WiFiConnectModal";
import VolumeControlModal from "../../../../components/StationManagement/VolumeControlModal";

export default function StationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const stationSn = params.station_sn as string;

  const [station, setStation] = useState<StationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hardwareActionLoading, setHardwareActionLoading] = useState<string | null>(null);
  const [wifiScanModalOpen, setWifiScanModalOpen] = useState(false);
  const [wifiConnectModalOpen, setWifiConnectModalOpen] = useState(false);
  const [wifiNetworks, setWifiNetworks] = useState<string[]>([]);
  const [volumeModalOpen, setVolumeModalOpen] = useState(false);
  const [checkStationData, setCheckStationData] = useState<any>(null);
  const [checkStationModalOpen, setCheckStationModalOpen] = useState(false);

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

  const handleHardwareAction = async (action: string) => {
    if (!station) return;

    try {
      setHardwareActionLoading(action);

      const response = await iotService.checkStationStatus({
        station_id: station.id,
        include_empty: false,
        checkAll: false,
      });

      if (response.success) {
        toast.success(`${action} command sent successfully!`);
        
        // Show slot data in a modal
        if (response.data?.slots) {
          setCheckStationData(response.data);
          setCheckStationModalOpen(true);
        }
        
        // Refresh station details after action
        fetchStationDetails(true);
      } else {
        toast.error(response.message || `Failed to execute ${action}`);
      }
    } catch (err: any) {
      
      // Handle different error types
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        toast.error("You don't have permission to perform this action.");
      } else if (err.response?.status === 404) {
        toast.error("Station not found.");
      } else if (err.response?.status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(
          err.response?.data?.message ||
          err.message ||
          `Failed to execute ${action}. Please try again.`
        );
      }
    } finally {
      setHardwareActionLoading(null);
    }
  };

  const handleEject = async () => {
    if (!station) return;

    try {
      setHardwareActionLoading("Eject");

      const response = await iotService.ejectPowerbank({
        station_id: station.id,
        // Optional: powerbank_sn and reason can be added here
      });

      if (response.success) {
        toast.success("Powerbank ejected successfully!");
        // Refresh station details after eject
        fetchStationDetails(true);
      } else {
        toast.error(response.message || "Failed to eject powerbank");
      }
    } catch (err: any) {
      
      // Handle different error types
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        toast.error("You don't have permission to perform this action.");
      } else if (err.response?.status === 404) {
        toast.error("Station or powerbank not found.");
      } else if (err.response?.status === 409) {
        toast.error("Powerbank is currently in use or unavailable.");
      } else if (err.response?.status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(
          err.response?.data?.message ||
          err.message ||
          "Failed to eject powerbank. Please try again."
        );
      }
    } finally {
      setHardwareActionLoading(null);
    }
  };

  const handleEjectSpecificPowerbank = async (powerbankSn: string, slotNumber: number) => {
    if (!station) return;

    // Confirm before ejecting
    const confirmed = window.confirm(
      `Are you sure you want to eject powerbank from Slot ${slotNumber}?\n\nPowerbank SN: ${powerbankSn}`
    );

    if (!confirmed) return;

    try {
      const response = await iotService.ejectPowerbank({
        station_id: station.id,
        powerbank_sn: powerbankSn,
      });

      if (response.success) {
        toast.success(`Powerbank from Slot ${slotNumber} ejected successfully!`);
        // Refresh station details after eject
        fetchStationDetails(true);
      } else {
        toast.error(response.message || "Failed to eject powerbank");
      }
    } catch (err: any) {
      // Handle different error types
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        toast.error("You don't have permission to perform this action.");
      } else if (err.response?.status === 404) {
        toast.error("Station or powerbank not found.");
      } else if (err.response?.status === 409) {
        toast.error("Powerbank is currently in use or unavailable.");
      } else if (err.response?.status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(
          err.response?.data?.message ||
          err.message ||
          "Failed to eject powerbank. Please try again."
        );
      }
    }
  };

  const handleReboot = async () => {
    if (!station) return;

    // Confirm before rebooting
    const confirmed = window.confirm(
      "Are you sure you want to reboot this station? This will temporarily interrupt service."
    );

    if (!confirmed) return;

    try {
      setHardwareActionLoading("Reboot");

      const response = await iotService.rebootStation({
        station_id: station.id,
      });

      if (response.success) {
        toast.success("Station reboot command sent successfully!");
        // Refresh station details after reboot
        fetchStationDetails(true);
      } else {
        toast.error(response.message || "Failed to reboot station");
      }
    } catch (err: any) {
      
      // Handle different error types
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        toast.error("You don't have permission to perform this action.");
      } else if (err.response?.status === 404) {
        toast.error("Station not found.");
      } else if (err.response?.status === 409) {
        toast.error("Station is currently unavailable for reboot.");
      } else if (err.response?.status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(
          err.response?.data?.message ||
          err.message ||
          "Failed to reboot station. Please try again."
        );
      }
    } finally {
      setHardwareActionLoading(null);
    }
  };

  const handleScanWiFi = async () => {
    if (!station) return;

    try {
      setHardwareActionLoading("Scan WiFi");

      const response = await iotService.scanWiFi({
        station_id: station.id,
      });

      if (response.success && response.data) {
        toast.success("WiFi scan completed successfully!");
        setWifiNetworks(response.data.networks || []);
        setWifiScanModalOpen(true);
      } else {
        toast.error(response.message || "Failed to scan WiFi networks");
      }
    } catch (err: any) {
      
      // Handle different error types
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        toast.error("You don't have permission to perform this action.");
      } else if (err.response?.status === 404) {
        toast.error("Station not found.");
      } else if (err.response?.status === 409) {
        toast.error("Station is currently unavailable for WiFi scan.");
      } else if (err.response?.status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(
          err.response?.data?.message ||
          err.message ||
          "Failed to scan WiFi networks. Please try again."
        );
      }
    } finally {
      setHardwareActionLoading(null);
    }
  };

  const handleOpenConnectModal = () => {
    if (wifiNetworks.length === 0) {
      toast.error("Please scan for WiFi networks first");
      return;
    }
    setWifiConnectModalOpen(true);
  };

  const handleConnectWiFi = async (ssid: string, password: string) => {
    if (!station) return;

    try {
      const response = await iotService.connectWiFi({
        station_id: station.id,
        wifi_ssid: ssid,
        wifi_password: password || undefined,
      });

      if (response.success) {
        toast.success(`Successfully connected to ${ssid}!`);
        setWifiConnectModalOpen(false);
        // Refresh station details after connection
        fetchStationDetails(true);
      } else {
        toast.error(response.message || "Failed to connect to WiFi");
      }
    } catch (err: any) {
      
      // Handle different error types
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        toast.error("You don't have permission to perform this action.");
      } else if (err.response?.status === 404) {
        toast.error("Station not found.");
      } else if (err.response?.status === 409) {
        toast.error("Station is currently unavailable or WiFi connection failed.");
      } else if (err.response?.status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(
          err.response?.data?.message ||
          err.message ||
          "Failed to connect to WiFi. Please try again."
        );
      }
      throw err; // Re-throw to let modal handle loading state
    }
  };

  const handleSetVolume = async (volume: number) => {
    if (!station) return;

    try {
      const response = await iotService.setVolume({
        station_id: station.id,
        volume: volume,
      });

      if (response.success) {
        toast.success(`Volume set to ${volume}% successfully!`);
        setVolumeModalOpen(false);
        // Refresh station details after setting volume
        fetchStationDetails(true);
      } else {
        toast.error(response.message || "Failed to set volume");
      }
    } catch (err: any) {
      
      // Handle different error types
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        toast.error("You don't have permission to perform this action.");
      } else if (err.response?.status === 404) {
        toast.error("Station not found.");
      } else if (err.response?.status === 409) {
        toast.error("Station is currently unavailable.");
      } else if (err.response?.status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(
          err.response?.data?.message ||
          err.message ||
          "Failed to set volume. Please try again."
        );
      }
      throw err; // Re-throw to let modal handle loading state
    }
  };

  const handleSetNetworkMode = async (mode: "wifi" | "4g") => {
    if (!station) return;

    const modeLabel = mode === "wifi" ? "WiFi Priority" : "4G Priority";

    try {
      setHardwareActionLoading(modeLabel);

      const response = await iotService.setNetworkMode({
        station_id: station.id,
        mode: mode,
      });

      if (response.success) {
        toast.success(`Network mode set to ${modeLabel} successfully!`);
        // Refresh station details after setting mode
        fetchStationDetails(true);
      } else {
        toast.error(response.message || `Failed to set ${modeLabel}`);
      }
    } catch (err: any) {
      
      // Handle different error types
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        toast.error("You don't have permission to perform this action.");
      } else if (err.response?.status === 404) {
        toast.error("Station not found.");
      } else if (err.response?.status === 409) {
        toast.error("Station is currently unavailable.");
      } else if (err.response?.status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(
          err.response?.data?.message ||
          err.message ||
          `Failed to set ${modeLabel}. Please try again.`
        );
      }
    } finally {
      setHardwareActionLoading(null);
    }
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
            {station.description && (
              <div className={styles.row}>
                <label>Description:</label>
                <span>{station.description}</span>
              </div>
            )}
            <div className={styles.row}>
              <label>Operating Hours:</label>
              <span>
                {station.opening_time} - {station.closing_time}
              </span>
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

        {/* Hardware Settings Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Hardware Settings</h2>
          <div className={styles.cardContent}>
            <div className={styles.hardwareButtonsGrid}>
              <button 
                className={styles.hardwareBtn} 
                title="Check Station"
                onClick={() => handleHardwareAction("Check Station")}
                disabled={hardwareActionLoading !== null}
              >
                {hardwareActionLoading === "Check Station" ? (
                  <FiRefreshCw className={`${styles.btnIcon} ${styles.spinning}`} />
                ) : (
                  <FiActivity className={styles.btnIcon} />
                )}
                Check Station
              </button>
              <button 
                className={styles.hardwareBtn} 
                title="Eject"
                onClick={handleEject}
                disabled={hardwareActionLoading !== null}
              >
                {hardwareActionLoading === "Eject" ? (
                  <FiRefreshCw className={`${styles.btnIcon} ${styles.spinning}`} />
                ) : (
                  <FiActivity className={styles.btnIcon} />
                )}
                Eject
              </button>
              <button 
                className={styles.hardwareBtn} 
                title="Scan WiFi"
                onClick={handleScanWiFi}
                disabled={hardwareActionLoading !== null}
              >
                {hardwareActionLoading === "Scan WiFi" ? (
                  <FiRefreshCw className={`${styles.btnIcon} ${styles.spinning}`} />
                ) : (
                  <FiWifi className={styles.btnIcon} />
                )}
                Scan WiFi
              </button>
              <button 
                className={styles.hardwareBtn} 
                title="Set Volume"
                onClick={() => setVolumeModalOpen(true)}
                disabled={hardwareActionLoading !== null}
              >
                {hardwareActionLoading === "Set Volume" ? (
                  <FiRefreshCw className={`${styles.btnIcon} ${styles.spinning}`} />
                ) : (
                  <FiActivity className={styles.btnIcon} />
                )}
                Set Volume
              </button>
              <button 
                className={styles.hardwareBtn} 
                title="Reboot"
                onClick={handleReboot}
                disabled={hardwareActionLoading !== null}
              >
                {hardwareActionLoading === "Reboot" ? (
                  <FiRefreshCw className={`${styles.btnIcon} ${styles.spinning}`} />
                ) : (
                  <FiRefreshCw className={styles.btnIcon} />
                )}
                Reboot
              </button>
              <button 
                className={styles.hardwareBtn} 
                title="Connect WiFi"
                onClick={handleOpenConnectModal}
                disabled={hardwareActionLoading !== null}
              >
                <FiWifi className={styles.btnIcon} />
                Connect WiFi
              </button>
              <button 
                className={styles.hardwareBtn} 
                title="WiFi Priority"
                onClick={() => handleSetNetworkMode("wifi")}
                disabled={hardwareActionLoading !== null}
              >
                {hardwareActionLoading === "WiFi Priority" ? (
                  <FiRefreshCw className={`${styles.btnIcon} ${styles.spinning}`} />
                ) : (
                  <FiWifi className={styles.btnIcon} />
                )}
                WiFi Priority
              </button>
              <button 
                className={styles.hardwareBtn} 
                title="4G Priority"
                onClick={() => handleSetNetworkMode("4g")}
                disabled={hardwareActionLoading !== null}
              >
                {hardwareActionLoading === "4G Priority" ? (
                  <FiRefreshCw className={`${styles.btnIcon} ${styles.spinning}`} />
                ) : (
                  <FiActivity className={styles.btnIcon} />
                )}
                4G Priority
              </button>
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
                    {media.media_type === "VIDEO" ||
                    media.file_type === "VIDEO" ? (
                      <video
                        src={media.file_url}
                        controls
                        className={styles.mediaImage}
                      />
                    ) : (
                      <img
                        src={media.thumbnail_url || media.file_url}
                        alt={media.title}
                        className={styles.mediaImage}
                      />
                    )}
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
                className={`${styles.slotCard} ${styles[slot.status.toLowerCase()]} ${
                  slot.powerbank ? styles.clickable : styles.disabled
                }`}
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
                      <button
                        className={styles.ejectSlotBtn}
                        onClick={() => handleEjectSpecificPowerbank(slot.powerbank!.serial_number, slot.slot_number)}
                        title={`Eject powerbank from Slot ${slot.slot_number}`}
                      >
                        <FiActivity className={styles.ejectIcon} />
                        Eject
                      </button>
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

      {/* WiFi Scan Modal */}
      <WiFiScanModal
        isOpen={wifiScanModalOpen}
        onClose={() => setWifiScanModalOpen(false)}
        networks={wifiNetworks}
        stationName={station.station_name}
        stationImei={station.imei}
      />

      {/* WiFi Connect Modal */}
      <WiFiConnectModal
        isOpen={wifiConnectModalOpen}
        onClose={() => setWifiConnectModalOpen(false)}
        networks={wifiNetworks}
        stationName={station.station_name}
        stationImei={station.imei}
        stationId={station.id}
        onConnect={handleConnectWiFi}
      />

      {/* Volume Control Modal */}
      <VolumeControlModal
        isOpen={volumeModalOpen}
        onClose={() => setVolumeModalOpen(false)}
        stationName={station.station_name}
        stationImei={station.imei}
        stationId={station.id}
        onSetVolume={handleSetVolume}
      />

      {/* Check Station Modal */}
      {checkStationModalOpen && checkStationData && (
        <div className={styles.modalOverlay} onClick={() => setCheckStationModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Station Check Results</h2>
              <button 
                className={styles.modalCloseBtn}
                onClick={() => setCheckStationModalOpen(false)}
                title="Close"
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Station Info */}
              <div className={styles.checkInfoCard}>
                <div className={styles.checkInfoRow}>
                  <span className={styles.checkInfoLabel}>Station IMEI:</span>
                  <span className={styles.checkInfoValue}>{checkStationData.station_imei}</span>
                </div>
                <div className={styles.checkInfoRow}>
                  <span className={styles.checkInfoLabel}>Action Type:</span>
                  <span className={styles.checkInfoValue}>{checkStationData.action_type}</span>
                </div>
                <div className={styles.checkInfoRow}>
                  <span className={styles.checkInfoLabel}>Message:</span>
                  <span className={styles.checkInfoValue}>{checkStationData.message}</span>
                </div>
              </div>

              {/* Slots Grid */}
              <div className={styles.checkSlotsGrid}>
                {checkStationData.slots?.map((slot: any) => (
                  <div 
                    key={slot.index} 
                    className={`${styles.checkSlotCard} ${
                      slot.status === 1 ? styles.checkSlotOk : styles.checkSlotNone
                    }`}
                  >
                    <div className={styles.checkSlotHeader}>
                      <span className={styles.checkSlotNumber}>Slot {slot.index}</span>
                      <span className={`${styles.checkSlotStatus} ${
                        slot.status === 1 ? styles.statusOk : styles.statusNone
                      }`}>
                        {slot.message}
                      </span>
                    </div>

                    <div className={styles.checkSlotBody}>
                      {slot.status === 1 ? (
                        <>
                          <div className={styles.checkSlotInfo}>
                            <span className={styles.checkSlotLabel}>Serial Number:</span>
                            <span className={styles.checkSlotValue}>{slot.sn_as_string}</span>
                          </div>
                          <div className={styles.checkSlotInfo}>
                            <span className={styles.checkSlotLabel}>Power:</span>
                            <span className={styles.checkSlotValue}>{slot.power}%</span>
                          </div>
                          <div className={styles.checkBatteryBar}>
                            <div 
                              className={styles.checkBatteryFill}
                              style={{ width: `${slot.power}%` }}
                            />
                          </div>
                          <div className={styles.checkSlotInfo}>
                            <span className={styles.checkSlotLabel}>Temperature:</span>
                            <span className={styles.checkSlotValue}>{slot.temp}°C</span>
                          </div>
                          <div className={styles.checkSlotInfo}>
                            <span className={styles.checkSlotLabel}>Voltage:</span>
                            <span className={styles.checkSlotValue}>{slot.voltage}V</span>
                          </div>
                          <div className={styles.checkSlotInfo}>
                            <span className={styles.checkSlotLabel}>Current:</span>
                            <span className={styles.checkSlotValue}>{slot.current}A</span>
                          </div>
                          <div className={styles.checkSlotInfo}>
                            <span className={styles.checkSlotLabel}>Locked:</span>
                            <span className={styles.checkSlotValue}>{slot.locked ? 'Yes' : 'No'}</span>
                          </div>
                          <div className={styles.checkSlotInfo}>
                            <span className={styles.checkSlotLabel}>Micro Switch:</span>
                            <span className={styles.checkSlotValue}>{slot.micro_switch}</span>
                          </div>
                        </>
                      ) : (
                        <div className={styles.checkSlotEmpty}>
                          <p>No powerbank detected</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.modalCloseButton}
                onClick={() => setCheckStationModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
