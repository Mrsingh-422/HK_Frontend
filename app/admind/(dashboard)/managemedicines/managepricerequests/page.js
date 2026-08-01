"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
    FaCheckCircle, 
    FaTimesCircle, 
    FaComments, 
    FaPills, 
    FaArrowUp, 
    FaChevronLeft, 
    FaChevronRight, 
    FaSpinner, 
    FaStore, 
    FaInbox,
    FaInfoCircle
} from "react-icons/fa";
import AdminAPI from "@/app/services/AdminAPI";

export default function MedicineRequestsPage() {
    // Data States
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("Pending"); // Defaulting to 'Pending' to show active tasks
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    // Modal Actions State
    const [actionModal, setActionModal] = useState(null); // { requestId, action: 'Approved' | 'Rejected' }
    const [adminComment, setAdminComment] = useState("");
    const [isActionSubmitting, setIsActionSubmitting] = useState(false);

    // Main Fetch Operation
    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10
            };
            if (statusFilter !== "All") {
                params.status = statusFilter;
            }

            const response = await AdminAPI.getMedicineIncreaseRequests(params);
            if (response.success) {
                setRequests(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalResults(response.total || 0);
            }
        } catch (error) {
            console.error("Error fetching medicine requests:", error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, currentPage]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // Reset pagination on filter change
    const handleFilterChange = (newStatus) => {
        setStatusFilter(newStatus);
        setCurrentPage(1);
    };

    // Trigger Action Handler (Approve / Reject)
    const handleActionSubmit = async () => {
        if (!actionModal) return;
        try {
            setIsActionSubmitting(true);
            const res = await AdminAPI.handleMedicineIncreaseRequestAction(
                actionModal.requestId,
                actionModal.action,
                adminComment
            );

            if (res.success) {
                // Remove or update the request locally to provide rapid UI response
                setRequests(prev => prev.filter(req => req._id !== actionModal.requestId));
                setTotalResults(prev => prev - 1);
                
                // Clear modal state
                setActionModal(null);
                setAdminComment("");
            }
        } catch (error) {
            console.error(`Error updating request status to ${actionModal?.action}:`, error);
        } finally {
            setIsActionSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-800">
            {/* Header Area */}
            <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Medicine & MRP Requests</h1>
                    <p className="text-slate-500 text-xs md:text-sm font-medium mt-1">
                        Review, approve, or reject new medicines and batch price revision requests from partners [1].
                    </p>
                </div>
                
                {/* Total Stats summary */}
                <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Queue</span>
                    <span className="text-lg font-black text-slate-900">{totalResults} Tickets</span>
                </div>
            </header>

            {/* Filter Tabs & Navigation Controls */}
            <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 w-fit">
                    {["All", "Pending", "Approved", "Rejected"].map((status) => (
                        <button
                            key={status}
                            onClick={() => handleFilterChange(status)}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                                statusFilter === status
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "text-slate-400 hover:text-slate-700"
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Request Tickets Feed */}
            <main className="max-w-7xl mx-auto space-y-6">
                {loading ? (
                    <div className="py-24 flex flex-col justify-center items-center">
                        <FaSpinner className="text-slate-300 text-3xl animate-spin mb-4" />
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Loading Requests Feed</p>
                    </div>
                ) : requests.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {requests.map((ticket) => {
                            const isMrpIncrease = ticket.data?.medicineId !== undefined; // Case A [1]
                            return (
                                <div key={ticket._id} className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col lg:flex-row gap-6 justify-between">
                                    
                                    {/* Left: Vendor & Request Type Info */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            {isMrpIncrease ? (
                                                <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                                                    <FaArrowUp size={10} /> MRP Increase Request [1]
                                                </span>
                                            ) : (
                                                <span className="bg-teal-50 text-teal-700 border border-teal-100 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                                                    <FaPills size={10} /> New Medicine Addition
                                                </span>
                                            )}

                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                                                ticket.status === "Pending" ? "bg-blue-50 text-blue-600 border-blue-100 animate-pulse" :
                                                ticket.status === "Approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                "bg-rose-50 text-rose-600 border-rose-100"
                                            }`}>
                                                {ticket.status}
                                            </span>
                                        </div>

                                        {/* Ticket Core Payload Content */}
                                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                                            {isMrpIncrease ? (
                                                // Case A: MRP Increase Details [1]
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Medicine Name</h3>
                                                        <p className="text-slate-800 font-bold text-base">{ticket.data?.medicineName || "Unknown"}</p>
                                                    </div>
                                                    <div className="flex gap-8">
                                                        <div>
                                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Current MRP</h3>
                                                            <p className="text-slate-500 font-medium text-sm line-through">₹{ticket.data?.currentMasterMrp || "0.00"}</p>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xs font-bold text-[#08b36a] uppercase tracking-widest leading-none mb-1">Proposed MRP</h3>
                                                            <p className="text-[#08b36a] font-extrabold text-lg">₹{ticket.data?.proposedMrp || "0.00"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="md:col-span-2 pt-2 border-t border-slate-200/50">
                                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5 flex items-center gap-1.5">
                                                            <FaInfoCircle className="text-slate-300" /> Vendor Reason
                                                        </h3>
                                                        <p className="text-slate-600 text-xs font-semibold leading-relaxed italic">
                                                            "{ticket.data?.reason || "Price inflation update required."}"
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Case B: New Medicine Details
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    <div className="col-span-2">
                                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Medicine Name</h3>
                                                        <p className="text-slate-800 font-bold text-base">{ticket.data?.name || "Unknown"}</p>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Manufacturer</h3>
                                                        <p className="text-slate-800 font-bold text-sm truncate">{ticket.data?.manufacturers || "Premium Formulation"}</p>
                                                    </div>
                                                    <div className="col-span-2 md:col-span-3 pt-2 border-t border-slate-200/50">
                                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Salt Composition</h3>
                                                        <p className="text-slate-700 font-medium text-xs">{ticket.data?.salt_composition || "N/A"}</p>
                                                    </div>
                                                    <div className="pt-2 border-t border-slate-200/50">
                                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Packaging</h3>
                                                        <p className="text-slate-800 font-bold text-xs">{ticket.data?.packaging || "N/A"}</p>
                                                    </div>
                                                    <div className="pt-2 border-t border-slate-200/50">
                                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">MRP Price</h3>
                                                        <p className="text-slate-800 font-bold text-xs">₹{ticket.data?.mrp || "0.00"}</p>
                                                    </div>
                                                    <div className="pt-2 border-t border-slate-200/50">
                                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Best Price</h3>
                                                        <p className="text-slate-800 font-bold text-xs">₹{ticket.data?.best_price || "0.00"}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Admin Comment (Displays if request is resolved) */}
                                        {ticket.adminComment && (
                                            <div className="flex gap-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                                                <FaComments className="text-slate-400 shrink-0 mt-0.5" size={14} />
                                                <div>
                                                    <span className="font-extrabold text-slate-500 uppercase tracking-wider block mb-0.5">Admin Comment:</span>
                                                    <p className="text-slate-600 font-medium">{ticket.adminComment}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Vendor Profile Card & Action triggers */}
                                    <div className="w-full lg:w-[280px] shrink-0 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-5 lg:pt-0 lg:pl-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FaStore className="text-slate-400 shrink-0" size={14} />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Submitted By</span>
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-slate-900 text-sm">{ticket.vendorId?.name || "Partner Store"}</h4>
                                                <p className="text-slate-500 text-xs mt-0.5 font-medium">{ticket.vendorId?.city || "Unknown City"}, {ticket.vendorId?.state || ""}</p>
                                            </div>
                                            <div className="text-[11px] text-slate-400 font-medium space-y-1">
                                                <p className="truncate">Email: {ticket.vendorId?.email}</p>
                                                <p>Phone: {ticket.vendorId?.phone}</p>
                                            </div>
                                        </div>

                                        {/* Actions block - Active only when state is 'Pending' */}
                                        {ticket.status === "Pending" ? (
                                            <div className="flex gap-3 mt-6">
                                                <button
                                                    onClick={() => setActionModal({ requestId: ticket._id, action: "Rejected" })}
                                                    className="flex-1 py-3 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors active:scale-95"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => setActionModal({ requestId: ticket._id, action: "Approved" })}
                                                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors active:scale-95 shadow-sm"
                                                >
                                                    Approve
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="mt-6 flex items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-wider">
                                                {ticket.status === "Approved" ? (
                                                    <FaCheckCircle className="text-emerald-500" />
                                                ) : (
                                                    <FaTimesCircle className="text-rose-500" />
                                                )}
                                                <span>Resolved {ticket.status}</span>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                ) : (
                    // Empty Feed state
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                        <FaInbox className="text-slate-200 text-5xl mx-auto mb-4" />
                        <h3 className="text-slate-800 font-bold text-lg uppercase tracking-wide">No requests found</h3>
                        <p className="text-slate-400 text-xs mt-1">There are no matching pharmacy tickets in this queue.</p>
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                        <button
                            disabled={currentPage === 1 || loading}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="flex items-center gap-2 px-5 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                        >
                            <FaChevronLeft /> Prev
                        </button>
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages || loading}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="flex items-center gap-2 px-5 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                        >
                            Next <FaChevronRight />
                        </button>
                    </div>
                )}
            </main>

            {/* Actions Commentary Input Modal Overlay */}
            {actionModal && (
                <div className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">
                                    {actionModal.action === "Approved" ? "Approve" : "Reject"} Request
                                </h3>
                                <p className="text-slate-400 text-xs font-medium mt-1">
                                    Leave administrative commentary or review remarks before finalizing.
                                </p>
                            </div>
                        </div>

                        {/* Textarea Input */}
                        <div className="space-y-1.5 mb-6">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrative Remarks</label>
                            <textarea
                                value={adminComment}
                                onChange={(e) => setAdminComment(e.target.value)}
                                placeholder="E.g., MRP increase approved according to recent pharmaceutical standard cost revisions."
                                rows={4}
                                className="w-full p-4 bg-slate-50/50 border border-slate-200/80 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-500/5 outline-none transition-all resize-none"
                            />
                        </div>

                        {/* Call to Actions buttons */}
                        <div className="flex gap-3">
                            <button
                                disabled={isActionSubmitting}
                                onClick={() => { setActionModal(null); setAdminComment(""); }}
                                className="flex-1 py-4 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-2xl tracking-wider uppercase transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isActionSubmitting}
                                onClick={handleActionSubmit}
                                className={`flex-1 py-4 text-xs font-black rounded-2xl tracking-wider uppercase transition-colors text-white shadow-md flex items-center justify-center gap-2 ${
                                    actionModal.action === "Approved" 
                                        ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-100" 
                                        : "bg-rose-600 hover:bg-rose-500 shadow-rose-100"
                                }`}
                            >
                                {isActionSubmitting ? (
                                    <FaSpinner className="animate-spin" />
                                ) : (
                                    `Confirm ${actionModal.action === "Approved" ? "Approval" : "Rejection"}`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}