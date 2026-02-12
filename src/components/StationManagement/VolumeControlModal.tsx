"use client";

import React, { useState } from "react";
import styles from "./VolumeControlModal.module.css";
import { FiX, FiVolume2, FiVolumeX, FiVolume1, FiRefreshCw } from "react-icons/fi";

interface VolumeControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationName: string;
  stationImei?: string;
  stationId: string;
  onSetVolume: (volume: number) => Promise<void>;
}

export default function VolumeControlModal({
  isOpen,
  onClose,
  stationName,
  stationImei,
  stationId,
  onSetVolume,
}: VolumeControlModalProps) {
  const [volume, setVolume] = useState<number>(50);
  const [setting, setSetting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSetVolume = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSetting(true);
      await onSetVolume(volume);
      // Don't close modal on success - let parent handle it
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setSetting(false);
    }
  };

  const handleClose = () => {
    setVolume(50);
    onClose();
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <FiVolumeX />;
    if (volume < 50) return <FiVolume1 />;
    return <FiVolume2 />;
  };

  const getVolumeColor = () => {
    if (volume === 0) return "#dc3545";
    if (volume < 30) return "#ffc107";
    if (volume < 70) return "#47b216";
    return "#56d61f";
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>
              <FiVolume2 className={styles.titleIcon} />
              Set Station Volume
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
          <form className={styles.volumeForm} onSubmit={handleSetVolume}>
            <div className={styles.volumeDisplay}>
              <div className={styles.volumeIcon} style={{ color: getVolumeColor() }}>
                {getVolumeIcon()}
              </div>
              <div className={styles.volumeValue} style={{ color: getVolumeColor() }}>
                {volume}%
              </div>
            </div>

            <div className={styles.sliderContainer}>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className={styles.volumeSlider}
                disabled={setting}
                style={{
                  background: `linear-gradient(to right, ${getVolumeColor()} 0%, ${getVolumeColor()} ${volume}%, #1a1a1a ${volume}%, #1a1a1a 100%)`,
                }}
              />
              <div className={styles.sliderLabels}>
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            <div className={styles.presetButtons}>
              <button
                type="button"
                className={`${styles.presetBtn} ${volume === 0 ? styles.active : ""}`}
                onClick={() => setVolume(0)}
                disabled={setting}
              >
                <FiVolumeX />
                Mute
              </button>
              <button
                type="button"
                className={`${styles.presetBtn} ${volume === 25 ? styles.active : ""}`}
                onClick={() => setVolume(25)}
                disabled={setting}
              >
                <FiVolume1 />
                Low
              </button>
              <button
                type="button"
                className={`${styles.presetBtn} ${volume === 50 ? styles.active : ""}`}
                onClick={() => setVolume(50)}
                disabled={setting}
              >
                <FiVolume1 />
                Medium
              </button>
              <button
                type="button"
                className={`${styles.presetBtn} ${volume === 75 ? styles.active : ""}`}
                onClick={() => setVolume(75)}
                disabled={setting}
              >
                <FiVolume2 />
                High
              </button>
              <button
                type="button"
                className={`${styles.presetBtn} ${volume === 100 ? styles.active : ""}`}
                onClick={() => setVolume(100)}
                disabled={setting}
              >
                <FiVolume2 />
                Max
              </button>
            </div>

            <button
              type="submit"
              className={styles.setButton}
              disabled={setting}
            >
              {setting ? (
                <>
                  <FiRefreshCw className={styles.spinning} />
                  Setting Volume...
                </>
              ) : (
                <>
                  <FiVolume2 />
                  Set Volume
                </>
              )}
            </button>
          </form>
        </div>

        <div className={styles.modalFooter}>
          <p className={styles.footerNote}>
            Adjust the volume level for station audio feedback
          </p>
          <button className={styles.cancelButton} onClick={handleClose} disabled={setting}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
