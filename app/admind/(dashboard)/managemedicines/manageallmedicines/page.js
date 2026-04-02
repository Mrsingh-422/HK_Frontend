"use client";
import React, { useState, useEffect, useRef } from 'react';
import { HiOutlineSearch, HiOutlineRefresh, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { AiOutlineEye, AiOutlineCloudUpload, AiOutlineLoading3Quarters, AiOutlinePlus, AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { MdOutlineMedicalServices, MdOutlineInventory2, MdOutlineStorefront } from 'react-icons/md';

import AdminAPI from '@/app/services/AdminAPI';
import MedicineDetailsModal from './components/MedicineDetailsModal';
import AddMedicineModal from './components/AddMedicineModal';

function Page() {
    const themeColor = "#08B36A";
    const fileInputRef = useRef(null);

    // States
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDocs, setTotalDocs] = useState(0);

    // Modals
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [editData, setEditData] = useState(null);

    useEffect(() => {
        fetchData();
    }, [page, searchTerm]);

    const fetchData = async () => {
        try {
            setLoading(true);
            let res;
            if (searchTerm) {
                res = await AdminAPI.adminSearchMedicines(searchTerm, page);
            } else {
                res = await AdminAPI.adminGetMedicinesList(page);
            }
            setMedicines(res.data || []);
            setTotalPages(res.totalPages || 1);
            setTotalDocs(res.totalDocs || 0);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMedicine = async (formData) => {
        try {
            if (editData) {
                await AdminAPI.adminUpdateMedicine(editData._id, formData);
                alert("Medicine Updated!");
            } else {
                await AdminAPI.adminCreateMedicine(formData);
                alert("Medicine Created!");
            }
            fetchData();
        } catch (error) {
            alert("Failed to save medicine");
            throw error;
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this medicine?")) {
            try {
                await AdminAPI.adminDeleteMedicine(id);
                alert("Deleted successfully");
                fetchData();
            } catch (error) { alert("Delete failed"); }
        }
    };

    const openEditModal = (med) => {
        setEditData(med);
        setIsAddModalOpen(true);
    };

    const resetFilters = () => {
        setSearchTerm("");
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 w-full overflow-x-hidden">
            <div className="max-w-full px-4 py-6 md:px-8 md:py-8 space-y-6">

                {/* HEADER SECTION */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Inventory Management</h1>
                </div>

                {/* STATS - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard title="Total Docs" value={totalDocs} icon={<MdOutlineInventory2 size={22} />} color={themeColor} />
                    <StatCard title="Current View" value={searchTerm ? "Search" : "Standard"} icon={<HiOutlineSearch size={22} />} color="#F59E0B" />
                    <StatCard title="Page Sync" value={`${page}/${totalPages}`} icon={<MdOutlineMedicalServices size={22} />} color="#3B82F6" />
                </div>

                {/* SEARCH & ACTIONS - Better Screen Fit */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
                    <div className="relative flex-grow max-w-full xl:max-w-xl">
                        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#08B36A] font-bold text-sm transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <input type="file" accept=".xlsx, .xls, .csv" ref={fileInputRef} className="hidden" onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setIsUploading(true);
                            try { await AdminAPI.adminUploadMedicinesExcel(file); alert("Excel Uploaded!"); fetchData(); }
                            catch (err) { alert("Upload error"); }
                            finally { setIsUploading(false); e.target.value = ""; }
                        }} />

                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="flex-1 md:flex-none justify-center bg-white border-2 border-gray-100 text-gray-500 px-5 py-3 rounded-xl font-black text-[11px] flex items-center gap-2 hover:bg-gray-50 transition-all uppercase tracking-widest"
                        >
                            {isUploading ? <AiOutlineLoading3Quarters className="animate-spin" /> : <AiOutlineCloudUpload size={18} />}
                            Import
                        </button>

                        <button
                            onClick={() => { setEditData(null); setIsAddModalOpen(true); }}
                            style={{ backgroundColor: themeColor }}
                            className="flex-1 md:flex-none justify-center text-white px-6 py-3 rounded-xl font-black text-[11px] flex items-center gap-2 shadow-lg shadow-green-100 hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest"
                        >
                            <AiOutlinePlus size={18} /> Add New
                        </button>
                    </div>
                </div>

                {/* TABLE CONTAINER - This handles the "out of screen" issue */}
                <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full min-w-[800px] border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Medicine Info</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Manufacturer</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Price</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-24">
                                            <div className="flex flex-col items-center gap-2">
                                                <AiOutlineLoading3Quarters className="animate-spin text-green-500" size={24} />
                                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Fetching Data...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : medicines.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center py-20 text-xs font-bold text-gray-400 uppercase tracking-widest">No matching records found</td></tr>
                                ) : medicines.map((med) => (
                                    <tr key={med._id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 p-1.5 shrink-0 flex items-center justify-center">
                                                    {med.image_url?.[0] ? (
                                                        <img src={med.image_url?.[0]} className="max-w-full max-h-full object-contain" alt="" />
                                                    ) : (
                                                        <MdOutlineStorefront size={20} className="text-gray-200" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-gray-800 text-sm uppercase truncate max-w-[200px]">{med.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase truncate">{med.packaging}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase italic">
                                            {med.manufacturers || "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-black text-gray-900 text-sm">₹{med.best_price}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center items-center gap-1">
                                                <button onClick={() => { setSelectedMedicine(med); setIsDetailModalOpen(true); }} className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="View"><AiOutlineEye size={18} /></button>
                                                <button onClick={() => openEditModal(med)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors" title="Edit"><AiOutlineEdit size={18} /></button>
                                                <button onClick={() => handleDelete(med._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Delete"><AiOutlineDelete size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION - Mobile Friendly */}
                    {!loading && totalPages > 1 && (
                        <div className="px-6 py-4 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {totalDocs} Total Records
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-black uppercase tracking-widest disabled:opacity-30 shadow-sm transition-all active:scale-95"
                                >
                                    <HiChevronLeft size={16} />
                                </button>
                                <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-black text-gray-700 shadow-sm">
                                    PAGE {page} / {totalPages}
                                </div>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-black uppercase tracking-widest disabled:opacity-30 shadow-sm transition-all active:scale-95"
                                >
                                    <HiChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <MedicineDetailsModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} medicine={selectedMedicine} themeColor={themeColor} />
            <AddMedicineModal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setEditData(null); }} onSave={handleSaveMedicine} themeColor={themeColor} initialData={editData} />
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
            <div className="p-3.5 rounded-xl shrink-0" style={{ backgroundColor: `${color}10`, color: color }}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 truncate">{title}</p>
                <p className="text-xl font-black text-gray-800 truncate">{value}</p>
            </div>
        </div>
    );
}

export default Page;