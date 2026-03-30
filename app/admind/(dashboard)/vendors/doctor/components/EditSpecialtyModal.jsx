import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaCamera, FaStethoscope, FaSave } from "react-icons/fa";

const EditSpecialtyModal = ({ isOpen, onClose, specialty, onUpdate }) => {
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', status: 'Active', image: '' });

    useEffect(() => {
        if (specialty) {
            setFormData(specialty);
            setImagePreview(specialty.image);
        }
    }, [specialty]);

    if (!isOpen || !specialty) return null;

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
        onUpdate(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="bg-[#0ea5e9] p-8 flex justify-between items-center text-white">
                    <h2 className="text-xl font-black uppercase tracking-tight">Edit Specialty</h2>
                    <button onClick={onClose} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-all"><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="flex flex-col items-center mb-4">
                        <div onClick={() => fileInputRef.current.click()} className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center cursor-pointer overflow-hidden shadow-inner">
                            {imagePreview?.length > 10 ? <img src={imagePreview} className="w-full h-full object-cover" /> : <span className="text-3xl">{imagePreview}</span>}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Title</label>
                        <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:border-[#0ea5e9] outline-none" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Status</label>
                        <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none" rows="3"></textarea>
                    </div>

                    <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                        <FaSave /> Update Specialty
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditSpecialtyModal;