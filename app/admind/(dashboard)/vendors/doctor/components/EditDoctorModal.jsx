import React, { useState, useEffect, useRef } from 'react';
import { 
    FaTimes, FaUserMd, FaEnvelope, FaPhoneAlt, 
    FaIdBadge, FaStethoscope, FaCamera, FaMapMarkerAlt, FaUpload, FaSave 
} from "react-icons/fa";

const EditDoctorModal = ({ isOpen, onClose, doctor, onUpdate }) => {
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        specialty: '',
        experience: '',
        address: '',
        image: '',
    });

    // Pre-fill form when doctor data changes
    useEffect(() => {
        if (doctor) {
            setFormData({
                name: doctor.name || '',
                email: doctor.email || '',
                phone: doctor.phone || '',
                specialty: doctor.specialty || '',
                experience: doctor.experience || '',
                address: doctor.address || '',
                image: doctor.image || '',
            });
            setImagePreview(doctor.image);
        }
    }, [doctor]);

    if (!isOpen || !doctor) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate({ ...doctor, ...formData });
        onClose();
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                
                {/* Header */}
                <div className="bg-[#0ea5e9] p-8 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Edit Doctor Profile</h2>
                        <p className="text-sky-100 text-xs font-bold uppercase tracking-widest mt-1">Modify information for {doctor.name}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-all">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 max-h-[80vh] overflow-y-auto">
                    
                    {/* Image Edit Section */}
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
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <FaUpload className="text-white" />
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                        <p className="mt-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">Change Profile Picture</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
                            <div className="relative">
                                <FaUserMd className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#0ea5e9] transition-all text-sm font-bold text-slate-700" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#0ea5e9] transition-all text-sm font-bold text-slate-700" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Specialty</label>
                            <div className="relative">
                                <FaStethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" name="specialty" value={formData.specialty} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#0ea5e9] transition-all text-sm font-bold text-slate-700" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Phone</label>
                            <div className="relative">
                                <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#0ea5e9] transition-all text-sm font-bold text-slate-700" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Experience</label>
                            <div className="relative">
                                <FaIdBadge className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" name="experience" value={formData.experience} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#0ea5e9] transition-all text-sm font-bold text-slate-700" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Address</label>
                            <div className="relative">
                                <FaMapMarkerAlt className="absolute left-4 top-4 text-slate-400" />
                                <textarea name="address" value={formData.address} onChange={handleChange} rows="1" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#0ea5e9] transition-all text-sm font-bold text-slate-700" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                        <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2">
                            <FaSave size={14}/> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDoctorModal;