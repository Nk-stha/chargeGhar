"use client";

import React, { useState } from "react";
import {
  FiX,
  FiLoader,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";
import axiosInstance, { getCsrfToken } from "@/lib/axios";
import styles from "./PayoutActionModal.module.css";

interface PayoutActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  payoutId: string;
  currentStatus: string;
  onSuccess: () => void;
}

type ActionType = "approve" | "process" | "complete" | "reject";

const PayoutActionModal: React.FC<PayoutActionModalProps> = ({
  isOpen,
  onClose,
  payoutId,
  currentStatus,
  onSuccess,
}) => {
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAvailableActions = (): ActionType[] => {
    switch (currentStatus) {
      case "PENDING":
        return ["approve", "reject"];
      case "APPROVED":
        return ["process", "reject"];
      case "PROCESSING":
        return ["complete", "reject"];
      default:
        return [];
    }
  };

  const actionConfig: Record<
    ActionType,
    {
      label: string;
      description: string;
      icon: React.ReactNode;
      color: string;
      requiresReason?: boolean;
    }
  > = {
    approve: {
      label: "Approve",
      description: "Move payout to approved status",
      icon: <FiCheckCircle />,
      color: "#10B981",
    },
    process: {
      label: "Process",
      description: "Mark payout as processing",
      icon: <FiClock />,
      color: "#3B82F6",
    },
    complete: {
      label: "Complete",
      description: "Complete payout and deduct from partner balance",
      icon: <FiCheckCircle />,
      color: "#47b216",
    },
    reject: {
      label: "Reject",
      description: "Reject payout request",
      icon: <FiXCircle />,
      color: "#EF4444",
      requiresReason: true,
    },
  };

  const availableActions = getAvailableActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAction) {
      setError("Please select an action");
      return;
    }

    if (selectedAction === "reject" && !rejectionReason.trim()) {
      setError("Rejection reason is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        setError("Authentication required. Please login again.");
        setLoading(false);
        return;
      }

      const csrfToken = getCsrfToken();

      const formData = new FormData();
      if (adminNotes.trim()) {
        formData.append("admin_notes", adminNotes);
      }
      if (selectedAction === "reject" && rejectionReason.trim()) {
        formData.append("rejection_reason", rejectionReason);
      }

      const response = await axiosInstance.patch(
        `/api/admin/partners/payouts/${payoutId}/${selectedAction}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFTOKEN": csrfToken || "",
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.data.message || `Failed to ${selectedAction} payout. Please try again.`);
      }
    } catch (err: any) {
      // Handle different error types
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (err.response?.status === 403) {
        setError("You don't have permission to perform this action.");
      } else if (err.response?.status === 404) {
        setError("Payout not found. It may have been deleted.");
      } else if (err.response?.status === 409) {
        setError("Payout status has changed. Please refresh and try again.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(
          err.response?.data?.message || 
          err.message || 
          `Failed to ${selectedAction} payout. Please check your connection and try again.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Payout Action</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            disabled={loading}
          >
            <FiX />
          </button>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Action Selection */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Select Action</h3>
              <p className={styles.sectionSubtitle}>
                Current Status: <strong>{currentStatus}</strong>
              </p>
            </div>

            <div className={styles.actionsGrid}>
              {availableActions.map((action) => {
                const config = actionConfig[action];
                const isSelected = selectedAction === action;

                return (
                  <label
                    key={action}
                    className={`${styles.actionCard} ${
                      isSelected ? styles.selected : ""
                    }`}
                    style={{
                      borderColor: isSelected ? config.color : undefined,
                      backgroundColor: isSelected
                        ? `${config.color}11`
                        : undefined,
                    }}
                  >
                    <input
                      type="radio"
                      name="action"
                      value={action}
                      checked={isSelected}
                      onChange={() => {
                        setSelectedAction(action);
                        setError(null);
                      }}
                      className={styles.radioInput}
                    />
                    <div className={styles.actionCardContent}>
                      <div
                        className={styles.actionIcon}
                        style={{ color: config.color }}
                      >
                        {config.icon}
                      </div>
                      <div className={styles.actionInfo}>
                        <h4 className={styles.actionLabel}>{config.label}</h4>
                        <p className={styles.actionDescription}>
                          {config.description}
                        </p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Rejection Reason (if reject is selected) */}
          {selectedAction === "reject" && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                  Rejection Reason <span className={styles.required}>*</span>
                </h3>
              </div>
              <textarea
                className={styles.textarea}
                placeholder="Explain why this payout is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          )}

          {/* Admin Notes */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Admin Notes (Optional)</h3>
            </div>
            <textarea
              className={styles.textarea}
              placeholder="Add any additional notes for this action..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || !selectedAction}
              style={{
                backgroundColor: selectedAction
                  ? actionConfig[selectedAction].color
                  : undefined,
              }}
            >
              {loading ? (
                <>
                  <FiLoader className={styles.spinner} />
                  Processing...
                </>
              ) : (
                <>
                  {selectedAction && actionConfig[selectedAction].icon}
                  {selectedAction
                    ? `${actionConfig[selectedAction].label} Payout`
                    : "Select Action"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayoutActionModal;
