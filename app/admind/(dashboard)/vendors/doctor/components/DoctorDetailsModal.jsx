import React from 'react';
import {
    FaTimes,
    FaCheckCircle,
    FaPhoneAlt,
    FaEnvelope,
    FaIdBadge,
    FaUserCheck
} from "react-icons/fa";

const DoctorDetailsModal = ({ isOpen, onClose, doctor, onVerify }) => {
    if (!isOpen || !doctor) return null;

    const isPending = doctor.verifyStatus !== 'Verified';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                
                {/* Modal Header */}
                <div className="relative h-32 bg-[#08B36A]">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Profile Image & Basic Info */}
                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-4 flex justify-between items-end">
                        <div className="relative">
                            <img
                                src={doctor.image}
                                alt="Doctor"
                                className="w-32 h-32 rounded-3xl border-4 border-white object-cover shadow-xl"
                            />
                            <span className={`absolute bottom-2 left-24 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-md ${doctor.status === 'Active' ? 'bg-green-500 text-white' : 'bg-rose-500 text-white'}`}>
                                {doctor.status}
                            </span>
                        </div>
                        
                        {/* Status Badge for Verification */}
                        <div className={`mb-2 px-4 py-2 rounded-2xl border ${isPending ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-blue-50 border-blue-200 text-blue-600'} flex items-center gap-2`}>
                            <div className={`w-2 h-2 rounded-full animate-pulse ${isPending ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{doctor.verifyStatus}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{doctor.name}</h2>
                        <p className="text-[#08B36A] font-bold text-xs uppercase tracking-[0.2em]">{doctor.specialty || 'General Practitioner'}</p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                <FaEnvelope size={12} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                                <p className="text-xs font-bold text-slate-700 truncate">{doctor.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                                <FaPhoneAlt size={12} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                                <p className="text-xs font-bold text-slate-700">{doctor.phone}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                <FaIdBadge size={12} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</p>
                                <p className="text-xs font-bold text-slate-700">{doctor.experience || '10+ Years'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-8 h-8 rounded-lg bg-green-100 text-[#08B36A] flex items-center justify-center">
                                <FaCheckCircle size={12} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Approval</p>
                                <p className="text-xs font-bold text-slate-700">{doctor.joinStatus}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        {isPending && (
                            <button
                                onClick={() => onVerify(doctor.id)}
                                className="w-full py-4 bg-[#08B36A] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#069658] transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                <FaUserCheck size={16} /> Verify Doctor Account
                            </button>
                        )}
                        
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg"
                        >
                            Close Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDetailsModal;