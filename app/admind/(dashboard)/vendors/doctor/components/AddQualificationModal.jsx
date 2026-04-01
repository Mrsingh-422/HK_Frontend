import React, { useState } from 'react';
import { FaTimes, FaGraduationCap, FaIdCard, FaFileAlt } from "react-icons/fa";

const AddQualificationModal = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState({ 
        title: '', 
        code: '', 
        description: '', 
        status: 'Active' 
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        // Reset form
        setFormData({ title: '', code: '', description: '', status: 'Active' });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-[#08B36A] p-8 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <FaGraduationCap size={20} />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Add Qualification</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-all"
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {/* Qualification Title */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
                            Qualification Title
                        </label>
                        <div className="relative">
                            <FaGraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input 
                                type="text" 
                                required 
                                value={formData.title} 
                                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#08B36A] font-bold text-sm" 
                                placeholder="e.g. MBBS, MD Cardiology" 
                            />
                        </div>
                    </div>

                    {/* Qualification Code */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
                            Short Code / ID
                        </label>
                        <div className="relative">
                            <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input 
                                type="text" 
                                required 
                                value={formData.code} 
                                onChange={(e) => setFormData({...formData, code: e.target.value})} 
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#08B36A] font-bold text-sm uppercase" 
                                placeholder="e.g. MED-01" 
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
                            Detailed Description
                        </label>
                        <div className="relative">
                            <textarea 
                                required 
                                value={formData.description} 
                                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#08B36A] font-bold text-sm min-h-[100px]" 
                                rows="3" 
                                placeholder="Describe the degree requirements or scope..."
                            ></textarea>
                        </div>
                    </div>

                    {/* Status Toggle (Optional but helpful) */}
                    <div className="flex items-center gap-4 px-2 py-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status:</label>
                        <div className="flex gap-2">
                            {['Active', 'Inactive'].map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setFormData({...formData, status})}
                                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${
                                        formData.status === status 
                                        ? 'bg-[#08B36A] text-white' 
                                        : 'bg-slate-100 text-slate-400'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="w-full mt-4 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                    >
                        Save Qualification
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddQualificationModal;