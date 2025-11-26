import React from "react";
import {
  FiDollarSign,
  FiUsers,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import StatsCard from "./StatsCard";
import { useDashboardData } from "../../contexts/DashboardDataContext";
import styles from "./DashboardStats.module.css";

interface Station {
  id: string;
  status: string;
}

const DashboardStats: React.FC = () => {
  const { dashboardData, loading, error } = useDashboardData();
  console.log(dashboardData);
  if (loading) {
    return (
      <>
        <StatsCard
          icon={<FiDollarSign />}
          title="Revenue Today"
          value="Loading..."
        />
        <StatsCard icon={<FiUsers />} title="Total Users" value="Loading..." />
        <StatsCard
          icon={<FiAlertCircle />}
          title="Pending Issues"
          value="Loading..."
        />
        <StatsCard icon={<FiUsers />} title="Admin Users" value="Loading..." />;
        <StatsCard
          icon={<FiCheckCircle />}
          title="Stations Active"
          value="Loading..."
        />
        ;
      </>
    );
  }

  if (error) {
    return (
      <>
        <StatsCard
          icon={<FiDollarSign />}
          title="Revenue Today"
          value="Error"
        />
        <StatsCard icon={<FiUsers />} title="Total Users" value="Error" />
        <StatsCard
          icon={<FiAlertCircle />}
          title="Pending Issues"
          value="Error"
        />
        <StatsCard icon={<FiUsers />} title="Admin Users" value="Error" />;
        <StatsCard
          icon={<FiCheckCircle />}
          title="Stations Active"
          value="Error"
        />
        ;
      </>
    );
  }

  const activeStations =
    dashboardData?.stations?.results?.filter(
      (station: Station) => station.status === "ONLINE",
    ) || [];
  
  return (
    <section className={styles.topStats}>
      <div className={styles.card}>
        <StatsCard
          icon={<FiDollarSign />}
          title="Revenue Today"
          value={`Rs.${dashboardData?.revenue_today || 0}`}
        />
      </div>
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
          value={dashboardData?.profiles?.length || 0}
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
  );
};

export default DashboardStats;
