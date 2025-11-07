import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { useDashboardData } from "../contexts/DashboardDataContext";

const RevenueChart: React.FC = () => {
    const { dashboardData, loading, error } = useDashboardData();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const revenueThisMonth = dashboardData?.dashboard?.revenue_this_month || 0;
    const data = [
        { month: "This Month", revenue: revenueThisMonth },
    ];

    return (
        <div
            style={{
                width: "100%",
                height: 320,
                background: "#121212",
                borderRadius: "12px",
                padding: "5rem",
                boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            }}
        >
            <h3 style={{ color: "#82ea80", marginBottom: "1rem" }}>Revenue Generated</h3>
            <ResponsiveContainer>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                    <XAxis dataKey="month" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                        contentStyle={{
                            background: "#0b0b0b",
                            border: "1px solid #47b216",
                            color: "#fff",
                        }}
                        labelStyle={{ color: "#82ea80" }}
                    />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#47b216"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#82ea80" }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueChart;
