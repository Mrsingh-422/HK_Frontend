"use client";
import React, { useState, useEffect } from 'react';
import { 
    FaTimes, FaCapsules, FaIndustry, FaTag, FaMoneyBillWave, 
    FaPrescription, FaBoxOpen, FaFlask, FaStethoscope, 
    FaThermometerHalf, FaInfoCircle, FaCheck 
} from 'react-icons/fa';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const AddMedicineModal = ({ isOpen, onClose, onSave, themeColor, initialData }) => {
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        manufacturers: '',
        bread_crumb: '',
        mrp: '',
        best_price: '',
        prescription_required: 'NO',
        salt_composition: '',
        packaging: '',
        primary_use: '',
        storage: '',
        description: ''
    });

    // EFFECT: Pre-fill form if initialData (Edit mode) is provided
    useEffect(() => {
        if (initialData && isOpen) {
            setFormData({
                name: initialData.name || '',
                manufacturers: initialData.manufacturers || '',
                bread_crumb: initialData.bread_crumb || '',
                mrp: initialData.mrp || '',
                best_price: initialData.best_price || '',
                prescription_required: initialData.prescription_required || 'NO',
                salt_composition: initialData.salt_composition || '',
                packaging: initialData.packaging || '',
                primary_use: initialData.primary_use || '',
                storage: initialData.storage || '',
                description: initialData.description || ''
            });
        } else if (isOpen) {
            // Reset for Add mode
            setFormData({
                name: '', manufacturers: '', bread_crumb: '', mrp: '', best_price: '',
                prescription_required: 'NO', salt_composition: '', packaging: '',
                primary_use: '', storage: '', description: ''
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full pl-11 pr-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:border-[#08B36A] focus:bg-white outline-none font-bold text-sm transition-all placeholder:text-gray-300 uppercase";
    const labelClasses = "text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block";
    const iconClasses = "absolute left-4 top-1/2 -translate-y-1/2 text-[#08B36A]";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="p-8 text-white flex justify-between items-center" style={{ backgroundColor: themeColor }}>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl">
                            <FaCapsules size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight">
                                {initialData ? 'Edit Medicine' : 'Add Medicine'}
                            </h2>
                            <p className="text-xs font-bold opacity-80 uppercase tracking-widest mt-1">
                                {initialData ? 'Update Inventory Details' : 'Manual Inventory Entry'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-all">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[65vh] overflow-y-auto custom-scrollbar">
                    
                    {/* Medicine Name */}
                    <div className="md:col-span-2">
                        <label className={labelClasses}>Medicine Name</label>
                        <div className="relative">
                            <FaCapsules className={iconClasses} />
                            <input required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Paracetamol 500mg" className={inputClasses} />
                        </div>
                    </div>

                    {/* Manufacturer */}
                    <div>
                        <label className={labelClasses}>Manufacturer</label>
                        <div className="relative">
                            <FaIndustry className={iconClasses} />
                            <input required name="manufacturers" value={formData.manufacturers} onChange={handleChange} placeholder="e.g. Cipla Ltd" className={inputClasses} />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className={labelClasses}>Category</label>
                        <div className="relative">
                            <FaTag className={iconClasses} />
                            <input required name="bread_crumb" value={formData.bread_crumb} onChange={handleChange} placeholder="Analgesic > Fever" className={inputClasses} />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div>
                        <label className={labelClasses}>MRP (₹)</label>
                        <div className="relative">
                            <FaMoneyBillWave className={iconClasses} />
                            <input required type="number" name="mrp" value={formData.mrp} onChange={handleChange} placeholder="0.00" className={inputClasses} />
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Best Price (₹)</label>
                        <div className="relative">
                            <FaMoneyBillWave className={iconClasses} />
                            <input required type="number" name="best_price" value={formData.best_price} onChange={handleChange} placeholder="0.00" className={inputClasses} />
                        </div>
                    </div>

                    {/* Rx Required */}
                    <div>
                        <label className={labelClasses}>Prescription (Rx)</label>
                        <div className="relative">
                            <FaPrescription className={iconClasses} />
                            <select name="prescription_required" value={formData.prescription_required} onChange={handleChange} className={inputClasses}>
                                <option value="NO">NO (Over Counter)</option>
                                <option value="YES">YES (Rx Required)</option>
                            </select>
                        </div>
                    </div>

                    {/* Packaging */}
                    <div>
                        <label className={labelClasses}>Packaging</label>
                        <div className="relative">
                            <FaBoxOpen className={iconClasses} />
                            <input required name="packaging" value={formData.packaging} onChange={handleChange} placeholder="e.g. 10 tablets in 1 strip" className={inputClasses} />
                        </div>
                    </div>

                    {/* Salt Composition */}
                    <div className="md:col-span-2">
                        <label className={labelClasses}>Salt Composition</label>
                        <div className="relative">
                            <FaFlask className={iconClasses} />
                            <input required name="salt_composition" value={formData.salt_composition} onChange={handleChange} placeholder="e.g. Paracetamol (500mg)" className={inputClasses} />
                        </div>
                    </div>

                    {/* Storage */}
                    <div>
                        <label className={labelClasses}>Storage Info</label>
                        <div className="relative">
                            <FaThermometerHalf className={iconClasses} />
                            <input name="storage" value={formData.storage} onChange={handleChange} placeholder="Store in cool dry place" className={inputClasses} />
                        </div>
                    </div>

                    {/* Primary Use */}
                    <div>
                        <label className={labelClasses}>Primary Use</label>
                        <div className="relative">
                            <FaStethoscope className={iconClasses} />
                            <input name="primary_use" value={formData.primary_use} onChange={handleChange} placeholder="Pain relief / Fever" className={inputClasses} />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className={labelClasses}>Full Description</label>
                        <div className="relative">
                            <FaInfoCircle className="absolute left-4 top-4 text-[#08B36A]" />
                            <textarea rows="3" name="description" value={formData.description} onChange={handleChange} className={`${inputClasses} pl-11 normal-case font-medium`} placeholder="Enter detailed clinical information..."></textarea>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-8 py-3 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-all">
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{ backgroundColor: themeColor }}
                        className="px-12 py-4 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-green-100 flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? <AiOutlineLoading3Quarters className="animate-spin" /> : <FaCheck />}
                        {loading ? 'Processing...' : (initialData ? 'Update Inventory' : 'Confirm & Add')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddMedicineModal;