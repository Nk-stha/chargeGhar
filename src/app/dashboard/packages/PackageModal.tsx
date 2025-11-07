"use client";

import React, { useState, useEffect } from "react";
import styles from "./PackageModal.module.css";
import { FiX, FiLoader, FiAlertCircle } from "react-icons/fi";
import axiosInstance, { getCsrfToken } from "@/lib/axios";

interface RentalPackage {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: string;
  package_type: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
  payment_model: "PREPAID" | "POSTPAID";
  is_active: boolean;
  package_metadata: Record<string, any>;
  duration_display: string;
  created_at: string;
  updated_at: string;
}

interface PackageModalProps {
  package: RentalPackage | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const PackageModal: React.FC<PackageModalProps> = ({
  package: pkg,
  onClose,
  onSuccess,
}) => {
  const isEdit = !!pkg;

  const [formData, setFormData] = useState({
    name: pkg?.name || "",
    description: pkg?.description || "",
    duration_minutes: pkg?.duration_minutes?.toString() || "",
    price: pkg?.price || "",
    package_type: pkg?.package_type || "HOURLY",
    payment_model: pkg?.payment_model || "PREPAID",
    is_active: pkg?.is_active ?? true,
    package_metadata: pkg?.package_metadata
      ? JSON.stringify(pkg.package_metadata, null, 2)
      : "{}",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const validateMetadata = (metadataStr: string): boolean => {
    try {
      const parsed = JSON.parse(metadataStr);
      if (typeof parsed !== "object" || Array.isArray(parsed)) {
        setMetadataError("Metadata must be a valid JSON object");
        return false;
      }
      setMetadataError(null);
      return true;
    } catch (err) {
      setMetadataError("Invalid JSON format");
      return false;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "package_metadata") {
      validateMetadata(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateMetadata(formData.package_metadata)) {
      return;
    }

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required");
      return;
    }

    const durationMinutes = parseInt(formData.duration_minutes);
    if (!durationMinutes || durationMinutes <= 0) {
      setError("Valid duration in minutes is required");
      return;
    }

    const price = parseFloat(formData.price);
    if (!price || price <= 0) {
      setError("Valid price is required");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const csrfToken = getCsrfToken();

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        duration_minutes: durationMinutes,
        price: formData.price,
        package_type: formData.package_type,
        payment_model: formData.payment_model,
        is_active: formData.is_active,
        package_metadata: JSON.parse(formData.package_metadata),
      };

      if (isEdit) {
        await axiosInstance.patch(`/api/rental-packages/${pkg.id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFTOKEN": csrfToken || "",
          },
        });
        onSuccess("Package updated successfully");
      } else {
        await axiosInstance.post("/api/rental-packages", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFTOKEN": csrfToken || "",
          },
        });
        onSuccess("Package created successfully");
      }
    } catch (err: any) {
      console.error("Error saving package:", err);
      setError(
        err.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} package`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEdit ? "Edit Package" : "Add Package"}
          </h2>
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
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Package Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                placeholder="e.g., 1 Hour Package"
                disabled={loading}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="duration_minutes" className={styles.label}>
                Duration (Minutes) <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                id="duration_minutes"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleChange}
                className={styles.input}
                placeholder="60"
                min="1"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description <span className={styles.required}>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.textarea}
              placeholder="Perfect for short trips"
              rows={3}
              disabled={loading}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="price" className={styles.label}>
                Price <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={styles.input}
                placeholder="50.00"
                step="0.01"
                min="0"
                disabled={loading}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="package_type" className={styles.label}>
                Package Type <span className={styles.required}>*</span>
              </label>
              <select
                id="package_type"
                name="package_type"
                value={formData.package_type}
                onChange={handleChange}
                className={styles.select}
                disabled={loading}
                required
              >
                <option value="HOURLY">Hourly</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="payment_model" className={styles.label}>
                Payment Model <span className={styles.required}>*</span>
              </label>
              <select
                id="payment_model"
                name="payment_model"
                value={formData.payment_model}
                onChange={handleChange}
                className={styles.select}
                disabled={loading}
                required
              >
                <option value="PREPAID">Prepaid</option>
                <option value="POSTPAID">Postpaid</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className={styles.checkbox}
                    disabled={loading}
                  />
                  <span>Active</span>
                </label>
                <p className={styles.hint}>
                  Enable this package for users
                </p>
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="package_metadata" className={styles.label}>
              Package Metadata (JSON)
            </label>
            <textarea
              id="package_metadata"
              name="package_metadata"
              value={formData.package_metadata}
              onChange={handleChange}
              className={`${styles.textarea} ${styles.code} ${
                metadataError ? styles.inputError : ""
              }`}
              placeholder='{"key": "value"}'
              rows={4}
              disabled={loading}
            />
            {metadataError && (
              <p className={styles.errorText}>{metadataError}</p>
            )}
            <p className={styles.hint}>
              Additional metadata as JSON object (optional)
            </p>
          </div>

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
              disabled={loading || !!metadataError}
            >
              {loading ? (
                <>
                  <FiLoader className={styles.spinner} />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEdit ? "Update" : "Create"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackageModal;
