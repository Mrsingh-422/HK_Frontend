import React, { useState } from 'react';
import { FaTimes, FaStethoscope, FaCheckCircle } from "react-icons/fa";

const AddSpecialtyModal = ({ isOpen, onClose, onAdd }) => {
    // Initial state matching your backend 'name' field
    const [formData, setFormData] = useState({ name: '' });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Passing the data back to the parent 'handleAdd' function
        onAdd(formData);
        // Reset form
        setFormData({ name: '' });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-[#08B36A] p-8 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <FaStethoscope size={20} />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Add Specialty</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-all"
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Visual Badge for New Entry */}
                    <div className="flex justify-center">
                        <div className="bg-green-50 px-4 py-2 rounded-2xl border border-green-100">
                            <p className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest flex items-center gap-2">
                                <FaCheckCircle /> Create New Specialist Type
                            </p>
                        </div>
                    </div>

                    {/* Specialty Name Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
                            Specialization Name
                        </label>
                        <div className="relative">
                            <FaStethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input 
                                type="text" 
                                required 
                                value={formData.name} 
                                onChange={(e) => setFormData({ name: e.target.value })} 
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#08B36A] font-bold text-sm transition-all" 
                                placeholder="e.g. Cardiologist" 
                            />
                        </div>
                        <p className="text-[9px] text-slate-400 ml-2 italic">
                            This name will be displayed in doctor profiles.
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                        <button 
                            type="submit" 
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
                        >
                            Save Specialty
                        </button>
                        
                        <button 
                            type="button"
                            onClick={onClose}
                            className="w-full mt-3 py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSpecialtyModal;