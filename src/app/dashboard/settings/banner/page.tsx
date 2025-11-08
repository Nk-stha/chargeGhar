"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./banner.module.css";
import {
  FiImage,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiAlertCircle,
  FiDownload,
  FiX,
  FiCalendar,
  FiLink,
  FiEye,
  FiEyeOff,
  FiSettings,
} from "react-icons/fi";
import { bannerService } from "../../../../lib/api/banner.service";
import { mediaService } from "../../../../lib/api/media.service";
import { Banner } from "../../../../types/banner.types";

export default function ContentManagementPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    redirect_url: "",
    display_order: 1,
    is_active: true,
    valid_from: "",
    valid_until: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bannerService.getBanners();

      if (response.success) {
        setBanners(response.data);
      } else {
        setError("Failed to fetch banners");
      }
    } catch (err: any) {
      console.error("Error fetching banners:", err);
      setError("Unable to load banners. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleRefresh = () => {
    fetchBanners();
  };

  const handleExportCSV = () => {
    if (banners.length === 0) {
      alert("No data to export");
      return;
    }
    const timestamp = new Date().toISOString().split("T")[0];
    bannerService.downloadCSV(banners, `banners_${timestamp}.csv`);
  };

  const handleOpenModal = (banner?: Banner) => {
    if (banner) {
      setIsEditMode(true);
      setSelectedBanner(banner);
      setFormData({
        title: banner.title,
        description: banner.description || "",
        image_url: banner.image_url,
        redirect_url: banner.redirect_url || "",
        display_order: banner.display_order,
        is_active: banner.is_active,
        valid_from: bannerService.formatDateForInput(banner.valid_from),
        valid_until: bannerService.formatDateForInput(banner.valid_until),
      });
    } else {
      setIsEditMode(false);
      setSelectedBanner(null);
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      setFormData({
        title: "",
        description: "",
        image_url: "",
        redirect_url: "",
        display_order: banners.length + 1,
        is_active: true,
        valid_from: bannerService.formatDateForInput(tomorrow.toISOString()),
        valid_until: bannerService.formatDateForInput(nextWeek.toISOString()),
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBanner(null);
    setFormErrors({});
    setSelectedFile(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.image_url.trim()) {
      errors.image_url = "Image URL is required";
    } else {
      try {
        new URL(formData.image_url);
      } catch {
        errors.image_url = "Invalid URL format";
      }
    }

    if (formData.redirect_url && formData.redirect_url.trim()) {
      try {
        new URL(formData.redirect_url);
      } catch {
        errors.redirect_url = "Invalid URL format";
      }
    }

    if (!formData.valid_from) {
      errors.valid_from = "Start date is required";
    }

    if (!formData.valid_until) {
      errors.valid_until = "End date is required";
    }

    if (formData.valid_from && formData.valid_until) {
      const validation = bannerService.validateDateRange(
        formData.valid_from,
        formData.valid_until,
      );
      if (!validation.valid) {
        errors.valid_until = validation.error || "Invalid date range";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = mediaService.validateFile(file, 5); // 5MB limit
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return;

    try {
      setUploadingImage(true);
      const fileType = mediaService.getFileTypeFromFile(selectedFile);

      const response = await mediaService.uploadMedia({
        file: selectedFile,
        file_type: fileType,
      });

      if (response.success && response.data) {
        setFormData({ ...formData, image_url: response.data.file_url });
        setSelectedFile(null);
        alert("Image uploaded successfully");
      }
    } catch (err: any) {
      console.error("Error uploading image:", err);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setModalLoading(true);

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        image_url: formData.image_url.trim(),
        redirect_url: formData.redirect_url.trim() || undefined,
        display_order: formData.display_order,
        is_active: formData.is_active,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
      };

      if (isEditMode && selectedBanner) {
        const response = await bannerService.updateBanner(
          selectedBanner.id,
          payload,
        );
        if (response.success) {
          alert("Banner updated successfully");
          handleCloseModal();
          fetchBanners();
        }
      } else {
        const response = await bannerService.createBanner(payload);
        if (response.success) {
          alert("Banner created successfully");
          handleCloseModal();
          fetchBanners();
        }
      }
    } catch (err: any) {
      console.error("Error saving banner:", err);
      alert(err.response?.data?.message || "Failed to save banner");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (bannerId: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) {
      return;
    }

    try {
      const response = await bannerService.deleteBanner(bannerId);
      if (response.success) {
        alert("Banner deleted successfully");
        fetchBanners();
      }
    } catch (err: any) {
      console.error("Error deleting banner:", err);
      alert("Failed to delete banner");
    }
  };

  const getStatusClass = (banner: Banner): string => {
    return styles[bannerService.getStatusClass(banner)];
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>
            <FiSettings style={{ fontSize: "1.5rem", marginRight: "0.5rem" }} />
            Settings / Content Management
          </h1>
          <p className={styles.subtitle}>
            Manage banners and promotional content
            {banners.length > 0 && ` (${banners.length} total)`}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={handleRefresh}
            className={styles.refreshBtn}
            disabled={loading}
            title="Refresh"
          >
            <FiRefreshCw className={loading ? styles.spinning : ""} />
          </button>
          <button onClick={handleExportCSV} className={styles.exportBtn}>
            <FiDownload /> Export CSV
          </button>
          <button onClick={() => handleOpenModal()} className={styles.addBtn}>
            <FiPlus /> Add Banner
          </button>
        </div>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <FiImage className={styles.icon} /> Banner List
          </h2>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p>Loading banners...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <FiAlertCircle className={styles.errorIcon} />
            <p className={styles.errorText}>{error}</p>
            <button onClick={handleRefresh} className={styles.retryButton}>
              <FiRefreshCw /> Retry
            </button>
          </div>
        ) : banners.length === 0 ? (
          <div className={styles.noData}>
            <FiImage className={styles.noDataIcon} />
            <p>No banners found</p>
            <button
              onClick={() => handleOpenModal()}
              className={styles.addFirstBtn}
            >
              <FiPlus /> Create Your First Banner
            </button>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Banner</th>
                  <th>Title</th>
                  <th>Valid Period</th>
                  <th>Status</th>
                  <th>Days Left</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner.id}>
                    <td>
                      <span className={styles.displayOrder}>
                        #{banner.display_order}
                      </span>
                    </td>
                    <td>
                      <div className={styles.bannerPreview}>
                        <img
                          src={banner.image_url}
                          alt={banner.title}
                          className={styles.previewImage}
                        />
                      </div>
                    </td>
                    <td>
                      <div className={styles.bannerInfo}>
                        <span className={styles.bannerTitle}>
                          {banner.title}
                        </span>
                        {banner.description && (
                          <span className={styles.bannerDescription}>
                            {banner.description.length > 50
                              ? `${banner.description.substring(0, 50)}...`
                              : banner.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className={styles.dateInfo}>
                        <span className={styles.dateLabel}>
                          <FiCalendar size={12} />
                          {bannerService.formatDateTime(
                            banner.valid_from,
                            false,
                          )}
                        </span>
                        <span className={styles.dateLabel}>
                          to{" "}
                          {bannerService.formatDateTime(
                            banner.valid_until,
                            false,
                          )}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${getStatusClass(banner)}`}
                      >
                        {banner.is_active ? (
                          <FiEye size={12} />
                        ) : (
                          <FiEyeOff size={12} />
                        )}
                        {bannerService.getStatusLabel(banner)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          banner.days_remaining < 3
                            ? styles.urgentDays
                            : styles.normalDays
                        }
                      >
                        {bannerService.getRemainingTimeText(
                          banner.days_remaining,
                        )}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          onClick={() => handleOpenModal(banner)}
                          className={styles.editBtn}
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className={styles.deleteBtn}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Banner Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>{isEditMode ? "Edit Banner" : "Create New Banner"}</h2>
              <button
                onClick={handleCloseModal}
                className={styles.closeBtn}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Title <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`${styles.input} ${formErrors.title ? styles.inputError : ""}`}
                    placeholder="Enter banner title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                  {formErrors.title && (
                    <span className={styles.errorMessage}>
                      {formErrors.title}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Display Order</label>
                  <input
                    type="number"
                    className={styles.input}
                    min="1"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Enter banner description (optional)"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Image <span className={styles.required}>*</span>
                </label>

                {/* File Upload Section */}
                <div className={styles.uploadSection}>
                  <div className={styles.fileInputWrapper}>
                    <input
                      type="file"
                      id="banner-image"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className={styles.fileInput}
                    />
                    <label htmlFor="banner-image" className={styles.fileLabel}>
                      <FiImage />
                      {selectedFile ? selectedFile.name : "Choose Image File"}
                    </label>
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={handleUploadImage}
                        className={styles.uploadBtn}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? "Uploading..." : "Upload"}
                      </button>
                    )}
                  </div>
                  <span className={styles.uploadHint}>
                    or enter image URL below
                  </span>
                </div>

                {/* URL Input Section */}
                <div className={styles.inputWithIcon}>
                  <FiLink className={styles.inputIcon} />
                  <input
                    type="url"
                    className={`${styles.inputWithPadding} ${formErrors.image_url ? styles.inputError : ""}`}
                    placeholder="https://example.com/image.jpg"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                  />
                </div>
                {formErrors.image_url && (
                  <span className={styles.errorMessage}>
                    {formErrors.image_url}
                  </span>
                )}
                {formData.image_url && !formErrors.image_url && (
                  <div className={styles.imagePreview}>
                    <img src={formData.image_url} alt="Preview" />
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Redirect URL (Optional)</label>
                <div className={styles.inputWithIcon}>
                  <FiLink className={styles.inputIcon} />
                  <input
                    type="url"
                    className={`${styles.inputWithPadding} ${formErrors.redirect_url ? styles.inputError : ""}`}
                    placeholder="https://example.com/page"
                    value={formData.redirect_url}
                    onChange={(e) =>
                      setFormData({ ...formData, redirect_url: e.target.value })
                    }
                  />
                </div>
                {formErrors.redirect_url && (
                  <span className={styles.errorMessage}>
                    {formErrors.redirect_url}
                  </span>
                )}
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Valid From <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className={`${styles.input} ${formErrors.valid_from ? styles.inputError : ""}`}
                    value={formData.valid_from}
                    onChange={(e) =>
                      setFormData({ ...formData, valid_from: e.target.value })
                    }
                  />
                  {formErrors.valid_from && (
                    <span className={styles.errorMessage}>
                      {formErrors.valid_from}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Valid Until <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className={`${styles.input} ${formErrors.valid_until ? styles.inputError : ""}`}
                    value={formData.valid_until}
                    onChange={(e) =>
                      setFormData({ ...formData, valid_until: e.target.value })
                    }
                  />
                  {formErrors.valid_until && (
                    <span className={styles.errorMessage}>
                      {formErrors.valid_until}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                  />
                  <span>Active (Display this banner to users)</span>
                </label>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={styles.cancelBtn}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={modalLoading}
                >
                  {modalLoading
                    ? "Saving..."
                    : isEditMode
                      ? "Update Banner"
                      : "Create Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
