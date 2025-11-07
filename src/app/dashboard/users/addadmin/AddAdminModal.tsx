"use client";

import React, { useState } from "react";
import styles from "./AddAdminModal.module.css";
import instance from "../../../../lib/axios";
import { useDashboardData } from "../../../../contexts/DashboardDataContext";
import { getCsrfToken } from "../../../../lib/axios";

interface AddAdminModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAdminModal({
  onClose,
  onSuccess,
}: AddAdminModalProps) {
  const { usersData, loading: usersLoading } = useDashboardData();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [role, setRole] = useState<string>("admin");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const users = usersData?.results || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!selectedUserId) {
      setError("Please select a user");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const csrfToken = getCsrfToken();

      const response = await instance.post(
        "/api/admin/profiles",
        {
          user: parseInt(selectedUserId),
          role: role,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFTOKEN": csrfToken || "",
          },
        },
      );

      if (response.data.success) {
        setSuccessMessage("Admin profile created successfully!");
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError(response.data.message || "Failed to create admin profile");
      }
    } catch (err: any) {
      console.error("Error creating admin profile:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to create admin profile";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Create Admin Profile</h2>
        <p className={styles.subtitle}>
          Select a user and assign them an admin role
        </p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>
              Select User <span className={styles.required}>*</span>
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
              disabled={usersLoading || loading}
            >
              <option value="">-- Select a user --</option>
              {users.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.id}) - {user.social_provider}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>
              Role <span className={styles.required}>*</span>
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              disabled={loading}
            >
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>
              Password <span className={styles.required}>*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password (min 8 characters)"
              required
              minLength={8}
              disabled={loading}
            />
            <small className={styles.hint}>
              This password will be used for the admin to login
            </small>
          </div>

          <div className={styles.buttons}>
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
              className={styles.createBtn}
              disabled={loading || !selectedUserId || !password}
            >
              {loading ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
