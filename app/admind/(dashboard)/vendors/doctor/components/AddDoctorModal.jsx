import React, { useState, useRef } from 'react';
import {
    FaTimes, FaUserMd, FaEnvelope, FaPhoneAlt,
    FaIdBadge, FaStethoscope, FaCamera, FaMapMarkerAlt, FaUpload
} from "react-icons/fa";

const AddDoctorModal = ({ isOpen, onClose, onAdd }) => {
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        specialty: '',
        experience: '',
        address: '',
        image: null, // This will store the data/file
    });

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (optional, e.g., 2MB limit)
            if (file.size > 2 * 1024 * 1024) {
                alert("File is too large. Please choose an image under 2MB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result); // For the UI preview
                setFormData({ ...formData, image: reader.result }); // Storing as base64 for this demo
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email) return alert("Please fill in required fields");

        onAdd(formData);
        // Reset state
        setFormData({ name: '', email: '', phone: '', specialty: '', experience: '', address: '', image: null });
        setImagePreview(null);
        onClose();
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="bg-[#08B36A] p-8 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Add New Doctor</h2>
                        <p className="text-green-100 text-xs font-bold uppercase tracking-widest mt-1">Register a new medical professional</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-all">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">

                    {/* Image Upload Section */}
                    <div className="mb-8 flex flex-col items-center justify-center">
                        <div
                            onClick={() => fileInputRef.current.click()}
                            className="relative w-32 h-32 rounded-[2rem] border-4 border-slate-50 shadow-xl overflow-hidden cursor-pointer group bg-slate-100 flex items-center justify-center"
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            ) : (
                                <div className="text-center p-4">
                                    <FaCamera className="mx-auto text-slate-300 mb-1" size={24} />
                                    <p className="text-[8px] font-black uppercase text-slate-400">Upload Photo</p>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <FaUpload className="text-white" />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <p className="mt-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Doctor Profile Picture</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Name *</label>
                            <div className="relative">
                                <FaUserMd className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text" name="name" required value={formData.name} onChange={handleChange}
                                    placeholder="Dr. John Doe"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#08B36A] transition-all text-sm font-bold text-slate-700"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Address *</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email" name="email" required value={formData.email} onChange={handleChange}
                                    placeholder="doctor@example.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#08B36A] transition-all text-sm font-bold text-slate-700"
                                />
                            </div>
                        </div>

                        {/* Specialty */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Specialty</label>
                            <div className="relative">
                                <FaStethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text" name="specialty" value={formData.specialty} onChange={handleChange}
                                    placeholder="e.g. Cardiologist"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#08B36A] transition-all text-sm font-bold text-slate-700"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Phone Number</label>
                            <div className="relative">
                                <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text" name="phone" value={formData.phone} onChange={handleChange}
                                    placeholder="+1 234 567 890"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#08B36A] transition-all text-sm font-bold text-slate-700"
                                />
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Experience</label>
                            <div className="relative">
                                <FaIdBadge className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text" name="experience" value={formData.experience} onChange={handleChange}
                                    placeholder="e.g. 10 Years"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#08B36A] transition-all text-sm font-bold text-slate-700"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Address</label>
                            <div className="relative">
                                <FaMapMarkerAlt className="absolute left-4 top-4 text-slate-400" />
                                <textarea
                                    name="address" value={formData.address} onChange={handleChange}
                                    placeholder="Clinic or Hospital Address"
                                    rows="1"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#08B36A] transition-all text-sm font-bold text-slate-700"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                        >
                            Save Doctor Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDoctorModal;