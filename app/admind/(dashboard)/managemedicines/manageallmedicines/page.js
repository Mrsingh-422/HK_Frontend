"use client";
import React, { useState } from 'react';
import { HiOutlineSearch, HiOutlineFilter, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import { AiOutlineEye, AiOutlineCloudUpload } from 'react-icons/ai';
import { MdOutlineMedicalServices, MdOutlineWarningAmber, MdOutlineInventory2 } from 'react-icons/md';

// Updated Dummy Data with Verification Status
const initialMedicines = [
    { id: "#MED-001", name: "Paracetamol", category: "Analgesic", stock: 120, price: "$5.00", verificationStatus: "Approved" },
    { id: "#MED-002", name: "Amoxicillin", category: "Antibiotic", stock: 45, price: "$12.50", verificationStatus: "Approved" },
    { id: "#MED-003", name: "Ibuprofen", category: "Analgesic", stock: 0, price: "$8.00", verificationStatus: "Rejected" },
    { id: "#MED-004", name: "Metformin", category: "Antidiabetic", stock: 85, price: "$15.00", verificationStatus: "Approved" },
    { id: "#MED-005", name: "Atorvastatin", category: "Statins", stock: 60, price: "$20.00", verificationStatus: "Rejected" },
    { id: "#MED-006", name: "Cetirizine", category: "Antihistamine", stock: 200, price: "$3.00", verificationStatus: "Approved" },
];

function Page() {
    const themeColor = "#08B36A";

    // States for filtering
    const [activeTab, setActiveTab] = useState("All"); // All, Approved, Rejected
    const [searchTerm, setSearchTerm] = useState("");

    // Filter Logic
    const filteredMedicines = initialMedicines.filter((med) => {
        const matchesTab = activeTab === "All" || med.verificationStatus === activeTab;
        const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            med.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="min-h-screen p-4 bg-gray-50/50">
            <div className="max-w-[1400px] mx-auto space-y-6">
  
                {/* 1. STATS SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Medicines" value={initialMedicines.length} icon={<MdOutlineInventory2 size={24} />} color={themeColor} />
                    <StatCard title="Low Stock Alert" value="12" icon={<MdOutlineWarningAmber size={24} />} color="#F59E0B" />
                    <StatCard title="Categories" value="24" icon={<MdOutlineMedicalServices size={24} />} color="#3B82F6" />
                </div>

                {/* 2. ACTION BAR */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#08B36A] focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button className="flex flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-all">
                            <HiOutlineFilter size={18} />
                            Filters
                        </button>
                        <button
                            style={{ backgroundColor: themeColor }}
                            className="flex flex-1 md:flex-none items-center justify-center gap-2 text-white px-5 py-2 rounded-lg shadow-lg shadow-green-900/10 hover:brightness-110 transition-all font-semibold"
                        >
                            <AiOutlineCloudUpload size={20} />
                            Import CSV
                        </button>
                    </div>
                </div>

                {/* 3. CATEGORY TABS */}
                <div className="flex items-center gap-2 p-1 bg-gray-200/50 w-fit rounded-xl border border-gray-200">
                    {["All", "Approved", "Rejected"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab
                                ? "bg-white text-[#08B36A] shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* 4. TABLE SECTION */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Medicine Name</th>
                                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredMedicines.length > 0 ? (
                                filteredMedicines.map((med) => (
                                    <tr key={med.id} className="hover:bg-green-50/30 transition-colors group">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-400">{med.id}</td>
                                        <td className="px-6 py-4 font-semibold text-gray-800">{med.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded font-medium">{med.category}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${med.verificationStatus === 'Approved' ? 'text-green-600' : 'text-red-500'
                                                }`}>
                                                {med.verificationStatus === 'Approved' ? <HiCheckCircle size={16} /> : <HiXCircle size={16} />}
                                                {med.verificationStatus}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-20 bg-gray-200 rounded-full h-1.5 hidden lg:block">
                                                    <div
                                                        className="h-1.5 rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${Math.min(med.stock / 2, 100)}%`,
                                                            backgroundColor: med.stock === 0 ? '#EF4444' : med.stock < 50 ? '#F59E0B' : themeColor
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className={`text-sm font-bold ${med.stock === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                                                    {med.stock}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-700">{med.price}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-[#08B36A] group-hover:shadow-md transition-all"
                                                title="View Details"
                                            >
                                                <AiOutlineEye size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-400 font-medium">
                                        No medicines found in "{activeTab}" category.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* FOOTER */}
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 font-medium">
                        <span>Showing {filteredMedicines.length} of {initialMedicines.length} medicines</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border rounded hover:bg-gray-50 transition-colors">Previous</button>
                            <button className="px-3 py-1 border rounded bg-white text-[#08B36A] shadow-sm font-bold">1</button>
                            <button className="px-3 py-1 border rounded hover:bg-gray-50 transition-colors">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}15`, color: color }}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}

export default Page;