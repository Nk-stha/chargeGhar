"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./achievements.module.css";
import Navbar from "../../../components/Navbar/Navbar";
import {
  FiTrendingUp,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiAward,
  FiStar,
  FiTarget,
  FiEdit2,
  FiTrash2,
  FiX,
  FiUnlock,
  FiUsers,
  FiActivity,
} from "react-icons/fi";
import { rewardsService } from "../../../lib/api";
import type {
  Achievement,
  AchievementsAnalytics,
  CreateAchievementInput,
  UpdateAchievementInput,
  CriteriaType,
  RewardType,
} from "../../../types/rewards.types";

const AchievementsPage: React.FC = () => {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<
    Achievement[]
  >([]);
  const [analytics, setAnalytics] = useState<AchievementsAnalytics | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCriteria, setFilterCriteria] = useState<string>("all");
  const [filterActive, setFilterActive] = useState<string>("all");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<CreateAchievementInput>({
    name: "",
    description: "",
    criteria_type: "rental_count",
    criteria_value: 1,
    reward_type: "points",
    reward_value: 100,
    is_active: true,
  });

  const [editForm, setEditForm] = useState<UpdateAchievementInput>({});

  useEffect(() => {
    fetchData();
  }, [searchTerm, filterCriteria, filterActive]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both achievements list and analytics
      const filters: any = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterCriteria !== "all") filters.criteria_type = filterCriteria;
      if (filterActive !== "all") filters.is_active = filterActive === "active";

      const [achievementsResponse, analyticsResponse] = await Promise.all([
        rewardsService.getAchievements(filters),
        rewardsService.getAchievementsAnalytics(),
      ]);

      if (achievementsResponse.success) {
        setAchievements(achievementsResponse.data.results);
      }

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      }
    } catch (err: any) {
      console.error("Error fetching achievements data:", err);
      const errorMessage =
        err.response?.data?.error?.message ||
        "Failed to load achievements. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAchievement = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = rewardsService.validateAchievement(createForm);
    if (!validation.valid) {
      setError(validation.error || "Invalid input");
      return;
    }

    try {
      setModalLoading(true);
      setError(null);

      const response = await rewardsService.createAchievement(createForm);

      if (response.success) {
        setSuccessMessage(
          `Achievement "${response.data.name}" created successfully!`,
        );
        setShowCreateModal(false);
        setCreateForm({
          name: "",
          description: "",
          criteria_type: "rental_count",
          criteria_value: 1,
          reward_type: "points",
          reward_value: 100,
          is_active: true,
        });
        fetchData();
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err: any) {
      console.error("Error creating achievement:", err);
      const errorMessage =
        err.response?.data?.error?.message ||
        "Failed to create achievement. Please try again.";
      setError(errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateAchievement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAchievement) return;

    const validation = rewardsService.validateAchievement(editForm);
    if (!validation.valid) {
      setError(validation.error || "Invalid input");
      return;
    }

    try {
      setModalLoading(true);
      setError(null);

      const response = await rewardsService.updateAchievement(
        selectedAchievement.id,
        editForm,
      );

      if (response.success) {
        setSuccessMessage(
          `Achievement "${response.data.name}" updated successfully!`,
        );
        setShowEditModal(false);
        setSelectedAchievement(null);
        setEditForm({});
        fetchData();
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
    if (!selectedAchievement) return;

    try {
      setModalLoading(true);
      setError(null);

      const response = await rewardsService.deleteAchievement(
        selectedAchievement.id,
      );

      if (response.success) {
        setSuccessMessage(
          `Achievement "${selectedAchievement.name}" deleted successfully!`,
        );
        setShowDeleteModal(false);
        setSelectedAchievement(null);
        fetchData();
        setTimeout(() => setSuccessMessage(null), 5000);
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

  const openEditModal = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
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

  const openDeleteModal = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCriteriaIcon = (type: CriteriaType) => {
    switch (type) {
      case "rental_count":
        return "🚗";
      case "timely_return_count":
        return "⏰";
      case "referral_count":
        return "👥";
      default:
        return "🎯";
    }
  };

  return (
    <div className={styles.achievementsPage}>
      <Navbar />
      <main className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Achievements</h1>
            <p className={styles.subtitle}>
              Manage rewards and badges for user accomplishments
            </p>
          </div>
          <button
            className={styles.addButton}
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus /> Create Achievement
          </button>
        </header>

        {successMessage && (
          <div className={styles.successBanner}>
            <FiCheckCircle /> {successMessage}
            <button
              className={styles.closeError}
              onClick={() => setSuccessMessage(null)}
            >
              <FiX />
            </button>
          </div>
        )}

        {error && (
          <div className={styles.errorBanner}>
            <FiAlertCircle /> {error}
            <button
              className={styles.closeError}
              onClick={() => setError(null)}
            >
              <FiX />
            </button>
          </div>
        )}

        {loading ? (
          <div className={styles.loadingContainer}>
            <FiRefreshCw className={styles.spinner} />
            <p>Loading achievements...</p>
          </div>
        ) : (
          <>
            {/* Analytics Stats Cards */}
            {analytics && (
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <FiAward />
                  </div>
                  <div className={styles.statContent}>
                    <p className={styles.statLabel}>Total Achievements</p>
                    <h3 className={styles.statValue}>
                      {analytics.total_achievements}
                    </h3>
                    <p className={styles.statSubtext}>
                      {analytics.active_achievements} active
                    </p>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <FiUnlock />
                  </div>
                  <div className={styles.statContent}>
                    <p className={styles.statLabel}>Total Unlocked</p>
                    <h3 className={styles.statValue}>
                      {analytics.user_achievements.total_unlocked.toLocaleString()}
                    </h3>
                    <p className={styles.statSubtext}>
                      {analytics.user_achievements.pending_claims} pending
                    </p>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <FiStar />
                  </div>
                  <div className={styles.statContent}>
                    <p className={styles.statLabel}>Claimed</p>
                    <h3 className={styles.statValue}>
                      {analytics.user_achievements.total_claimed.toLocaleString()}
                    </h3>
                    <p className={styles.statSubtext}>
                      {analytics.user_achievements.claim_rate.toFixed(1)}% claim
                      rate
                    </p>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <FiUsers />
                  </div>
                  <div className={styles.statContent}>
                    <p className={styles.statLabel}>User Achievements</p>
                    <h3 className={styles.statValue}>
                      {analytics.total_points_awarded.toLocaleString()} pts
                    </h3>
                    <p className={styles.statSubtext}>Total points awarded</p>
                  </div>
                </div>
              </div>
            )}

            {/* Filters and Search */}
            <div className={styles.controls}>
              <div className={styles.searchContainer}>
                <FiSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search achievements..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                  className={styles.searchInput}
                />
              </div>
              <select
                className={styles.filterSelect}
                value={filterCriteria}
                onChange={(e) => setFilterCriteria(e.target.value)}
              >
                <option value="all">All Criteria Types</option>
                <option value="rental_count">Rental Count</option>
                <option value="timely_return_count">Timely Returns</option>
                <option value="referral_count">Referral Count</option>
              </select>
              <select
                className={styles.filterSelect}
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button className={styles.refreshBtn} onClick={fetchData}>
                <FiRefreshCw />
              </button>
            </div>

            {/* Achievement Cards Grid */}
            {achievements.length === 0 ? (
              <div className={styles.emptyState}>
                <FiTrendingUp className={styles.emptyIcon} />
                <p>No achievements found</p>
                {(searchTerm ||
                  filterCriteria !== "all" ||
                  filterActive !== "all") && (
                  <button
                    className={styles.clearSearch}
                    onClick={() => {
                      setSearchTerm("");
                      setFilterCriteria("all");
                      setFilterActive("all");
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.achievementsGrid}>
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={styles.achievementCard}
                    onClick={() =>
                      router.push(`/dashboard/achievements/${achievement.id}`)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <div className={styles.achievementHeader}>
                      <div className={styles.achievementIcon}>
                        {getCriteriaIcon(achievement.criteria_type)}
                      </div>
                      <span
                        className={
                          achievement.is_active
                            ? styles.statusActive
                            : styles.statusInactive
                        }
                      >
                        {achievement.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <h3 className={styles.achievementName}>
                      {achievement.name}
                    </h3>
                    <p className={styles.achievementDescription}>
                      {achievement.description}
                    </p>

                    <div className={styles.achievementCriteria}>
                      <FiTarget className={styles.criteriaIcon} />
                      <span>
                        {rewardsService.getCriteriaTypeLabel(
                          achievement.criteria_type,
                        )}
                        : {achievement.criteria_value}
                      </span>
                    </div>

                    <div className={styles.achievementReward}>
                      <FiStar className={styles.rewardIcon} />
                      <span>{achievement.reward_value} points</span>
                    </div>

                    <div className={styles.achievementStats}>
                      <div className={styles.statItem}>
                        <span className={styles.statValue}>
                          {achievement.total_unlocked}
                        </span>
                        <span className={styles.statLabel}>Unlocked</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statValue}>
                          {achievement.total_claimed}
                        </span>
                        <span className={styles.statLabel}>Claimed</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statValue}>
                          {achievement.total_users_progress}
                        </span>
                        <span className={styles.statLabel}>In Progress</span>
                      </div>
                    </div>

                    <div className={styles.achievementActions}>
                      <button
                        className={styles.editBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(achievement);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(achievement);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Top Achievements Section */}
            {analytics && analytics.most_unlocked_achievements.length > 0 && (
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>
                    <FiTrendingUp className={styles.icon} /> Most Unlocked
                    Achievements
                  </h2>
                  <p className={styles.cardSubText}>
                    Achievements with the highest unlock count
                  </p>
                </div>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Achievement</th>
                        <th>Unlock Count</th>
                        <th>Reward</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.most_unlocked_achievements.map(
                        (achievement) => (
                          <tr key={achievement.achievement_id}>
                            <td>
                              <span className={styles.achievementNameTable}>
                                {achievement.name}
                              </span>
                            </td>
                            <td>
                              <span className={styles.unlockCount}>
                                {achievement.unlock_count.toLocaleString()}{" "}
                                unlocks
                              </span>
                            </td>
                            <td>
                              <span className={styles.rewardValue}>
                                {achievement.reward_value} pts
                              </span>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}

        {/* Create Achievement Modal */}
        {showCreateModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowCreateModal(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Create New Achievement</h2>
                <button
                  className={styles.closeModal}
                  onClick={() => setShowCreateModal(false)}
                  disabled={modalLoading}
                >
                  ×
                </button>
              </div>
              <form
                onSubmit={handleCreateAchievement}
                className={styles.modalForm}
              >
                <div className={styles.formGroup}>
                  <label htmlFor="name">Achievement Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    placeholder="Enter achievement name"
                    required
                    minLength={3}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
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
                  <label htmlFor="criteria_type">Criteria Type *</label>
                  <select
                    id="criteria_type"
                    value={createForm.criteria_type}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
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
                  <label htmlFor="criteria_value">Criteria Value *</label>
                  <input
                    type="number"
                    id="criteria_value"
                    value={createForm.criteria_value}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        criteria_value: Number(e.target.value),
                      })
                    }
                    placeholder="Enter criteria value"
                    required
                    min="1"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="reward_type">Reward Type *</label>
                  <select
                    id="reward_type"
                    value={createForm.reward_type}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        reward_type: e.target.value as RewardType,
                      })
                    }
                    required
                  >
                    <option value="points">Points</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="reward_value">Reward Points *</label>
                  <input
                    type="number"
                    id="reward_value"
                    value={createForm.reward_value}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
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
                      checked={createForm.is_active}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          is_active: e.target.checked,
                        })
                      }
                    />
                    <span>Active</span>
                  </label>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowCreateModal(false)}
                    disabled={modalLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={modalLoading}
                  >
                    {modalLoading ? (
                      <>
                        <FiRefreshCw className={styles.spin} /> Creating...
                      </>
                    ) : (
                      <>
                        <FiPlus /> Create Achievement
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Achievement Modal */}
        {showEditModal && selectedAchievement && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowEditModal(false)}
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
              <form
                onSubmit={handleUpdateAchievement}
                className={styles.modalForm}
              >
                <div className={styles.formGroup}>
                  <label htmlFor="edit_name">Achievement Name</label>
                  <input
                    type="text"
                    id="edit_name"
                    value={editForm.name || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    placeholder="Enter achievement name"
                    minLength={3}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="edit_description">Description</label>
                  <textarea
                    id="edit_description"
                    value={editForm.description || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    placeholder="Enter achievement description"
                    rows={3}
                    minLength={10}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="edit_criteria_value">Criteria Value</label>
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
                    min="1"
                  />
                  <small className={styles.helpText}>
                    Criteria Type:{" "}
                    {rewardsService.getCriteriaTypeLabel(
                      selectedAchievement.criteria_type,
                    )}
                  </small>
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
                      checked={
                        editForm.is_active ?? selectedAchievement.is_active
                      }
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
                    {modalLoading ? (
                      <>
                        <FiRefreshCw className={styles.spin} /> Updating...
                      </>
                    ) : (
                      <>
                        <FiEdit2 /> Update Achievement
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedAchievement && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowDeleteModal(false)}
          >
            <div
              className={styles.modalSmall}
              onClick={(e) => e.stopPropagation()}
            >
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
                    <strong>{selectedAchievement?.name}</strong>
                    <p className={styles.achievementDesc}>
                      {selectedAchievement?.description}
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
                  {modalLoading ? (
                    <>
                      <FiRefreshCw className={styles.spin} /> Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 /> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AchievementsPage;
