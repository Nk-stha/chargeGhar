"use client";

import React from "react";
import styles from "./UserAnalytics.module.css";
import { useUserAnalytics } from "../../hooks/useUserAnalytics";
import Skeleton from "../ui/Skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const UserAnalytics: React.FC = () => {
    const { data, loading, error } = useUserAnalytics();

    if (loading) {
        return <div className={styles.container}><Skeleton height={400} /></div>;
    }

    if (error || !data) {
        return <div className={styles.error}>{error || "No data available"}</div>;
    }

    // Chart Data
    const statusData = data.user_status_chart.labels.map((label, idx) => ({
        name: label,
        value: data.user_status_chart.values[idx],
        color: label === 'Active' ? '#82ea80' : 
               label === 'Suspended' ? '#ef4444' : '#9ca3af'
    }));

    const growthDataset = data.user_growth_chart.datasets?.[0]?.data || [];
    const growthData = data.user_growth_chart.labels.map((label, idx) => ({
        name: label,
        count: growthDataset[idx] ?? 0
    }));

    return (
        <div className={styles.container}>
            <div className={styles.sectionTitle}>User Analytics</div>
            
            {/* 1. Summary Stats */}
            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.borderTotal}`}>
                    <div className={styles.statTitle}>Total Users</div>
                    <div className={styles.statValue}>{data.summary.total_users}</div>
                </div>
                <div className={`${styles.statCard} ${styles.borderNew}`}>
                    <div className={styles.statTitle}>New Users (This Month)</div>
                    <div className={styles.statValue}>{data.summary.new_users_this_month}</div>
                     <div className={styles.subValue}>Today: {data.summary.new_users_today}</div>
                </div>
                 <div className={`${styles.statCard} ${styles.borderActive}`}>
                    <div className={styles.statTitle}>Active Users</div>
                    <div className={styles.statValue}>{data.summary.active_users}</div>
                </div>
                 <div className={`${styles.statCard} ${styles.borderInactive}`}>
                    <div className={styles.statTitle}>Inactive Users</div>
                    <div className={styles.statValue}>{data.summary.inactive_users}</div>
                </div>
            </div>

            {/* 2. Charts Section */}
            <div className={styles.chartsGrid}>
                 {/* Status Distribution */}
                <div className={styles.chartCard} style={{ display: 'flex', flexDirection: 'column' }}>
                     <div className={styles.sectionTitle}>User Status Distribution</div>
                     <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center' }}>
                        <ResponsiveContainer width="100%" height={200}>
                             <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                             </PieChart>
                        </ResponsiveContainer>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {statusData.map((entry) => (
                                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: entry.color }} />
                                        <span style={{ fontSize: '0.85rem', color: '#fff' }}>{entry.name}</span>
                                    </div>
                                    <span style={{ fontWeight: 600, color: '#fff' }}>{entry.value}</span>
                                </div>
                            ))}
                        </div>
                     </div>
                </div>

                {/* User Growth */}
                 <div className={styles.chartCard}>
                    <div className={styles.sectionTitle}>New User Growth (6 Months)</div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={growthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip 
                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default UserAnalytics;
