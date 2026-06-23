'use client';

import React, { useRef, useState } from 'react';
import { FaArrowLeft, FaFilePdf, FaPlus } from 'react-icons/fa';

export default function DischargeModal({
    isOpen,
    onClose,
    dischargeForm,
    setDischargeForm,
    onAddMedicineDetail,
    clinicalReports,
    setClinicalReports
}) {
    const fileInputRef = useRef(null);
    const [localReports, setLocalReports] = useState([]);

    if (!isOpen) return null;

    // Utilize passed external state if available; fallback to local state if not
    const reports = clinicalReports !== undefined ? clinicalReports : localReports;
    const setReports = setClinicalReports !== undefined ? setClinicalReports : setLocalReports;

    const triggerFileSelect = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setReports((prev) => [...prev, ...filesArray]);
        }
    };

    const handleRemoveFile = (indexToRemove) => {
        setReports((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 border border-slate-100">
                
                {/* Hidden Native File Input */}
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

                {/* Form Layout */}
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
                            <span className="text-sm font-extrabold text-slate-500 block group-hover:text-emerald-700">Add discharge summary PDF</span>
                            <p className="text-xs text-slate-400 mt-1">Upload clinical diagnostic findings & test sheets.</p>
                        </div>

                        {/* List of Uploaded Files */}
                        {reports.length > 0 && (
                            <div className="space-y-2 mt-4 max-h-40 overflow-y-auto pr-1">
                                <h5 className="text-xs font-bold text-slate-500">Selected Files ({reports.length}):</h5>
                                {reports.map((file, idx) => (
                                    <div 
                                        key={idx} 
                                        className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-750 shadow-sm"
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
                        
                        <input 
                            type="text" 
                            value={dischargeForm.diagnosis}
                            onChange={(e) => setDischargeForm({ ...dischargeForm, diagnosis: e.target.value })}
                            placeholder="Diagnosis (e.g. Recovered from Gastro)" 
                            className="w-full px-4 py-3.5 bg-white border border-slate-250 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                        />
                        <input 
                            type="text" 
                            value={dischargeForm.investigation}
                            onChange={(e) => setDischargeForm({ ...dischargeForm, investigation: e.target.value })}
                            placeholder="Advised Investigation (e.g. ECG normal)" 
                            className="w-full px-4 py-3.5 bg-white border border-slate-250 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                        />
                        <input 
                            type="text" 
                            value={dischargeForm.advice}
                            onChange={(e) => setDischargeForm({ ...dischargeForm, advice: e.target.value })}
                            placeholder="Clinical Advice" 
                            className="w-full px-4 py-3.5 bg-white border border-slate-250 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                        />
                        <input 
                            type="text" 
                            value={dischargeForm.specialInstruction}
                            onChange={(e) => setDischargeForm({ ...dischargeForm, specialInstruction: e.target.value })}
                            placeholder="Special Instructions" 
                            className="w-full px-4 py-3.5 bg-white border border-slate-250 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-semibold text-slate-700"
                        />
                        <textarea 
                            rows="4"
                            value={dischargeForm.treatmentResult}
                            onChange={(e) => setDischargeForm({ ...dischargeForm, treatmentResult: e.target.value })}
                            placeholder="Treatment Result & Summary" 
                            className="w-full px-4 py-3.5 bg-white border border-slate-250 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none transition-all font-semibold text-slate-700"
                        />
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
                        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Upload Reports</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <button 
                            type="button" 
                            onClick={onAddMedicineDetail}
                            className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100 hover:bg-emerald-600 active:scale-95 transition-all mb-1.5"
                        >
                            <FaPlus size={20} />
                        </button>
                        <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider">Add Medicine Details</span>
                    </div>
                </div>
            </div>
        </div>
    );
}