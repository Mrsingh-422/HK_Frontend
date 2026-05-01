"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
 // Adjust this import path to your actual api file
import { HiOutlineSearch, HiOutlineRefresh, HiOutlinePhotograph } from 'react-icons/hi';
import { AiOutlineCloudUpload, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdOutlineMedicalServices, MdOutlineCategory } from 'react-icons/md';
import AdminAPI from '@/app/services/AdminAPI2';

function ManageCategories() {
    const themeColor = "#08B36A";
    const fileInputRef = useRef(null);

    // States
    const [activeTab, setActiveTab] = useState("Lab"); // "Lab" or "Pharmacy"
    const [labCategories, setLabCategories] = useState([]);
    const [pharmacyCategories, setPharmacyCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategoryName, setSelectedCategoryName] = useState("");

    // Initial Fetch
    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setIsLoading(true);
        try {
            const [labRes, pharmRes] = await Promise.all([
                AdminAPI.getLabCategories(),
                AdminAPI.getPharmacyCategories()
            ]);

            if (labRes.data.success) setLabCategories(labRes.data.data);
            if (pharmRes.data.success) setPharmacyCategories(pharmRes.data.data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter Logic (adapted from your reference)
    const currentList = activeTab === "Lab" ? labCategories : pharmacyCategories;
    
    const filteredCategories = useMemo(() => {
        return currentList.filter((cat) =>
            cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, currentList]);

    // Image Upload Logic
    const handleUpdateBtnClick = (name) => {
        setSelectedCategoryName(name);
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const onFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file || !selectedCategoryName) return;

        // Validation
        if (!file.type.startsWith('image/')) {
            alert("Please select an image file.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('categoryName', selectedCategoryName);
        formData.append('categoryImage', file);

        try {
            let response;
            if (activeTab === "Lab") {
                response = await AdminAPI.updateLabCategoryImage(formData);
            } else {
                response = await AdminAPI.updatePharmacyCategoryImage(formData);
            }

            if (response.data.success) {
                alert("Category image updated successfully!");
                loadAllData(); // Refresh list
            }
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Failed to update image. Please try again.");
        } finally {
            setIsUploading(false);
            setSelectedCategoryName("");
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const resetFilters = () => {
        setSearchTerm("");
        loadAllData();
    };

    return (
        <div className="min-h-screen p-4 bg-gray-50/50">
            <div className="max-w-[1400px] mx-auto space-y-6">

                {/* HIDDEN FILE INPUT */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileSelect}
                    accept="image/*"
                    className="hidden"
                />

                {/* STATS SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard 
                        title="Lab Categories" 
                        value={labCategories.length} 
                        icon={<MdOutlineMedicalServices size={24} />} 
                        color={themeColor} 
                    />
                    <StatCard 
                        title="Pharmacy Categories" 
                        value={pharmacyCategories.length} 
                        icon={<MdOutlineCategory size={24} />} 
                        color="#3B82F6" 
                    />
                </div>

                {/* SEARCH AND TABS BAR */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-gray-800">Category Image Management</h2>
                        
                        <div className="flex items-center gap-3">
                            <button
                                onClick={resetFilters}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <HiOutlineRefresh size={18} />
                                Sync Data
                            </button>

                            {/* TAB SYSTEM FROM REFERENCE */}
                            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                                {["Lab", "Pharmacy"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => { setActiveTab(tab); setSearchTerm(""); }}
                                        className={`px-6 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            activeTab === tab
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="text-[11px] font-bold text-gray-400 uppercase mb-1 block ml-1">Search Name</label>
                            <div className="relative">
                                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab} categories...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#08B36A] transition-all text-sm"
                                />
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
                                    <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Preview</th>
                                    <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Category Name</th>
                                    {activeTab === "Pharmacy" && (
                                        <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Products</th>
                                    )}
                                    <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center">
                                            <AiOutlineLoading3Quarters className="animate-spin inline-block mr-2" size={24} />
                                            Loading categories...
                                        </td>
                                    </tr>
                                ) : filteredCategories.length > 0 ? (
                                    filteredCategories.map((cat, index) => (
                                        <tr key={index} className="hover:bg-green-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="w-14 h-14 rounded-lg border bg-gray-50 overflow-hidden flex items-center justify-center">
                                                    {cat.image ? (
                                                        <img 
                                                            src={cat.image.startsWith('uploads') ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${cat.image}` : cat.image} 
                                                            alt={cat.name} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <HiOutlinePhotograph className="text-gray-300" size={24} />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-800">{cat.name}</td>
                                            {activeTab === "Pharmacy" && (
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
                                                        {cat.productCount} Items
                                                    </span>
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleUpdateBtnClick(cat.name)}
                                                    disabled={isUploading}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:text-white hover:bg-[#08B36A] hover:border-[#08B36A] transition-all shadow-sm"
                                                >
                                                    {isUploading && selectedCategoryName === cat.name ? (
                                                        <AiOutlineLoading3Quarters className="animate-spin" size={16} />
                                                    ) : (
                                                        <AiOutlineCloudUpload size={18} />
                                                    )}
                                                    Update Image
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">
                                            No categories found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}

// Reusable Stat Card (from reference)
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

export default ManageCategories;