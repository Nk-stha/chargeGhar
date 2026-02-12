"use client";

import React, { useState } from "react";
import { FiX, FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo, FiLock, FiEye, FiEyeOff, FiBriefcase } from "react-icons/fi";
import styles from "./PartnerStatusModal.module.css";
import { extractApiError } from "@/lib/apiErrors";
import { toast } from "sonner";

interface PartnerStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerId: string;
  partnerName: string;
  currentStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  currentVendorType?: "REVENUE" | "NON_REVENUE" | null;
  onUpdate?: (data: any) => Promise<void>;
}

type PartnerStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
type VendorType = "REVENUE" | "NON_REVENUE";
type RevenueModel = "PERCENTAGE" | "FIXED";
type TabType = "status" | "password" | "vendor";

const PartnerStatusModal: React.FC<PartnerStatusModalProps> = ({
  isOpen,
  onClose,
  partnerId,
  partnerName,
  currentStatus,
  currentVendorType,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("status");
  const [submitting, setSubmitting] = useState(false);

  // Status Tab State
  const [selectedStatus, setSelectedStatus] = useState<PartnerStatus>(currentStatus);
  const [statusReason, setStatusReason] = useState("");

  // Password Tab State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Vendor Type Tab State
  const [selectedVendorType, setSelectedVendorType] = useState<VendorType>(currentVendorType || "NON_REVENUE");
  const [vendorPassword, setVendorPassword] = useState("");
  const [revenueModel, setRevenueModel] = useState<RevenueModel>("PERCENTAGE");
  const [partnerPercent, setPartnerPercent] = useState("25");
  const [fixedAmount, setFixedAmount] = useState("");
  const [vendorReason, setVendorReason] = useState("");
  const [showVendorPassword, setShowVendorPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (activeTab === "status") {
        // Status Update
        if (!statusReason.trim()) {
          toast.error("Please provide a reason for the status change");
          setSubmitting(false);
          return;
        }

        if (selectedStatus === currentStatus) {
          toast.error("Please select a different status");
          setSubmitting(false);
          return;
        }

        const { updatePartnerStatus } = await import("@/lib/api/partners");
        await updatePartnerStatus(partnerId, {
          status: selectedStatus,
          reason: statusReason,
        });

        if (onUpdate) {
          await onUpdate({
            type: "status",
            status: selectedStatus,
            reason: statusReason,
          });
        }
      } else if (activeTab === "password") {
        // Password Reset
        if (!newPassword || !confirmPassword) {
          toast.error("Please fill in all password fields");
          setSubmitting(false);
          return;
        }

        if (newPassword.length < 8) {
          toast.error("Password must be at least 8 characters");
          setSubmitting(false);
          return;
        }

        if (newPassword !== confirmPassword) {
          toast.error("Passwords do not match");
          setSubmitting(false);
          return;
        }

        try {
          const { resetPartnerPassword } = await import("@/lib/api/partners");
          await resetPartnerPassword(partnerId, {
            new_password: newPassword,
            confirm_password: confirmPassword,
          });

          if (onUpdate) {
            await onUpdate({
              type: "password",
              new_password: newPassword,
              confirm_password: confirmPassword,
            });
            toast.success("Password reset successfully");
          }
        } catch (passwordErr: unknown) {
          const passError = extractApiError(passwordErr, "Failed to reset password");
          if (passError.errorCode === "NO_DASHBOARD_ACCESS") {
            toast.error("This partner does not have dashboard access. Password reset is only available for REVENUE partners or FRANCHISE partners.");
            setSubmitting(false);
            return;
          }
          throw passwordErr;
        }
      } else if (activeTab === "vendor") {
        // Vendor Type Update
        if (!vendorReason.trim()) {
          toast.error("Please provide a reason for the vendor type change");
          setSubmitting(false);
          return;
        }

        if (selectedVendorType === currentVendorType) {
          toast.error("Please select a different vendor type");
          setSubmitting(false);
          return;
        }

        const payload: any = {
          vendor_type: selectedVendorType,
          reason: vendorReason,
        };

        if (selectedVendorType === "REVENUE") {
          if (!vendorPassword) {
            toast.error("Password is required when changing to REVENUE vendor");
            setSubmitting(false);
            return;
          }

          payload.password = vendorPassword;
          payload.revenue_model = revenueModel;

          if (revenueModel === "PERCENTAGE") {
            if (!partnerPercent || parseFloat(partnerPercent) <= 0) {
              toast.error("Please provide a valid partner percentage");
              setSubmitting(false);
              return;
            }
            payload.partner_percent = partnerPercent;
          } else {
            if (!fixedAmount || parseFloat(fixedAmount) <= 0) {
              toast.error("Please provide a valid fixed amount");
              setSubmitting(false);
              return;
            }
            payload.fixed_amount = fixedAmount;
          }
        }

        const { updateVendorType } = await import("@/lib/api/partners");
        await updateVendorType(partnerId, payload);

        if (onUpdate) {
          await onUpdate({
            type: "vendor",
            ...payload,
          });
          toast.success("Vendor type updated successfully");
        }
      }

      // Close modal on success
      handleClose();
      // Toast for general success if not already handled would go here, 
      // but status update implies success.
      if (activeTab === 'status') {
         toast.success("Partner status updated successfully");
      }
    } catch (err: unknown) {
      console.error("Error updating partner:", err);
      const apiError = extractApiError(err, "Failed to update partner");
      toast.error(apiError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setActiveTab("status");
    setSelectedStatus(currentStatus);
    setStatusReason("");
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setSelectedVendorType(currentVendorType || "NON_REVENUE");
    setVendorPassword("");
    setRevenueModel("PERCENTAGE");
    setPartnerPercent("25");
    setFixedAmount("");
    setVendorReason("");
    setShowVendorPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>Manage Partner</h2>
            <p className={styles.subtitle}>
              Update settings for <span className={styles.partnerHighlight}>{partnerName}</span>
            </p>
          </div>
          <button 
            onClick={handleClose} 
            className={styles.closeBtn}
            aria-label="Close modal"
            disabled={submitting}
          >
            <FiX />
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "status" ? styles.tabActive : ""}`}
            onClick={() => {
              setActiveTab("status");
            }}
            disabled={submitting}
          >
            <FiCheckCircle />
            <span>Status</span>
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "password" ? styles.tabActive : ""}`}
            onClick={() => {
              setActiveTab("password");
            }}
            disabled={submitting}
          >
            <FiLock />
            <span>Reset Password</span>
          </button>
          {currentVendorType && (
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "vendor" ? styles.tabActive : ""}`}
              onClick={() => {
                setActiveTab("vendor");
              }}
              disabled={submitting}
            >
              <FiBriefcase />
              <span>Vendor Type</span>
            </button>
          )}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className={styles.content}>

          {/* Status Tab */}
          {activeTab === "status" && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>New Status Selection</label>
                <div className={styles.statusGrid}>
                  {/* Active */}
                  <label className={styles.statusOption}>
                    <input
                      type="radio"
                      name="status"
                      value="ACTIVE"
                      checked={selectedStatus === "ACTIVE"}
                      onChange={(e) => setSelectedStatus(e.target.value as PartnerStatus)}
                      className={styles.radioInput}
                      disabled={submitting}
                    />
                    <div className={`${styles.statusCard} ${selectedStatus === "ACTIVE" ? styles.statusCardActive : ""}`}>
                      <FiCheckCircle className={styles.statusIcon} />
                      <span className={styles.statusLabel}>ACTIVE</span>
                    </div>
                  </label>

                  {/* Inactive */}
                  <label className={styles.statusOption}>
                    <input
                      type="radio"
                      name="status"
                      value="INACTIVE"
                      checked={selectedStatus === "INACTIVE"}
                      onChange={(e) => setSelectedStatus(e.target.value as PartnerStatus)}
                      className={styles.radioInput}
                      disabled={submitting}
                    />
                    <div className={`${styles.statusCard} ${selectedStatus === "INACTIVE" ? styles.statusCardInactive : ""}`}>
                      <FiXCircle className={styles.statusIcon} />
                      <span className={styles.statusLabel}>INACTIVE</span>
                    </div>
                  </label>

                  {/* Suspended */}
                  <label className={styles.statusOption}>
                    <input
                      type="radio"
                      name="status"
                      value="SUSPENDED"
                      checked={selectedStatus === "SUSPENDED"}
                      onChange={(e) => setSelectedStatus(e.target.value as PartnerStatus)}
                      className={styles.radioInput}
                      disabled={submitting}
                    />
                    <div className={`${styles.statusCard} ${selectedStatus === "SUSPENDED" ? styles.statusCardSuspended : ""}`}>
                      <FiAlertCircle className={styles.statusIcon} />
                      <span className={styles.statusLabel}>SUSPENDED</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="statusReason">
                  Reason for status change (added to notes)
                </label>
                <textarea
                  id="statusReason"
                  className={styles.textarea}
                  placeholder="Provide detailed context for this status update..."
                  rows={4}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <>
              {(currentVendorType === "NON_REVENUE" || !currentVendorType) && (
                <div className={styles.warningBox}>
                  <FiAlertCircle />
                  <span>
                    Password reset is only available for partners with dashboard access (REVENUE vendors or FRANCHISE partners).
                    {currentVendorType === "NON_REVENUE" && " Change vendor type to REVENUE first to enable dashboard access."}
                  </span>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="newPassword">
                  New Password
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    className={styles.input}
                    placeholder="Enter new password (min 8 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={submitting}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={submitting}
                  >
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className={styles.input}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={submitting}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={submitting}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className={styles.infoBox}>
                <FiInfo />
                <span>Password must be at least 8 characters long</span>
              </div>
            </>
          )}

          {/* Vendor Type Tab */}
          {activeTab === "vendor" && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Vendor Type</label>
                <div className={styles.vendorTypeGrid}>
                  <label className={styles.statusOption}>
                    <input
                      type="radio"
                      name="vendorType"
                      value="REVENUE"
                      checked={selectedVendorType === "REVENUE"}
                      onChange={(e) => setSelectedVendorType(e.target.value as VendorType)}
                      className={styles.radioInput}
                      disabled={submitting}
                    />
                    <div className={`${styles.statusCard} ${selectedVendorType === "REVENUE" ? styles.statusCardActive : ""}`}>
                      <FiCheckCircle className={styles.statusIcon} />
                      <span className={styles.statusLabel}>REVENUE</span>
                    </div>
                  </label>

                  <label className={styles.statusOption}>
                    <input
                      type="radio"
                      name="vendorType"
                      value="NON_REVENUE"
                      checked={selectedVendorType === "NON_REVENUE"}
                      onChange={(e) => setSelectedVendorType(e.target.value as VendorType)}
                      className={styles.radioInput}
                      disabled={submitting}
                    />
                    <div className={`${styles.statusCard} ${selectedVendorType === "NON_REVENUE" ? styles.statusCardInactive : ""}`}>
                      <FiXCircle className={styles.statusIcon} />
                      <span className={styles.statusLabel}>NON-REVENUE</span>
                    </div>
                  </label>
                </div>
              </div>

              {selectedVendorType === "REVENUE" && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="vendorPassword">
                      Dashboard Access Password
                    </label>
                    <div className={styles.passwordWrapper}>
                      <input
                        id="vendorPassword"
                        type={showVendorPassword ? "text" : "password"}
                        className={styles.input}
                        placeholder="Enter password for dashboard access"
                        value={vendorPassword}
                        onChange={(e) => setVendorPassword(e.target.value)}
                        disabled={submitting}
                        required
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowVendorPassword(!showVendorPassword)}
                        disabled={submitting}
                      >
                        {showVendorPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="revenueModel">
                      Revenue Model
                    </label>
                    <select
                      id="revenueModel"
                      className={styles.select}
                      value={revenueModel}
                      onChange={(e) => setRevenueModel(e.target.value as RevenueModel)}
                      disabled={submitting}
                    >
                      <option value="PERCENTAGE">PERCENTAGE SHARE</option>
                      <option value="FIXED">FIXED AMOUNT</option>
                    </select>
                  </div>

                  {revenueModel === "PERCENTAGE" ? (
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="partnerPercent">
                        Partner Share Percentage
                      </label>
                      <div className={styles.inputWithSuffix}>
                        <input
                          id="partnerPercent"
                          type="number"
                          className={styles.input}
                          placeholder="25"
                          min="0"
                          max="100"
                          step="0.1"
                          value={partnerPercent}
                          onChange={(e) => setPartnerPercent(e.target.value)}
                          disabled={submitting}
                          required
                        />
                        <span className={styles.inputSuffix}>%</span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="fixedAmount">
                        Fixed Monthly Amount
                      </label>
                      <div className={styles.inputWithPrefix}>
                        <span className={styles.inputPrefix}>NPR</span>
                        <input
                          id="fixedAmount"
                          type="number"
                          className={`${styles.input} ${styles.inputWithPrefixField}`}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          value={fixedAmount}
                          onChange={(e) => setFixedAmount(e.target.value)}
                          disabled={submitting}
                          required
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="vendorReason">
                  Reason for vendor type change
                </label>
                <textarea
                  id="vendorReason"
                  className={styles.textarea}
                  placeholder="Provide detailed context for this vendor type update..."
                  rows={4}
                  value={vendorReason}
                  onChange={(e) => setVendorReason(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className={styles.footer}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.cancelBtn}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className={styles.spinner} />
                  Updating...
                </>
              ) : (
                <>
                  <FiCheckCircle />
                  Apply Changes
                </>
              )}
            </button>
          </div>
        </form>

        {/* Reference Footer */}
        <div className={styles.reference}>
          <div className={styles.referenceItem}>
            <div className={styles.statusIndicator} />
            <span>System Operational</span>
          </div>
          <div className={styles.referenceItem}>
            <span>Ref: CG-{partnerId.substring(0, 4).toUpperCase()}-PTR</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerStatusModal;
