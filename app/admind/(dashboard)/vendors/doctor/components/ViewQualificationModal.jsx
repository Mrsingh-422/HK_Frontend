import React from 'react';
import { FaTimes, FaGraduationCap, FaIdCard, FaDatabase } from "react-icons/fa";

const ViewQualificationModal = ({ isOpen, onClose, qualification }) => {
    if (!isOpen || !qualification) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="relative h-32 bg-slate-800 flex items-center justify-center">
                    <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all z-10"><FaTimes /></button>
                    <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center text-[#08B36A] mt-16 border-[6px] border-white">
                        <FaGraduationCap size={40} />
                    </div>
                </div>
                <div className="px-8 pb-8 pt-16 text-center">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">{qualification.name}</h2>
                    <div className="space-y-4 text-left">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaIdCard /> System ID</p>
                            <code className="text-[10px] font-bold text-slate-600">{qualification._id}</code>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaDatabase /> Category</p>
                            <p className="text-[10px] font-black text-slate-900 uppercase">Degree / Diploma</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">Close Details</button>
                </div>
            </div>
        </div>
    );
};
export default ViewQualificationModal;