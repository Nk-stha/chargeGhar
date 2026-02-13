"use client";

import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { FiSearch, FiX, FiAlertCircle } from "react-icons/fi";
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
  const [search, setSearch] = useState<string>("");

  const users = usersData?.results || [];

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    
    const q = search.trim().toLowerCase();
    return users.filter((user: any) => 
      (user.id && user.id.toString().includes(q)) ||
      (user.username && user.username.toLowerCase().includes(q)) ||
      (user.email && user.email.toLowerCase().includes(q)) ||
      (user.phone_number && user.phone_number.toLowerCase().includes(q)) ||
      (user.social_provider && user.social_provider.toLowerCase().includes(q))
    );
  }, [users, search]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!selectedUserId) {
      const errorMsg = "Please select a user";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!password || password.length < 8) {
      const errorMsg = "Password must be at least 8 characters long";
      setError(errorMsg);
      toast.error(errorMsg);
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
        const successMsg = response.data.message || "Admin profile created successfully!";
        setSuccessMessage(successMsg);
        toast.success(successMsg);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        const errorMsg = response.data.message || "Failed to create admin profile";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      // Parse error response
      let errorMsg = "Failed to create admin profile";
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Check for validation errors
        if (errorData.error?.code === "validation_error" && errorData.error?.context?.validation_errors) {
          const validationErrors = errorData.error.context.validation_errors;
          const errorMessages: string[] = [];

          Object.keys(validationErrors).forEach((field) => {
            const fieldErrors = validationErrors[field];
            
            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach((err: any) => {
                const msg = typeof err === 'string' ? err : (err.string || err.message || JSON.stringify(err));
                errorMessages.push(`${field}: ${msg}`);
                toast.error(`${field}: ${msg}`);
              });
            }
          });

          if (errorMessages.length > 0) {
            errorMsg = errorMessages.join("; ");
          } else {
            errorMsg = errorData.error?.message || errorMsg;
          }
        } else {
          errorMsg = errorData.message || errorData.error?.message || errorMsg;
        }
      } else {
        errorMsg = err.message || errorMsg;
      }
      
      setError(errorMsg);
      if (!err.response?.data?.error?.context?.validation_errors) {
        toast.error(errorMsg);
      }
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
            
            {/* Search Bar */}
            <div style={{ position: "relative", marginBottom: "0.5rem" }}>
              <FiSearch
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#777",
                  fontSize: "1rem",
                  zIndex: 1,
                }}
              />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={usersLoading || loading}
                style={{
                  width: "100%",
                  padding: "0.75rem 2.5rem 0.75rem 2.5rem",
                  background: "#1a1a1a",
                  border: "1px solid #2a2a2a",
                  borderRadius: "6px",
                  color: "#fff",
                  fontSize: "0.9rem",
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#aaa",
                    fontSize: "1.2rem",
                    cursor: "pointer",
                    padding: 0,
                    zIndex: 1,
                  }}
                  title="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>
            
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
              disabled={usersLoading || loading}
            >
              <option value="">-- Select a user --</option>
              {filteredUsers.length === 0 && search ? (
                <option value="" disabled>No users found</option>
              ) : (
                filteredUsers.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.username || "Unknown"} ({user.id || "N/A"}) - {user.social_provider || "Unknown"}
                  </option>
                ))
              )}
            </select>
            {search && filteredUsers.length > 0 && (
              <small style={{ color: "#888", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
                Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </small>
            )}
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
