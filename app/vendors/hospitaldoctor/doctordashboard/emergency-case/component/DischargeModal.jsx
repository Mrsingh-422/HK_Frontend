'use client';

import React, { useRef } from 'react';
import { FaArrowLeft, FaFilePdf, FaPlus, FaCheckCircle, FaCalendarAlt } from 'react-icons/fa';

export default function DischargeModal({
    isOpen,
    onClose,
    dischargeForm,
    setDischargeForm,
    onAddMedicineDetail,
    clinicalReports = [],
    setClinicalReports,
    addedMedicinesCount = 0
}) {
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const triggerFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setClinicalReports((prev) => [...prev, ...filesArray]);
        }
        e.target.value = '';
    };

    const handleRemoveFile = (indexToRemove) => {
        setClinicalReports((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleFormUpdate = (key, value) => {
        setDischargeForm(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 border border-slate-100">

                <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="application/pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <button onClick={onClose} className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                        <FaArrowLeft size={16} />
                    </button>
                    <h3 className="text-xl font-bold text-slate-800">Submit Discharge Summary</h3>
                    <div className="w-8"></div>
                </div>

                <div className="p-8 overflow-y-auto space-y-6 bg-slate-50/50 flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Report Payload</h4>

                        <div
                            onClick={triggerFileSelect}
                            className="p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-white flex flex-col items-center justify-center text-center hover:border-emerald-500 hover:bg-emerald-50/5 transition-all cursor-pointer group"
                        >
                            <div className="w-20 h-20 bg-slate-50 group-hover:bg-emerald-100/50 text-slate-400 group-hover:text-emerald-500 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 group-hover:border-emerald-200 transition-colors">
                                <FaFilePdf size={36} />
                            </div>
                            <span className="text-sm font-extrabold text-slate-500 block group-hover:text-emerald-700">Add clinical findings PDF</span>
                            <p className="text-xs text-slate-400 mt-1">Upload clinical diagnostic findings & test sheets.</p>
                        </div>

                        {clinicalReports.length > 0 && (
                            <div className="space-y-2 mt-4 max-h-40 overflow-y-auto pr-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Selected Files ({clinicalReports.length})</label>
                                {clinicalReports.map((file, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm"
                                    >
                                        <span className="truncate max-w-[200px]">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFile(idx)}
                                            className="text-slate-400 hover:text-rose-600 font-extrabold text-sm ml-2 px-1 hover:bg-slate-50 rounded-md"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Clinical Manifestations</h4>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Chief Complaints</label>
                            <input
                                type="text"
                                value={dischargeForm.chiefComplaints || ''}
                                onChange={(e) => handleFormUpdate('chiefComplaints', e.target.value)}
                                placeholder="e.g. High fever, mild dry cough"
                                className="w-full px-4 py-3.5 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Diagnosis</label>
                            <input
                                type="text"
                                value={dischargeForm.diagnosis || ''}
                                onChange={(e) => handleFormUpdate('diagnosis', e.target.value)}
                                placeholder="e.g. Acute Viral Pharyngitis"
                                className="w-full px-4 py-3.5 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Advised Investigation</label>
                            <input
                                type="text"
                                value={dischargeForm.advisedInvestigations || ''}
                                onChange={(e) => handleFormUpdate('advisedInvestigations', e.target.value)}
                                placeholder="e.g. ECG Normal, Blood counts stable"
                                className="w-full px-4 py-3.5 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Advice Given</label>
                            <input
                                type="text"
                                value={dischargeForm.adviceGiven || ''}
                                onChange={(e) => handleFormUpdate('adviceGiven', e.target.value)}
                                placeholder="Follow-up instructions"
                                className="w-full px-4 py-3.5 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Special Instructions</label>
                            <input
                                type="text"
                                value={dischargeForm.specialInstructions || ''}
                                onChange={(e) => handleFormUpdate('specialInstructions', e.target.value)}
                                placeholder="Any special directives"
                                className="w-full px-4 py-3.5 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                            />
                        </div>

                        {/* Parameter Inputs */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Date of Surgery (Optional)</label>
                                <input
                                    type="date"
                                    value={dischargeForm.dateOfSurgery || ''}
                                    onChange={(e) => handleFormUpdate('dateOfSurgery', e.target.value)}
                                    className="w-full px-4 py-3.5 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Next Appointment</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={dischargeForm.nextAppointment || ''}
                                        onChange={(e) => handleFormUpdate('nextAppointment', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                                    />
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <FaCalendarAlt size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Condition during Admission</label>
                            <input
                                type="text"
                                value={dischargeForm.conditionDuringAdmission || ''}
                                onChange={(e) => handleFormUpdate('conditionDuringAdmission', e.target.value)}
                                placeholder="e.g. Critical, managed on telemetry desk"
                                className="w-full px-4 py-3.5 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Condition during Discharge</label>
                            <input
                                type="text"
                                value={dischargeForm.conditionDuringDischarge || ''}
                                onChange={(e) => handleFormUpdate('conditionDuringDischarge', e.target.value)}
                                placeholder="e.g. Fully recovered and ambulatory"
                                className="w-full px-4 py-3.5 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-[#08B36A] focus:ring-2 focus:ring-[#08B36A]/10 transition-all font-semibold text-slate-700"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Treatment Result / Clinical Notes</label>
                            <textarea
                                rows="3"
                                value={dischargeForm.clinicalNotes || ''}
                                onChange={(e) => handleFormUpdate('clinicalNotes', e.target.value)}
                                placeholder="Treatment result & clinical notes summary"
                                className="w-full px-4 py-3.5 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-[#08B36A] focus:ring-2 focus:ring-[#08B36A]/10 resize-none transition-all font-semibold text-slate-700"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-4 sticky bottom-0 z-10">
                    <div className="flex flex-col items-center">
                        <button
                            type="button"
                            onClick={triggerFileSelect}
                            className="w-14 h-14 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shadow-sm hover:shadow active:scale-95 transition-all mb-1.5 border border-slate-200"
                        >
                            <FaFilePdf size={20} />
                        </button>
                        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">
                            Upload Reports ({clinicalReports.length})
                        </span>
                    </div>

                    <div className="flex flex-col items-center">
                        <button
                            type="button"
                            onClick={onAddMedicineDetail}
                            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all mb-1.5 ${
                                addedMedicinesCount > 0
                                ? 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700'
                                : 'bg-emerald-500 text-white shadow-emerald-100 hover:bg-emerald-600'
                            }`}
                        >
                            {addedMedicinesCount > 0 ? <FaCheckCircle size={20} /> : <FaPlus size={20} />}
                        </button>
                        <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider">
                            {addedMedicinesCount > 0 ? `${addedMedicinesCount} Meds Staged` : 'Add Medicine Details'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}