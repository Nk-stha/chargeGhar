"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./analytics.module.css";
import { FiFilter, FiChevronDown } from "react-icons/fi";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/Tabs";
import RevenueChart from "../../../components/RevenueChart";
import RecentTransactions from "../../../components/RecentTransactionsCard/RecentTransactions";
import RentalOverTime from "../../../components/RentalOverTimeCard/RentalsOverTime";
import MonitorRentals from "../../../components/MonitorRentalsCard/MonitorRentalsCard";
import RecentUpdates from "../../../components/RecentUpdates/RecentUpdates";
import SystemHealth from "../../../components/SystemHealth/SystemHealth";
import PaymentAnalyticsDashboard from "../../../components/PaymentAnalytics/PaymentAnalyticsDashboard";
import PowerBankRentalAnalytics from "../../../components/PowerBankRentalAnalytics/PowerBankRentalAnalytics";
import StationAnalytics from "../../../components/StationAnalytics/StationAnalytics";
import UserAnalytics from "../../../components/UserAnalytics/UserAnalytics";
import PowerBankPerformance from "../../../components/PowerBankPerformance/PowerBankPerformance";
import WithdrawalsAnalytics from "../../../components/WithdrawalsAnalytics/WithdrawalsAnalytics";
import ReferralsAnalytics from "../../../components/ReferralsAnalytics/ReferralsAnalytics";
import PointsAnalytics from "../../../components/PointsAnalytics/PointsAnalytics";
import AchievementsAnalytics from "../../../components/AchievementsAnalytics/AchievementsAnalytics";
import PartnerRevenueAnalytics from "../../../components/PartnerRevenueAnalytics/PartnerRevenueAnalytics";
import StationDistributionStats from "../../../components/StationDistributionStats/StationDistributionStats";
import PayoutStats from "../../../components/PayoutStats/PayoutStats";
import AdsStats from "../../../components/AdsStats/AdsStats";
import RentalStats from "../../../components/RentalStats/RentalStats";

type AnalyticsFilter = 
  | "all"
  | "revenue"
  | "rentals"
  | "station-analytics"
  | "powerbank-rentals"
  | "user-analytics"
  | "payment-analytics"
  | "withdrawals-analytics"
  | "referrals-analytics"
  | "points-analytics"
  | "achievements-analytics"
  | "partner-revenue-analytics";

type StatisticsFilter =
  | "all"
  | "station-distribution"
  | "payout-stats"
  | "ads-stats"
  | "rental-stats"
  | "powerbank-performance"
  | "monitor-rentals"
  | "recent-transactions"
  | "recent-updates";

