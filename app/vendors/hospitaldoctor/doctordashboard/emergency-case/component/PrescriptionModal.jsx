'use client';

import React, { useState } from 'react';
import {
    FaArrowLeft, FaFileSignature, FaCapsules, FaCheckCircle,
    FaSpinner, FaPlus, FaTrash, FaFilePdf, FaTimes, FaUtensils, 
    FaDownload, FaCheck, FaHandHoldingHeart, FaPills
} from 'react-icons/fa';

const MEDICINE_FORMS = [
    'Tablet',
    'Capsule',
    'Syrup',
    'Injection',
    'Drops',
    'Ointment',
    'Gel',
    'Inhaler',
    'Suspension'
];

// Clinical & Latin Frequency Shortcuts
const LATIN_FREQUENCY_SHORTCUTS = [
    { sig: 'q.d.', label: 'q.d. (Once daily)', doseInterval: '1-0-0', pattern: { morning: true, afternoon: false, evening: false } },
    { sig: 'b.i.d.', label: 'b.i.d. (Twice daily)', doseInterval: '1-0-1', pattern: { morning: true, afternoon: false, evening: true } },
    { sig: 't.i.d.', label: 't.i.d. (Three times daily)', doseInterval: '1-1-1', pattern: { morning: true, afternoon: true, evening: true } },
    { sig: 'q.i.d.', label: 'q.i.d. (Four times daily)', doseInterval: '1-1-1-1', pattern: { morning: true, afternoon: true, evening: true } },
    { sig: 'h.s.', label: 'h.s. (At bedtime / Night)', doseInterval: '0-0-1', pattern: { morning: false, afternoon: false, evening: true } }
];

