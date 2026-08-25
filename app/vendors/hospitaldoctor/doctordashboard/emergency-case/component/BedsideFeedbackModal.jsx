'use client';

import React from 'react';
import { FaTimes, FaSpinner, FaClipboardList, FaPlus, FaTrash, FaCapsules, FaHeartbeat } from 'react-icons/fa';

export default function BedsideFeedbackModal({
    isOpen,
    onClose,
    feedbackForm,
    setFeedbackForm,
    actionLoading,
    onSubmit,
    onAddMedicineTrigger, // Launches the Prescription modal selector
    isMainDoctor = false  // Evaluates primary attending vs co-doctor flow
}) {
    if (!isOpen) return null;

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Pass the latest feedbackForm state directly on submit
        onSubmit(feedbackForm);
    };

    const handleRemoveMedicine = (indexToRemove) => {
        setFeedbackForm(prev => ({
            ...prev,
            recommendedMedicines: (prev.recommendedMedicines || []).filter((_, idx) => idx !== indexToRemove)
        }));
    };

    // Helper to safely update nested vitals properties
    const handleVitalUpdate = (key, value) => {
        setFeedbackForm(prev => ({
            ...prev,
            vitals: {
                ...(prev.vitals || {}),
                [key]: value
            }
        }));
    };

    const currentMeds = feedbackForm.recommendedMedicines || [];

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6 backdrop-blur-md bg-slate-900/40 transition-all duration-300 overflow-y-auto">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 my-auto">
                
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                    <div>
                        <h3 className="text-xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
                            <FaClipboardList className="text-indigo-600" /> {isMainDoctor ? 'Attending Ward Check-in' : 'Specialist Bedside Consultation'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">
                            {isMainDoctor ? 'Log Attending Progress Round' : 'Submit Observation & Recommend Treatment'}
                        </p>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-655 rounded-xl transition-all"
                    >
                        <FaTimes size={14} />
                    </button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                    
                    {/* Chief Observations Input */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Clinical Observation / Diagnostic Findings</label>
                        <textarea 
                            rows="4"
                            required
                            value={feedbackForm.observation || ''}
                            onChange={(e) => setFeedbackForm(prev => ({ ...prev, observation: e.target.value }))}
                            placeholder={isMainDoctor ? "Type attending check-in notes (e.g. Swelling on chest completely resolved.)" : "Type specialist observation findings..."}
                            className="w-full bg-white border border-slate-250 p-4 rounded-xl text-xs font-semibold outline-none text-slate-800 focus:border-indigo-500 transition-all resize-none"
                        />
                    </div>

                    {/* Vitals Recording Section */}
                    <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/40 space-y-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                            <FaHeartbeat className="text-rose-500" /> Recorded Patient Vitals
                        </span>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                            <div>
                                <span className="text-[9px] text-slate-400 font-extrabold uppercase ml-1">BP (mmHg)</span>
                                <input
                                    type="text"
                                    placeholder="120/80"
                                    value={feedbackForm.vitals?.bp || feedbackForm.bp || ''}
                                    onChange={(e) => handleVitalUpdate('bp', e.target.value)}
                                    className="w-full border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none bg-white text-slate-800 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <span className="text-[9px] text-slate-400 font-extrabold uppercase ml-1">Pulse (bpm)</span>
                                <input
                                    type="text"
                                    placeholder="72"
                                    value={feedbackForm.vitals?.pulse || feedbackForm.pulse || ''}
                                    onChange={(e) => handleVitalUpdate('pulse', e.target.value)}
                                    className="w-full border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none bg-white text-slate-800 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <span className="text-[9px] text-slate-400 font-extrabold uppercase ml-1">Temp (°F)</span>
                                <input
                                    type="text"
                                    placeholder="98.6"
                                    value={feedbackForm.vitals?.temp || feedbackForm.temp || ''}
                                    onChange={(e) => handleVitalUpdate('temp', e.target.value)}
                                    className="w-full border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none bg-white text-slate-800 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <span className="text-[9px] text-slate-400 font-extrabold uppercase ml-1">SpO2 (%)</span>
                                <input
                                    type="text"
                                    placeholder="98"
                                    value={feedbackForm.vitals?.spo2 || feedbackForm.spo2 || ''}
                                    onChange={(e) => handleVitalUpdate('spo2', e.target.value)}
                                    className="w-full border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none bg-white text-slate-800 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Patient Condition</label>
                            <select 
                                value={feedbackForm.patientCondition || 'Stable'}
                                onChange={(e) => setFeedbackForm(prev => ({ ...prev, patientCondition: e.target.value }))}
                                className="w-full bg-white border border-slate-250 p-3.5 rounded-xl text-xs font-semibold outline-none text-slate-700"
                            >
                                <option value="Stable">Stable</option>
                                <option value="Recovering">Recovering</option>
                                <option value="Critical">Critical</option>
                                <option value="Deteriorating">Deteriorating</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Priority Rating</label>
                            <select 
                                value={feedbackForm.priorityRating || 'Routine'}
                                onChange={(e) => setFeedbackForm(prev => ({ ...prev, priorityRating: e.target.value }))}
                                className="w-full bg-white border border-slate-250 p-3.5 rounded-xl text-xs font-semibold outline-none text-slate-700"
                            >
                                <option value="Routine">Routine</option>
                                <option value="Urgent">Urgent</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                    </div>

                    {/* Integrated Medicine Section - Only visible to Co-Doctors, completely removed for Attending Doctor */}
                    {!isMainDoctor && (
                        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/30 space-y-4 font-sans">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                                    <FaCapsules className="text-indigo-600" /> Recommend Medications ({currentMeds.length})
                                </span>
                                <button
                                    type="button"
                                    onClick={onAddMedicineTrigger}
                                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-black rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <FaPlus size={10} /> Add Recommendation
                                </button>
                            </div>

                            {currentMeds.length > 0 ? (
                                <div className="bg-white border border-slate-150 p-3 rounded-xl divide-y divide-slate-100">
                                    {currentMeds.map((med, index) => {
                                        const isStayMed = med.type === 'Active-Stay';
                                        return (
                                            <div key={index} className="py-2.5 flex justify-between items-center text-xs last:pb-0 first:pt-0">
                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="font-extrabold text-slate-800">{med.name}</p>
                                                        <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded ${
                                                            isStayMed 
                                                            ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                                                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                                        }`}>
                                                            {isStayMed ? 'Stay' : 'Home'}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500">{med.dosage} • {med.frequency} ({med.duration})</p>
                                                    <p className="text-[9px] text-slate-400 italic">"{med.instructions}"</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMedicine(index)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <FaTrash size={11} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic font-semibold">No specialist recommended medicines staged for this round.</p>
                            )}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={actionLoading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
                    >
                        {actionLoading && <FaSpinner className="animate-spin" />}
                        {isMainDoctor ? 'Submit Round Observation Log' : 'Submit Clinical Feedback'}
                    </button>
                </form>
            </div>
        </div>
    );
}