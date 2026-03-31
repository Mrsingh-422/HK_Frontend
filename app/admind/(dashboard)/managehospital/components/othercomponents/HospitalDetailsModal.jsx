'use client'

import React, { useState } from 'react'
import { FaTimes, FaCheckCircle, FaMapMarkerAlt, FaGlobe, FaPhoneAlt, FaEnvelope, FaCalendarAlt, FaFileAlt, FaBan, FaSpinner } from "react-icons/fa"

const HospitalDetailsModal = ({ isOpen, onClose, hospital, onVerify }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !hospital) return null;

    const isVerified = hospital.profileStatus === 'Approved';
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const handleApprove = async () => {
        setIsSubmitting(true);
        try {
            await onVerify(hospital._id);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-[#08B36A] rounded-[1.5rem] overflow-hidden flex items-center justify-center text-white shadow-lg">
                            {hospital.hospitalImage?.[0] ? (
                                <img src={`${baseUrl}${hospital.hospitalImage[0]}`} className="w-full h-full object-cover" alt="hospital" />
                            ) : (
                                <FaCheckCircle size={30} />
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 capitalize">{hospital.name}</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                                <FaCalendarAlt /> Registered on {formatDate(hospital.createdAt)}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        <div className="md:col-span-2 space-y-8">
                            <section>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Location & Contact</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem label="Address" value={`${hospital.state || ''}, ${hospital.country || ''}`} icon={<FaMapMarkerAlt />} />
                                    <DetailItem label="Contact" value={hospital.phone} icon={<FaPhoneAlt />} />
                                    <DetailItem label="Email" value={hospital.email} icon={<FaEnvelope />} />
                                    <DetailItem label="Type" value={hospital.type || hospital.role} icon={<FaGlobe />} isTheme />
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Documents</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <DocPreview
                                        title="License Document"
                                        subtitle="Primary Verification"
                                        img={hospital.licenseDocument?.[0] ? `${baseUrl}${hospital.licenseDocument[0]}` : null}
                                    />
                                    {hospital.otherDocuments?.length > 0 ? (
                                        <DocPreview
                                            title="Other Docs"
                                            subtitle="Additional Info"
                                            img={`${baseUrl}${hospital.otherDocuments[0]}`}
                                        />
                                    ) : (
                                        <div className="h-40 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                                            <FaFileAlt size={24} className="mb-2 opacity-20" />
                                            <span className="text-[10px] font-bold uppercase">No Other Docs</span>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        <div className="space-y-6">
                            <div className={`rounded-[2rem] p-6 text-white ${isVerified ? 'bg-slate-900' : 'bg-[#08B36A]'}`}>
                                <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4">Profile Status</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold">Role</span>
                                        <span className="text-sm font-black uppercase">{hospital.role}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold">Status</span>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${isVerified ? 'bg-[#08B36A] text-white' : 'bg-white text-[#08B36A]'}`}>
                                            {hospital.profileStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                    {!isVerified ? (
                        <>
                            <button disabled={isSubmitting} className="flex items-center gap-2 px-8 py-3 text-slate-400 font-bold text-xs uppercase hover:text-red-500 disabled:opacity-50">
                                <FaBan /> Reject
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={isSubmitting}
                                className="px-10 py-4 bg-[#08B36A] text-white rounded-2xl font-black text-xs uppercase shadow-lg hover:scale-105 transition-all disabled:opacity-70 flex items-center gap-2"
                            >
                                {isSubmitting ? <FaSpinner className="animate-spin" /> : "Approve Hospital"}
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 text-[#08B36A] font-black text-xs uppercase">
                            <FaCheckCircle size={18} /> Facility Verified
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const DetailItem = ({ label, value, icon, isTheme }) => (
    <div className={`p-4 rounded-2xl border border-slate-100 ${isTheme ? 'bg-[#08B36A]/5' : 'bg-white'}`}>
        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{label}</p>
        <div className="flex items-center gap-2">
            <span className={isTheme ? 'text-[#08B36A]' : 'text-slate-300'}>{icon}</span>
            <span className="text-xs font-bold text-slate-700 truncate">{value || "N/A"}</span>
        </div>
    </div>
)

const DocPreview = ({ title, subtitle, img }) => (
    <div className="group cursor-pointer">
        <p className="text-[10px] font-bold text-slate-800 mb-2">{title}</p>
        <div className="relative h-40 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
            {img ? (
                <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300"><FaFileAlt size={30} /></div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase">View</div>
        </div>
        <p className="text-[9px] text-slate-400 mt-2 font-mono uppercase">{subtitle}</p>
    </div>
)

export default HospitalDetailsModal;