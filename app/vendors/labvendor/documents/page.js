'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext' // Adjust path as needed
import {
  HiOutlineCloudUpload,
  HiOutlineDocumentText,
  HiX,
  HiCheckCircle,
  HiOutlineCamera,
  HiOutlinePhotograph,
  HiArrowLeft,
  HiOutlineClock,
  HiOutlineExclamation,
  HiOutlineBadgeCheck
} from 'react-icons/hi'

function LabDocumentUploadPage() {
  const themeColor = "#08B36A"
  const router = useRouter()
  const { uploadLabDocuments, loading, lab } = useAuth()

  // --- STATES ---
  const [isChecking, setIsChecking] = useState(true)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // Form Metadata (Aligned with Schema)
  const [metadata, setMetadata] = useState({
    documentState: "",
    issuingAuthority: "",
    gstNumber: "",
    experience: "",
    drugLicenseType: "None",
  })

  // Document Files (Aligned with Schema Image Arrays)
  const [documents, setDocuments] = useState({
    labImages: [],
    labCertificates: [],
    labLicenses: [],
    gstCertificates: [],
    drugLicenses: [],
    otherCertificates: []
  })

  // Previews (for UI feedback)
  const [previews, setPreviews] = useState({
    labImages: [],
    labCertificates: [],
    labLicenses: [],
    gstCertificates: [],
    drugLicenses: [],
    otherCertificates: []
  })

  // --- AUTH & STATUS CHECK ---
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("labToken");
      const data = localStorage.getItem("labProvider");

      if (!token || !data) {
        alert("Please login as a lab vendor to access this page");
        router.push('/');
        return;
      }

      const labUser = JSON.parse(data);

      if (labUser.profileStatus === 'Approved') {
        router.push('/vendors/labvendor/labdashboard');
        return;
      } else if (labUser.profileStatus === 'Pending') {
        setStatusMessage('Your documents are under review. Please wait for admin approval.');
        setShowStatusModal(true);
      } else if (labUser.profileStatus === 'Rejected') {
        setStatusMessage(`Your documents were rejected. Reason: ${labUser.rejectionReason || 'No reason provided'}. Please re-upload.`);
        setShowStatusModal(true);
      }
      setIsChecking(false);
    };
    checkAuth();
  }, [router]);

  // --- HANDLERS ---
  const handleFileChange = (category, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setDocuments(prev => ({
      ...prev,
      [category]: [...prev[category], ...files]
    }));

    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB"
    }));

    setPreviews(prev => ({
      ...prev,
      [category]: [...prev[category], ...newPreviews]
    }));
  };

  const removeFile = (category, index) => {
    URL.revokeObjectURL(previews[category][index].url);
    setDocuments(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
    setPreviews(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required field validation based on schema requirements
    if (
      documents.labImages.length === 0 ||
      documents.labCertificates.length === 0 ||
      documents.labLicenses.length === 0 ||
      !metadata.documentState ||
      !metadata.issuingAuthority
    ) {
      alert('Please fill all required fields and upload mandatory documents (Lab Image, Certificate, and License).');
      return;
    }

    const formData = new FormData();

    // Append Metadata
    Object.keys(metadata).forEach(key => formData.append(key, metadata[key]));

    // Append Files
    Object.keys(documents).forEach(category => {
      documents[category].forEach(file => {
        formData.append(category, file);
      });
    });

    try {
      const res = await uploadLabDocuments(formData);
      if (res.data) {
        localStorage.setItem('labData', JSON.stringify(res.data));
      }
      setUploadSuccess(true);
      setStatusMessage('Documents uploaded successfully! Admin will verify your profile shortly.');
      setShowStatusModal(true);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload documents. Please try again.');
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#08B36A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Verifying Lab Profile...</p>
        </div>
      </div>
    );
  }

  const labData = lab || JSON.parse(localStorage.getItem('labData') || '{}');
  const currentStatus = labData.profileStatus || 'Incomplete';
  const isLocked = currentStatus === 'Pending';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. STATUS MODAL */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center">
            <StatusIcon status={uploadSuccess ? 'Success' : currentStatus} />
            <h3 className="text-xl font-bold text-gray-800 mt-4 mb-2">
              {uploadSuccess ? 'Submission Received' : currentStatus === 'Pending' ? 'Under Review' : 'Action Required'}
            </h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">{statusMessage}</p>
            <button
              onClick={() => { setShowStatusModal(false); if (uploadSuccess) window.location.reload(); }}
              className="w-full py-3 rounded-xl text-white font-bold transition-all shadow-lg"
              style={{ backgroundColor: themeColor }}
            >
              {uploadSuccess ? 'Go to Dashboard' : 'Got it'}
            </button>
          </div>
        </div>
      )}

      {/* 2. HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <HiArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Lab Documentation</h1>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${currentStatus === 'Approved' ? 'bg-green-500' : currentStatus === 'Pending' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status: {currentStatus}</p>
              </div>
            </div>
          </div>
          {currentStatus !== 'Pending' && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ backgroundColor: themeColor }}
              className="px-8 py-2.5 rounded-lg text-white font-bold text-sm shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Submit for Verification"}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">

          {/* 3. LEFT COLUMNS: UPLOADS */}
          <div className={`lg:col-span-2 space-y-6 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UploadCard title="Lab Image" required files={previews.labImages} onUpload={(e) => handleFileChange('labImages', e)} onRemove={(i) => removeFile('labImages', i)} />
              <UploadCard title="Lab Certificate" required files={previews.labCertificates} onUpload={(e) => handleFileChange('labCertificates', e)} onRemove={(i) => removeFile('labCertificates', i)} />
              <UploadCard title="Lab License" required files={previews.labLicenses} onUpload={(e) => handleFileChange('labLicenses', e)} onRemove={(i) => removeFile('labLicenses', i)} />
              <UploadCard title="GST Certificate" optional files={previews.gstCertificates} onUpload={(e) => handleFileChange('gstCertificates', e)} onRemove={(i) => removeFile('gstCertificates', i)} />
              <UploadCard title="Drug License Docs" required files={previews.drugLicenses} onUpload={(e) => handleFileChange('drugLicenses', e)} onRemove={(i) => removeFile('drugLicenses', i)} />
              <UploadCard title="Other Certificates" optional files={previews.otherCertificates} onUpload={(e) => handleFileChange('otherCertificates', e)} onRemove={(i) => removeFile('otherCertificates', i)} />
            </div>
          </div>

          {/* 4. RIGHT COLUMN: DETAILS & PROGRESS */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-24">
              {/* Metadata Card */}
              <div className={`bg-white rounded-2xl p-6 border border-gray-200 shadow-sm ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                <h3 className="text-md font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <HiCheckCircle className="text-[#08B36A]" size={20} /> Professional Details
                </h3>

                <div className="space-y-4">
                  <DetailInput label="State" type="select" value={metadata.documentState} onChange={(val) => setMetadata({ ...metadata, documentState: val })} options={["Punjab", "Delhi", "Haryana", "UP", "Maharashtra", "Karnataka"]} />
                  <DetailInput label="Issuing Authority" placeholder="e.g. Health Ministry" value={metadata.issuingAuthority} onChange={(val) => setMetadata({ ...metadata, issuingAuthority: val })} />
                  <DetailInput label="GST Number" placeholder="15 Digit GSTIN" value={metadata.gstNumber} onChange={(val) => setMetadata({ ...metadata, gstNumber: val })} />
                  <DetailInput label="Awards / Experience" placeholder="Years of experience or key awards" value={metadata.experience} onChange={(val) => setMetadata({ ...metadata, experience: val })} />

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Drug License Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Retail', 'Wholesale', 'Restricted', 'Blood Bank', 'None'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setMetadata({ ...metadata, drugLicenseType: t })}
                          className={`py-2 rounded-lg border text-[10px] font-bold transition-all ${metadata.drugLicenseType === t ? 'bg-green-50 border-[#08B36A] text-[#08B36A]' : 'bg-white border-gray-200 text-gray-500'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Card */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-600">Verification Progress</span>
                  <span className="text-xs font-black text-[#08B36A]">
                    {Math.round((Object.values(documents).filter(a => a.length > 0).length / 6) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-[#08B36A] h-1.5 rounded-full transition-all duration-700" style={{ width: `${(Object.values(documents).filter(a => a.length > 0).length / 6) * 100}%` }}></div>
                </div>
                {isLocked && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2">
                    <HiOutlineClock className="text-amber-600 mt-0.5" />
                    <p className="text-[10px] text-amber-700 leading-tight">Your changes are locked while the admin reviews your initial submission.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- SUB-COMPONENTS ---

const StatusIcon = ({ status }) => {
  if (status === 'Success') return <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500"><HiCheckCircle size={48} /></div>
  if (status === 'Pending') return <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500"><HiOutlineClock size={48} /></div>
  return <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500"><HiOutlineExclamation size={48} /></div>
}

const UploadCard = ({ title, required, files, onUpload, onRemove }) => {
  const inputRef = useRef(null);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-700">{title} {required && <span className="text-red-400">*</span>}</h3>
        {files.length > 0 && <span className="text-[10px] font-black text-[#08B36A]">{files.length} Added</span>}
      </div>

      {files.length === 0 ? (
        <div onClick={() => inputRef.current.click()} className="flex-1 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center p-8 bg-gray-50/50 hover:bg-green-50/30 cursor-pointer group transition-all">
          <HiOutlineCloudUpload size={28} className="text-gray-300 group-hover:text-[#08B36A] mb-2" />
          <p className="text-[11px] font-bold text-gray-500">Upload Document</p>
        </div>
      ) : (
        <div className="flex-1 space-y-2 max-h-[150px] overflow-y-auto">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100 group">
              <div className="flex items-center gap-2 truncate">
                <HiOutlineDocumentText className="text-[#08B36A] shrink-0" />
                <span className="text-[10px] font-bold text-gray-600 truncate">{f.name}</span>
              </div>
              <button onClick={() => onRemove(i)} className="text-gray-400 hover:text-red-500"><HiX size={14} /></button>
            </div>
          ))}
          <button onClick={() => inputRef.current.click()} className="w-full py-2 border border-dashed border-gray-200 rounded-lg text-[10px] font-bold text-gray-400 hover:text-[#08B36A]">+ Add More</button>
        </div>
      )}
      <input type="file" multiple ref={inputRef} className="hidden" onChange={onUpload} accept="image/*,.pdf" />
    </div>
  )
}

const DetailInput = ({ label, placeholder, type = "text", value, onChange, options = [] }) => (
  <div>
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">{label}</label>
    {type === "select" ? (
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#08B36A] transition-all">
        <option value="">Select {label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full p-3 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#08B36A] transition-all" />
    )}
  </div>
)

export default LabDocumentUploadPage;