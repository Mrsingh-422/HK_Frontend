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
 
export default function NurseVerificationPage() {
    const themeColor = "#08B36A"
    const router = useRouter()
    const { uploadNurseDocuments, loading, logout } = useAuth()
 
    // --- STATES ---
    const [status, setStatus] = useState('Incomplete')
    // Fix 1: Changed "experience" to "experienceYears" to match backend
    const [metadata, setMetadata] = useState({ state: "", authority: "", experienceYears: "", gstNumber: "" })
    const [files, setFiles] = useState({})
 
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("nursingProvider") || "{}")
        const currentStatus = userData.profileStatus || 'Incomplete'
       
        if (currentStatus === 'Approved') {
            router.push('/vendors/nursevendor/nursedashboard')
        }
        setStatus(currentStatus)
    }, [router])
 
    const isPending = status === 'Pending'
    const isRejected = status === 'Rejected'
 
    // --- HANDLERS ---
    const handleLogout = () => {
        logout();
        router.push('/');
    };
 
    const handleFile = (key, e) => {
        const file = e.target.files[0]
        if (file) setFiles(prev => ({ ...prev, [key]: file }))
    }
 
    const handleSubmit = async () => {
        // Fix 2: Used plural keys in validation matching the updated IDs
        if (!metadata.state || !files.nursingCertificates || !files.licensePhotos) {
            return alert("Please upload mandatory documents (*) and select your state.")
        }
       
        const fd = new FormData()
       
        // Append text data (Only if they exist to prevent sending empty strings)
        Object.entries(metadata).forEach(([k, v]) => {
            if (v) fd.append(k, v)
        })
 
        // Append files
        Object.entries(files).forEach(([k, v]) => {
            if (v) fd.append(k, v)
        })
       
        try {
            await uploadNurseDocuments(fd)
            alert("Application submitted for verification!")
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
                            <HiOutlineArrowLeft size={22}/>
                        </button>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight text-slate-800">Nurse Verification</h1>
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
                            <HiOutlineLogout size={20}/>
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
                                <HiOutlineExclamationCircle size={24}/>
                            </div>
                            <div>
                                <h4 className="text-red-800 font-bold">Verification Rejected</h4>
                                <p className="text-red-600/80 text-sm mt-1">Admin has declined your previous submission. Please provide valid nursing credentials to continue.</p>
                            </div>
                        </div>
                    )}
 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Fix 3: Updated keys to Plural exactly as Postman / Backend expects */}
                        <UploadCard
                            title="Nursing Certificate"
                            id="nursingCertificates"
                            required
                            file={files.nursingCertificates}
                            onChange={handleFile}
                        />
                        <UploadCard
                            title="Professional License Photo"
                            id="licensePhotos"
                            required
                            file={files.licensePhotos}
                            onChange={handleFile}
                        />
                        <UploadCard
                            title="Award / Experience Letter"
                            id="experienceCertificates"
                            file={files.experienceCertificates}
                            onChange={handleFile}
                        />
                        <UploadCard
                            title="Identity / Other Certificate"
                            id="otherCertificates"
                            file={files.otherCertificates}
                            onChange={handleFile}
                        />
                    </div>
                </div>
 
                {/* --- SIDEBAR: DETAILS --- */}
                <div className="lg:col-span-4 space-y-6">
                    <div className={`bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6 ${isPending ? 'opacity-40 pointer-events-none' : ''}`}>
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <HiOutlineBadgeCheck className="text-green-500" size={24}/>
                            Professional Info
                        </h2>
                       
                        <div className="space-y-4">
                            <div className="group">
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Registration State</label>
                                <div className="relative mt-2">
                                    <select
                                        disabled={isPending}
                                        className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#08B36A] rounded-2xl p-4 appearance-none transition-all font-semibold"
                                        onChange={(e) => setMetadata({...metadata, state: e.target.value})}
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
 
                            <div>
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Issuing Authority</label>
                                <input
                                    disabled={isPending}
                                    type="text"
                                    placeholder="Nursing Council Name"
                                    className="w-full mt-2 bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#08B36A] rounded-2xl p-4 transition-all font-semibold"
                                    onChange={(e) => setMetadata({...metadata, authority: e.target.value})}
                                />
                            </div>
 
                            <div>
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Years of Experience</label>
                                <input
                                    disabled={isPending}
                                    type="text"
                                    placeholder="e.g. 5 Years"
                                    className="w-full mt-2 bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#08B36A] rounded-2xl p-4 transition-all font-semibold"
                                    onChange={(e) => setMetadata({...metadata, experienceYears: e.target.value})}
                                />
                            </div>
 
                            <div>
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">GST Number (Optional)</label>
                                <input
                                    disabled={isPending}
                                    type="text"
                                    placeholder="15 Digit GSTIN"
                                    className="w-full mt-2 bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#08B36A] rounded-2xl p-4 transition-all font-semibold"
                                    onChange={(e) => setMetadata({...metadata, gstNumber: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
 
                    {/* Pending Review Tracker */}
                    {isPending && (
                        <div className="bg-amber-50 p-7 rounded-[2.5rem] border border-amber-100 flex flex-col items-center text-center gap-3 animate-pulse">
                            <div className="bg-amber-500/10 p-3 rounded-full text-amber-600">
                                <HiOutlineClock size={32}/>
                            </div>
                            <h4 className="text-amber-800 font-bold">Verification in Progress</h4>
                            <p className="text-amber-700/70 text-xs leading-relaxed font-medium">
                                Your nursing credentials are under manual review by our medical verification team. This usually takes 24-48 hours.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
 
function UploadCard({ title, id, file, onChange, required }) {
    return (
        <div className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-5">
                <h3 className="font-bold text-slate-700 leading-tight">
                    {title} {required && <span className="text-red-500">*</span>}
                </h3>
                {file && <HiOutlineCheckCircle className="text-green-500" size={22}/>}
            </div>
 
            <label className="relative block border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center cursor-pointer group-hover:bg-green-50/20 group-hover:border-green-300 transition-all">
                <input
                    type="file"
                    hidden
                    onChange={(e) => onChange(id, e)}
                    accept="image/*,application/pdf"
                />
               
                {file ? (
                    <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                        <div className="bg-green-100 p-4 rounded-2xl text-green-600 mb-3">
                            <HiOutlineDocumentText size={32}/>
                        </div>
                        <p className="text-xs font-bold text-slate-700 truncate max-w-[200px] px-2">{file.name}</p>
                        <p className="text-[10px] text-slate-400 mt-2 uppercase font-black tracking-widest">Replace File</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="bg-slate-50 group-hover:bg-green-100 p-5 rounded-[1.5rem] text-slate-400 group-hover:text-[#08B36A] transition-all mb-4">
                            <HiOutlineCloudUpload size={36}/>
                        </div>
                        <p className="text-sm font-bold text-slate-600">Select Document</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Click to browse Gallery or Files</p>
                    </div>
                )}
            </label>
        </div>
    )
}
 