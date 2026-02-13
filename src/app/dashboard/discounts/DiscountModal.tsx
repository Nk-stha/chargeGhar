"use client";

import React, { useState, useEffect } from "react";
import styles from "./DiscountModal.module.css";
import { FiX, FiLoader, FiAlertCircle } from "react-icons/fi";
import axiosInstance, { getCsrfToken } from "@/lib/axios";

interface Discount {
  id: string;
  station_id?: string;
  station_name?: string;
  package_id?: string;
  package_name?: string;
  discount_percent: number | string;
  max_total_uses: number;
  max_uses_per_user: number;
  usage_count?: number;
  total_uses?: number;
  valid_from: string;
  valid_until: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  created_at?: string;
  updated_at?: string;
}

interface Station {
  id: string;
  station_name: string;
  serial_number: string;
}

interface Package {
  id: string;
  name: string;
  duration_display: string;
  price: string;
}

interface DiscountModalProps {
  discount: Discount | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const DiscountModal: React.FC<DiscountModalProps> = ({
  discount,
  onClose,
  onSuccess,
}) => {
  const isEdit = !!discount;

  const [formData, setFormData] = useState({
    station_id: discount?.station_id || "",
    package_id: discount?.package_id || "",
    discount_percent: discount?.discount_percent?.toString() || "",
    max_total_uses: discount?.max_total_uses?.toString() || "",
    max_uses_per_user: discount?.max_uses_per_user?.toString() || "",
    valid_from: discount?.valid_from
      ? new Date(discount.valid_from).toISOString().slice(0, 16)
      : "",
    valid_until: discount?.valid_until
      ? new Date(discount.valid_until).toISOString().slice(0, 16)
      : "",
    status: discount?.status || "ACTIVE",
  });

  const [stations, setStations] = useState<Station[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    fetchStationsAndPackages();
  }, []);

  const fetchStationsAndPackages = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem("accessToken");

