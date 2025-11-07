"use client";

import React from "react";
import styles from "./dashboard.module.css";
import Navbar from "../../components/Navbar/Navbar";
import DashboardStats from "../../components/DashboardStatsCard/DashboardStats";
import RevenueChart from "../../components/RevenueChart";
import PopularPackages from "../../components/PopularPackageCard/PopularPackages";
import RecentTransactions from "../../components/RecentTransactionsCard/RecentTransactions";
import RentalOverTime from "../../components/RentalOverTimeCard/RentalsOverTime";
import StationUtilizationChart from "../../components/StationUtilizationChart";
import MonitorRentals from "../../components/MonitorRentalsCard/MonitorRentalsCard";
import RecentUpdates from "../../components/RecentUpdates/RecentUpdates";

const Dashboard: React.FC = () => {
    return (
        <div className={styles.dashboardPage}>
            <Navbar />
            <div className={styles.dashboardContainer}>
                <header className={styles.header}>
                    <h1>Dashboard</h1>
                    <p>Welcome back, <span className={styles.adminName}>Admin 👋</span></p>
                </header>

                {/* Top Statistics Row */}
                <section className={styles.topStats}>
                    <DashboardStats />
                </section>

                {/* Revenue Section */}
                <section className={styles.revenueSection}>
                    <RevenueChart />
                </section>

                {/* Popular Packages + Recent Transactions side by side */}
                <section className={styles.twoColumn}>
                    <PopularPackages />
                    <RecentTransactions />
                </section>

                {/* Rental Over Time + Station Utilization side by side */}
                <section className={styles.twoColumn}>
                    <RentalOverTime />
                    <StationUtilizationChart />
                </section>

                {/* Monitor Rentals and Recent Updates stacked */}
                <section className={styles.bottomSection}>
                    <MonitorRentals />
                    <RecentUpdates />
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
