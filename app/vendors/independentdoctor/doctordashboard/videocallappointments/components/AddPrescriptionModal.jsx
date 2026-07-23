'use client';
import React, { useState, useEffect } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { FaPlus, FaTrash, FaSpinner, FaCloudUploadAlt, FaFileMedical, FaArrowLeft, FaRegClipboard } from 'react-icons/fa';
import DoctorAPI from '@/app/services/DoctorAPI';
import { toast } from 'react-hot-toast';

export default function AddPrescriptionModal({ isOpen, onClose, appointment, onSuccess }) {
    const [diagnosisInput, setDiagnosisInput] = useState('');
    const [diagnosis, setDiagnosis] = useState([]);
    
    const [chiefComplaints, setChiefComplaints] = useState('');
    const [advisedInvestigations, setAdvisedInvestigations] = useState('');
    const [adviceGiven, setAdviceGiven] = useState('');
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [nextAppointment, setNextAppointment] = useState(''); 
    
    const [stagedMedicines, setStagedMedicines] = useState([]);

    const [medicineSearch, setMedicineSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMedicineName, setSelectedMedicineName] = useState('');
    const [selectedMedicineSalt, setSelectedMedicineSalt] = useState('');
    const [isCustomMedicine, setIsCustomMedicine] = useState(false);

    const [dosageSchedule, setDosageSchedule] = useState({
        morning: false,
        afternoon: false,
        evening: false
    });

    const [duration, setDuration] = useState('3 days');
    const [instructions, setInstructions] = useState('As directed by physician');

    useEffect(() => {
        if (medicineSearch.trim().length < 2) {
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
    }, [medicineSearch]);

    if (!isOpen) return null;

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

    const compileDosagePattern = () => {
        const m = dosageSchedule.morning ? '1' : '0';
        const a = dosageSchedule.afternoon ? '1' : '0';
        const e = dosageSchedule.evening ? '1' : '0';
        return `${m}-${a}-${e}`;
    };

    const compileFrequencyText = () => {
        const parts = [];
        if (dosageSchedule.morning) parts.push("Morning");
        if (dosageSchedule.afternoon) parts.push("Afternoon");
        if (dosageSchedule.evening) parts.push("Evening");
        return parts.join(" - ") || "As required";
    };

    const handleAddMedicineToQueue = () => {
        const medicineName = isCustomMedicine ? medicineSearch.trim() : selectedMedicineName;
        if (!medicineName) {
            toast.error("Please select or enter a valid medicine formulation.");
            return;
        }

        const compiledDosage = compileDosagePattern();
        if (compiledDosage === "0-0-0") {
            toast.error("Please select at least one dosage interval (Morning, Afternoon, Evening).");
            return;
        }

        const newStagedItem = {
            name: medicineName,
            dosage: compiledDosage,
            frequency: compileFrequencyText(),
            duration: duration,
            instructions: instructions
        };

        setStagedMedicines(prev => [...prev, newStagedItem]);

        setMedicineSearch('');
        setSelectedMedicineName('');
        setSelectedMedicineSalt('');
        setIsCustomMedicine(false);
        setDosageSchedule({ morning: false, afternoon: false, evening: false });
        setDuration('3 days');
        setInstructions('As directed by physician');
    };

    const handleRemoveStagedItem = (idxToRemove) => {
        setStagedMedicines(prev => prev.filter((_, idx) => idx !== idxToRemove));
    };

    const handleProcessPrescription = () => {
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

        const payload = {
            diagnosis: diagnosis,
            medicines: stagedMedicines,
            chiefComplaints: chiefComplaints,
            advisedInvestigations: advisedInvestigations,
            adviceGiven: adviceGiven,
            specialInstructions: specialInstructions,
            nextAppointment: formattedDate, 
            additionalNotes: "" 
        };

        onSuccess(payload);
    };

    return (
        <div className="fixed inset-0 bg-slate-955/40 backdrop-blur-sm flex items-center justify-center z-[130] p-4 animate-fade-in font-sans">
            <div className="bg-slate-50 w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden rounded-[2.5rem] shadow-2xl relative border border-slate-100">
                
                <div className="px-8 py-5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                    <button 
                        onClick={onClose}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-black uppercase tracking-wider"
                    >
                        <FaArrowLeft size={14} /> Back
                    </button>
                    <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
                        Add Clinical Prescription
                    </h2>
                    <FaFileMedical className="text-amber-500" size={20} />
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Consultation</span>
                                <h3 className="text-base font-black text-slate-900 uppercase">{appointment?.patientName}</h3>
                                <p className="text-xs text-slate-400 font-bold mt-0.5">Booking ID: {appointment?.bookingId} | {appointment?.patientGender}, {appointment?.patientAge} Yrs</p>
                            </div>
                            <span className="bg-green-50 border border-green-100 text-[#08B36A] text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full">
                                OTP Verified & In-Progress
                            </span>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-50">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Clinical Diagnosis Tags</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter active findings & hit Add... (e.g. Fever, Common Cold)"
                                    value={diagnosisInput}
                                    onChange={(e) => setDiagnosisInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDiagnosis())}
                                    className="flex-1 px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-green-50/50 focus:border-[#08B36A] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddDiagnosis}
                                    className="px-6 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <FaPlus size={10} /> Add Tag
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                                {diagnosis.map((tag, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200/50 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight">
                                        {tag}
                                        <button type="button" onClick={() => handleRemoveDiagnosis(idx)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <IoCloseOutline size={16} />
                                        </button>
                                    </span>
                                ))}
                                {diagnosis.length === 0 && (
                                    <p className="text-xs text-gray-400 font-medium italic">Please input at least one clinical diagnosis for this file.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        
                        <div className="lg:col-span-7 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                                    💊 Medication Formulations
                                </h3>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setIsCustomMedicine(!isCustomMedicine);
                                        setSelectedMedicineName('');
                                        setSelectedMedicineSalt('');
                                        setMedicineSearch('');
                                    }}
                                    className="text-[10px] font-black text-amber-500 hover:text-amber-600 underline uppercase tracking-wider"
                                >
                                    {isCustomMedicine ? "Search Master Index" : "Write Custom Medicine"}
                                </button>
                            </div>

                            <div className="space-y-1.5 relative">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    {isCustomMedicine ? "Custom Medicine Name" : "Select Medicine"}
                                </label>
                                <input
                                    type="text"
                                    placeholder={isCustomMedicine ? "Enter custom medicine name..." : "Type to search (e.g. Dolo)..."}
                                    value={medicineSearch}
                                    onChange={(e) => setMedicineSearch(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-green-50/50 focus:border-amber-500 transition-all"
                                />

                                {!isCustomMedicine && searchResults.length > 0 && (
                                    <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 max-h-60 overflow-y-auto divide-y divide-slate-50 animate-in fade-in duration-100">
                                        {searchResults.map((result) => (
                                            <button
                                                key={result._id || result.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedMedicineName(result.name);
                                                    setSelectedMedicineSalt(result.salt_composition || '');
                                                    setMedicineSearch(result.name);
                                                    setSearchResults([]);
                                                }}
                                                className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-amber-500 transition-all flex justify-between items-center gap-4 animate-in fade-in"
                                            >
                                                <div className="flex flex-col space-y-0.5 animate-in fade-in duration-100">
                                                    <span className="font-extrabold text-slate-800 text-sm">{result.name}</span>
                                                    {result.salt_composition && (
                                                        <span className="text-[9px] text-[#08B36A] font-bold uppercase tracking-wider line-clamp-1 bg-green-50 px-2 py-0.5 rounded-md self-start mt-0.5">
                                                            🧪 Salt: {result.salt_composition}
                                                        </span>
                                                    )}
                                                    {result.manufacturers && (
                                                        <span className="text-[9px] text-slate-400 font-medium pt-0.5">Mfg: {result.manufacturers}</span>
                                                    )}
                                                </div>
                                                <div className="text-right flex flex-col items-end shrink-0 text-[10px] text-slate-400 font-bold">
                                                    {result.packaging && <span className="bg-slate-100 px-2 py-0.5 rounded text-[8px] uppercase tracking-wider mb-1">{result.packaging}</span>}
                                                    {result.mrp && <span className="text-amber-600 font-extrabold">₹{result.mrp}</span>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {isSearching && (
                                    <div className="absolute right-4 top-10 text-slate-400">
                                        <FaSpinner className="animate-spin" size={14} />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => toggleDosage('morning')}
                                    className={`py-4 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all flex flex-col items-center justify-center gap-1.5 ${
                                        dosageSchedule.morning 
                                            ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-100 scale-102' 
                                            : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {dosageSchedule.morning && <span className="text-[10px]">✔</span>}
                                    Morning
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleDosage('afternoon')}
                                    className={`py-4 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all flex flex-col items-center justify-center gap-1.5 ${
                                        dosageSchedule.afternoon 
                                            ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-100 scale-102' 
                                            : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {dosageSchedule.afternoon && <span className="text-[10px]">✔</span>}
                                    Afternoon
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleDosage('evening')}
                                    className={`py-4 rounded-2xl font-black text-xs uppercase tracking-wider border transition-all flex flex-col items-center justify-center gap-1.5 ${
                                        dosageSchedule.evening 
                                            ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-100 scale-102' 
                                            : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    {dosageSchedule.evening && <span className="text-[10px]">✔</span>}
                                    Evening
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Duration</label>
                                    <select
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-amber-50/40"
                                    >
                                        <option value="1 day">1 day</option>
                                        <option value="3 days">3 days</option>
                                        <option value="5 days">5 days</option>
                                        <option value="7 days">7 days</option>
                                        <option value="10 days">10 days</option>
                                        <option value="15 days">15 days</option>
                                        <option value="1 month">1 month</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Instructions</label>
                                    <select
                                        value={instructions}
                                        onChange={(e) => setInstructions(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-amber-50/40"
                                    >
                                        <option value="As directed by physician">As directed by physician</option>
                                        <option value="Post breakfast and dinner">Post breakfast and dinner</option>
                                        <option value="Post breakfast and lunch">Post breakfast and lunch</option>
                                        <option value="Empty stomach with warm water">Empty stomach with warm water</option>
                                        <option value="Take only in case of emergency (SOS)">Take only in case of emergency (SOS)</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleAddMedicineToQueue}
                                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-amber-100 transition-all flex items-center justify-center gap-2 active:scale-98"
                            >
                                <FaPlus size={11} /> Add Medicine to List
                            </button>
                        </div>

                        <div className="lg:col-span-5 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col h-full min-h-[380px]">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">
                                Prescription Queue
                            </span>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[340px]">
                                {stagedMedicines.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-3">
                                            💊
                                        </div>
                                        <p className="text-slate-800 font-black text-xs uppercase">No staged medicines</p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1 max-w-[200px]">Staged formulations will populate here before processing.</p>
                                    </div>
                                ) : (
                                    stagedMedicines.map((med, idx) => (
                                        <div key={idx} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex justify-between items-start gap-2 animate-in slide-in-from-right-3 duration-200">
                                            <div className="space-y-1">
                                                <p className="font-black text-xs text-slate-800 uppercase tracking-tight">{med.name}</p>
                                                {med.salt_composition && (
                                                    <p className="text-[9px] font-extrabold text-[#08B36A] uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded-md inline-block">
                                                        🧪 {med.salt_composition}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400 font-bold pt-1">
                                                    <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md font-black">{med.dosage}</span>
                                                    <span>•</span>
                                                    <span>{med.frequency}</span>
                                                    <span>•</span>
                                                    <span>{med.duration}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 italic font-medium">{med.instructions}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveStagedItem(idx)}
                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                        <h3 className="text-xs font-black text-[#08B36A] uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-2">
                            <FaRegClipboard className="text-[#08B36A]" /> Clinical Recommendations & Directives
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Chief Complaints</label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Cough, persistent fever, body ache..."
                                    value={chiefComplaints}
                                    onChange={(e) => setChiefComplaints(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-green-50/50 focus:border-[#08B36A] rounded-2xl font-bold text-xs text-slate-700 outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Advised Investigations</label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. CBC, Blood Sugar, Chest X-Ray..."
                                    value={advisedInvestigations}
                                    onChange={(e) => setAdvisedInvestigations(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-green-50/50 focus:border-[#08B36A] rounded-2xl font-bold text-xs text-slate-700 outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Advice Given</label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Take bed rest, stay hydrated, light meals..."
                                    value={adviceGiven}
                                    onChange={(e) => setAdviceGiven(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-green-50/50 focus:border-[#08B36A] rounded-2xl font-bold text-xs text-slate-700 outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Any Special Instructions</label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Avoid cold beverages, consult immediately if fever persists..."
                                    value={specialInstructions}
                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-green-50/50 focus:border-[#08B36A] rounded-2xl font-bold text-xs text-slate-700 outline-none transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Next Appointment (Follow-Up)</label>
                                <input
                                    type="date"
                                    value={nextAppointment}
                                    onChange={(e) => setNextAppointment(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-green-50/50 focus:border-[#08B36A] rounded-2xl font-bold text-xs text-slate-700 outline-none transition-all cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
                        <span className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest block">
                            🥦 Diet Plan Profile (Optional)
                        </span>
                        <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 transition-colors">
                            <FaCloudUploadAlt className="mx-auto text-slate-400 mb-2" size={26} />
                            <p className="text-slate-700 font-black text-xs uppercase">Upload optional patient diet plan PDF</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-0.5">Accepts PDF documents only</p>
                        </div>
                    </div>

                </div>

                <div className="px-8 py-5 bg-white border-t border-slate-100 shrink-0">
                    <button
                        type="button"
                        onClick={handleProcessPrescription}
                        className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-98 shadow-lg shadow-orange-100"
                    >
                        Process Prescription
                    </button>
                </div>

            </div>
        </div>
    );
}