const LATIN_TIMING_SHORTCUTS = [
    { sig: 'a.c.', label: 'a.c. (Before meals)' },
    { sig: 'p.c.', label: 'p.c. (After meals)' },
    { sig: 'h.s.', label: 'h.s. (At bedtime)' },
    { sig: 'prn', label: 'prn (As needed / SOS)' },
    { sig: 'stat', label: 'stat (Immediately)' }
];

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

    // Medicine Selection & Custom Mode
    const [isCustomMedicine, setIsCustomMedicine] = useState(false);
    const [customMedicineName, setCustomMedicineName] = useState('');
    const [selectedMedicine, setSelectedMedicine] = useState('');

    // Formulation Parameters
    const [medicineForm, setMedicineForm] = useState('Tablet');
    const [strength, setStrength] = useState('500 mg');
    const [selectedFrequencySig, setSelectedFrequencySig] = useState('b.i.d.');
    const [prescriptionFrequency, setPrescriptionFrequency] = useState({
        morning: true,
        afternoon: false,
        evening: true
    });
    // Changed duration to an open input field rather than a dropdown
    const [duration, setDuration] = useState('5 days');
    const [administrationTiming, setAdministrationTiming] = useState('p.c. (After meals)');
    const [specialInstructions, setSpecialInstructions] = useState('Take after meals');

    // Diet Plan Document State
    const [dietPlanFile, setDietPlanFile] = useState(null);
    const [dietPlanFileName, setDietPlanFileName] = useState('');

    if (!isOpen) return null;

    const resetMedicineForm = () => {
        setSelectedMedicine('');
        setCustomMedicineName('');
        setIsCustomMedicine(false);
        setMedicineForm('Tablet');
        setStrength('500 mg');
        setSelectedFrequencySig('b.i.d.');
        setPrescriptionFrequency({ morning: true, afternoon: false, evening: true });
        setDuration('5 days');
        setAdministrationTiming('p.c. (After meals)');
        setSpecialInstructions('Take after meals');
    };

    const toggleDosage = (key) => {
        setPrescriptionFrequency(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleFrequencySelectChange = (sigValue) => {
        setSelectedFrequencySig(sigValue);
        const matched = LATIN_FREQUENCY_SHORTCUTS.find((item) => item.sig === sigValue);
        if (matched) {
            setPrescriptionFrequency(matched.pattern);
        }
    };

    const handleTimingShortcut = (shortcut) => {
        setAdministrationTiming(shortcut.label);
        setSpecialInstructions(shortcut.label);
    };

    const compileDosageInterval = () => {
        const m = prescriptionFrequency.morning ? '1' : '0';
        const a = prescriptionFrequency.afternoon ? '1' : '0';
        const e = prescriptionFrequency.evening ? '1' : '0';
        return `${m}-${a}-${e}`;
    };

    const compileFrequencyDisplay = () => {
        const pattern = compileDosageInterval();
        if (pattern === '1-0-1') return 'b.i.d. (Twice daily)';
        if (pattern === '1-1-1') return 't.i.d. (Three times daily)';
        if (pattern === '1-0-0') return 'q.d. (Once daily)';
        if (pattern === '0-0-1') return 'h.s. (At bedtime)';
        if (pattern === '0-0-0') return 'SOS / As needed';
        return `${pattern} Daily`;
    };

    const buildMedicineFromForm = (activeMedicineName) => {
        const doseInterval = compileDosageInterval();
        const uppercaseName = activeMedicineName.toUpperCase();

        return {
            name: uppercaseName,
            form: medicineForm,
            strength: strength.trim() || 'N/A',
            dosage: doseInterval === '0-0-0' ? '1 Tab' : doseInterval,
            doseInterval: doseInterval,
            frequency: compileFrequencyDisplay(),
            duration: duration.trim() || '5 days',
            administrationTiming: administrationTiming,
            instructions: specialInstructions.trim() || administrationTiming,
            type: prescriptionSource === 'stay' || prescriptionSource === 'bedside-feedback' ? 'Active-Stay' : 'Discharge-Home'
        };
    };

    const handleAddMedicine = () => {
        const activeMedicineName = isCustomMedicine ? customMedicineName.trim() : selectedMedicine;

        if (!activeMedicineName) {
            alert('Please select or type a medicine first.');
            return;
        }

        const doseInterval = compileDosageInterval();
        if (doseInterval === '0-0-0') {
            alert('Please select at least one dosage interval (Morning/Afternoon/Evening).');
            return;
        }

        const newMedicine = buildMedicineFromForm(activeMedicineName);
        setAddedMedicines(prev => [...prev, newMedicine]);
        resetMedicineForm();
    };

    // Import single recommended medicine from Bedside Specialist
    const handleImportRecommendation = (rec, docName = '') => {
        const medName = rec.name || rec.medicineName || '';
        if (!medName) return;

        const isDuplicate = addedMedicines.some(m => m.name.toLowerCase().trim() === medName.toLowerCase().trim());
        if (isDuplicate) {
            alert(`"${medName}" is already in your prescription queue.`);
            return;
        }

        const importedMed = {
            name: medName.toUpperCase(),
            form: rec.form || 'Tablet',
            strength: rec.strength || 'N/A',
            dosage: rec.dosage || rec.dose || '1-0-1',
            doseInterval: rec.dosage || rec.dose || '1-0-1',
            frequency: rec.frequency || rec.time || 'b.i.d. (Twice daily)',
            duration: rec.duration || '10 days',
            administrationTiming: rec.administrationTiming || 'p.c. (After meals)',
            instructions: rec.instructions || (docName ? `Recommended by Dr. ${docName}` : 'Take as directed by doctor'),
            type: prescriptionSource === 'stay' ? 'Active-Stay' : 'Discharge-Home'
        };
        setAddedMedicines(prev => [...prev, importedMed]);
    };

    // Bulk Import ALL Bedside Specialist Recommendations
    const handleImportAllRecommendations = () => {
        const allRecs = [];
        const seenNames = new Set(addedMedicines.map(m => m.name.toLowerCase().trim()));

        collaborativeMeds.forEach(group => {
            const docName = group.doctor?.name || '';
            const recList = [
                ...(group.activeStayRecommendations || []),
                ...(group.dischargeHomeRecommendations || [])
            ];

            recList.forEach(rec => {
                const medName = rec.name || rec.medicineName || '';
                if (medName && !seenNames.has(medName.toLowerCase().trim())) {
                    seenNames.add(medName.toLowerCase().trim());
                    allRecs.push({
                        name: medName.toUpperCase(),
                        form: rec.form || 'Tablet',
                        strength: rec.strength || 'N/A',
                        dosage: rec.dosage || rec.dose || '1-0-1',
                        doseInterval: rec.dosage || rec.dose || '1-0-1',
                        frequency: rec.frequency || rec.time || 'b.i.d. (Twice daily)',
                        duration: rec.duration || '10 days',
                        administrationTiming: rec.administrationTiming || 'p.c. (After meals)',
                        instructions: rec.instructions || (docName ? `Recommended by Dr. ${docName}` : 'Take as directed by doctor'),
                        type: prescriptionSource === 'stay' ? 'Active-Stay' : 'Discharge-Home'
                    });
                }
            });
        });

        if (allRecs.length === 0) {
            alert('All specialist recommendations have already been imported.');
            return;
        }

        setAddedMedicines(prev => [...prev, ...allRecs]);
    };

    const handleRemoveMedicine = (indexToRemove) => {
        setAddedMedicines(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleDietPlanChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                alert('Only PDF format is supported for diet plans.');
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
    };

    const handleProcessPrescription = () => {
        let finalMedicines = [...addedMedicines];
        const activeMedicineName = isCustomMedicine ? customMedicineName.trim() : selectedMedicine;

        if (activeMedicineName) {
            finalMedicines.push(buildMedicineFromForm(activeMedicineName));
        }

        if (finalMedicines.length === 0) {
            alert('Please configure or import at least one medicine to proceed.');
            return;
        }

        if (onSubmit) {
            onSubmit(finalMedicines, dietPlanFile);
        }

        setAddedMedicines([]);
        resetMedicineForm();
        setDietPlanFile(null);
        setDietPlanFileName('');
    };

    // Extract all collaborative recommendations across specialists
    const allBedsideRecommendations = [];
    collaborativeMeds.forEach(group => {
        const docName = group.doctor?.name || '';
        const recList = [
            ...(group.dischargeHomeRecommendations || []),
            ...(group.activeStayRecommendations || [])
        ];

        recList.forEach(rec => {
            allBedsideRecommendations.push({ ...rec, docName });
        });
    });

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-sans">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-5xl rounded-[2.5rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col justify-between max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 z-10">

                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors cursor-pointer">
                        <FaArrowLeft size={14} />
                    </button>
                    <div className="text-center">
                        <span className="font-extrabold text-base text-slate-800 uppercase tracking-tight block">
                            {prescriptionSource === 'stay' ? 'Configure In-Patient Stay Medications' : 
                             prescriptionSource === 'bedside-feedback' ? 'Specialist Bedside Recommendations' : 
                             'Configure Post-Discharge Prescription'}
                        </span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-full inline-block mt-0.5">
                            ℞ NMC Standard Formulation
                        </span>
                    </div>
                    <div className="p-2 text-amber-500">
                        <FaFileSignature size={18} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Left Column: Form Builder & Optional Diet Plan */}
                    <div className="lg:col-span-7 space-y-5">
                        
                        {/* ℞ Formulation Card */}
                        <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-200/80 shadow-xs space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                                    <FaCapsules />
                                    Medication Formulation
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCustomMedicine(!isCustomMedicine);
                                        setSelectedMedicine('');
                                        setCustomMedicineName('');
                                    }}
                                    className="text-[10px] font-black text-amber-600 underline uppercase tracking-wider cursor-pointer hover:text-amber-700"
                                >
                                    {isCustomMedicine ? 'Select from Catalog' : 'Write Custom Generic Drug'}
                                </button>
                            </div>

                            {/* Drug Selection / Custom Entry */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                    {isCustomMedicine ? 'Generic Drug Name (Auto-Capitalized)' : 'Select Drug from Catalog *'}
                                </label>
                                {isCustomMedicine ? (
                                    <input
                                        type="text"
                                        value={customMedicineName}
                                        onChange={(e) => setCustomMedicineName(e.target.value)}
                                        placeholder="Enter generic drug name (e.g. PARACETAMOL 650MG)..."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl font-black text-xs text-slate-900 outline-none uppercase focus:bg-white focus:border-amber-500"
                                    />
                                ) : (
                                    <select
                                        value={selectedMedicine}
                                        onChange={(e) => setSelectedMedicine(e.target.value)}
                                        className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-amber-500 focus:bg-white"
                                    >
                                        <option value="">Select medicine from catalog</option>
                                        {medicinesList.map((med, index) => {
                                            const medicineName = typeof med === 'object' && med !== null ? (med.name || med.medicineName || '') : med;
                                            return (
                                                <option key={index} value={medicineName}>
                                                    {medicineName}
                                                </option>
                                            );
                                        })}
                                        {medicinesList.length === 0 && (
                                            <>
                                                <option value="Pantoprazole 40mg IV">Pantoprazole 40mg IV</option>
                                                <option value="Paracetamol 650mg">Paracetamol 650mg</option>
                                                <option value="Amlodipine 5mg">Amlodipine 5mg</option>
                                                <option value="Atorvastatin 10mg">Atorvastatin 10mg</option>
                                                <option value="Ceftriaxone 1g IV">Ceftriaxone 1g IV</option>
                                            </>
                                        )}
                                    </select>
                                )}
                            </div>

                            {/* Form, Strength & Frequency (Once a day / Twice a day / Latin sigs) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black uppercase text-slate-400">
                                        Form *
                                    </label>
                                    <select
                                        value={medicineForm}
                                        onChange={(e) => setMedicineForm(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800"
                                    >
                                        {MEDICINE_FORMS.map((formOption) => (
                                            <option key={formOption} value={formOption}>
                                                {formOption}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black uppercase text-slate-400">
                                        Strength *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 500 mg"
                                        value={strength}
                                        onChange={(e) => setStrength(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black uppercase text-amber-700">
                                        Frequency *
                                    </label>
                                    <select
                                        value={selectedFrequencySig}
                                        onChange={(e) => handleFrequencySelectChange(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-amber-50/70 border border-amber-300 rounded-xl font-black text-xs text-slate-800 focus:border-amber-500 cursor-pointer"
                                    >
                                        {LATIN_FREQUENCY_SHORTCUTS.map((sc) => (
                                            <option key={sc.sig} value={sc.sig}>
                                                {sc.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Dosage Interval Schedule Buttons */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black uppercase text-slate-400">
                                    Dosage Intervals ({compileDosageInterval()})
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['morning', 'afternoon', 'evening'].map((slot) => {
                                        const isActive = prescriptionFrequency[slot];
                                        return (
                                            <button
                                                key={slot}
                                                type="button"
                                                onClick={() => toggleDosage(slot)}
                                                className={`py-2 rounded-xl font-black text-xs uppercase tracking-wider border transition-all cursor-pointer ${
                                                    isActive
                                                        ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                {isActive && '✔ '}
                                                {slot}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Duration - Editable Input Field */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black uppercase text-slate-400">
                                    Duration (Days / Weeks) *
                                </label>
                                <input
                                    type="text"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder="e.g. 5 days, 10 days, 2 weeks, SOS..."
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800 outline-none focus:bg-white focus:border-amber-500"
                                />
                            </div>

                            {/* Latin Administration Timing Shortcuts */}
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black uppercase text-slate-400">
                                    Administration Timing
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {LATIN_TIMING_SHORTCUTS.map((item) => (
                                        <button
                                            key={item.sig}
                                            type="button"
                                            onClick={() => handleTimingShortcut(item)}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                                administrationTiming === item.label
                                                    ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                            <span className="font-mono font-black">{item.sig}</span> - {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Special Instructions Input */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black uppercase text-slate-400">
                                    Special Instructions
                                </label>
                                <input
                                    type="text"
                                    value={specialInstructions}
                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                    placeholder="e.g. Take after meals with warm water..."
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800 outline-none focus:border-amber-500"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleAddMedicine}
                                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                            >
                                <FaPlus size={11} /> Add to Prescription Queue
                            </button>
                        </div>

                        {/* Optional Diet Plan PDF Upload */}
                        {prescriptionSource === 'discharge' && (
                            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <FaUtensils className="text-emerald-500" />
                                    Diet Plan Document (Optional PDF)
                                </h4>

                                <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-white text-center">
                                    <input
                                        type="file"
                                        id="diet-plan-upload"
                                        accept="application/pdf"
                                        onChange={handleDietPlanChange}
                                        className="hidden"
                                    />

                                    {dietPlanFile ? (
                                        <div className="flex items-center gap-3 w-full justify-between">
                                            <div className="flex items-center gap-2 text-left min-w-0">
                                                <FaFilePdf size={28} className="text-emerald-600 flex-shrink-0" />
                                                <div className="truncate">
                                                    <p className="text-xs font-bold text-slate-800 truncate">{dietPlanFileName}</p>
                                                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">PDF Ready</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleRemoveDietPlan}
                                                className="p-1.5 bg-slate-200/50 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <FaTimes size={10} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label htmlFor="diet-plan-upload" className="cursor-pointer block">
                                            <FaFilePdf size={24} className="text-slate-400 mb-2 mx-auto" />
                                            <span className="text-xs font-bold text-slate-600">Click to upload patient diet plan PDF</span>
                                            <p className="text-[10px] text-slate-400 mt-1">Accepts PDF documents only</p>
                                        </label>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Column: Specialist Recommendations Importer & Formulation Queue */}
                    <div className="lg:col-span-5 space-y-5 flex flex-col h-full self-stretch justify-start">
                        
                        {/* Bedside Specialist Recommendations Hub */}
                        <div className="bg-indigo-50/50 border border-indigo-200/70 p-5 rounded-3xl space-y-3 shadow-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <FaHandHoldingHeart className="text-indigo-600 text-sm" />
                                    Bedside Specialist Recommendations ({allBedsideRecommendations.length})
                                </span>
                                {allBedsideRecommendations.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleImportAllRecommendations}
                                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition shadow-xs cursor-pointer"
                                    >
                                        <FaDownload size={8} /> Import All
                                    </button>
                                )}
                            </div>

                            {allBedsideRecommendations.length === 0 ? (
                                <p className="text-xs text-slate-400 italic py-2">
                                    No recommendations logged by bedside specialists yet.
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                                    {allBedsideRecommendations.map((rec, rIdx) => {
                                        const isImported = addedMedicines.some(m => m.name.toLowerCase().trim() === (rec.name || '').toLowerCase().trim());

                                        return (
                                            <div key={rec._id || rIdx} className="bg-white p-3 rounded-xl border border-indigo-100 flex justify-between items-start gap-2 shadow-xs">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <p className="text-xs font-black text-slate-800 uppercase truncate">{rec.name}</p>
                                                        {rec.docName && (
                                                            <span className="text-[8px] font-extrabold text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded">
                                                                Dr. {rec.docName}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[9px] text-slate-500 mt-0.5">{rec.dosage} • {rec.frequency} {rec.duration && `(${rec.duration})`}</p>
                                                    {rec.instructions && <p className="text-[8px] text-slate-400 italic truncate">"{rec.instructions}"</p>}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleImportRecommendation(rec, rec.docName)}
                                                    disabled={isImported}
                                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                                                        isImported 
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 opacity-80' 
                                                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold shadow-2xs'
                                                    }`}
                                                >
                                                    {isImported ? <FaCheck size={8} /> : <FaDownload size={8} />}
                                                    <span>{isImported ? 'Added' : 'Import'}</span>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Staged Prescription Queue */}
                        <div className="flex-1 bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-xs flex flex-col justify-between min-h-[380px]">
                            <div>
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Medication Queue ({addedMedicines.length})
                                    </span>
                                    <span className="text-[10px] font-black text-amber-600 uppercase">℞ NMC Formatted</span>
                                </div>

                                <div className="overflow-y-auto space-y-3 min-h-[160px] max-h-[340px] pr-1 scrollbar-thin">
                                    {addedMedicines.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                                            <FaPills size={32} className="text-slate-300 mb-2" />
                                            <p className="font-black text-xs uppercase">No medicines staged</p>
                                            <p className="text-[10px] mt-1 max-w-[220px]">
                                                Configure medication on left or click "Import" on specialist recommendations above.
                                            </p>
                                        </div>
                                    ) : (
                                        addedMedicines.map((med, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl flex justify-between items-start gap-2 shadow-2xs animate-in fade-in duration-200"
                                            >
                                                <div className="space-y-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-black text-xs text-slate-900 tracking-tight">
                                                            {med.name}
                                                        </span>
                                                        {med.strength && (
                                                            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[9px] font-black uppercase rounded">
                                                                {med.strength}
                                                            </span>
                                                        )}
                                                        {med.type && (
                                                            <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-700 text-[8px] font-black uppercase rounded">
                                                                {med.type === 'Active-Stay' ? 'Stay' : 'Home'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold flex-wrap">
                                                        <span className="bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-black">
                                                            {med.doseInterval || med.dosage}
                                                        </span>
                                                        <span>&bull;</span>
                                                        <span>{med.frequency}</span>
                                                        <span>&bull;</span>
                                                        <span>{med.duration}</span>
                                                    </div>

                                                    <p className="text-[10px] text-emerald-700 font-bold italic truncate">
                                                        {med.instructions}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMedicine(idx)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer shrink-0"
                                                    title="Remove Drug"
                                                >
                                                    <FaTrash size={11} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {addedMedicines.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-[10px] font-black text-slate-400 uppercase">
                                    <span>Total Formulations: {addedMedicines.length}</span>
                                    {dietPlanFile && <span className="text-emerald-600">Diet Plan Attached</span>}
                                </div>
                            )}
                        </div>

                    </div>

                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center shrink-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:block">
                        Ready to process standardized prescription &amp; save to patient record.
                    </p>
                    <div className="flex gap-3 ml-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={actionLoading}
                            onClick={handleProcessPrescription}
                            className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-2xl uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                            {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                            {prescriptionSource === 'stay' ? 'Save Stay Medications' : 'Process & Preview Dossier'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}