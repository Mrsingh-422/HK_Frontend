'use client'
import React, { useState, useEffect } from 'react';
import { 
    FaUserPlus, FaTimes, FaCamera, FaTrashAlt, 
    FaCloudUploadAlt, FaIdCard, FaFileContract, FaCar 
} from 'react-icons/fa';

export default function AddDriverModal({ isOpen, onClose, onAdd }) {
    // State for text fields
    const [textData, setTextData] = useState({
        name: '',
        phone: '',
        username: '',
        vehicleNumber: '',
    });

    // State for files
    const [files, setFiles] = useState({
        profilePic: null,
        certificate: null,
        license: null,
        rcImage: null
    });

    // State for previews (UI only)
    const [previews, setPreviews] = useState({
        profilePic: null,
        certificate: null,
        license: null,
        rcImage: null
    });

    // Cleanup previews to avoid memory leaks
    useEffect(() => {
        return () => {
            Object.values(previews).forEach(url => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, [previews]);

    if (!isOpen) return null;

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

    const removeFile = (fieldName) => {
        setFiles(prev => ({ ...prev, [fieldName]: null }));
        setPreviews(prev => ({ ...prev, [fieldName]: null }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Create FormData object for Multipart/Form-Data API
        const data = new FormData();
        data.append('name', textData.name);
        data.append('phone', textData.phone);
        data.append('username', textData.username);
        data.append('vehicleNumber', textData.vehicleNumber);
        
        // Append files
        if (files.profilePic) data.append('profilePic', files.profilePic);
        if (files.certificate) data.append('certificate', files.certificate);
        if (files.license) data.append('license', files.license);
        if (files.rcImage) data.append('rcImage', files.rcImage);

        onAdd(data); // Pass FormData to the API call in parent
    };

    // Helper component for document upload boxes
    const DocUploadBox = ({ label, fieldName, icon: Icon }) => (
        <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">{label}</label>
            <div className={`relative h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all 
                ${previews[fieldName] ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                {previews[fieldName] ? (
                    <div className="relative w-full h-full p-2">
                        <img src={previews[fieldName]} className="w-full h-full object-cover rounded-lg" alt={label} />
                        <button 
                            type="button" 
                            onClick={() => removeFile(fieldName)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600"
                        >
                            <FaTrashAlt size={10} />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full px-2">
                        <Icon size={20} className="text-gray-400 mb-1" />
                        <span className="text-[9px] text-gray-400 font-bold text-center">Upload {label}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, fieldName)} />
                    </label>
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300">
                
                {/* --- HEADER --- */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
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

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    
                    {/* --- TOP SECTION: Profile Pic & Basic Info --- */}
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Profile Pic */}
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div className={`w-32 h-32 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-300 
                                    ${previews.profilePic ? 'border-emerald-500' : 'border-gray-300 bg-gray-50'}`}>
                                    {previews.profilePic ? (
                                        <img src={previews.profilePic} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                                            <FaCloudUploadAlt size={30} className="text-gray-400 mb-1" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Photo</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'profilePic')} />
                                        </label>
                                    )}
                                </div>
                                {previews.profilePic && (
                                    <button type="button" onClick={() => removeFile('profilePic')} className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-xl shadow-xl">
                                        <FaTrashAlt size={12} />
                                    </button>
                                )}
                            </div>
                            <p className="mt-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Profile Picture</p>
                        </div>

                        {/* Basic Details Inputs */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Full Name</label>
                                <input type="text" name="name" required placeholder="Arjun Sharma" value={textData.name} onChange={handleTextChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Username</label>
                                <input type="text" name="username" required placeholder="driver_arjun" value={textData.username} onChange={handleTextChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 ml-1">Phone Number</label>
                                <input type="tel" name="phone" required placeholder="9876543210" value={textData.phone} onChange={handleTextChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* --- VEHICLE SECTION --- */}
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center gap-4">
                        <div className="p-3 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-100">
                            <FaCar size={18} />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">Vehicle Plate Number</label>
                            <input 
                                type="text" name="vehicleNumber" required placeholder="UP 32 AB 1234" 
                                value={textData.vehicleNumber} onChange={handleTextChange} 
                                className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-sm font-bold uppercase focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        </div>
                    </div>

                    {/* --- DOCUMENTS SECTION --- */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                            <FaIdCard className="text-emerald-500" /> Verification Documents
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <DocUploadBox label="License" fieldName="license" icon={FaIdCard} />
                            <DocUploadBox label="Certificate" fieldName="certificate" icon={FaFileContract} />
                            <DocUploadBox label="RC Image" fieldName="rcImage" icon={FaCar} />
                        </div>
                    </div>

                    {/* --- FOOTER --- */}
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all">
                            Cancel
                        </button>
                        <button type="submit" className="flex-[2] py-3 bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-600 active:scale-[0.98] transition-all">
                            Save Driver Details
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}