'use client'
import React, { useState, useEffect } from 'react'
import { 
    FaSpinner, FaCalendarAlt, FaCheck, FaTimes, 
    FaUserTie, FaRegCommentDots, FaCoffee, FaCalendarCheck,
    FaPlus, FaPaperclip
} from 'react-icons/fa'

// API Import (Adjust path as needed)
import FireStationAPI from '@/app/services/FireStationAPI'

export default function LeaveManagementPage() {
    // --- STATES FOR PENDING LEAVES ---
    const [leaveList, setLeaveList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null); 
    const [rejectingLeaveId, setRejectingLeaveId] = useState(null);
    const [rejectReason, setRejectReason] = useState("");

    // --- STATES FOR CREATE LEAVE MODAL ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [leaveCategories, setLeaveCategories] = useState([]);
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Data State
    const [formData, setFormData] = useState({
        staffId: '',
        leaveType: '',
        fromDate: '',
        toDate: '',
        reason: '',
        attachment: null
    });

    // --- FETCH INITIAL DATA ---
    const fetchPendingLeaves = async () => {
        setIsLoading(true);
        try {
            const res = await FireStationAPI.GetPendingLeaves();
            if (res.success) setLeaveList(res.data || []);
        } catch (error) {
            console.error("Error fetching pending leaves:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingLeaves();
    }, []);

    // --- FETCH DROPDOWN DATA FOR MODAL ---
    const openCreateModal = async () => {
        setIsCreateModalOpen(true);
        setIsFormLoading(true);
        
        // Reset form when opening
        setFormData({ staffId: '', leaveType: '', fromDate: '', toDate: '', reason: '', attachment: null });

        try {
            const [staffRes, enumsRes] = await Promise.all([
                FireStationAPI.GetStaffDropdown(),
                FireStationAPI.GetLeaveEnums()
            ]);
            if (staffRes.success) setStaffList(staffRes.data || []);
            if (enumsRes.success) setLeaveCategories(enumsRes.data || []);
        } catch (error) {
            console.error("Error loading dropdown data:", error);
        } finally {
            setIsFormLoading(false);
        }
    };

    // --- HANDLE CREATE SUBMIT ---
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = new FormData();
            payload.append('staffId', formData.staffId);
            payload.append('leaveType', formData.leaveType);
            payload.append('fromDate', formData.fromDate);
            payload.append('toDate', formData.toDate);
            payload.append('reason', formData.reason);
            
            if (formData.attachment) {
                payload.append('attachment', formData.attachment);
            }

            const res = await FireStationAPI.CreateLeaveRequest(payload);
            if (res.success) {
                alert("Leave request created successfully!");
                setIsCreateModalOpen(false);
                fetchPendingLeaves(); // Refresh the list
            } else {
                alert(res.message || "Failed to create leave.");
            }
        } catch (error) {
            console.error("Error creating leave:", error);
            alert("Something went wrong while submitting the request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- HANDLE APPROVE / REJECT ---
    const handleAction = async (leaveId, actionStatus) => {
        if (actionStatus === 'Rejected' && rejectReason.trim() === '') {
            alert("Please provide a reason for rejection.");
            return;
        }

        setProcessingId(leaveId);
        try {
            const payload = { status: actionStatus };
            if (actionStatus === 'Rejected') payload.rejectionReason = rejectReason;

            const res = await FireStationAPI.UpdateLeaveStatus(leaveId, payload);
            if (res.success) {
                setLeaveList(prev => prev.filter(leave => leave._id !== leaveId));
                setRejectingLeaveId(null);
                setRejectReason("");
            } else {
                alert(res.message || `Failed to ${actionStatus} leave.`);
            }
        } catch (error) {
            console.error(`Error updating leave status:`, error);
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 relative">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Duty Roster & Leaves</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Review pending requests and create new ones</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-orange-50 text-orange-600 px-5 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 border border-orange-100 hidden sm:flex">
                        <FaCalendarAlt size={14} /> Pending: {leaveList.length}
                    </div>
                    {/* NEW: CREATE REQUEST BUTTON */}
                    <button 
                        onClick={openCreateModal}
                        className="bg-[#08B36A] hover:bg-[#069356] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md shadow-green-200 transition-all active:scale-95"
                    >
                        <FaPlus size={12}/> New Request
                    </button>
                </div>
            </div>

            {/* --- DATA LIST SECTION --- */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
                <div className="p-6 border-b border-slate-50 bg-white">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <FaCalendarCheck className="text-[#08B36A]" /> Pending Action Queue
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                            <FaSpinner className="animate-spin text-4xl text-[#08B36A] mb-4"/>
                            <p className="text-xs font-bold uppercase tracking-widest">Loading Requests...</p>
                        </div>
                    ) : leaveList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-28 text-center px-4">
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-[#08B36A] mb-6 shadow-inner">
                                <FaCoffee size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">All Caught Up!</h3>
                            <p className="text-slate-400 text-sm font-medium max-w-sm">There are no pending leave requests at the moment. Your desk is clear.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.15em] border-y border-slate-50">
                                    <th className="px-8 py-4">Staff Details</th>
                                    <th className="px-6 py-4">Leave Duration</th>
                                    <th className="px-6 py-4">Reason & Type</th>
                                    <th className="px-6 py-4 text-center">Review Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {leaveList.map((leave) => {
                                    const fullName = leave?.staffId?.fullName || leave?.fullName || 'Unknown Staff';
                                    const badgeId = leave?.staffId?.badgeId || leave?.badgeId || 'N/A';
                                    const rank = leave?.staffId?.rank || leave?.rank || 'Staff';
                                    const profileImg = leave?.staffId?.profileImage || leave?.profileImage || null;

                                    const isProcessing = processingId === leave._id;
                                    const isRejecting = rejectingLeaveId === leave._id;

                                    return (
                                        <tr key={leave._id} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200 shrink-0">
                                                        {profileImg ? <img src={profileImg} alt="Profile" className="w-full h-full object-cover"/> : <FaUserTie size={18} />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-800 capitalize">{fullName}</span>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md tracking-wider">{badgeId}</span>
                                                            <span className="text-[10px] font-bold text-[#08B36A]">{rank}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700">
                                                        {formatDate(leave.fromDate)} <span className="text-slate-300 mx-1">→</span> {formatDate(leave.toDate)}
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mt-1">
                                                        {leave.duration ? `${leave.duration} Days Requested` : 'Duration Details'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 max-w-xs">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-1">{leave.leaveType || 'General Leave'}</span>
                                                    <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed flex gap-2 items-start">
                                                        <FaRegCommentDots className="text-slate-300 mt-1 shrink-0" />
                                                        {leave.reason || 'No specific reason provided.'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 align-middle">
                                                {isRejecting ? (
                                                    <div className="flex flex-col gap-2 min-w-[200px] animate-in slide-in-from-right-4 duration-300">
                                                        <input type="text" placeholder="Reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="text-xs p-2 border border-slate-300 rounded-lg outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 w-full" autoFocus />
                                                        <div className="flex gap-2 w-full">
                                                            <button onClick={() => handleAction(leave._id, 'Rejected')} disabled={isProcessing} className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1">
                                                                {isProcessing ? <FaSpinner className="animate-spin"/> : "Confirm"}
                                                            </button>
                                                            <button onClick={() => { setRejectingLeaveId(null); setRejectReason(""); }} disabled={isProcessing} className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors">
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => handleAction(leave._id, 'Approved')} disabled={isProcessing || rejectingLeaveId !== null} className="px-4 py-2 bg-green-50 text-[#08B36A] border border-green-200 hover:bg-[#08B36A] hover:text-white rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs font-bold">
                                                            {isProcessing && processingId === leave._id ? <FaSpinner className="animate-spin"/> : <FaCheck />} Approve
                                                        </button>
                                                        <button onClick={() => setRejectingLeaveId(leave._id)} disabled={isProcessing || rejectingLeaveId !== null} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-xs font-bold">
                                                            <FaTimes /> Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 CREATE NEW LEAVE MODAL (Figma Design) 🌟*/}
            {/* ========================================== */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsCreateModalOpen(false)}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div className="px-6 py-4 flex justify-between items-center bg-[#08B36A] text-white">
                            <h2 className="text-lg font-bold">New Request</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-all"><FaTimes size={18} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
                            
                            {/* Request Type Toggles (Static Visual as per Figma) */}
                            <div className="mb-6">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Request Type</p>
                                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                                    <span className="px-4 py-1.5 bg-[#08B36A] text-white text-xs font-bold rounded-full">Leave</span>
                                    <span className="px-4 py-1.5 border border-[#08B36A] text-[#08B36A] text-xs font-bold rounded-full">Present</span>
                                    <span className="px-4 py-1.5 border border-[#08B36A] text-[#08B36A] text-xs font-bold rounded-full whitespace-nowrap">Shift Change</span>
                                </div>
                            </div>

                            {isFormLoading ? (
                                <div className="flex justify-center py-10"><FaSpinner className="animate-spin text-3xl text-[#08B36A]"/></div>
                            ) : (
                                <form onSubmit={handleCreateSubmit} className="space-y-5">
                                    
                                    {/* Requesting For Dropdown */}
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Requesting For</label>
                                        <select 
                                            required
                                            value={formData.staffId}
                                            onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                                            className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 font-medium outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] appearance-none bg-white"
                                        >
                                            <option value="" disabled>Select Officer or Staff...</option>
                                            {staffList.map(staff => (
                                                <option key={staff._id} value={staff._id}>
                                                    {staff.fullName} ({staff.rank} - {staff.badgeId})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Leave Category Dropdown */}
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Leave Category</label>
                                        <select 
                                            required
                                            value={formData.leaveType}
                                            onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                                            className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 font-medium outline-none focus:border-[#08B36A] focus:ring-1 focus:ring-[#08B36A] appearance-none bg-white"
                                        >
                                            <option value="" disabled>Select Category...</option>
                                            {leaveCategories.map((cat, idx) => (
                                                <option key={idx} value={cat}>{cat} Leave</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Date Range */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">From</label>
                                            <input 
                                                type="date" 
                                                required
                                                value={formData.fromDate}
                                                onChange={(e) => setFormData({...formData, fromDate: e.target.value})}
                                                className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 font-medium outline-none focus:border-[#08B36A]" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">To</label>
                                            <input 
                                                type="date" 
                                                required
                                                value={formData.toDate}
                                                onChange={(e) => setFormData({...formData, toDate: e.target.value})}
                                                className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 font-medium outline-none focus:border-[#08B36A]" 
                                            />
                                        </div>
                                    </div>

                                    {/* Reason */}
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Reason</label>
                                        <textarea 
                                            required
                                            placeholder="Describe the reason for leave"
                                            rows="3"
                                            value={formData.reason}
                                            onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                            className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-800 outline-none focus:border-[#08B36A] resize-none"
                                        ></textarea>
                                    </div>

                                    {/* Attachment */}
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Attachments (Optional)</label>
                                        <div className="relative">
                                            <input 
                                                type="file" 
                                                id="file-upload"
                                                className="hidden"
                                                onChange={(e) => setFormData({...formData, attachment: e.target.files[0]})}
                                            />
                                            <label htmlFor="file-upload" className="w-full border border-dashed border-[#08B36A] rounded-xl p-3 text-sm text-[#08B36A] font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-green-50 transition-colors">
                                                <FaPaperclip /> {formData.attachment ? formData.attachment.name : 'Attach Medical Certificate / Doc'}
                                            </label>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="w-full bg-[#08B36A] hover:bg-[#069356] text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md mt-4 flex justify-center items-center gap-2 disabled:opacity-70"
                                    >
                                        {isSubmitting ? <><FaSpinner className="animate-spin"/> Submitting...</> : 'Submit Request'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}