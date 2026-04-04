import React, { useState, useEffect } from 'react';
import { FaEdit, FaTimes, FaCamera, FaUserCircle, FaSyncAlt } from 'react-icons/fa';

export default function EditDriverModal({ isOpen, onClose, driver, onUpdate }) {
    const [formData, setFormData] = useState({ 
        name: '', 
        phone: '', 
        vehicleType: '', 
        status: '', 
        image: '' 
    });
    
    const [previewUrl, setPreviewUrl] = useState(null);

    // Sync state when driver prop changes
    useEffect(() => {
        if (driver) {
            setFormData({ ...driver });
            setPreviewUrl(driver.image);
        }
    }, [driver]);

    // Clean up preview URL to prevent memory leaks
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    if (!isOpen || !driver) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const newUrl = URL.createObjectURL(file);
            setPreviewUrl(newUrl);
            setFormData(prev => ({ ...prev, image: newUrl }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
                
                {/* --- HEADER --- */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                            <FaEdit size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 leading-none">Edit Driver Profile</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {driver.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    
                    {/* --- IMAGE UPDATE SECTION --- */}
                    <div className="flex flex-col items-center">
                        <div className="relative group cursor-pointer">
                            <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden ring-2 ring-blue-50 transition-all duration-300 group-hover:ring-blue-200">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Driver" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <FaUserCircle size={60} />
                                    </div>
                                )}
                                
                                {/* Overlay on Hover */}
                                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <FaCamera size={20} className="text-white mb-1" />
                                    <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Change Photo</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                            
                            {/* Sync badge to indicate "Updateable" */}
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 p-2 rounded-full text-white shadow-lg border-2 border-white">
                                <FaSyncAlt size={10} className="animate-pulse-slow" />
                            </div>
                        </div>
                        <p className="mt-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Employee Avatar</p>
                    </div>

                    {/* --- FORM FIELDS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1 tracking-wider">Full Name</label>
                            <input 
                                type="text" required 
                                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" 
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1 tracking-wider">Contact Number</label>
                            <input 
                                type="tel" required 
                                value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" 
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1 tracking-wider">Vehicle Details</label>
                            <select 
                                value={formData.vehicleType} onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })} 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none"
                            >
                                <option>Two Wheeler</option>
                                <option>LMV (Van/Car)</option>
                                <option>Three Wheeler</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2 ml-1 tracking-wider">Duty Status</label>
                            <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100 rounded-2xl">
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, status: 'Online'})}
                                    className={`py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${formData.status === 'Online' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Online
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, status: 'Offline'})}
                                    className={`py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${formData.status === 'Offline' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Offline
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- FOOTER BUTTONS --- */}
                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" onClick={onClose} 
                            className="flex-1 py-3.5 bg-gray-50 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-100 border border-gray-200 transition-all"
                        >
                            Discard
                        </button>
                        <button 
                            type="submit" 
                            className="flex-[2] py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all"
                        >
                            Update Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}