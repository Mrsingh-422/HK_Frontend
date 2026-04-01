import React from 'react';
import { FaTimes, FaGraduationCap, FaFileAlt, FaIdCard, FaCheckCircle } from "react-icons/fa";

const ViewQualificationModal = ({ isOpen, onClose, qualification }) => {
    if (!isOpen || !qualification) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header Banner */}
                <div className="relative h-32 bg-slate-800 flex items-center justify-center">
                    <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all z-10">
                        <FaTimes />
                    </button>
                    {/* Qualification Icon Badge */}
                    <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center text-[#08B36A] mt-16 border-[6px] border-white transition-transform hover:scale-105 duration-500">
                        <FaGraduationCap size={40} />
                    </div>
                </div>

                <div className="px-8 pb-8 pt-16 text-center">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{qualification.title}</h2>
                        <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-[0.3em]">
                            Code: {qualification.code}
                        </p>
                    </div>

                    <div className="mt-4">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${qualification.status === 'Active' ? 'bg-green-100 text-[#08B36A]' : 'bg-slate-100 text-slate-400'}`}>
                            {qualification.status === 'Active' ? <FaCheckCircle className="mr-1.5" /> : null}
                            {qualification.status}
                        </span>
                    </div>

                    <div className="mt-8 space-y-4 text-left">
                        {/* ID Code Section */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <FaIdCard /> System ID Code
                            </p>
                            <p className="text-xs font-black text-slate-900 uppercase">{qualification.code}</p>
                        </div>

                        {/* Description Section */}
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <FaFileAlt /> Academic Description
                            </p>
                            <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                                "{qualification.description}"
                            </p>
                        </div>
                    </div>

                    <button onClick={onClose} className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                        Close Information
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewQualificationModal;