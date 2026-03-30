'use client'

import React from 'react'
import { FaTimes, FaCheckCircle, FaMapMarkerAlt, FaIdCard, FaWallet, FaBed, FaClock, FaStethoscope, FaFlask } from "react-icons/fa"

const HospitalDetailsModal = ({ isOpen, onClose, hospital, onVerify }) => {
    if (!isOpen || !hospital) return null;

    const isVerified = hospital.accountVerifyStatus === 'Verified';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
            
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                
                {/* Header Section */}
                <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-[#08B36A] rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-[#08B36A]/20">
                            <FaCheckCircle size={30} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800">{hospital.hospitalName}</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                                <FaClock /> Joined on {hospital.joinDate}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        {/* LEFT COLUMN: BASIC INFO */}
                        <div className="md:col-span-2 space-y-8">
                            <section>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">About Facility</h3>
                                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100 italic">
                                    "{hospital.about}"
                                </p>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <DetailItem label="Address" value={hospital.address} icon={<FaMapMarkerAlt />} />
                                    <DetailItem label="Wallet Balance" value={`₹${hospital.walletAmount}`} icon={<FaWallet />} isTheme />
                                </div>
                            </section>

                            <section>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Verification Documents</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <DocPreview title="Medical License" subtitle={hospital.licenseNumber} img={hospital.licenseImage} />
                                    <DocPreview title="Registration Certificate" subtitle="Govt Approved" img={hospital.certificateImage} />
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN: SPECS & SERVICES */}
                        <div className="space-y-6">
                            <div className="bg-slate-900 rounded-[2rem] p-6 text-white">
                                <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4">Bed Capacity</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold flex items-center gap-2"><FaBed className="text-[#08B36A]"/> ICU Beds</span>
                                        <span className="text-xl font-black">{hospital.icuBeds}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold flex items-center gap-2"><FaBed className="text-blue-400"/> General Ward</span>
                                        <span className="text-xl font-black">{hospital.generalWardBeds}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-[2rem] p-6">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Available Services</h3>
                                <div className="space-y-3">
                                    <ServiceToggle active={hospital.pharmacyService} label="Pharmacy Service" icon={<FaFlask />} />
                                    <ServiceToggle active={hospital.hospitalService} label="24/7 Hospital Care" icon={<FaStethoscope />} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Logic: Verification Button */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
                    {!isVerified ? (
                        <>
                            <button className="px-8 py-3 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-red-500 transition-all">Reject Application</button>
                            <button 
                                onClick={() => onVerify(hospital.id)}
                                className="px-10 py-4 bg-[#08B36A] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#08B36A]/20 hover:scale-105 transition-all"
                            >
                                Approve & Verify Hospital
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 text-[#08B36A] font-black text-xs uppercase tracking-widest">
                            <FaCheckCircle size={18} /> This Facility is Verified
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Sub-components
const DetailItem = ({ label, value, icon, isTheme }) => (
    <div className={`p-4 rounded-2xl border border-slate-100 ${isTheme ? 'bg-[#08B36A]/5' : 'bg-white'}`}>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-center gap-2">
            <span className={isTheme ? 'text-[#08B36A]' : 'text-slate-300'}>{icon}</span>
            <span className="text-sm font-bold text-slate-700">{value}</span>
        </div>
    </div>
)

const DocPreview = ({ title, subtitle, img }) => (
    <div className="group cursor-pointer">
        <p className="text-[10px] font-bold text-slate-800 mb-2">{title}</p>
        <div className="relative h-40 rounded-2xl overflow-hidden border border-slate-200">
            <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase">View Document</div>
        </div>
        <p className="text-[9px] text-slate-400 mt-2 font-mono">{subtitle}</p>
    </div>
)

const ServiceToggle = ({ active, label, icon }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <span className={active ? 'text-[#08B36A]' : 'text-slate-300'}>{icon}</span>
            <span className={`text-xs font-bold ${active ? 'text-slate-700' : 'text-slate-300'}`}>{label}</span>
        </div>
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-[#08B36A]' : 'bg-slate-200'}`} />
    </div>
)

export default HospitalDetailsModal