"use client";

import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const totalOrdersData = [
    { name: "Doctor", value: 12.43 },
    { name: "Hospital", value: 1.43 },
    { name: "Ambulance", value: 11.29 },
    { name: "Pharmacy", value: 31.71 },
    { name: "Lab", value: 21.71 },
    { name: "Nurse", value: 21.43 },
];

const orderStatusData = [
    { name: "Approved Orders", value: 29.14 },
    { name: "Pending Orders", value: 37.43 },
    { name: "Rejected Orders", value: 16.57 },
    { name: "Re Schedule", value: 2.29 },
    { name: "Doctor Assigned", value: 0.71 },
    { name: "Completed", value: 0.29 },
];

const COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#06b6d4",
    "#3b82f6",
    "#ef4444",
    "#10b981",
];

// ✅ Custom Outside Label
const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    name,
}) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="#374151"
            textAnchor={x > cx ? "start" : "end"}
            dominantBaseline="central"
            fontSize={13}
            fontWeight="600"
        >
            {`${name} (${(percent * 100).toFixed(1)}%)`}
        </text>
    );
};

function Orders() {
    return (
        <div className="bg-gray-100 min-h-screen p-6">

            {/* PAGE TITLE */}
            <h1 className="text-4xl font-bold text-center mb-10 text-gray-700">
                Orders Dashboard
            </h1>

            {/* TOP CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

                <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl shadow-lg p-6 flex items-center justify-between hover:scale-105 transition duration-300">
                    <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-inner">
                        <span className="text-3xl font-bold text-gray-700">700</span>
                    </div>
                    <div className="text-white text-2xl font-semibold pr-6">
                        Total Orders
                    </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-2xl shadow-lg p-6 flex items-center justify-between hover:scale-105 transition duration-300">
                    <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-inner">
                        <span className="text-3xl font-bold text-gray-700">0</span>
                    </div>
                    <div className="text-white text-2xl font-semibold pr-6">
                        Current Orders
                    </div>
                </div>

            </div>

            {/* CHART SECTION */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">

                {/* FULL PIE - CATEGORY */}
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                    <h2 className="text-xl font-bold text-center mb-2">
                        Orders by Category
                    </h2>
                    <p className="text-center text-gray-500 mb-6 text-sm">
                        Last Sync: 17/2/2026 10:55:38
                    </p>

                    <div className="h-[400px]">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={totalOrdersData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={130}
                                    dataKey="value"
                                    labelLine={true}
                                    label={renderCustomLabel}
                                    isAnimationActive={true}
                                >
                                    {totalOrdersData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>

                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* FULL PIE - STATUS */}
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                    <h2 className="text-xl font-bold text-center mb-2">
                        Orders Status Overview
                    </h2>
                    <p className="text-center text-gray-500 mb-6 text-sm">
                        Last Sync: 17/2/2026 10:55:38
                    </p>

                    <div className="h-[400px]">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={130}
                                    dataKey="value"
                                    labelLine={true}
                                    label={renderCustomLabel}
                                    isAnimationActive={true}
                                >
                                    {orderStatusData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>

                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Orders;