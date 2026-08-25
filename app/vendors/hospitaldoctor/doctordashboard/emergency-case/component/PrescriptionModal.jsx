'use client';

import React, { useState, useRef } from 'react';
import {
    FaArrowLeft, FaFileSignature, FaCapsules, FaCheckCircle,
    FaSpinner, FaPlus, FaTrash, FaFilePdf, FaTimes, FaUtensils, FaUserMd, FaDownload
} from 'react-icons/fa';

export default function PrescriptionModal({
    isOpen,
    onClose,
    medicinesList = [],
    actionLoading,
    onSubmit,
    collaborativeMeds = [], // Grouped specialist recommendations pool
    prescriptionSource = 'discharge' // 'discharge' | 'stay' | 'bedside-feedback' | 'bedside'
}) {
    const [addedMedicines, setAddedMedicines] = useState([]);

    const [isCustomMedicine, setIsCustomMedicine] = useState(false);
    const [customMedicineName, setCustomMedicineName] = useState('');

    const [selectedMedicine, setSelectedMedicine] = useState('');
    const [prescriptionFrequency, setPrescriptionFrequency] = useState({
        morning: false,
        afternoon: false,
        evening: false
    });
    const [prescriptionDays, setPrescriptionDays] = useState('3 days');
    const [specialInstructions, setSpecialInstructions] = useState('As directed by physician');

    const [dietPlanFile, setDietPlanFile] = useState(null);
    const [dietPlanFile_Name, setDietPlanFileName] = useState('');
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const resetMedicineForm = () => {
        setSelectedMedicine('');
        setCustomMedicineName('');
        setIsCustomMedicine(false);
        setPrescriptionFrequency({ morning: false, afternoon: false, evening: false });
        setPrescriptionDays('3 days');
        setSpecialInstructions('As directed by physician');
    };

    const buildMedicineFromForm = (activeMedicineName) => {
        const dosageString = [
            prescriptionFrequency.morning ? "1" : "0",
            prescriptionFrequency.afternoon ? "1" : "0",
            prescriptionFrequency.evening ? "1" : "0"
        ].join("-");

        const frequencyString = [
            prescriptionFrequency.morning ? "Morning" : "",
            prescriptionFrequency.afternoon ? "Afternoon" : "",
            prescriptionFrequency.evening ? "Evening" : ""
        ].filter(Boolean).join(" ");

        return {
            name: activeMedicineName,
            dosage: dosageString,
            frequency: frequencyString,
            duration: prescriptionDays,
            instructions: specialInstructions,
            // Automatically determine stay vs home based on entry flow context
            type: prescriptionSource === 'bedside-feedback' ? 'Active-Stay' : 'Discharge-Home'
        };
    };

    const handleAddMedicine = () => {
        const activeMedicineName = isCustomMedicine ? customMedicineName.trim() : selectedMedicine;

        if (!activeMedicineName) {
            alert("Please select or type a medicine first.");
            return;
        }

        const newMedicine = buildMedicineFromForm(activeMedicineName);
        setAddedMedicines(prev => [...prev, newMedicine]);
        resetMedicineForm();
    };

    const handleImportRecommendation = (rec) => {
        const importedMed = {
            name: rec.name,
            dosage: rec.dosage || rec.dose || "1-0-1",
            frequency: rec.frequency || rec.time || "Once daily",
            duration: rec.duration || "10 days",
            instructions: rec.instructions || "As advised by consulting specialist",
            type: rec.type || (prescriptionSource === 'stay' ? 'Active-Stay' : 'Discharge-Home')
        };
        setAddedMedicines(prev => [...prev, importedMed]);
    };

    const handleRemoveMedicine = (indexToRemove) => {
        setAddedMedicines(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleDietPlanChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                alert("Only PDF format is supported for diet plans.");
                e.target.value = '';
                return;
            }
            setDietPlanFile(file);
            setDietPlanFileName(file.name);
        }
    };

    const handleRemoveDietPlan = (e) => {
        e.stopPropagation();
        setDietPlanFile(null);
        setDietPlanFileName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleProcessPrescription = () => {
        let finalMedicines = [...addedMedicines];
        const activeMedicineName = isCustomMedicine ? customMedicineName.trim() : selectedMedicine;

        if (activeMedicineName) {
            finalMedicines.push(buildMedicineFromForm(activeMedicineName));
        }

        if (finalMedicines.length === 0) {
            alert("Please configure and add at least one medicine to proceed.");
            return;
        }

        if (onSubmit) {
            onSubmit(finalMedicines, dietPlanFile);
        }

        setAddedMedicines([]);
        resetMedicineForm();
        setDietPlanFile(null);
        setDietPlanFileName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Filter dynamic recommendation pool matching current context
    const getFilteredRecommendations = () => {
        const list = [];
        collaborativeMeds.forEach(group => {
            const doc = group.doctor || {};
            let recs = [];
            if (prescriptionSource === 'stay') {
                recs = group.activeStayRecommendations || [];
            } else if (prescriptionSource === 'discharge') {
                recs = group.dischargeHomeRecommendations || [];
            } else {
                recs = [...(group.activeStayRecommendations || []), ...(group.dischargeHomeRecommendations || [])];
            }

            if (recs.length > 0) {
                list.push({
                    doctor: doc,
                    recommendations: recs
                });
            }
        });
        return list;
    };

    const filteredRecommendations = getFilteredRecommendations();

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-5xl rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col justify-between max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 z-10">

                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                        <FaArrowLeft size={14} />
                    </button>
                    <span className="font-extrabold text-base text-slate-800">
                        {prescriptionSource === 'stay' ? 'Configure Active Stay Medications' : 'Configure Post-Discharge Prescription'}
                    </span>
                    <div className="p-2 text-amber-500 cursor-pointer">
                        <FaFileSignature size={18} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    <div className="lg:col-span-7 space-y-6">

                        <div className="bg-orange-50/20 p-5 md:p-6 rounded-3xl border border-orange-100/75 space-y-4 shadow-sm">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-black text-orange-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <FaCapsules />
                                    Medication Formulations
                                </h4>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Select Medicine</label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCustomMedicine(!isCustomMedicine);
                                            setSelectedMedicine('');
                                            setCustomMedicineName('');
                                        }}
                                        className="text-[10px] text-amber-600 hover:text-amber-700 font-bold underline cursor-pointer"
                                    >
                                        {isCustomMedicine ? "Select from List" : "Write Custom Medicine"}
                                    </button>
                                </div>

                                {isCustomMedicine ? (
                                    <input
                                        type="text"
                                        value={customMedicineName}
                                        onChange={(e) => setCustomMedicineName(e.target.value)}
                                        placeholder="Type custom medicine name (e.g. Paracetamol 500mg)"
                                        className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-slate-700 shadow-sm"
                                    />
                                ) : (
                                    <select
                                        value={selectedMedicine}
                                        onChange={(e) => setSelectedMedicine(e.target.value)}
                                        className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-slate-700"
                                    >
                                        <option value="">Select medicine</option>
                                        {medicinesList.map((med, index) => {
                                            const medicineName = typeof med === 'object' && med !== null ? (med.name || med.medicineName || "") : med;
                                            return (
                                                <option key={index} value={medicineName}>
                                                    {medicineName}
                                                </option>
                                            );
                                        })}
                                        {medicinesList.length === 0 && (
                                            <>
                                                <option value="Insulin 40IU/ml">Insulin 40IU/ml</option>
                                                <option value="Paracetamol 500mg">Paracetamol 500mg</option>
                                                <option value="Telmisartan 40mg">Telmisartan 40mg</option>
                                            </>
                                        )}
                                    </select>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-2 py-1">
                                {['Morning', 'Afternoon', 'Evening'].map((period) => {
                                    const key = period.toLowerCase();
                                    const isActive = prescriptionFrequency[key];
                                    return (
                                        <button
                                            key={period}
                                            type="button"
                                            onClick={() => setPrescriptionFrequency({
                                                ...prescriptionFrequency,
                                                [key]: !isActive
                                            })}
                                            className={`flex-1 py-3 rounded-xl text-[11px] font-black border transition-all flex flex-col items-center gap-1 ${
                                                isActive
                                                ? 'bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-100'
                                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                            }`}
                                        >
                                            {isActive && <FaCheckCircle size={10} className="text-white animate-in zoom-in-50" />}
                                            {period}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Duration</label>
                                    <select
                                        value={prescriptionDays}
                                        onChange={(e) => setPrescriptionDays(e.target.value)}
                                        className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-slate-700"
                                    >
                                        <option value="3 days">3 days</option>
                                        <option value="5 days">5 days</option>
                                        <option value="10 days">10 days</option>
                                        <option value="30 days">30 days</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Instructions</label>
                                    <input
                                        type="text"
                                        value={specialInstructions}
                                        onChange={(e) => setSpecialInstructions(e.target.value)}
                                        placeholder="e.g. Take after meals"
                                        className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-slate-700"
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleAddMedicine}
                                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                            >
                                <FaPlus />
                                Add Medicine to List
                            </button>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 md:p-6 space-y-3">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <FaUtensils className="text-emerald-500" />
                                Diet Plan Profile (Optional)
                            </h4>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                                    dietPlanFile
                                    ? 'border-emerald-500 bg-emerald-50/10'
                                    : 'border-slate-350 hover:border-emerald-400 bg-white'
                                }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="application/pdf"
                                    onChange={handleDietPlanChange}
                                    className="hidden"
                                />

                                {dietPlanFile ? (
                                    <div className="flex items-center gap-3 w-full justify-between">
                                        <div className="flex items-center gap-2 text-left min-w-0">
                                            <FaFilePdf size={28} className="text-emerald-600 flex-shrink-0" />
                                            <div className="truncate">
                                                <p className="text-xs font-bold text-slate-800 truncate">{dietPlanFile_Name}</p>
                                                <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">PDF File Ready</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveDietPlan}
                                            className="p-1.5 bg-slate-200/50 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
                                        >
                                            <FaTimes size={10} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <FaFilePdf size={24} className="text-slate-400 mb-2" />
                                        <span className="text-xs font-bold text-slate-600">Upload optional patient diet plan PDF</span>
                                        <p className="text-[10px] text-slate-400 mt-1">Accepts PDF documents only</p>
                                    </>
                                )}
                            </div>
                        </div>

                    </div>

                    <div className="lg:col-span-5 space-y-6 flex flex-col h-full self-stretch justify-start">
                        {/* Dynamic Recommendations Pool (contextual stay vs home) */}
                        {filteredRecommendations && filteredRecommendations.length > 0 && (
                            <div className="bg-indigo-50/30 border border-indigo-150 p-5 rounded-3xl space-y-3">
                                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block flex items-center gap-1">
                                    <FaUserMd /> Specialist Recommendations Pool ({prescriptionSource === 'stay' ? 'Active-Stay' : 'Discharge-Home'})
                                </span>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                    {filteredRecommendations.map((group, idx) => {
                                        const docName = group.doctor?.name || "Consultant";
                                        const docSpec = group.doctor?.speciality || "Specialist";
                                        return (
                                            <div key={idx} className="space-y-2">
                                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                                                    Dr. {docName} ({docSpec})
                                                </div>
                                                {group.recommendations?.map((rec, rIdx) => (
                                                    <div key={rec._id || rIdx} className="bg-white p-3 rounded-xl border border-indigo-100 flex justify-between items-start gap-2 shadow-sm font-sans">
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-black text-slate-800 truncate">{rec.name}</p>
                                                            <p className="text-[9px] text-slate-500">{rec.dosage} • {rec.frequency} ({rec.duration})</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleImportRecommendation(rec)}
                                                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[10px] rounded-lg flex items-center gap-1 transition-colors"
                                                            title="Import to Prescription"
                                                        >
                                                            <FaDownload size={8} /> Import
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex-1 bg-slate-50/50 rounded-3xl border border-slate-100 p-5 md:p-6 flex flex-col justify-between">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-3">Prescription Queue</span>

                                <div className="overflow-y-auto space-y-3 min-h-[160px] max-h-[300px] pr-1 scrollbar-thin">
                                    {addedMedicines.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                                            <FaCapsules size={36} className="text-slate-300 mb-2" />
                                            <p className="text-xs font-bold">No staged medicines</p>
                                            <p className="text-[10px] text-slate-400 mt-1">Staged medical formulations will populate here before processing.</p>
                                        </div>
                                    ) : (
                                        addedMedicines.map((med, idx) => (
                                            <div key={idx} className="bg-white border border-slate-150 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200 font-sans">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-xs font-black text-slate-800 truncate">{med.name}</p>
                                                        {med.type && (
                                                            <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[8px] font-black uppercase rounded">
                                                                {med.type === 'Active-Stay' ? 'Stay' : 'Home'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold block mt-1">Duration: {med.duration}</p>
                                                    <p className="text-[10px] text-slate-500 italic mt-0.5 truncate">{med.instructions}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 bg-orange-50 border border-orange-100 text-orange-700 text-[9px] font-black rounded-full whitespace-nowrap">
                                                        {med.frequency}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMedicine(idx)}
                                                        className="p-1.5 text-slate-355 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {addedMedicines.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-[10px] font-black text-slate-400 uppercase">
                                    <span>Medications: {addedMedicines.length}</span>
                                    {dietPlanFile && <span className="text-emerald-600">Diet Plan Attached</span>}
                                </div>
                            )}
                        </div>

                    </div>

                </div>

                <div className="pt-4 border-t border-slate-100 font-sans">
                    <button
                        disabled={actionLoading}
                        onClick={handleProcessPrescription}
                        className="w-full py-4 bg-orange-400 hover:bg-orange-500 text-white font-extrabold text-sm rounded-2xl tracking-wide transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {actionLoading && <FaSpinner className="animate-spin" />}
                        Process Prescription
                    </button>
                </div>

            </div>
        </div>
    );
}