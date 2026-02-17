"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./dashboard.module.css";
import { FiFilter, FiChevronDown } from "react-icons/fi";
import DashboardStats from "../../components/DashboardStatsCard/DashboardStats";
import RevenueChart from "../../components/RevenueChart";
import RecentTransactions from "../../components/RecentTransactionsCard/RecentTransactions";
import RentalOverTime from "../../components/RentalOverTimeCard/RentalsOverTime";
import MonitorRentals from "../../components/MonitorRentalsCard/MonitorRentalsCard";
import RecentUpdates from "../../components/RecentUpdates/RecentUpdates";
import SystemHealth from "../../components/SystemHealth/SystemHealth";
import PaymentAnalyticsDashboard from "../../components/PaymentAnalytics/PaymentAnalyticsDashboard";
import PowerBankRentalAnalytics from "../../components/PowerBankRentalAnalytics/PowerBankRentalAnalytics";
import StationAnalytics from "../../components/StationAnalytics/StationAnalytics";
import UserAnalytics from "../../components/UserAnalytics/UserAnalytics";

type DashboardFilter = 
  | "all"
  | "monitor-rentals"
  | "recent-transactions"
  | "recent-updates"
  | "revenue"
  | "rentals"
  | "station-analytics"
  | "powerbank-rentals"
  | "user-analytics"
  | "payment-analytics";

const Dashboard: React.FC = () => {
    const [selectedFilter, setSelectedFilter] = useState<DashboardFilter>("all");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filterOptions = [
        { value: "all", label: "All Cards" },
        { value: "monitor-rentals", label: "Monitor Rentals" },
        { value: "recent-transactions", label: "Recent Transactions" },
        { value: "recent-updates", label: "Recent Updates" },
        { value: "revenue", label: "Revenue Over Time" },
        { value: "rentals", label: "Rentals Over Time" },
        { value: "station-analytics", label: "Station Analytics" },
        { value: "powerbank-rentals", label: "PowerBank Rental Analytics" },
        { value: "user-analytics", label: "User Analytics" },
        { value: "payment-analytics", label: "Payment Analytics" },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);

    const shouldShow = (card: DashboardFilter) => {
        return selectedFilter === "all" || selectedFilter === card;
    };

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

            {/* Dashboard Stats - Always Visible */}
            <section className={styles.statsSection}>
                <DashboardStats />
            </section>

            {/* Filter Section */}
            <div className={styles.filterSection}>
                <div className={styles.filterWrapper}>
                    <FiFilter className={styles.filterIcon} />
                    <div className={styles.dropdown} ref={dropdownRef}>
                        <button
                            className={styles.dropdownButton}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span>
                                {filterOptions.find(opt => opt.value === selectedFilter)?.label || "All Cards"}
                            </span>
                            <FiChevronDown className={`${styles.dropdownIcon} ${isDropdownOpen ? styles.dropdownIconOpen : ""}`} />
                        </button>
                        {isDropdownOpen && (
                            <div className={styles.dropdownMenu}>
                                {filterOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        className={`${styles.dropdownItem} ${selectedFilter === option.value ? styles.dropdownItemActive : ""}`}
                                        onClick={() => {
                                            setSelectedFilter(option.value as DashboardFilter);
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* All Cards Grid */}
            <div className={styles.grid}>
                {/* Priority 1: Revenue & Rentals Over Time */}
                {shouldShow("revenue") && (
                    <div className={`${styles.col6} ${styles.hFull}`}>
                        <RevenueChart />
                    </div>
                )}

                {shouldShow("rentals") && (
                    <div className={`${styles.col6} ${styles.hFull}`}>
                        <RentalOverTime />
                    </div>
                )}

                {/* Priority 2: Core Analytics */}
                {shouldShow("station-analytics") && (
                    <div className={`${styles.col12} ${styles.hFull}`}>
                        <StationAnalytics />
                    </div>
                )}

                {shouldShow("powerbank-rentals") && (
                    <div className={`${styles.col12} ${styles.hFull}`}>
                        <PowerBankRentalAnalytics />
                    </div>
                )}

                {shouldShow("user-analytics") && (
                    <div className={`${styles.col12} ${styles.hFull}`}>
                        <UserAnalytics />
                    </div>
                )}

                {shouldShow("payment-analytics") && (
                    <div className={`${styles.col12} ${styles.hFull}`}>
                        <PaymentAnalyticsDashboard />
                    </div>
                )}

                {/* Priority 3: Monitoring & Activity */}
                {shouldShow("monitor-rentals") && (
                    <div className={`${styles.col12} ${styles.hFull}`}>
                        <MonitorRentals />
                    </div>
                )}

                {shouldShow("recent-transactions") && (
                    <div className={`${styles.col6} ${styles.hFull}`}>
                        <RecentTransactions />
                    </div>
                )}
                
                {shouldShow("recent-updates") && (
                    <div className={`${styles.col6} ${styles.hFull}`}>
                        <RecentUpdates />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

