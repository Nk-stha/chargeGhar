"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./config.module.css";
import {
  FiSettings,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiRefreshCw,
  FiAlertCircle,
  FiDownload,
  FiX,
  FiSearch,
  FiAlertTriangle,
  FiKey,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { configService, ConfigsData } from "../../../../lib/api/config.service";

interface ConfigEntry {
  key: string;
  value: string;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function ConfigManagementPage() {
  const [configs, setConfigs] = useState<ConfigEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [selectedConfig, setSelectedConfig] = useState<ConfigEntry | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [configToDelete, setConfigToDelete] = useState<ConfigEntry | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    description: "",
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await configService.getConfigs();

      if (response.success) {
        // Convert object to array
        const configArray: ConfigEntry[] = Object.entries(
          response.data.configs,
        ).map(([key, config]) => ({
          key,
          ...config,
        }));
        // Sort by key
        configArray.sort((a, b) => a.key.localeCompare(b.key));
        setConfigs(configArray);
      } else {
        setError("Failed to fetch configurations");
      }
    } catch (err: any) {
      console.error("Error fetching configs:", err);
      setError("Unable to load configurations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleRefresh = () => {
    fetchConfigs();
  };

  const handleExportCSV = () => {
    if (configs.length === 0) {
      alert("No data to export");
      return;
    }
    const timestamp = new Date().toISOString().split("T")[0];
    const configsData: ConfigsData = configs.reduce((acc, config) => {
      acc[config.key] = {
        value: config.value,
        description: config.description,
        is_public: config.is_public,
        created_at: config.created_at,
        updated_at: config.updated_at,
      };
      return acc;
    }, {} as ConfigsData);
    configService.downloadCSV(configsData, `configs_${timestamp}.csv`);
  };

  const handleOpenModal = (config?: ConfigEntry) => {
    if (config) {
      setIsEditMode(true);
      setSelectedConfig(config);
      setFormData({
        key: config.key,
        value: config.value,
        description: config.description,
        is_active: config.is_public,
      });
    } else {
      setIsEditMode(false);
      setSelectedConfig(null);
      setFormData({
        key: "",
        value: "",
        description: "",
        is_active: true,
      });
    }
    setFormErrors({});
    setError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedConfig(null);
    setFormErrors({});
  };

  const handleOpenDeleteModal = (config: ConfigEntry) => {
    setConfigToDelete(config);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setConfigToDelete(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.key.trim()) {
      errors.key = "Key is required";
    } else if (
      !isEditMode &&
      configs.some((c) => c.key === formData.key.trim())
    ) {
      errors.key = "A configuration with this key already exists";
    }

    if (!formData.value.trim()) {
      errors.value = "Value is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setModalLoading(true);

      const payload = {
        key: formData.key.trim(),
        value: formData.value.trim(),
        description: formData.description.trim() || undefined,
        is_active: formData.is_active,
      };

      if (isEditMode && selectedConfig) {
        const response = await configService.updateConfig({
          key: selectedConfig.key,
          value: payload.value,
          description: payload.description,
          is_active: payload.is_active,
        });
        if (response.success) {
          await fetchConfigs();
          handleCloseModal();
        } else {
          setError("Failed to update configuration");
        }
      } else {
        const response = await configService.createConfig(payload);
        if (response.success) {
          await fetchConfigs();
          handleCloseModal();
        } else {
          setError("Failed to create configuration");
        }
      }
    } catch (err: any) {
      console.error("Error saving config:", err);
      const errorData = err.response?.data;
      let errorMessage = "Failed to save configuration";

      if (errorData?.error?.message) {
        errorMessage = errorData.error.message;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }

      setError(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!configToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await configService.deleteConfig(
        configToDelete.key,
        true,
      );

      if (response.success) {
        await fetchConfigs();
        handleCloseDeleteModal();
      } else {
        setError("Failed to delete configuration");
      }
    } catch (err: any) {
      console.error("Error deleting config:", err);
      setError("Failed to delete configuration");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredConfigs = configs.filter(
    (config) =>
      config.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>Configuration Management</h1>
          <p className={styles.subtitle}>
            Manage application configurations and settings
            {configs.length > 0 && ` (${configs.length} total)`}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.refreshBtn}
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh"
          >
            <FiRefreshCw className={loading ? styles.spinning : ""} />
          </button>
          <button onClick={handleExportCSV} className={styles.exportBtn}>
            <FiDownload /> Export CSV
          </button>
          <button className={styles.addBtn} onClick={() => handleOpenModal()}>
            <FiPlus /> Add Config
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className={styles.errorBanner}>
          <FiAlertCircle />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <FiX />
          </button>
        </div>
      )}

      {/* Main Content Card */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <FiSettings className={styles.icon} /> Configuration List
          </h2>
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by key, value, or description..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading configurations...</p>
          </div>
        ) : filteredConfigs.length === 0 ? (
          <div className={styles.noData}>
            <FiSettings className={styles.noDataIcon} />
            <p>
              {searchTerm
                ? "No configurations match your search criteria"
                : "No configurations found"}
            </p>
            {!searchTerm && (
              <button
                className={styles.addFirstBtn}
                onClick={() => handleOpenModal()}
              >
                <FiPlus /> Create Your First Configuration
              </button>
            )}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                  <th>Description</th>
                  <th>Public</th>
                  <th>Updated At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredConfigs.map((config) => (
                  <tr key={config.key}>
                    <td>
                      <div className={styles.keyCell}>
                        <FiKey className={styles.keyIcon} />
                        <span className={styles.keyText}>{config.key}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.valueText}>{config.value}</span>
                    </td>
                    <td>
                      <span className={styles.descriptionText}>
                        {config.description || "-"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          config.is_public
                            ? styles.statusActive
                            : styles.statusInactive
                        }`}
                      >
                        {config.is_public ? (
                          <>
                            <FiEye size={12} /> Public
                          </>
                        ) : (
                          <>
                            <FiEyeOff size={12} /> Private
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      <span className={styles.dateText}>
                        {new Date(config.updated_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.editBtn}
                          onClick={() => handleOpenModal(config)}
                          title="Edit"
                        >
                          <FiEdit />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleOpenDeleteModal(config)}
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>
                {isEditMode ? "Edit Configuration" : "Create New Configuration"}
              </h2>
              <button
                className={styles.closeBtn}
                onClick={handleCloseModal}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Key <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.key}
                  onChange={(e) =>
                    setFormData({ ...formData, key: e.target.value })
                  }
                  className={`${styles.input} ${
                    formErrors.key ? styles.inputError : ""
                  }`}
                  placeholder="e.g., MAX_RENTAL_HOURS or use any text"
                  disabled={isEditMode}
                />
                {formErrors.key && (
                  <span className={styles.errorMessage}>{formErrors.key}</span>
                )}
                {isEditMode ? (
                  <span className={styles.helpText}>
                    Key cannot be changed when editing
                  </span>
                ) : (
                  <span className={styles.helpText}>
                    Enter a simple key name (e.g., MAX_RENTAL_HOURS)
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Value <span className={styles.required}>*</span>
                </label>
                <textarea
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  className={`${styles.textarea} ${
                    formErrors.value ? styles.inputError : ""
                  }`}
                  placeholder='Enter value (e.g., "24", "true", "100")'
                  rows={3}
                />
                {formErrors.value && (
                  <span className={styles.errorMessage}>
                    {formErrors.value}
                  </span>
                )}
                <span className={styles.helpText}>
                  Enter simple text values like: 24, true, 100, or text strings
                </span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={styles.textarea}
                  placeholder="Enter a description for this configuration"
                  rows={3}
                />
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
                  <span>Public (Visible to non-admin users)</span>
                </label>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={handleCloseModal}
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
                      ? "Update Config"
                      : "Create Config"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && configToDelete && (
        <div className={styles.modalOverlay} onClick={handleCloseDeleteModal}>
          <div
            className={styles.deleteModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.deleteModalHeader}>
              <div className={styles.deleteIconWrapper}>
                <FiAlertTriangle className={styles.deleteIcon} />
              </div>
              <h2>Delete Configuration</h2>
              <p>Are you sure you want to delete this configuration?</p>
            </div>

            <div className={styles.deleteModalBody}>
              <div className={styles.deleteContactDetails}>
                <div className={styles.deleteDetailRow}>
                  <span className={styles.deleteDetailLabel}>Key:</span>
                  <span className={styles.deleteDetailValue}>
                    {configToDelete.key}
                  </span>
                </div>
                <div className={styles.deleteDetailRow}>
                  <span className={styles.deleteDetailLabel}>Value:</span>
                  <span className={styles.deleteDetailValue}>
                    {configToDelete.value}
                  </span>
                </div>
              </div>
              <div className={styles.deleteWarning}>
                <FiAlertCircle />
                <span>This action cannot be undone.</span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleCloseDeleteModal}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteBtnPrimary}
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Config"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
