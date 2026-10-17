'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import {
  FaPlus,
  FaTrash,
  FaSpinner,
  FaArrowLeft,
  FaRegClipboard,
  FaHeartbeat,
  FaCapsules,
  FaNotesMedical,
  FaPills,
  FaBookMedical,
  FaChevronDown,
  FaChevronUp,
  FaFilePdf
} from 'react-icons/fa';
import HospitalDoctorAPI from '@/app/services/HospitalDoctorAPI';
import { toast } from 'react-hot-toast';

const DEFAULT_CLINIC_LOGO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2308B36A'%3E%3Cpath d='M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z'/%3E%3C/svg%3E";

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

// Statutory Latin Abbreviations and Clinical Definitions
const LATIN_FREQUENCY_SHORTCUTS = [
  { sig: 'q.d.', latin: 'quaque die', meaning: 'Every day / Once daily', doseInterval: '1-0-0', pattern: { morning: true, afternoon: false, evening: false } },
  { sig: 'b.i.d.', latin: 'bis in die', meaning: 'Twice daily', doseInterval: '1-0-1', pattern: { morning: true, afternoon: false, evening: true } },
  { sig: 't.i.d.', latin: 'ter in die', meaning: 'Three times daily', doseInterval: '1-1-1', pattern: { morning: true, afternoon: true, evening: true } },
  { sig: 'q.i.d.', latin: 'quater in die', meaning: 'Four times daily', doseInterval: '1-1-1-1', pattern: { morning: true, afternoon: true, evening: true } },
  { sig: 'h.s.', latin: 'hora somni', meaning: 'At bedtime', doseInterval: '0-0-1', pattern: { morning: false, afternoon: false, evening: true } }
];

const LATIN_TIMING_SHORTCUTS = [
  { sig: 'a.c.', latin: 'ante cibum', label: 'a.c. (Before meals)' },
  { sig: 'p.c.', latin: 'post cibum', label: 'p.c. (After meals)' },
  { sig: 'h.s.', latin: 'hora somni', label: 'h.s. (At bedtime)' },
  { sig: 'prn', latin: 'pro re nata', label: 'prn (As needed / SOS)' },
  { sig: 'stat', latin: 'statim', label: 'stat (Immediately / At once)' }
];

const LATIN_REFERENCE_TABLE = [
  { term: 'Rx', origin: 'Recipe', definition: 'Take thou (Prescription symbol)' },
  { term: 'a.c.', origin: 'ante cibum', definition: 'Before meals' },
  { term: 'p.c.', origin: 'post cibum', definition: 'After meals' },
  { term: 'h.s.', origin: 'hora somni', definition: 'At bedtime' },
  { term: 'b.i.d. / b.d.', origin: 'bis in die', definition: 'Twice daily' },
  { term: 't.i.d. / t.d.s.', origin: 'ter in die', definition: 'Three times daily' },
  { term: 'q.i.d.', origin: 'quater in die', definition: 'Four times daily' },
  { term: 'q.d.', origin: 'quaque die', definition: 'Every day (Once daily)' },
  { term: 'prn', origin: 'pro re nata', definition: 'As needed (SOS)' },
  { term: 'stat', origin: 'statim', definition: 'Immediately / at once' }
];

