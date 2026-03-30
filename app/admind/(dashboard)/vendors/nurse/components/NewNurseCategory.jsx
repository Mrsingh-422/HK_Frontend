'use client'

import React, { useState } from 'react'
import { FaCamera, FaStethoscope, FaMicroscope, FaCheck, FaTimes } from "react-icons/fa"

function NewNurseCategory({ isOpen, onClose, onAddCategory }) {
    const [formData, setFormData] = useState({
        name: '',
        department: 'Nursing',
        image: null
    })
    const [preview, setPreview] = useState(null)

    // If the modal is not open, don't render anything
    if (!isOpen) return null;

    // Handle Image Preview
    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFormData({ ...formData, image: file })
            setPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        
        // Prepare data for the parent component
        const newCategory = {
            id: Date.now(), // Temporary ID generation
            name: formData.name,
            department: formData.department,
            // Use the preview URL as the image for the UI list
            image: preview || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=100'
        }

        onAddCategory(newCategory)
        
        // Reset form and close
        setFormData({ name: '', department: 'Nursing', image: null })
        setPreview(null)
        onClose()
    }

    return (
        // --- BACKDROP ---
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            
            <div className="w-full max-w-xl animate-in zoom-in-95 duration-300">
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden relative">
                    
                    {/* CLOSE ICON (Top Right) */}
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
                    >
                        <FaTimes size={20} />
                    </button>

                    {/* --- HEADER --- */}
                    <div className="bg-[#08B36A] p-8 text-white">
                        <h2 className="text-2xl font-black tracking-tight">Add New Category</h2>
                        <p className="text-white/80 text-sm font-medium mt-1">Register a new medical department or specialized role.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-7">

                        {/* IMAGE UPLOAD SECTION */}
                        <div className="flex flex-col items-center justify-center">
                            <label className="relative cursor-pointer group">
                                <div className={`w-24 h-24 rounded-3xl border-4 border-dashed border-gray-100 flex items-center justify-center overflow-hidden transition-all group-hover:border-[#08B36A]/30 ${preview ? 'border-none' : ''}`}>
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <FaCamera className="text-gray-300 group-hover:text-[#08B36A] transition-colors" size={24} />
                                    )}
                                </div>
                                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                <div className="absolute -bottom-2 -right-2 bg-white shadow-md p-2 rounded-xl text-[#08B36A]">
                                    <FaCamera size={12} />
                                </div>
                            </label>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">Upload Category Icon</span>
                        </div>

                        {/* NAME INPUT */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Senior Technician"
                                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-[#08B36A]/20 focus:bg-white transition-all font-bold text-gray-700"
                            />
                        </div>

                        {/* DEPARTMENT SELECT */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Department</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, department: 'Nursing' })}
                                    className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${formData.department === 'Nursing' ? 'border-[#08B36A] bg-[#08B36A]/5 text-[#08B36A]' : 'border-gray-100 text-gray-400'}`}
                                >
                                    <FaStethoscope size={18} /> Nursing
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, department: 'Pathology' })}
                                    className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${formData.department === 'Pathology' ? 'border-[#08B36A] bg-[#08B36A]/5 text-[#08B36A]' : 'border-gray-100 text-gray-400'}`}
                                >
                                    <FaMicroscope size={18} /> Pathology
                                </button>
                            </div>
                        </div>

                        {/* SUBMIT BUTTONS */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-[#08B36A] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-green-100 hover:bg-[#079d5c] hover:shadow-green-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <FaCheck /> Create Category
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full mt-3 bg-transparent text-gray-400 py-2 rounded-2xl font-bold text-xs uppercase tracking-widest hover:text-gray-600 transition-all"
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                </div>

                <p className="text-center mt-6 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                    Healthcare Management Portal
                </p>
            </div>
        </div>
    )
}

export default NewNurseCategory