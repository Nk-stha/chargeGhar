"use client";

import React, { useState } from "react";
import Modal from "@/components/modal/modal";
import { ValidatedInput, ValidatedTextArea } from "@/components/ValidatedInput/ValidatedInput";
import adsService from "@/lib/api/ads.service";
import { AdStatus, AdActionType, ExecuteActionInput } from "@/types/ads.types";
import styles from "./ActionModal.module.css";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: string;
  currentStatus: AdStatus;
  onSuccess: () => void;
}

const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  adId,
  currentStatus,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedAction, setSelectedAction] = useState<AdActionType | "">("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const availableActions = adsService.getAvailableActions(currentStatus);

  const actionDefinitions: Record<string, { label: string; description: string; variant: string }> = {
    approve: {
      label: "Approve",
      description: "Move ad to PENDING_PAYMENT status",
      variant: "success",
    },
    reject: {
      label: "Reject",
      description: "Move ad to REJECTED status",
      variant: "danger",
    },
    schedule: {
      label: "Schedule",
      description: "Set start date and move to SCHEDULED",
      variant: "primary",
    },
    pause: {
      label: "Pause",
      description: "Temporarily pause running ad",
      variant: "warning",
    },
    resume: {
      label: "Resume",
      description: "Resume paused ad",
      variant: "success",
    },
    cancel: {
      label: "Cancel",
      description: "Cancel ad request",
      variant: "danger",
    },
    complete: {
      label: "Complete",
      description: "Mark ad as completed",
      variant: "success",
    },
  };

  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };

    switch (field) {
      case "rejectionReason":
        if (selectedAction === "reject") {
          if (!value) {
            newErrors.rejectionReason = "Rejection reason is required for reject action";
          } else if (value.length < 10) {
            newErrors.rejectionReason = "Rejection reason must be at least 10 characters";
          } else {
            delete newErrors.rejectionReason;
          }
        } else {
          delete newErrors.rejectionReason;
        }
        break;
      case "startDate":
        if (selectedAction === "schedule") {
          if (!value) {
            newErrors.startDate = "Start date is required for schedule action";
          } else {
            const date = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date < today) {
              newErrors.startDate = "Start date cannot be in the past";
            } else {
              delete newErrors.startDate;
            }
          }
        } else {
          delete newErrors.startDate;
        }
        break;
      case "endDate":
        if (selectedAction === "schedule" && value && startDate) {
          const start = new Date(startDate);
          const end = new Date(value);
          if (end <= start) {
            newErrors.endDate = "End date must be after start date";
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

  const handleActionChange = (action: AdActionType) => {
    setSelectedAction(action);
    setErrors({});
    setTouched({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAction) {
      setError("Please select an action");
      return;
    }

    // Validate required fields
    validateField("rejectionReason", rejectionReason);
    validateField("startDate", startDate);
    validateField("endDate", endDate);

    // Mark all as touched
    setTouched({
      rejectionReason: true,
      startDate: true,
      endDate: true,
      reason: true,
    });

    // Check for errors
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data: ExecuteActionInput = {
        action: selectedAction,
      };

      if (selectedAction === "reject" && rejectionReason) {
        data.rejection_reason = rejectionReason;
      }
      if (selectedAction === "schedule") {
        if (startDate) data.start_date = startDate;
        if (endDate) data.end_date = endDate;
      }
      if (selectedAction === "cancel" && reason) {
        data.reason = reason;
      }

      const response = await adsService.executeAction(adId, data);

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError("Failed to execute action");
      }
    } catch (err: any) {
      console.error("Error executing action:", err);
      setError(err.response?.data?.message || "Failed to execute action");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Execute Action" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actionsGrid}>
          {availableActions.map((action) => {
            const def = actionDefinitions[action];
            return (
              <div
                key={action}
                className={`${styles.actionCard} ${
                  selectedAction === action ? styles.selected : ""
                } ${styles[def.variant]}`}
                onClick={() => handleActionChange(action as AdActionType)}
              >
                <input
                  type="radio"
                  name="action"
                  value={action}
                  checked={selectedAction === action}
                  onChange={() => {}}
                  className={styles.radio}
                />
                <div className={styles.actionContent}>
                  <h4>{def.label}</h4>
                  <p>{def.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {selectedAction === "reject" && (
          <ValidatedTextArea
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value);
              validateField("rejectionReason", e.target.value);
            }}
            onBlur={() => handleBlur("rejectionReason")}
            error={errors.rejectionReason}
            touched={touched.rejectionReason}
            placeholder="Explain why this ad is being rejected..."
            rows={4}
            required
          />
        )}

        {selectedAction === "schedule" && (
          <>
            <ValidatedInput
              label="Start Date"
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
              required
            />
            <ValidatedInput
              label="End Date (Optional)"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                validateField("endDate", e.target.value);
              }}
              onBlur={() => handleBlur("endDate")}
              error={errors.endDate}
              touched={touched.endDate}
              helperText="If not provided, will be auto-calculated based on duration"
            />
          </>
        )}

        {selectedAction === "cancel" && (
          <ValidatedTextArea
            label="Reason (Optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional reason for cancellation..."
            rows={3}
          />
        )}

        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={loading}>
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || !selectedAction}
          >
            {loading ? "Processing..." : `Execute ${selectedAction ? actionDefinitions[selectedAction].label : "Action"}`}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ActionModal;
