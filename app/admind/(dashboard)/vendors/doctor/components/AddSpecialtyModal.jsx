import React, { useState, useRef } from 'react';
import { FaTimes, FaCamera, FaUpload, FaStethoscope, FaFileAlt } from "react-icons/fa";

const AddSpecialtyModal = ({ isOpen, onClose, onAdd }) => {
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', status: 'Active', image: '' });

    if (!isOpen) return null;

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
        onAdd(formData);
        setFormData({ title: '', description: '', status: 'Active', image: '' });
        setImagePreview(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="bg-[#08B36A] p-8 flex justify-between items-center text-white">
                    <h2 className="text-xl font-black uppercase tracking-tight">Add Specialty</h2>
                    <button onClick={onClose} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-all"><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="flex flex-col items-center mb-4">
                        <div onClick={() => fileInputRef.current.click()} className="w-24 h-24 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-[#08B36A] transition-all overflow-hidden">
                            {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <FaCamera className="text-slate-300" size={24} />}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                        <p className="text-[10px] font-black uppercase text-slate-400 mt-2 tracking-widest">Upload Icon</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Specialty Title</label>
                        <div className="relative">
                            <FaStethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                            <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#08B36A] font-bold text-sm" placeholder="Cardiology" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Description</label>
                        <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-[#08B36A] font-bold text-sm" rows="3" placeholder="Describe the specialty..."></textarea>
                    </div>

                    <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">Save Specialty</button>
                </form>
            </div>
        </div>
    );
};

export default AddSpecialtyModal;