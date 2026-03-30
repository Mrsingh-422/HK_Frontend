'use client';
import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaPlus, FaTrash, FaInfoCircle, FaQuestionCircle, FaArrowLeft } from 'react-icons/fa';

const EditPackageModal = ({ pkg, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState(null);
    const brandColor = "#08B36A";

    useEffect(() => {
        if (pkg) setFormData({ ...pkg });
    }, [pkg]);

    if (!isOpen || !formData) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = type === 'checkbox' ? checked : value;
        
        // Fix for boolean select values
        if (name === "isFastingRequired") finalValue = value === "true";

        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    // Arrays logic
    const updateArray = (index, field, value, arrayName) => {
        const updated = [...formData[arrayName]];
        updated[index][field] = value;
        setFormData({ ...formData, [arrayName]: updated });
    };

    const removeFromArray = (index, arrayName) => {
        const updated = formData[arrayName].filter((_, i) => i !== index);
        setFormData({ ...formData, [arrayName]: updated });
    };

    const addToArray = (arrayName, defaultValue) => {
        setFormData({ ...formData, [arrayName]: [...formData[arrayName], defaultValue] });
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="bg-white w-full max-w-5xl max-h-full rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">

                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                         <button onClick={onClose} className="p-3 text-slate-400 hover:bg-slate-50 rounded-full transition-all">
                            <FaArrowLeft size={16}/>
                         </button>
                         <div>
                            <h2 className="text-xl font-black text-slate-800">Edit Configuration</h2>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{formData.packageName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-300 hover:text-slate-600 transition-colors">
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-slate-50/20 custom-scrollbar">

                    {/* Section: Core */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <EditInput label="Package Full Name" name="packageName" value={formData.packageName} onChange={handleChange} />
                        <EditInput label="Category Label" name="category" value={formData.category} onChange={handleChange} />
                        <EditInput label="Base Price (₹)" name="standardMRP" type="number" value={formData.standardMRP} onChange={handleChange} />
                    </div>

                    {/* Section: Attributes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                        <EditInput label="Report Turnaround (TAT)" name="reportTime" value={formData.reportTime} onChange={handleChange} />
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fasting Status</label>
                            <select
                                name="isFastingRequired"
                                value={formData.isFastingRequired ? "true" : "false"}
                                onChange={handleChange}
                                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold outline-none focus:ring-2 focus:ring-[#08B36A] transition-all"
                            >
                                <option value="true">Fasting Required</option>
                                <option value="false">No Fasting Required</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-4 px-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 transition-all cursor-pointer">
                            <input
                                type="checkbox" name="isActive" id="isActive"
                                checked={formData.isActive} onChange={handleChange}
                                className="w-6 h-6 rounded-lg accent-[#08B36A]"
                            />
                            <label htmlFor="isActive" className="text-sm font-black text-emerald-700 cursor-pointer">Active on Platform</label>
                        </div>
                    </div>

                    {/* Section: Content Management */}
                    <div className="space-y-8">
                        <div className="flex justify-between items-end border-b pb-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <FaInfoCircle className="text-[#08B36A]" /> Clinical Descriptions
                            </h3>
                            <button onClick={() => addToArray('detailedDescription', { sectionTitle: '', sectionContent: '' })} className="text-xs font-black text-[#08B36A] hover:underline">+ ADD NEW SECTION</button>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            {formData.detailedDescription?.map((item, i) => (
                                <div key={i} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm relative group">
                                    <button onClick={() => removeFromArray(i, 'detailedDescription')} className="absolute top-4 right-4 text-slate-200 hover:text-red-500 transition-all p-2">
                                        <FaTrash size={12} />
                                    </button>
                                    <input
                                        className="w-full mb-3 font-black text-sm text-slate-800 outline-none border-b border-transparent focus:border-emerald-200 py-1"
                                        value={item.sectionTitle}
                                        onChange={(e) => updateArray(i, 'sectionTitle', e.target.value, 'detailedDescription')}
                                        placeholder="Section Title (e.g., Clinical Significance)"
                                    />
                                    <textarea
                                        className="w-full text-xs text-slate-500 font-medium outline-none resize-none bg-slate-50/30 p-4 rounded-xl"
                                        rows="3"
                                        value={item.sectionContent}
                                        onChange={(e) => updateArray(i, 'sectionContent', e.target.value, 'detailedDescription')}
                                        placeholder="Write detailed clinical information here..."
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section: FAQs */}
                    <div className="space-y-8">
                        <div className="flex justify-between items-end border-b pb-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <FaQuestionCircle className="text-[#08B36A]" /> Patient Support (FAQs)
                            </h3>
                            <button onClick={() => addToArray('faqs', { question: '', answer: '' })} className="text-xs font-black text-[#08B36A] hover:underline">+ ADD QUESTION</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {formData.faqs?.map((faq, i) => (
                                <div key={i} className="p-6 bg-white border border-slate-100 rounded-[2rem] space-y-3 relative shadow-sm">
                                    <button onClick={() => removeFromArray(i, 'faqs')} className="absolute top-4 right-4 text-slate-200 hover:text-red-500 transition-all p-2">
                                        <FaTrash size={12} />
                                    </button>
                                    <input
                                        className="w-full font-black text-xs text-slate-800 outline-none pr-8"
                                        value={faq.question}
                                        onChange={(e) => updateArray(i, 'question', e.target.value, 'faqs')}
                                        placeholder="Question"
                                    />
                                    <textarea
                                        className="w-full text-xs text-slate-500 font-medium outline-none bg-slate-50/50 p-3 rounded-xl resize-none"
                                        value={faq.answer}
                                        onChange={(e) => updateArray(i, 'answer', e.target.value, 'faqs')}
                                        placeholder="Answer"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-10 py-8 border-t border-slate-100 flex justify-end gap-4 bg-white">
                    <button onClick={onClose} className="px-8 py-3 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Discard Changes</button>
                    <button
                        onClick={() => onSave(formData)}
                        style={{ backgroundColor: brandColor }}
                        className="px-12 py-4 rounded-2xl text-white font-black text-sm shadow-xl shadow-emerald-200 hover:scale-[1.02] transition-all flex items-center gap-3"
                    >
                        <FaSave /> Push Update
                    </button>
                </div>
            </div>
        </div>
    );
};

const EditInput = ({ label, ...props }) => (
    <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A] transition-all placeholder:text-slate-300"
            {...props}
        />
    </div>
);

export default EditPackageModal;