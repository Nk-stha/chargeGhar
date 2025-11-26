import React from "react";
import { FiDollarSign, FiUsers, FiAlertCircle } from "react-icons/fi";
import StatsCard from "../../components/DashboardStatsCard/StatsCard";
import { useDashboardData } from "../../contexts/DashboardDataContext";
import styles from "./DashboardStats.module.css";

const DashboardStats: React.FC = () => {
  const { dashboardData, loading, error } = useDashboardData();

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
      </>
    );
  }

  return (
    <>
      <StatsCard
        icon={<FiDollarSign />}
        title="Revenue Today"
        value={`Rs.${dashboardData?.total_revenue || 0}`}
      />
      <StatsCard
        icon={<FiUsers />}
        title="Total Users"
        value={dashboardData?.total_users || 0}
      />
      <StatsCard
        icon={<FiAlertCircle />}
        title="Pending Issues"
        value={dashboardData?.recent_issues?.length || 0}
      />
    </>
  );
};

export default DashboardStats;
