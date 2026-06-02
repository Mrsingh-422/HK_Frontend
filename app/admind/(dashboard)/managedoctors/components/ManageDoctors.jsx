'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    FaEye, FaUserMd, FaPhoneAlt, FaSpinner, FaStethoscope,
    FaSyncAlt, FaSearch, FaMapMarkerAlt, FaCircle, FaUserTag
} from "react-icons/fa"
import AdminAPI from '@/app/services/AdminAPI';
import DoctorDetailsModal from './DoctorDetailsModal';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.26:5002";

export const formatImageUrl = (path) => {
    if (!path) return null;
    const cleanPath = path.replace(/^public[\\/]/, '').replace(/\\/g, '/');
    return `${BASE_URL}/${cleanPath}`;
};

const ManageDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const fetchDoctors = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await AdminAPI.getIndependentDoctorsList(1, 100, search, statusFilter);
            setDoctors(res.data || []);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

    const handleToggleActive = async (id) => {
        try {
            const response = await AdminAPI.toggleActiveOrInactiveIndependentDoctor(id);
            if (response.success) {
                setDoctors(prev => prev.map(doc =>
                    doc._id === id ? { ...doc, isActive: !doc.isActive } : doc
                ));
            }
        } catch (error) { console.error(error); }
    };

    const handleVerifyStatus = async (id, status, reason = "") => {
        try {
            const response = await AdminAPI.approveOrRejectIndependentDoctor(id, status, reason);
            if (response.success) {
                fetchDoctors();
                setIsModalOpen(false);
            }
        } catch (error) { alert("Action failed."); }
    };

    if (isLoading && doctors.length === 0) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-slate-100">
                <FaSpinner className="animate-spin text-[#08B36A]" size={30} />
                <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">Loading Profiles...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 p-4">
            {/* Professional Filters Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm">
                <div className="relative flex-1 min-w-[300px]">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search by doctor name..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#08B36A] outline-none transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <select
                        className="px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-500 outline-none cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Profile Status</option>
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Incomplete">Incomplete</option>
                    </select>
                    <button onClick={fetchDoctors} className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-[#08B36A] hover:text-white transition-all shadow-sm">
                        <FaSyncAlt size={14} />
                    </button>
                </div>
            </div>

            {/* Redesigned Professional Table */}
            <div className="overflow-x-auto bg-white rounded-[1.5rem] border border-slate-100 shadow-md">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">S No.</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Doctor Identity</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact & Role</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Location</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Duty</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">App Access</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Profile Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {doctors.map((doc, index) => (
                            <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5 text-xs font-bold text-slate-400">{(index + 1).toString().padStart(2, '0')}</td>

                                {/* Identity Cell */}
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-[#08B36A] overflow-hidden border border-slate-200 shadow-sm relative">
                                            {doc.profileImage ? (
                                                <img src={formatImageUrl(doc.profileImage)} className="w-full h-full object-cover" alt="dr" />
                                            ) : (<FaUserMd size={24} />)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 leading-none mb-1">{doc.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                {doc.qualification || 'N/A'} • <span className="text-[#08B36A]">{doc.speciality}</span>
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Contact & Role Cell */}
                                <td className="px-6 py-5">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                            <FaPhoneAlt size={10} className="text-[#08B36A]" /> {doc.phone}
                                        </div>
                                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{doc.email}</div>
                                        <div className={`mt-1 inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-md w-fit ${doc.role === 'hospital-doctor' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                            <FaUserTag size={8} /> {doc.role?.replace('-', ' ')}
                                        </div>
                                    </div>
                                </td>

                                {/* Location Cell */}
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                        <FaMapMarkerAlt size={12} className="text-red-400" />
                                        <span>{doc.city}, {doc.state}</span>
                                    </div>
                                </td>

                                {/* Duty Status Cell */}
                                <td className="px-6 py-5 text-center">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${doc.dutyStatus === 'On Duty' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <FaCircle size={6} className={doc.dutyStatus === 'On Duty' ? 'animate-pulse' : ''} />
                                        {doc.dutyStatus || 'Offline'}
                                    </div>
                                </td>

                                {/* App Access Toggle */}
                                <td className="px-6 py-5 text-center">
                                    <button
                                        onClick={() => handleToggleActive(doc._id)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all shadow-inner ${doc.isActive ? 'bg-[#08B36A]' : 'bg-slate-200'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md ${doc.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </td>

                                {/* Profile Status Badge */}
                                <td className="px-6 py-5 text-center">
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${doc.profileStatus === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            doc.profileStatus === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                                doc.profileStatus === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-slate-50 text-slate-400 border-slate-100'
                                        }`}>
                                        {doc.profileStatus}
                                    </span>
                                </td>

                                {/* View Action */}
                                <td className="px-6 py-5 text-right">
                                    <button
                                        onClick={() => { setSelectedDoctor(doc); setIsModalOpen(true); }}
                                        className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-[#08B36A] hover:border-[#08B36A] rounded-2xl transition-all shadow-sm group-hover:scale-110"
                                    >
                                        <FaEye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <DoctorDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                doctor={selectedDoctor}
                onAction={handleVerifyStatus}
                onToggle={handleToggleActive}
            />
        </div>
    )
}

export default ManageDoctors;