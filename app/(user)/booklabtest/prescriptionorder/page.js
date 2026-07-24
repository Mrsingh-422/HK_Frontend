'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import UserAPI from '@/app/services/UserAPI';
import Patients from './components/Patients';
import Slots from './components/Slots';
import Address from './components/Address';
import { 
  FaCheckCircle, FaSearch, FaClinicMedical
} from 'react-icons/fa';
import { FiLoader, FiUploadCloud, FiTrash2, FiChevronRight as FiChevronRightIcon } from 'react-icons/fi';

export default function LabPrescriptionBookingPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // --- UI & STEP STATES ---
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

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
  const [appointmentDetails, setAppointmentDetails] = useState({ date: '', time: '' });
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
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchBaselineData = async () => {
    setLoading(true);
    try {
      const labsRes = await UserAPI.getLabsList({ lat: 30.7046, lng: 76.7179 });
      if (labsRes.success) setLabs(labsRes.data || []);

      const familyRes = await UserAPI.getFamilyMembers();
      if (familyRes.success) setFamilyMembers(familyRes.data || []);

      const addressRes = await UserAPI.getUserAddresses();
      if (addressRes.success) {
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
      if (response.success) {
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
      const apiResponse = response.data;
      if (apiResponse?.success) {
        const { doctorName, prescriptionDate, detectedTests } = apiResponse.data;
        setScanMeta({ doctor: doctorName || "AI Extracted", date: prescriptionDate || "Today" });
        setDetectedTests(detectedTests.map((t, i) => ({ 
            ...t, 
            masterId: t.masterId || `ai-${i}-${Date.now()}`,
            standardMRP: t.standardMRP || 0 
        })));
      }
    } catch (error) {
      showNotification("AI scanning failed.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTogglePatient = (id) => {
    setSelectedPatientIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleFormSubmission = async () => {
    if (!selectedLab) return showNotification("Please select a lab", "error");
    if (selectedPatientIds.length === 0) return showNotification("Select at least one patient", "error");

    setSubmitting(true);
    const fd = new FormData();
    fd.append('prescriptionImage', prescriptionFile);
    fd.append('labId', selectedLab._id);
    fd.append('collectionType', collectionType);
    fd.append('appointmentDate', appointmentDetails.date);
    fd.append('appointmentTime', appointmentDetails.time);
    fd.append('patients', JSON.stringify(selectedPatientIds));

    let targetAddress = collectionType === 'Home Collection' ? {
      addressType: selectedAddress.addressType,
      name: selectedAddress.name,
      phone: selectedAddress.phone,
      houseNo: selectedAddress.houseNo,
      city: selectedAddress.city,
      pincode: selectedAddress.pincode
    } : { addressType: "Visit Lab", houseNo: selectedLab.address };

    fd.append('address', JSON.stringify(targetAddress));
    fd.append('requestedTests', JSON.stringify(detectedTests.map(t => ({ 
        name: t.name, 
        _id: t.masterId,
        price: t.standardMRP 
    }))));

    try {
      const response = await UserAPI.submitLabPrescriptionRequest(fd);
      if (response.success) setStep(6);
    } catch (err) {
      showNotification("Submission failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = ["1. Upload", "2. Lab", "3. Patients", "4. Slots", "5. Confirm"];

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] p-4 md:p-8">
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

        <div className="bg-white rounded-3xl border p-6 md:p-8 shadow-sm">
          
          {step === 1 && (
            <div className="space-y-6">
              {!prescriptionFile ? (
                <div onClick={() => fileInputRef.current.click()} className="border-4 border-dashed border-slate-100 rounded-[40px] p-20 text-center cursor-pointer hover:bg-slate-50 transition-all">
                  <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
                  <FiUploadCloud size={48} className="mx-auto mb-4 text-emerald-500" />
                  <h3 className="text-xl font-black text-slate-800">Select Prescription Image</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
                  <div className="lg:col-span-4 space-y-4">
                    <img src={prescriptionPreview} className="rounded-2xl border w-full aspect-square object-contain bg-slate-50" alt="Preview" />
                    <button disabled={detectedTests.length === 0 || isAnalyzing} onClick={() => setStep(2)} className="w-full py-4 bg-[#08B36A] text-white rounded-2xl font-bold shadow-lg disabled:opacity-50">Next: Select Lab</button>
                    <button onClick={() => {setPrescriptionFile(null); setDetectedTests([])}} className="w-full py-2 text-slate-400 text-xs font-bold uppercase">Change Image</button>
                  </div>

                  <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white border rounded-[32px] overflow-hidden flex flex-col min-h-[500px]">
                      <div className="p-6 border-b bg-slate-50/50 flex justify-between items-center">
                        <h4 className="font-black text-xs uppercase tracking-widest">Tests Detected ({detectedTests.length})</h4>
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
                              <button onClick={() => setDetectedTests(prev => prev.filter(x => x.masterId !== t.masterId))} className="text-red-400"><FiTrash2 size={16} /></button>
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
              <h3 className="font-bold">Select Laboratory</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {labs.map(lab => (
                  <div key={lab._id} onClick={() => setSelectedLab(lab)} className={`p-5 border-2 rounded-2xl cursor-pointer transition-all ${selectedLab?._id === lab._id ? 'border-[#08B36A] bg-emerald-50' : 'border-slate-100'}`}>
                    <h4 className="font-bold text-sm">{lab.name}</h4>
                    <p className="text-[10px] text-slate-400 uppercase">{lab.address}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-6 border-t">
                <button onClick={() => setStep(1)} className="px-6 py-2 border rounded-xl text-xs font-bold">Back</button>
                <button onClick={() => selectedLab && setStep(3)} className="px-8 py-2 bg-[#08B36A] text-white rounded-xl text-xs font-bold">Next</button>
              </div>
            </div>
          )}

          {step === 3 && <Patients familyMembers={familyMembers} selectedPatientIds={selectedPatientIds} onToggle={handleTogglePatient} onBack={() => setStep(2)} onNext={() => setStep(4)} />}
          {step === 4 && <Slots labId={selectedLab?._id} onSlotSelect={setAppointmentDetails} onBack={() => setStep(3)} onNext={() => setStep(5)} />}
          {step === 5 && <Address addresses={addresses} selectedAddress={selectedAddress} collectionType={collectionType} onSelect={setSelectedAddress} onTypeChange={setCollectionType} onBack={() => setStep(4)} onSubmit={handleFormSubmission} submitting={submitting} />}

          {step === 6 && (
            <div className="text-center py-16 space-y-6">
              <FaCheckCircle className="text-6xl text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-black">Request Placed!</h2>
              <button onClick={() => router.push('/userscreens/dashboard')} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase">Go to Dashboard</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}