import React from 'react';
import { FaTimes, FaInfoCircle, FaCheckCircle, FaFileAlt } from "react-icons/fa";

const ViewSpecialtyModal = ({ isOpen, onClose, specialty }) => {
    if (!isOpen || !specialty) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="relative h-32 bg-slate-800 flex items-center justify-center">
                    <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all">
                        <FaTimes />
                    </button>
                    <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-4xl mt-16 border-4 border-white">
                        {specialty.image.startsWith('data') || specialty.image.startsWith('http') ? (
                            <img src={specialty.image} alt="" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                            specialty.image
                        )}
                    </div>
                </div>

                <div className="px-8 pb-8 pt-12 text-center">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{specialty.title}</h2>
                    <span className={`inline-flex items-center px-3 py-1 mt-2 rounded-full text-[10px] font-black uppercase tracking-tighter ${specialty.status === 'Active' ? 'bg-green-100 text-[#08B36A]' : 'bg-slate-100 text-slate-400'}`}>
                        {specialty.status}
                    </span>

                    <div className="mt-8 space-y-4 text-left">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <FaFileAlt /> Description
                            </p>
                            <p className="text-xs font-bold text-slate-600 leading-relaxed">{specialty.description}</p>
                        </div>
                    </div>

                    <button onClick={onClose} className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg">
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewSpecialtyModal;