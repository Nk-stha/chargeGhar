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
import Skeleton from "../ui/Skeleton";

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
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.card}>
              <div style={{ padding: "20px" }}>
                 {/* Mocking the StatsCard layout loosely with skeleton */}
                 <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                    <Skeleton width={40} height={40} style={{ borderRadius: "50%" }} />
                    <Skeleton width={100} height={20} style={{ marginLeft: "10px" }} />
                 </div>
                 <Skeleton width={60} height={30} />
              </div>
            </div>
          ))}
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
