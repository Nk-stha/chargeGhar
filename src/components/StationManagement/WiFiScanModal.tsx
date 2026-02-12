"use client";

import React from "react";
import styles from "./WiFiScanModal.module.css";
import { FiX, FiWifi } from "react-icons/fi";

interface WiFiScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  networks: string[];
  stationName: string;
  stationImei?: string;
}

export default function WiFiScanModal({
  isOpen,
  onClose,
  networks,
  stationName,
  stationImei,
}: WiFiScanModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>
              <FiWifi className={styles.titleIcon} />
              Available WiFi Networks
            </h2>
            <p className={styles.modalSubtitle}>
              {stationName}
              {stationImei && ` • IMEI: ${stationImei}`}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.modalBody}>
          {networks.length === 0 ? (
            <div className={styles.emptyState}>
              <FiWifi className={styles.emptyIcon} />
              <p>No WiFi networks found</p>
            </div>
          ) : (
            <div className={styles.networksList}>
              {networks.map((network, index) => (
                <div key={index} className={styles.networkItem}>
                  <FiWifi className={styles.networkIcon} />
                  <span className={styles.networkName}>{network}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <p className={styles.networkCount}>
            {networks.length} {networks.length === 1 ? "network" : "networks"} found
          </p>
          <button className={styles.closeButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
