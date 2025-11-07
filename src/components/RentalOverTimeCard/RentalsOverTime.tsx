"use client";

import React from "react";
import styles from "./RentalsOverTime.module.css";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { useDashboardData } from "../../contexts/DashboardDataContext";

interface RentalData {
    date: string;
    rentals: number;
}

const RentalOverTime: React.FC = () => {
    const { dashboardData, loading, error } = useDashboardData();

    // Example fallback data if API isn't loaded yet
    const sampleData: RentalData[] = [
        { date: "Mon", rentals: 20 },
        { date: "Tue", rentals: 35 },
        { date: "Wed", rentals: 25 },
        { date: "Thu", rentals: 45 },
        { date: "Fri", rentals: 30 },
        { date: "Sat", rentals: 60 },
        { date: "Sun", rentals: 40 },
    ];

    const rentalsData: RentalData[] =
        dashboardData?.dashboard?.rental_over_time || sampleData;

    if (loading) {
        return (
            <div className={styles.card}>
                <h2>Rental Over Time</h2>
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.card}>
                <h2>Rental Over Time</h2>
                <div className={styles.error}>Failed to load data</div>
            </div>
        );
    }

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h2>Rental Over Time</h2>
                <div className={styles.toggle}>
                    <button className={`${styles.toggleBtn} ${styles.active}`}>Daily</button>
                    <button className={styles.toggleBtn}>Monthly</button>
                </div>
            </div>

            <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={rentalsData} barSize={20}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="date" stroke="#aaa" />
                        <YAxis stroke="#aaa" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1a1a1a",
                                border: "none",
                                borderRadius: "6px",
                            }}
                        />
                        <Bar dataKey="rentals" fill="#82ea80" radius={[5, 5, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RentalOverTime;
