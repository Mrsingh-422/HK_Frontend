'use client';

import React from 'react';
import { FaTimes, FaSpinner, FaClipboardList } from 'react-icons/fa';

export default function BedsideFeedbackModal({
    isOpen,
    onClose,
    feedbackForm,
    setFeedbackForm,
    actionLoading,
    onSubmit
}) {
    if (!isOpen) return null;

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6 backdrop-blur-md bg-slate-900/40 transition-all duration-300">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2">
                            <FaClipboardList className="text-indigo-600" /> Specialist Observation
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">Submit Bedside Consultation</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-650 rounded-xl transition-all"
                    >
                        <FaTimes size={14} />
                    </button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Clinical Observation / Diagnostic Findings</label>
                        <textarea 
                            rows="4"
                            required
                            value={feedbackForm.observation}
                            onChange={(e) => setFeedbackForm({ ...feedbackForm, observation: e.target.value })}
                            placeholder="Type observation findings (e.g. ECG stable, recommendation on daily general checkup)" 
                            className="w-full bg-white border border-slate-200 p-4 rounded-xl text-xs font-bold outline-none text-slate-800 focus:border-indigo-500 transition-all resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Patient Condition</label>
                            <input 
                                type="text"
                                required
                                value={feedbackForm.patientCondition}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, patientCondition: e.target.value })}
                                placeholder="e.g. Recovering"
                                className="w-full bg-white border border-slate-200 p-4 rounded-xl text-xs font-bold outline-none text-slate-800 focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Priority Rating</label>
                            <select 
                                value={feedbackForm.priorityRating}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, priorityRating: e.target.value })}
                                className="w-full bg-white border border-slate-200 p-4 rounded-xl text-xs font-bold outline-none text-slate-700"
                            >
                                <option value="Routine">Routine</option>
                                <option value="Urgent">Urgent</option>
                                <option value="Most Urgent">Most Urgent</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={actionLoading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
                    >
                        {actionLoading && <FaSpinner className="animate-spin" />}
                        Submit Clinical Feedback
                    </button>
                </form>
            </div>
        </div>
    );
}