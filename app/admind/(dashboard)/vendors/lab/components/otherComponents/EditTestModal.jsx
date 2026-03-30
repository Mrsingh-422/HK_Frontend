'use client';
import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaPlus, FaTrash, FaInfoCircle, FaQuestionCircle } from 'react-icons/fa';

const EditTestModal = ({ test, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState(null);

    useEffect(() => { if (test) setFormData({ ...test }); }, [test]);

    if (!isOpen || !formData) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const updateNestedArray = (index, field, value, arrayName) => {
        const updated = [...formData[arrayName]];
        updated[index][field] = value;
        setFormData({ ...formData, [arrayName]: updated });
    };

    const addToNestedArray = (arrayName, emptyObj) => {
        setFormData({ ...formData, [arrayName]: [...formData[arrayName], emptyObj] });
    };

    const removeFromNestedArray = (index, arrayName) => {
        setFormData({ ...formData, [arrayName]: formData[arrayName].filter((_, i) => i !== index) });
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-xl">
            <div className="bg-white w-full max-w-5xl max-h-full rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500">

                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Edit Test Configuration</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Internal ID: {formData._id}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-300 hover:text-slate-600 transition-colors"><FaTimes size={24} /></button>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-slate-50/20 custom-scrollbar">

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <InputGroup label="Test Name" name="testName" value={formData.testName} onChange={handleChange} />
                        <InputGroup label="Test Code" name="testCode" value={formData.testCode} onChange={handleChange} />
                        <InputGroup label="Sample Type" name="sampleType" value={formData.sampleType} onChange={handleChange} />
                        <InputGroup label="Standard Price" name="standardMRP" type="number" value={formData.standardMRP} onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputGroup label="Main Category" name="mainCategory" value={formData.mainCategory} onChange={handleChange} />
                        <InputGroup label="Sub Category" name="category" value={formData.category} onChange={handleChange} />
                    </div>

                    {/* Parameters Editor */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Parameters (Comma Separated)</label>
                        <textarea
                            name="parameters"
                            className="w-full p-6 rounded-[2rem] border border-slate-100 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium text-xs bg-white resize-none"
                            rows="3"
                            value={formData.parameters[0]}
                            onChange={(e) => setFormData({ ...formData, parameters: [e.target.value] })}
                            placeholder="e.g. Hemoglobin, RBC Count, Platelets..."
                        />
                    </div>

                    {/* Preparation Editor */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pre-test Preparation Instructions</label>
                        <textarea
                            name="pretestPreparation"
                            className="w-full p-6 rounded-[2rem] border border-slate-100 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium text-xs bg-white"
                            rows="2"
                            value={formData.pretestPreparation}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Detailed Descriptions Dynamic Blocks */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FaInfoCircle /> Clinical Information</h3>
                            <button onClick={() => addToNestedArray('detailedDescription', { sectionTitle: '', sectionContent: '' })} className="text-[10px] font-black text-emerald-500">+ ADD SECTION</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {formData.detailedDescription?.map((item, i) => (
                                <div key={i} className="p-6 bg-white border border-slate-100 rounded-[2rem] relative shadow-sm">
                                    <button onClick={() => removeFromNestedArray(i, 'detailedDescription')} className="absolute top-4 right-4 text-slate-200 hover:text-red-500"><FaTrash size={12} /></button>
                                    <input
                                        className="w-full mb-3 font-bold text-sm text-slate-800 outline-none border-b border-transparent focus:border-emerald-100"
                                        value={item.sectionTitle}
                                        onChange={(e) => updateNestedArray(i, 'sectionTitle', e.target.value, 'detailedDescription')}
                                        placeholder="Section Title"
                                    />
                                    <textarea
                                        className="w-full text-xs text-slate-500 font-medium outline-none resize-none bg-slate-50/50 p-4 rounded-xl"
                                        value={item.sectionContent}
                                        onChange={(e) => updateNestedArray(i, 'sectionContent', e.target.value, 'detailedDescription')}
                                        placeholder="Section Content..."
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visibility Settings */}
                    <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-black text-emerald-800">Test Visibility</p>
                            <p className="text-xs text-emerald-700/60 font-medium italic">Make this test active and searchable on the platform.</p>
                        </div>
                        <input
                            type="checkbox" name="isActive"
                            checked={formData.isActive} onChange={handleChange}
                            className="w-8 h-8 accent-emerald-500"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-10 py-8 border-t border-slate-100 flex justify-end gap-6 bg-white">
                    <button onClick={onClose} className="text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">Discard Changes</button>
                    <button
                        onClick={() => onSave(formData)}
                        className="px-12 py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 flex items-center gap-3"
                    >
                        <FaSave /> Commit Updates
                    </button>
                </div>
            </div>
        </div>
    );
};

const InputGroup = ({ label, ...props }) => (
    <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-white text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm"
            {...props}
        />
    </div>
);

export default EditTestModal;