"use client";

import React, { useState, useEffect } from "react";
import styles from "./profile.module.css";
import { FiUser } from "react-icons/fi";
import instance from "../../../lib/axios";

interface AdminProfile {
  id: string;
  role: string;
  is_active: boolean;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
  username: string;
  email: string;
  created_by_username: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get token and decode to find current user ID
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      // Decode JWT to get user_id
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentUserId = payload.user_id;

      // Fetch all admin profiles
      const response = await instance.get("/api/admin/profiles");

      if (response.data.success) {
        const profiles: AdminProfile[] = response.data.data;

        // Find current admin's profile by matching user_id with id
        // Note: The backend may use different ID formats, so we'll try to find by username or email
        // For now, we'll take the first profile if we can't match
        const currentProfile =
          profiles.find((p) => p.id === currentUserId) || profiles[0];

        if (currentProfile) {
          setProfile(currentProfile);
        } else {
          setError("Profile not found");
        }
      } else {
        setError("Failed to fetch profile data");
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getTimeSince = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "1 day ago";
      if (diffDays < 30) return `${diffDays} days ago`;
      if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return months === 1 ? "1 month ago" : `${months} months ago`;
      }
      const years = Math.floor(diffDays / 365);
      return years === 1 ? "1 year ago" : `${years} years ago`;
    } catch {
      return "—";
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.subtitle}>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.subtitle} style={{ color: "#ff4444" }}>
          {error}
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.subtitle}>No profile data available</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Profile</h1>
      <p className={styles.subtitle}>Manage your profile.</p>

      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>
          <FiUser className={styles.avatarIcon} />
        </div>
        <div className={styles.profileNameCard}>
          <span className={styles.profileName}>{profile.username}</span>
          <span className={styles.profileRole}>
            User Role: {profile.role.replace("_", " ").toUpperCase()}
            {profile.is_super_admin && " (Super Admin)"}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.profileContent}>
        {/* Left Card */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Admin Profile</h3>

          <div className={styles.formGroup}>
            <label>User ID:</label>
            <input type="text" value={profile.id} disabled />
          </div>

          <div className={styles.formGroup}>
            <label>Username:</label>
            <input type="text" value={profile.username} disabled />
          </div>

          <div className={styles.formGroup}>
            <label>Email:</label>
            <input type="email" value={profile.email} disabled />
          </div>

          <div className={styles.formGroup}>
            <label>Role:</label>
            <input
              type="text"
              value={profile.role.replace("_", " ").toUpperCase()}
              disabled
            />
          </div>

          <div className={styles.formGroup}>
            <label>Status:</label>
            <input
              type="text"
              value={profile.is_active ? "Active" : "Inactive"}
              disabled
              style={{
                color: profile.is_active ? "#32cd32" : "#ff4444",
              }}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Created By:</label>
            <input type="text" value={profile.created_by_username} disabled />
          </div>
        </div>

        {/* Right Card */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Account Information</h3>

          <div className={styles.infoSection}>
            <h4>Account Created</h4>
            <p>{formatDate(profile.created_at)}</p>
            <p className={styles.subInfo}>{getTimeSince(profile.created_at)}</p>
          </div>

          <div className={styles.infoSection}>
            <h4>Last Updated</h4>
            <p>{formatDate(profile.updated_at)}</p>
            <p className={styles.subInfo}>{getTimeSince(profile.updated_at)}</p>
          </div>

          <div className={styles.infoSection}>
            <h4>Account Type</h4>
            <p style={{ color: profile.is_super_admin ? "#32cd32" : "#ccc" }}>
              {profile.is_super_admin ? "Super Administrator" : "Administrator"}
            </p>
          </div>
        </div>
      </div>

      {/* Info Message */}
      <div className={styles.infoMessage}>
        <span>
          ℹ️ Profile information is managed by super administrators. Contact
          your administrator if you need to update your details.
        </span>
      </div>
    </div>
  );
}
