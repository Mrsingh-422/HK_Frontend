"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom'; // Required for screen centering
import toast from 'react-hot-toast';
import UserAPI from '../../../services/UserAPI';
import {
    FiX, FiActivity, FiLayers, FiHome,
    FiDownload, FiSearch, FiRefreshCw, FiChevronLeft, FiChevronRight,
    FiUser, FiMapPin, FiClock, FiCreditCard, FiStar, FiCheckCircle,
    FiUploadCloud, FiTrash2, FiFileText, FiMinus, FiPlus, FiSend, FiArrowLeft, FiLoader
} from 'react-icons/fi';
import { HiStar } from 'react-icons/hi';
import { MdOutlineLocalPharmacy } from 'react-icons/md';
import CostoumPopup from '../../../../lib/CostoumPopup';
import { useRouter } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5002";

// Helper to resolve files and assets from the backend server
const getReportFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    const cleanedPath = path.replace(/^\/+/, '');
    return `${BACKEND_URL}/${cleanedPath}`;
};

// --- SUB-COMPONENT: STEPPER ---
const StatusStepper = ({ status }) => {
    const statusMap = {
        "Prescription Uploaded": 0,
        "Under Review": 0,
        "Tests Added": 0,
        "Pending": 0,
        "Confirmed": 0,
        "Phlebotomist Assigned": 1,
        "Sample Collected": 2,
        "Sample Deposited": 2,
        "Testing": 3,
        "Report Generated": 4,
        "Completed": 4
    };

    const currentStep = statusMap[status] ?? 0;
    const steps = ["Booked", "Assigned", "Collected", "Testing", "Completed"];
    const isCancelled = status === "Cancelled";

    return (
        <div className="w-full py-4 md:py-8 px-1 md:px-2">
            <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
                <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 transition-all duration-700 z-10"
                    style={{ 
                        width: isCancelled ? "100%" : `${(currentStep / (steps.length - 1)) * 100}%`,
                        backgroundColor: isCancelled ? "#f43f5e" : "#4f46e5"
                    }}
                ></div>
                {steps.map((step, index) => {
                    const isCompletedStep = !isCancelled && index <= currentStep;
                    return (
                        <div key={step} className="flex flex-col items-center gap-1.5 md:gap-2 relative z-20">
                            <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 transition-all duration-500 ${
                                isCancelled 
                                    ? "bg-rose-500 border-rose-100 ring-2 md:ring-4 ring-rose-50" 
                                    : isCompletedStep 
                                        ? "bg-indigo-600 border-indigo-100 ring-2 md:ring-4 ring-indigo-50" 
                                        : "bg-white border-slate-200"
                            }`} />
                            <span className={`text-[7.5px] md:text-[8px] font-black uppercase tracking-tighter whitespace-nowrap ${
                                isCancelled 
                                    ? "text-rose-500" 
                                    : isCompletedStep 
                                        ? "text-slate-900" 
                                        : "text-slate-400"
                            }`}>
                                {isCancelled && index === steps.length - 1 ? "Cancelled" : step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default function PrescriptionFlow() {
    // 1: Upload, 2: Review, 3: Address Selection, 4: Pharmacy Selection
    const [step, setStep] = useState(1);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [medicines, setMedicines] = useState([]);
    const [scanMeta, setScanSummary] = useState({ doctor: "", date: "" });

    const [filePreview, setFilePreview] = useState(null);
    const [rawFile, setRawFile] = useState(null); // Added to store binary file for final submission
    const [manualInput, setManualInput] = useState("");
    const [durationMode, setDurationType] = useState("prescription");
    const [globalDays, setGlobalDays] = useState(7);
    const [zoomedImage, setZoomedImage] = useState(null); // State for fullscreen preview

    // --- MANUAL MEDICINE AUTOCOMPLETE STATES ---
    const [manualSuggestions, setManualSuggestions] = useState([]);
    const [showManualSuggestions, setShowManualSuggestions] = useState(false);
    const [isSearchingManual, setIsSearchingManual] = useState(false);
    const manualSearchRef = useRef(null);

    // --- ADDRESS STATE ---
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

    // --- PHARMACY STATE ---
    const [pharmacies, setPharmacies] = useState([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const [isLoadingPharmacies, setIsLoadingPharmacies] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef(null);
    const router = useRouter();

    // Verify user authorization on mount
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            CostoumPopup("Please Login To Continue", "warning", 4000);
            router.push('/');
            return;
        }
    }, [router]);

    // Fetch addresses when moving toward address selection
    useEffect(() => {
        if (step === 3 && addresses.length === 0) {
            fetchAddresses();
        }
    }, [step, addresses.length]);

    // Fetch local pharmacies when arriving at step 4
    useEffect(() => {
        if (step === 4) {
            fetchNearbyPharmacies();
        }
    }, [step]);

    // --- DEBOUNCE AND FETCH MANUAL MEDICINE SUGGESTIONS ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (manualInput.trim().length >= 2) {
                setIsSearchingManual(true);
                try {
                    const res = await UserAPI.searchMedicineSuggestions({ query: manualInput });
                    if (res?.success) {
                        setManualSuggestions(res.data || []);
                        setShowManualSuggestions(true);
                    }
                } catch (error) {
                    console.error("Manual search suggestion fetch failed:", error);
                } finally {
                    setIsSearchingManual(false);
                }
            } else {
                setManualSuggestions([]);
                setShowManualSuggestions(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [manualInput]);

    // --- DISMISS AUTOCMPLETE ON OUTSIDE CLICK ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (manualSearchRef.current && !manualSearchRef.current.contains(event.target)) {
                setShowManualSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchAddresses = async () => {
        setIsLoadingAddresses(true);
        try {
            const response = await UserAPI.getUserAddresses();
            if (response.success && response.data) {
                setAddresses(response.data);
                const defaultAddr = response.data.find(addr => addr.isDefault) || response.data[0];
                setSelectedAddress(defaultAddr);
            }
        } catch (error) {
            console.error("Error fetching user addresses:", error);
        } finally {
            setIsLoadingAddresses(false);
        }
    };

    const fetchNearbyPharmacies = async () => {
        setIsLoadingPharmacies(true);
        try {
            let lat = 30.73801886597137; // Default fallback lat
            let lng = 76.66057655388279; // Default fallback lng

            const storedCoords = localStorage.getItem("userCoords");
            if (storedCoords) {
                try {
                    const parsed = JSON.parse(storedCoords);
                    if (parsed.lat && parsed.lng) {
                        lat = parsed.lat;
                        lng = parsed.lng;
                    }
                } catch (e) {
                    console.error("Failed to parse userCoords from localStorage", e);
                }
            }

            const payload = {
                lat: lat,
                lng: lng,
                search: ""
            };

            const response = await UserAPI.getAllPharmacies(payload);

            if (response.success && response.data) {
                setPharmacies(response.data);
            } else if (Array.isArray(response)) {
                setPharmacies(response);
            }
        } catch (error) {
            console.error("Error getting pharmacies:", error);
        } finally {
            setIsLoadingAddresses(false);
            setIsLoadingPharmacies(false);
        }
    };

    // --- SUBMIT REQUEST HANDLER ---
    const handleSendRequest = async () => {
        if (!selectedPharmacy || !selectedAddress || !rawFile) {
            alert("Missing required information (Pharmacy, Address, or Prescription Image)");
            return;
        }

        setIsSubmitting(true);
        try {
            // Prepare the requested medicines array
            const requestedMeds = medicines.map(med => ({
                name: med.name,
                days: durationMode === "prescription" ? globalDays : med.days,
                dosage: med.dosage || "1-0-1"
            }));

            // Construct FormData as per requirements
            const formData = new FormData();
            formData.append("prescriptionImage", rawFile);
            formData.append("pharmacyId", selectedPharmacy._id);
            formData.append("doctorName", scanMeta.doctor || "Prescription Request");
            formData.append("durationType", durationMode === "prescription" ? "Full Course" : "Custom");
            formData.append("requestedMedicines", JSON.stringify(requestedMeds));
            formData.append("address", JSON.stringify(selectedAddress));

            // Call the API function
            const response = await UserAPI.createPrescriptionRequest(formData);

            if (response.success) {
                router.push("/userscreens/previousorders"); // Redirect to orders page

                // Reset flow
                setStep(1);
                setMedicines([]);
                setRawFile(null);
                setFilePreview(null);
                setSelectedPharmacy(null);
            } else {
                alert(response.message || "Failed to submit request.");
            }

        } catch (error) {
            console.error("Error sending pharmacy request:", error);
            alert("Failed to submit request. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- STEP 1: API INTEGRATION ---
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setRawFile(file); // Store the binary file
        setFilePreview(URL.createObjectURL(file));
        setIsAnalyzing(true);
        setStep(2);

        try {
            const formData = new FormData();
            formData.append("prescriptionFile", file);

            const response = await UserAPI.scanPrescription(formData);

            if (response.success) {
                const { doctorName, prescriptionDate, detectedMedicines } = response.data;
                setScanSummary({ doctor: doctorName, date: prescriptionDate });

                const formattedMeds = detectedMedicines.map((med, index) => ({
                    id: med.medicineId || `ai-${index}-${Date.now()}`,
                    name: med.name,
                    days: med.aiInstruction?.duration
                        ? parseInt(med.aiInstruction.duration.replace(/\D/g, ''))
                        : 7,
                    dosage: med.aiInstruction?.dosage || "1-0-1",
                    mrp: med.mrp
                }));
                setMedicines(formattedMeds);
            }
        } catch (error) {
            if (error.response) {
                console.error("DEBUG: Server Error Data:", error.response.data);
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    // --- STEP 2: LOGIC ---
    const addManualMedicine = (e) => {
        e.preventDefault();
        if (!manualInput.trim()) return;
        setMedicines([...medicines, {
            id: `manual-${Date.now()}`,
            name: manualInput,
            days: durationMode === "prescription" ? globalDays : 7,
            dosage: "1-0-1"
        }]);
        setManualInput("");
    };

    const updateDays = (id, val) => {
        setMedicines(prev => prev.map(m => m.id === id ? { ...m, days: Math.max(1, m.days + val) } : m));
    };

    const removeMed = (id) => setMedicines(prev => prev.filter(m => m.id !== id));


    // --- RENDER STEP 3: ADDRESS SELECTION ---
    // --- RENDER STEP 3: ADDRESS SELECTION ---
    if (step === 3) return (
        <div className="min-h-screen bg-slate-50 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="bg-white px-8 py-6 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center gap-4">
                    <button onClick={() => setStep(2)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-all text-slate-600">
                        <FiArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Delivery Address</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Where should we drop off your medicine?</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-8">
                {isLoadingAddresses ? (
                    <div className="flex flex-col items-center justify-center py-20 text-emerald-600 font-bold text-sm uppercase tracking-wider gap-3">
                        <FiLoader className="animate-spin text-3xl" />
                        Retrieving saved addresses...
                    </div>
                ) : (
                    <div className="space-y-6">
                        
                        {/* Header Section with Quick Add Button */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em]">Select From Saved Locations</div>
                            <button 
                                onClick={() => router.push('/userscreens/myaccount')}
                                className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-xs"
                            >
                                <FiPlus size={12} /> Add New Address
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map((address) => {
                                const isSelected = selectedAddress?._id === address._id;
                                return (
                                    <div
                                        key={address._id}
                                        onClick={() => setSelectedAddress(address)}
                                        className={`bg-white p-6 rounded-[28px] border-2 transition-all cursor-pointer relative flex flex-col justify-between hover:shadow-lg
                                            ${isSelected
                                                ? "border-emerald-500 shadow-xl shadow-emerald-500/5 bg-emerald-50/10"
                                                : "border-slate-200"}`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider
                                                    ${isSelected ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                                                    {address.addressType || "Address"}
                                                </span>
                                                <FiHome size={18} className={isSelected ? "text-emerald-500" : "text-slate-400"} />
                                            </div>
                                            <h3 className="font-black text-slate-800 text-base mb-1">{address.name}</h3>
                                            <p className="text-xs font-bold text-slate-400 mb-3">{address.phone}</p>
                                            <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                                {address.houseNo}, Sector {address.sector}, {address.landmark && `${address.landmark}, `}
                                                {address.city}, {address.state} - {address.pincode}
                                            </p>
                                        </div>

                                        {isSelected && (
                                            <div className="mt-4 pt-4 border-t border-emerald-100 flex justify-end">
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                                    ✓ Selected Location
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* DASHED GRID CARD: ADD NEW ADDRESS */}
                            <div
                                onClick={() => router.push('/userscreens/myaccount')}
                                className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[28px] p-6 hover:border-emerald-500 hover:bg-emerald-50/10 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[220px] group text-center"
                            >
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all shadow-sm border border-slate-100 mb-3">
                                    <FiPlus size={20} />
                                </div>
                                <h3 className="font-black text-slate-800 text-sm mb-1 uppercase tracking-wider">Add New Address</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[180px]">Manage locations inside your account profile</p>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button
                                disabled={!selectedAddress}
                                onClick={() => setStep(4)}
                                className={`px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.25em] transition-all shadow-xl flex items-center gap-3
                                    ${selectedAddress
                                        ? "bg-slate-900 text-white hover:bg-emerald-600"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                            >
                                Proceed to Pharmacies <FiChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );


    // --- RENDER STEP 4: PHARMACY SELECTION WITH REQUEST ACTIONS ---
    if (step === 4) return (
        <div className="min-h-screen bg-slate-50 pb-28 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="bg-white px-8 py-6 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center gap-4">
                    <button onClick={() => setStep(3)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-all text-slate-600">
                        <FiArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Local Pharmacies</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select a vendor to fulfill order</p>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Summary Card Left */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden sticky top-28 space-y-6">
                        <div className="absolute right-[-10px] bottom-[-10px] opacity-10 text-emerald-400"><MdOutlineLocalPharmacy size={160} /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.2em]">Ready to order</p>
                            <p className="text-3xl font-black mt-1">{medicines.length} Medicines</p>
                            <p className="text-sm text-slate-400 mt-1 font-medium italic">Average delivery time: 45 mins</p>
                        </div>

                        {/* Selected Address Summary Block */}
                        {selectedAddress && (
                            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-800">
                                <div className="flex items-center gap-2 text-[9px] font-black text-emerald-400 uppercase tracking-wider mb-1">
                                    <FiMapPin /> Delivering To ({selectedAddress.addressType})
                                </div>
                                <p className="text-xs font-bold text-slate-200 truncate">{selectedAddress.name}</p>
                                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                                    {selectedAddress.houseNo}, Sector {selectedAddress.sector}, {selectedAddress.city}
                                </p>
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-800 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                            {medicines.map((m) => (
                                <div key={m.id} className="text-xs text-slate-300 flex justify-between">
                                    <span className="truncate max-w-[180px] font-medium">✓ {m.name}</span>
                                    <span className="text-slate-500 font-bold">{durationMode === "prescription" ? globalDays : m.days}d</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Vendors Right */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-2">Nearby Featured Vendors</div>

                    {isLoadingPharmacies ? (
                        <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-[32px] p-20 text-emerald-600 font-bold text-xs uppercase tracking-widest gap-2">
                            <FiLoader className="animate-spin text-2xl" /> Finding nearby stores...
                        </div>
                    ) : pharmacies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center bg-white border border-dashed border-slate-200 rounded-[32px] p-20 text-slate-400 font-bold text-xs uppercase tracking-widest">
                            No pharmacies found around your active coordinates.
                        </div>
                    ) : (
                        pharmacies.map((pharma, i) => {
                            const isSelected = selectedPharmacy?._id === pharma._id || (selectedPharmacy?.name === pharma.name);
                            return (
                                <div
                                    key={pharma._id || i}
                                    onClick={() => setSelectedPharmacy(pharma)}
                                    className={`bg-white p-6 rounded-[24px] border-2 flex items-center justify-between group transition-all cursor-pointer hover:shadow-xl
                                        ${isSelected
                                            ? "border-emerald-500 shadow-xl shadow-emerald-500/5 bg-emerald-50/5"
                                            : "border-slate-200"}`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-colors
                                            ${isSelected ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"}`}>
                                            {pharma.name ? pharma.name.charAt(0) : "P"}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 text-base">{pharma.name}</h3>
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                                                <span className="flex items-center gap-1">
                                                    <FiMapPin className="text-emerald-500" />
                                                    {pharma.distance ? `${parseFloat(pharma.distance).toFixed(1)} km` : `${pharma.dist || pharma.city || 'Nearby'}`}
                                                </span>
                                                <span className="flex items-center gap-1 text-amber-500">
                                                    <FiStar className="fill-amber-500" /> {pharma.rating || "4.5"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FiClock /> {pharma.time || pharma.deliveryTime || "30-45 mins"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                                        ${isSelected ? "bg-emerald-600 text-white scale-110" : "bg-slate-50 text-slate-300 group-hover:bg-emerald-600 group-hover:text-white"}`}>
                                        {isSelected ? <FiCheckCircle size={18} /> : <FiChevronRight size={20} />}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            {/* Bottom Sticky Action Bar when a Pharmacy is selected */}
            {selectedPharmacy && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-8 py-4 shadow-2xl z-20 animate-in slide-in-from-bottom duration-300">
                    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Selected Vendor</p>
                            <h4 className="text-base font-black text-slate-900">{selectedPharmacy.name}</h4>
                        </div>
                        <button
                            disabled={isSubmitting}
                            onClick={handleSendRequest}
                            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10"
                        >
                            {isSubmitting ? (
                                <>
                                    <FiLoader className="animate-spin" /> Dispatching...
                                </>
                            ) : (
                                <>
                                    Send Request <FiSend />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">
                            {step === 1 ? "Upload RX" : "Review Items"}
                        </h1>
                        <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] mt-2">
                            AI-Powered Pharmacy Flow
                        </p>
                    </div>
                    {step === 2 && (
                        <button onClick={() => { setStep(1); setMedicines([]); setRawFile(null); }} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all">
                            <FiTrash2 size={16} />
                        </button>
                    )}
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-8 mt-8">
                {step === 1 ? (
                    /* Web Optimized Step 1 - Centered Card Container */
                    <div className="max-w-2xl mx-auto space-y-6 pt-12 animate-in fade-in zoom-in-95 duration-500">
                        <div
                            onClick={() => fileInputRef.current.click()}
                            className="bg-white border-4 border-dashed border-slate-200 rounded-[40px] p-20 text-center hover:border-emerald-500 hover:bg-emerald-50/20 transition-all cursor-pointer group shadow-sm"
                        >
                            <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
                            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">
                                <FiUploadCloud size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Select Prescription</h3>
                            <p className="text-slate-400 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Automatic medicine detection</p>
                        </div>
                        <div className="flex items-center gap-4 py-2 text-slate-300 uppercase font-black text-[10px] tracking-widest">
                            <div className="h-px bg-slate-200 flex-1"></div> Or <div className="h-px bg-slate-200 flex-1"></div>
                        </div>
                        <button onClick={() => setStep(2)} className="w-full py-5 bg-white border border-slate-200 rounded-[24px] text-slate-800 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                            Add Items Manually
                        </button>
                    </div>
                ) : (
                    /* Web Optimized Step 2 - Two Column Desktop Grid Layout */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Left Side: Parameters & Configuration Controls (4/12 Columns) */}
                        <div className="lg:col-span-4 space-y-6">

                            {/* Prescription Preview Card */}
                            {filePreview && (
                                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Your Prescription</p>
                                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                                        <img 
                                            src={filePreview} 
                                            className="max-h-full max-w-full object-contain cursor-zoom-in hover:opacity-95 transition-opacity" 
                                            alt="Prescription preview"
                                            onClick={() => setZoomedImage(filePreview)}
                                        />
                                    </div>
                                    <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-wider">Click to view full screen</p>
                                </div>
                            )}

                            {/* AI Detection Meta Box */}
                            {!isAnalyzing && scanMeta.doctor && (
                                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><FiUser /></div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Detected Doctor</p>
                                            <p className="text-sm font-black text-slate-800 mt-1">{scanMeta.doctor}</p>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RX Date</span>
                                        <span className="text-xs font-black text-slate-800">{scanMeta.date}</span>
                                    </div>
                                </div>
                            )}

                            {/* Duration Configuration Switcher */}
                            <div className="bg-white rounded-[28px] p-2 border border-slate-200 shadow-sm flex flex-col gap-2">
                                <button
                                    onClick={() => setDurationType("prescription")}
                                    className={`w-full py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                    ${durationMode === 'prescription' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"}`}
                                >
                                    <FiFileText size={14} /> Global Duration
                                </button>
                                <button
                                    onClick={() => setDurationType("custom")}
                                    className={`w-full py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                    ${durationMode === 'custom' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"}`}
                                >
                                    <FiClock size={14} /> Custom Item Days
                                </button>
                            </div>

                            {/* Global Duration Controller Accent Box */}
                            {durationMode === "prescription" && (
                                <div className="bg-emerald-600 rounded-[32px] p-6 text-white flex flex-col justify-between shadow-xl shadow-emerald-600/10 h-44 relative overflow-hidden">
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest opacity-80">Total Order Days</h4>
                                        <p className="text-4xl font-black mt-1">{globalDays} Days</p>
                                    </div>
                                    <div className="flex items-center justify-between bg-white/10 p-2 rounded-2xl mt-4">
                                        <button onClick={() => setGlobalDays(Math.max(1, globalDays - 1))} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"><FiMinus size={16} /></button>
                                        <span className="text-xs font-bold">Adjust Global Count</span>
                                        <button onClick={() => setGlobalDays(globalDays + 1)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"><FiPlus size={16} /></button>
                                    </div>
                                </div>
                            )}

                            {/* Submit CTA button */}
                            <button
                                disabled={medicines.length === 0 || isAnalyzing}
                                onClick={() => setStep(3)}
                                className={`w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.25em] transition-all shadow-xl flex items-center justify-center gap-3
                                    ${medicines.length > 0 && !isAnalyzing
                                        ? "bg-emerald-600 text-white shadow-emerald-600/10 hover:bg-slate-900"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                            >
                                Select Address <FiChevronRight />
                            </button>
                        </div>

                        {/* Right Side: Medicine Dynamic List (8/12 Columns) */}
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                                        <FiCheckCircle className="text-emerald-600" /> Confirmed Items ({medicines.length})
                                    </h3>
                                    {isAnalyzing && (
                                        <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase animate-pulse">
                                            <FiLoader className="animate-spin" /> AI Analyzing...
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 flex-1 space-y-3 max-h-[550px] overflow-y-auto custom-scrollbar">
                                    {medicines.length === 0 && !isAnalyzing ? (
                                        <div className="h-48 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                                            <p className="text-xs font-bold uppercase tracking-wider">No medicines added yet.</p>
                                        </div>
                                    ) : (
                                        medicines.map((med) => (
                                            <div key={med.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-[20px] border border-slate-100 hover:border-slate-200 transition-all">
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{med.name}</p>
                                                    {durationMode === "prescription" ? (
                                                        <p className="text-[10px] font-bold text-emerald-600 uppercase mt-0.5">Inheriting {globalDays} Days</p>
                                                    ) : (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <button onClick={() => updateDays(med.id, -1)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"><FiMinus size={10} /></button>
                                                            <span className="text-xs font-black text-slate-700 min-w-[48px] text-center">{med.days} Days</span>
                                                            <button onClick={() => updateDays(med.id, 1)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"><FiPlus size={10} /></button>
                                                        </div>
                                                    )}
                                                </div>
                                                <button onClick={() => removeMed(med.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors shrink-0">
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Form Sticky Footer inside content panel */}
                                <div className="p-6 bg-slate-50 border-t border-slate-100 relative" ref={manualSearchRef}>
                                    <form onSubmit={addManualMedicine} className="flex items-center gap-3 relative">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                placeholder="Add more medicines manually..."
                                                className="w-full bg-white border-none rounded-xl py-4 px-6 text-sm font-semibold outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all"
                                                value={manualInput}
                                                onChange={(e) => setManualInput(e.target.value)}
                                                onFocus={() => manualSuggestions.length > 0 && setShowManualSuggestions(true)}
                                            />
                                            {isSearchingManual && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <FiRefreshCw className="animate-spin text-emerald-600 text-xs" />
                                                </div>
                                            )}
                                        </div>
                                        <button type="submit" className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all shadow-md shrink-0">
                                            <FiPlus size={20} />
                                        </button>
                                    </form>

                                    {/* AUTOCOMPLETE SUGGESTIONS OVERLAY */}
                                    {showManualSuggestions && manualSuggestions.length > 0 && (
                                        <div className="absolute bottom-[105%] left-6 right-20 bg-white rounded-2xl shadow-[0_-15px_40px_rgba(15,23,42,0.15)] border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200">
                                            <div className="max-h-[220px] overflow-y-auto custom-scrollbar py-1">
                                                {manualSuggestions.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => {
                                                            setMedicines(prev => [...prev, {
                                                                id: `manual-${Date.now()}-${item.id}`,
                                                                name: item.name,
                                                                days: durationMode === "prescription" ? globalDays : 7,
                                                                dosage: "1-0-1"
                                                            }]);
                                                            setManualInput("");
                                                            setManualSuggestions([]);
                                                            setShowManualSuggestions(false);
                                                        }}
                                                        className="px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors flex justify-between items-center border-b border-slate-50 last:border-0"
                                                    >
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate mt-0.5">{item.salt || "Standard Formula"}</p>
                                                        </div>
                                                        <span className="text-xs font-black text-emerald-600 shrink-0">₹{item.price}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                    </div>
                )}
            </main>

            {/* LIGHTBOX FOR PRESCRIPTION PREVIEW */}
            {zoomedImage && (
                <div 
                    className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
                    onClick={() => setZoomedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
                        <button 
                            onClick={() => setZoomedImage(null)}
                            className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors flex items-center justify-center"
                        >
                            <span className="text-white font-bold text-xl">×</span>
                        </button>
                        <img 
                            src={zoomedImage} 
                            className="max-w-full max-h-full object-contain rounded-2xl animate-in zoom-in-95 duration-200 cursor-default" 
                            alt="Zoomed Prescription"
                            onClick={(e) => e.stopPropagation()} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}