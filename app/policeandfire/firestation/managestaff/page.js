'use client'
import React, { useState, useEffect } from 'react'
import { 
    FaUserPlus, FaSearch, FaTimes, FaUserTie, FaIdBadge, 
    FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaLock, 
    FaSpinner, FaEye, FaShieldAlt, FaCheckCircle
} from 'react-icons/fa'

// API Import (Apne path ke hisaab se adjust karein)
import FireStationAPI from '@/app/services/FireStationAPI'

export default function StaffManagementPage() {
    // --- STATES ---
    const [staffList, setStaffList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    
    // Form States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        badgeId: '',
        rank: '',
        mobileNumber: '',
        officialEmail: '',
        password: '',
        address: ''
    });

    // --- FETCH DATA ---
    const fetchStaffList = async () => {
        setIsLoading(true);
        try {
            const res = await FireStationAPI.GetStaffList();
            if (res.success) {
                setStaffList(res.data);
            }
        } catch (error) {
            console.error("Error fetching staff list:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffList();
    }, []);

    // --- FORM HANDLERS ---
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');

        try {
            const res = await FireStationAPI.AddStaff(formData);
            if (res.success) {
                // Refresh list & Close modal
                fetchStaffList();
                setIsAddModalOpen(false);
                // Reset form
                setFormData({ fullName: '', badgeId: '', rank: '', mobileNumber: '', officialEmail: '', password: '', address: '' });
            } else {
                setFormError(res.message || "Failed to add staff");
            }
        } catch (error) {
            console.error("Error adding staff:", error);
            setFormError(error.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- RENDER HELPERS ---
    const openDetailModal = (staff) => {
        setSelectedStaff(staff);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Management</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Manage fire station personnel, roles, and access</p>
                </div>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-[#08B36A] hover:bg-[#069356] text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-100 transition-all active:scale-95"
                >
                    <FaUserPlus size={14} /> Add New Staff
                </button>
            </div>

            {/* --- DATA TABLE SECTION --- */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <FaShieldAlt className="text-[#08B36A]"/> Registered Personnel
                    </h2>
                    <div className="relative w-64">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
                        <input 
                            type="text" 
                            placeholder="Search by Name or Badge..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <FaSpinner className="animate-spin text-4xl text-[#08B36A] mb-4"/>
                            <p className="text-xs font-bold uppercase tracking-widest">Loading Records...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                                    <th className="px-8 py-4">Badge ID</th>
                                    <th className="px-6 py-4">Staff Details</th>
                                    <th className="px-6 py-4">Rank / Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {staffList.map((staff) => (
                                    <tr 
                                        key={staff._id} 
                                        onClick={() => openDetailModal(staff)}
                                        className="hover:bg-slate-50/50 transition-all cursor-pointer group"
                                    >
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">{staff.badgeId}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800">{staff.fullName}</span>
                                                <span className="text-[10px] font-bold text-slate-400 mt-0.5">{staff.mobileNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-[#08B36A]">{staff.rank}</span>
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{staff.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 w-max ${
                                                staff.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                                            }`}>
                                                {staff.status === 'Active' && <FaCheckCircle size={10}/>} {staff.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <button className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl group-hover:text-[#08B36A] group-hover:border-[#08B36A]/30 transition-all shadow-sm">
                                                <FaEye size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {staffList.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-slate-500 font-medium">No staff members found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ========================================================= */}
            {/* 1. ADD NEW STAFF MODAL */}
            {/* ========================================================= */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-50 text-[#08B36A] rounded-2xl shadow-inner">
                                    <FaUserPlus size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Enroll New Staff</h3>
                                    <p className="text-slate-400 font-medium text-[11px] uppercase tracking-widest mt-1">Add credentials to system</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><FaTimes size={18} /></button>
                        </div>

                        {/* Modal Form Body */}
                        <form onSubmit={handleAddStaff} className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                            
                            {formError && (
                                <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 flex items-center gap-2">
                                    <FaTimes className="shrink-0"/> {formError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                    <div className="relative">
                                        <FaUserTie className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="e.g. John Doe" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all" />
                                    </div>
                                </div>

                                {/* Badge ID */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Badge ID</label>
                                    <div className="relative">
                                        <FaIdBadge className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input required type="text" name="badgeId" value={formData.badgeId} onChange={handleInputChange} placeholder="e.g. FD-101" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all" />
                                    </div>
                                </div>

                                {/* Rank */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Rank / Designation</label>
                                    <div className="relative">
                                        <FaShieldAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <select required name="rank" value={formData.rank} onChange={handleInputChange} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all appearance-none cursor-pointer">
                                            <option value="">Select Rank</option>
                                            <option value="Fire Chief">Fire Chief</option>
                                            <option value="Captain">Captain</option>
                                            <option value="Lead Firefighter">Lead Firefighter</option>
                                            <option value="Firefighter">Firefighter</option>
                                            <option value="Dispatcher">Dispatcher</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Mobile Number */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mobile Number</label>
                                    <div className="relative">
                                        <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input required type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} placeholder="10-digit number" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all" />
                                    </div>
                                </div>

                                {/* Official Email */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Official Email</label>
                                    <div className="relative">
                                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input required type="email" name="officialEmail" value={formData.officialEmail} onChange={handleInputChange} placeholder="john@fire.com" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all" />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Account Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input required type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Create secure password" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all" />
                                    </div>
                                </div>

                                {/* Address (Full Width) */}
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Residential Address</label>
                                    <div className="relative">
                                        <FaMapMarkerAlt className="absolute left-4 top-4 text-slate-300" />
                                        <textarea required name="address" value={formData.address} onChange={handleInputChange} rows="3" placeholder="Enter complete address" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all resize-none"></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-4">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-3.5 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="bg-[#08B36A] text-white px-8 py-3.5 rounded-2xl text-[11px] font-black shadow-xl shadow-green-100 uppercase tracking-widest active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                    {isSubmitting ? <><FaSpinner className="animate-spin" /> Saving...</> : 'Confirm & Enroll'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {/* ========================================================= */}
            {/* 2. VIEW STAFF DETAIL MODAL (Read Only) */}
            {/* ========================================================= */}
            {isDetailModalOpen && selectedStaff && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsDetailModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        {/* Header Profile Info */}
                        <div className="p-8 bg-slate-50 flex flex-col items-center text-center relative border-b border-slate-100">
                            <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-6 right-6 p-2 bg-white text-slate-400 hover:text-red-500 rounded-full shadow-sm"><FaTimes size={16} /></button>
                            
                            <div className="w-24 h-24 bg-white border-4 border-green-100 rounded-full flex items-center justify-center text-[#08B36A] shadow-md mb-4 overflow-hidden">
                                {selectedStaff.profileImage ? (
                                    <img src={selectedStaff.profileImage} alt="Profile" className="w-full h-full object-cover"/>
                                ) : (
                                    <FaUserTie size={40} />
                                )}
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">{selectedStaff.fullName}</h3>
                            <p className="text-[#08B36A] font-bold text-sm mb-1">{selectedStaff.rank}</p>
                            <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase">{selectedStaff.badgeId}</span>
                        </div>

                        {/* Details List */}
                        <div className="p-8 space-y-5">
                            <DetailRow icon={<FaEnvelope/>} label="Official Email" value={selectedStaff.officialEmail} />
                            <DetailRow icon={<FaPhoneAlt/>} label="Mobile Number" value={selectedStaff.mobileNumber} />
                            <DetailRow icon={<FaMapMarkerAlt/>} label="Address" value={selectedStaff.address} />
                            
                            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                                <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Cases</p>
                                    <p className="text-2xl font-black text-slate-700">{selectedStaff.activeCases || 0}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attendance</p>
                                    <p className="text-2xl font-black text-[#08B36A]">{selectedStaff.attendance || 0}%</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    )
}

// Small helper component for Detail Modal Rows
function DetailRow({ icon, label, value }) {
    return (
        <div className="flex items-start gap-4">
            <div className="mt-1 text-slate-300">{icon}</div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{value}</p>
            </div>
        </div>
    )
}