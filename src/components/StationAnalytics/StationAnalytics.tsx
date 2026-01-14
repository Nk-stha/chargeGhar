"use client";

import React from "react";
import styles from "./StationAnalytics.module.css";
import { useStationPerformance } from "../../hooks/useStationPerformance";
import Skeleton from "../ui/Skeleton";
import { analyticsService } from "../../lib/api/analytics.service";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";

const StationAnalytics: React.FC = () => {
    const { data, loading, error } = useStationPerformance();

    if (loading) {
        return <div className={styles.container}><Skeleton height={400} /></div>;
    }

    if (error || !data) {
        return <div className={styles.error}>{error || "No data available"}</div>;
    }

    // Prepare Chart Data
    const statusData = data.station_status_distribution.labels.map((label, idx) => ({
        name: label,
        value: data.station_status_distribution.values[idx],
        color: label === 'Online' ? '#82ea80' : 
               label === 'Offline' ? '#9ca3af' : '#f7b926'
    }));

    // Revenue Chart Data - Top 5 for cleaner view if many
    const revenueData = data.station_revenue_chart.labels.slice(0, 10).map((label, idx) => ({
        name: label,
        value: data.station_revenue_chart.datasets[0].data[idx]
    }));
    
    // Utilization Trend Data
    const utilizationData = data.utilization_trend.labels.map((label, idx) => ({
        name: label,
        value: data.utilization_trend.datasets[0].data[idx]
    }));

    return (
        <div className={styles.container}>
            <div className={styles.sectionTitle}>Station Analytics</div>
            
            {/* Charts Section */}
            <div className={styles.chartsGrid}>
                 {/* Status Distribution */}
                <div className={styles.chartCard} style={{ display: 'flex', flexDirection: 'column' }}>
                     <div className={styles.sectionTitle}>Station Status</div>
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

                {/* Utilization Trend */}
                 <div className={styles.chartCard}>
                    <div className={styles.sectionTitle}>Utilization Rate Trend</div>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={utilizationData}>
                             <defs>
                                <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                            <Tooltip 
                                cursor={{ stroke: '#8b5cf6', strokeWidth: 1 }}
                                contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUtil)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. Top Contributing Stations */}
            <div className={styles.chartCard}>
                <div className={styles.sectionTitle}>Top Performing Stations (Revenue)</div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Station Name</th>
                                <th>Serial No.</th>
                                <th>Status</th>
                                <th>Occupied / Total</th>
                                <th>Rentals</th>
                                <th>Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.top_10_stations.map((station) => (
                                <tr key={station.station_id}>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{station.station_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>{station.address}</div>
                                    </td>
                                    <td>{station.serial_number}</td>
                                    <td>
                                        <span style={{ 
                                            padding: '2px 8px', 
                                            borderRadius: '4px', 
                                            fontSize: '0.75rem', 
                                            backgroundColor: station.status === 'ONLINE' ? 'rgba(130, 234, 128, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                                            color: station.status === 'ONLINE' ? '#82ea80' : '#9ca3af'
                                        }}>
                                            {station.status}
                                        </span>
                                    </td>
                                    <td>{station.occupied_slots} / {station.total_slots}</td>
                                    <td>{station.total_rentals}</td>
                                    <td style={{ fontWeight: 600 }}>{analyticsService.formatCurrency(station.total_revenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary Stats */}
            <div className={styles.statsRow}>
                <div className={`${styles.statCard} ${styles.borderTotal}`}>
                    <span className={styles.statLabel}>Total Stations</span>
                    <span className={styles.statValue}>{data.summary.total_stations}</span>
                </div>
                <div className={`${styles.statCard} ${styles.borderOnline}`}>
                    <span className={styles.statLabel}>Online</span>
                    <span className={styles.statValue}>{data.summary.online_stations}</span>
                </div>
                <div className={`${styles.statCard} ${styles.borderOffline}`}>
                    <span className={styles.statLabel}>Offline</span>
                    <span className={styles.statValue}>{data.summary.offline_stations}</span>
                </div>
                <div className={`${styles.statCard} ${styles.borderSlots}`}>
                    <span className={styles.statLabel}>Total Slots</span>
                    <span className={styles.statValue}>{data.summary.total_slots}</span>
                </div>
                <div className={`${styles.statCard} ${styles.borderUtilization}`}>
                    <span className={styles.statLabel}>Utilization</span>
                    <span className={styles.statValue}>{data.summary.utilization_rate}%</span>
                </div>
            </div>
        </div>
    );
};

export default StationAnalytics;
