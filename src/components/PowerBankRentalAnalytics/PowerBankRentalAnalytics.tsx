"use client";

import React from "react";
import styles from "./PowerBankRentalAnalytics.module.css";
import { usePowerBankRentalAnalytics } from "../../hooks/usePowerBankRentalAnalytics";
import Skeleton from "../ui/Skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const PowerBankRentalAnalytics: React.FC = () => {
    const { data, loading, error } = usePowerBankRentalAnalytics();

    if (loading) {
        return <div className={styles.container}><Skeleton height={400} /></div>;
    }

    if (error || !data) {
        return <div className={styles.error}>{error || "No data available"}</div>;
    }

    // Prepare Chart Data
    const statusData = data.rental_status_chart.labels.map((label, idx) => ({
        name: label,
        value: data.rental_status_chart.values[idx],
        color: label === 'Active' ? '#3b82f6' : 
               label === 'Overdue' ? '#ef4444' : 
               label === 'Completed' ? '#82ea80' : '#d1d5db'
    }));

    const paymentData = data.payment_methods_for_rentals.labels.map((label, idx) => ({
        name: label,
        value: data.payment_methods_for_rentals.values[idx],
        percentage: data.payment_methods_for_rentals.percentages?.[idx] || 0,
        color: ['#82ea80', '#f7b926', '#3b82f6', '#fcd34d'][idx % 4]
    }));

    // Trend Data needed if available, currently just using what's in 'rental_trend_chart'
    // Assuming labels match datasets[0].data length with defensive check
    const trendDataset = data.rental_trend_chart.datasets?.[0]?.data || [];
    const trendData = data.rental_trend_chart.labels.map((label, idx) => ({
        name: label,
        count: trendDataset[idx] ?? 0
    }));

    const gatewayData = data.gateway_breakdown_for_rentals.labels.map((label, idx) => ({
        name: label,
        value: data.gateway_breakdown_for_rentals.values[idx],
        count: data.gateway_breakdown_for_rentals.counts ? data.gateway_breakdown_for_rentals.counts[idx] : 0,
        color: label.toLowerCase() === 'khalti' ? '#5C2D91' : '#60BB46'
    }));

    return (
        <div className={styles.container}>
            <div className={styles.sectionTitle}>PowerBank Rental Analytics</div>
            
            {/* Charts Section */}
            <div className={styles.chartsGrid}>
                {/* Status Distribution */}
                <div className={styles.chartCard} style={{ display: 'flex', flexDirection: 'column' }}>
                     <div className={styles.sectionTitle}>Rental Status Distribution</div>
                     <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center' }}>
                        <ResponsiveContainer width="100%" height={250}>
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

                {/* Rental Trends (Bar Chart) */}
                <div className={styles.chartCard}>
                    <div className={styles.sectionTitle}>Weekly Rental Trend</div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="count" fill="#82ea80" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className={styles.chartsGrid}>
                 {/* Duration Stats */}
                 <div className={styles.chartCard}>
                    <div className={styles.sectionTitle}>Rental Duration Stats</div>
                    <div className={styles.durationsGrid}>
                        <div className={styles.durationItem}>
                            <div className={styles.durationLabel}>Average</div>
                            <div className={styles.durationValue}>{data.rental_cycles.average_display}</div>
                        </div>
                        <div className={styles.durationItem}>
                            <div className={styles.durationLabel}>Longest</div>
                            <div className={styles.durationValue}>{data.rental_cycles.longest_display}</div>
                        </div>
                        <div className={styles.durationItem}>
                            <div className={styles.durationLabel}>Shortest</div>
                            <div className={styles.durationValue}>{data.rental_cycles.shortest_display}</div>
                        </div>
                    </div>
                </div>
                 
                 {/* Payment Methods */}
                <div className={styles.chartCard} style={{ display: 'flex', flexDirection: 'column' }}>
                     <div className={styles.sectionTitle}>Payment Methods (Rentals)</div>
                     
                     <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center' }}>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={paymentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {paymentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: number, name: string, props: any) => {
                                        const percentage = props.payload.percentage || 0;
                                        return [`${value} (${percentage}%)`, name];
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                             {paymentData.map((entry, idx) => (
                                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: entry.color }} />
                                        <span style={{ fontSize: '0.8rem', color: '#fff' }}>{entry.name}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{entry.value}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>
                                            {data.payment_methods_for_rentals.percentages?.[idx] || 0}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                </div>

                {/* Gateway Breakdown (Rentals) */}
                <div className={styles.chartCard}>
                    <div className={styles.sectionTitle}>Gateway Usage (Rentals)</div>
                    {data.gateway_breakdown_for_rentals.labels.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center' }}>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={gatewayData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" stroke="#888" width={60} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {gatewayData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {gatewayData.map((gw) => (
                                    <div key={gw.name} className={styles.gatewayRow} style={{ borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{gw.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#ccc' }}>{gw.count} Txns</div>
                                        </div>
                                        <div style={{ fontWeight: 700, color: '#fff' }}>{gw.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                            No gateway data available
                        </div>
                    )}
                </div>
            </div>

            {/* Summary Stats */}
            <div className={styles.statsRow}>
                <div className={`${styles.statCard} ${styles.borderTotal}`}>
                    <span className={styles.statLabel}>Total Rentals</span>
                    <span className={styles.statValue}>{data.summary.total_rentals}</span>
                </div>
                <div className={`${styles.statCard} ${styles.borderActive}`}>
                    <span className={styles.statLabel}>Active</span>
                    <span className={styles.statValue}>{data.summary.active_rentals}</span>
                </div>
                <div className={`${styles.statCard} ${styles.borderOverdue}`}>
                    <span className={styles.statLabel}>Overdue</span>
                    <span className={styles.statValue}>{data.summary.overdue_rentals}</span>
                </div>
                <div className={`${styles.statCard} ${styles.borderCompleted}`}>
                    <span className={styles.statLabel}>Completed</span>
                    <span className={styles.statValue}>{data.summary.completed_rentals}</span>
                </div>
                <div className={`${styles.statCard} ${styles.borderCancelled}`}>
                    <span className={styles.statLabel}>Cancelled</span>
                    <span className={styles.statValue}>{data.summary.cancelled_rentals}</span>
                </div>
            </div>
        </div>
    );
};

export default PowerBankRentalAnalytics;
