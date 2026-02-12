"use client";

import React, { useState } from "react";
import styles from "./WiFiConnectModal.module.css";
import { FiX, FiWifi, FiLock, FiRefreshCw } from "react-icons/fi";

interface WiFiConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  networks: string[];
  stationName: string;
  stationImei?: string;
  stationId: string;
  onConnect: (ssid: string, password: string) => Promise<void>;
}

export default function WiFiConnectModal({
  isOpen,
  onClose,
  networks,
  stationName,
  stationImei,
  stationId,
  onConnect,
}: WiFiConnectModalProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedNetwork) {
      return;
    }

    try {
      setConnecting(true);
      await onConnect(selectedNetwork, password);
      // Reset form on success
      setSelectedNetwork("");
      setPassword("");
      setShowPassword(false);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setConnecting(false);
    }
  };

  const handleClose = () => {
    setSelectedNetwork("");
    setPassword("");
    setShowPassword(false);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>
              <FiWifi className={styles.titleIcon} />
              Connect to WiFi
            </h2>
            <p className={styles.modalSubtitle}>
              {stationName}
              {stationImei && ` • IMEI: ${stationImei}`}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={handleClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.modalBody}>
          {networks.length === 0 ? (
            <div className={styles.emptyState}>
              <FiWifi className={styles.emptyIcon} />
              <p>No WiFi networks available</p>
              <p className={styles.emptyHint}>Please scan for networks first</p>
            </div>
          ) : (
            <form className={styles.connectForm} onSubmit={handleConnect}>
              <div className={styles.formGroup}>
                <label htmlFor="network" className={styles.label}>
                  <FiWifi className={styles.labelIcon} />
                  WiFi Network
                </label>
                <select
                  id="network"
                  className={styles.select}
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value)}
                  required
                  disabled={connecting}
                >
                  <option value="">-- Select a network --</option>
                  {networks.map((network, index) => (
                    <option key={index} value={network}>
                      {network}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>
                  <FiLock className={styles.labelIcon} />
                  Password (Optional)
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className={styles.input}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter WiFi password"
                    disabled={connecting}
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={connecting}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <p className={styles.hint}>Leave empty for open networks</p>
              </div>

              <button
                type="submit"
                className={styles.connectButton}
                disabled={!selectedNetwork || connecting}
              >
                {connecting ? (
                  <>
                    <FiRefreshCw className={styles.spinning} />
                    Connecting...
                  </>
                ) : (
                  <>
                    <FiWifi />
                    Connect to Network
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <div className={styles.modalFooter}>
          <p className={styles.footerNote}>
            {networks.length > 0
              ? `${networks.length} ${networks.length === 1 ? "network" : "networks"} available`
              : "Scan for networks to see available WiFi"}
          </p>
          <button className={styles.cancelButton} onClick={handleClose} disabled={connecting}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
