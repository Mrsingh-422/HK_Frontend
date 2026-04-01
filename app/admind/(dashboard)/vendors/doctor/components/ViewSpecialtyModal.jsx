import React from 'react';
import { FaTimes, FaStethoscope, FaIdCard, FaDatabase, FaCheckCircle } from "react-icons/fa";

const ViewSpecialtyModal = ({ isOpen, onClose, specialty }) => {
    if (!isOpen || !specialty) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                
                {/* Header Banner */}
                <div className="relative h-32 bg-slate-800 flex items-center justify-center">
                    <button 
                        onClick={onClose} 
                        className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all z-10"
                    >
                        <FaTimes />
                    </button>
                    
                    {/* Specialist Icon Badge */}
                    <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center text-[#08B36A] mt-16 border-[6px] border-white transition-transform hover:scale-105 duration-500">
                        <FaStethoscope size={40} />
                    </div>
                </div>

                <div className="px-8 pb-8 pt-16 text-center">
                    {/* Primary Info */}
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            {specialty.name}
                        </h2>
                        <div className="flex items-center justify-center gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-[#08B36A]">
                                <FaCheckCircle className="mr-1.5" /> Verified Specialist
                            </span>
                        </div>
                    </div>

                    {/* Detailed Data Sections */}
                    <div className="mt-8 space-y-4 text-left">
                        {/* Database ID Card */}
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-[#08B36A] transition-colors">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <FaIdCard className="text-[#08B36A]" /> System Reference ID
                            </p>
                            <code className="text-xs font-mono font-bold text-slate-600 break-all bg-white px-2 py-1 rounded-lg border border-slate-100 block">
                                {specialty._id}
                            </code>
                        </div>

                        {/* Specialist Type Card */}
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <FaDatabase className="text-[#08B36A]" /> Resource Category
                            </p>
                            <p className="text-sm font-black text-slate-700 uppercase tracking-tight">
                                Healthcare Specialization
                            </p>
                        </div>
                    </div>

                    {/* Footer Action */}
                    <button 
                        onClick={onClose} 
                        className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
                    >
                        Return to List
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewSpecialtyModal;