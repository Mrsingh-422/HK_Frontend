'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import {
  HiOutlineCloudUpload,
  HiOutlineDocumentText,
  HiX,
  HiCheckCircle,
  HiOutlineCamera,
  HiOutlinePhotograph,
  HiArrowLeft,
  HiOutlineClock,
  HiChevronDown,
  HiOutlineBadgeCheck
} from 'react-icons/hi'

function NurseDocumentUploadPage() {
  const themeColor = "#08B36A"
  const router = useRouter()
  const { uploadNurseDocuments, loading, user } = useAuth()

  // --- STATES ---
  const [isChecking, setIsChecking] = useState(true)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // Form Metadata (Based on your image)
  const [metadata, setMetadata] = useState({
    state: "",
    issuingAuthority: "",
    gstNumber: "",
    experience: "",
  })

  // Document Files
  const [documents, setDocuments] = useState({
    nursingCertificates: [],
    licensePhotos: [],
    gstCertificates: [],
    awardCertificates: [],
    otherCertificates: []
  })

  // Previews
  const [previews, setPreviews] = useState({
    nursingCertificates: [],
    licensePhotos: [],
    gstCertificates: [],
    awardCertificates: [],
    otherCertificates: []
  })

  // --- AUTH & STATUS CHECK ---
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("nurseToken");
      const data = localStorage.getItem("nurseProvider");

      if (!token || !data) {
        setIsChecking(false);
        return;
      }

      const nurseUser = JSON.parse(data);
      if (nurseUser.profileStatus === 'Approved') {
        router.push('/vendors/nurse/dashboard');
      } else if (nurseUser.profileStatus === 'Pending') {
        setStatusMessage('Your nursing profile is currently under review.');
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

    setDocuments(prev => ({ ...prev, [category]: [...prev[category], ...files] }));

    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + " KB"
    }));

    setPreviews(prev => ({ ...prev, [category]: [...prev[category], ...newPreviews] }));
  };

  const removeFile = (category, index) => {
    URL.revokeObjectURL(previews[category][index].url);
    setDocuments(prev => ({ ...prev, [category]: prev[category].filter((_, i) => i !== index) }));
    setPreviews(prev => ({ ...prev, [category]: prev[category].filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!metadata.state || !metadata.issuingAuthority || documents.nursingCertificates.length === 0) {
      alert('Please fill required fields and upload your Nursing Certificate.');
      return;
    }

    const formData = new FormData();
    Object.keys(metadata).forEach(key => formData.append(key, metadata[key]));
    Object.keys(documents).forEach(cat => {
      documents[cat].forEach(file => formData.append(cat, file));
    });

    try {
      await uploadNurseDocuments(formData); 
      setUploadSuccess(true);
      setStatusMessage('Nursing documents submitted! Verification usually takes 24-48 hours.');
      setShowStatusModal(true);
    } catch (error) {
      alert('Submission failed. Please try again.');
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#08B36A]"></div>
      </div>
    );
  }

  const currentStatus = user?.profileStatus || 'Incomplete';
  const isLocked = currentStatus === 'Pending';

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
              <HiArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Upload document</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">Verification Process</p>
            </div>
          </div>
          {!isLocked && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ backgroundColor: themeColor }}
              className="px-12 py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:brightness-105 transition-all disabled:opacity-50"
            >
              {loading ? "Processing..." : "Continue"}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT: UPLOAD CARDS */}
          <div className={`lg:col-span-2 space-y-8 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UploadCard
                title="Nursing Certificate"
                required
                files={previews.nursingCertificates}
                onUpload={(e) => handleFileChange('nursingCertificates', e)}
                onRemove={(i) => removeFile('nursingCertificates', i)}
              />
              <UploadCard
                title="License Photo"
                required
                files={previews.licensePhotos}
                onUpload={(e) => handleFileChange('licensePhotos', e)}
                onRemove={(i) => removeFile('licensePhotos', i)}
              />
              <UploadCard
                title="GST Certificate (Optional)"
                optional
                files={previews.gstCertificates}
                onUpload={(e) => handleFileChange('gstCertificates', e)}
                onRemove={(i) => removeFile('gstCertificates', i)}
              />
              <UploadCard
                title="Award/Experience Certificate"
                files={previews.awardCertificates}
                onUpload={(e) => handleFileChange('awardCertificates', e)}
                onRemove={(i) => removeFile('awardCertificates', i)}
              />
              <UploadCard
                title="Other Certificate"
                optional
                files={previews.otherCertificates}
                onUpload={(e) => handleFileChange('otherCertificates', e)}
                onRemove={(i) => removeFile('otherCertificates', i)}
              />
            </div>
          </div>

          {/* RIGHT: PROFESSIONAL DETAILS */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <div className={`bg-white rounded-3xl p-8 border border-gray-100 shadow-sm ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                <h3 className="text-lg font-bold text-gray-800 mb-8 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <HiOutlineBadgeCheck className="text-[#08B36A]" size={20} />
                  </div>
                  Professional Info
                </h3>

                <div className="space-y-6">
                  <DetailInput
                    label="State"
                    type="select"
                    value={metadata.state}
                    onChange={(v) => setMetadata({ ...metadata, state: v })}
                    options={["Delhi", "Punjab", "Maharashtra", "Karnataka", "Tamil Nadu"]}
                  />
                  <DetailInput
                    label="Issuing Authority Name"
                    placeholder="Enter authority name"
                    value={metadata.issuingAuthority}
                    onChange={(v) => setMetadata({ ...metadata, issuingAuthority: v })}
                  />
                  <DetailInput
                    label="GST Certificate Number (Optional)"
                    placeholder="Enter number"
                    value={metadata.gstNumber}
                    onChange={(v) => setMetadata({ ...metadata, gstNumber: v })}
                  />
                  <DetailInput
                    label="Award / Experience"
                    placeholder="Enter Experience"
                    value={metadata.experience}
                    onChange={(v) => setMetadata({ ...metadata, experience: v })}
                  />
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Profile Completion</span>
                  <span className="text-xs font-black text-[#08B36A]">
                    {Math.round((Object.values(documents).filter(a => a.length > 0).length / 5) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#08B36A] h-full transition-all duration-1000 ease-out"
                    style={{ width: `${(Object.values(documents).filter(a => a.length > 0).length / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS MODAL */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[40px] max-w-sm w-full p-10 shadow-2xl text-center scale-up-animation">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${uploadSuccess ? 'bg-green-50 text-green-500' : 'bg-amber-50 text-amber-500'}`}>
              {uploadSuccess ? <HiCheckCircle size={56} /> : <HiOutlineClock size={56} />}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">{uploadSuccess ? 'Success!' : 'Under Review'}</h3>
            <p className="text-sm text-gray-500 mb-10 leading-relaxed font-medium">{statusMessage}</p>
            <button
              onClick={() => { setShowStatusModal(false); if (uploadSuccess) window.location.reload(); }}
              className="w-full py-4 rounded-2xl text-white font-bold transition-all shadow-lg active:scale-95"
              style={{ backgroundColor: themeColor }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// --- SUB-COMPONENTS ---

const UploadCard = ({ title, required, optional, files, onUpload, onRemove }) => {
  const inputRef = useRef(null);
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
      <h3 className="text-[13px] font-bold text-gray-600 mb-4 ml-1">
        {title} {required && <span className="text-red-400">*</span>}
      </h3>

      {files.length === 0 ? (
        <div
          onClick={() => inputRef.current.click()}
          className="flex-1 border-2 border-dashed border-green-100 rounded-3xl flex flex-col items-center justify-center p-8 bg-green-50/10 hover:bg-green-50/30 transition-all cursor-pointer"
        >
          <div className="w-14 h-14 bg-[#08B36A] rounded-full flex items-center justify-center mb-4 text-white shadow-lg shadow-green-200">
            <HiOutlineCloudUpload size={28} />
          </div>
          <p className="text-sm font-bold text-gray-800">Upload Certificate</p>
          <p className="text-[10px] text-gray-400 text-center mt-2 leading-relaxed">
            Ensure the photo is clear and not<br />blurry. JPG, PNG or PDF allowed.
          </p>

          <div className="flex gap-2 mt-6 w-full">
            <div className="flex-1 py-2 rounded-lg bg-[#08B36A] text-white text-[10px] font-bold flex items-center justify-center gap-2">
              <HiOutlineCamera size={14} /> Camera
            </div>
            <div className="flex-1 py-2 rounded-lg bg-gray-50 text-gray-500 border border-gray-100 text-[10px] font-bold flex items-center justify-center gap-2">
              <HiOutlinePhotograph size={14} /> Gallery
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100 group/item">
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <HiOutlineDocumentText className="text-[#08B36A]" size={20} />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-gray-700 truncate">{f.name}</span>
                  <span className="text-[10px] text-gray-400 font-bold">{f.size}</span>
                </div>
              </div>
              <button onClick={() => onRemove(i)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-colors">
                <HiX size={18} />
              </button>
            </div>
          ))}
          <button
            onClick={() => inputRef.current.click()}
            className="w-full py-3 border-2 border-dashed border-gray-100 rounded-2xl text-xs font-bold text-gray-400 hover:text-[#08B36A] hover:border-[#08B36A] transition-all"
          >
            + Add Another File
          </button>
        </div>
      )}
      <input type="file" multiple ref={inputRef} className="hidden" onChange={onUpload} accept="image/*,.pdf" />
    </div>
  )
}

const DetailInput = ({ label, placeholder, type = "text", value, onChange, options = [] }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative">
      {type === "select" ? (
        <>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-[#08B36A]/10 focus:border-[#08B36A] appearance-none transition-all"
          >
            <option value="">Select state</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <HiChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-[#08B36A]/10 focus:border-[#08B36A] transition-all placeholder:text-gray-300"
        />
      )}
    </div>
  </div>
)

export default NurseDocumentUploadPage;