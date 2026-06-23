'use client';

import React from 'react';
import { 
    FaArrowLeft, FaTimes, FaBed, FaHospital, FaUserMd, FaChevronRight, 
    FaSpinner, FaCheck, FaExclamationCircle, FaClipboardList, FaUserCheck 
} from 'react-icons/fa';

export default function AssignDoctorModal({
    isOpen,
    onClose,
    assignStep,
    setAssignStep,
    assignmentType,
    setAssignmentType,
    onDutyColleagues,
    offDutyColleagues,
    selectedColleague,
    setSelectedColleague,
    assignReason,
    setAssignReason,
    assignCondition,
    setAssignCondition,
    assignPriority,
    setAssignPriority,
    actionLoading,
    onContinue,
    onSelectColleague,
    onSubmit
}) {
    if (!isOpen) return null;

    // Advances from selecting a colleague (now Step 2) to Form Details (Step 3)
    const handleColleagueSelection = (doctor) => {
        if (doctor.dutyStatus !== 'On Duty') return;
        setSelectedColleague(doctor);
        setAssignStep(3);
    };

    // Advances from selecting an assignment type (now Step 1) to Select Colleague (Step 2)
    const handleAssignmentContinue = () => {
        setAssignStep(2);
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 backdrop-blur-md bg-slate-900/40 transition-all duration-300">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                
                {/* Tracker Header */}
                <div className="bg-slate-50/75 border-b border-slate-100 px-6 pt-6 pb-5">
                    <div className="flex justify-between items-center mb-6">
                        {assignStep > 1 ? (
                            <button 
                                onClick={() => setAssignStep(prev => prev - 1)} 
                                className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 text-xs font-bold"
                            >
                                <FaArrowLeft size={12} /> Back
                            </button>
                        ) : (
                            <div className="w-14"></div>
                        )}
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Handover Protocol</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Assign Clinical Associate</p>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-all hover:rotate-90"
                        >
                            <FaTimes size={14} />
                        </button>
                    </div>

                    <div className="max-w-lg mx-auto flex items-center justify-between relative px-2">
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 z-0"></div>
                        <div 
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500 z-0 transition-all duration-300"
                            style={{ width: `${(assignStep - 1) * 50}%` }}
                        ></div>

                        {[
                            { step: 1, label: "Assignment", icon: FaHospital },
                            { step: 2, label: "Colleague", icon: FaUserMd },
                            { step: 3, label: "Form details", icon: FaClipboardList }
                        ].map((item) => {
                            const Icon = item.icon;
                            const isCompleted = assignStep > item.step;
                            const isActive = assignStep === item.step;
                            return (
                                <div key={item.step} className="flex flex-col items-center z-10">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                        isCompleted 
                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' 
                                        : isActive 
                                        ? 'bg-white border-emerald-500 text-emerald-600 ring-4 ring-emerald-50' 
                                        : 'bg-white border-slate-200 text-slate-400'
                                    }`}>
                                        {isCompleted ? <FaCheck size={12} /> : <Icon size={14} />}
                                    </div>
                                    <span className={`text-[11px] font-bold mt-1.5 transition-colors duration-300 ${isActive ? 'text-emerald-600 font-black' : 'text-slate-400'}`}>
                                        {item.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto max-h-[70vh] bg-slate-50/20">

                    {/* STEP 1: SELECT ASSIGNMENT TYPE */}
                    {assignStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                            {selectedColleague && (
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-3.5">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-sm">
                                        {selectedColleague.name?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400 leading-none">Assigning Doctor</p>
                                        <p className="text-sm font-extrabold text-slate-800 mt-1">{selectedColleague.name}</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div 
                                    onClick={() => setAssignmentType('Bed Side')}
                                    className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between h-48 hover:-translate-y-1 shadow-sm ${
                                        assignmentType === 'Bed Side' 
                                        ? 'border-emerald-500 bg-emerald-500/5 text-emerald-800' 
                                        : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-700'
                                    }`}
                                >
                                    <div className={`p-3.5 rounded-2xl w-fit transition-transform duration-300 ${assignmentType === 'Bed Side' ? 'bg-emerald-500 text-white scale-110' : 'bg-slate-100 text-slate-500'}`}>
                                        <FaBed size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-base text-slate-800">Bed Side Duty</h4>
                                        <p className="text-xs text-slate-400 mt-1.5 leading-snug">Designate this clinical associate for bedside triage and routine ward monitoring.</p>
                                    </div>
                                </div>

                                <div 
                                    onClick={() => setAssignmentType('Patient Transfer')}
                                    className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between h-48 hover:-translate-y-1 shadow-sm ${
                                        assignmentType === 'Patient Transfer' 
                                        ? 'border-emerald-500 bg-emerald-500/5 text-emerald-800' 
                                        : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-700'
                                    }`}
                                >
                                    <div className={`p-3.5 rounded-2xl w-fit transition-transform duration-300 ${assignmentType === 'Patient Transfer' ? 'bg-emerald-500 text-white scale-110' : 'bg-slate-100 text-slate-500'}`}>
                                        <FaHospital size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-base text-slate-800">Patient Transfer Duty</h4>
                                        <p className="text-xs text-slate-400 mt-1.5 leading-snug">Designate this clinician to oversee dynamic transfer and shift handover protocols.</p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleAssignmentContinue}
                                className="w-full mt-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.99] text-sm tracking-wide"
                            >
                                Continue to Details
                            </button>
                        </div>
                    )}

                    {/* STEP 2: SELECT COLLEAGUE */}
                    {assignStep === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <p className="text-xs font-black text-emerald-600 tracking-wider uppercase">Available Clinical Staff (On Duty)</p>
                                    <span className="text-[11px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full">
                                        {onDutyColleagues.length} Online
                                    </span>
                                </div>
                                
                                {onDutyColleagues.length === 0 ? (
                                    <div className="text-center p-8 bg-white border border-slate-100 rounded-2xl">
                                        <FaExclamationCircle className="mx-auto text-slate-300 mb-2" size={26} />
                                        <p className="text-xs text-slate-400 font-semibold italic">No medical doctors are currently flagged on duty.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {onDutyColleagues.map((doctor) => {
                                            const isSelected = selectedColleague?._id === doctor._id;
                                            return (
                                                <div 
                                                    key={doctor._id}
                                                    onClick={() => handleColleagueSelection(doctor)}
                                                    className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-40 hover:-translate-y-1 shadow-sm hover:shadow-md ${
                                                        isSelected 
                                                        ? 'border-emerald-500 ring-2 ring-emerald-50 bg-emerald-50/10' 
                                                        : 'border-slate-150 hover:border-emerald-200'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3.5">
                                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-black border flex-shrink-0 transition-colors ${
                                                            isSelected 
                                                            ? 'bg-emerald-500 text-white border-emerald-500' 
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                        }`}>
                                                            {doctor.name?.[0]?.toUpperCase() || <FaUserMd />}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h5 className="font-extrabold text-sm text-slate-800 leading-tight truncate">{doctor.name}</h5>
                                                            <span className="text-xs text-slate-400 font-bold block mt-0.5 truncate">{doctor.speciality || "General Specialist"}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                                                        <div className="flex items-center gap-1.5 bg-emerald-50/70 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                            <span className="text-[10px] font-black text-emerald-700">Active Duty</span>
                                                        </div>
                                                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                            Select <FaChevronRight size={10} />
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-100">
                                <p className="text-xs font-black text-slate-400 tracking-wider uppercase px-1">Unavailable Clinical Staff (Off Duty)</p>
                                {offDutyColleagues.length === 0 ? (
                                    <p className="text-xs text-slate-300 italic px-1">No other registered clinical doctors found.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {offDutyColleagues.map((doctor) => (
                                            <div 
                                                key={doctor._id}
                                                className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/40 flex flex-col justify-between h-40 opacity-60 cursor-not-allowed select-none"
                                            >
                                                <div className="flex items-start gap-3.5">
                                                    <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 flex-shrink-0 flex items-center justify-center text-base font-bold">
                                                        {doctor.name?.[0]?.toUpperCase() || <FaUserMd />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h5 className="font-bold text-sm text-slate-500 leading-tight truncate">{doctor.name}</h5>
                                                        <span className="text-xs text-slate-400 font-medium block mt-0.5 truncate">{doctor.speciality || "General Specialist"}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-200/50 px-2.5 py-0.5 rounded-full border border-slate-200/80 w-fit">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                                    <span className="text-[10px] font-black text-slate-500">Off Duty</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: SUBMIT HANDOVER DETAILS FORM */}
                    {assignStep === 3 && selectedColleague && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                            <div className="bg-slate-100/50 p-4 rounded-2xl border border-slate-200/50 grid grid-cols-2 gap-4">
                                <div className="border-r border-slate-200 pr-2">
                                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Clinician Assigned</span>
                                    <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                                        <FaUserCheck className="text-emerald-500 flex-shrink-0" />
                                        {selectedColleague.name}
                                    </span>
                                </div>
                                <div className="pl-2">
                                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">Duty Protocol</span>
                                    <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                                        {assignmentType === 'Bed Side' ? <FaBed className="text-emerald-500" /> : <FaHospital className="text-emerald-500" />}
                                        {assignmentType}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Reason for Handover</label>
                                    <input 
                                        type="text" 
                                        value={assignReason} 
                                        onChange={(e) => setAssignReason(e.target.value)}
                                        placeholder="e.g. Shift duty ended" 
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all font-semibold text-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Patient Condition</label>
                                    <input 
                                        type="text" 
                                        value={assignCondition} 
                                        onChange={(e) => setAssignCondition(e.target.value)}
                                        placeholder="e.g. Stable under monitoring" 
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none transition-all font-semibold text-slate-800"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 block mb-1.5">Priority Level</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['Emergency', 'Very Urgent', 'Urgent', 'Routine'].map((prio) => {
                                        const isSelected = assignPriority === prio;
                                        const colors = {
                                            Emergency: 'border-red-200 text-red-600 bg-red-500/5 hover:bg-red-50 active:bg-red-500 active:text-white',
                                            'Very Urgent': 'border-orange-200 text-orange-600 bg-orange-500/5 hover:bg-orange-50 active:bg-orange-500 active:text-white',
                                            Urgent: 'border-amber-200 text-amber-600 bg-amber-500/5 hover:bg-amber-50 active:bg-amber-500 active:text-white',
                                            Routine: 'border-blue-200 text-blue-600 bg-blue-500/5 hover:bg-blue-50 active:bg-blue-500 active:text-white'
                                        };
                                        const activeColors = {
                                            Emergency: 'bg-red-500 border-red-500 text-white shadow-md shadow-red-100',
                                            'Very Urgent': 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-100',
                                            Urgent: 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-100',
                                            Routine: 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-100'
                                        };
                                        return (
                                            <button
                                                key={prio}
                                                type="button"
                                                onClick={() => setAssignPriority(prio)}
                                                className={`py-3 px-2 rounded-xl border text-center font-black text-xs tracking-wider transition-all hover:scale-[1.02] ${
                                                    isSelected ? activeColors[prio] : `bg-white ${colors[prio]}`
                                                }`}
                                            >
                                                {prio}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <button 
                                disabled={actionLoading}
                                onClick={onSubmit}
                                className="w-full mt-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 text-sm tracking-wider disabled:opacity-50"
                            >
                                {actionLoading && <FaSpinner className="animate-spin text-sm" />}
                                Finalize Duty Handover
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}