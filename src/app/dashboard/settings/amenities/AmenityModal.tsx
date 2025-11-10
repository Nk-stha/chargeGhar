"use client";

import React, { useState, useEffect, FormEvent } from "react";
import styles from "./AmenityModal.module.css";
import { FiX, FiLoader, FiAlertCircle } from "react-icons/fi";
import amenitiesService from "@/lib/api/amenities.service";
import { Amenity } from "@/types/station.types";

interface AmenityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amenity?: Amenity | null;
}

const ICON_OPTIONS = [
  { value: "wifi", label: "WiFi", emoji: "📶" },
  { value: "parking", label: "Parking", emoji: "🅿️" },
  { value: "clock", label: "24/7 Access", emoji: "🕐" },
  { value: "coffee", label: "Coffee", emoji: "☕" },
  { value: "restroom", label: "Restroom", emoji: "🚻" },
  { value: "store", label: "Store", emoji: "🏪" },
  { value: "lounge", label: "Lounge", emoji: "🛋️" },
  { value: "restaurant", label: "Restaurant", emoji: "🍽️" },
  { value: "charging", label: "Charging", emoji: "⚡" },
  { value: "security", label: "Security", emoji: "🔒" },
  { value: "accessibility", label: "Accessibility", emoji: "♿" },
  { value: "atm", label: "ATM", emoji: "🏧" },
];

const AmenityModal: React.FC<AmenityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amenity,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    icon: "wifi",
    description: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (amenity) {
      setFormData({
        name: amenity.name,
        icon: amenity.icon,
        description: amenity.description,
        is_active: amenity.is_active,
      });
    } else {
      setFormData({
        name: "",
        icon: "wifi",
        description: "",
        is_active: true,
      });
    }
    setError(null);
  }, [amenity, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (amenity) {
        const response = await amenitiesService.updateAmenity(
          amenity.id,
          formData
        );
        if (!response.success) {
          throw new Error(response.message || "Failed to update amenity");
        }
      } else {
        const response = await amenitiesService.createAmenity(formData);
        if (!response.success) {
          throw new Error(response.message || "Failed to create amenity");
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error saving amenity:", err);
      setError(err.message || "Failed to save amenity");
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
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (!isOpen) return null;

  const selectedIcon = ICON_OPTIONS.find((opt) => opt.value === formData.icon);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{amenity ? "Edit Amenity" : "Create Amenity"}</h2>
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

          <div className={styles.formGroup}>
            <label htmlFor="name">
              Amenity Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., WiFi, Parking"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="icon">
              Icon <span className={styles.required}>*</span>
            </label>
            <div className={styles.iconSelectWrapper}>
              <select
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                required
                disabled={loading}
                className={styles.iconSelect}
              >
                {ICON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.emoji} {option.label}
                  </option>
                ))}
              </select>
              <div className={styles.iconPreview}>
                {selectedIcon?.emoji}
              </div>
            </div>
            <small className={styles.helpText}>
              Select an icon to represent this amenity
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">
              Description <span className={styles.required}>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the amenity"
              rows={3}
              required
              disabled={loading}
              className={styles.textarea}
            />
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
              <span>Active</span>
            </label>
            <small className={styles.helpText}>
              Only active amenities will be available for selection
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
                  {amenity ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{amenity ? "Update Amenity" : "Create Amenity"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AmenityModal;
