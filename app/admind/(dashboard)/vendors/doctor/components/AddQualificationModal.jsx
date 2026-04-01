import React, { useState } from 'react';
import { FaTimes, FaGraduationCap } from "react-icons/fa";

const AddQualificationModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({ name: '' });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        setFormData({ name: '' });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="bg-[#08B36A] p-8 flex justify-between items-center text-white">
                    <h2 className="text-xl font-black uppercase tracking-tight">Add Qualification</h2>
                    <button onClick={onClose} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-all"><FaTimes /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Qualification Name</label>
                        <div className="relative">
                            <FaGraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input type="text" required value={formData.name} onChange={(e) => setFormData({ name: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#08B36A] font-bold text-sm" placeholder="e.g. MBBS" />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">Save Qualification</button>
                </form>
            </div>
        </div>
    );
};
export default AddQualificationModal;