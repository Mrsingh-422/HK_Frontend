"use client";
import React, { useState } from 'react';

const OrderCard = ({ order, type }) => {
    // Status color logic
    const statusStyles = {
        Completed: "bg-green-100 text-green-700 border-green-200",
        Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
        Cancelled: "bg-red-100 text-red-700 border-red-200",
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Order ID</span>
                    <p className="text-sm font-semibold text-gray-800">#{order.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[order.status]}`}>
                    {order.status}
                </span>
            </div>

            <div className="space-y-2 mb-4">
                <h3 className="font-bold text-[#2f8f5b] text-lg">{order.serviceName}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{order.details}</p>
                <p className="text-xs text-gray-400">{order.date}</p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-500 font-medium">Total Amount</span>
                <span className="text-lg font-bold text-gray-900">${order.price}</span>
            </div>

            <button className=" cursor-pointer w-full mt-4 py-2 text-sm font-semibold text-[#08b36a] border border-[#08b36a] rounded hover:bg-[#08b36a] hover:text-white transition-colors">
                View Details
            </button>
        </div>
    );
};

function PreviousOrders() {
    const [activeTab, setActiveTab] = useState("nursing");

    // Dummy Data
    const ordersData = {
        nursing: [
            { id: "NUR-9921", serviceName: "Post-Surgery Care", details: "12-hour nursing shift for elderly patient assistance.", status: "Completed", price: "120.00", date: "Oct 24, 2023" },
            { id: "NUR-8810", serviceName: "Elderly Home Visit", details: "Routine health checkup and medication administration.", status: "Pending", price: "45.00", date: "Nov 02, 2023" },
        ],
        pharmacy: [
            { id: "PHA-1102", serviceName: "Monthly Medications", details: "Insulin, Metformin, and BP monitoring strips.", status: "Completed", price: "85.50", date: "Oct 20, 2023" },
            { id: "PHA-3321", serviceName: "Antibiotics Pack", details: "Prescription for Amoxicillin and Vitamin C.", status: "Cancelled", price: "30.00", date: "Oct 15, 2023" },
        ],
        lab: [
            { id: "LAB-4451", serviceName: "Full Body Checkup", details: "Complete blood count, Thyroid, and Lipid profile.", status: "Completed", price: "150.00", date: "Sep 28, 2023" },
            { id: "LAB-2210", serviceName: "COVID-19 RT-PCR", details: "Home sample collection for travel requirement.", status: "Completed", price: "60.00", date: "Oct 05, 2023" },
        ]
    };

    const getTabClass = (tab) => {
        const base = "flex-1 py-3 text-sm font-semibold transition-all duration-300 text-center cursor-pointer";
        return activeTab === tab
            ? `${base} bg-white text-black shadow-sm rounded-md`
            : `${base} text-white hover:bg-white/10`;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 lg:p-12 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* PAGE HEADER */}
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Previous Orders</h1>
                    <p className="text-gray-500 mt-2">Manage and track your healthcare service history.</p>
                </div>

                {/* TABS CONTAINER - Matches your Login/Register Style */}
                <div className="bg-[#08b36a] p-2 rounded-xl flex flex-wrap gap-1 mb-10 shadow-lg">
                    <button onClick={() => setActiveTab("nursing")} className={getTabClass("nursing")}>
                        Nursing Orders
                    </button>
                    <button onClick={() => setActiveTab("pharmacy")} className={getTabClass("pharmacy")}>
                        Pharmacy Orders
                    </button>
                    <button onClick={() => setActiveTab("lab")} className={getTabClass("lab")}>
                        Lab Orders
                    </button>
                </div>

                {/* ORDERS GRID */}
                {ordersData[activeTab].length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {ordersData[activeTab].map((order) => (
                            <OrderCard key={order.id} order={order} type={activeTab} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 text-lg font-medium">No orders found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PreviousOrders;