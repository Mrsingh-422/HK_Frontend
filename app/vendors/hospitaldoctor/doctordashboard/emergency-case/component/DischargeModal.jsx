'use client';

import React, { useRef } from 'react';
import { FaArrowLeft, FaFilePdf, FaPlus, FaCheckCircle, FaCalendarAlt, FaTimes, FaHeartbeat } from 'react-icons/fa';

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
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-slate-900/50 overflow-y-auto">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden max-h-[92vh] flex flex-col my-auto border border-slate-100 z-10">

                <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="application/pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20 shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="p-2.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 rounded-full transition-colors">
                            <FaArrowLeft size={16} />
                        </button>
                        <div>
                            <h3 className="text-xl font-extrabold text-slate-800">Fill Discharge Manifest</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fields filled here reflect live on Digital Template</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 rounded-full">
                        <FaTimes size={18} />
                    </button>
                </div>

                {/* Body Form */}
                <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-slate-50/50 flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                    {/* Left Column: File Uploads & Core Clinical Observations */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Report Payload & Notes</h4>

                        <div
                            onClick={triggerFileSelect}
                            className="p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-white flex flex-col items-center justify-center text-center hover:border-emerald-500 hover:bg-emerald-50/5 transition-all cursor-pointer group"
                        >
                            <div className="w-16 h-16 bg-slate-50 group-hover:bg-emerald-100/50 text-slate-400 group-hover:text-emerald-500 rounded-2xl flex items-center justify-center mb-3 border border-slate-100 group-hover:border-emerald-200 transition-colors">
                                <FaFilePdf size={28} />
                            </div>
                            <span className="text-xs font-extrabold text-slate-600 block group-hover:text-emerald-700">Add Clinical Findings PDF / Reports</span>
                            <p className="text-[10px] text-slate-400 mt-1">Upload clinical diagnostic findings & test sheets.</p>
                        </div>

                        {clinicalReports.length > 0 && (
                            <div className="space-y-2 mt-2 max-h-36 overflow-y-auto pr-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Selected Reports ({clinicalReports.length})</label>
                                {clinicalReports.map((file, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm"
                                    >
                                        <span className="truncate max-w-[220px]">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFile(idx)}
                                            className="text-slate-400 hover:text-rose-600 font-extrabold text-sm ml-2 px-1.5 hover:bg-slate-50 rounded-md"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Chief Complaints</label>
                            <input
                                type="text"
                                value={dischargeForm.chiefComplaints || ''}
                                onChange={(e) => handleFormUpdate('chiefComplaints', e.target.value)}
                                placeholder="e.g. High fever, mild dry cough, chest tightness"
                                className="w-full px-4 py-3 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Diagnosis</label>
                            <input
                                type="text"
                                value={dischargeForm.diagnosis || ''}
                                onChange={(e) => handleFormUpdate('diagnosis', e.target.value)}
                                placeholder="e.g. Acute Coronary Syndrome"
                                className="w-full px-4 py-3 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Advised Investigation</label>
                            <input
                                type="text"
                                value={dischargeForm.advisedInvestigations || ''}
                                onChange={(e) => handleFormUpdate('advisedInvestigations', e.target.value)}
                                placeholder="e.g. ECG Normal, Blood counts stable"
                                className="w-full px-4 py-3 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Advice Given</label>
                            <input
                                type="text"
                                value={dischargeForm.adviceGiven || ''}
                                onChange={(e) => handleFormUpdate('adviceGiven', e.target.value)}
                                placeholder="e.g. Avoid excess salt and drink warm water."
                                className="w-full px-4 py-3 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Special Instructions</label>
                            <input
                                type="text"
                                value={dischargeForm.specialInstructions || ''}
                                onChange={(e) => handleFormUpdate('specialInstructions', e.target.value)}
                                placeholder="e.g. Avoid heavy strain, take medication strictly on time"
                                className="w-full px-4 py-3 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                            />
                        </div>
                    </div>

                    {/* Right Column: Vitals, Dates, and State Conditions */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Clinical Parameters & Timeline</h4>

                        {/* Vitals Recording Sub-panel */}
                        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                                <FaHeartbeat className="text-rose-500" /> Discharge Vitals Summary
                            </span>
                            <div className="grid grid-cols-2 gap-2.5">
                                <div>
                                    <span className="text-[9px] text-slate-400 font-extrabold uppercase ml-1">BP (mmHg)</span>
                                    <input
                                        type="text"
                                        placeholder="120/80"
                                        value={dischargeForm.bp || ''}
                                        onChange={(e) => handleFormUpdate('bp', e.target.value)}
                                        className="w-full border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none bg-white text-slate-800 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <span className="text-[9px] text-slate-400 font-extrabold uppercase ml-1">Pulse (bpm)</span>
                                    <input
                                        type="text"
                                        placeholder="72"
                                        value={dischargeForm.pulse || ''}
                                        onChange={(e) => handleFormUpdate('pulse', e.target.value)}
                                        className="w-full border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none bg-white text-slate-800 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <span className="text-[9px] text-slate-400 font-extrabold uppercase ml-1">Temp (°F)</span>
                                    <input
                                        type="text"
                                        placeholder="98.6"
                                        value={dischargeForm.temp || ''}
                                        onChange={(e) => handleFormUpdate('temp', e.target.value)}
                                        className="w-full border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none bg-white text-slate-800 focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <span className="text-[9px] text-slate-400 font-extrabold uppercase ml-1">SpO2 (%)</span>
                                    <input
                                        type="text"
                                        placeholder="98"
                                        value={dischargeForm.spo2 || ''}
                                        onChange={(e) => handleFormUpdate('spo2', e.target.value)}
                                        className="w-full border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none bg-white text-slate-800 focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Date of Surgery (Optional)</label>
                                <input
                                    type="date"
                                    value={dischargeForm.dateOfSurgery || ''}
                                    onChange={(e) => handleFormUpdate('dateOfSurgery', e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Next Appointment</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={dischargeForm.nextAppointment || ''}
                                        onChange={(e) => handleFormUpdate('nextAppointment', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                                    />
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        <FaCalendarAlt size={13} />
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
                                className="w-full px-4 py-3 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Condition during Discharge</label>
                            <input
                                type="text"
                                value={dischargeForm.conditionDuringDischarge || ''}
                                onChange={(e) => handleFormUpdate('conditionDuringDischarge', e.target.value)}
                                placeholder="e.g. Fully recovered and stable"
                                className="w-full px-4 py-3 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-[#08B36A] focus:ring-2 focus:ring-[#08B36A]/10 transition-all font-semibold text-slate-700"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Treatment Result / Clinical Notes</label>
                            <textarea
                                rows="3"
                                value={dischargeForm.clinicalNotes || ''}
                                onChange={(e) => handleFormUpdate('clinicalNotes', e.target.value)}
                                placeholder="e.g. Recovered & Stable"
                                className="w-full px-4 py-3 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none focus:border-[#08B36A] focus:ring-2 focus:ring-[#08B36A]/10 resize-none transition-all font-semibold text-slate-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-20 shrink-0">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={triggerFileSelect}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                        >
                            <FaFilePdf size={14} className="text-slate-500" />
                            <span>Reports ({clinicalReports.length})</span>
                        </button>

                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            addedMedicinesCount > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-150 text-slate-500'
                        }`}>
                            {addedMedicinesCount > 0 ? <FaCheckCircle size={14} /> : <FaPlus size={14} />}
                            <span>{addedMedicinesCount > 0 ? `${addedMedicinesCount} Meds Staged` : 'No Meds Staged'}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onAddMedicineDetail}
                        className="w-full sm:w-auto px-8 py-3 bg-[#08B36A] hover:bg-[#079d5c] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-100 transition-all active:scale-95"
                    >
                        Next: Select Medications &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
}