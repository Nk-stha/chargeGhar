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
import SystemHealth from "../../components/SystemHealth/SystemHealth"; // Now a banner
import PaymentAnalyticsDashboard from "../../components/PaymentAnalytics/PaymentAnalyticsDashboard";
import PowerBankRentalAnalytics from "../../components/PowerBankRentalAnalytics/PowerBankRentalAnalytics";
import StationAnalytics from "../../components/StationAnalytics/StationAnalytics";
import UserAnalytics from "../../components/UserAnalytics/UserAnalytics";
import PowerBankPerformance from "../../components/PowerBankPerformance/PowerBankPerformance";

type AnalyticsFilter = 
  | "all"
  | "revenue"
  | "rentals"
  | "powerbank-performance"
  | "station-analytics"
  | "powerbank-rentals"
  | "user-analytics"
  | "monitor-rentals"
  | "transactions"
  | "updates"
  | "payment-analytics";

const Dashboard: React.FC = () => {
    const [selectedFilter, setSelectedFilter] = useState<AnalyticsFilter>("all");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filterOptions = [
        { value: "all", label: "All Analytics" },
        { value: "revenue", label: "Revenue Chart" },
        { value: "rentals", label: "Rentals Over Time" },
        { value: "powerbank-performance", label: "PowerBank Performance" },
        { value: "station-analytics", label: "Station Analytics" },
        { value: "powerbank-rentals", label: "PowerBank Rental Analytics" },
        { value: "user-analytics", label: "User Analytics" },
        { value: "monitor-rentals", label: "Monitor Rentals" },
        { value: "transactions", label: "Recent Transactions" },
        { value: "updates", label: "Recent Updates" },
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

    const shouldShow = (card: AnalyticsFilter) => {
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

            {/* Top Cards Section */}
            <section className={styles.statsSection}>
                <DashboardStats />
            </section>

            {/* Analytics Filter */}
            <div className={styles.filterSection}>
                <div className={styles.filterWrapper}>
                    <FiFilter className={styles.filterIcon} />
                    <div className={styles.dropdown} ref={dropdownRef}>
                        <button
                            className={styles.dropdownButton}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span>
                                {filterOptions.find(opt => opt.value === selectedFilter)?.label || "All Analytics"}
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
                                            setSelectedFilter(option.value as AnalyticsFilter);
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

            {/* Main Content Grid */}
            <div className={styles.grid}>
                {/* Row 1: High Level Trends (Side by Side) */}
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

                {/* Row 2: PowerBank Performance */}
                {shouldShow("powerbank-performance") && (
                    <div className={`${styles.col12} ${styles.hFull}`}>
                        <PowerBankPerformance />
                    </div>
                )}

                {/* Row 3: Analytics Dashboard */}
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

                {/* Row 4: Activity Monitoring */}
                {shouldShow("monitor-rentals") && (
                    <div className={`${styles.col12} ${styles.hFull}`}>
                        <MonitorRentals />
                    </div>
                )}

                {/* Row 5: Transactions & Updates */}
                {shouldShow("transactions") && (
                    <div className={`${styles.col6} ${styles.hFull}`}>
                        <RecentTransactions />
                    </div>
                )}
                {shouldShow("updates") && (
                    <div className={`${styles.col6} ${styles.hFull}`}>
                        <RecentUpdates />
                    </div>
                )}

                {/* Row 6: Financial Insights */}
                {shouldShow("payment-analytics") && (
                    <div className={`${styles.col12} ${styles.hFull}`}>
                        <PaymentAnalyticsDashboard />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

