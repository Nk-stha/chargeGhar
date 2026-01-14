"use client";

import React from "react";
import styles from "./PaymentAnalytics.module.css";
import { usePaymentAnalytics } from "../../hooks/usePaymentAnalytics";
import Skeleton from "../ui/Skeleton";
import TopUsersTable from "./TopUsersTable";
import { analyticsService } from "../../lib/api/analytics.service";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

const PaymentAnalyticsDashboard: React.FC = () => {
  const { data, loading, error } = usePaymentAnalytics();

  if (loading) {
    return <div className={styles.container}><Skeleton height={400} /></div>;
  }

  if (error || !data) {
    return <div className={styles.error}>{error || "No data available"}</div>;
  }

  // Gateway Chart Data preparation
  const gatewayData = data.gateway_breakdown.labels.map((label, idx) => ({
    name: label,
    value: data.gateway_breakdown.values[idx],
    count: data.gateway_breakdown.counts ? data.gateway_breakdown.counts[idx] : 0,
    color: label.toLowerCase() === 'khalti' ? '#5C2D91' : '#60BB46'
  }));

  // Payment Method Data
  const methodData = data.overall_payment_methods.labels.map((label, idx) => ({
    name: label,
    value: data.overall_payment_methods.values[idx],
    color: ['#82ea80', '#f7b926', '#3b82f6', '#fcd34d'][idx % 4]
  }));

  return (
    <div className={styles.container}>
      <div className={styles.sectionTitle}>Payment Analytics</div>
      
      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        {/* Gateway Performance */}
        <div className={styles.chartCard}>
           <div className={styles.sectionTitle}>Gateway Performance</div>
           <ResponsiveContainer width="100%" height={250}>
             <BarChart data={gatewayData} layout="vertical">
               <XAxis type="number" hide />
               <YAxis dataKey="name" type="category" stroke="#888" width={60} />
               <Tooltip 
                 contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '8px' }}
                 cursor={{fill: 'rgba(255,255,255,0.05)'}}
               />
               <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                 {gatewayData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.color} />
                 ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
           
           <div style={{ marginTop: '20px' }}>
             {gatewayData.map((gw) => (
                <div key={gw.name} className={styles.gatewayRow}>
                    <div className={styles.gatewayInfo}>
                        <div className={`${styles.gatewayIcon} ${gw.name.toLowerCase() === 'khalti' ? styles.iconKhalti : styles.iconEsewa}`}>
                            {gw.name[0]}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{gw.name}</div>
                            <div style={{ fontSize: '0.8rem', color: '#ccc' }}>{gw.count} Transactions</div>
                        </div>
                    </div>
                    <div className={styles.gatewayStats}>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{analyticsService.formatCurrency(gw.value)}</div>
                    </div>
                </div>
             ))}
           </div>
        </div>

        {/* Breakdown Chart */}
        <div className={styles.chartCard}>
             <div className={styles.sectionTitle}>Revenue Source Split</div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center', height: '100%' }}>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={methodData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {methodData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', border: 'none' }} />
                    </PieChart>
                </ResponsiveContainer>
                
                {/* Custom Clear Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {methodData.map((entry) => (
                        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                 <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: entry.color }} />
                                 <span style={{ fontSize: '0.9rem', color: '#fff' }}>{entry.name}</span>
                             </div>
                             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                 <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{analyticsService.formatCurrency(entry.value)}</span>
                             </div>
                        </div>
                    ))}
                </div>
             </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.borderPrimary}`}>
          <span className={styles.statLabel}>Total Revenue</span>
          <span className={styles.statValue}>{analyticsService.formatCurrency(data.summary.total_revenue)}</span>
        </div>
        <div className={`${styles.statCard} ${styles.borderSuccess}`}>
          <span className={styles.statLabel}>Total Transactions</span>
          <span className={styles.statValue}>{data.summary.total_transactions}</span>
        </div>
        <div className={`${styles.statCard} ${styles.borderInfo}`}>
          <span className={styles.statLabel}>Rental Revenue</span>
          <span className={styles.statValue}>{analyticsService.formatCurrency(data.summary.rental_revenue)}</span>
        </div>
        <div className={`${styles.statCard} ${styles.borderWarning}`}>
          <span className={styles.statLabel}>Top-up Revenue</span>
          <span className={styles.statValue}>{analyticsService.formatCurrency(data.summary.topup_revenue)}</span>
        </div>
      </div>

      {/* 3. Top Users Table */}
      <TopUsersTable users={data.top_10_users} />
    </div>
  );
};

export default PaymentAnalyticsDashboard;
