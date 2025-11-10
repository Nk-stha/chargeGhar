"use client";

import React, { useState, useEffect } from "react";
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
  FiZap,
  FiTarget,
  FiLock,
  FiUnlock,
} from "react-icons/fi";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  points_reward: number;
  total_unlocked: number;
  total_users: number;
  unlock_criteria: string;
  status: "active" | "inactive";
  created_at: string;
}

interface AchievementStats {
  total_achievements: number;
  total_unlocks: number;
  most_popular: string;
  average_unlocks_per_user: number;
}

const AchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<
    Achievement[]
  >([]);
  const [stats, setStats] = useState<AchievementStats>({
    total_achievements: 0,
    total_unlocks: 0,
    most_popular: "",
    average_unlocks_per_user: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRarity, setFilterRarity] = useState<string>("all");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  useEffect(() => {
    if (!Array.isArray(achievements)) {
      setFilteredAchievements([]);
      return;
    }

    let filtered = achievements;

    if (searchTerm) {
      filtered = filtered.filter(
        (achievement) =>
          achievement?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          achievement?.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    if (filterRarity !== "all") {
      filtered = filtered.filter(
        (achievement) => achievement.rarity === filterRarity,
      );
    }

    setFilteredAchievements(filtered);
  }, [searchTerm, filterRarity, achievements]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulated data - replace with actual API call
      // const response = await axiosInstance.get("/api/admin/achievements");

      // Mock data for demonstration
      const mockAchievements: Achievement[] = [
        {
          id: "1",
          name: "First Rental",
          description: "Complete your first power bank rental",
          icon: "🎯",
          rarity: "common",
          points_reward: 100,
          total_unlocked: 1543,
          total_users: 2000,
          unlock_criteria: "Complete 1 rental",
          status: "active",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Speed Demon",
          description: "Complete 10 rentals within 24 hours",
          icon: "⚡",
          rarity: "rare",
          points_reward: 500,
          total_unlocked: 234,
          total_users: 2000,
          unlock_criteria: "Complete 10 rentals in 24 hours",
          status: "active",
          created_at: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Marathon User",
          description: "Use power banks for 100 total hours",
          icon: "🏃",
          rarity: "epic",
          points_reward: 1000,
          total_unlocked: 87,
          total_users: 2000,
          unlock_criteria: "100 hours of total usage",
          status: "active",
          created_at: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Legend",
          description: "Complete 1000 successful rentals",
          icon: "👑",
          rarity: "legendary",
          points_reward: 5000,
          total_unlocked: 12,
          total_users: 2000,
          unlock_criteria: "Complete 1000 rentals",
          status: "active",
          created_at: new Date().toISOString(),
        },
        {
          id: "5",
          name: "Early Bird",
          description: "Complete a rental before 6 AM",
          icon: "🌅",
          rarity: "rare",
          points_reward: 300,
          total_unlocked: 456,
          total_users: 2000,
          unlock_criteria: "Rental before 6 AM",
          status: "active",
          created_at: new Date().toISOString(),
        },
        {
          id: "6",
          name: "Social Butterfly",
          description: "Refer 10 friends successfully",
          icon: "🦋",
          rarity: "epic",
          points_reward: 2000,
          total_unlocked: 145,
          total_users: 2000,
          unlock_criteria: "10 successful referrals",
          status: "active",
          created_at: new Date().toISOString(),
        },
      ];

      const mockStats: AchievementStats = {
        total_achievements: mockAchievements.length,
        total_unlocks: mockAchievements.reduce(
          (sum, a) => sum + a.total_unlocked,
          0,
        ),
        most_popular: "First Rental",
        average_unlocks_per_user: 3.8,
      };

      const achievementsData = Array.isArray(mockAchievements)
        ? mockAchievements
        : [];
      setAchievements(achievementsData);
      setFilteredAchievements(achievementsData);
      setStats(mockStats);
    } catch (err: any) {
      console.error("Error fetching achievements:", err);
      setError("Failed to load achievements. Please try again.");
      setAchievements([]);
      setFilteredAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return styles.rarityCommon;
      case "rare":
        return styles.rarityRare;
      case "epic":
        return styles.rarityEpic;
      case "legendary":
        return styles.rarityLegendary;
      default:
        return styles.rarityCommon;
    }
  };

  const getUnlockPercentage = (unlocked: number, total: number) => {
    return ((unlocked / total) * 100).toFixed(1);
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
            onClick={() => alert("Add achievement feature coming soon")}
          >
            <FiPlus /> Create Achievement
          </button>
        </header>

        {successMessage && (
          <div className={styles.successBanner}>
            <FiCheckCircle /> {successMessage}
          </div>
        )}

        {error && (
          <div className={styles.errorBanner}>
            <FiAlertCircle /> {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiAward />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Total Achievements</p>
              <h3 className={styles.statValue}>{stats.total_achievements}</h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiUnlock />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Total Unlocks</p>
              <h3 className={styles.statValue}>
                {stats.total_unlocks.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiStar />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Most Popular</p>
              <h3 className={styles.statValue}>{stats.most_popular}</h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiTarget />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Avg Unlocks/User</p>
              <h3 className={styles.statValue}>
                {stats.average_unlocks_per_user.toFixed(1)}
              </h3>
            </div>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select
            className={styles.filterSelect}
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
          <button className={styles.refreshBtn} onClick={fetchAchievements}>
            <FiRefreshCw />
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <FiRefreshCw className={styles.spinner} />
            <p>Loading achievements...</p>
          </div>
        ) : filteredAchievements.length === 0 ? (
          <div className={styles.emptyState}>
            <FiTrendingUp className={styles.emptyIcon} />
            <p>No achievements found</p>
            {(searchTerm || filterRarity !== "all") && (
              <button
                className={styles.clearSearch}
                onClick={() => {
                  setSearchTerm("");
                  setFilterRarity("all");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className={styles.achievementsGrid}>
            {Array.isArray(filteredAchievements) &&
              filteredAchievements.map((achievement) => (
                <div key={achievement.id} className={styles.achievementCard}>
                  <div className={styles.achievementHeader}>
                    <div className={styles.achievementIcon}>
                      {achievement.icon}
                    </div>
                    <span className={getRarityColor(achievement.rarity)}>
                      {achievement.rarity}
                    </span>
                  </div>

                  <h3 className={styles.achievementName}>{achievement.name}</h3>
                  <p className={styles.achievementDescription}>
                    {achievement.description}
                  </p>

                  <div className={styles.achievementCriteria}>
                    <FiTarget className={styles.criteriaIcon} />
                    <span>{achievement.unlock_criteria}</span>
                  </div>

                  <div className={styles.achievementReward}>
                    <FiZap className={styles.rewardIcon} />
                    <span>{achievement.points_reward} points</span>
                  </div>

                  <div className={styles.achievementStats}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${getUnlockPercentage(
                            achievement.total_unlocked,
                            achievement.total_users,
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className={styles.progressText}>
                      <span className={styles.unlockCount}>
                        {achievement.total_unlocked.toLocaleString()} unlocks
                      </span>
                      <span className={styles.unlockPercent}>
                        {getUnlockPercentage(
                          achievement.total_unlocked,
                          achievement.total_users,
                        )}
                        %
                      </span>
                    </div>
                  </div>

                  <div className={styles.achievementActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() =>
                        alert("Edit achievement feature coming soon")
                      }
                    >
                      Edit
                    </button>
                    <button
                      className={styles.viewBtn}
                      onClick={() => alert("View details feature coming soon")}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AchievementsPage;
