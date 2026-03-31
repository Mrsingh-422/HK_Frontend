"use client";
import React, { useState } from "react";
import { FaTimes, FaCheckCircle, FaBan, FaSpinner, FaExclamationTriangle, FaCalendarAlt, FaFlask, FaMapMarkerAlt, FaFileAlt } from "react-icons/fa";

function ShowLabVendorDetail({ vendor, onClose, onApprove, onReject }) {
    const [submitting, setSubmitting] = useState(false);
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [reason, setReason] = useState("");

    if (!vendor) return null;
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const handleApproveAction = async () => {
        setSubmitting(true);
        await onApprove(vendor._id);
        setSubmitting(false);
    };

    const handleRejectAction = async () => {
        if (!reason.trim()) return alert("Provide a reason");
        setSubmitting(true);
        await onReject(vendor._id, reason);
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[95vh] relative">

                {/* REJECT REASON OVERLAY */}
                {showRejectInput && (
                    <div className="absolute inset-0 z-[110] bg-white/95 flex flex-col items-center justify-center p-8">
                        <FaExclamationTriangle size={40} className="text-red-500 mb-4" />
                        <h3 className="text-xl font-black mb-2">Rejection Reason</h3>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full max-w-md h-32 p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-red-400"
                            placeholder="Enter reason..."
                        />
                        <div className="flex gap-4 mt-6 w-full max-w-md">
                            <button onClick={() => setShowRejectInput(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold">Cancel</button>
                            <button onClick={handleRejectAction} disabled={submitting} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold">
                                {submitting ? <FaSpinner className="animate-spin m-auto" /> : "Confirm Reject"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white"><FaFlask size={24} /></div>
                        <div>
                            <h2 className="text-xl font-black text-gray-800">{vendor.name}</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase"><FaCalendarAlt className="inline mr-1" />Joined: {new Date(vendor.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500"><FaTimes size={20} /></button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailCard label="Email" value={vendor.email} />
                        <DetailCard label="Phone" value={vendor.phone} />
                        <DetailCard label="Location" value={`${vendor.city || ''}, ${vendor.state}, ${vendor.country}`} />
                        <DetailCard label="Role" value={vendor.role} />
                    </div>

                    {/* Documents */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Legal Documents</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {vendor.documents?.length > 0 ? vendor.documents.map((doc, i) => (
                                <div key={i} className="h-28 rounded-xl border overflow-hidden bg-gray-100">
                                    <img src={`${baseUrl}/${doc}`} className="w-full h-full object-cover" alt="" />
                                </div>
                            )) : <p className="text-xs text-gray-400">No documents uploaded</p>}
                        </div>
                    </div>

                    {vendor.profileStatus === "Rejected" && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                            <p className="text-[10px] font-black text-red-500 uppercase mb-1">Rejection Reason</p>
                            <p className="text-sm font-bold text-red-700">{vendor.rejectionReason || "No reason specified"}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
                    {vendor.profileStatus === "Pending" || vendor.profileStatus === "Incomplete" ? (
                        <>
                            <button onClick={() => setShowRejectInput(true)} className="px-6 py-3 text-red-500 font-black text-xs uppercase hover:bg-red-50 rounded-xl transition flex items-center gap-2"><FaBan /> Reject</button>
                            <button onClick={handleApproveAction} disabled={submitting} className="px-8 py-3 bg-emerald-500 text-white font-black text-xs uppercase rounded-xl shadow-lg hover:bg-emerald-600 transition flex items-center gap-2">
                                {submitting ? <FaSpinner className="animate-spin" /> : <><FaCheckCircle /> Approve Lab</>}
                            </button>
                        </>
                    ) : (
                        <div className={`flex items-center gap-2 font-black text-xs uppercase ${vendor.profileStatus === 'Approved' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {vendor.profileStatus === 'Approved' ? <FaCheckCircle /> : <FaBan />} {vendor.profileStatus} Account
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const DetailCard = ({ label, value }) => (
    <div className="p-4 bg-gray-50 border rounded-2xl">
        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">{label}</p>
        <p className="text-sm font-bold text-gray-800">{value || "N/A"}</p>
    </div>
);

export default ShowLabVendorDetail;