      const [stationsRes, packagesRes] = await Promise.all([
        axiosInstance.get("/api/admin/stations?page_size=100", {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(err => {
          return { data: { success: false, data: { results: [] } } };
        }),
        axiosInstance.get("/api/rental-packages?page_size=100", {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(err => {
          return { data: { success: false, data: { rental_packages: [] } } };
        }),
      ]);

      let stationsData: Station[] = [];
      let packagesData: Package[] = [];

      if (stationsRes.data.success) {
        stationsData = stationsRes.data.data?.results || stationsRes.data.data || [];
        setStations(Array.isArray(stationsData) ? stationsData : []);
      }

      if (packagesRes.data.success) {
        packagesData = packagesRes.data.data?.rental_packages || packagesRes.data.data?.results || [];
        setPackages(Array.isArray(packagesData) ? packagesData : []);
      }

      // Check using local variables instead of state
      if ((!stationsRes.data.success && !packagesRes.data.success) || 
          (stationsData.length === 0 && packagesData.length === 0)) {
        // Only show error if BOTH failed or BOTH are empty
        // If one is empty, it might be valid (e.g. no stations yet), so we don't show a generic error
        // But if APIs failed, we should probably warn. 
        // Preserving original logic's intent of "both missing/failed" but using correct variables.
        if (!stationsRes.data.success || !packagesRes.data.success) {
           setError("Failed to load stations and packages. Please try again.");
        }
      }
    } catch (err: any) {
      setError("Failed to load stations and packages");
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation for create mode
    if (!isEdit) {
      if (!formData.station_id) {
        setError("Please select a station");
        return;
      }

      if (!formData.package_id) {
        setError("Please select a package");
        return;
      }
    }

    const discountPercent = parseFloat(formData.discount_percent);
    if (formData.discount_percent && (discountPercent <= 0 || discountPercent > 100)) {
      setError("Discount percent must be between 0 and 100");
      return;
    }

    const maxTotalUses = parseInt(formData.max_total_uses);
    if (formData.max_total_uses && maxTotalUses <= 0) {
      setError("Max total uses must be greater than 0");
      return;
    }

    const maxUsesPerUser = parseInt(formData.max_uses_per_user);
    if (formData.max_uses_per_user && maxUsesPerUser <= 0) {
      setError("Max uses per user must be greater than 0");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const csrfToken = getCsrfToken();

      const payload = new FormData();

      if (isEdit) {
        // For PATCH, only send fields that are being updated
        if (formData.discount_percent) {
          payload.append("discount_percent", formData.discount_percent);
        }
        if (formData.max_total_uses) {
          payload.append("max_total_uses", formData.max_total_uses);
        }
        if (formData.max_uses_per_user) {
          payload.append("max_uses_per_user", formData.max_uses_per_user);
        }
        if (formData.valid_from) {
          payload.append("valid_from", new Date(formData.valid_from).toISOString());
        }
        if (formData.valid_until) {
          payload.append("valid_until", new Date(formData.valid_until).toISOString());
        }
        if (formData.status) {
          payload.append("status", formData.status);
        }

        await axiosInstance.patch(`/api/discounts/${discount.id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFTOKEN": csrfToken || "",
            "Content-Type": "multipart/form-data",
          },
        });
        onSuccess("Discount updated successfully");
      } else {
        // For POST, send all required fields
        payload.append("station_id", formData.station_id);
        payload.append("package_id", formData.package_id);
        payload.append("discount_percent", formData.discount_percent);
        payload.append("max_total_uses", formData.max_total_uses);
        payload.append("max_uses_per_user", formData.max_uses_per_user);
        payload.append("valid_from", new Date(formData.valid_from).toISOString());
        payload.append("valid_until", new Date(formData.valid_until).toISOString());
        payload.append("status", formData.status);

        await axiosInstance.post("/api/discounts", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRFTOKEN": csrfToken || "",
            "Content-Type": "multipart/form-data",
          },
        });
        onSuccess("Discount created successfully");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} discount`;
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEdit ? "Edit Discount" : "Create New Discount"}
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

        {loadingData ? (
          <div className={styles.loadingContainer}>
            <FiLoader className={styles.spinner} />
            <p>Loading data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Selection Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Selection</h3>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="station_id" className={styles.label}>
                    Station <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="station_id"
                    name="station_id"
                    value={formData.station_id}
                    onChange={handleChange}
                    className={styles.select}
                    disabled={loading || isEdit}
                    required={!isEdit}
                  >
                    <option value="">Select Station</option>
                    {stations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.station_name} ({station.serial_number})
                      </option>
                    ))}
                  </select>
                  {isEdit && (
                    <p className={styles.helpText}>
                      Station cannot be changed after creation
                    </p>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="package_id" className={styles.label}>
                    Package <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="package_id"
                    name="package_id"
                    value={formData.package_id}
                    onChange={handleChange}
                    className={styles.select}
                    disabled={loading || isEdit}
                    required={!isEdit}
                  >
                    <option value="">Select Package</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} - {pkg.duration_display} (₹{pkg.price})
                      </option>
                    ))}
                  </select>
                  {isEdit && (
                    <p className={styles.helpText}>
                      Package cannot be changed after creation
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Discount Configuration Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Discount Configuration</h3>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="discount_percent" className={styles.label}>
                    Discount Percent <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWithSuffix}>
                    <input
                      type="number"
                      id="discount_percent"
                      name="discount_percent"
                      value={formData.discount_percent}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      max="100"
                      disabled={loading}
                      required
                    />
                    <span className={styles.suffix}>%</span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="max_total_uses" className={styles.label}>
                    Max Total Uses <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    id="max_total_uses"
                    name="max_total_uses"
                    value={formData.max_total_uses}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g. 500"
                    min="1"
                    disabled={loading}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="max_uses_per_user" className={styles.label}>
                    Max Uses Per User <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    id="max_uses_per_user"
                    name="max_uses_per_user"
                    value={formData.max_uses_per_user}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g. 1"
                    min="1"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Validity & Status Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Validity & Status</h3>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="valid_from" className={styles.label}>
                    Valid From <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="valid_from"
                    name="valid_from"
                    value={formData.valid_from}
                    onChange={handleChange}
                    className={styles.input}
                    disabled={loading}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="valid_until" className={styles.label}>
                    Valid Until <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="valid_until"
                    name="valid_until"
                    value={formData.valid_until}
                    onChange={handleChange}
                    className={styles.input}
                    disabled={loading}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="status" className={styles.label}>
                    Status <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={styles.select}
                    disabled={loading}
                    required
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>
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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FiLoader className={styles.spinner} />
                    {isEdit ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>{isEdit ? "Update Discount" : "Create Discount"}</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DiscountModal;
