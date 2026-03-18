"use client";
import React, { useState, useMemo, useRef } from 'react';
import { HiOutlineSearch, HiCheckCircle, HiXCircle, HiOutlineRefresh } from 'react-icons/hi';
import { AiOutlineEye, AiOutlineCloudUpload, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdOutlineMedicalServices, MdOutlineWarningAmber, MdOutlineInventory2 } from 'react-icons/md';

// Dummy Data
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
    const fileInputRef = useRef(null);

    // States for filtering
    const [activeTab, setActiveTab] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [stockFilter, setStockFilter] = useState("All");

    // State for CSV Upload
    const [isUploading, setIsUploading] = useState(false);

    // --- CSV LOGIC START ---

    /**
     * This function is designed to be moved to your Context/Service layer later.
     */
    const addMedicineByAdminCSV = async (file) => {
        // Here you would typically use your Context API function
        // Example: const response = await uploadCSV(file);

        console.log("Attempting to upload:", file.name);

        // Simulating a backend multipart/form-data request
        const formData = new FormData();
        formData.append('file', file);

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success
                resolve({ success: true, message: "File uploaded successfully" });
                // reject(new Error("Upload failed")); // For testing error states
            }, 2000);
        });
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate extension
        if (!file.name.endsWith('.csv')) {
            alert("Please select a valid CSV file.");
            return;
        }

        setIsUploading(true);
        try {
            // Calling the API function
            const result = await addMedicineByAdminCSV(file);

            // Success feedback
            alert(result.message || "Medicines imported successfully!");

            // OPTIONAL: Refresh your local medicine list here 
            // fetchMedicines(); 

        } catch (error) {
            // Error feedback
            console.error("Upload failed:", error);
            alert(error.message || "Failed to upload CSV. Please try again.");
        } finally {
            setIsUploading(false);
            // Reset the input so the same file can be uploaded again if needed
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // --- CSV LOGIC END ---

    // Filter Logic
    const categories = ["All", ...new Set(initialMedicines.map(m => m.category))];

    const filteredMedicines = useMemo(() => {
        return initialMedicines.filter((med) => {
            const matchesTab = activeTab === "All" || med.verificationStatus === activeTab;
            const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                med.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === "All" || med.category === categoryFilter;

            let matchesStock = true;
            if (stockFilter === "Low") matchesStock = med.stock > 0 && med.stock < 50;
            if (stockFilter === "Out") matchesStock = med.stock === 0;
            if (stockFilter === "In") matchesStock = med.stock >= 50;

            return matchesTab && matchesSearch && matchesCategory && matchesStock;
        });
    }, [searchTerm, categoryFilter, stockFilter, activeTab]);

    const resetFilters = () => {
        setSearchTerm("");
        setCategoryFilter("All");
        setStockFilter("All");
        setActiveTab("All");
    };

    return (
        <div className="min-h-screen p-4 bg-gray-50/50">
            <div className="max-w-[1400px] mx-auto space-y-6">

                {/* STATS SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Total Medicines" value={initialMedicines.length} icon={<MdOutlineInventory2 size={24} />} color={themeColor} />
                    <StatCard title="Low Stock Alert" value="12" icon={<MdOutlineWarningAmber size={24} />} color="#F59E0B" />
                    <StatCard title="Categories" value={categories.length - 1} icon={<MdOutlineMedicalServices size={24} />} color="#3B82F6" />
                </div>

                {/* ADVANCED FILTER BAR */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-gray-800">Inventory Management</h2>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={resetFilters}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <HiOutlineRefresh size={18} />
                                Reset
                            </button>

                            {/* HIDDEN FILE INPUT */}
                            <input
                                type="file"
                                accept=".csv"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                            />

                            <button
                                disabled={isUploading}
                                onClick={() => fileInputRef.current.click()}
                                style={{ backgroundColor: themeColor }}
                                className={`flex items-center gap-2 text-white px-5 py-2 rounded-lg shadow-lg shadow-green-900/10 hover:brightness-110 transition-all font-semibold text-sm ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isUploading ? (
                                    <AiOutlineLoading3Quarters className="animate-spin" size={20} />
                                ) : (
                                    <AiOutlineCloudUpload size={20} />
                                )}
                                {isUploading ? "Uploading..." : "Import CSV"}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search Input */}
                        <div className="relative">
                            <label className="text-[11px] font-bold text-gray-400 uppercase mb-1 block ml-1">Search Medicine</label>
                            <div className="relative">
                                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#08B36A] focus:bg-white transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Category Dropdown */}
                        <div>
                            <label className="text-[11px] font-bold text-gray-400 uppercase mb-1 block ml-1">Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#08B36A] focus:bg-white transition-all text-sm appearance-none cursor-pointer"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Stock Status Dropdown */}
                        <div>
                            <label className="text-[11px] font-bold text-gray-400 uppercase mb-1 block ml-1">Stock Status</label>
                            <select
                                value={stockFilter}
                                onChange={(e) => setStockFilter(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#08B36A] focus:bg-white transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option value="All">All Stock Levels</option>
                                <option value="In">In Stock (50+)</option>
                                <option value="Low">Low Stock (&lt; 50)</option>
                                <option value="Out">Out of Stock (0)</option>
                            </select>
                        </div>

                        {/* Verification Status */}
                        <div>
                            <label className="text-[11px] font-bold text-gray-400 uppercase mb-1 block ml-1">Verification</label>
                            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                                {["All", "Approved", "Rejected"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab
                                            ? "bg-white text-[#08B36A] shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
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
                                            No medicines found matching your current filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* FOOTER */}
                    <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 font-medium">
                        <span>Showing {filteredMedicines.length} of {initialMedicines.length} medicines</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border rounded hover:bg-gray-50 transition-colors">Previous</button>
                            <button className="px-3 py-1 border rounded bg-white text-[#08B36A] shadow-sm font-bold border-[#08B36A]/20">1</button>
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