"use client";

import React, { useState } from "react";
import Modal from "@/components/modal/modal";
import { ValidatedInput } from "@/components/ValidatedInput/ValidatedInput";
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

const UpdateScheduleModal: React.FC<UpdateScheduleModalProps> = ({
  isOpen,
  onClose,
  adId,
  currentStartDate,
  currentEndDate,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(currentStartDate || "");
  const [endDate, setEndDate] = useState(currentEndDate || "");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: any) => {
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

    // Check if at least one date is provided and different from current
    if (!startDate && !endDate) {
      setError("At least one of start_date or end_date must be provided");
      return;
    }

    if (startDate === currentStartDate && endDate === currentEndDate) {
      setError("At least one date must be different from current");
      return;
    }

    // Validate fields
    validateField("startDate", startDate);
    validateField("endDate", endDate);

    // Mark all as touched
    setTouched({
      startDate: true,
      endDate: true,
    });

    // Check for errors
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
    } catch (err: any) {
      console.error("Error updating schedule:", err);
      setError(err.response?.data?.error?.message || err.response?.data?.message || "Failed to update schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Update Ad Schedule" isOpen={isOpen} onClose={onClose}>
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

        <ValidatedInput
          label="New Start Date"
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            validateField("startDate", e.target.value);
            if (endDate) validateField("endDate", endDate);
          }}
          onBlur={() => handleBlur("startDate")}
          error={errors.startDate}
          touched={touched.startDate}
          helperText="Leave empty to keep current start date"
        />

        <ValidatedInput
          label="New End Date"
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            validateField("endDate", e.target.value);
          }}
          onBlur={() => handleBlur("endDate")}
          error={errors.endDate}
          touched={touched.endDate}
          helperText="Leave empty to keep current end date"
        />

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
          <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Updating..." : "Update Schedule"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateScheduleModal;
