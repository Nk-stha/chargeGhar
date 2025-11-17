"use client";

import React, { useState } from "react";
import styles from "./dashboard.module.css";
import Header from "../../components/Header/Header";
import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleContentClick = () => {
    // Close sidebar when clicking on main content area
    if (mobileMenuOpen) {
      closeMobileMenu();
    }
  };

  return (
    <div className={styles.dashboardPage}>
      <Header onMenuToggle={toggleMobileMenu} menuOpen={mobileMenuOpen} />
      <DashboardSidebar mobileOpen={mobileMenuOpen} onMobileClose={closeMobileMenu} />
      <div 
        className={styles.dashboardContainer}
        onClick={handleContentClick}
        style={{ cursor: mobileMenuOpen ? 'pointer' : 'default' }}
      >
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
    </div>
  );
};

export default Dashboard;
