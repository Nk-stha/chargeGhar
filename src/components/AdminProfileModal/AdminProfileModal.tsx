"use client";

import React, { useState, useEffect } from "react";
import styles from "./AdminProfileModal.module.css";
import {
  FiX,
  FiUser,
  FiMail,
  FiShield,
  FiCalendar,
  FiEdit,
  FiSave,
  FiTrash2,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { adminProfilesService, AdminProfile, UpdateAdminProfilePayload } from "../../lib/api/adminProfiles.service";

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  onUpdate?: () => void;
  onDelete?: () => void;
}

type ModalMode = "view" | "edit" | "delete";

const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  profileId,
  onUpdate,
  onDelete,
}) => {
  const [mode, setMode] = useState<ModalMode>("view");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Edit form state
  const [editRole, setEditRole] = useState<"super_admin" | "admin" | "moderator">("admin");
  const [editPassword, setEditPassword] = useState<string>("");
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editReason, setEditReason] = useState<string>("");
  const [deleteReason, setDeleteReason] = useState<string>("");

  useEffect(() => {
    if (isOpen && profileId) {
      fetchProfile();
    }
  }, [isOpen, profileId]);

  useEffect(() => {
    if (profile) {
      setEditRole(profile.role);
      setEditIsActive(profile.is_active);
      setEditPassword("");
      setEditReason("");
      setDeleteReason("");
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminProfilesService.getAdminProfile(profileId);

      if (response.success) {
        setProfile(response.data);
        setMode("view");
      } else {
        setError("Failed to fetch admin profile");
      }
    } catch (err: any) {
      console.error("Error fetching admin profile:", err);
      setError("Unable to load admin profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!profile) return;

    try {
      setSaving(true);
      setError(null);

      const payload: UpdateAdminProfilePayload = {};

      if (editRole !== profile.role) {
        payload.role = editRole;
      }

      if (editPassword.trim()) {
        // Validate password
        const validation = adminProfilesService.validatePassword(editPassword);
        if (!validation.valid) {
          setError(validation.errors.join(", "));
          setSaving(false);
          return;
        }
        payload.new_password = editPassword;
      }

      if (editIsActive !== profile.is_active) {
        payload.is_active = editIsActive;
        if (!editIsActive && editReason.trim()) {
          payload.reason = editReason;
        }
      }

      // Validate payload
      const validation = adminProfilesService.validateUpdatePayload(payload);
      if (!validation.valid) {
        setError(validation.errors.join(", "));
        setSaving(false);
        return;
      }

      const response = await adminProfilesService.updateAdminProfile(profileId, payload);

      if (response.success) {
        setProfile(response.data);
        setMode("view");
        setEditPassword("");
        setEditReason("");
        if (onUpdate) onUpdate();
      } else {
        setError("Failed to update admin profile");
      }
    } catch (err: any) {
      console.error("Error updating admin profile:", err);
      setError(err.response?.data?.message || "Unable to update admin profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!profile || !deleteReason.trim()) {
      setError("Please provide a reason for deletion");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await adminProfilesService.deleteAdminProfile(profileId);

      if (response.success) {
        if (onDelete) onDelete();
        onClose();
      } else {
        setError("Failed to delete admin profile");
      }
    } catch (err: any) {
      console.error("Error deleting admin profile:", err);
      setError(err.response?.data?.message || "Unable to delete admin profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditRole(profile.role);
      setEditIsActive(profile.is_active);
      setEditPassword("");
      setEditReason("");
      setError(null);
    }
    setMode("view");
  };

  const handleCancelDelete = () => {
    setDeleteReason("");
    setError(null);
    setMode("view");
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {mode === "view" && "Admin Profile"}
            {mode === "edit" && "Edit Admin Profile"}
            {mode === "delete" && "Delete Admin Profile"}
          </h2>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <FiX />
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner} />
              <p>Loading admin profile...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <FiAlertCircle className={styles.errorIcon} />
              <p className={styles.errorText}>{error}</p>
              <button onClick={fetchProfile} className={styles.retryBtn}>
                Try Again
              </button>
            </div>
          ) : profile ? (
            <>
              {/* View Mode */}
              {mode === "view" && (
                <>
                  {/* Profile Header */}
                  <div className={styles.profileHeader}>
                    <div className={styles.avatar}>
                      <FiUser />
                    </div>
                    <div className={styles.profileInfo}>
                      <h3 className={styles.username}>{profile.username}</h3>
                      <p className={styles.email}>{profile.email}</p>
                    </div>
                    <span
                      className={`${styles.statusBadge} ${profile.is_active ? styles.statusActive : styles.statusInactive}`}
                    >
                      {profile.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Profile Details */}
                  <div className={styles.section}>
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>
                          <FiShield className={styles.infoIcon} />
                          Role
                        </div>
                        <div
                          className={styles.infoValue}
                          style={{ color: adminProfilesService.getRoleColor(profile.role, profile.is_super_admin) }}
                        >
                          {adminProfilesService.getRoleLabel(profile.role)}
                        </div>
                      </div>

                      <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>
                          <FiUser className={styles.infoIcon} />
                          Created By
                        </div>
                        <div className={styles.infoValue}>{profile.created_by_username}</div>
                      </div>

                      <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>
                          <FiCalendar className={styles.infoIcon} />
                          Created At
                        </div>
                        <div className={styles.infoValue}>
                          {adminProfilesService.formatDateTime(profile.created_at)}
                        </div>
                      </div>

                      <div className={styles.infoItem}>
                        <div className={styles.infoLabel}>
                          <FiCalendar className={styles.infoIcon} />
                          Updated At
                        </div>
                        <div className={styles.infoValue}>
                          {adminProfilesService.formatDateTime(profile.updated_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={styles.actions}>
                    <button onClick={() => setMode("edit")} className={styles.editBtn}>
                      <FiEdit /> Edit Profile
                    </button>
                    <button onClick={() => setMode("delete")} className={styles.deleteBtn}>
                      <FiTrash2 /> Delete Profile
                    </button>
                  </div>
                </>
              )}

              {/* Edit Mode */}
              {mode === "edit" && (
                <>
                  <div className={styles.form}>
                    {/* Role Selection */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        <FiShield className={styles.labelIcon} />
                        Role
                      </label>
                      <select value={editRole} onChange={(e) => setEditRole(e.target.value as any)} className={styles.select}>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>

                    {/* New Password */}
                    <div className={styles.formGroup}>
                      <label className={styles.label}>New Password (optional)</label>
                      <div className={styles.passwordContainer}>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="Leave empty to keep current password"
                          className={styles.input}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={styles.passwordToggle}
                        >
                          {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                      <p className={styles.hint}>Minimum 8 characters with uppercase, lowercase, and numbers</p>
                    </div>

                    {/* Active Status */}
                    <div className={styles.formGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={editIsActive}
                          onChange={(e) => setEditIsActive(e.target.checked)}
                          className={styles.checkbox}
                        />
                        <span>Active Status</span>
                      </label>
                    </div>

                    {/* Reason (if deactivating) */}
                    {!editIsActive && (
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Reason for Deactivation</label>
                        <textarea
                          value={editReason}
                          onChange={(e) => setEditReason(e.target.value)}
                          placeholder="Please provide a reason..."
                          className={styles.textarea}
                          rows={3}
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className={styles.actions}>
                    <button onClick={handleUpdate} disabled={saving} className={styles.saveBtn}>
                      <FiSave /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button onClick={handleCancelEdit} disabled={saving} className={styles.cancelBtn}>
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {/* Delete Mode */}
              {mode === "delete" && (
                <>
                  <div className={styles.deleteWarning}>
                    <FiAlertCircle className={styles.warningIcon} />
                    <h3>Are you sure you want to delete this admin?</h3>
                    <p>
                      This action will deactivate the admin account for <strong>{profile.username}</strong>. This action
                      cannot be undone.
                    </p>
                  </div>

                  <div className={styles.form}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Reason for Deletion *</label>
                      <textarea
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        placeholder="Please provide a reason for deletion..."
                        className={styles.textarea}
                        rows={4}
                        required
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={styles.actions}>
                    <button onClick={handleDelete} disabled={saving || !deleteReason.trim()} className={styles.confirmDeleteBtn}>
                      <FiTrash2 /> {saving ? "Deleting..." : "Confirm Delete"}
                    </button>
                    <button onClick={handleCancelDelete} disabled={saving} className={styles.cancelBtn}>
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminProfileModal;