const AnalyticsPage: React.FC = () => {
    const [selectedFilter, setSelectedFilter] = useState<AnalyticsFilter>("all");
    const [selectedStatsFilter, setSelectedStatsFilter] = useState<StatisticsFilter>("all");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isStatsDropdownOpen, setIsStatsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const statsDropdownRef = useRef<HTMLDivElement>(null);

    const filterOptions = [
        { value: "all", label: "All Analytics" },
        { value: "revenue", label: "Revenue Over Time" },
        { value: "rentals", label: "Rentals Over Time" },
        { value: "station-analytics", label: "Station Analytics" },
        { value: "powerbank-rentals", label: "PowerBank Rental Analytics" },
        { value: "user-analytics", label: "User Analytics" },
        { value: "payment-analytics", label: "Payment Analytics" },
        { value: "withdrawals-analytics", label: "Withdrawals Analytics" },
        { value: "referrals-analytics", label: "Referrals Analytics" },
        { value: "points-analytics", label: "Points Analytics" },
        { value: "achievements-analytics", label: "Achievements Analytics" },
        { value: "partner-revenue-analytics", label: "Partner Revenue Analytics" },
    ];

    const statsFilterOptions = [
        { value: "all", label: "All Statistics" },
        { value: "station-distribution", label: "Station Distribution Stats" },
        { value: "payout-stats", label: "Payout Statistics" },
        { value: "ads-stats", label: "Ads Statistics" },
        { value: "rental-stats", label: "Rental Statistics" },
        { value: "powerbank-performance", label: "PowerBank Performance" },
        { value: "monitor-rentals", label: "Monitor Rentals" },
        { value: "recent-transactions", label: "Recent Transactions" },
        { value: "recent-updates", label: "Recent Updates" },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
            if (statsDropdownRef.current && !statsDropdownRef.current.contains(event.target as Node)) {
                setIsStatsDropdownOpen(false);
            }
        };

        if (isDropdownOpen || isStatsDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen, isStatsDropdownOpen]);

    const shouldShow = (card: AnalyticsFilter) => {
        return selectedFilter === "all" || selectedFilter === card;
    };

    const shouldShowStats = (card: StatisticsFilter) => {
        return selectedStatsFilter === "all" || selectedStatsFilter === card;
    };

    return (
        <div className={styles.analyticsContainer}>
            <header className={styles.header}>
                <div className={styles.headerTitle}>
                    <h1>Analytics Dashboard</h1>
                    <p>Comprehensive analytics and statistics overview</p>
                </div>
                <div className={styles.headerRight}>
                    <SystemHealth />
                </div>
            </header>

            {/* Tabs for Statistics and Analytics */}
            <Tabs defaultValue="statistics">
                <TabsList>
                    <TabsTrigger value="statistics">Statistics</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* Statistics Tab Content */}
                <TabsContent value="statistics">
                    {/* Statistics Filter */}
                    <div className={styles.filterSection}>
                        <div className={styles.filterWrapper}>
                            <FiFilter className={styles.filterIcon} />
                            <div className={styles.dropdown} ref={statsDropdownRef}>
                                <button
                                    className={styles.dropdownButton}
                                    onClick={() => setIsStatsDropdownOpen(!isStatsDropdownOpen)}
                                >
                                    <span>
                                        {statsFilterOptions.find(opt => opt.value === selectedStatsFilter)?.label || "All Statistics"}
                                    </span>
                                    <FiChevronDown className={`${styles.dropdownIcon} ${isStatsDropdownOpen ? styles.dropdownIconOpen : ""}`} />
                                </button>
                                {isStatsDropdownOpen && (
                                    <div className={styles.dropdownMenu}>
                                        {statsFilterOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                className={`${styles.dropdownItem} ${selectedStatsFilter === option.value ? styles.dropdownItemActive : ""}`}
                                                onClick={() => {
                                                    setSelectedStatsFilter(option.value as StatisticsFilter);
                                                    setIsStatsDropdownOpen(false);
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

                    <div className={styles.grid}>
                        {shouldShowStats("station-distribution") && (
                            <div className={`${styles.col12} ${styles.hFull}`}>
                                <StationDistributionStats />
                            </div>
                        )}

                        {shouldShowStats("payout-stats") && (
                            <div className={`${styles.col12} ${styles.hFull}`}>
                                <PayoutStats />
                            </div>
                        )}

                        {shouldShowStats("ads-stats") && (
                            <div className={`${styles.col12} ${styles.hFull}`}>
                                <AdsStats />
                            </div>
                        )}

                        {shouldShowStats("rental-stats") && (
                            <div className={`${styles.col12} ${styles.hFull}`}>
                                <RentalStats />
                            </div>
                        )}

                        {shouldShowStats("powerbank-performance") && (
                            <div className={`${styles.col12} ${styles.hFull}`}>
                                <PowerBankPerformance />
                            </div>
                        )}

                        {shouldShowStats("monitor-rentals") && (
                            <div className={`${styles.col12} ${styles.hFull}`}>
                                <MonitorRentals />
                            </div>
                        )}

                        {shouldShowStats("recent-transactions") && (
                            <div className={`${styles.col6} ${styles.hFull}`}>
                                <RecentTransactions />
                            </div>
                        )}
                        
                        {shouldShowStats("recent-updates") && (
                            <div className={`${styles.col6} ${styles.hFull}`}>
                                <RecentUpdates />
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Analytics Tab Content */}
                <TabsContent value="analytics">
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

                    {/* Analytics Content Grid */}
                    <div className={styles.grid}>
                        {/* Revenue & Rentals Trends */}
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

                        {/* Station, PowerBank, User Analytics */}
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

                        {/* Payment Analytics */}
                        {shouldShow("payment-analytics") && (
                            <div className={`${styles.col12} ${styles.hFull}`}>
                                <PaymentAnalyticsDashboard />
                            </div>
                        )}

                        {/* Withdrawals Analytics */}
                        {shouldShow("withdrawals-analytics") && (
                            <div className={`${styles.col12} ${styles.hFull}`}>
                                <WithdrawalsAnalytics />
                            </div>
                        )}

                        {/* Referrals & Points Analytics */}
                        {shouldShow("referrals-analytics") && (
                            <div className={`${styles.col6} ${styles.hFull}`}>
                                <ReferralsAnalytics />
                            </div>
                        )}
                        {shouldShow("points-analytics") && (
                            <div className={`${styles.col6} ${styles.hFull}`}>
                                <PointsAnalytics />
                            </div>
                        )}

                        {/* Achievements & Partner Revenue Analytics */}
                        {shouldShow("achievements-analytics") && (
                            <div className={`${styles.col6} ${styles.hFull}`}>
                                <AchievementsAnalytics />
                            </div>
                        )}
                        {shouldShow("partner-revenue-analytics") && (
                            <div className={`${styles.col6} ${styles.hFull}`}>
                                <PartnerRevenueAnalytics />
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AnalyticsPage;
