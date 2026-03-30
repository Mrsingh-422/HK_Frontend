'use client'

import React, { useState, useRef } from 'react';
import {
    FaPlus, FaTrash, FaEdit, FaTimes,
    FaCloudUploadAlt, FaExternalLinkAlt, FaAdn
} from 'react-icons/fa';

const AdManagementPage = () => {
    // Initial State
    const [ads, setAds] = useState([
        {
            id: 1,
            title: 'Pharmacy Sale',
            description: 'Get up to 20% off on all essential medicines this week.',
            image: null, // This will hold the local blob URL
            page: 'Medicine Store'
        }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', image: '', page: '' });

    const fileInputRef = useRef(null);

    // Handle File Selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create a local URL for previewing the image
            const localUrl = URL.createObjectURL(file);
            setFormData({ ...formData, image: localUrl });
        }
    };

    const openModal = (ad = null) => {
        if (ad) {
            setEditId(ad.id);
            setFormData({ ...ad });
        } else {
            setEditId(null);
            setFormData({ title: '', description: '', image: '', page: '' });
        }
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm("Delete this advertisement?")) {
            setAds(ads.filter(ad => ad.id !== id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editId) {
            setAds(ads.map(ad => ad.id === editId ? { ...formData, id: editId } : ad));
        } else {
            setAds([...ads, { ...formData, id: Date.now() }]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 text-gray-800">
            {/* --- HEADER --- */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <FaAdn className="text-[#08b36a]" /> Ads Manager
                    </h1>
                    <p className="text-gray-500 font-medium">Upload and manage promotional banners</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-[#08b36a] hover:bg-[#079d5d] text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-100 active:scale-95"
                >
                    <FaPlus /> Create New Ad
                </button>
            </div>

            {/* --- TABLE AREA --- */}
            <div className="max-w-7xl mx-auto bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase border-b">S No.</th>
                                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase border-b">Title</th>
                                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase border-b">Description</th>
                                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase border-b">Image</th>
                                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase border-b">Page</th>
                                <th className="px-8 py-5 text-[13px] font-bold text-gray-400 uppercase border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {ads.map((ad, index) => (
                                <tr key={ad.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-5 text-sm font-bold text-gray-400">{index + 1}</td>
                                    <td className="px-8 py-5 text-sm font-black text-gray-800 uppercase tracking-tight">{ad.title}</td>
                                    <td className="px-8 py-5 text-sm text-gray-500 max-w-xs">
                                        <p className="line-clamp-2 italic leading-relaxed">"{ad.description}"</p>
                                    </td>
                                    <td className="px-8 py-5">
                                        {ad.image ? (
                                            <img src={ad.image} alt="Ad" className="w-14 h-14 object-cover rounded-xl shadow-inner border border-gray-100" />
                                        ) : (
                                            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-xs">No Img</div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase">
                                            <FaExternalLinkAlt size={10} /> {ad.page}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-center gap-3">
                                            <button onClick={() => openModal(ad)} className="p-2.5 text-[#08b36a] hover:bg-green-50 rounded-xl transition-all"><FaEdit size={18} /></button>
                                            <button onClick={() => handleDelete(ad.id)} className="p-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-all"><FaTrash size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL FORM --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-[#08b36a] p-8 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">{editId ? 'Update Ad' : 'Create Ad'}</h2>
                                <p className="text-xs font-bold opacity-70 uppercase mt-1 tracking-widest">Advertisement details</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="bg-white/20 p-3 rounded-full hover:rotate-90 transition-all"><FaTimes /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {/* Image Upload Area */}
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="group cursor-pointer border-2 border-dashed border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-green-50 hover:border-[#08b36a] transition-all relative overflow-hidden h-40"
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />

                                {formData.image ? (
                                    <>
                                        <img src={formData.image} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="Preview" />
                                        <div className="relative z-10 flex flex-col items-center">
                                            <img src={formData.image} className="w-16 h-16 rounded-xl object-cover shadow-md border-2 border-white mb-2" alt="Selected" />
                                            <span className="text-[#08b36a] text-xs font-bold uppercase">Change Image</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <FaCloudUploadAlt size={40} className="text-gray-300 group-hover:text-[#08b36a] transition-colors mb-2" />
                                        <p className="text-sm font-bold text-gray-500 group-hover:text-[#08b36a]">Click to upload from Gallery</p>
                                        <p className="text-[10px] text-gray-400 uppercase mt-1">PNG, JPG or JPEG up to 5MB</p>
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
                                    <input required className="w-full mt-1 px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none transition-all font-bold"
                                        placeholder="e.g. MEGA OFFERS" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value.toUpperCase() })} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea required rows="2" className="w-full mt-1 px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none transition-all text-sm leading-relaxed"
                                        placeholder="Describe your offer..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Destination Page</label>
                                    <input required className="w-full mt-1 px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-[#08b36a] focus:bg-white rounded-2xl outline-none transition-all font-semibold"
                                        placeholder="e.g. Products / Doctor Profile" value={formData.page} onChange={e => setFormData({ ...formData, page: e.target.value })} />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-[#08b36a] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg hover:bg-[#079d5d] transition-all active:scale-95 shadow-green-100">
                                {editId ? 'Save Update' : 'Publish Ad'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdManagementPage;