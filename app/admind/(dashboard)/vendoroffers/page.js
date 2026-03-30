'use client'

import React, { useState } from 'react';
import {
    FaMicroscope, FaPills, FaUserNurse, FaHospital, FaUserMd,
    FaChevronRight, FaTicketAlt
} from 'react-icons/fa';

// --- MAIN PAGE COMPONENT ---
const VendorManagementPage = () => {
    const [activeTab, setActiveTab] = useState('Lab Vendor');

    const vendorConfigs = [
        { id: 'Lab Vendor', icon: <FaMicroscope /> },
        { id: 'Pharmacy Vendor', icon: <FaPills /> },
        { id: 'Nurse Vendor', icon: <FaUserNurse /> },
        { id: 'Hospital Vendor', icon: <FaHospital /> },
        { id: 'Doctor Vendor', icon: <FaUserMd /> },
    ];

    const activeConfig = vendorConfigs.find(v => v.id === activeTab);

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* --- TOP BREADCRUMB --- */}
            <div className="bg-white px-8 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span>Admin</span>
                    <FaChevronRight size={10} />
                    <span className="text-[#08b36a]">Coupon Viewer</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-[#08b36a] rounded-full"></span>
                    <span className="text-xs font-bold text-gray-500 uppercase">View Mode Only</span>
                </div>
            </div>

            {/* --- MAIN HEADER --- */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 pt-8 pb-0">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-[#08b36a] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-100 text-2xl">
                                {activeConfig.icon}
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-800 tracking-tight">{activeTab}</h1>
                                <p className="text-gray-500 font-medium text-sm">Active discount codes for {activeTab}s</p>
                            </div>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex bg-gray-100 p-1.5 rounded-2xl overflow-x-auto no-scrollbar border border-gray-200 mb-2">
                            {vendorConfigs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                        ? "bg-white text-[#08b36a] shadow-sm ring-1 ring-black/5"
                                        : "text-gray-500 hover:text-[#08b36a]"
                                        }`}
                                >
                                    {tab.id}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="max-w-7xl mx-auto p-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-5 text-[13px] font-bold text-gray-600 uppercase tracking-wider border-b">S No.</th>
                                    <th className="px-6 py-5 text-[13px] font-bold text-gray-600 uppercase tracking-wider border-b">Vendor Name</th>
                                    <th className="px-6 py-5 text-[13px] font-bold text-gray-600 uppercase tracking-wider border-b">Coupon Code</th>
                                    <th className="px-6 py-5 text-[13px] font-bold text-gray-600 uppercase tracking-wider border-b">Discount Amount</th>
                                    <th className="px-6 py-5 text-[13px] font-bold text-gray-600 uppercase tracking-wider border-b">Minimum Order Amount</th>
                                    <th className="px-6 py-5 text-[13px] font-bold text-gray-600 uppercase tracking-wider border-b">Coupon Type</th>
                                    <th className="px-6 py-5 text-[13px] font-bold text-gray-600 uppercase tracking-wider border-b">End Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {/* Sample Data Rows - These would normally come from your API based on activeTab */}
                                <CouponRow sno="1" vendor="Prime Healthcare" code="HEALTH25" discount="25%" minOrder="1,200" type="Percentage" date="2024-12-31" />
                                <CouponRow sno="2" vendor="Global Diagnostics" code="LABSAVE" discount="500" minOrder="2,500" type="Fixed Amount" date="2024-11-15" />
                                <CouponRow sno="3" vendor="MediLife Services" code="WELCOME10" discount="10%" minOrder="500" type="Percentage" date="2024-10-20" />
                                <CouponRow sno="4" vendor="Wellness Hub" code="FLAT200" discount="200" minOrder="1,000" type="Fixed Amount" date="2024-09-05" />
                            </tbody>
                        </table>
                    </div>

                    {/* Empty state footer hint */}
                    <div className="p-6 bg-gray-50/30 text-center">
                        <p className="text-xs text-gray-400 font-medium italic">Showing all active records for the selected vendor category.</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

// Reusable Row Component for clean code
const CouponRow = ({ sno, vendor, code, discount, minOrder, type, date }) => (
    <tr className="hover:bg-gray-50/80 transition-colors">
        <td className="px-6 py-4 text-sm font-medium text-gray-400">{sno}</td>
        <td className="px-6 py-4 text-sm font-bold text-gray-800">{vendor}</td>
        <td className="px-6 py-4">
            <span className="bg-green-50 text-[#08b36a] px-3 py-1 rounded-lg font-mono font-bold text-xs border border-green-100 uppercase">
                {code}
            </span>
        </td>
        <td className="px-6 py-4 text-sm font-black text-gray-700">
            {type === 'Percentage' ? `${discount}` : `₹${discount}`}
        </td>
        <td className="px-6 py-4 text-sm text-gray-600 font-medium">₹{minOrder}</td>
        <td className="px-6 py-4">
            <span className="text-[10px] font-black uppercase px-2 py-1 bg-gray-100 text-gray-500 rounded tracking-tighter">
                {type}
            </span>
        </td>
        <td className="px-6 py-4 text-sm text-gray-500 font-medium italic">{date}</td>
    </tr>
);

export default VendorManagementPage;