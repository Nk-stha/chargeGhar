"use client";

import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";
import { useDashboardData } from "../contexts/DashboardDataContext";

const COLORS = ["#47b216", "#82ea80", "#66bb6a", "#3c8c3c"];

const StationUtilizationChart: React.FC = () => {
    const { stationsData, loading, error } = useDashboardData();
    if (loading) {
        return <div>Loading Station Utilization...</div>;
    }

    if (error) {
        return <div>Error loading Station Utilization: {error}</div>;
    }

    const stations = stationsData?.results || [];

    const chartData = stations.map((station: any) => {
        const utilizedSlots = station.total_slots - station.available_slots;
        const utilizationPercentage = station.total_slots > 0 ? (utilizedSlots / station.total_slots) * 100 : 0;
        return {
            name: station.station_name,
            value: parseFloat(utilizationPercentage.toFixed(2)),
        };
    });

    return (
        <div
            style={{
                width: "100%",
                height: 320,
                background: "#121212",
                borderRadius: "12px",
                padding: "1rem",
                boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            }}
        >
            <h3 style={{ color: "#82ea80", marginBottom: "1rem" }}>Station Utilization</h3>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#47b216"
                        dataKey="value"
                        label
                    >
                        {chartData.map((entry: number, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            background: "#0b0b0b",
                            border: "1px solid #47b216",
                            color: "#fff",
                        }}
                    />
                    <Legend wrapperStyle={{ color: "#ccc" }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StationUtilizationChart;
