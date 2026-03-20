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
    HiOutlineExclamation,
    HiChevronDown
} from 'react-icons/hi'

function PharmacyDocumentUploadPage() {
    const themeColor = "#08B36A"
    const router = useRouter()
    const { uploadPharmacyDocuments, loading, pharmacyUser } = useAuth()

    // --- STATES ---
    const [isChecking, setIsChecking] = useState(true)
    const [showStatusModal, setShowStatusModal] = useState(false)
    const [statusMessage, setStatusMessage] = useState('')
    const [uploadSuccess, setUploadSuccess] = useState(false)

    // Form Metadata
    const [metadata, setMetadata] = useState({
        state: "",
        issuingAuthority: "",
        gstNumber: "",
        drugLicenseType: "",
    })

    // Document Files
    const [documents, setDocuments] = useState({
        pharmacyImages: [],
        pharmacyCertificates: [],
        pharmacyLicenses: [],
        gstCertificates: [],
        drugLicenses: [],
        otherCertificates: []
    })

    // Previews
    const [previews, setPreviews] = useState({
        pharmacyImages: [],
        pharmacyCertificates: [],
        pharmacyLicenses: [],
        gstCertificates: [],
        drugLicenses: [],
        otherCertificates: []
    })

    // --- AUTH & STATUS CHECK ---
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("pharmacyToken");
            const data = localStorage.getItem("pharmacyProvider");

            if (!token || !data) {
                setIsChecking(false);
                return;
            }

            const user = JSON.parse(data);
            if (user.profileStatus === 'Approved') {
                router.push('/vendors/pharmacy/pharmacydashboard');
            } else if (user.profileStatus === 'Pending') {
                setStatusMessage('Your documents are under review. Please wait for admin approval.');
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
        if (!metadata.state || !metadata.issuingAuthority || documents.pharmacyImages.length === 0) {
            alert('Please fill required fields and upload the mandatory Pharmacy Image.');
            return;
        }

        const formData = new FormData();
        Object.keys(metadata).forEach(key => formData.append(key, metadata[key]));
        Object.keys(documents).forEach(cat => {
            documents[cat].forEach(file => formData.append(cat, file));
        });

        try {
            // await uploadPharmacyDocuments(formData); 
            setUploadSuccess(true);
            setStatusMessage('Documents submitted successfully! Admin will verify your profile shortly.');
            setShowStatusModal(true);
        } catch (error) {
            alert('Upload failed. Please try again.');
        }
    };

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#08B36A]"></div>
            </div>
        );
    }

    const currentStatus = pharmacyUser?.profileStatus || 'Incomplete';
    const isLocked = currentStatus === 'Pending';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 1. HEADER */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <HiArrowLeft size={20} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Pharmacy Verification</h1>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status: {currentStatus}</p>
                        </div>
                    </div>
                    {!isLocked && (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{ backgroundColor: themeColor }}
                            className="px-10 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
                        >
                            {loading ? "Uploading..." : "Submit for Approval"}
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 2. LEFT: UPLOAD CARDS GRID */}
                    <div className={`lg:col-span-2 space-y-6 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <UploadCard
                                title="Pharmacy Image"
                                required
                                files={previews.pharmacyImages}
                                onUpload={(e) => handleFileChange('pharmacyImages', e)}
                                onRemove={(i) => removeFile('pharmacyImages', i)}
                            />
                            <UploadCard
                                title="Pharmacy Certificate"
                                required
                                files={previews.pharmacyCertificates}
                                onUpload={(e) => handleFileChange('pharmacyCertificates', e)}
                                onRemove={(i) => removeFile('pharmacyCertificates', i)}
                            />
                            <UploadCard
                                title="Pharmacy License"
                                required
                                files={previews.pharmacyLicenses}
                                onUpload={(e) => handleFileChange('pharmacyLicenses', e)}
                                onRemove={(i) => removeFile('pharmacyLicenses', i)}
                            />
                            <UploadCard
                                title="GST Certificate"
                                optional
                                files={previews.gstCertificates}
                                onUpload={(e) => handleFileChange('gstCertificates', e)}
                                onRemove={(i) => removeFile('gstCertificates', i)}
                            />
                            <UploadCard
                                title="Drug License"
                                required
                                files={previews.drugLicenses}
                                onUpload={(e) => handleFileChange('drugLicenses', e)}
                                onRemove={(i) => removeFile('drugLicenses', i)}
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

                    {/* 3. RIGHT: SIDEBAR DETAILS */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Form Card */}
                            <div className={`bg-white rounded-2xl p-6 border border-gray-200 shadow-sm ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
                                <h3 className="text-md font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <HiCheckCircle className="text-[#08B36A]" size={20} /> Professional Details
                                </h3>

                                <div className="space-y-5">
                                    <DetailInput
                                        label="State"
                                        type="select"
                                        value={metadata.state}
                                        onChange={(v) => setMetadata({ ...metadata, state: v })}
                                        options={["Delhi", "Punjab", "Haryana", "Maharashtra", "Karnataka"]}
                                    />
                                    <DetailInput
                                        label="Issuing Authority Name"
                                        placeholder="e.g. Health Department"
                                        value={metadata.issuingAuthority}
                                        onChange={(v) => setMetadata({ ...metadata, issuingAuthority: v })}
                                    />
                                    <DetailInput
                                        label="GST Number (Optional)"
                                        placeholder="Enter 15 digit GSTIN"
                                        value={metadata.gstNumber}
                                        onChange={(v) => setMetadata({ ...metadata, gstNumber: v })}
                                    />

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Drug License Type</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['Retail', 'Whole Sale', 'Restricted', 'None'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setMetadata({ ...metadata, drugLicenseType: type })}
                                                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${metadata.drugLicenseType === type ? 'bg-green-50 border-[#08B36A] text-[#08B36A]' : 'bg-white border-gray-200 text-gray-500'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Card */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-gray-500">Completion Status</span>
                                    <span className="text-xs font-black text-[#08B36A]">
                                        {Math.round((Object.values(documents).filter(a => a.length > 0).length / 6) * 100)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-[#08B36A] h-full transition-all duration-700"
                                        style={{ width: `${(Object.values(documents).filter(a => a.length > 0).length / 6) * 100}%` }}
                                    ></div>
                                </div>
                                {isLocked && (
                                    <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2">
                                        <HiOutlineClock className="text-amber-600 mt-0.5" />
                                        <p className="text-[10px] text-amber-700 leading-tight">Documents are under review. Editing is disabled until approval or rejection.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. MODALS */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${uploadSuccess ? 'bg-green-50 text-green-500' : 'bg-amber-50 text-amber-500'}`}>
                            {uploadSuccess ? <HiCheckCircle size={48} /> : <HiOutlineClock size={48} />}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{uploadSuccess ? 'Submitted!' : 'Pending Review'}</h3>
                        <p className="text-sm text-gray-500 mb-8 leading-relaxed">{statusMessage}</p>
                        <button
                            onClick={() => { setShowStatusModal(false); if (uploadSuccess) window.location.reload(); }}
                            className="w-full py-3.5 rounded-xl text-white font-bold transition-all shadow-lg"
                            style={{ backgroundColor: themeColor }}
                        >
                            Close
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
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-700">
                    {title} {required && <span className="text-red-400">*</span>}
                    {optional && <span className="text-[10px] text-gray-400 ml-2 font-normal">(Optional)</span>}
                </h3>
                {files.length > 0 && <span className="text-[10px] font-black text-[#08B36A]">{files.length} Files</span>}
            </div>

            {files.length === 0 ? (
                <div
                    onClick={() => inputRef.current.click()}
                    className="border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center p-10 bg-gray-50/50 hover:bg-green-50/30 hover:border-green-200 cursor-pointer transition-all"
                >
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <HiOutlineCloudUpload size={24} className="text-gray-400 group-hover:text-[#08B36A]" />
                    </div>
                    <p className="text-[11px] font-bold text-gray-500">Click to upload or drag & drop</p>
                    <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-tighter font-medium">PNG, JPG or PDF (MAX 5MB)</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3 truncate">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <HiOutlineDocumentText className="text-[#08B36A]" size={18} />
                                </div>
                                <div className="flex flex-col truncate">
                                    <span className="text-[11px] font-bold text-gray-700 truncate">{f.name}</span>
                                    <span className="text-[9px] text-gray-400 font-bold">{f.size}</span>
                                </div>
                            </div>
                            <button onClick={() => onRemove(i)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors">
                                <HiX size={16} />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => inputRef.current.click()}
                        className="w-full py-2.5 border border-dashed border-gray-200 rounded-xl text-[11px] font-bold text-gray-400 hover:text-[#08B36A] hover:bg-green-50/50 transition-all"
                    >
                        + Add Another Document
                    </button>
                </div>
            )}
            <input type="file" multiple ref={inputRef} className="hidden" onChange={onUpload} accept="image/*,.pdf" />
        </div>
    )
}

const DetailInput = ({ label, placeholder, type = "text", value, onChange, options = [] }) => (
    <div>
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 ml-1">{label}</label>
        <div className="relative">
            {type === "select" ? (
                <>
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] appearance-none transition-all"
                    >
                        <option value="">Select {label}</option>
                        {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <HiChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </>
            ) : (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full p-3.5 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#08B36A]/20 focus:border-[#08B36A] transition-all"
                />
            )}
        </div>
    </div>
)

export default PharmacyDocumentUploadPage;