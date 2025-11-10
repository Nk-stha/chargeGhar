"use client";

import React, { useState, useEffect } from "react";
import styles from "./profile.module.css";
import {
  FiUser,
  FiMail,
  FiShield,
  FiCalendar,
  FiRefreshCw,
  FiAlertCircle,
  FiUsers,
  FiMapPin,
  FiFileText,
  FiBarChart2,
  FiDollarSign,
  FiCheck,
  FiX,
} from "react-icons/fi";
import {
  adminMeService,
  CurrentAdminProfile,
  AdminPermissions,
} from "../../../lib/api/adminMe.service";

export default function ProfilePage() {
  const [profile, setProfile] = useState<CurrentAdminProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminMeService.getCurrentProfile();

      if (response.success) {
        setProfile(response.data);
      } else {
        setError("Failed to fetch profile data");
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getPermissionIcon = (key: keyof AdminPermissions) => {
    const icons: Record<keyof AdminPermissions, React.ReactNode> = {
      can_manage_users: <FiUsers />,
      can_manage_stations: <FiMapPin />,
      can_manage_content: <FiFileText />,
      can_view_analytics: <FiBarChart2 />,
      can_manage_finances: <FiDollarSign />,
      can_manage_admins: <FiShield />,
    };
    return icons[key] || <FiCheck />;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Profile</h1>
          <p className={styles.subtitle}>
            View your account information and permissions
          </p>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Profile</h1>
          <p className={styles.subtitle}>
            View your account information and permissions
          </p>
        </div>
        <div className={styles.errorContainer}>
          <FiAlertCircle className={styles.errorIcon} />
          <p className={styles.errorText}>{error}</p>
          <button onClick={fetchProfile} className={styles.retryBtn}>
            <FiRefreshCw /> Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Profile</h1>
          <p className={styles.subtitle}>
            View your account information and permissions
          </p>
        </div>
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>No profile data available</p>
        </div>
      </div>
    );
  }

  const enabledPermissionsCount = adminMeService.countEnabledPermissions(
    profile.permissions,
  );
  const totalPermissions = Object.keys(profile.permissions).length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Profile</h1>
          <p className={styles.subtitle}>
            View your account information and permissions
          </p>
        </div>
        <button
          onClick={fetchProfile}
          className={styles.refreshBtn}
          title="Refresh profile"
        >
          <FiRefreshCw />
        </button>
      </div>

      {/* Profile Card */}
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            <FiUser />
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.username}>{profile.username}</h2>
            <p className={styles.email}>{profile.email}</p>
          </div>
          <div className={styles.badges}>
            <span
              className={styles.roleBadge}
              style={{
                color: adminMeService.getRoleColor(
                  profile.role,
                  profile.is_super_admin,
                ),
              }}
            >
              <FiShield />
              {adminMeService.getRoleLabel(profile.role)}
            </span>
            <span
              className={`${styles.statusBadge} ${profile.is_active ? styles.statusActive : styles.statusInactive}`}
            >
              {adminMeService.getStatusLabel(profile.is_active)}
            </span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Account Information Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <FiUser className={styles.cardIcon} />
              Account Information
            </h3>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FiUser className={styles.infoIcon} />
                User ID
              </div>
              <div className={styles.infoValue}>{profile.user_id}</div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FiUser className={styles.infoIcon} />
                Username
              </div>
              <div className={styles.infoValue}>{profile.username}</div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FiMail className={styles.infoIcon} />
                Email Address
              </div>
              <div className={styles.infoValue}>{profile.email}</div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FiShield className={styles.infoIcon} />
                Role
              </div>
              <div
                className={styles.infoValue}
                style={{
                  color: adminMeService.getRoleColor(
                    profile.role,
                    profile.is_super_admin,
                  ),
                }}
              >
                {adminMeService.getRoleLabel(profile.role)}
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FiCalendar className={styles.infoIcon} />
                Account Created
              </div>
              <div className={styles.infoValue}>
                {adminMeService.formatDateTime(profile.created_at)}
                <span className={styles.infoSubtext}>
                  {adminMeService.getTimeSince(profile.created_at)}
                </span>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FiShield className={styles.infoIcon} />
                Account Status
              </div>
              <div
                className={styles.infoValue}
                style={{
                  color: adminMeService.getStatusColor(profile.is_active),
                }}
              >
                {adminMeService.getStatusLabel(profile.is_active)}
              </div>
            </div>
          </div>
        </div>

        {/* Permissions Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <FiShield className={styles.cardIcon} />
              Permissions
            </h3>
            <span className={styles.permissionCount}>
              {enabledPermissionsCount} / {totalPermissions}
            </span>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.permissionsGrid}>
              {(
                Object.keys(profile.permissions) as (keyof AdminPermissions)[]
              ).map((key) => {
                const hasPermission = profile.permissions[key];
                return (
                  <div
                    key={key}
                    className={`${styles.permissionItem} ${hasPermission ? styles.permissionEnabled : styles.permissionDisabled}`}
                  >
                    <div className={styles.permissionIcon}>
                      {getPermissionIcon(key)}
                    </div>
                    <div className={styles.permissionInfo}>
                      <span className={styles.permissionLabel}>
                        {adminMeService.getPermissionLabel(key)}
                      </span>
                      <span className={styles.permissionStatus}>
                        {hasPermission ? <FiCheck /> : <FiX />}
                        {hasPermission ? "Granted" : "Denied"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className={styles.infoBanner}>
        <FiAlertCircle className={styles.infoBannerIcon} />
        <div className={styles.infoBannerContent}>
          <p className={styles.infoBannerTitle}>Profile Management</p>
          <p className={styles.infoBannerText}>
            Your profile information and permissions are managed by super
            administrators. If you need to update your details or require
            additional permissions, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
