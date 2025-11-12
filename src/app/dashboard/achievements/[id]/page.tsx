"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./achievementDetail.module.css";
import Navbar from "../../../../components/Navbar/Navbar";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiAward,
  FiTarget,
  FiStar,
  FiUsers,
  FiUnlock,
  FiCheckCircle,
  FiActivity,
  FiRefreshCw,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";
import { rewardsService } from "../../../../lib/api";
import type {
  Achievement,
  UpdateAchievementInput,
  CriteriaType,
  RewardType,
} from "../../../../types/rewards.types";

const AchievementDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const achievementId = params.id as string;

  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<UpdateAchievementInput>({});

  useEffect(() => {
    fetchAchievement();
  }, [achievementId]);

  const fetchAchievement = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await rewardsService.getAchievement(achievementId);

      if (response.success) {
        setAchievement(response.data);
      } else {
        setError("Failed to load achievement");
      }
    } catch (err: any) {
      console.error("Error fetching achievement:", err);
      const errorMessage =
        err.response?.data?.error?.message ||
        "Failed to load achievement. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!achievement) return;

    setEditForm({
      name: achievement.name,
      description: achievement.description,
      criteria_type: achievement.criteria_type,
      criteria_value: achievement.criteria_value,
      reward_type: achievement.reward_type,
      reward_value: achievement.reward_value,
      is_active: achievement.is_active,
    });
    setShowEditModal(true);
  };

  const handleUpdateAchievement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!achievement) return;

    const validation = rewardsService.validateAchievement(editForm);
    if (!validation.valid) {
      setError(validation.error || "Invalid input");
      return;
    }

    try {
      setModalLoading(true);
      setError(null);

      const response = await rewardsService.updateAchievement(
        achievement.id,
        editForm,
      );

      if (response.success) {
        setSuccessMessage(
          `Achievement "${response.data.name}" updated successfully!`,
        );
        setShowEditModal(false);
        setEditForm({});
        fetchAchievement();
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err: any) {
      console.error("Error updating achievement:", err);
      const errorMessage =
        err.response?.data?.error?.message ||
        "Failed to update achievement. Please try again.";
      setError(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteAchievement = async () => {
    if (!achievement) return;

    try {
      setModalLoading(true);
      setError(null);

      const response = await rewardsService.deleteAchievement(achievement.id);

      if (response.success) {
        setSuccessMessage(
          `Achievement "${achievement.name}" deleted successfully!`,
        );
        setTimeout(() => {
          router.push("/dashboard/achievements");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Error deleting achievement:", err);
      const errorMessage =
        err.response?.data?.error?.message ||
        "Failed to delete achievement. Please try again.";
      setError(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className={styles.achievementDetailPage}>
        <Navbar />
        <main className={styles.container}>
          <div className={styles.loadingContainer}>
            <FiRefreshCw className={styles.spinner} />
            <p>Loading achievement...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !achievement) {
    return (
      <div className={styles.achievementDetailPage}>
        <Navbar />
        <main className={styles.container}>
          <div className={styles.errorContainer}>
            <FiAlertCircle className={styles.errorIcon} />
            <p className={styles.errorText}>{error}</p>
            <button
              onClick={() => router.push("/dashboard/achievements")}
              className={styles.backButton}
            >
              Back to Achievements
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!achievement) {
    return null;
  }

  return (
    <div className={styles.achievementDetailPage}>
      <Navbar />
      <main className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button
            className={styles.backButton}
            onClick={() => router.push("/dashboard/achievements")}
          >
            <FiArrowLeft /> Back to Achievements
          </button>

          <div className={styles.headerActions}>
            <button className={styles.editButton} onClick={handleEdit}>
              <FiEdit2 /> Edit
            </button>
            <button
              className={styles.deleteButton}
              onClick={() => setShowDeleteModal(true)}
            >
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className={styles.successBanner}>
            <FiCheckCircle /> {successMessage}
            <button
              className={styles.closeBanner}
              onClick={() => setSuccessMessage(null)}
            >
              <FiX />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={styles.errorBanner}>
            <FiAlertCircle /> {error}
            <button className={styles.closeBanner} onClick={() => setError(null)}>
              <FiX />
            </button>
          </div>
        )}

        {/* Achievement Details Card */}
        <div className={styles.detailCard}>
          <div className={styles.detailHeader}>
            <div className={styles.iconWrapper}>
              <FiAward className={styles.mainIcon} />
            </div>
            <div className={styles.titleSection}>
              <h1 className={styles.achievementName}>{achievement.name}</h1>
              <span
                className={`${styles.statusBadge} ${
                  achievement.is_active ? styles.active : styles.inactive
                }`}
              >
                {achievement.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <p className={styles.description}>{achievement.description}</p>

          {/* Main Info Grid */}
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <FiTarget />
              </div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Criteria Type</span>
                <span className={styles.infoValue}>
                  {rewardsService.getCriteriaTypeLabel(
                    achievement.criteria_type,
                  )}
                </span>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <FiActivity />
              </div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Criteria Value</span>
                <span className={styles.infoValue}>
                  {achievement.criteria_value}
                </span>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <FiStar />
              </div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Reward Type</span>
                <span className={styles.infoValue}>
                  {achievement.reward_type.charAt(0).toUpperCase() +
                    achievement.reward_type.slice(1)}
                </span>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoIcon}>
                <FiAward />
              </div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Reward Value</span>
                <span className={styles.infoValue}>
                  {achievement.reward_value} points
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiUnlock />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Total Unlocked</span>
              <span className={styles.statValue}>
                {achievement.total_unlocked.toLocaleString()}
              </span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiCheckCircle />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Total Claimed</span>
              <span className={styles.statValue}>
                {achievement.total_claimed.toLocaleString()}
              </span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiUsers />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Users In Progress</span>
              <span className={styles.statValue}>
                {achievement.total_users_progress.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Timestamps Card */}
        <div className={styles.timestampsCard}>
          <h3 className={styles.cardTitle}>Timeline</h3>
          <div className={styles.timestampsGrid}>
            <div className={styles.timestampItem}>
              <span className={styles.timestampLabel}>Created</span>
              <span className={styles.timestampValue}>
                {formatDate(achievement.created_at)}
              </span>
            </div>
            <div className={styles.timestampItem}>
              <span className={styles.timestampLabel}>Last Updated</span>
              <span className={styles.timestampValue}>
                {formatDate(achievement.updated_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => !modalLoading && setShowEditModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Edit Achievement</h2>
                <button
                  className={styles.closeModal}
                  onClick={() => setShowEditModal(false)}
                  disabled={modalLoading}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateAchievement} className={styles.modalForm}>
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label htmlFor="edit_name">Achievement Name *</label>
                    <input
                      type="text"
                      id="edit_name"
                      value={editForm.name || ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      placeholder="Enter achievement name"
                      required
                      minLength={3}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="edit_description">Description *</label>
                    <textarea
                      id="edit_description"
                      value={editForm.description || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter achievement description"
                      required
                      rows={3}
                      minLength={10}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="edit_criteria_type">Criteria Type *</label>
                    <select
                      id="edit_criteria_type"
                      value={editForm.criteria_type || "rental_count"}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          criteria_type: e.target.value as CriteriaType,
                        })
                      }
                      required
                    >
                      <option value="rental_count">Rental Count</option>
                      <option value="timely_return_count">Timely Returns</option>
                      <option value="referral_count">Referral Count</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="edit_criteria_value">Criteria Value *</label>
                    <input
                      type="number"
                      id="edit_criteria_value"
                      value={editForm.criteria_value || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          criteria_value: Number(e.target.value),
                        })
                      }
                      placeholder="Enter criteria value"
                      required
                      min="1"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="edit_reward_type">Reward Type *</label>
                    <select
                      id="edit_reward_type"
                      value={editForm.reward_type || "points"}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          reward_type: e.target.value as RewardType,
                        })
                      }
                      required
                    >
                      <option value="points">Points</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="edit_reward_value">Reward Points *</label>
                    <input
                      type="number"
                      id="edit_reward_value"
                      value={editForm.reward_value || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          reward_value: Number(e.target.value),
                        })
                      }
                      placeholder="Enter reward points"
                      required
                      min="1"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={editForm.is_active !== undefined ? editForm.is_active : true}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            is_active: e.target.checked,
                          })
                        }
                      />
                      <span>Active</span>
                    </label>
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowEditModal(false)}
                    disabled={modalLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={modalLoading}
                  >
                    {modalLoading ? "Updating..." : "Update Achievement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => !modalLoading && setShowDeleteModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Confirm Deletion</h2>
                <button
                  className={styles.closeModal}
                  onClick={() => setShowDeleteModal(false)}
                  disabled={modalLoading}
                >
                  ×
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.deleteWarning}>
                  <p className={styles.deleteQuestion}>
                    Are you sure you want to delete this achievement?
                  </p>
                  <div className={styles.achievementInfo}>
                    <strong>{achievement.name}</strong>
                    <p className={styles.achievementDesc}>
                      {achievement.description}
                    </p>
                  </div>
                  <p className={styles.warningText}>
                    This action will deactivate the achievement. It cannot be
                    undone.
                  </p>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowDeleteModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.deleteBtnModal}
                  onClick={handleDeleteAchievement}
                  disabled={modalLoading}
                >
                  {modalLoading ? "Deleting..." : "Delete Achievement"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AchievementDetailPage;
