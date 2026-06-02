'use client'

import React, { useState } from 'react'
import {
    FaTimes, FaCheckCircle, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope,
    FaFileAlt, FaBan, FaSpinner, FaIdCard, FaHistory, FaStethoscope, FaSuitcase, FaGlobe, FaUserMd
} from "react-icons/fa"
import { formatImageUrl } from './ManageDoctors';

const DoctorDetailsModal = ({ isOpen, onClose, doctor, onAction, onToggle }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !doctor) return null;

    const isVerified = doctor.profileStatus === 'Approved';

    const handleApprove = async () => {
        setIsSubmitting(true);
        await onAction(doctor._id, "Approved");
        setIsSubmitting(false);
    };

    const handleReject = async () => {
        const reason = window.prompt("Enter rejection reason for the doctor:");
        if (!reason) return;
        setIsSubmitting(true);
        await onAction(doctor._id, "Rejected", reason);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-white w-full max-w-5xl max-h-[95vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">

                {/* Header Section */}
                <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white rounded-3xl overflow-hidden flex items-center justify-center text-[#08B36A] border-4 border-white shadow-xl">
                            {doctor.profileImage ? (
                                <img src={formatImageUrl(doctor.profileImage)} className="w-full h-full object-cover" alt="profile" />
                            ) : (
                                <FaUserMd size={40} />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-3xl font-black text-slate-800">{doctor.name}</h2>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${doctor.dutyStatus === 'On Duty' ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                    {doctor.dutyStatus}
                                </span>
                            </div>
                            <p className="text-[#08B36A] text-sm font-black uppercase tracking-widest flex items-center gap-2 mt-1">
                                <FaStethoscope /> {doctor.qualification} • {doctor.speciality}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 bg-white border border-slate-200 text-slate-400 rounded-3xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 bg-white">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                        <div className="lg:col-span-2 space-y-10">
                            {/* Bio */}
                            <section>
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Professional Biography</h3>
                                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100 italic">
                                    "{doctor.about || 'This professional has not provided a biography yet.'}"
                                </p>
                            </section>

                            {/* Details Grid */}
                            <section>
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Credentials</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DetailItem label="Medical License" value={doctor.licenseNumber} icon={<FaIdCard />} />
                                    <DetailItem label="Clinical Experience" value={`${doctor.experienceYears} Years`} icon={<FaHistory />} />
                                    <DetailItem label="Medical Council" value={doctor.councilName} icon={<FaGlobe />} />
                                    <DetailItem label="Council Number" value={doctor.councilNumber} icon={<FaIdCard />} />
                                    <DetailItem label="Contact Number" value={doctor.phone} icon={<FaPhoneAlt />} />
                                    <DetailItem label="Official Email" value={doctor.email} icon={<FaEnvelope />} />
                                    <DetailItem label="Assigned Role" value={doctor.role} icon={<FaSuitcase />} isTheme />
                                    <DetailItem label="Address" value={`${doctor.address}, ${doctor.city}`} icon={<FaMapMarkerAlt />} isTheme />
                                </div>
                            </section>

                            {/* Documents */}
                            <section>
                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Verification Documents</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    {doctor.documents?.length > 0 ? doctor.documents.map((doc, i) => (
                                        <DocPreview key={i} title={`Certification ${i + 1}`} img={formatImageUrl(doc)} />
                                    )) : (
                                        <div className="col-span-2 p-10 border-2 border-dashed border-slate-100 rounded-3xl text-center text-slate-300 font-bold uppercase text-[10px]">
                                            No documents uploaded for verification
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-6">
                            <div className={`rounded-[2.5rem] p-8 text-white shadow-xl ${isVerified ? 'bg-slate-900' : 'bg-[#08B36A]'}`}>
                                <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-6">Administrative Control</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-white/70">Profile Verification</span>
                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${isVerified ? 'bg-[#08B36A] text-white shadow-lg' : 'bg-white text-[#08B36A]'}`}>
                                            {doctor.profileStatus}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                        <span className="text-xs font-bold text-white/70">App Active Status</span>
                                        <button
                                            onClick={() => onToggle(doctor._id)}
                                            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all border-2 border-white/20 ${doctor.isActive ? 'bg-white' : 'bg-slate-700'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full transition-transform shadow-md ${doctor.isActive ? 'translate-x-6 bg-[#08B36A]' : 'translate-x-1 bg-white'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Fees Card */}
                            <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Service Fees</h3>
                                <div className="space-y-4">
                                    <FeeRow label="Online Consultation" value={doctor.fees?.online} />
                                    <FeeRow label="Clinic Visit" value={doctor.fees?.clinic} />
                                    <FeeRow label="Home Visit" value={doctor.fees?.home} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                    {!isVerified ? (
                        <>
                            <button onClick={handleReject} disabled={isSubmitting} className="flex items-center gap-2 px-8 py-4 text-slate-400 font-black text-xs uppercase hover:text-red-500 transition-colors">
                                <FaBan /> Reject Profile
                            </button>
                            <button onClick={handleApprove} disabled={isSubmitting} className="px-12 py-4 bg-[#08B36A] text-white rounded-[1.5rem] font-black text-xs uppercase shadow-xl hover:scale-105 transition-all active:scale-95">
                                {isSubmitting ? <FaSpinner className="animate-spin" /> : "Approve Professional"}
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-3 text-[#08B36A] font-black text-xs uppercase bg-white px-8 py-4 rounded-2xl border border-emerald-100 shadow-sm">
                            <FaCheckCircle size={20} /> Professional Identity Verified
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const DetailItem = ({ label, value, icon, isTheme }) => (
    <div className={`p-5 rounded-[1.5rem] border border-slate-100 transition-all hover:shadow-md ${isTheme ? 'bg-[#08B36A]/5 border-[#08B36A]/10' : 'bg-white'}`}>
        <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-wider">{label}</p>
        <div className="flex items-center gap-3">
            <span className={isTheme ? 'text-[#08B36A]' : 'text-slate-300'}>{icon}</span>
            <span className="text-sm font-bold text-slate-700 truncate">{value || "Not Provided"}</span>
        </div>
    </div>
)

const FeeRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-200/50 last:border-0">
        <span className="text-xs font-bold text-slate-500">{label}</span>
        <span className="text-sm font-black text-slate-800">₹{value || 0}</span>
    </div>
)

const DocPreview = ({ title, img }) => (
    <div className="group cursor-pointer">
        <p className="text-[10px] font-black text-slate-800 mb-3 ml-1 uppercase tracking-tighter">{title}</p>
        <div className="relative h-48 rounded-3xl overflow-hidden border-2 border-slate-100 bg-slate-50 shadow-sm group-hover:shadow-xl transition-all">
            <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="doc" />
            <a href={img} target="_blank" rel="noreferrer" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-[10px] font-black uppercase backdrop-blur-sm">
                Open Full Document
            </a>
        </div>
    </div>
)

export default DoctorDetailsModal;