'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import {
    HiOutlineCloudUpload,
    HiOutlineLogout,
    HiOutlineArrowLeft,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineExclamationCircle,
    HiOutlineDocumentText,
    HiChevronDown
} from 'react-icons/hi'

export default function PharmacyVerificationPage() {
    const themeColor = "#08B36A"
    const router = useRouter()
    const { uploadPharmacyDocuments, loading } = useAuth()

    // --- STATES ---
    const [status, setStatus] = useState('Incomplete')

    // Exact text keys matching your API schema
    const [metadata, setMetadata] = useState({
        documentState: "",
        issuingAuthority: "",
        gstNumber: "",
        drugLicenseType: "Retail", // Default to standard Retail
        about: "",
        isHomeDeliveryAvailable: "false",
        is24x7: "false"
    })

    // Exact file keys matching your API schema (both single and arrays)
    const [files, setFiles] = useState({
        profileImage: null,          // Single File
        pharmacyImages: [],          // Array of Files
        pharmacyCertificates: [],    // Array of Files
        pharmacyLicenses: [],        // Array of Files
        gstCertificates: [],         // Array of Files
        drugLicenses: [],            // Array of Files
        otherCertificates: []        // Array of Files
    })

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("pharmacyProvider") || "{}")
        const currentStatus = user.profileStatus || 'Incomplete'

        if (currentStatus === 'Approved') {
            router.push('/vendors/pharmacy/dashboard')
        }
        setStatus(currentStatus)
    }, [router])

    const isPending = status === 'Pending'
    const isRejected = status === 'Rejected'

    // --- FILE SELECTION HANDLER ---
    const handleFileChange = (key, e, isMultiple = false) => {
        if (isMultiple) {
            const selectedFiles = Array.from(e.target.files)
            setFiles(prev => ({ ...prev, [key]: selectedFiles }))
        } else {
            const file = e.target.files[0]
            if (file) {
                setFiles(prev => ({ ...prev, [key]: file }))
            }
        }
    }

    // --- DOCUMENT SUBMISSION HANDLER ---
    const handleSubmit = async () => {
        // Validation check for mandatory items
        if (!metadata.documentState || !metadata.issuingAuthority || !metadata.drugLicenseType) {
            return alert("Please fill in all required operating details (*) in the sidebar.")
        }
        if (!files.profileImage || files.drugLicenses.length === 0 || files.pharmacyLicenses.length === 0) {
            return alert("Please upload all mandatory documents (*) before submitting.")
        }

        const fd = new FormData()

        // 1. Append Text Data (Body Data)
        fd.append('documentState', metadata.documentState)
        fd.append('issuingAuthority', metadata.issuingAuthority)
        fd.append('gstNumber', metadata.gstNumber || "")
        fd.append('drugLicenseType', metadata.drugLicenseType)
        fd.append('about', metadata.about || "")
        fd.append('isHomeDeliveryAvailable', metadata.isHomeDeliveryAvailable)
        fd.append('is24x7', metadata.is24x7)

        // 2. Append Files strictly matching documented key rules (no brackets in keys)
        Object.entries(files).forEach(([key, val]) => {
            if (!val) return;
            if (Array.isArray(val)) {
                // Loop append identical key name without array brackets
                val.forEach(file => {
                    fd.append(key, file)
                })
            } else {
                fd.append(key, val)
            }
        })

        try {
            await uploadPharmacyDocuments(fd)
            alert("Documents submitted successfully for approval!")
            window.location.reload()
        } catch (e) {
            alert(e || "Upload failed. Try again.")
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("pharmacyToken");
        router.push('/');
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-green-100">
            {/* --- TOP NAVIGATION BAR --- */}
            <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.back()}
                            className="p-2.5 hover:bg-slate-100 rounded-full transition-all text-slate-500"
                        >
                            <HiOutlineArrowLeft size={22} />
                        </button>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight text-slate-800">Verification Center</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`h-2 w-2 rounded-full animate-pulse ${isPending ? 'bg-amber-500' : isRejected ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Current Status: {status}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => handleLogout}
                            className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-red-500 transition-colors"
                        >
                            <HiOutlineLogout size={20} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                        {!isPending && (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                style={{ background: themeColor }}
                                className="px-8 py-3 rounded-2xl text-white font-bold shadow-lg shadow-green-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? "Uploading..." : isRejected ? "Re-submit Profile" : "Submit for Approval"}
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* --- MAIN CONTENT: UPLOADS --- */}
                <div className={`lg:col-span-8 space-y-8 ${isPending ? 'opacity-40 grayscale-[0.5] pointer-events-none select-none' : ''}`}>

                    {/* Rejection Alert */}
                    {isRejected && (
                        <div className="bg-red-50 border border-red-100 p-5 rounded-3xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="bg-red-500 p-2 rounded-xl text-white">
                                <HiOutlineExclamationCircle size={24} />
                            </div>
                            <div>
                                <h4 className="text-red-800 font-bold">Action Required: Application Rejected</h4>
                                <p className="text-red-600/80 text-sm mt-1">Admin has declined your previous submission. Please re-upload clear and valid documents to continue.</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Required Pharmacy Credentials</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Profile Image (Single file - Required) */}
                            <UploadCard
                                title="Pharmacy Profile Image"
                                id="profileImage"
                                required
                                file={files.profileImage}
                                onChange={handleFileChange}
                            />

                            {/* Drug Licenses (Multiple files - Required) */}
                            <UploadCard
                                title="Drug License Copies"
                                id="drugLicenses"
                                required
                                isMultiple
                                maxFiles={5}
                                file={files.drugLicenses}
                                onChange={handleFileChange}
                            />

                            {/* Pharmacy Licenses (Multiple files - Required) */}
                            <UploadCard
                                title="Pharmacy Registration License"
                                id="pharmacyLicenses"
                                required
                                isMultiple
                                maxFiles={10}
                                file={files.pharmacyLicenses}
                                onChange={handleFileChange}
                            />

                            {/* GST Certificates (Multiple files - Optional) */}
                            <UploadCard
                                title="GST Certificates"
                                id="gstCertificates"
                                isMultiple
                                maxFiles={5}
                                file={files.gstCertificates}
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Additional Gallery & Documentations</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Pharmacy Images (Multiple files - Optional) */}
                            <UploadCard
                                title="Pharmacy Gallery Images"
                                id="pharmacyImages"
                                isMultiple
                                maxFiles={10}
                                file={files.pharmacyImages}
                                onChange={handleFileChange}
                            />

                            {/* Pharmacy Certificates (Multiple files - Optional) */}
                            <UploadCard
                                title="Pharmacy Registration Certificates"
                                id="pharmacyCertificates"
                                isMultiple
                                maxFiles={10}
                                file={files.pharmacyCertificates}
                                onChange={handleFileChange}
                            />

                            {/* Other Certificates (Multiple files - Optional) */}
                            <UploadCard
                                title="Other Supporting Certificates"
                                id="otherCertificates"
                                isMultiple
                                maxFiles={10}
                                file={files.otherCertificates}
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                </div>

                {/* --- SIDEBAR: BUSINESS DETAILS --- */}
                <div className="lg:col-span-4 space-y-6">
                    <div className={`bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6 ${isPending ? 'opacity-40 pointer-events-none' : ''}`}>
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <HiOutlineCheckCircle className="text-green-500" size={24} />
                            Business Details
                        </h2>

                        <div className="space-y-5">
                            {/* Document State */}
                            <div>
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Operating State <span className="text-red-500">*</span></label>
                                <div className="relative mt-2">
                                    <select
                                        disabled={isPending}
                                        value={metadata.documentState}
                                        className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#08B36A] rounded-2xl p-4 appearance-none transition-all font-semibold outline-none"
                                        onChange={(e) => setMetadata({ ...metadata, documentState: e.target.value })}
                                    >
                                        <option value="">Select State</option>
                                        <option value="Delhi">Delhi</option>
                                        <option value="Maharashtra">Maharashtra</option>
                                        <option value="Karnataka">Karnataka</option>
                                        <option value="Punjab">Punjab</option>
                                        <option value="Haryana">Haryana</option>
                                    </select>
                                    <HiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>

                            {/* Issuing Authority */}
                            <div>
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Issuing Authority <span className="text-red-500">*</span></label>
                                <input
                                    disabled={isPending}
                                    type="text"
                                    value={metadata.issuingAuthority}
                                    placeholder="e.g. Drug Control Administration"
                                    className="w-full mt-2 bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#08B36A] rounded-2xl p-4 transition-all font-semibold outline-none"
                                    onChange={(e) => setMetadata({ ...metadata, issuingAuthority: e.target.value })}
                                />
                            </div>

                            {/* GST Number */}
                            <div>
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">GST Number</label>
                                <input
                                    disabled={isPending}
                                    type="text"
                                    value={metadata.gstNumber}
                                    placeholder="e.g. 03AABCU9603R1ZN"
                                    className="w-full mt-2 bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#08B36A] rounded-2xl p-4 transition-all font-semibold outline-none"
                                    onChange={(e) => setMetadata({ ...metadata, gstNumber: e.target.value })}
                                />
                            </div>

                            {/* Drug License Type Selection */}
                            <div>
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">License Category <span className="text-red-500">*</span></label>
                                <div className="relative mt-2">
                                    <select
                                        disabled={isPending}
                                        value={metadata.drugLicenseType}
                                        className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#08B36A] rounded-2xl p-4 appearance-none transition-all font-semibold outline-none"
                                        onChange={(e) => setMetadata({ ...metadata, drugLicenseType: e.target.value })}
                                    >
                                        <option value="Retail">Retail</option>
                                        <option value="Wholesale">Wholesale</option>
                                        <option value="Restricted">Restricted</option>
                                        <option value="Blood Bank">Blood Bank</option>
                                        <option value="None">None</option>
                                    </select>
                                    <HiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>

                            {/* About Pharmacy */}
                            <div>
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">About Pharmacy</label>
                                <textarea
                                    disabled={isPending}
                                    rows="3"
                                    value={metadata.about}
                                    placeholder="Brief description about your physical store..."
                                    className="w-full mt-2 bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#08B36A] rounded-2xl p-4 transition-all font-semibold outline-none resize-none"
                                    onChange={(e) => setMetadata({ ...metadata, about: e.target.value })}
                                />
                            </div>

                            {/* Home Delivery Available Toggle */}
                            <div className="flex items-center justify-between border-t pt-4">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-700">Home Delivery Available</h4>
                                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Do you ship products locally?</p>
                                </div>
                                <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                                    {['true', 'false'].map(opt => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setMetadata({ ...metadata, isHomeDeliveryAvailable: opt })}
                                            className={`px-3 py-1 text-[11px] font-extrabold rounded-lg capitalize transition-all ${metadata.isHomeDeliveryAvailable === opt ? 'bg-white text-[#08B36A] shadow-xs' : 'text-slate-400'}`}
                                        >
                                            {opt === 'true' ? 'Yes' : 'No'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 24x7 Support Toggle */}
                            <div className="flex items-center justify-between border-t pt-4">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-700">Open 24/7</h4>
                                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Is pharmacy open round-the-clock?</p>
                                </div>
                                <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                                    {['true', 'false'].map(opt => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setMetadata({ ...metadata, is24x7: opt })}
                                            className={`px-3 py-1 text-[11px] font-extrabold rounded-lg capitalize transition-all ${metadata.is24x7 === opt ? 'bg-white text-[#08B36A] shadow-xs' : 'text-slate-400'}`}
                                        >
                                            {opt === 'true' ? 'Yes' : 'No'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Status Card */}
                    {isPending && (
                        <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex flex-col items-center text-center gap-3 animate-pulse">
                            <div className="bg-amber-500/10 p-3 rounded-full text-amber-600">
                                <HiOutlineClock size={32} />
                            </div>
                            <h4 className="text-amber-800 font-bold">Under Review</h4>
                            <p className="text-amber-700/70 text-xs leading-relaxed">
                                Our admin team is currently verifying your documents. You will be notified once the process is complete.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

function UploadCard({ title, id, file, onChange, required, isMultiple = false, maxFiles = 1 }) {

    // Evaluate if there are files uploaded
    const hasFiles = isMultiple ? (file && file.length > 0) : !!file

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-slate-700 leading-tight">
                    {title} {required && <span className="text-red-500">*</span>}
                </h3>
                {hasFiles && <HiOutlineCheckCircle className="text-green-500" size={20} />}
            </div>

            <label className="relative block border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer group-hover:bg-slate-50/50 group-hover:border-green-300 transition-all">
                <input
                    type="file"
                    hidden
                    multiple={isMultiple}
                    onChange={(e) => onChange(id, e, isMultiple)}
                    accept="image/*,application/pdf"
                />

                {hasFiles ? (
                    <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                        <div className="bg-green-100 p-3 rounded-xl text-green-600 mb-2">
                            <HiOutlineDocumentText size={28} />
                        </div>
                        {isMultiple ? (
                            <div>
                                <p className="text-xs font-bold text-slate-600">{file.length} Files Selected</p>
                                <div className="max-h-20 overflow-y-auto mt-2 text-[10px] text-slate-400 font-semibold space-y-1">
                                    {file.map((f, i) => (
                                        <p key={i} className="truncate max-w-[200px]">{f.name}</p>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs font-bold text-slate-600 truncate max-w-full px-4">{file.name}</p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Click to replace</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="bg-slate-50 group-hover:bg-green-50 p-4 rounded-2xl text-slate-400 group-hover:text-[#08B36A] transition-colors mb-3">
                            <HiOutlineCloudUpload size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-500">Tap to upload</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">
                            {isMultiple ? `Up to ${maxFiles} files` : 'Single file'} (JPG, PNG, PDF up to 5MB)
                        </p>
                    </div>
                )}
            </label>
        </div>
    )
}