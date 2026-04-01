import React, { useState, useEffect } from 'react';
import { FaTimes, FaStethoscope, FaSave, FaIdCard } from "react-icons/fa";

const EditSpecialtyModal = ({ isOpen, onClose, specialty, onUpdate }) => {
    // State initialized with the 'name' field from your API response
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        if (specialty) {
            setFormData({ 
                _id: specialty._id, 
                name: specialty.name 
            });
        }
    }, [specialty]);

    if (!isOpen || !specialty) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header - Blue Theme for Editing */}
                <div className="bg-[#0ea5e9] p-8 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <FaStethoscope size={20} />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Edit Specialty</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-all"
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Database ID View (Read-Only) */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FaIdCard className="text-slate-300" size={14} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System ID</p>
                        </div>
                        <code className="text-[9px] font-mono font-bold text-slate-400">
                            {specialty._id}
                        </code>
                    </div>

                    {/* Specialist Name Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
                            Update Specialist Name
                        </label>
                        <div className="relative">
                            <FaStethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input 
                                type="text" 
                                required 
                                value={formData.name} 
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#0ea5e9] font-bold text-sm transition-all shadow-inner" 
                                placeholder="e.g. Cardiologist" 
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex flex-col gap-3">
                        <button 
                            type="submit" 
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
                        >
                            <FaSave size={14} /> Update Specialty
                        </button>
                        
                        <button 
                            type="button"
                            onClick={onClose}
                            className="w-full py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
                        >
                            Discard Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditSpecialtyModal;