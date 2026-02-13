"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import styles from "./PaymentMethodModal.module.css";
import { FiX, FiLoader, FiAlertCircle, FiUpload, FiLink, FiImage } from "react-icons/fi";
import axiosInstance, { getCsrfToken } from "@/lib/axios";

interface PaymentMethod {
  id: string;
  name: string;
  gateway: string;
  icon?: string;
  is_active: boolean;
  configuration: Record<string, string>;
  min_amount: string;
  max_amount: string;
  supported_currencies: string[];
  created_at: string;
  updated_at: string;
}

interface PaymentMethodModalProps {
  method: PaymentMethod | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  method,
  onClose,
  onSuccess,
}) => {
  const isEdit = !!method;

  const [formData, setFormData] = useState({
    name: method?.name || "",
    gateway: method?.gateway || "",
    is_active: method?.is_active ?? true,
    configuration: method?.configuration
    ? JSON.stringify(method.configuration, null, 2)
    : "{}",
    min_amount: method?.min_amount || "",
    max_amount: method?.max_amount || "",
    supported_currencies: method?.supported_currencies?.join(", ") || "",
  });

  const [iconMode, setIconMode] = useState<"url" | "upload">("url");
  const [iconUrl, setIconUrl] = useState(method?.icon || "");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(method?.icon || null);
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const validateConfiguration = (configStr: string): boolean => {
    try {
      const parsed = JSON.parse(configStr);
      if (typeof parsed !== "object" || Array.isArray(parsed)) {
        setConfigError("Configuration must be a valid JSON object");
        return false;
      }
      setConfigError(null);
      return true;
    } catch (err) {
      setConfigError("Invalid JSON format");
      return false;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "configuration") {
      validateConfiguration(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIconUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setIconUrl(url);
    if (url) {
      setIconPreview(url);
    }
  };

  const uploadIconToCloudinary = async (file: File): Promise<string> => {
    try {
      setUploadingIcon(true);
      const token = localStorage.getItem("accessToken");
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("file_type", "IMAGE");

      const response = await axiosInstance.post(
        "/api/admin/media/uploads",
        uploadFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response?.data?.success && response?.data?.data?.file_url) {
        return response.data.data.file_url;
      } else {
        throw new Error(response?.data?.message || "Failed to upload icon");
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.response?.data?.error?.message || "Failed to upload icon";
      toast.error(errorMsg);
      throw err;
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateConfiguration(formData.configuration)) {
      return;
    }

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!formData.gateway.trim()) {
      setError("Gateway is required");
      return;
    }

    if (!formData.min_amount || parseFloat(formData.min_amount) <= 0) {
      setError("Valid minimum amount is required");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const csrfToken = getCsrfToken();

      // Upload icon if file is selected
      let finalIconUrl = iconUrl;
      if (iconMode === "upload" && iconFile) {
        finalIconUrl = await uploadIconToCloudinary(iconFile);
      }

      const currencies = formData.supported_currencies
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      // Create FormData for multipart/form-data
      const submitFormData = new FormData();
      submitFormData.append("name", formData.name.trim());
      submitFormData.append("gateway", formData.gateway.trim());
      submitFormData.append("is_active", String(formData.is_active));
      submitFormData.append("configuration", formData.configuration);
      submitFormData.append("min_amount", formData.min_amount);
      
      if (formData.max_amount) {
        submitFormData.append("max_amount", formData.max_amount);
      }
      
      if (finalIconUrl) {
        submitFormData.append("icon", finalIconUrl);
      }
      
      if (currencies.length > 0) {
        currencies.forEach((currency) => {
          submitFormData.append("supported_currencies", currency);
        });
      }

      if (isEdit) {
        const response = await axiosInstance.patch(
          `/api/payment-methods/${method?.id}`,
          submitFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-CSRFTOKEN": csrfToken || "",
              "Content-Type": "multipart/form-data",
            },
          }
        );
        
        if (response?.data?.success) {
          onSuccess(response?.data?.message || "Payment method updated successfully");
        } else {
          throw new Error(response?.data?.message || "Failed to update payment method");
        }
      } else {
        const response = await axiosInstance.post(
          "/api/payment-methods",
          submitFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-CSRFTOKEN": csrfToken || "",
              "Content-Type": "multipart/form-data",
            },
          }
        );
        
        if (response?.data?.success) {
          onSuccess(response?.data?.message || "Payment method created successfully");
        } else {
          throw new Error(response?.data?.message || "Failed to create payment method");
        }
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message ||
        `Failed to ${isEdit ? "update" : "create"} payment method`;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEdit ? "Edit Payment Method" : "Add Payment Method"}
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
                Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                placeholder="e.g., Khalti, eSewa"
                disabled={loading}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="gateway" className={styles.label}>
                Gateway <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="gateway"
                name="gateway"
                value={formData.gateway}
                onChange={handleChange}
                className={styles.input}
                placeholder="e.g., khalti, esewa"
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Icon Section */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Payment Gateway Icon (Optional)
            </label>
            
            <div className={styles.iconModeToggle}>
              <button
                type="button"
                className={`${styles.modeBtn} ${iconMode === "url" ? styles.active : ""}`}
                onClick={() => setIconMode("url")}
                disabled={loading}
              >
                <FiLink /> URL
              </button>
              <button
                type="button"
                className={`${styles.modeBtn} ${iconMode === "upload" ? styles.active : ""}`}
                onClick={() => setIconMode("upload")}
                disabled={loading}
              >
                <FiUpload /> Upload
              </button>
            </div>

            {iconMode === "url" ? (
              <input
                type="url"
                value={iconUrl}
                onChange={handleIconUrlChange}
                className={styles.input}
                placeholder="https://example.com/icon.png"
                disabled={loading}
              />
            ) : (
              <div className={styles.fileUploadWrapper}>
                <input
                  type="file"
                  id="iconFile"
                  accept="image/*"
                  onChange={handleIconFileChange}
                  className={styles.fileInput}
                  disabled={loading || uploadingIcon}
                />
                <label htmlFor="iconFile" className={styles.fileLabel}>
                  <FiImage />
                  <span>
                    {iconFile ? iconFile.name : "Choose an image file"}
                  </span>
                </label>
              </div>
            )}

            {iconPreview && (
              <div className={styles.iconPreview}>
                <img src={iconPreview} alt="Icon preview" />
                <button
                  type="button"
                  className={styles.removePreview}
                  onClick={() => {
                    setIconPreview(null);
                    setIconFile(null);
                    setIconUrl("");
                  }}
                  disabled={loading}
                >
                  <FiX />
                </button>
              </div>
            )}
            
            <p className={styles.hint}>
              {iconMode === "url" 
                ? "Enter a direct URL to the payment gateway icon" 
                : "Upload an image (max 5MB). Will be uploaded to Cloudinary"}
            </p>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="min_amount" className={styles.label}>
                Minimum Amount <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                id="min_amount"
                name="min_amount"
                value={formData.min_amount}
                onChange={handleChange}
                className={styles.input}
                placeholder="10.00"
                step="0.01"
                min="0"
                disabled={loading}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="max_amount" className={styles.label}>
                Maximum Amount
              </label>
              <input
                type="number"
                id="max_amount"
                name="max_amount"
                value={formData.max_amount}
                onChange={handleChange}
                className={styles.input}
                placeholder="100000.00"
                step="0.01"
                min="0"
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="supported_currencies" className={styles.label}>
              Supported Currencies
            </label>
            <input
              type="text"
              id="supported_currencies"
              name="supported_currencies"
              value={formData.supported_currencies}
              onChange={handleChange}
              className={styles.input}
              placeholder="NPR, USD, GBP (comma separated)"
              disabled={loading}
            />
            <p className={styles.hint}>Enter currencies separated by commas</p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="configuration" className={styles.label}>
              Configuration (JSON) <span className={styles.required}>*</span>
            </label>
            <textarea
              id="configuration"
              name="configuration"
              value={formData.configuration}
              onChange={handleChange}
              className={`${styles.textarea} ${
                configError ? styles.inputError : ""
              }`}
              placeholder='{"public_key": "your_key", "secret_key": "your_secret"}'
              rows={6}
              disabled={loading}
              required
            />
            {configError && (
              <p className={styles.errorText}>{configError}</p>
            )}
            <p className={styles.hint}>
              Enter configuration as a valid JSON object
            </p>
          </div>

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
              Enable this payment method for transactions
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
              disabled={loading || uploadingIcon || !!configError}
            >
              {loading || uploadingIcon ? (
                <>
                  <FiLoader className={styles.spinner} />
                  {uploadingIcon ? "Uploading..." : isEdit ? "Updating..." : "Creating..."}
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

export default PaymentMethodModal;
