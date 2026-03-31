"use client";
import React, { useState } from "react";
import { FaTimes, FaCheckCircle, FaSpinner, FaMapMarkerAlt, FaCalendarAlt, FaTruck, FaClock, FaBan, FaExclamationTriangle } from "react-icons/fa";

function ViewPharmacyComponent({ vendor, onClose, onApprove, onReject }) {
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
        if (!reason.trim()) return alert("Please provide a reason for rejection");
        setSubmitting(true);
        await onReject(vendor._id, reason);
        setSubmitting(false);
        setShowRejectInput(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[95vh] relative">

                {/* REJECTION REASON OVERLAY */}
                {showRejectInput && (
                    <div className="absolute inset-0 z-[110] bg-white/95 flex flex-col items-center justify-center p-8 animate-slideUp">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
                            <FaExclamationTriangle size={30} />
                        </div>
                        <h3 className="text-xl font-black text-gray-800 mb-2">Rejection Reason</h3>
                        <p className="text-sm text-gray-400 mb-6 text-center">Please provide a clear reason why this pharmacy application is being rejected.</p>

                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Invalid Drug License, Images are not clear..."
                            className="w-full max-w-md h-32 p-4 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-400 text-sm font-medium"
                        />

                        <div className="flex gap-4 mt-8 w-full max-w-md">
                            <button
                                onClick={() => setShowRejectInput(false)}
                                className="flex-1 py-4 bg-gray-100 text-gray-500 font-black text-xs uppercase rounded-2xl hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectAction}
                                disabled={submitting}
                                className="flex-1 py-4 bg-red-500 text-white font-black text-xs uppercase rounded-2xl shadow-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                            >
                                {submitting ? <FaSpinner className="animate-spin" /> : "Confirm Reject"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                            <FaCheckCircle size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-800">{vendor.name}</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                <FaCalendarAlt /> Status: {vendor.profileStatus}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition text-gray-400">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Main Content (Scrollable) */}
                <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoCard label="Contact" value={vendor.phone} />
                        <InfoCard label="Email" value={vendor.email} />
                        <InfoCard label="Location" value={`${vendor.city || ''}, ${vendor.state}, ${vendor.country}`} />
                        <InfoCard label="Authority" value={vendor.documents?.issuingAuthority} />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Document Previews</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <ImagePreview label="Store" src={vendor.documents?.pharmacyImages?.[0]} baseUrl={baseUrl} />
                            <ImagePreview label="License" src={vendor.documents?.pharmacyLicenses?.[0]} baseUrl={baseUrl} />
                            <ImagePreview label="GST" src={vendor.documents?.gstCertificates?.[0]} baseUrl={baseUrl} />
                        </div>
                    </div>

                    {vendor.profileStatus === "Rejected" && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                            <p className="text-[9px] font-black text-red-400 uppercase mb-1">Reason for Rejection</p>
                            <p className="text-sm font-bold text-red-700">{vendor.rejectionReason || "No reason provided"}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
                    {vendor.profileStatus === "Pending" || vendor.profileStatus === "Incomplete" ? (
                        <>
                            <button
                                onClick={() => setShowRejectInput(true)}
                                className="px-8 py-3 text-red-500 font-black text-xs uppercase hover:bg-red-50 rounded-xl transition flex items-center gap-2"
                            >
                                <FaBan /> Reject Application
                            </button>
                            <button
                                onClick={handleApproveAction}
                                disabled={submitting}
                                className="px-10 py-4 bg-emerald-500 text-white font-black text-xs uppercase rounded-xl shadow-lg hover:bg-emerald-600 transition flex items-center gap-2"
                            >
                                {submitting ? <FaSpinner className="animate-spin" /> : "Approve Pharmacy"}
                            </button>
                        </>
                    ) : (
                        <div className={`flex items-center gap-2 font-black text-xs uppercase ${vendor.profileStatus === 'Approved' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {vendor.profileStatus === 'Approved' ? <FaCheckCircle /> : <FaBan />}
                            {vendor.profileStatus} Account
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Sub-components
const InfoCard = ({ label, value }) => (
    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">{label}</p>
        <p className="text-sm font-bold text-gray-800">{value || "N/A"}</p>
    </div>
);

const ImagePreview = ({ label, src, baseUrl }) => (
    <div className="space-y-2">
        <p className="text-[9px] font-bold text-gray-500 uppercase">{label}</p>
        <div className="h-24 rounded-xl border border-gray-200 overflow-hidden bg-gray-100">
            {src ? (
                <img src={`${baseUrl}/${src}`} alt={label} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">No File</div>
            )}
        </div>
    </div>
);

export default ViewPharmacyComponent;