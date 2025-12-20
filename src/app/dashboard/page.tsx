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
import SystemHealth from "../../components/SystemHealth/SystemHealth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/Tabs";
import PaymentAnalyticsDashboard from "../../components/PaymentAnalytics/PaymentAnalyticsDashboard";
import PowerBankRentalAnalytics from "../../components/PowerBankRentalAnalytics/PowerBankRentalAnalytics";
import StationAnalytics from "../../components/StationAnalytics/StationAnalytics";
import UserAnalytics from "../../components/UserAnalytics/UserAnalytics";

const Dashboard: React.FC = () => {
  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <p>
          Welcome back, <span className={styles.adminName}>Admin</span>
        </p>
      </header>
      
      <section className={styles.topStats}>
        <DashboardStats />
      </section>
      
      <Tabs defaultValue="system">
        <TabsList>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="rentals">Rentals</TabsTrigger>
            <TabsTrigger value="stations">Stations</TabsTrigger>
        </TabsList>

        <TabsContent value="system">
             <section className={styles.twoColumn}>
                <SystemHealth />
                <RecentUpdates />
             </section>
        </TabsContent>

        <TabsContent value="revenue">
             <section className={styles.fullWidth}>
                <PaymentAnalyticsDashboard />
             </section>
             <section className={styles.twoColumnLarge}>
                <RevenueChart />
             </section>
             <section className={styles.twoColumn}>
                <PopularPackages />
                <RecentTransactions />
             </section>
             <section className={styles.fullWidth}>
                <UserAnalytics />
             </section>
        </TabsContent>

        <TabsContent value="rentals">
             <section className={styles.fullWidth}>
                <PowerBankRentalAnalytics />
             </section>
             <section className={styles.twoColumnLarge}>
                <MonitorRentals />
             </section>
             <section className={styles.twoColumnLarge}>
                <RentalOverTime />
             </section>
        </TabsContent>

        <TabsContent value="stations">
            <section className={styles.fullWidth}>
                <StationAnalytics />
            </section>
        </TabsContent>
        </Tabs>
    </div>
  );
};

export default Dashboard;

