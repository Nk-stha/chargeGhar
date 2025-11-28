import React from "react";
import {
  FiUsers,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import StatsCard from "./StatsCard";
import RevenueCard from "./RevenueCard";
import { useDashboardData } from "../../contexts/DashboardDataContext";
import styles from "./DashboardStats.module.css";

interface Station {
  id: string;
  status: string;
}

const DashboardStats: React.FC = () => {
  const { dashboardData, profilesData, loading, error } = useDashboardData();
  console.log(dashboardData);
  if (loading) {
    return (
      <>
        <section className={styles.revenueCard}>
          <RevenueCard value="Loading..." />
        </section>
        <section className={styles.statsGrid}>
          <div className={styles.card}>
            <StatsCard icon={<FiUsers />} title="Total Users" value="Loading..." />
          </div>
          <div className={styles.card}>
            <StatsCard icon={<FiAlertCircle />} title="Pending Issues" value="Loading..." />
          </div>
          <div className={styles.card}>
            <StatsCard icon={<FiUsers />} title="Admin Users" value="Loading..." />
          </div>
          <div className={styles.card}>
            <StatsCard icon={<FiCheckCircle />} title="Total Stations" value="Loading..." />
          </div>
        </section>
      </>
    );
  }

  if (error) {
    return (
      <>
        <section className={styles.revenueCard}>
          <RevenueCard value="Error" />
        </section>
        <section className={styles.statsGrid}>
          <div className={styles.card}>
            <StatsCard icon={<FiUsers />} title="Total Users" value="Error" />
          </div>
          <div className={styles.card}>
            <StatsCard icon={<FiAlertCircle />} title="Pending Issues" value="Error" />
          </div>
          <div className={styles.card}>
            <StatsCard icon={<FiUsers />} title="Admin Users" value="Error" />
          </div>
          <div className={styles.card}>
            <StatsCard icon={<FiCheckCircle />} title="Total Stations" value="Error" />
          </div>
        </section>
      </>
    );
  }

  const activeStations =
    dashboardData?.stations?.results?.filter(
      (station: Station) => station.status === "ONLINE",
    ) || [];

  return (
    <>
      {/* Revenue Card - Full Width on Mobile */}
      <section className={styles.revenueCard}>
        <RevenueCard
          value={`Rs. ${dashboardData?.revenue_today?.toLocaleString() || 0}`}
        />
      </section>

      {/* Other Stats - 2x2 Grid on Mobile */}
      <section className={styles.statsGrid}>
        <div className={styles.card}>
          <StatsCard
            icon={<FiUsers />}
            title="Total Users"
            value={dashboardData?.total_users || 0}
          />
        </div>
        <div className={styles.card}>
          <StatsCard
            icon={<FiAlertCircle />}
            title="Pending Issues"
            value={dashboardData?.recent_issues?.length || 0}
          />
        </div>
        <div className={styles.card}>
          <StatsCard
            icon={<FiUsers />}
            title="Admin Users"
            value={Array.isArray(profilesData) ? profilesData.length : 0}
          />
        </div>
        <div className={styles.card}>
          <StatsCard
            icon={<FiCheckCircle />}
            title="Total Stations"
            value={dashboardData?.total_stations}
          />
        </div>
      </section>
    </>
  );
};

export default DashboardStats;