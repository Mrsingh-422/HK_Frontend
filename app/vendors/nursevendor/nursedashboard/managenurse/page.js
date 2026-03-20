'use client'
import React, { useState, useRef } from 'react'
import { 
    FaUserPlus, FaEdit, FaTrashAlt, FaPhoneAlt, FaCircle, FaUserCircle,
    FaTimesCircle, FaIdCard, FaBriefcase, FaInfoCircle, FaArrowLeft, FaPlus, FaCamera,
    FaGlobe, FaStethoscope, FaEnvelope // Added missing icons here
} from 'react-icons/fa'

export default function ManageNurseTable() {
    // --- MODAL STATES ---
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedNurse, setSelectedNurse] = useState(null);

    // --- PHOTO UPLOAD STATE ---
    const [uploadedImages, setUploadedImages] = useState({
        driver: null,
        certificate: null,
        license: null,
        rc: null,
        insurance: null
    });

    // Refs for hidden file inputs
    const fileInputRefs = {
        driver: useRef(null),
        certificate: useRef(null),
        license: useRef(null),
        rc: useRef(null),
        insurance: useRef(null)
    };

    // --- MOCK DATA ---
    const nurses = [
        { id: 'cgjccjch', name: 'Demo Nurse', phone: '655666555', status: 'Offline', gender: 'Female', exp: '2 Years', language: 'Hindi, English', email: 'demo@nurse.com' },
        { id: 'nurse882', name: 'Amandeep Kaur', phone: '9876543210', status: 'Online', gender: 'Female', exp: '5 Years', language: 'Punjabi, Hindi', email: 'aman@nurse.com' },
    ];

    // --- HANDLERS ---
    const handleRowClick = (nurse) => {
        setSelectedNurse(nurse);
        setIsDetailsModalOpen(true);
    };

    const handleImageUpload = (e, key) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImages(prev => ({ ...prev, [key]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className=" bg-[#F9FAFB] min-h-screen relative font-sans">
            
            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1e5a91]">Manage-Nurse</h1>
                    <p className="text-gray-500 text-sm">Review profiles, edit details, or onboard new nurses.</p>
                </div>

                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-[#08B36A] hover:bg-[#069a5a] text-white px-6 py-2.5 rounded-full font-bold shadow-md transition-all active:scale-95"
                >
                    <FaUserPlus /> Add +
                </button>
            </div>

            {/* --- TABLE CARD --- */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nurse Profile</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {nurses.map((nurse) => (
                                <tr key={nurse.id} onClick={() => handleRowClick(nurse)} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border"><FaUserCircle size={40} /></div>
                                            <div>
                                                <div className="font-bold text-gray-800">{nurse.name}</div>
                                                <div className="text-[10px] text-gray-400">{nurse.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${nurse.status === 'Online' ? 'bg-green-50 text-[#08B36A] border-green-100' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                                                <FaCircle size={6} className={nurse.status === 'Online' ? 'animate-pulse' : ''} /> {nurse.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <button className="text-[#08B36A] p-2 hover:bg-green-50 rounded-lg mr-2"><FaEdit /></button>
                                        <button className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><FaTrashAlt /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --------------------------- 
                ADD NURSE DRIVER FORM MODAL (WEBSITE STYLE)
            ---------------------------- */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-5xl h-full md:h-[90vh] rounded-[30px] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
                        
                        {/* Form Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                                    <FaArrowLeft size={20} />
                                </button>
                                <h2 className="text-2xl font-bold text-gray-800">Add Nurse Driver</h2>
                            </div>
                            <p className="text-sm text-gray-400 font-medium">Register a new healthcare provider</p>
                        </div>

                        {/* Form Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-[#FAFBFC]">
                            
                            {/* --- SECTION 1: DOCUMENT IMAGES (Grid) --- */}
                            <div>
                                <h3 className="text-sm font-bold text-[#08B36A] uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <FaCamera /> Required Documents & Photos
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[
                                        { label: "Driver Image", key: "driver" },
                                        { label: "Nursing Certificate", key: "certificate" },
                                        { label: "Driver License", key: "license" },
                                        { label: "RC Image", key: "rc" },
                                        { label: "Vehicle Insurance", key: "insurance" }
                                    ].map((item) => (
                                        <div key={item.key} className="space-y-2">
                                            <label className="text-[12px] font-bold text-gray-500 ml-1">{item.label}</label>
                                            <div className="relative h-40 bg-white border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden group hover:border-[#08B36A] transition-colors">
                                                {uploadedImages[item.key] ? (
                                                    <img src={uploadedImages[item.key]} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center">
                                                        <FaPlus className="mx-auto text-gray-300 mb-2 group-hover:text-[#08B36A]" size={24} />
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase group-hover:text-[#08B36A]">Upload Photo</span>
                                                    </div>
                                                )}
                                                {/* Hidden Input */}
                                                <input 
                                                    type="file" 
                                                    ref={fileInputRefs[item.key]}
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, item.key)}
                                                />
                                                {/* Click Overlay */}
                                                <div 
                                                    onClick={() => fileInputRefs[item.key].current.click()}
                                                    className="absolute inset-0 cursor-pointer"
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* --- SECTION 2: INPUT FIELDS (2-Column Grid) --- */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-bold text-[#08B36A] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <FaIdCard /> Personal & Professional Details
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {[
                                        { label: "Enter Full Name", placeholder: "e.g. John Doe" },
                                        { label: "Enter Contact Number", placeholder: "+91 XXXXX XXXXX" },
                                        { label: "Enter email address", placeholder: "example@mail.com" },
                                        { label: "Enter last qualification", placeholder: "e.g. B.Sc Nursing" },
                                    ].map((field, i) => (
                                        <div key={i} className="space-y-1.5">
                                            <label className="text-[13px] font-bold text-gray-700 ml-1">{field.label}</label>
                                            <input type="text" placeholder={field.placeholder} className="w-full p-3.5 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#08B36A] focus:ring-4 focus:ring-green-50 transition-all text-sm shadow-sm" />
                                        </div>
                                    ))}

                                    <div className="space-y-1.5">
                                        <label className="text-[13px] font-bold text-gray-700 ml-1">Select State</label>
                                        <select className="w-full p-3.5 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#08B36A] text-sm appearance-none cursor-pointer shadow-sm">
                                            <option>Select state</option>
                                            <option>Punjab</option>
                                            <option>Haryana</option>
                                            <option>Delhi</option>
                                        </select>
                                    </div>

                                    {[
                                        { label: "Nursing Council Name", placeholder: "Enter nursing council name" },
                                        { label: "Registration certificate number", placeholder: "Enter registration number" },
                                        { label: "Vehicle number", placeholder: "PB 65 XX XXXX" },
                                        { label: "Vehicle type", placeholder: "e.g. Car / Bike" },
                                        { label: "License number", placeholder: "DL-XXXXXXXXXXXX" },
                                        { label: "Insurance number", placeholder: "Enter policy number" },
                                        { label: "Full Address", placeholder: "House No, Street, City...", isFull: true },
                                        { label: "Set Password", placeholder: "Minimum 8 characters", type: "password" },
                                    ].map((field, i) => (
                                        <div key={i} className={`space-y-1.5 ${field.isFull ? 'md:col-span-2' : ''}`}>
                                            <label className="text-[13px] font-bold text-gray-700 ml-1">Enter {field.label}</label>
                                            <input type={field.type || "text"} placeholder={field.placeholder} className="w-full p-3.5 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#08B36A] focus:ring-4 focus:ring-green-50 transition-all text-sm shadow-sm" />
                                        </div>
                                    ))}
                                </div>

                                {/* SUBMIT BUTTON */}
                                <div className="pt-6 flex justify-center">
                                    <button className="w-full max-w-md bg-[#08B36A] hover:bg-[#069a5a] text-white font-bold py-4 rounded-2xl shadow-xl shadow-green-100 transition-all active:scale-95 uppercase tracking-widest text-sm">
                                        Submit Registration
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- DETAILS MODAL --- */}
            {isDetailsModalOpen && selectedNurse && !isAddModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative animate-in zoom-in duration-300">
                        
                        {/* Header Section */}
                        <div className="bg-[#08B36A] p-10 text-white relative">
                            {/* Close Button */}
                            <button 
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="absolute top-8 right-8 text-white/90 hover:text-white transition-colors"
                            >
                                <FaTimesCircle size={32} />
                            </button>

                            <div className="flex items-center gap-6">
                                {/* Avatar */}
                                <div className="w-24 h-24 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center shadow-inner">
                                    <FaUserCircle size={70} className="text-white/90" />
                                </div>
                                
                                {/* Name & Status */}
                                <div className="space-y-2">
                                    <h2 className="text-4xl font-black tracking-tight">{selectedNurse.name}</h2>
                                    <div className="bg-white px-4 py-1 rounded-full inline-flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${selectedNurse.status === 'Online' ? 'bg-[#08B36A]' : 'bg-gray-400'}`}></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                            {selectedNurse.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Body Section */}
                        <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 bg-white">
                            
                            {/* Left Column: Personal Details */}
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-3 flex items-center gap-2">
                                    <FaInfoCircle className="text-[#08B36A] text-sm" /> Personal Details
                                </h3>
                                
                                <div className="space-y-5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nurse ID</span>
                                        <span className="text-lg font-bold text-gray-700 mt-1">{selectedNurse.id}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gender</span>
                                        <span className="text-lg font-bold text-gray-700 mt-1">{selectedNurse.gender}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Languages</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <FaGlobe className="text-blue-400" />
                                            <span className="text-lg font-bold text-gray-700">{selectedNurse.language}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Work & Contact */}
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-3 flex items-center gap-2">
                                    <FaBriefcase className="text-[#08B36A] text-sm" /> Work & Contact
                                </h3>

                                <div className="space-y-5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Experience</span>
                                        <div className="flex items-center gap-2 mt-1 text-[#08B36A]">
                                            <FaStethoscope />
                                            <span className="text-lg font-black">{selectedNurse.exp}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</span>
                                        <div className="flex items-center gap-2 mt-1 text-gray-700">
                                            <FaPhoneAlt className="text-gray-400 size-3" />
                                            <span className="text-lg font-bold">{selectedNurse.phone}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</span>
                                        <div className="flex items-center gap-2 mt-1 text-gray-700">
                                            <FaEnvelope className="text-gray-400 size-3" />
                                            <span className="text-lg font-bold truncate">{selectedNurse.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Section */}
                        <div className="p-8 bg-[#F9FAFB] flex justify-end gap-4">
                            <button 
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="px-10 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-500 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
                            >
                                Close
                            </button>
                            <button className="px-10 py-3.5 rounded-2xl bg-[#08B36A] text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-[#069a5a] hover:scale-105 transition-all">
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}