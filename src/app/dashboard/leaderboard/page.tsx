"use client";

import React, { useState, useEffect } from "react";
import styles from "./leaderboard.module.css";
import Navbar from "../../../components/Navbar/Navbar";
import {
  FiTrendingUp,
  FiSearch,
  FiRefreshCw,
  FiAlertCircle,
  FiAward,
  FiUsers,
  FiStar,
  FiTarget,
  FiX,
} from "react-icons/fi";
import { rewardsService } from "../../../lib/api";
import type {
  Leaderboard,
  LeaderboardCategory,
  LeaderboardPeriod,
} from "../../../types/rewards.types";

const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<LeaderboardCategory>("overall");
  const [period, setPeriod] = useState<LeaderboardPeriod>("all_time");
  const [limit, setLimit] = useState<number>(50);

  useEffect(() => {
    fetchLeaderboard();
  }, [category, period, limit]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await rewardsService.getLeaderboard({
        category,
        period,
        limit,
      });

      if (response.success) {
        setLeaderboard(response.data);
      } else {
        setError("Failed to load leaderboard");
      }
    } catch (err: any) {
      console.error("Error fetching leaderboard:", err);
      const errorMessage =
        err.response?.data?.error?.message ||
        "Failed to load leaderboard. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaderboard = leaderboard?.leaderboard.filter((entry) =>
    entry.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getRankColor = (rank: number) => {
    if (rank === 1) return styles.rankGold;
    if (rank === 2) return styles.rankSilver;
    if (rank === 3) return styles.rankBronze;
    return styles.rankDefault;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getCategoryValue = (entry: any, cat: LeaderboardCategory) => {
    switch (cat) {
      case "overall":
        return `${entry.total_points_earned.toLocaleString()} pts`;
      case "points":
        return `${entry.total_points_earned.toLocaleString()} pts`;
      case "rentals":
        return `${entry.total_rentals.toLocaleString()} rentals`;
      case "referrals":
        return `${entry.referrals_count.toLocaleString()} referrals`;
      case "timely_returns":
        return `${entry.timely_returns.toLocaleString()} returns`;
      default:
        return "-";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Leaderboard</h1>
          <p className={styles.subtitle}>
            Top performing users across different categories
          </p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchLeaderboard}>
          <FiRefreshCw /> Refresh
        </button>
      </header>

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
          <p>Loading leaderboard...</p>
        </div>
      ) : leaderboard ? (
        <>
          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FiUsers />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Total Users</p>
                <h3 className={styles.statValue}>
                  {leaderboard.total_users.toLocaleString()}
                </h3>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FiTarget />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Category</p>
                <h3 className={styles.statValue}>
                  {rewardsService.getLeaderboardCategoryLabel(category)}
                </h3>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FiStar />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Period</p>
                <h3 className={styles.statValue}>
                  {rewardsService.getLeaderboardPeriodLabel(period)}
                </h3>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <FiAward />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Showing</p>
                <h3 className={styles.statValue}>
                  Top {leaderboard.leaderboard.length}
                </h3>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                className={styles.filterSelect}
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as LeaderboardCategory)
                }
              >
                <option value="overall">Overall</option>
                <option value="points">Points</option>
                <option value="rentals">Rentals</option>
                <option value="referrals">Referrals</option>
                <option value="timely_returns">Timely Returns</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="period">Period</label>
              <select
                id="period"
                className={styles.filterSelect}
                value={period}
                onChange={(e) =>
                  setPeriod(e.target.value as LeaderboardPeriod)
                }
              >
                <option value="all_time">All Time</option>
                <option value="monthly">This Month</option>
                <option value="weekly">This Week</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="limit">Show Top</label>
              <select
                id="limit"
                className={styles.filterSelect}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="search">Search</label>
              <div className={styles.searchContainer}>
                <FiSearch className={styles.searchIcon} />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <FiTrendingUp className={styles.icon} /> Rankings
              </h2>
              <p className={styles.cardSubText}>
                Showing top performers based on{" "}
                {rewardsService
                  .getLeaderboardCategoryLabel(category)
                  .toLowerCase()}{" "}
                for{" "}
                {rewardsService
                  .getLeaderboardPeriodLabel(period)
                  .toLowerCase()}
              </p>
            </div>

            {filteredLeaderboard && filteredLeaderboard.length === 0 ? (
              <div className={styles.emptyState}>
                <FiAward className={styles.emptyIcon} />
                <p>No users found</p>
                {searchTerm && (
                  <button
                    className={styles.clearSearch}
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>User</th>
                      <th>Total Rentals</th>
                      <th>Total Points</th>
                      <th>Referrals</th>
                      <th>Timely Returns</th>
                      <th>Achievements</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaderboard?.map((entry, index) => (
                      <tr key={index}>
                        <td>
                          <span className={getRankColor(entry.rank)}>
                            {getRankIcon(entry.rank)}
                          </span>
                        </td>
                        <td>
                          <span className={styles.username}>
                            {entry.username}
                          </span>
                        </td>
                        <td>
                          <span className={styles.value}>
                            {entry.total_rentals.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className={styles.pointsValue}>
                            {entry.total_points_earned.toLocaleString()} pts
                          </span>
                        </td>
                        <td>
                          <span className={styles.value}>
                            {entry.referrals_count.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className={styles.value}>
                            {entry.timely_returns.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className={styles.value}>
                            {entry.achievements_count.toLocaleString()}
                          </span>
                        </td>
                        <td className={styles.date}>
                          {formatDate(entry.last_updated)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Top 3 Podium */}
          {leaderboard.leaderboard.length >= 3 && (
            <section className={styles.podiumSection}>
              <h2 className={styles.sectionTitle}>
                <FiAward /> Top 3 Champions
              </h2>
              <div className={styles.podium}>
                {/* 2nd Place */}
                <div className={`${styles.podiumItem} ${styles.second}`}>
                  <div className={styles.podiumRank}>🥈</div>
                  <div className={styles.podiumUser}>
                    <h3>{leaderboard.leaderboard[1].username}</h3>
                    <p>Rank #{leaderboard.leaderboard[1].rank}</p>
                  </div>
                  <div className={styles.podiumValue}>
                    {getCategoryValue(leaderboard.leaderboard[1], category)}
                  </div>
                </div>

                {/* 1st Place */}
                <div className={`${styles.podiumItem} ${styles.first}`}>
                  <div className={styles.podiumRank}>🥇</div>
                  <div className={styles.podiumUser}>
                    <h3>{leaderboard.leaderboard[0].username}</h3>
                    <p>Rank #{leaderboard.leaderboard[0].rank}</p>
                  </div>
                  <div className={styles.podiumValue}>
                    {getCategoryValue(leaderboard.leaderboard[0], category)}
                  </div>
                </div>

                {/* 3rd Place */}
                <div className={`${styles.podiumItem} ${styles.third}`}>
                  <div className={styles.podiumRank}>🥉</div>
                  <div className={styles.podiumUser}>
                    <h3>{leaderboard.leaderboard[2].username}</h3>
                    <p>Rank #{leaderboard.leaderboard[2].rank}</p>
                  </div>
                  <div className={styles.podiumValue}>
                    {getCategoryValue(leaderboard.leaderboard[2], category)}
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      ) : (
        <div className={styles.emptyState}>
          <FiAward className={styles.emptyIcon} />
          <p>No leaderboard data available</p>
        </div>
      )}
    </div >
  );
};

export default LeaderboardPage;
