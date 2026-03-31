"use client";
import React, { useState } from "react";
import {
    FaTimes, FaCheckCircle, FaBan, FaSpinner,
    FaExclamationTriangle, FaFlask, FaMapMarkerAlt,
    FaEnvelope, FaPhoneAlt, FaGlobe, FaStar,
    FaVial, FaTruckLoading, FaShieldAlt, FaSearchPlus
} from "react-icons/fa";

function ShowLabVendorDetail({ vendor, onClose, onApprove, onReject }) {
    const [submitting, setSubmitting] = useState(false);
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [reason, setReason] = useState("");

    // State for Full Screen Image Preview
    const [previewImage, setPreviewImage] = useState(null);

    if (!vendor) return null;

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const isApproved = vendor.profileStatus === "Approved";
    const docs = vendor.documents || {};

    const handleApproveAction = async () => {
        setSubmitting(true);
        await onApprove(vendor._id);
        setSubmitting(false);
    };

    const handleRejectAction = async () => {
        if (!reason.trim()) return alert("Please provide a rejection reason");
        setSubmitting(true);
        await onReject(vendor._id, reason);
        setSubmitting(false);
    };

    // Helper to format image URLs correctly
    const getImageUrl = (path) => {
        if (!path) return null;
        const formattedPath = path.replace(/\\/g, '/');
        const cleanPath = formattedPath.startsWith('public/') ? formattedPath.replace('public/', '') : formattedPath;
        return `${baseUrl}/${cleanPath}`;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">

            {/* FULL SCREEN LIGHTBOX PREVIEW */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn cursor-zoom-out"
                    onClick={() => setPreviewImage(null)}
                >
                    <button className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors">
                        <FaTimes size={40} />
                    </button>
                    <img
                        src={previewImage}
                        className="max-w-full max-h-full rounded-lg shadow-2xl object-contain animate-zoomIn"
                        alt="Preview"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            <div className="bg-white w-full max-w-4xl max-h-[95vh] rounded-[2.5rem] shadow-2xl overflow-hidden animate-fadeIn flex flex-col relative">

                {/* REJECTION OVERLAY */}
                {showRejectInput && (
                    <div className="absolute inset-0 z-[110] bg-white/95 flex flex-col items-center justify-center p-8">
                        <FaExclamationTriangle size={40} className="text-red-500 mb-4" />
                        <h3 className="text-xl font-black text-gray-800 mb-2">Rejection Reason</h3>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full max-w-md h-32 p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-red-400 transition-all"
                            placeholder="Why is this lab being rejected?..."
                        />
                        <div className="flex gap-4 mt-6 w-full max-w-md">
                            <button onClick={() => setShowRejectInput(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-500">Cancel</button>
                            <button onClick={handleRejectAction} disabled={submitting} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-200">
                                {submitting ? <FaSpinner className="animate-spin m-auto" /> : "Confirm Reject"}
                            </button>
                        </div>
                    </div>
                )}

                {/* HEADER */}
                <div className="p-8 bg-slate-50 border-b flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div
                            className="w-20 h-20 bg-blue-600 rounded-3xl shadow-xl shadow-blue-100 flex items-center justify-center text-white overflow-hidden cursor-pointer group relative"
                            onClick={() => docs.labImages?.[0] && setPreviewImage(getImageUrl(docs.labImages[0]))}
                        >
                            {docs.labImages?.[0] ? (
                                <>
                                    <img src={getImageUrl(docs.labImages[0])} className="w-full h-full object-cover" alt="Lab" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <FaSearchPlus />
                                    </div>
                                </>
                            ) : (
                                <FaFlask size={32} />
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800">{vendor.name}</h2>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="flex items-center gap-1 text-amber-500 font-bold text-sm"><FaStar /> {vendor.rating || 0}</span>
                                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-black uppercase tracking-widest">{vendor.role}</span>
                                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-tight">Joined {new Date(vendor.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white text-slate-400 hover:text-red-500 rounded-2xl border border-slate-100 transition-all shadow-sm">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">

                    {/* SECTION 1: CORE INFO */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DetailCard icon={<FaEnvelope className="text-blue-500" />} label="Email Address" value={vendor.email} />
                        <DetailCard icon={<FaPhoneAlt className="text-emerald-500" />} label="Phone Number" value={vendor.phone} />
                        <DetailCard icon={<FaMapMarkerAlt className="text-red-500" />} label="Location" value={`${vendor.city}, ${vendor.state}, ${vendor.country}`} />
                        <DetailCard icon={<FaGlobe className="text-indigo-500" />} label="Issuing Authority" value={docs.issuingAuthority} />
                        <DetailCard icon={<FaShieldAlt className="text-orange-500" />} label="GST Number" value={docs.gstNumber} />
                        <DetailCard icon={<FaVial className="text-purple-500" />} label="Experience" value={`${docs.experience} Years`} />
                    </div>

                    {/* SECTION 2: SERVICES STATUS */}
                    <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Service Capabilities</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <ServiceBadge active={vendor.isHomeCollectionAvailable} label="Home Collection" icon={<FaTruckLoading />} />
                            <ServiceBadge active={vendor.isRapidServiceAvailable} label="Rapid Service" icon={<FaFlask />} />
                            <ServiceBadge active={vendor.isInsuranceAccepted} label="Insurance Accepted" icon={<FaShieldAlt />} />
                        </div>
                    </div>

                    {/* SECTION 3: DOCUMENTS GALLERY */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Verification Documents (Click to view)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <ImagePreview label="Lab License" path={docs.labLicenses?.[0]} baseUrl={baseUrl} onPreview={setPreviewImage} />
                            <ImagePreview label="GST Certificate" path={docs.gstCertificates?.[0]} baseUrl={baseUrl} onPreview={setPreviewImage} />
                            <ImagePreview label="Lab Certificate" path={docs.labCertificates?.[0]} baseUrl={baseUrl} onPreview={setPreviewImage} />
                            <ImagePreview label="Drug License" path={docs.drugLicenses?.[0]} baseUrl={baseUrl} onPreview={setPreviewImage} />
                            <ImagePreview label="Lab Images" path={docs.labImages?.[0]} baseUrl={baseUrl} onPreview={setPreviewImage} />
                            <ImagePreview label="Other Certs" path={docs.otherCertificates?.[0]} baseUrl={baseUrl} onPreview={setPreviewImage} />
                        </div>
                    </div>

                    {vendor.profileStatus === "Rejected" && (
                        <div className="p-6 bg-red-50 border-2 border-red-100 rounded-[2rem]">
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Admin Rejection Reason</p>
                            <p className="text-sm font-bold text-red-700 italic">"{vendor.rejectionReason || "No reason specified"}"</p>
                        </div>
                    )}
                </div>

                {/* FOOTER ACTIONS */}
                <div className="p-8 bg-slate-50 border-t flex justify-end gap-4">
                    {!isApproved && vendor.profileStatus !== "Rejected" ? (
                        <>
                            <button onClick={() => setShowRejectInput(true)} className="px-8 py-3 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all">
                                <FaBan className="inline mr-2" /> Reject Lab
                            </button>
                            <button
                                onClick={handleApproveAction}
                                disabled={submitting}
                                className="px-12 py-4 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-100 hover:scale-105 transition-all flex items-center gap-2"
                            >
                                {submitting ? <FaSpinner className="animate-spin" /> : <><FaCheckCircle /> Approve & Verify</>}
                            </button>
                        </>
                    ) : (
                        <div className={`flex items-center gap-3 font-black text-xs uppercase tracking-widest ${isApproved ? 'text-emerald-500' : 'text-red-500'}`}>
                            {isApproved ? <FaCheckCircle size={20} /> : <FaBan size={20} />}
                            {vendor.profileStatus} Account
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// SUB-COMPONENTS
const DetailCard = ({ label, value, icon }) => (
    <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-slate-50 rounded-lg">{icon}</span>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        </div>
        <p className="text-sm font-bold text-slate-800 break-words">{value || "Not Provided"}</p>
    </div>
);

const ServiceBadge = ({ active, label, icon }) => (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${active ? 'bg-white border-emerald-500 text-emerald-600 shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-300 opacity-60'}`}>
        <span className="text-lg">{icon}</span>
        <span className="text-[11px] font-black uppercase tracking-tight">{label}</span>
        {active && <FaCheckCircle className="ml-auto" />}
    </div>
);

const ImagePreview = ({ label, path, baseUrl, onPreview }) => {
    if (!path) {
        return (
            <div className="space-y-2 opacity-50">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-2 ml-1">{label}</p>
                <div className="h-32 rounded-2xl border-2 border-slate-100 bg-slate-50 flex items-center justify-center text-slate-300 font-bold text-[10px]">NO FILE</div>
            </div>
        );
    }

    const formattedPath = path.replace(/\\/g, '/');
    const pathWithoutPublic = formattedPath.startsWith('public/') ? formattedPath.replace('public/', '') : formattedPath;
    const fullUrl = `${baseUrl}/${pathWithoutPublic}`;

    return (
        <div className="group cursor-pointer" onClick={() => onPreview(fullUrl)}>
            <p className="text-[9px] font-black text-slate-500 uppercase mb-2 ml-1">{label}</p>
            <div className="relative h-32 rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 shadow-sm">
                <img
                    src={fullUrl}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    alt={label}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `${baseUrl}/${formattedPath}`;
                    }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <FaSearchPlus size={20} />
                </div>
            </div>
        </div>
    );
};

export default ShowLabVendorDetail;