'use client';

import React, { useState, useEffect } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { 
    FaPlus, FaTrash, FaSpinner, FaCloudUploadAlt, FaFileMedical, 
    FaArrowLeft, FaRegClipboard, FaHeartbeat, FaLock, FaCapsules, FaPills 
} from 'react-icons/fa';
import DoctorAPI from '@/app/services/DoctorAPI';
import { toast } from 'react-hot-toast';

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

export default function AddPrescriptionModal({ isOpen, onClose, appointment, onSuccess }) {
    const [diagnosisInput, setDiagnosisInput] = useState('');
    const [diagnosis, setDiagnosis] = useState([]);
    
    const [chiefComplaints, setChiefComplaints] = useState('');
    const [advisedInvestigations, setAdvisedInvestigations] = useState('');
    const [adviceGiven, setAdviceGiven] = useState('');
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [nextAppointment, setNextAppointment] = useState(''); 
    
    // Staged Medicines Queue
    const [stagedMedicines, setStagedMedicines] = useState([]);

    // Live Drug Search & Custom State
    const [medicineSearch, setMedicineSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMedicineName, setSelectedMedicineName] = useState('');
    const [selectedMedicineSalt, setSelectedMedicineSalt] = useState('');
    const [isCustomMedicine, setIsCustomMedicine] = useState(false);

    // Formulation Parameters
    const [medicineForm, setMedicineForm] = useState('Tablet');
    const [strength, setStrength] = useState('500 mg');
    const [selectedFrequencySig, setSelectedFrequencySig] = useState('b.i.d.');
    const [dosageSchedule, setDosageSchedule] = useState({
        morning: true,
        afternoon: false,
        evening: true
    });
    // Editable Duration Field
    const [duration, setDuration] = useState('5 days');
    const [administrationTiming, setAdministrationTiming] = useState('p.c. (After meals)');
    const [instructions, setInstructions] = useState('Take after meals');

    // Vitals State Parameters
    const [vitals, setVitals] = useState({
        bp: '',
        pulse: '',
        temp: '',
        spo2: ''
    });

    // Optional Diet Plan Document State
    const [dietPlanFile, setDietPlanFile] = useState(null);
    const [dietPlanFileName, setDietPlanFileName] = useState('');

    // OTP Handshake States (Strict Security Rule for Video Consult)
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [devOtp, setDevOtp] = useState('');

    const isOnline = appointment?.consultationType?.toLowerCase().includes('online') || 
                     appointment?.consultationType?.toLowerCase().includes('video');

    useEffect(() => {
        if (isCustomMedicine || medicineSearch.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        const delayDebounce = setTimeout(async () => {
            try {
                setIsSearching(true);
                const res = await DoctorAPI.searchMedicines(medicineSearch);
                if (res && res.success) {
                    setSearchResults(res.data || []);
                }
            } catch (err) {
                console.error("Master medicine search query error:", err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [medicineSearch, isCustomMedicine]);

    // Reset states on modal open
    useEffect(() => {
        if (isOpen) {
            setDiagnosisInput('');
            setDiagnosis([]);
            setChiefComplaints(appointment?.reasonForVisit || appointment?.chiefComplaints || '');
            setAdvisedInvestigations('');
            setAdviceGiven('');
            setSpecialInstructions('');
            setNextAppointment('');
            setStagedMedicines([]);
            setSelectedMedicineName('');
            setSelectedMedicineSalt('');
            setMedicineSearch('');
            setIsCustomMedicine(false);
            setMedicineForm('Tablet');
            setStrength('500 mg');
            setSelectedFrequencySig('b.i.d.');
            setDosageSchedule({ morning: true, afternoon: false, evening: true });
            setDuration('5 days');
            setAdministrationTiming('p.c. (After meals)');
            setInstructions('Take after meals');
            setDietPlanFile(null);
            setDietPlanFileName('');
            setVitals({
                bp: appointment?.vitals?.bp || '',
                pulse: appointment?.vitals?.pulse || '',
                temp: appointment?.vitals?.temp || '',
                spo2: appointment?.vitals?.spo2 || ''
            });
            setIsOtpSent(false);
            setOtpCode('');
            setIsOtpVerified(false);
            setDevOtp('');
        }
    }, [isOpen, appointment]);

    if (!isOpen) return null;

    const handleSendCompletionOtp = async () => {
        try {
            setOtpLoading(true);
            const apptId = appointment._id || appointment.appointmentId;
            const res = await DoctorAPI.sendCompletionOtp(apptId);
            if (res && res.success) {
                toast.success(res.message || "Verification OTP successfully sent to user.");
                setIsOtpSent(true);
                if (res.dev_otp) setDevOtp(res.dev_otp);
            } else {
                toast.error(res?.message || "Failed to send completion OTP");
            }
        } catch (err) {
            console.error("Error inside handleSendCompletionOtp:", err);
            toast.error(err?.message || err || "Error sending completion OTP");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyCompletionOtp = async () => {
        if (!otpCode.trim()) return toast.error("Please enter dynamic 4-digit OTP code");
        try {
            setOtpLoading(true);
            const apptId = appointment._id || appointment.appointmentId;
            const res = await DoctorAPI.verifyCompletionOtp(apptId, otpCode.trim());
            if (res && res.success) {
                toast.success(res.message || "OTP successfully verified!");
                setIsOtpVerified(true);
            } else {
                toast.error(res?.message || "Failed to verify completion OTP");
            }
        } catch (err) {
            console.error("Error inside handleVerifyCompletionOtp:", err);
            toast.error(err?.message || err || "OTP Verification failed");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleAddDiagnosis = () => {
        const tag = diagnosisInput.trim();
        if (tag && !diagnosis.includes(tag)) {
            setDiagnosis(prev => [...prev, tag]);
            setDiagnosisInput('');
        }
    };

    const handleRemoveDiagnosis = (indexToRemove) => {
        setDiagnosis(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const toggleDosage = (key) => {
        setDosageSchedule(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleFrequencySelectChange = (sigValue) => {
        setSelectedFrequencySig(sigValue);
        const matched = LATIN_FREQUENCY_SHORTCUTS.find((item) => item.sig === sigValue);
        if (matched) {
            setDosageSchedule(matched.pattern);
        }
    };

    const handleTimingShortcut = (shortcut) => {
        setAdministrationTiming(shortcut.label);
        setInstructions(shortcut.label);
    };

    const compileDosagePattern = () => {
        const m = dosageSchedule.morning ? '1' : '0';
        const a = dosageSchedule.afternoon ? '1' : '0';
        const e = dosageSchedule.evening ? '1' : '0';
        return `${m}-${a}-${e}`;
    };

    const compileFrequencyText = () => {
        const pattern = compileDosagePattern();
        if (pattern === '1-0-1') return 'b.i.d. (Twice daily)';
        if (pattern === '1-1-1') return 't.i.d. (Three times daily)';
        if (pattern === '1-0-0') return 'q.d. (Once daily)';
        if (pattern === '0-0-1') return 'h.s. (At bedtime)';
        if (pattern === '0-0-0') return 'SOS / As needed';
        return `${pattern} Daily`;
    };

    const handleSelectCatalogDrug = (result) => {
        setSelectedMedicineName(result.name);
        setSelectedMedicineSalt(result.salt_composition || '');
        setMedicineSearch(result.name);
        setSearchResults([]);

        // Auto extract strength if present
        const combined = `${result.name} ${result.salt_composition || ''}`;
        const match = combined.match(/\((\d+\s*mg|\d+\s*ml)\)|(\d+\s*mg|\d+\s*ml)/i);
        if (match) {
            setStrength(match[1] || match[2]);
        }
    };

    const handleAddMedicineToQueue = () => {
        const rawName = isCustomMedicine ? medicineSearch.trim() : selectedMedicineName || medicineSearch.trim();
        if (!rawName) {
            toast.error("Please search master catalog or enter a custom medicine name.");
            return;
        }

        const compiledDosage = compileDosagePattern();
        if (compiledDosage === "0-0-0") {
            toast.error("Please select at least one dosage interval (Morning, Afternoon, Evening).");
            return;
        }

        const uppercaseName = rawName.toUpperCase();

        const newStagedItem = {
            name: uppercaseName,
            form: medicineForm,
            strength: strength.trim() || 'N/A',
            dosage: compiledDosage,
            doseInterval: compiledDosage,
            frequency: compileFrequencyText(),
            duration: duration.trim() || '5 days',
            administrationTiming: administrationTiming,
            instructions: instructions.trim() || administrationTiming,
            salt_composition: selectedMedicineSalt || ''
        };

        setStagedMedicines(prev => [...prev, newStagedItem]);

        // Reset medicine input fields
        setMedicineSearch('');
        setSelectedMedicineName('');
        setSelectedMedicineSalt('');
        setIsCustomMedicine(false);
        setMedicineForm('Tablet');
        setStrength('500 mg');
        setSelectedFrequencySig('b.i.d.');
        setDosageSchedule({ morning: true, afternoon: false, evening: true });
        setDuration('5 days');
        setAdministrationTiming('p.c. (After meals)');
        setInstructions('Take after meals');
    };

    const handleRemoveStagedItem = (idxToRemove) => {
        setStagedMedicines(prev => prev.filter((_, idx) => idx !== idxToRemove));
    };

    const handleDietPlanChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error('Only PDF documents are allowed for diet plans.');
                e.target.value = '';
                return;
            }
            setDietPlanFile(file);
            setDietPlanFileName(file.name);
        }
    };

    const handleProcessPrescription = () => {
        if (isOnline && !isOtpVerified) {
            toast.error("OTP verification is required for Video Consultations before submitting prescription.");
            return;
        }
        if (diagnosis.length === 0) {
            toast.error("Please add at least one clinical diagnosis.");
            return;
        }
        if (stagedMedicines.length === 0) {
            toast.error("Please stage at least one medicine in the prescription queue.");
            return;
        }

        let formattedDate = nextAppointment;
        if (nextAppointment) {
            try {
                const dateObj = new Date(nextAppointment);
                if (!isNaN(dateObj.getTime())) {
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const year = dateObj.getFullYear();
                    formattedDate = `${day}/${month}/${year}`;
                }
            } catch (err) {
                console.error("Date formatting warning:", err);
            }
        }

        const resolvedUserId = 
            appointment?.userId?._id || 
            appointment?.userId || 
            appointment?.patientId || 
            appointment?.userAccount?._id || 
            "";

        const payload = {
            userId: resolvedUserId,
            patientId: resolvedUserId,
            diagnosis: diagnosis,
            medicines: stagedMedicines,
            chiefComplaints: chiefComplaints,
            advisedInvestigations: advisedInvestigations,
            adviceGiven: adviceGiven,
            specialInstructions: specialInstructions,
            nextAppointment: formattedDate, 
            dietPlanFile: dietPlanFile,
            bp: vitals.bp,
            pulse: vitals.pulse,
            temp: vitals.temp,
            spo2: vitals.spo2
        };

        onSuccess(payload);
    };

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[130] p-4 animate-in fade-in duration-200 font-sans">
            <div className="bg-slate-50 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden rounded-[2.5rem] shadow-2xl relative border border-slate-100">
                
                {/* Header */}
                <div className="px-8 py-5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                    <button 
                        onClick={onClose}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-xs font-black uppercase tracking-wider cursor-pointer"
                    >
                        <FaArrowLeft size={12} /> Back
                    </button>
                    <div className="text-center">
                        <h2 className="text-base font-black text-slate-800 tracking-tight uppercase flex items-center justify-center gap-2">
                            <span>℞ Medical Prescription Pad</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-full">
                                NMC Formatted
                            </span>
                        </h2>
                        <span className="text-[10px] text-emerald-700 font-black uppercase tracking-wider">
                            Patient: {appointment?.patientName} (Booking #{appointment?.bookingId})
                        </span>
                    </div>
                    <FaFileMedical className="text-amber-500" size={20} />
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                    
                    {/* SECTION 1: CONSULTATION SUMMARY & DIAGNOSIS CARD */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Patient Demographics</span>
                                <h3 className="text-base font-black text-slate-900 uppercase">{appointment?.patientName}</h3>
                                <p className="text-xs text-slate-400 font-bold mt-0.5">Booking ID: #{appointment?.bookingId} &bull; {appointment?.patientGender}, {appointment?.patientAge} Yrs</p>
                            </div>
                            <span className="bg-green-50 border border-green-100 text-[#08B36A] text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full">
                                Active Consultation
                            </span>
                        </div>

                        {/* Video Consult OTP Security Gate */}
                        {isOnline && (
                            <div className="mt-4 p-5 bg-amber-50/50 border border-amber-200/50 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black text-amber-700 uppercase tracking-wider flex items-center gap-2">
                                        <FaLock size={12} className="text-amber-600" /> Dynamic Call Completion Handshake
                                    </h4>
                                    {isOtpVerified && (
                                        <span className="text-[8px] font-black tracking-widest uppercase bg-green-100 text-[#08B36A] px-2.5 py-1 rounded">
                                            Handshake Verified
                                        </span>
                                    )}
                                </div>

                                {!isOtpVerified ? (
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {!isOtpSent ? (
                                            <button
                                                type="button"
                                                onClick={handleSendCompletionOtp}
                                                disabled={otpLoading}
                                                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                                            >
                                                {otpLoading ? <FaSpinner className="animate-spin" size={10} /> : "Request Completion OTP"}
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                <input
                                                    type="text"
                                                    maxLength={4}
                                                    placeholder="Enter 4-Digit OTP"
                                                    value={otpCode}
                                                    onChange={(e) => setOtpCode(e.target.value)}
                                                    className="w-36 px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-700 text-center outline-none focus:border-amber-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyCompletionOtp}
                                                    disabled={otpLoading}
                                                    className="px-5 py-2.5 bg-[#08B36A] hover:bg-green-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                                                >
                                                    {otpLoading ? <FaSpinner className="animate-spin" size={10} /> : "Verify Handshake Code"}
                                                </button>
                                                {devOtp && (
                                                    <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-3 py-2 rounded-xl">Bypass OTP: {devOtp}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs font-semibold text-[#08B36A] italic">
                                        ✔ Handshake authorization token successfully logged. You are now authorized to submit the prescription.
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="space-y-2 pt-2 border-t border-slate-50">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-600">
                                Diagnosis / Provisional Diagnosis *
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter active findings & hit Add... (e.g. Fever, Common Cold, Gastritis)"
                                    value={diagnosisInput}
                                    onChange={(e) => setDiagnosisInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDiagnosis())}
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-xs text-slate-800 outline-none focus:bg-white focus:border-[#08B36A]"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddDiagnosis}
                                    className="px-6 bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                                >
                                    <FaPlus size={10} /> Add Diagnosis
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                                {diagnosis.map((tag, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight">
                                        {tag}
                                        <button type="button" onClick={() => handleRemoveDiagnosis(idx)} className="text-slate-400 hover:text-red-500 cursor-pointer">
                                            <IoCloseOutline size={16} />
                                        </button>
                                    </span>
                                ))}
                                {diagnosis.length === 0 && (
                                    <p className="text-[11px] text-slate-400 font-semibold italic">Please add at least one provisional diagnosis tag above.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: PATIENT VITALS PARAMETERS */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                        <h3 className="text-xs font-black text-[#08B36A] uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-2">
                            <FaHeartbeat className="text-[#08B36A]" /> Patient Vitals Parameters
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">BP (Blood Pressure)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 120/80 mmHg"
                                    value={vitals.bp}
                                    onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800 outline-none focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Pulse Rate</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 72 bpm"
                                    value={vitals.pulse}
                                    onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800 outline-none focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Temperature</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 98.4 °F"
                                    value={vitals.temp}
                                    onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800 outline-none focus:bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">SpO2 (Oxygen Sat.)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 98 %"
                                    value={vitals.spo2}
                                    onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800 outline-none focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: ℞ MEDICATION BUILDER & QUEUE */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        
                        {/* Drug Formulation Builder */}
                        <div className="lg:col-span-7 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xs space-y-4">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                                <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                    <FaCapsules /> ℞ Medication Table Formulation
                                </h3>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsCustomMedicine(!isCustomMedicine);
                                        setSelectedMedicineName('');
                                        setSelectedMedicineSalt('');
                                        setMedicineSearch('');
                                    }}
                                    className="text-[10px] font-black text-amber-600 underline uppercase tracking-wider cursor-pointer"
                                >
                                    {isCustomMedicine ? "Search Master Index" : "Write Custom Generic Drug"}
                                </button>
                            </div>

                            {/* Live Search Input */}
                            <div className="space-y-1.5 relative">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    {isCustomMedicine ? "Generic Drug Name (Auto-Capitalized)" : "Type to search catalog (e.g. Dolo, Pantoprazole)..."}
                                </label>
                                {isCustomMedicine ? (
                                    <input
                                        type="text"
                                        placeholder="Enter generic drug name (e.g. PARACETAMOL 650MG)..."
                                        value={medicineSearch}
                                        onChange={(e) => setMedicineSearch(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl font-black text-xs text-slate-900 outline-none uppercase focus:bg-white focus:border-amber-500"
                                    />
                                ) : (
                                    <div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search master catalog..."
                                                value={medicineSearch}
                                                onChange={(e) => setMedicineSearch(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-black uppercase outline-none focus:border-amber-500"
                                            />
                                            {isSearching && (
                                                <FaSpinner className="animate-spin text-amber-500 absolute right-3.5 top-3.5" size={14} />
                                            )}
                                        </div>

                                        {/* Dropdown Results */}
                                        {searchResults.length > 0 && (
                                            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                                                {searchResults.map((result) => (
                                                    <button
                                                        key={result._id || result.id}
                                                        type="button"
                                                        onClick={() => handleSelectCatalogDrug(result)}
                                                        className="w-full text-left p-3 hover:bg-amber-50/50 flex justify-between items-center transition-colors cursor-pointer"
                                                    >
                                                        <div>
                                                            <p className="font-black text-xs text-slate-900">{result.name}</p>
                                                            {result.salt_composition && (
                                                                <p className="text-[10px] text-emerald-600 font-bold">{result.salt_composition}</p>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-black">
                                                            {result.packaging || 'Pack'}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Form, Strength & Frequency (Once daily / Twice daily) */}
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
                                        className="w-full px-3.5 py-2.5 bg-amber-50/60 border border-amber-300 rounded-xl font-black text-xs text-slate-800 focus:border-amber-500 cursor-pointer"
                                    >
                                        {LATIN_FREQUENCY_SHORTCUTS.map((sc) => (
                                            <option key={sc.sig} value={sc.sig}>
                                                {sc.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Dosage Intervals Schedule */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black uppercase text-slate-400">
                                    Dosage Intervals ({compileDosagePattern()})
                                </label>
                                <div className="grid grid-cols-3 gap-2.5">
                                    {['morning', 'afternoon', 'evening'].map((slot) => (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => toggleDosage(slot)}
                                            className={`py-2 rounded-xl font-black text-xs uppercase tracking-wider border transition-all cursor-pointer ${
                                                dosageSchedule[slot]
                                                    ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {dosageSchedule[slot] && '✔ '}
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Duration - Editable Input Field */}
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black uppercase text-slate-400">Duration *</label>
                                <input
                                    type="text"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder="e.g. 5 days, 10 days, 2 weeks, SOS..."
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800 outline-none focus:bg-white focus:border-amber-500"
                                />
                            </div>

                            {/* Latin Timing Shortcuts */}
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

                            {/* Instructions Input */}
                            <div className="space-y-1">
                                <input
                                    type="text"
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    placeholder="Special Instructions (e.g. Take after meals with warm water)..."
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800 outline-none focus:border-amber-500"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleAddMedicineToQueue}
                                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                            >
                                <FaPlus size={11} /> Add to Prescription Queue
                            </button>
                        </div>

                        {/* Staged Prescription Queue */}
                        <div className="lg:col-span-5 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xs flex flex-col h-full min-h-[500px]">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Medication Table Queue ({stagedMedicines.length})
                                </span>
                                <span className="text-[10px] font-black text-amber-600 uppercase">℞ NMC Formatted</span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[440px]">
                                {stagedMedicines.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-24 text-center text-slate-400">
                                        <FaPills size={28} className="text-slate-300 mb-2" />
                                        <p className="font-black text-xs uppercase">No medicines staged</p>
                                        <p className="text-[10px] mt-1 max-w-[200px]">
                                            Search catalog on left, set strength, select frequency dropdown and tap "Add to Prescription Queue".
                                        </p>
                                    </div>
                                ) : (
                                    stagedMedicines.map((med, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl flex justify-between items-start gap-2 shadow-2xs"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="font-black text-xs text-slate-900 tracking-tight">
                                                        {med.name}
                                                    </span>
                                                    {med.strength && (
                                                        <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[9px] font-black uppercase rounded">
                                                            {med.strength}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                                                    <span className="bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-black">
                                                        {med.doseInterval || med.dosage}
                                                    </span>
                                                    <span>&bull;</span>
                                                    <span>{med.frequency}</span>
                                                    <span>&bull;</span>
                                                    <span>{med.duration}</span>
                                                </div>

                                                <p className="text-[10px] text-emerald-700 font-bold italic">
                                                    {med.instructions}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveStagedItem(idx)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
                                                title="Remove Drug"
                                            >
                                                <FaTrash size={11} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                    {/* SECTION 4: CLINICAL RECOMMENDATIONS & DIRECTIVES */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xs space-y-4">
                        <h3 className="text-xs font-black text-[#08B36A] uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-2">
                            <FaRegClipboard className="text-[#08B36A]" /> Clinical Recommendations &amp; Directives
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Chief Complaints</label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Cough, fever for 3 days..."
                                    value={chiefComplaints}
                                    onChange={(e) => setChiefComplaints(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800 outline-none focus:bg-white resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Advised Investigations</label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. CBC, Blood Sugar, Chest X-Ray..."
                                    value={advisedInvestigations}
                                    onChange={(e) => setAdvisedInvestigations(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800 outline-none focus:bg-white resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Advice Given</label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Bed rest, stay hydrated..."
                                    value={adviceGiven}
                                    onChange={(e) => setAdviceGiven(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800 outline-none focus:bg-white resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Special Instructions</label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Avoid cold drinks..."
                                    value={specialInstructions}
                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800 outline-none focus:bg-white resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Next Follow-Up</label>
                                <input
                                    type="date"
                                    value={nextAppointment}
                                    onChange={(e) => setNextAppointment(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800 outline-none focus:bg-white cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: DIET PLAN PDF */}
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xs space-y-3">
                        <span className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest block">
                            🥦 Diet Plan Document (Optional)
                        </span>
                        <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 transition-colors block">
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleDietPlanChange}
                                className="hidden"
                            />
                            <FaCloudUploadAlt className="mx-auto text-slate-400 mb-2" size={26} />
                            <p className="text-slate-700 font-black text-xs uppercase">
                                {dietPlanFileName ? dietPlanFileName : "Upload optional patient diet plan PDF"}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                                {dietPlanFileName ? "PDF Ready to attach" : "Accepts PDF documents only"}
                            </p>
                        </label>
                    </div>

                </div>

                {/* Footer Controls */}
                <div className="px-8 py-5 bg-white border-t border-slate-100 shrink-0">
                    <button
                        type="button"
                        onClick={handleProcessPrescription}
                        disabled={isOnline && !isOtpVerified}
                        className={`w-full py-4 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                            isOnline && !isOtpVerified 
                                ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                                : 'bg-orange-500 hover:bg-orange-600 shadow-orange-100 active:scale-98'
                        }`}
                    >
                        {isOnline && !isOtpVerified ? "Handshake Verification Required" : "Process Prescription"}
                    </button>
                </div>

            </div>
        </div>
    );
}