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
    HiChevronDown,
    HiOutlineBadgeCheck
} from 'react-icons/hi'

export default function LabVerificationPage() {
    const themeColor = "#08B36A"
    const router = useRouter()
    const { uploadLabDocuments, loading } = useAuth()

    // --- STATES ---
    const [status, setStatus] = useState('Incomplete')

    // Exact text parameters matching your lab verification API schema
    const [metadata, setMetadata] = useState({
        documentState: "",
        issuingAuthority: "",
        gstNumber: "",
        experience: "",             // e.g., "5 Years"
        drugLicenseType: "Retail",  // e.g., "Retail"
        about: ""                   // e.g., "High quality lab testing services."
    })

    // Exact file parameters matching your lab verification API schema
    const [files, setFiles] = useState({
        profileImage: null,         // Single File
        labImages: [],              // Array (Max 10)
        labCertificates: [],        // Array (Max 10)
        labLicenses: [],            // Array (Max 10)
        gstCertificates: [],        // Array (Max 5)
        drugLicenses: [],           // Array (Max 5)
        otherCertificates: []       // Array (Max 10)
    })

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("labProvider") || "{}")
        const currentStatus = userData.profileStatus || 'Incomplete'

        if (currentStatus === 'Approved') {
            router.push('/vendors/labvendor/dashboard')
        }
        setStatus(currentStatus)
    }, [router])

    const isPending = status === 'Pending'
    const isRejected = status === 'Rejected'

    // --- HANDLERS ---
    const handleLogout = () => {
        localStorage.removeItem("labToken")
        router.push('/');
    };

    // Handler for single and multiple file selections (strictly matching non-bracket key requirements)
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

    const handleSubmit = async () => {
        // Validation check for mandatory info & documents
        if (!metadata.documentState || !metadata.issuingAuthority || !metadata.experience || !metadata.drugLicenseType) {
            return alert("Please fill in all required laboratory details (*) in the sidebar.")
        }
        if (!files.profileImage || files.labLicenses.length === 0 || files.labCertificates.length === 0) {
            return alert("Please upload all mandatory documents (*) before submitting.")
        }

        const fd = new FormData()

        // 1. Append Text Data (Body Data) matching API expectations exactly
        fd.append('documentState', metadata.documentState)
        fd.append('issuingAuthority', metadata.issuingAuthority)
        fd.append('gstNumber', metadata.gstNumber || "")
        fd.append('experience', metadata.experience)
        fd.append('drugLicenseType', metadata.drugLicenseType)
        fd.append('about', metadata.about || "")

        // 2. Append Files strictly using loop-append for arrays
        Object.entries(files).forEach(([key, val]) => {
            if (!val) return;
            if (Array.isArray(val)) {
                val.forEach(file => {
                    fd.append(key, file)
                })
            } else {
                fd.append(key, val)
            }
        })

        try {
            await uploadLabDocuments(fd)
            alert("Lab verification profile submitted successfully!")
            window.location.reload()
        } catch (e) {
            alert(typeof e === 'string' ? e : "Upload failed. Please try again.")
        }
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
                            <h1 className="text-xl font-extrabold tracking-tight text-slate-800">Lab Verification</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`h-2 w-2 rounded-full animate-pulse ${isPending ? 'bg-amber-500' : isRejected ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Status: {status}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <button
                            onClick={handleLogout}
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
                                {loading ? "Processing..." : isRejected ? "Re-submit for Review" : "Continue Application"}
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
                                <h4 className="text-red-800 font-bold">Verification Rejected</h4>
                                <p className="text-red-600/80 text-sm mt-1">Admin has declined your previous submission. Please provide valid laboratory credentials to continue.</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Required Laboratory Documents</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Profile Image (Single file - Required) */}
                            <UploadCard
                                title="Lab Profile Picture"
                                id="profileImage"
                                required
                                file={files.profileImage}
                                onChange={handleFileChange}
                            />

                            {/* Lab Licenses (Multiple files - Required) */}
                            <UploadCard
                                title="Lab License Documents"
                                id="labLicenses"
                                required
                                isMultiple
                                maxFiles={10}
                                file={files.labLicenses}
                                onChange={handleFileChange}
                            />

                            {/* Lab Certificates (Multiple files - Required) */}
                            <UploadCard
                                title="Lab Registration Certificates"
                                id="labCertificates"
                                required
                                isMultiple
                                maxFiles={10}
                                file={files.labCertificates}
                                onChange={handleFileChange}
                            />

                            {/* Drug Licenses (Multiple files - Optional) */}
                            <UploadCard
                                title="Drug Licenses (If any)"
                                id="drugLicenses"
                                isMultiple
                                maxFiles={5}
                                file={files.drugLicenses}
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Additional Infrastructure & Support Credentials</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Lab Setup Images (Multiple files - Optional) */}
                            <UploadCard
                                title="Lab Setup / Infrastructure Photos"
                                id="labImages"
                                isMultiple
                                maxFiles={10}
                                file={files.labImages}
                                onChange={handleFileChange}
                            />

                            {/* GST Certificates (Multiple files - Optional) */}
                            <UploadCard
                                title="GST Verification Files"
                                id="gstCertificates"
                                isMultiple
                                maxFiles={5}
                                file={files.gstCertificates}
                                onChange={handleFileChange}
                            />

                            {/* Other Certificates (Multiple files - Optional) */}
                            <UploadCard
                                title="Miscellaneous Documents"
                                id="otherCertificates"
                                isMultiple
                                maxFiles={10}
                                file={files.otherCertificates}
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                </div>

                {/* --- SIDEBAR: DETAILS --- */}
                <div className="lg:col-span-4 space-y-6">
                    <div className={`bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6 ${isPending ? 'opacity-40 pointer-events-none' : ''}`}>
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <HiOutlineBadgeCheck className="text-green-500" size={24} />
                            Laboratory Info
                        </h2>

                        <div className="space-y-4">
                            {/* Operating State */}
                            <div className="group">
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
                                        <option value="Punjab">Punjab</option>
                                        <option value="Maharashtra">Maharashtra</option>
                                        <option value="Karnataka">Karnataka</option>
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
                                    placeholder="e.g. Health Ministry"
                                    className="w-full mt-2 bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#08B36A] rounded-2xl p-4 transition-all font-semibold outline-none"
                                    onChange={(e) => setMetadata({ ...metadata, issuingAuthority: e.target.value })}
                                />
                            </div>

                            {/* Laboratory Experience string */}
                            <div>
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Laboratory Experience <span className="text-red-500">*</span></label>
                                <input
                                    disabled={isPending}
                                    type="text"
                                    value={metadata.experience}
                                    placeholder="e.g. 5 Years"
                                    className="w-full mt-2 bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#08B36A] rounded-2xl p-4 transition-all font-semibold outline-none"
                                    onChange={(e) => setMetadata({ ...metadata, experience: e.target.value })}
                                />
                            </div>

                            {/* Drug License Type Option selection */}
                            <div>
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Drug License Type <span className="text-red-500">*</span></label>
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

                            {/* Laboratory Description */}
                            <div>
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">About Lab</label>
                                <textarea
                                    disabled={isPending}
                                    rows="3"
                                    value={metadata.about}
                                    placeholder="e.g. High quality lab testing services."
                                    className="w-full mt-2 bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#08B36A] rounded-2xl p-4 transition-all font-semibold outline-none resize-none"
                                    onChange={(e) => setMetadata({ ...metadata, about: e.target.value })}
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
                        </div>
                    </div>

                    {/* Pending Review Tracker */}
                    {isPending && (
                        <div className="bg-amber-50 p-7 rounded-[2.5rem] border border-amber-100 flex flex-col items-center text-center gap-3 animate-pulse">
                            <div className="bg-amber-500/10 p-3 rounded-full text-amber-600">
                                <HiOutlineClock size={32} />
                            </div>
                            <h4 className="text-amber-800 font-bold">Verification in Progress</h4>
                            <p className="text-amber-700/70 text-xs leading-relaxed font-medium">
                                Your laboratory credentials are under manual review by our medical verification team. This usually takes 24-48 hours.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

function UploadCard({ title, id, file, onChange, required, isMultiple = false, maxFiles = 1 }) {

    const hasFiles = isMultiple ? (file && file.length > 0) : !!file

    return (
        <div className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-5">
                <h3 className="font-bold text-slate-700 leading-tight">
                    {title} {required && <span className="text-red-500">*</span>}
                </h3>
                {hasFiles && <HiOutlineCheckCircle className="text-green-500" size={22} />}
            </div>

            <label className="relative block border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center cursor-pointer group-hover:bg-green-50/20 group-hover:border-green-300 transition-all">
                <input
                    type="file"
                    hidden
                    multiple={isMultiple}
                    onChange={(e) => onChange(id, e, isMultiple)}
                    accept="image/*,application/pdf"
                />

                {hasFiles ? (
                    <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                        <div className="bg-green-100 p-4 rounded-2xl text-green-600 mb-3">
                            <HiOutlineDocumentText size={32} />
                        </div>
                        {isMultiple ? (
                            <div>
                                <p className="text-xs font-bold text-slate-700">{file.length} Files Selected</p>
                                <div className="max-h-20 overflow-y-auto mt-2 text-[10px] text-slate-400 font-semibold space-y-1">
                                    {file.map((f, i) => (
                                        <p key={i} className="truncate max-w-[200px]">{f.name}</p>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs font-bold text-slate-700 truncate max-w-[200px] px-2">{file.name}</p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-2 uppercase font-black tracking-widest">Replace File</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="bg-slate-50 group-hover:bg-green-100 p-5 rounded-[1.5rem] text-slate-400 group-hover:text-[#08B36A] transition-all mb-4">
                            <HiOutlineCloudUpload size={36} />
                        </div>
                        <p className="text-sm font-bold text-slate-600">Select Document</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">
                            {isMultiple ? `Up to ${maxFiles} files` : 'Single file'} (JPG, PNG, or PDF up to 5MB)
                        </p>
                    </div>
                )}
            </label>
        </div>
    )
}