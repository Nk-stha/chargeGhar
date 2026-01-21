"use client";

import React, { useState } from "react";
import Modal from "@/components/modal/modal";
import { FiCalendar, FiX } from "react-icons/fi";
import adsService from "@/lib/api/ads.service";
import { UpdateScheduleInput } from "@/types/ads.types";
import styles from "./UpdateScheduleModal.module.css";

interface UpdateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: string;
  currentStartDate: string | null;
  currentEndDate: string | null;
  onSuccess: () => void;
}

function UpdateScheduleModal({
  isOpen,
  onClose,
  adId,
  currentStartDate,
  currentEndDate,
  onSuccess,
}: UpdateScheduleModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(currentStartDate || "");
  const [endDate, setEndDate] = useState(currentEndDate || "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case "startDate":
        if (value) {
          const date = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (date < today) {
            newErrors.startDate = "Start date cannot be in the past";
          } else {
            delete newErrors.startDate;
          }
        } else {
          delete newErrors.startDate;
        }
        break;
      case "endDate":
        if (value) {
          const end = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (end < today) {
            newErrors.endDate = "End date cannot be in the past";
          } else if (startDate) {
            const start = new Date(startDate);
            if (end <= start) {
              newErrors.endDate = "End date must be after start date";
            } else {
              delete newErrors.endDate;
            }
          } else {
            delete newErrors.endDate;
          }
        } else {
          delete newErrors.endDate;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate && !endDate) {
      setError("At least one of start_date or end_date must be provided");
      return;
    }

    if (startDate === currentStartDate && endDate === currentEndDate) {
      setError("At least one date must be different from current");
      return;
    }

    validateField("startDate", startDate);
    validateField("endDate", endDate);

    setTouched({
      startDate: true,
      endDate: true,
    });

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data: UpdateScheduleInput = {};

      if (startDate && startDate !== currentStartDate) {
        data.start_date = startDate;
      }
      if (endDate && endDate !== currentEndDate) {
        data.end_date = endDate;
      }

      const response = await adsService.updateSchedule(adId, data);

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError("Failed to update schedule");
      }
    } catch (err: unknown) {
      console.error("Error updating schedule:", err);
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { error?: { message?: string }; message?: string } } }).response?.data?.error?.message || (err as { response?: { data?: { message?: string } } }).response?.data?.message 
        : "Failed to update schedule";
      setError(errorMessage || "Failed to update schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Update Ad Schedule" isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.currentSchedule}>
          <h4>Current Schedule</h4>
          <div className={styles.scheduleInfo}>
            <div className={styles.scheduleItem}>
              <span className={styles.label}>Start Date:</span>
              <span className={styles.value}>
                {currentStartDate ? adsService.formatDate(currentStartDate) : "Not set"}
              </span>
            </div>
            <div className={styles.scheduleItem}>
              <span className={styles.label}>End Date:</span>
              <span className={styles.value}>
                {currentEndDate ? adsService.formatDate(currentEndDate) : "Not set"}
              </span>
            </div>
            {currentStartDate && currentEndDate && (
              <div className={styles.scheduleItem}>
                <span className={styles.label}>Duration:</span>
                <span className={styles.value}>
                  {Math.ceil(
                    (new Date(currentEndDate).getTime() - new Date(currentStartDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.divider}></div>

        <h4 className={styles.sectionTitle}>New Schedule</h4>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>New Start Date</label>
          <input
            type="date"
            className={styles.input}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              validateField("startDate", e.target.value);
              if (endDate) validateField("endDate", endDate);
            }}
            onBlur={() => handleBlur("startDate")}
          />
          <span className={styles.helperText}>Leave empty to keep current start date</span>
          {touched.startDate && errors.startDate && (
            <span className={styles.errorText}>{errors.startDate}</span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>New End Date</label>
          <input
            type="date"
            className={styles.input}
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              validateField("endDate", e.target.value);
            }}
            onBlur={() => handleBlur("endDate")}
          />
          <span className={styles.helperText}>Leave empty to keep current end date</span>
          {touched.endDate && errors.endDate && (
            <span className={styles.errorText}>{errors.endDate}</span>
          )}
        </div>

        {startDate && endDate && (
          <div className={styles.newDuration}>
            <span className={styles.label}>New Duration:</span>
            <span className={styles.value}>
              {Math.ceil(
                (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              days
            </span>
          </div>
        )}

        <div className={styles.actions}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            <FiCalendar />
            {loading ? "Updating..." : "Update Schedule"}
          </button>
          <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={loading}>
            <FiX />
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default UpdateScheduleModal;
