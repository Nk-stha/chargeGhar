"use client";

import React from "react";
import styles from "./dashboard.module.css";
import DashboardStats from "../../components/DashboardStatsCard/DashboardStats";
import RevenueChart from "../../components/RevenueChart";
import PopularPackages from "../../components/PopularPackageCard/PopularPackages";
import RecentTransactions from "../../components/RecentTransactionsCard/RecentTransactions";
import RentalOverTime from "../../components/RentalOverTimeCard/RentalsOverTime";

import MonitorRentals from "../../components/MonitorRentalsCard/MonitorRentalsCard";
import RecentUpdates from "../../components/RecentUpdates/RecentUpdates";
import SystemHealth from "../../components/SystemHealth/SystemHealth"; // Now a banner
import PaymentAnalyticsDashboard from "../../components/PaymentAnalytics/PaymentAnalyticsDashboard";
import PowerBankRentalAnalytics from "../../components/PowerBankRentalAnalytics/PowerBankRentalAnalytics";
import StationAnalytics from "../../components/StationAnalytics/StationAnalytics";
import UserAnalytics from "../../components/UserAnalytics/UserAnalytics";

const Dashboard: React.FC = () => {
    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <div className={styles.headerTitle}>
                    <h1>Dashboard</h1>
                    <p>
                        Welcome back, <span className={styles.adminName}>Admin</span>
                    </p>
                </div>
                <div className={styles.headerRight}>
                    <SystemHealth />
                </div>
            </header>

            {/* Top Cards Section */}
            <section className={styles.statsSection}>
                <DashboardStats />
            </section>

            {/* Main Content Grid */}
            <div className={styles.grid}>
                {/* Row 1: High Level Trends (Side by Side) */}
                <div className={`${styles.col6} ${styles.hFull}`}>
                    <RevenueChart />
                </div>
                <div className={`${styles.col6} ${styles.hFull}`}>
                    <RentalOverTime />
                </div>

                {/* Row 2: Analytics Dashboard */}
                <div className={`${styles.col12} ${styles.hFull}`}>
                    <StationAnalytics />
                </div>
                <div className={`${styles.col12} ${styles.hFull}`}>
                    <PowerBankRentalAnalytics />
                </div>
                <div className={`${styles.col12} ${styles.hFull}`}>
                     <UserAnalytics />
                </div>

                {/* Row 3: Activity Monitoring */}
                <div className={`${styles.col6} ${styles.hFull}`}>
                    <MonitorRentals />
                </div>
                <div className={`${styles.col6} ${styles.hFull}`}>
                    <PopularPackages />
                </div>

                {/* Row 4: Transactions & Updates */}
                <div className={`${styles.col6} ${styles.hFull}`}>
                    <RecentTransactions />
                </div>
                <div className={`${styles.col6} ${styles.hFull}`}>
                    <RecentUpdates />
                </div>

                {/* Row 5: Financial Insights */}
                <div className={`${styles.col12} ${styles.hFull}`}>
                     <PaymentAnalyticsDashboard />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