export default function AddPrescriptionModal({ isOpen, onClose, appointment, onSuccess }) {
  const hiddenPdfTemplateRef = useRef();

  // Doctor & Hospital State
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Clinical Records State
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [diagnosis, setDiagnosis] = useState([]);
  const [chiefComplaints, setChiefComplaints] = useState('');
  const [advisedInvestigations, setAdvisedInvestigations] = useState('');
  const [nextAppointment, setNextAppointment] = useState('');

  // Staged Medicines Queue
  const [stagedMedicines, setStagedMedicines] = useState([]);

  // Live Catalog Drug Search
  const [medicineSearch, setMedicineSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isCustomMedicine, setIsCustomMedicine] = useState(false);

  // Formulation Parameters
  const [medicineForm, setMedicineForm] = useState('Tablet');
  const [strength, setStrength] = useState('500 mg');
  const [selectedFrequencySig, setSelectedFrequencySig] = useState('b.i.d.');
  const [duration, setDuration] = useState('5 days');
  const [administrationTiming, setAdministrationTiming] = useState('p.c. (After meals)');
  const [instructions, setInstructions] = useState('Take after meals');

  const [dosageSchedule, setDosageSchedule] = useState({
    morning: true,
    afternoon: false,
    evening: true
  });

  // Collapsible Latin Reference Sheet
  const [showLatinCheatSheet, setShowLatinCheatSheet] = useState(false);

  // Vitals State Parameters
  const [vitals, setVitals] = useState({
    bp: '',
    pulse: '',
    temp: '',
    spo2: ''
  });

  useEffect(() => {
    if (isCustomMedicine || medicineSearch.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        setIsSearching(true);
        let res = null;

        if (typeof HospitalDoctorAPI?.searchMedicines === 'function') {
          res = await HospitalDoctorAPI.searchMedicines(medicineSearch.trim(), 1, 20);
        } else if (typeof HospitalDoctorAPI?.getMedicines === 'function') {
          res = await HospitalDoctorAPI.getMedicines({ search: medicineSearch.trim() });
        }

        if (res && res.success) {
          setSearchResults(res.data || []);
        }
      } catch (err) {
        console.error('Drug search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [medicineSearch, isCustomMedicine]);

  // Load Doctor Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (typeof HospitalDoctorAPI.getProfile === 'function') {
          const res = await HospitalDoctorAPI.getProfile();
          if (res?.success && res.data) setDoctorProfile(res.data);
        }
      } catch (err) {
        console.warn('Profile fetch warning in modal:', err);
      }
    };

    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  // Reset & populate inputs on modal open
  useEffect(() => {
    if (isOpen) {
      setDiagnosisInput('');
      setDiagnosis([]);
      setChiefComplaints(appointment?.reasonForVisit || appointment?.chiefComplaints || '');
      setAdvisedInvestigations('');
      setNextAppointment('');
      setStagedMedicines([]);
      setSelectedMedicine(null);
      setIsCustomMedicine(false);
      setMedicineForm('Tablet');
      setStrength('500 mg');
      setSelectedFrequencySig('b.i.d.');
      setDosageSchedule({ morning: true, afternoon: false, evening: true });
      setDuration('5 days');
      setAdministrationTiming('p.c. (After meals)');
      setInstructions('Take after meals');
      setShowLatinCheatSheet(false);
      setVitals({
        bp: appointment?.vitals?.bp || '',
        pulse: appointment?.vitals?.pulse || '',
        temp: appointment?.vitals?.temp || '',
        spo2: appointment?.vitals?.spo2 || ''
      });
    }
  }, [isOpen, appointment]);

  if (!isOpen) return null;

  const handleSelectCatalogDrug = (drug) => {
    setSelectedMedicine(drug);
    setMedicineSearch(drug.name);
    setSearchResults([]);

    if (drug.genericComposition) {
      const match = drug.genericComposition.match(/\((\d+\s*mg|\d+\s*ml)\)/i);
      if (match) setStrength(match[1]);
    }
  };

  const handleAddDiagnosis = () => {
    const tag = diagnosisInput.trim();
    if (tag && !diagnosis.includes(tag)) {
      setDiagnosis((prev) => [...prev, tag]);
      setDiagnosisInput('');
    }
  };

  const handleRemoveDiagnosis = (indexToRemove) => {
    setDiagnosis((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const toggleDosage = (key) => {
    setDosageSchedule((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFrequencyChange = (sigValue) => {
    setSelectedFrequencySig(sigValue);
    const matched = LATIN_FREQUENCY_SHORTCUTS.find((item) => item.sig === sigValue);
    if (matched) {
      setDosageSchedule(matched.pattern);
    }
  };

  const applyLatinTiming = (shortcut) => {
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
    if (pattern === '1-0-0') return 'q.d. (Every day / Once daily)';
    if (pattern === '0-0-1') return 'h.s. (At bedtime)';
    return `${pattern} Daily`;
  };

  // Add Formulated Drug to Queue
  const handleAddMedicineToQueue = () => {
    const rawName = isCustomMedicine
      ? medicineSearch.trim()
      : selectedMedicine?.name || medicineSearch.trim();

    if (!rawName) {
      toast.error('Please search catalog or enter a drug name.');
      return;
    }

    const doseInterval = compileDosagePattern();
    if (doseInterval === '0-0-0') {
      toast.error('Please select at least one dosage interval (Morning/Afternoon/Evening).');
      return;
    }

    const uppercaseName = rawName.toUpperCase();

    const newStagedItem = {
      name: uppercaseName,
      isCustomGeneric: isCustomMedicine,
      genericComposition: selectedMedicine?.genericComposition || uppercaseName,
      form: medicineForm,
      strength: strength.trim() || 'N/A',
      frequency: compileFrequencyText(),
      doseInterval: doseInterval,
      dosage: doseInterval,
      duration: duration,
      administrationTiming: administrationTiming,
      instructions: instructions.trim() || administrationTiming
    };

    setStagedMedicines((prev) => [...prev, newStagedItem]);

    // Reset Form for next drug
    setMedicineSearch('');
    setSelectedMedicine(null);
    setIsCustomMedicine(false);
    setSelectedFrequencySig('b.i.d.');
    setDosageSchedule({ morning: true, afternoon: false, evening: true });
    setDuration('5 days');
    setAdministrationTiming('p.c. (After meals)');
    setInstructions('Take after meals');
  };

  const handleRemoveStagedItem = (idxToRemove) => {
    setStagedMedicines((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Compiles PDF and Passes Payload
  const handleGeneratePdfAndProceed = async () => {
    if (!chiefComplaints.trim()) {
      toast.error('Please enter patient Chief Complaints (Symptoms & Duration).');
      return;
    }
    if (diagnosis.length === 0) {
      toast.error('Please add at least one clinical diagnosis.');
      return;
    }
    if (stagedMedicines.length === 0) {
      toast.error('Please stage at least one medicine formulation in the queue.');
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
        console.error('Date formatting error:', err);
      }
    }

    const resolvedUserId =
      appointment?.userId?._id ||
      appointment?.userId ||
      appointment?.patientId ||
      appointment?.userAccount?._id ||
      'null';

    const hospitalName =
      doctorProfile?.hospitalName ||
      doctorProfile?.hospital?.name ||
      appointment?.hospitalName ||
      appointment?.hospital?.name ||
      'Health Kangaroo Hospital Network';

    const doctorName = doctorProfile?.name || 'Practicing Doctor';
    const speciality = doctorProfile?.speciality || 'General Medicine';
    const licenseNumber = doctorProfile?.licenseNumber || '';

    try {
      setIsGeneratingPdf(true);

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas-pro'),
        import('jspdf')
      ]);

      const element = hiddenPdfTemplateRef.current;
      if (!element) {
        throw new Error('PDF template element not ready');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, (canvas.height * 210) / canvas.width);

      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      const payload = {
        userId: resolvedUserId,
        patientId: resolvedUserId,
        appointmentId: appointment?._id || appointment?.appointmentId,
        bookingId: appointment?.bookingId,
        patientName: appointment?.patientName,
        patientAge: appointment?.patientAge,
        patientGender: appointment?.patientGender,
        patientAddress: appointment?.patientAddress || appointment?.address,
        hospitalName: hospitalName,
        doctorName: doctorName,
        doctorSpeciality: speciality,
        doctorLicense: licenseNumber,
        chiefComplaints: chiefComplaints.trim(),
        diagnosis: diagnosis,
        medicines: stagedMedicines,
        advisedInvestigations: advisedInvestigations.trim(),
        nextAppointment: formattedDate,
        vitals: vitals.bp || vitals.pulse ? vitals : null,
        prescriptionPdf: pdfBlob,
        pdfBlobUrl: pdfUrl
      };

      toast.success('Prescription PDF compiled successfully!');
      onSuccess(payload);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      toast.error('Could not compile PDF. ' + (err.message || ''));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const hospitalName =
    doctorProfile?.hospitalName ||
    doctorProfile?.hospital?.name ||
    appointment?.hospitalName ||
    'Health Kangaroo Hospital Network';

  const doctorName = doctorProfile?.name || 'Doctor';
  const speciality = doctorProfile?.speciality || 'OPD Consultant';

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
              {hospitalName} &bull; Dr. {doctorName} ({speciality})
            </span>
          </div>

          {/* Collapsible Latin Cheat Sheet */}
          <button
            type="button"
            onClick={() => setShowLatinCheatSheet(!showLatinCheatSheet)}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black uppercase flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200"
          >
            <FaBookMedical size={12} />
            <span className="hidden sm:inline">Latin Abbreviations</span>
            {showLatinCheatSheet ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* ACCORDION: LATIN ABBREVIATIONS REFERENCE */}
          {showLatinCheatSheet && (
            <div className="bg-indigo-950 text-white p-5 rounded-3xl border border-indigo-800 shadow-xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-800">
                <div className="flex items-center gap-2">
                  <FaBookMedical className="text-indigo-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-200">
                    Common Latin-Derived Medical Abbreviations &amp; Meanings
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLatinCheatSheet(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <IoCloseOutline size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-[11px]">
                {LATIN_REFERENCE_TABLE.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-white/10 rounded-xl border border-white/10">
                    <span className="font-mono font-black text-amber-300 block text-xs">{item.term}</span>
                    <span className="text-[9px] text-indigo-300 italic block">{item.origin}</span>
                    <span className="text-slate-200 font-bold block mt-0.5">{item.definition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 1: PATIENT PROFILE & CHIEF COMPLAINTS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Patient Demographics
                </span>
                <h3 className="text-base font-black text-slate-900 uppercase">{appointment?.patientName}</h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">
                  Booking ID: #{appointment?.bookingId} &bull; {appointment?.patientGender}, {appointment?.patientAge} Yrs
                </p>
              </div>
              <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full">
                {hospitalName}
              </span>
            </div>

            {/* Chief Complaints (Symptoms & Duration) */}
            <div className="pt-2 border-t border-slate-50 space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-1.5">
                <FaNotesMedical className="text-emerald-600" /> Chief Complaints (Symptoms &amp; Duration) *
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Upper abdominal discomfort after meals, mild fever for 3 days..."
                value={chiefComplaints}
                onChange={(e) => setChiefComplaints(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-xs text-slate-800 outline-none focus:bg-white focus:border-emerald-500 transition-all leading-relaxed"
              />
            </div>

            {/* Diagnosis / Provisional Diagnosis Tags */}
            <div className="space-y-2 pt-2 border-t border-slate-50">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-600">
                Diagnosis / Provisional Diagnosis *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type provisional diagnosis & hit Add (e.g. Gastritis, Fatty Liver Grade 1)..."
                  value={diagnosisInput}
                  onChange={(e) => setDiagnosisInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDiagnosis())}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl font-bold text-xs text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
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
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveDiagnosis(idx)}
                      className="text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <IoCloseOutline size={16} />
                    </button>
                  </span>
                ))}
                {diagnosis.length === 0 && (
                  <p className="text-[11px] text-slate-400 font-semibold italic">
                    Please add at least one provisional diagnosis tag above.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: PATIENT VITALS PARAMETERS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-2">
              <FaHeartbeat className="text-rose-500" /> Patient Vitals Parameters
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">BP (Blood Pressure)</label>
                <input
                  type="text"
                  placeholder="e.g. 120/80 mmHg"
                  value={vitals.bp}
                  onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Pulse Rate</label>
                <input
                  type="text"
                  placeholder="e.g. 72 bpm"
                  value={vitals.pulse}
                  onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Temperature</label>
                <input
                  type="text"
                  placeholder="e.g. 98.4 °F"
                  value={vitals.temp}
                  onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">SpO2 (Oxygen Sat.)</label>
                <input
                  type="text"
                  placeholder="e.g. 98 %"
                  value={vitals.spo2}
                  onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: ℞ MEDICATION BUILDER & QUEUE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Drug Formulation Builder */}
            <div className="lg:col-span-7 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xs space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                  <FaCapsules /> ℞ Medication Table Formulation
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomMedicine(!isCustomMedicine);
                    setSelectedMedicine(null);
                    setMedicineSearch('');
                  }}
                  className="text-[10px] font-black text-amber-600 underline uppercase tracking-wider cursor-pointer"
                >
                  {isCustomMedicine ? 'Search Drug Catalog' : 'Write Custom Generic Drug'}
                </button>
              </div>

              {/* Live Search Input */}
              <div className="space-y-1.5 relative">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                  {isCustomMedicine ? 'Generic Drug Name (Auto-Capitalized)' : 'Type to search catalog (e.g. Actibile, Paracetamol)...'}
                </label>

                {isCustomMedicine ? (
                  <input
                    type="text"
                    placeholder="Enter generic drug name (e.g. ACTIBILE 300 TABLET)..."
                    value={medicineSearch}
                    onChange={(e) => setMedicineSearch(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl font-black text-xs text-slate-900 outline-none uppercase focus:bg-white focus:border-amber-500"
                  />
                ) : (
                  <div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search catalog..."
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
                        {searchResults.map((drug) => (
                          <button
                            key={drug.id || drug._id}
                            type="button"
                            onClick={() => handleSelectCatalogDrug(drug)}
                            className="w-full text-left p-3 hover:bg-amber-50/50 flex justify-between items-center transition-colors cursor-pointer"
                          >
                            <div>
                              <p className="font-black text-xs text-slate-900">{drug.name}</p>
                              <p className="text-[10px] text-emerald-600 font-bold">{drug.genericComposition}</p>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-black">
                              {drug.packaging || 'Pack'}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Form, Strength & Frequency Dropdown (At right side of Strength) */}
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

                {/* Frequency Dropdown at the right side of Strength */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-amber-700">
                    Frequency (Latin Sig) *
                  </label>
                  <select
                    value={selectedFrequencySig}
                    onChange={(e) => handleFrequencyChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-amber-50/60 border border-amber-300 rounded-xl font-black text-xs text-slate-800 focus:border-amber-500 cursor-pointer"
                  >
                    {LATIN_FREQUENCY_SHORTCUTS.map((sc) => (
                      <option key={sc.sig} value={sc.sig}>
                        {sc.sig} ({sc.meaning})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dosage Intervals Toggle */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-slate-400">
                  Dosage Interval ({compileDosagePattern()})
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

              {/* Duration Field */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-slate-400">Duration *</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl font-bold text-xs text-slate-800"
                >
                  <option value="3 days">3 days</option>
                  <option value="5 days">5 days</option>
                  <option value="7 days">7 days</option>
                  <option value="10 days">10 days</option>
                  <option value="15 days">15 days</option>
                  <option value="1 month">1 month</option>
                </select>
              </div>

              {/* Latin Administration Timing Shortcuts */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-400">
                  Administration Timing (Latin Shortcuts)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {LATIN_TIMING_SHORTCUTS.map((item) => (
                    <button
                      key={item.sig}
                      type="button"
                      onClick={() => applyLatinTiming(item)}
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

            {/* Right: Formulation Queue */}
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
                          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[9px] font-black uppercase rounded">
                            {med.strength}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                          <span className="bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-black">
                            {med.doseInterval}
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

          {/* SECTION 4: INVESTIGATIONS & NEXT FOLLOW-UP */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-2">
              <FaRegClipboard /> Investigations &amp; Next Follow-Up
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  Advised Investigations
                </label>
                <textarea
                  rows={2}
                  value={advisedInvestigations}
                  onChange={(e) => setAdvisedInvestigations(e.target.value)}
                  placeholder="e.g. CBC, Lipid Profile, Ultrasound Abdomen..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                  Next Review Date (Follow-Up)
                </label>
                <input
                  type="date"
                  value={nextAppointment}
                  onChange={(e) => setNextAppointment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                />
                <span className="text-[9px] text-slate-400 font-semibold block mt-1">
                  Leave empty if review as-needed (SOS)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: Triggers PDF Generation */}
        <div className="px-8 py-5 bg-white border-t border-slate-100 shrink-0 flex justify-between items-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Compiles Hospital Header, Chief Complaints, NMC Formulations &amp; Latin Directives into PDF.
          </p>
          <button
            type="button"
            disabled={isGeneratingPdf}
            onClick={handleGeneratePdfAndProceed}
            className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            {isGeneratingPdf ? <FaSpinner className="animate-spin" /> : <FaFilePdf size={13} />}
            <span>{isGeneratingPdf ? 'Compiling PDF...' : 'Generate PDF & Proceed →'}</span>
          </button>
        </div>
      </div>

      {/* OFF-SCREEN PDF CANVAS */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        <div
          ref={hiddenPdfTemplateRef}
          className="w-[210mm] min-h-[297mm] p-8 bg-white text-black font-sans select-none relative space-y-6"
        >
          <div className="absolute top-0 left-0 w-32 h-20 bg-emerald-600 rounded-br-[100px]"></div>

          {/* Header */}
          <div className="flex justify-between items-start mb-6 pt-4 relative z-10 border-b border-slate-100 pb-4">
            <div className="pl-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl border border-emerald-100 p-1 flex items-center justify-center shrink-0">
                <img src={DEFAULT_CLINIC_LOGO} alt="Logo" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md inline-block mb-1">
                  {hospitalName}
                </span>
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Dr. {doctorName}</h1>
                <p className="text-[10px] text-emerald-700 font-extrabold uppercase mt-0.5">{speciality}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-slate-800 uppercase">Treatment Record</p>
              <p className="text-[9px] text-slate-400 font-bold">Authorized OPD Prescription</p>
              <p className="text-[9px] text-slate-500 font-mono mt-1">
                Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Patient Details & Chief Complaints */}
          <div className="border border-slate-100 bg-slate-50/70 rounded-2xl p-4 text-xs space-y-3">
            <div className="grid grid-cols-3 gap-2 border-b border-slate-200/60 pb-2">
              <div>
                <span className="font-extrabold text-slate-400 text-[10px] uppercase block">Patient Name</span>
                <span className="font-black text-slate-900">{appointment?.patientName || 'N/A'}</span>
              </div>
              <div>
                <span className="font-extrabold text-slate-400 text-[10px] uppercase block">Age / Gender</span>
                <span className="font-bold text-slate-800">
                  {appointment?.patientAge || 'N/A'} Yrs &bull; {appointment?.patientGender || 'N/A'}
                </span>
              </div>
              <div>
                <span className="font-extrabold text-slate-400 text-[10px] uppercase block">Booking ID</span>
                <span className="font-mono font-bold text-slate-800">#{appointment?.bookingId || 'N/A'}</span>
              </div>
            </div>

            <div>
              <span className="font-extrabold text-slate-400 text-[10px] uppercase block">Chief Complaints</span>
              <p className="font-bold text-slate-900 text-xs mt-0.5 leading-relaxed">{chiefComplaints || 'N/A'}</p>
            </div>

            <div className="border-t border-slate-200/50 pt-2">
              <span className="font-extrabold text-slate-400 text-[10px] uppercase block">Provisional Diagnosis</span>
              <span className="font-black text-slate-900">{diagnosis.join(', ') || 'N/A'}</span>
            </div>

            {(vitals.bp || vitals.pulse || vitals.temp || vitals.spo2) && (
              <div className="grid grid-cols-4 gap-2 border-t border-slate-200/50 pt-2 text-center">
                {vitals.bp && <div><span className="text-[8px] text-slate-400 font-bold uppercase block">BP</span><span className="font-black text-slate-800">{vitals.bp}</span></div>}
                {vitals.pulse && <div><span className="text-[8px] text-slate-400 font-bold uppercase block">Pulse</span><span className="font-black text-slate-800">{vitals.pulse} bpm</span></div>}
                {vitals.temp && <div><span className="text-[8px] text-slate-400 font-bold uppercase block">Temp</span><span className="font-black text-slate-800">{vitals.temp} °F</span></div>}
                {vitals.spo2 && <div><span className="text-[8px] text-slate-400 font-bold uppercase block">SpO2</span><span className="font-black text-emerald-600">{vitals.spo2}%</span></div>}
              </div>
            )}
          </div>

          {/* Medicines Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden mt-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-emerald-600 text-white font-black">
                  <th className="py-2.5 px-3 w-12 text-center">S.No</th>
                  <th className="py-2.5 px-3">Medicine Formulation</th>
                  <th className="py-2.5 px-3 w-24 text-center">Dosage</th>
                  <th className="py-2.5 px-3 w-32 text-center">Frequency</th>
                  <th className="py-2.5 px-3 w-24 text-center">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stagedMedicines.map((med, idx) => (
                  <tr key={idx} className="h-11">
                    <td className="text-center font-bold text-emerald-600">{idx + 1}</td>
                    <td className="px-3">
                      <p className="font-black text-slate-800">{med.name} {med.strength}</p>
                      {med.instructions && <p className="text-[10px] text-slate-400 italic">{med.instructions}</p>}
                    </td>
                    <td className="text-center font-bold text-slate-700">{med.doseInterval || med.dosage || '—'}</td>
                    <td className="text-center font-medium text-slate-600">{med.frequency || '—'}</td>
                    <td className="text-center font-semibold text-slate-700">{med.duration || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Directives & Advice */}
          {(advisedInvestigations || nextAppointment) && (
            <div className="border border-slate-200 rounded-2xl p-4 bg-white text-xs space-y-2">
              {advisedInvestigations && (
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Advised Investigations</span>
                  <p className="font-bold text-slate-800 mt-0.5">{advisedInvestigations}</p>
                </div>
              )}
              {nextAppointment && (
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Next Follow-up</span>
                  <p className="font-bold text-emerald-700 mt-0.5">{nextAppointment}</p>
                </div>
              )}
            </div>
          )}

          {/* Footer QR & Signature */}
          <div className="flex justify-between items-end pt-4 border-t border-slate-200 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-xl p-1 flex items-center justify-center shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                    `HOSPITAL: ${hospitalName}\nBOOKING: ${appointment?.bookingId}\nPATIENT: ${appointment?.patientName}\nDIAGNOSIS: ${diagnosis.join(', ')}`
                  )}`}
                  alt="QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-[9px] text-slate-400">
                <p className="font-black text-slate-800 text-[10px]">{hospitalName}</p>
                <p>Digital medical record verified via Health Kangaroo.</p>
              </div>
            </div>

            <div className="text-right min-w-[140px]">
              <span className="text-xs font-serif italic text-slate-400 border-b border-dashed border-slate-300 pb-1 px-4 block mb-2">
                Digitally Authorized
              </span>
              <p className="text-xs font-black text-slate-900">Dr. {doctorName}</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase">{speciality}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}