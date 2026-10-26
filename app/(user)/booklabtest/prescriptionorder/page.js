'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import UserAPI from '@/app/services/UserAPI';
import Patients from './components/Patients';
import Slots from './components/Slots';
import Address from './components/Address';
import { 
  FaCheckCircle, FaSearch, FaClinicMedical, FaClock, FaIdBadge, FaTimesCircle, FaBan
} from 'react-icons/fa';
import { FiLoader, FiUploadCloud, FiTrash2, FiChevronRight as FiChevronRightIcon } from 'react-icons/fi';

export default function LabPrescriptionBookingPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // --- UI & STEP STATES ---
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [createdRequestData, setCreatedRequestData] = useState(null);

  // --- DATA STATES ---
  const [labs, setLabs] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [addresses, setAddresses] = useState([]);

  // --- PRESCRIPTION & SCAN STATES ---
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedTests, setDetectedTests] = useState([]);
  const [scanMeta, setScanMeta] = useState({ doctor: "", date: "" });

  // --- MANUAL SEARCH STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // --- SELECTION STATES ---
  const [selectedLab, setSelectedLab] = useState(null);
  const [selectedPatientIds, setSelectedPatientIds] = useState([]);
  const [appointmentDetails, setAppointmentDetails] = useState({ date: '', time: '', displayTime: '' });
  const [collectionType, setCollectionType] = useState('Home Collection');
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    fetchBaselineData();
  }, []);

  // Debounced search for manual tests
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 2) {
        handleSearchTests(searchQuery);
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
  };

  const fetchBaselineData = async () => {
    setLoading(true);
    try {
      const labsRes = await UserAPI.getLabsList({ lat: 30.7046, lng: 76.7179 });
      if (labsRes?.success) setLabs(labsRes.data || []);

      const familyRes = await UserAPI.getFamilyMembers();
      if (familyRes?.success) setFamilyMembers(familyRes.data || []);

      const addressRes = await UserAPI.getUserAddresses();
      if (addressRes?.success) {
        setAddresses(addressRes.data || []);
        if (addressRes.data?.length > 0) setSelectedAddress(addressRes.data[0]);
      }
    } catch (err) {
      showNotification("Could not retrieve setup data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTests = async (query) => {
    setIsSearching(true);
    try {
      const response = await UserAPI.searchMasterTests(query);
      if (response?.success) {
        setSearchResults(response.data || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Search error", error);
    } finally {
      setIsSearching(false);
    }
  };

  const addTestFromSuggestion = (test) => {
    if (detectedTests.find(t => t.masterId === test.id)) {
      showNotification("Test already added", "error");
      return;
    }
    const newTest = {
      masterId: test.id,
      name: test.name,
      mainCategory: test.mainCategory || "Pathology",
      category: test.category || "General",
      standardMRP: test.price || 0,
      productType: "LabTest"
    };
    setDetectedTests([...detectedTests, newTest]);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  // OCR Scan API (/user/labs/scan-rx) uses 'prescriptionFile'
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPrescriptionFile(file);
    setPrescriptionPreview(URL.createObjectURL(file));
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("prescriptionFile", file);
      const response = await UserAPI.scanLabPrescription(formData);
      const apiResponse = response?.data || response;
      if (apiResponse?.success) {
        const { doctorName, prescriptionDate, detectedTests: scannedList } = apiResponse.data || {};
        setScanMeta({ doctor: doctorName || "AI Extracted", date: prescriptionDate || "Today" });
        if (Array.isArray(scannedList)) {
          setDetectedTests(scannedList.map((t, i) => ({ 
              ...t, 
              masterId: t.masterId || `ai-${i}-${Date.now()}`,
              standardMRP: t.standardMRP || 0 
          })));
        }
      }
    } catch (error) {
      showNotification("AI scanning failed. You can add tests manually below.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTogglePatient = (id) => {
    setSelectedPatientIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // POST /user/labs/prescription-request (Strictly expects key: 'prescriptionImage')
  const handleFormSubmission = async () => {
    if (!selectedLab) return showNotification("Please select a lab", "error");
    if (selectedPatientIds.length === 0) return showNotification("Select at least one patient", "error");
    if (!prescriptionFile) return showNotification("Please attach your prescription file", "error");
    if (!appointmentDetails.date || (!appointmentDetails.time && !appointmentDetails.displayTime)) {
      return showNotification("Please choose a time slot", "error");
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      
      // 🚨 STRICT REQUIREMENT: Key MUST be 'prescriptionImage'
      fd.append('prescriptionImage', prescriptionFile);
      fd.append('labId', selectedLab._id);
      fd.append('collectionType', collectionType);
      fd.append('appointmentDate', appointmentDetails.date);
      fd.append('appointmentTime', appointmentDetails.displayTime || appointmentDetails.time);

      // Structure patients as serialized JSON array of objects
      const structuredPatients = selectedPatientIds.map(pId => {
        const member = familyMembers.find(m => (m._id === pId || m.id === pId));
        return {
          patientId: pId,
          name: member?.memberName || member?.name || "Self",
          relation: member?.relation || "Self"
        };
      });
      fd.append('patients', JSON.stringify(structuredPatients));

      // Address JSON
      const targetAddress = collectionType === 'Home Collection' && selectedAddress ? {
        name: selectedAddress.name || "Patient",
        phone: selectedAddress.phone || "",
        houseNo: selectedAddress.houseNo || "",
        sector: selectedAddress.sector || "",
        city: selectedAddress.city || "",
        pincode: selectedAddress.pincode || "",
        addressType: selectedAddress.addressType || "Home"
      } : { 
        name: selectedLab.name || "Self Visit",
        addressType: "Visit Lab", 
        houseNo: selectedLab.address || "Lab Facility" 
      };
      fd.append('address', JSON.stringify(targetAddress));

      // Tests Array JSON
      fd.append('requestedTests', JSON.stringify(detectedTests.map(t => ({ 
          name: t.name, 
          _id: t.masterId,
          price: t.standardMRP 
      }))));

      const response = await UserAPI.submitLabPrescriptionRequest(fd);

      if (response?.success) {
        setCreatedRequestData({
          requestId: response.requestId || response.data?.requestId || "HK-LREQ-HOLD",
          appointmentTime: response.data?.appointmentTime || appointmentDetails.displayTime || appointmentDetails.time,
          appointmentDate: response.data?.appointmentDate || appointmentDetails.date,
          status: response.data?.status || "Pending Review",
          collectionType: response.data?.collectionType || collectionType
        });
        setStep(6);
      } else {
        showNotification(response?.message || "Submission failed", "error");
      }
    } catch (err) {
      console.error("Submission error:", err);
      const errorData = err?.response?.data;

      // Handle race condition: SLOT_ALREADY_BOOKED
      if (errorData?.errorType === "SLOT_ALREADY_BOOKED") {
        showNotification(errorData.message || "This slot was just booked by another user. Please choose a different slot.", "error");
        setStep(4); // Take user back to slot selection
      } else if (errorData?.errorType === "MULTER_FIELD_MISMATCH") {
        showNotification(errorData.message, "error");
      } else {
        showNotification(errorData?.message || "Submission failed. Please try again.", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 3. User Cancels Prescription Request (PATCH /user/labs/prescription-request/cancel/:requestId)
  const handleCancelRequest = async () => {
    if (!createdRequestData?.requestId) return;
    const confirmCancel = window.confirm("Are you sure you want to cancel this inquiry? Your held time slot will be released immediately.");
    if (!confirmCancel) return;

    setIsCancelling(true);
    try {
      const res = await UserAPI.cancelLabPrescriptionRequest(
        createdRequestData.requestId,
        "Changed my mind / Want to choose another time"
      );

      if (res?.success) {
        showNotification("Prescription request cancelled. Time slot freed successfully.", "success");
        setCreatedRequestData(prev => ({ ...prev, status: "Cancelled" }));
      } else {
        showNotification(res?.message || "Could not cancel request", "error");
      }
    } catch (err) {
      showNotification(err?.response?.data?.message || "Failed to cancel request", "error");
    } finally {
      setIsCancelling(false);
    }
  };

  const stepLabels = ["1. Upload", "2. Lab", "3. Patients", "4. Slots", "5. Confirm"];

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      {notification.show && (
        <div className={`fixed top-5 right-5 z-[150] p-4 rounded-xl shadow-lg border transition-all ${notification.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
          <div className="text-sm font-bold">{notification.message}</div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {step < 6 && (
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Upload Lab Prescription</h1>
            <div className="flex items-center gap-2 mt-6">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex-1 flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= num ? 'bg-[#08B36A] text-white' : 'bg-white text-slate-400 border'}`}>
                    {num}
                  </div>
                  <span className={`hidden sm:inline text-xs font-bold ${step >= num ? 'text-slate-800' : 'text-slate-400'}`}>{stepLabels[num-1]}</span>
                </div>
              ))}
            </div>
          </header>
        )}

        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm">
          
          {step === 1 && (
            <div className="space-y-6">
              {!prescriptionFile ? (
                <div onClick={() => fileInputRef.current?.click()} className="border-4 border-dashed border-slate-100 rounded-[40px] p-20 text-center cursor-pointer hover:bg-slate-50 transition-all">
                  <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*,application/pdf" />
                  <FiUploadCloud size={48} className="mx-auto mb-4 text-emerald-500" />
                  <h3 className="text-xl font-black text-slate-800">Select Prescription Image or PDF</h3>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">Supports JPG, PNG, and PDF medical scripts</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
                  <div className="lg:col-span-4 space-y-4">
                    <img src={prescriptionPreview} className="rounded-2xl border w-full aspect-square object-contain bg-slate-50" alt="Preview" />
                    <button 
                      disabled={isAnalyzing} 
                      onClick={() => setStep(2)} 
                      className="w-full py-4 bg-[#08B36A] hover:bg-[#079c5c] text-white rounded-2xl font-bold shadow-lg disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      Next: Select Lab
                    </button>
                    <button onClick={() => { setPrescriptionFile(null); setDetectedTests([]); }} className="w-full py-2 text-slate-400 text-xs font-bold uppercase hover:text-slate-600 transition-colors cursor-pointer">
                      Change Image
                    </button>
                  </div>

                  <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white border rounded-[32px] overflow-hidden flex flex-col min-h-[500px]">
                      <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
                        <h4 className="font-black text-xs uppercase tracking-widest text-slate-600">Tests Detected ({detectedTests.length})</h4>
                        {isAnalyzing && <FiLoader className="animate-spin text-emerald-500"/>}
                      </div>

                      <div className="p-6 border-b relative">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search and add tests manually..."
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none ring-1 ring-slate-200 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                            />
                        </div>

                        {showSuggestions && searchResults.length > 0 && (
                            <div className="absolute left-6 right-6 top-full mt-2 bg-white border rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                                {searchResults.map((test) => (
                                    <div key={test.id} onClick={() => addTestFromSuggestion(test)} className="p-4 hover:bg-emerald-50 cursor-pointer border-b last:border-none flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{test.name}</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold">{test.category}</p>
                                        </div>
                                        <p className="text-xs font-black text-emerald-600">₹{test.price}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                      </div>

                      <div className="p-6 flex-1 space-y-3 overflow-y-auto max-h-[400px]">
                        {detectedTests.map(t => (
                            <div key={t.masterId} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border">
                              <div>
                                <span className="text-sm font-black text-slate-800 uppercase">{t.name}</span>
                                <p className="text-xs font-bold text-emerald-600">₹{t.standardMRP || 0}</p>
                              </div>
                              <button onClick={() => setDetectedTests(prev => prev.filter(x => x.masterId !== t.masterId))} className="text-red-400 hover:text-red-600 cursor-pointer">
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-900">Select Diagnostic Laboratory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {labs.map(lab => (
                  <div key={lab._id} onClick={() => setSelectedLab(lab)} className={`p-5 border-2 rounded-2xl cursor-pointer transition-all ${selectedLab?._id === lab._id ? 'border-[#08B36A] bg-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}>
                    <h4 className="font-bold text-sm text-slate-900">{lab.name}</h4>
                    <p className="text-[10px] text-slate-400 uppercase mt-0.5">{lab.address}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-6 border-t">
                <button onClick={() => setStep(1)} className="px-6 py-2 border rounded-xl text-xs font-bold cursor-pointer">Back</button>
                <button disabled={!selectedLab} onClick={() => setStep(3)} className="px-8 py-2 bg-[#08B36A] hover:bg-[#079c5c] disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer">Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <Patients 
              familyMembers={familyMembers} 
              selectedPatientIds={selectedPatientIds} 
              onToggle={handleTogglePatient} 
              onBack={() => setStep(2)} 
              onNext={() => setStep(4)} 
            />
          )}

          {step === 4 && (
            <Slots 
              labId={selectedLab?._id} 
              onSlotSelect={setAppointmentDetails} 
              onBack={() => setStep(3)} 
              onNext={() => setStep(5)} 
            />
          )}

          {step === 5 && (
            <Address 
              addresses={addresses} 
              selectedAddress={selectedAddress} 
              collectionType={collectionType} 
              onSelect={setSelectedAddress} 
              onTypeChange={setCollectionType} 
              onBack={() => setStep(4)} 
              onSubmit={handleFormSubmission} 
              submitting={submitting} 
            />
          )}

          {/* STEP 6: SUCCESS / PENDING REVIEW WITH CANCEL OPTION */}
          {step === 6 && (
            <div className="text-center py-12 space-y-6">
              <FaCheckCircle className="text-6xl text-emerald-500 mx-auto" />
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900">Prescription Request Submitted!</h2>
                <p className="text-xs text-slate-500 font-medium">Your requested time slot has been locked while the lab reviews your prescription.</p>
              </div>

              {createdRequestData && (
                <div className="max-w-md mx-auto p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs text-left">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">Request Reference</span>
                    <span className="font-mono font-black text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200">
                      {createdRequestData.requestId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Locked Slot:</span>
                    <span className="font-bold text-slate-800">{createdRequestData.appointmentTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Review Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase ${
                      createdRequestData.status === "Cancelled"
                        ? "bg-slate-200 text-slate-600"
                        : "bg-amber-100 text-amber-800 animate-pulse"
                    }`}>
                      {createdRequestData.status}
                    </span>
                  </div>

                  {/* Cancel Button (Frees the slot instantly per Section 3) */}
                  {createdRequestData.status !== "Cancelled" && (
                    <div className="pt-2 border-t flex justify-end">
                      <button
                        type="button"
                        disabled={isCancelling}
                        onClick={handleCancelRequest}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isCancelling ? <FiLoader className="animate-spin" /> : <FaTimesCircle />}
                        <span>Cancel Request &amp; Release Slot</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => router.push('/userscreens/previousorders')} 
                  className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs uppercase cursor-pointer"
                >
                  Go to Orders Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}