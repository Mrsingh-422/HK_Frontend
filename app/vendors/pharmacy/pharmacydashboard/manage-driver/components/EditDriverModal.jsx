'use client'
import React, { useState, useEffect } from 'react';
import {
    FaEdit, FaTimes, FaCamera, FaUserCircle, FaSyncAlt,
    FaIdCard, FaFileContract, FaCar
} from 'react-icons/fa';

export default function EditDriverModal({ isOpen, onClose, driver, onUpdate }) {
    // 1. State for text fields
    const [textData, setTextData] = useState({
        name: '',
        phone: '',
        username: '',
        vehicleNumber: '',
    });

    // 2. State for new binary files (to be sent to backend)
    const [files, setFiles] = useState({
        profilePic: null,
        certificate: null,
        license: null,
        rcImage: null
    });

    // 3. State for UI Previews (Remote URLs or local Blobs)
    const [previews, setPreviews] = useState({
        profilePic: null,
        certificate: null,
        license: null,
        rcImage: null
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper to format backend paths to full URLs
    const getFullUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('blob:') || path.startsWith('http')) return path;
        // Removes 'public/' and appends the backend base URL
        const cleanPath = path.replace('public/', '');
        return `${process.env.NEXT_PUBLIC_BACKEND_URL}/${cleanPath}`;
    };

    // Sync state when modal opens with driver data
    useEffect(() => {
        if (driver) {
            setTextData({
                name: driver.name || '',
                phone: driver.phone || '',
                username: driver.username || '',
                vehicleNumber: driver.vehicleNumber || '',
            });

            // Set initial previews from existing data
            setPreviews({
                profilePic: getFullUrl(driver.profilePic),
                certificate: getFullUrl(driver.documents?.certificate),
                license: getFullUrl(driver.documents?.license),
                rcImage: getFullUrl(driver.documents?.rcImage),
            });

            // Reset files state (no new files selected yet)
            setFiles({ profilePic: null, certificate: null, license: null, rcImage: null });
            setIsSubmitting(false);
        }
    }, [driver, isOpen]);

    // Cleanup local blob URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            Object.values(previews).forEach(url => {
                if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
            });
        };
    }, [previews]);

    if (!isOpen || !driver) return null;

    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setTextData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [fieldName]: file }));
            setPreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('name', textData.name);
        data.append('phone', textData.phone);
        data.append('username', textData.username);
        data.append('vehicleNumber', textData.vehicleNumber);

        // Only append files if a new one was selected by the user
        if (files.profilePic) data.append('profilePic', files.profilePic);
        if (files.certificate) data.append('certificate', files.certificate);
        if (files.license) data.append('license', files.license);
        if (files.rcImage) data.append('rcImage', files.rcImage);

        // Call the parent update function (from ManageDriversPage)
        // Pass the ID and the FormData
        await onUpdate(driver._id, data);
        setIsSubmitting(false);
    };

    // Sub-component for Document Upload boxes
    const DocEditBox = ({ label, fieldName, icon: Icon }) => (
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">{label}</label>
            <div className={`relative h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all group
                ${files[fieldName] ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 bg-gray-50'}`}>

                {previews[fieldName] ? (
                    <div className="relative w-full h-full p-1">
                        <img src={previews[fieldName]} className="w-full h-full object-cover rounded-lg" alt={label} />
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-opacity">
                            <FaSyncAlt className="text-white mb-1" />
                            <span className="text-[8px] text-white font-bold uppercase">Replace</span>
                            <input type="file" className="hidden" onChange={(e) => handleFileChange(e, fieldName)} />
                        </label>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full hover:bg-gray-100 rounded-xl transition-colors">
                        <Icon size={24} className="text-gray-300" />
                        <span className="text-[8px] text-gray-400 font-bold uppercase mt-2">Upload {label}</span>
                        <input type="file" className="hidden" onChange={(e) => handleFileChange(e, fieldName)} />
                    </label>
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-auto overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300">

                {/* --- HEADER --- */}
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                            <FaEdit size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 leading-none">Edit Driver Profile</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {driver._id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">

                    {/* --- PROFILE IMAGE & BASIC INFO --- */}
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl overflow-hidden ring-2 ring-blue-50 group-hover:ring-blue-200 transition-all">
                                {previews.profilePic ? (
                                    <img src={previews.profilePic} alt="Driver" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400"><FaUserCircle size={60} /></div>
                                )}
                                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <FaCamera size={20} className="text-white mb-1" />
                                    <span className="text-[8px] font-bold text-white uppercase">Change Photo</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'profilePic')} />
                                </label>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 ml-1">Full Name</label>
                                <input type="text" name="name" required value={textData.name} onChange={handleTextChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 ml-1">Username</label>
                                <input type="text" name="username" required value={textData.username} onChange={handleTextChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1 ml-1">Contact Number</label>
                                <input type="tel" name="phone" required value={textData.phone} onChange={handleTextChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* --- VEHICLE SECTION --- */}
                    <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex items-center gap-4">
                        <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-100">
                            <FaCar size={20} />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Vehicle Plate Number</label>
                            <input
                                type="text" name="vehicleNumber" required value={textData.vehicleNumber} onChange={handleTextChange}
                                className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-sm font-bold uppercase text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="E.G. UP32 AB 1234"
                            />
                        </div>
                    </div>

                    {/* --- DOCUMENTS SECTION --- */}
                    <div className="pt-2">
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                            <FaIdCard className="text-blue-500" /> Compliance Documents
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <DocEditBox label="Driving License" fieldName="license" icon={FaIdCard} />
                            <DocEditBox label="Medical Certificate" fieldName="certificate" icon={FaFileContract} />
                            <DocEditBox label="Vehicle RC Image" fieldName="rcImage" icon={FaCar} />
                        </div>
                    </div>

                    {/* --- FOOTER --- */}
                    <div className="pt-6 flex gap-3 border-t border-gray-50">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all disabled:opacity-50">
                            Discard Changes
                        </button>
                        <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Updating...
                                </>
                            ) : (
                                "Apply Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}