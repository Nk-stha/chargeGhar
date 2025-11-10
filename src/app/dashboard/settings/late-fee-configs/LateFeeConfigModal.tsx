"use client";

import React, { useState, useEffect, FormEvent } from "react";
import styles from "./LateFeeConfigModal.module.css";
import { FiX, FiLoader, FiAlertCircle, FiInfo } from "react-icons/fi";
import {
  LateFeeConfiguration,
  FeeType,
  CreateLateFeeConfigRequest,
} from "@/types/lateFeeConfig";

interface LateFeeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  config?: LateFeeConfiguration | null;
}

const LateFeeConfigModal: React.FC<LateFeeConfigModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  config,
}) => {
  const [formData, setFormData] = useState<CreateLateFeeConfigRequest>({
    name: "",
    fee_type: "MULTIPLIER",
    multiplier: 2,
    flat_rate_per_hour: 0,
    grace_period_minutes: 0,
    max_daily_rate: 0,
    is_active: true,
    applicable_package_types: [],
    metadata: {},
  });

  const [packageTypes, setPackageTypes] = useState<string>("");
  const [metadataJson, setMetadataJson] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      setFormData({
        name: config.name,
        fee_type: config.fee_type,
        multiplier: parseFloat(config.multiplier),
        flat_rate_per_hour: parseFloat(config.flat_rate_per_hour),
        grace_period_minutes: config.grace_period_minutes,
        max_daily_rate: parseFloat(config.max_daily_rate),
        is_active: config.is_active,
        applicable_package_types: config.applicable_package_types || [],
        metadata: config.metadata || {},
      });
      setPackageTypes(
        config.applicable_package_types?.join(", ") || ""
      );
      setMetadataJson(
        config.metadata ? JSON.stringify(config.metadata, null, 2) : ""
      );
    } else {
      // Reset form for new config
      setFormData({
        name: "",
        fee_type: "MULTIPLIER",
        multiplier: 2,
        flat_rate_per_hour: 0,
        grace_period_minutes: 0,
        max_daily_rate: 0,
        is_active: true,
        applicable_package_types: [],
        metadata: {},
      });
      setPackageTypes("");
      setMetadataJson("");
    }
    setError(null);
  }, [config, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Parse package types from comma-separated string
      const parsedPackageTypes = packageTypes
        .split(",")
        .map((type) => type.trim())
        .filter((type) => type.length > 0);

      // Parse metadata JSON
      let parsedMetadata = {};
      if (metadataJson.trim()) {
        try {
          parsedMetadata = JSON.parse(metadataJson);
        } catch (e) {
          setError("Invalid JSON format in metadata field");
          setLoading(false);
          return;
        }
      }

      const payload = {
        ...formData,
        applicable_package_types: parsedPackageTypes,
        metadata: parsedMetadata,
      };

      const token = localStorage.getItem("accessToken");
      const url = config
        ? `/api/admin/late-fee-configs/${config.id}`
        : "/api/admin/late-fee-configs";

      const method = config ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save configuration");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving late fee config:", err);
      setError(err.message || "Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>
            {config ? "Edit Late Fee Configuration" : "Create Late Fee Configuration"}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            disabled={loading}
          >
            <FiX />
          </button>
        </div>

        <form className={styles.modalBody} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.errorBanner}>
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name">
                Configuration Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Standard Late Fee"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="fee_type">
                Fee Type <span className={styles.required}>*</span>
              </label>
              <select
                id="fee_type"
                name="fee_type"
                value={formData.fee_type}
                onChange={handleInputChange}
                required
                disabled={loading}
              >
                <option value="MULTIPLIER">Multiplier (e.g., 2x normal rate)</option>
                <option value="FLAT_RATE">Flat rate per hour</option>
                <option value="COMPOUND">Compound (multiplier + flat rate)</option>
              </select>
              <small className={styles.helpText}>
                {formData.fee_type === "MULTIPLIER" &&
                  "Charges will be calculated as a multiple of the base rate"}
                {formData.fee_type === "FLAT_RATE" &&
                  "Fixed charge per hour regardless of base rate"}
                {formData.fee_type === "COMPOUND" &&
                  "Combination of multiplier and flat rate"}
              </small>
            </div>
          </div>

          <div className={styles.formGrid}>
            {(formData.fee_type === "MULTIPLIER" ||
              formData.fee_type === "COMPOUND") && (
              <div className={styles.formGroup}>
                <label htmlFor="multiplier">Multiplier</label>
                <input
                  type="number"
                  id="multiplier"
                  name="multiplier"
                  value={formData.multiplier}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="2.0"
                  disabled={loading}
                />
                <small className={styles.helpText}>
                  e.g., 2.0 means 2x the normal rate
                </small>
              </div>
            )}

            {(formData.fee_type === "FLAT_RATE" ||
              formData.fee_type === "COMPOUND") && (
              <div className={styles.formGroup}>
                <label htmlFor="flat_rate_per_hour">
                  Flat Rate per Hour (NPR)
                </label>
                <input
                  type="number"
                  id="flat_rate_per_hour"
                  name="flat_rate_per_hour"
                  value={formData.flat_rate_per_hour}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="50.00"
                  disabled={loading}
                />
                <small className={styles.helpText}>
                  Fixed charge per overdue hour
                </small>
              </div>
            )}
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="grace_period_minutes">
                Grace Period (Minutes)
              </label>
              <input
                type="number"
                id="grace_period_minutes"
                name="grace_period_minutes"
                value={formData.grace_period_minutes}
                onChange={handleInputChange}
                min="0"
                placeholder="15"
                disabled={loading}
              />
              <small className={styles.helpText}>
                Minutes before late charges start (0 = immediate)
              </small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="max_daily_rate">Maximum Daily Rate (NPR)</label>
              <input
                type="number"
                id="max_daily_rate"
                name="max_daily_rate"
                value={formData.max_daily_rate}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="1000.00"
                disabled={loading}
              />
              <small className={styles.helpText}>
                Maximum late fee per day (0 = no limit)
              </small>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="applicable_package_types">
              Applicable Package Types (Optional)
            </label>
            <input
              type="text"
              id="applicable_package_types"
              value={packageTypes}
              onChange={(e) => setPackageTypes(e.target.value)}
              placeholder="HOURLY, DAILY, WEEKLY (comma-separated)"
              disabled={loading}
            />
            <small className={styles.helpText}>
              Leave empty to apply to all package types. Separate multiple types
              with commas.
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="metadata">
              Metadata (Optional JSON)
              <FiInfo className={styles.infoIcon} />
            </label>
            <textarea
              id="metadata"
              value={metadataJson}
              onChange={(e) => setMetadataJson(e.target.value)}
              placeholder='{"description": "Additional information", "examples": []}'
              rows={4}
              disabled={loading}
              className={styles.textarea}
            />
            <small className={styles.helpText}>
              Additional configuration data in JSON format
            </small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                disabled={loading}
              />
              <span>Active Configuration</span>
            </label>
            <small className={styles.helpText}>
              Only one configuration can be active at a time
            </small>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <FiLoader className={styles.spinner} />
                  {config ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{config ? "Update Configuration" : "Create Configuration"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LateFeeConfigModal;
