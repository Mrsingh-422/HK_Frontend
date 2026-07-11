'use client';

import React, { useState, useEffect, useRef } from 'react';
import UserAPI from '@/app/services/UserAPI'; // Adjust this path to match your project structure
import { 
  FaUpload, FaTimes, FaPlus, FaMapMarkerAlt, FaFileMedical, 
  FaCheckCircle, FaTrashAlt, FaHospitalUser, FaNotesMedical,
  FaArrowLeft, FaChevronRight, FaCompass, FaCheck
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const IMAGE_BASE_URL = "http://localhost:5002";

// Helper to construct accurate prescription image URLs from your backend server
const getPrescriptionImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    const cleanedPath = path.replace(/^public\//, '');
    return `${IMAGE_BASE_URL}/${cleanedPath}`;
};

export default function NurseBookingPage() {
  const themeColor = "#08B36A";
  const router = useRouter();
  const fileInputRef = useRef(null); // Ref to handle manual triggers of the file picker

  // ==========================================
  // 🌟 LOADING & NOTIFICATION STATES
  // ==========================================
  const [loading, setLoading] = useState(false);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // ==========================================
  // 🌟 WIZARD STEPPER STATE
  // ==========================================
  const [step, setStep] = useState(1); // 1: Upload, 2: Configure & Select Address, 3: Broadcast Success

  // ==========================================
  // 🌟 DATA STATES
  // ==========================================
  const [selectedFile, setSelectedFile] = useState(null);
  const [localPreview, setLocalPreview] = useState(""); // Local client-side preview state
  const [uploadedImageSrc, setUploadedImageSrc] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [services, setServices] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // New custom service state
  const [newService, setNewService] = useState({ title: '', description: '', notes: '' });
  const [showAddCustomForm, setShowAddCustomForm] = useState(false);

  // Fetch user addresses on mount (getUserAddresses API)
  useEffect(() => {
    fetchSavedAddresses();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const fetchSavedAddresses = async () => {
    try {
      const response = await UserAPI.getUserAddresses();
      if (response.success) {
        setAddresses(response.data || []);
        // Auto-select first address if available
        if (response.data?.length > 0) {
          setSelectedAddress(response.data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch user addresses:", err);
    }
  };

  // --- STEP 1: SELECT LOCAL FILE ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setLocalPreview(URL.createObjectURL(file)); // Generate browser preview URL
    }
  };

  // --- STEP 1: REMOVE LOCAL FILE ---
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setLocalPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear file input buffer
    }
  };

  // --- STEP 1: UPLOAD AND PARSE PRESCRIPTION (API 1.1) ---
  const handleUploadAndParse = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showNotification("Please select a prescription image/file to proceed.", "error");
      return;
    }

    setLoading(true);
    const fd = new FormData();
    // Appending 'prescriptionImage' matching API 1.1 key spec
    fd.append('prescriptionImage', selectedFile);

    try {
      const response = await UserAPI.uploadNursePrescription(fd);
      if (response.success) {
        showNotification("Prescription uploaded and parsed successfully!", "success");
        setUploadedImageSrc(response.prescriptionImage);
        setExtractedText(response.extractedText || "");
        
        // Map detected services, adding a default empty "notes" field
        const mappedServices = (response.detectedServices || []).map(svc => ({
          title: svc.title,
          description: svc.description,
          notes: ""
        }));
        setServices(mappedServices);
        
        // Move to configuration step
        setStep(2);
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to parse prescription. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: EDIT SERVICE NOTES ---
  const handleServiceNoteChange = (index, value) => {
    setServices(prev => {
      const updated = [...prev];
      updated[index].notes = value;
      return updated;
    });
  };

  // --- STEP 2: DELETE EXTRACTED SERVICE ---
  const handleRemoveService = (index) => {
    if (services.length === 1) {
      showNotification("You must broadcast at least one nursing service.", "error");
      return;
    }
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  // --- STEP 2: ADD CUSTOM SERVICE ---
  const handleAddCustomService = (e) => {
    e.preventDefault();
    if (!newService.title.trim() || !newService.description.trim()) {
      showNotification("Title and description are required for custom services.", "error");
      return;
    }
    setServices(prev => [...prev, { ...newService }]);
    setNewService({ title: '', description: '', notes: '' });
    setShowAddCustomForm(false);
    showNotification("Custom service added to queue.");
  };

  // --- STEP 2: BROADCAST FINALIZED REQUIREMENTS (API 1.2) ---
  const handleBroadcastRequest = async () => {
    if (!selectedAddress) {
      showNotification("Please select a service delivery address.", "error");
      return;
    }
    if (services.length === 0) {
      showNotification("Please add at least one nursing service.", "error");
      return;
    }

    setBroadcastLoading(true);

    // Mocking lat/lng based on SAS Nagar/Chandigarh default center (approx)
    const lat = 30.7046;
    const lng = 76.7179;

    const payload = {
      prescriptionImage: uploadedImageSrc,
      lat,
      lng,
      address: {
        houseNo: selectedAddress.houseNo || "",
        landmark: selectedAddress.landmark || "",
        city: selectedAddress.city || "",
        state: selectedAddress.state || "",
        pincode: selectedAddress.pincode || ""
      },
      services: services.map(svc => ({
        title: svc.title,
        description: svc.description,
        notes: svc.notes || ""
      }))
    };

    try {
      const response = await UserAPI.broadcastNurseRequest(payload);
      if (response.success) {
        showNotification("Request successfully broadcasted to nearby nurses!", "success");
        setStep(3);
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to broadcast request.", "error");
    } finally {
      setBroadcastLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-green-100">
      
      {/* Toast Alert Banner */}
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

      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => { if (step > 1) setStep(step - 1); }} 
              disabled={step === 3}
              className="p-2.5 hover:bg-slate-100 rounded-full transition-all text-slate-500 disabled:opacity-30"
            >
              <FaArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-800">Nurse Care Broadcast</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#08B36A] mt-0.5">Instant Homecare Booking</p>
            </div>
          </div>
        </div>
      </nav>

      {/* --- STEP PROGRESS BAR --- */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span className={step >= 1 ? "text-[#08B36A]" : ""}>1. Upload Prescription</span>
          <FaChevronRight size={10} />
          <span className={step >= 2 ? "text-[#08B36A]" : ""}>2. Finalize Services</span>
          <FaChevronRight size={10} />
          <span className={step >= 3 ? "text-[#08B36A]" : ""}>3. Broadcast Status</span>
        </div>
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
          <div 
            style={{ width: `${(step / 3) * 100}%` }}
            className="bg-[#08B36A] h-full transition-all duration-300"
          ></div>
        </div>
      </div>

      {/* --- STEP CONTENT ROUTER --- */}
      <main className="max-w-4xl mx-auto p-6 md:p-8">

        {/* ========================================= */}
        {/* 🌟 STEP 1: UPLOAD PRESCRIPTION            */}
        {/* ========================================= */}
        {step === 1 && (
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div className="text-center max-w-md mx-auto space-y-2 mb-4">
              <div className="bg-[#e6f7eb] w-12 h-12 rounded-2xl flex items-center justify-center text-[#08B36A] mx-auto">
                <FaFileMedical size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Upload Doctor's Prescription</h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Our AI engine will parse your prescription text to instantly extract and draft the required nursing care modules.
              </p>
            </div>

            <form onSubmit={handleUploadAndParse} className="space-y-6">
              
              {/* Dynamic Image Upload & Preview Card Container */}
              {selectedFile ? (
                <div className="relative border border-slate-100 rounded-[2rem] p-6 bg-slate-50 flex flex-col items-center justify-center max-h-80 overflow-hidden animate-in zoom-in-95 duration-200 shadow-inner">
                  {localPreview ? (
                    <img 
                      src={localPreview} 
                      alt="Prescription preview" 
                      className="max-h-52 object-contain rounded-2xl border border-slate-150 shadow-xs" 
                    />
                  ) : (
                    <div className="flex flex-col items-center p-6 text-slate-400">
                      <FaFileMedical size={40} className="mb-2" />
                      <p className="text-xs font-bold truncate max-w-xs">{selectedFile.name}</p>
                    </div>
                  )}
                  
                  {/* File Selection Modification Controls */}
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all"
                    >
                      Change File
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center hover:border-[#08B36A] transition-colors bg-[#fafafa] cursor-pointer group shadow-sm"
                >
                  <div className="flex flex-col items-center">
                    <FaUpload className="h-8 w-8 text-gray-400 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="block text-xs font-bold text-[#08B36A] hover:text-[#069356]">Browse Prescription File</span>
                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wide">JPG, PNG, or PDF up to 10MB</p>
                  </div>
                </div>
              )}

              {/* Hidden File Input Reference */}
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
              />

              <button
                type="submit"
                disabled={!selectedFile || loading}
                className="w-full py-4 bg-[#08B36A] hover:bg-[#069356] text-white text-[13px] font-bold rounded-2xl shadow-[0_4px_15px_rgba(8,179,106,0.2)] transition-all disabled:opacity-40 uppercase tracking-wide flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Extracting Medical Text...
                  </>
                ) : (
                  "Upload & Extract Services"
                )}
              </button>
            </form>
          </div>
        )}

        {/* ========================================= */}
        {/* 🌟 STEP 2: FINALIZE SERVICES & ADDR       */}
        {/* ========================================= */}
        {step === 2 && (
          <div className="space-y-8">
            
            {/* AI Extracted Text Card */}
            {extractedText && (
              <div className="bg-[#e6f7eb] border border-[#08B36A]/20 p-5 rounded-3xl">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#08B36A] mb-1.5 flex items-center gap-1.5">
                  <FaNotesMedical /> AI Extracted Prescription Text
                </p>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed italic">
                  "{extractedText}"
                </p>
              </div>
            )}

            {/* Services Queue List */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b pb-4 mb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Finalize Nursing Care Services</h3>
                  <p className="text-xs text-slate-500">Edit notes or add custom service blocks required by the patient.</p>
                </div>
                <button 
                  onClick={() => setShowAddCustomForm(!showAddCustomForm)}
                  className="text-xs text-[#08B36A] font-bold hover:underline"
                >
                  {showAddCustomForm ? "Hide Form" : "+ Add Custom Service"}
                </button>
              </div>

              {/* Add Custom Service Form */}
              {showAddCustomForm && (
                <form onSubmit={handleAddCustomService} className="p-5 bg-slate-50 border border-slate-150 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Service Title *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. IV Saline Setup"
                        value={newService.title}
                        onChange={(e) => setNewService({...newService, title: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-gray-800 outline-none focus:border-[#08B36A] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Service Description *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Set up sterile saline drip"
                        value={newService.description}
                        onChange={(e) => setNewService({...newService, description: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-gray-800 outline-none focus:border-[#08B36A] font-semibold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Patient Instructions / Notes</label>
                    <textarea 
                      rows="2"
                      placeholder="e.g. Saline bottle is available at home."
                      value={newService.notes}
                      onChange={(e) => setNewService({...newService, notes: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-gray-800 outline-none focus:border-[#08B36A] font-semibold resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAddCustomForm(false)} 
                      className="px-3 py-1.5 text-xs text-slate-500 font-semibold"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-1.5 bg-[#08B36A] text-white text-xs font-bold rounded-lg hover:bg-[#069356]"
                    >
                      Add to Queue
                    </button>
                  </div>
                </form>
              )}

              {/* Service Cards Loop */}
              <div className="space-y-4">
                {services.map((svc, index) => (
                  <div key={index} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl relative space-y-4">
                    <button 
                      type="button" 
                      onClick={() => handleRemoveService(index)}
                      className="absolute top-4 right-4 text-rose-500 hover:text-rose-700 transition"
                    >
                      <FaTrashAlt size={12} />
                    </button>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center text-[#08B36A] shrink-0 shadow-xs">
                        <FaHospitalUser />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{svc.title}</h4>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">{svc.description}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 ml-1">Add Specific Patient Instructions / Notes</label>
                      <input 
                        type="text"
                        value={svc.notes}
                        onChange={(e) => handleServiceNoteChange(index, e.target.value)}
                        placeholder="e.g. Nurse needs to bring sterile dressing kit."
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#08B36A] transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address Selector Card (getUserAddresses API) */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Select Delivery Address</h3>
                  <p className="text-xs text-slate-500">Where should the nurse partner deliver treatment?</p>
                </div>
                <button 
                  type="button"
                  onClick={() => router.push('/userscreens/myaccount')}
                  className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-xs"
                >
                  <FaPlus size={10} /> Add Address
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.length > 0 ? (
                  <>
                    {addresses.map((addr) => (
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
                            <FaCheck size={8} />
                          </span>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#e6f7eb] text-[#08B36A] uppercase">
                              {addr.addressType || "Home"}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-800">{addr.name}</h4>
                          <p className="text-xs text-slate-400 font-semibold mt-1 leading-relaxed">
                            House No. {addr.houseNo}, Sector {addr.sector}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                        <p className="text-xs font-bold text-slate-600 mt-4 flex items-center gap-1.5">
                          <FaMapMarkerAlt className="text-slate-400" size={11} /> {addr.phone}
                        </p>
                      </div>
                    ))}
                    
                    {/* DASHED GRID CARD: ADD NEW ADDRESS */}
                    <div
                      onClick={() => router.push('/userscreens/myaccount')}
                      className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 hover:border-[#08B36A] hover:bg-green-50/10 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[160px] group text-center"
                    >
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 group-hover:text-[#08B36A] group-hover:scale-110 transition-all shadow-sm border border-slate-100 mb-2">
                        <FaPlus size={16} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">Add New Address</h4>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide max-w-[180px]">Manage locations in your profile</p>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-400 font-bold col-span-2 flex flex-col items-center justify-center gap-3">
                    <p>No addresses registered.</p>
                    <button 
                      onClick={() => router.push('/userscreens/myaccount')}
                      className="px-4 py-2 bg-[#08B36A] hover:bg-[#069356] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      Add Your First Address
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Broadcast Submission Button */}
            <button
              onClick={handleBroadcastRequest}
              disabled={broadcastLoading || !selectedAddress}
              className="w-full py-4 bg-[#08B36A] hover:bg-[#069356] text-white text-[13px] font-bold rounded-2xl shadow-[0_4px_15px_rgba(8,179,106,0.2)] transition-all disabled:opacity-40 uppercase tracking-wide flex items-center justify-center gap-2"
            >
              {broadcastLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Broadcasting care requirements...
                </>
              ) : (
                "Broadcast to Nearby Nurses"
              )}
            </button>
          </div>
        )}

        {/* ========================================= */}
        {/* 🌟 STEP 3: BROADCAST SUCCESS              */}
        {/* ========================================= */}
        {step === 3 && (
          <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm text-center max-w-md mx-auto space-y-6 my-10 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-[#e6f7eb] rounded-full flex items-center justify-center mx-auto border border-[#08B36A]/20">
              <FaCheckCircle className="text-[#08B36A] text-3xl animate-bounce" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-800">Care Broadcast Submitted</h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Your medical instructions and prescription have been securely dispatched to nearby registered nurses. Please watch your phone or dashboard for quick confirmations.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
              <FaCompass className="text-blue-500 animate-spin" />
              <span>Matching with nearest nurse partners...</span>
            </div>
            <button
              onClick={() => router.push("/userscreens/previousorders")}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
            >
              View Request
            </button>
          </div>
        )}

      </main>
    </div>
  );
}