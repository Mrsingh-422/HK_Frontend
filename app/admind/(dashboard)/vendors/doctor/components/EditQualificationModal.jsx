import React, { useState, useEffect } from 'react';
import { FaTimes, FaGraduationCap, FaIdCard, FaSave } from "react-icons/fa";

const EditQualificationModal = ({ isOpen, onClose, qualification, onUpdate }) => {
    // State to manage form data, initialized for qualifications
    const [formData, setFormData] = useState({ 
        title: '', 
        code: '', 
        description: '', 
        status: 'Active' 
    });

    // useEffect to pre-fill the form when a qualification is selected
    useEffect(() => {
        if (qualification) {
            setFormData(qualification);
        }
    }, [qualification]);

    // Render nothing if the modal isn't open or no qualification is provided
    if (!isOpen || !qualification) return null;

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData); // Pass the updated data to the parent
        onClose(); // Close the modal
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header Section */}
                <div className="bg-sky-600 p-8 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <FaGraduationCap size={20} />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Edit Qualification</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-all"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {/* Qualification Title Field */}
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
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-sky-600 font-bold text-sm"
                            />
                        </div>
                    </div>

                    {/* Qualification Code Field */}
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
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-sky-600 font-bold text-sm uppercase"
                            />
                        </div>
                    </div>

                    {/* Status Dropdown */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
                            Status
                        </label>
                        <select 
                            value={formData.status} 
                            onChange={(e) => setFormData({...formData, status: e.target.value})} 
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none appearance-none focus:border-sky-600"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Description Textarea */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">
                            Description
                        </label>
                        <textarea 
                            value={formData.description} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})} 
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none min-h-[100px] focus:border-sky-600" 
                            rows="3"
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="w-full py-4 mt-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                        <FaSave /> Update Qualification
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditQualificationModal;