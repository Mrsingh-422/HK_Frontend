'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import UserAPI from '@/app/services/UserAPI'; // Adjust this import path to match your project structure
import { 
  FaFlask, FaUpload, FaUserCircle, FaMapMarkerAlt, FaFileMedical, 
  FaClinicMedical, FaCheckCircle, FaTimes, FaChevronRight,
  FaChevronLeft, FaStar, FaRegClock, FaChevronDown
} from 'react-icons/fa';
import { FiLoader, FiUploadCloud, FiTrash2, FiUser, FiClock, FiPlus, FiChevronRight as FiChevronRightIcon } from 'react-icons/fi';

export default function LabPrescriptionBookingPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // ==========================================
  // 🌟 LOADING & NOTIFICATION STATES
  // ==========================================
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // ==========================================
  // 🌟 WIZARD STEPPER STATE (REORGANIZED)
  // ==========================================
  // 1: Upload & Scan, 2: Lab, 3: Patients, 4: Delivery & Confirm, 5: Success
  const [step, setStep] = useState(1); 

  // ==========================================
  // 🌟 API CONTEXT DATA STATES
  // ==========================================
  const [labs, setLabs] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [addresses, setAddresses] = useState([]);

  // ==========================================
  // 🌟 SELECTION/FORM STATES
  // ==========================================
  const [selectedLab, setSelectedLab] = useState(null);
  
  // Prescription Scan & Review States (Matching PrescriptionFlow Pattern)
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedTests, setDetectedTests] = useState([]);
  const [scanMeta, setScanMeta] = useState({ doctor: "", date: "" });
  const [manualInput, setManualInput] = useState("");
  const [zoomedImage, setZoomedImage] = useState(null); // Fullscreen preview state

  const [selectedPatientIds, setSelectedPatientIds] = useState([]); // Array of string IDs
  const [collectionType, setCollectionType] = useState('Home Collection'); // 'Home Collection' | 'Visit Lab'
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Fetch initial baseline details on mount
  useEffect(() => {
    fetchBaselineData();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const fetchBaselineData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Labs (getLabsList API) - Mocking location coords for Mohali/SAS Nagar region
      const labsRes = await UserAPI.getLabsList({ lat: 30.7046, lng: 76.7179 });
      if (labsRes.success) {
        setLabs(labsRes.data || []);
      }

      // 2. Fetch Family Members (getFamilyMembers API)
      const familyRes = await UserAPI.getFamilyMembers();
      if (familyRes.success) {
        setFamilyMembers(familyRes.data || []);
      }

      // 3. Fetch Addresses (getUserAddresses API)
      const addressRes = await UserAPI.getUserAddresses();
      if (addressRes.success) {
        setAddresses(addressRes.data || []);
        if (addressRes.data?.length > 0) {
          setSelectedAddress(addressRes.data[0]); // Default to first address
        }
      }
    } catch (err) {
      console.error("Baseline fetch error:", err);
      showNotification("Could not retrieve setup data. Please reload page.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLE FILE UPLOAD & AI SCAN TRIGGER (API /user/labs/scan-rx) ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPrescriptionFile(file); // Store binary file for the final submission
    setPrescriptionPreview(URL.createObjectURL(file));
    setIsAnalyzing(true);
    setStep(1); // Keep on Step 1, but toggle to show the scan details list

    try {
      const formData = new FormData();
      formData.append("prescriptionFile", file); // Expected binary field key

      // Execute AI scan request
      const response = await UserAPI.scanLabPrescription(formData);

      // Accessing response.data because the scanLabPrescription returns the raw Axios response
      const apiResponse = response.data;

      if (apiResponse && apiResponse.success && apiResponse.data) {
        const { doctorName, prescriptionDate, detectedTests } = apiResponse.data;
        setScanMeta({ 
          doctor: doctorName || "AI Extracted Doctor", 
          date: prescriptionDate || "Today" 
        });

        const formattedTests = (detectedTests || []).map((test, index) => ({
          masterId: test.masterId || `ai-test-${index}-${Date.now()}`,
          name: test.name,
          testCode: test.testCode || "N/A",
          mainCategory: test.mainCategory || "Pathology",
          category: test.category || "General",
          standardMRP: test.standardMRP || 0,
          pretestPreparation: test.pretestPreparation || "No specific preparation required",
          productType: test.productType || "LabTest"
        }));
        setDetectedTests(formattedTests);
        showNotification("AI Prescription Scan Complete!", "success");
      }
    } catch (error) {
      console.error("Scan prescription error:", error);
      showNotification("AI scanning failed. You can still input tests manually.", "error");
      setScanMeta({ doctor: "Manual Upload", date: "Today" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- MANUAL TEST MANAGEMENT LOGIC ---
  const addManualTest = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    setDetectedTests([...detectedTests, {
      masterId: `manual-${Date.now()}`,
      name: manualInput,
      testCode: "MANUAL",
      mainCategory: "General",
      category: "General",
      standardMRP: 0,
      pretestPreparation: "No specific preparation required",
      productType: "LabTest"
    }]);
    setManualInput("");
  };

  const removeTest = (id) => {
    setDetectedTests(prev => prev.filter(t => t.masterId !== id));
  };

  // --- MANAGE PATIENTS SELECTION ARRAY ---
  const handleTogglePatient = (id) => {
    setSelectedPatientIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // --- SUBMIT PRESCRIPTION REQUEST (API 3) ---
  const handleFormSubmission = async (e) => {
    e.preventDefault();

    if (!selectedLab?._id) return showNotification("Please select a target Laboratory.", "error");
    if (!prescriptionFile) return showNotification("Prescription file is mandatory.", "error");
    if (selectedPatientIds.length === 0) return showNotification("Please select at least one patient.", "error");
    if (collectionType === 'Home Collection' && !selectedAddress) {
      return showNotification("Delivery address is required for Home Collection.", "error");
    }

    setSubmitting(true);
    const fd = new FormData();

    // Append mandatory multipart file
    fd.append('prescriptionImage', prescriptionFile);

    // Append standard payload strings
    fd.append('labId', selectedLab._id);
    fd.append('collectionType', collectionType);

    // Patients array needs to be stringified JSON
    fd.append('patients', JSON.stringify(selectedPatientIds));

    // Address needs to be stringified JSON matching delivery location schema
    let targetAddress = {};
    if (collectionType === 'Home Collection' && selectedAddress) {
      targetAddress = {
        addressType: selectedAddress.addressType,
        name: selectedAddress.name || "Self",
        phone: selectedAddress.phone,
        houseNo: `House ${selectedAddress.houseNo}, Sector ${selectedAddress.sector}`,
        city: selectedAddress.city,
        pincode: selectedAddress.pincode
      };
    } else {
      // Fallback details if visiting lab
      targetAddress = {
        addressType: "Visit Lab",
        name: "Self",
        phone: "N/A",
        houseNo: selectedLab.address,
        city: selectedLab.city,
        pincode: selectedLab.pincode || ""
      };
    }
    fd.append('address', JSON.stringify(targetAddress));

    // Map and append the tests array formatted exactly as requested
    const requestedTestsPayload = detectedTests.map(test => ({
      name: test.name,
      _id: test.masterId
    }));
    fd.append('requestedTests', JSON.stringify(requestedTestsPayload));

    try {
      const response = await UserAPI.submitLabPrescriptionRequest(fd);
      if (response.success) {
        showNotification("Prescription request placed successfully!", "success");
        setStep(5); // Move to Success Screen
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Inquiry submission failed. Try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = ["1. Upload & Scan", "2. Select Lab", "3. Assign Patients", "4. Confirm Delivery"];

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900 selection:bg-green-100">
      
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-5 right-5 z-[150] flex items-center p-4 rounded-xl shadow-lg border transition-all duration-300 max-w-sm ${
          notification.type === 'error' 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="mr-3 font-semibold text-xs uppercase">
            {notification.type === 'error' ? 'Error' : 'Success'}
          </div>
          <div className="text-sm font-medium">{notification.message}</div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        
        {/* Header Block */}
        {step < 5 && (
          <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Upload Lab Prescription</h1>
            <p className="mt-1.5 text-sm text-slate-500">Provide your doctor's prescriptions to receive diagnostic suggestions and verified estimates.</p>
            
            {/* Stepper Status Indicator */}
            <div className="flex items-center gap-2 mt-6">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="flex-1 flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                    step === num 
                      ? 'bg-[#08B36A] text-white border-[#08B36A] shadow-md shadow-green-100' 
                      : step > num 
                        ? 'bg-[#e6f7eb] text-[#08B36A] border-[#e6f7eb]' 
                        : 'bg-white text-slate-400 border-slate-200'
                  }`}>
                    {step > num ? <FaCheckCircle size={14} /> : num}
                  </div>
                  <span className={`hidden sm:inline text-xs font-bold ${step === num ? 'text-slate-800' : 'text-slate-400'}`}>
                    {stepLabels[num - 1]}
                  </span>
                  {num < 4 && <FaChevronRight className="text-slate-300" size={10} />}
                </div>
              ))}
            </div>
          </header>
        )}

        {/* STEPPER VIEWS CONTAINER */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          
          {/* ========================================= */}
          {/* 🌟 STEP 1: UPLOAD & REVIEW (AI SCANNED)   */}
          {/* ========================================= */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Prescription Upload Card View */}
              {!prescriptionFile ? (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 max-w-2xl mx-auto pt-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 text-center">1. Upload Prescription Media</h3>
                    <p className="text-xs text-slate-500 text-center mt-1">Attach the clear image file of your medical prescriptions to begin scanning.</p>
                  </div>

                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="border-4 border-dashed border-slate-200 rounded-[40px] p-20 text-center hover:border-[#08B36A] hover:bg-emerald-50/20 transition-all cursor-pointer group shadow-sm"
                  >
                    <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">
                      <FiUploadCloud size={40} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Select Prescription</h3>
                    <p className="text-slate-400 mt-2 text-xs font-bold uppercase tracking-[0.2em]">Automatic diagnostics detection</p>
                  </div>

                  <div className="flex items-center gap-4 py-2 text-slate-300 uppercase font-black text-[10px] tracking-widest">
                    <div className="h-px bg-slate-200 flex-1"></div> Or <div className="h-px bg-slate-200 flex-1"></div>
                  </div>
                  <button onClick={() => setStep(1)} className="w-full py-5 bg-white border border-slate-200 rounded-[24px] text-slate-800 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                    Add Items Manually
                  </button>

                  <div className="flex justify-between pt-4 border-t border-slate-50">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-2.5 border rounded-xl text-slate-500 text-xs font-bold hover:bg-slate-50"
                    >
                      Previous
                    </button>
                  </div>
                </div>
              ) : (
                /* Dual Column Diagnostic Setup (Matches PrescriptionFlow Aesthetics) */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  {/* Left Column: Image previews and Doctor summary (4/12 Grid) */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Prescription Card Preview */}
                    {prescriptionPreview && (
                      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Your Prescription</p>
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                          <img 
                            src={prescriptionPreview} 
                            className="max-h-full max-w-full object-contain cursor-zoom-in hover:opacity-95 transition-opacity" 
                            alt="Prescription preview"
                            onClick={() => setZoomedImage(prescriptionPreview)}
                          />
                        </div>
                        <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-wider">Click to view full screen</p>
                      </div>
                    )}

                    {/* AI Scan Meta details card */}
                    {!isAnalyzing && scanMeta.doctor && (
                      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-50 text-[#08B36A] rounded-full flex items-center justify-center"><FiUser /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Prescribing Doctor</p>
                            <p className="text-sm font-black text-slate-800 mt-1">{scanMeta.doctor}</p>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RX Date</span>
                          <span className="text-xs font-black text-slate-800">{scanMeta.date}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setPrescriptionFile(null); setPrescriptionPreview(""); setDetectedTests([]); }}
                        className="px-4 py-4 border border-slate-200 text-slate-500 rounded-2xl text-xs font-bold hover:bg-slate-50 transition"
                      >
                        Reset File
                      </button>
                      <button
                        disabled={detectedTests.length === 0 || isAnalyzing}
                        onClick={() => setStep(2)}
                        className={`flex-1 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.25em] transition-all shadow-xl flex items-center justify-center gap-3
                          ${detectedTests.length > 0 && !isAnalyzing
                            ? "bg-[#08B36A] text-white shadow-green-150 hover:bg-slate-900"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                      >
                        Select Laboratory <FiChevronRightIcon size={10} />
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Detected tests & manual addition items (8/12 Grid) */}
                  <div className="lg:col-span-8">
                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
                          <FaCheckCircle className="text-[#08B36A]" /> Extracted Labs tests ({detectedTests.length})
                        </h3>
                        {isAnalyzing && (
                          <div className="flex items-center gap-2 text-[#08B36A] text-[10px] font-black uppercase animate-pulse">
                            <FiLoader className="animate-spin" /> AI scanning prescription...
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex-1 space-y-3 max-h-[550px] overflow-y-auto custom-scrollbar">
                        {detectedTests.length === 0 && !isAnalyzing ? (
                          <div className="h-48 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                            <p className="text-xs font-bold uppercase tracking-wider">No diagnostic tests added yet.</p>
                          </div>
                        ) : (
                          detectedTests.map((test) => (
                            <div key={test.masterId} className="flex items-center justify-between p-4 bg-slate-50 rounded-[20px] border border-slate-100 hover:border-slate-200 transition-all">
                              <div className="flex-1 min-w-0 pr-4">
                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{test.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{test.mainCategory} | {test.category}</p>
                              </div>
                              <button onClick={() => removeTest(test.masterId)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors shrink-0">
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Manual Add Input Box inside Card Footer */}
                      <div className="p-6 bg-slate-50 border-t border-slate-100">
                        <form onSubmit={addManualTest} className="flex items-center gap-3">
                          <input
                            type="text"
                            placeholder="Add more test procedures manually..."
                            className="flex-1 bg-white border-none rounded-xl py-4 px-6 text-sm font-semibold outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all text-xs"
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                          />
                          <button type="submit" className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-[#08B36A] transition-all shadow-md shrink-0">
                            <FiPlus size={20} />
                          </button>
                        </form>
                      </div>

                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* ========================================= */}
          {/* 🌟 STEP 2: SELECT LABORATORY             */}
          {/* ========================================= */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">2. Select Partner Laboratory</h3>
                <p className="text-xs text-slate-500">Select the facility where your clinical sample will be processed.</p>
              </div>

              {loading ? (
                <div className="py-20 text-center text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-[#08B36A]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Locating nearby labs...
                </div>
              ) : labs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {labs.map((lab) => (
                    <div 
                      key={lab._id}
                      onClick={() => setSelectedLab(lab)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 relative ${
                        selectedLab?._id === lab._id 
                          ? 'border-[#08B36A] bg-green-50/15' 
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {selectedLab?._id === lab._id && (
                        <span className="absolute top-4 right-4 text-[#08B36A] bg-[#e6f7eb] p-1 rounded-full border border-[#08B36A]/10">
                          <FaCheckCircle size={14} />
                        </span>
                      )}
                      
                      {/* Lab Profile Logo */}
                      <div className="w-14 h-14 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                        {lab.profileImage ? (
                          <img src={`http://localhost:5002/${lab.profileImage.replace('public/', '')}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold"><FaClinicMedical /></div>
                        )}
                      </div>

                      <div className="space-y-1 pr-6">
                        <h4 className="text-sm font-bold text-slate-800 leading-tight">{reqNameFormatter(lab.name)}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{lab.address}</p>
                        
                        {/* Rating block */}
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                          <FaStar size={10} /> {lab.rating || 4.5} <span className="text-slate-400">({lab.totalReviews || 0} reviews)</span>
                        </div>
                        <p className="text-xs font-black text-[#08B36A] pt-1">Starting from ₹{lab.startingPrice || 100}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 font-bold">No partner laboratories found in your location radius.</div>
              )}

              <div className="flex justify-between pt-4 border-t border-slate-50">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2.5 border rounded-xl text-slate-500 text-xs font-bold hover:bg-slate-50"
                >
                  Previous Step
                </button>
                <button
                  onClick={() => {
                    if (!selectedLab) return showNotification("Please choose a laboratory first.", "error");
                    setStep(3);
                  }}
                  className="px-6 py-2.5 bg-[#08B36A] hover:bg-[#069356] text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* 🌟 STEP 3: ASSIGN PATIENTS                */}
          {/* ========================================= */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">3. Select Target Patients</h3>
                <p className="text-xs text-slate-500">Pick the family members whose names are stated on this prescription.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Default Self Option */}
                <div 
                  onClick={() => handleTogglePatient("Self")}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 relative ${
                    selectedPatientIds.includes("Self") 
                      ? 'border-[#08B36A] bg-green-50/15' 
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {selectedPatientIds.includes("Self") && (
                    <span className="absolute top-4 right-4 text-[#08B36A] bg-[#e6f7eb] p-1 rounded-full border border-[#08B36A]/10">
                      <FaCheckCircle size={14} />
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border"><UserPlaceholderIcon /></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Myself</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Self Account Profile</p>
                  </div>
                </div>

                {/* Family Members Array */}
                {familyMembers.map((member) => (
                  <div 
                    key={member._id}
                    onClick={() => handleTogglePatient(member._id)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 relative ${
                      selectedPatientIds.includes(member._id) 
                        ? 'border-[#08B36A] bg-green-50/15' 
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {selectedPatientIds.includes(member._id) && (
                      <span className="absolute top-4 right-4 text-[#08B36A] bg-[#e6f7eb] p-1 rounded-full border border-[#08B36A]/10">
                        <FaCheckCircle size={14} />
                      </span>
                    )}
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border"><UserPlaceholderIcon /></div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{member.memberName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{member.relation} • {member.gender}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-50">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    if (selectedPatientIds.length === 0) return showNotification("Please select at least one patient.", "error");
                    setStep(4);
                  }}
                  className="px-6 py-2.5 bg-[#08B36A] hover:bg-[#069356] text-white text-xs font-bold rounded-xl shadow-md shadow-green-100 transition"
                >
                  Continue Setup
                </button>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* 🌟 STEP 4: ADDRESS & CONFIRM              */}
          {/* ========================================= */}
          {step === 4 && (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-800">4. Select Delivery & Collection Mode</h3>
                  <p className="text-xs text-slate-500">Choose how your laboratory samples should be collected.</p>
                </div>

                {/* Collection Mode Selection */}
                <div className="grid grid-cols-1 gap-6 max-w-xs">
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Collection Type *</label>
                    <div className="relative mt-2">
                      <select
                        value={collectionType}
                        className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#08B36A] rounded-2xl p-4 appearance-none transition-all font-semibold outline-none text-xs"
                        onChange={(e) => {
                          setCollectionType(e.target.value);
                          if (e.target.value === 'Visit Lab') {
                            setSelectedAddress(null); // No address needed if visiting the lab
                          } else if (addresses.length > 0) {
                            setSelectedAddress(addresses[0]);
                          }
                        }}
                      >
                        <option value="Home Collection">Home Collection</option>
                        <option value="Visit Lab">Visit Lab</option>
                      </select>
                      <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Saved Address list (Visible only if Home Collection is active) */}
                {collectionType === 'Home Collection' && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700">Select Home Visit Location</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses.length > 0 ? (
                        addresses.map((addr) => (
                          <div 
                            key={addr._id}
                            onClick={() => setSelectedAddress(addr)}
                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                              selectedAddress?._id === addr._id 
                                ? 'border-[#08B36A] bg-green-50/10' 
                                : 'border-slate-100 bg-white hover:border-slate-200'
                            }`}
                          >
                            {selectedAddress?._id === addr._id && (
                              <span className="absolute top-4 right-4 text-[#08B36A] bg-[#e6f7eb] p-1 rounded-full border border-[#08B36A]/10">
                                <FaCheckCircle size={14} />
                              </span>
                            )}
                            <div>
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#e6f7eb] text-[#08B36A] uppercase mb-2">
                                {addr.addressType || "Home"}
                              </span>
                              <h4 className="text-sm font-bold text-slate-800">{addr.name}</h4>
                              <p className="text-xs text-slate-400 font-semibold mt-1 leading-relaxed">
                                House No. {addr.houseNo}, Sector {addr.sector}, {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                            </div>
                            <p className="text-xs font-bold text-slate-600 mt-4 flex items-center gap-1.5">
                              <FaMapMarkerAlt className="text-slate-400" size={11} /> {addr.phone}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-400 font-bold col-span-2">
                          No addresses registered. Please configure a default profile delivery location first.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Broadcast Submission Button */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-4 border rounded-2xl text-slate-500 text-xs font-bold hover:bg-slate-50"
                >
                  Previous
                </button>
                <button
                  onClick={handleFormSubmission}
                  disabled={submitting || (collectionType === 'Home Collection' && !selectedAddress)}
                  className="flex-1 py-4 bg-[#08B36A] hover:bg-[#069356] text-white text-[13px] font-bold rounded-2xl shadow-[0_4px_15px_rgba(8,179,106,0.2)] transition-all disabled:opacity-40 uppercase tracking-wide flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Uploading details...
                    </>
                  ) : (
                    "Submit Prescription Request"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* 🌟 STEP 5: SUCCESS STATE SCREEN           */}
          {/* ========================================= */}
          {step === 5 && (
            <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm text-center max-w-md mx-auto space-y-6 my-10 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-[#e6f7eb] rounded-full flex items-center justify-center mx-auto border border-[#08B36A]/20">
                <FaCheckCircle className="text-[#08B36A] text-3xl animate-bounce" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-800">Booking Request Placed</h2>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Your prescription and target patient options have been successfully sent to {selectedLab?.name}. Watch your dashboard alerts for cost verification and checkout confirmation.
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
                <FaRegClock className="text-blue-500 animate-pulse" />
                <span>Awaiting laboratory cost verification...</span>
              </div>
              <button
                onClick={() => {
                  setPrescriptionFile(null);
                  setPrescriptionPreview("");
                  setSelectedPatientIds([]);
                  setStep(1);
                }}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Submit Another Prescription
              </button>
            </div>
          )}

        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX PREVIEW */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center animate-none">
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

// Helpers
const reqNameFormatter = (val) => val || "Partner Diagnostics Laboratory";

function UserPlaceholderIcon() {
  return (
    <FaUserCircle className="text-lg" />
  );
}