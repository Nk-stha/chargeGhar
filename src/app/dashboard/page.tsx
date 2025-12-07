"use client";

import React from "react";
import styles from "./dashboard.module.css";
import DashboardStats from "../../components/DashboardStatsCard/DashboardStats";
import RevenueChart from "../../components/RevenueChart";
import PopularPackages from "../../components/PopularPackageCard/PopularPackages";
import RecentTransactions from "../../components/RecentTransactionsCard/RecentTransactions";
import RentalOverTime from "../../components/RentalOverTimeCard/RentalsOverTime";
import StationUtilizationChart from "../../components/StationUtilizationChart";
import MonitorRentals from "../../components/MonitorRentalsCard/MonitorRentalsCard";
import RecentUpdates from "../../components/RecentUpdates/RecentUpdates";
import SystemHealth from "../../components/SystemHealth/SystemHealth";

const Dashboard: React.FC = () => {
  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <p>
          Welcome back, <span className={styles.adminName}>Admin 👋</span>
        </p>
      </header>

      {/* Top Statistics Row */}
      <section className={styles.topStats}>
        <DashboardStats />
      </section>

      {/* Revenue Chart + System Health side by side */}
      <section className={styles.twoColumnLarge}>
        <RevenueChart />
        <SystemHealth />
      </section>

      {/* Rental Over Time + Station Utilization side by side */}
      <section className={styles.twoColumn}>
        <RentalOverTime />
        <StationUtilizationChart />
      </section>

      {/* Monitor Rentals + Popular Packages side by side */}
      <section className={styles.twoColumn}>
        <MonitorRentals />
        <PopularPackages />
      </section>

      {/* Recent Transactions + Recent Updates side by side */}
      <section className={styles.twoColumn}>
        <RecentTransactions />
        <RecentUpdates />
      </section>
    </div>
  );
};

export default Dashboard;

