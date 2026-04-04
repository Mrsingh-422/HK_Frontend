import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaTimes, FaCamera, FaTrashAlt, FaCloudUploadAlt } from 'react-icons/fa';

export default function AddDriverModal({ isOpen, onClose, onAdd }) {
    const [formData, setFormData] = useState({ 
        name: '', 
        phone: '', 
        vehicleType: 'Two Wheeler', 
        status: 'Online' 
    });
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Clean up preview URL to prevent memory leaks
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeImage = (e) => {
        e.stopPropagation();
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({ 
            ...formData, 
            image: previewUrl || 'https://via.placeholder.com/150?text=No+Photo' 
        });
        // Reset states
        setSelectedFile(null);
        setPreviewUrl(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
                
                {/* --- HEADER --- */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                            <FaUserPlus size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Register New Driver</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    
                    {/* --- IMAGE UPLOAD SECTION --- */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="relative group">
                            <div className={`w-28 h-28 rounded-full border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-300 
                                ${previewUrl ? 'border-emerald-500' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                                
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                                        <FaCloudUploadAlt size={28} className="text-gray-400 mb-1" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Photo</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                )}

                                {/* Overlay on Hover (If image exists) */}
                                {previewUrl && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-default">
                                        <button type="button" onClick={removeImage} className="p-2 bg-white/20 hover:bg-red-500 text-white rounded-lg transition-colors">
                                            <FaTrashAlt size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {/* Hidden trigger for changing photo */}
                            {!previewUrl && (
                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-2 rounded-full text-white shadow-lg border-2 border-white">
                                    <FaCamera size={12} />
                                </div>
                            )}
                        </div>
                        <p className="mt-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Profile Picture</p>
                    </div>

                    {/* --- FORM FIELDS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1 tracking-wider">Full Name</label>
                            <input 
                                type="text" required placeholder="Ex: Arjun Sharma" 
                                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all placeholder:text-gray-300" 
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1 tracking-wider">Phone Number</label>
                            <input 
                                type="tel" required placeholder="9876543210" 
                                value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all placeholder:text-gray-300" 
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1 tracking-wider">Vehicle Assigned</label>
                            <select 
                                value={formData.vehicleType} onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })} 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all appearance-none"
                            >
                                <option>Two Wheeler</option>
                                <option>LMV (Van/Car)</option>
                                <option>Three Wheeler</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Status Ready</h4>
                                <p className="text-[10px] text-emerald-600 font-medium">New drivers are set to Online by default.</p>
                            </div>
                            <select 
                                value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="bg-white border border-emerald-200 text-emerald-600 text-xs font-bold px-3 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option>Online</option>
                                <option>Offline</option>
                            </select>
                        </div>
                    </div>

                    {/* --- FOOTER BUTTONS --- */}
                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" onClick={onClose} 
                            className="flex-1 py-3.5 bg-gray-50 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-100 border border-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="flex-[2] py-3.5 bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-[0.98] transition-all"
                        >
                            Complete Registration
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}