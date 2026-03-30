'use client'

import React, { useEffect, useState, useRef } from 'react'
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
    const { uploadPharmacyDocuments, loading, pharmacyUser, logout } = useAuth()

    // --- STATES ---
    const [status, setStatus] = useState('Incomplete') 
    const [metadata, setMetadata] = useState({ state: "", authority: "", drugType: "Retail" })
    const [files, setFiles] = useState({})

    useEffect(() => {
        // Mocking user fetch from localStorage or Context
        const user = JSON.parse(localStorage.getItem("pharmacyProvider") || "{}")
        const currentStatus = user.profileStatus || 'Incomplete'
        
        if (currentStatus === 'Approved') {
            router.push('/vendors/pharmacy/pharmacydashboard')
        }
        setStatus(currentStatus)
    }, [router])

    const isPending = status === 'Pending'
    const isRejected = status === 'Rejected'

    // --- HANDLERS ---
    const handleFile = (key, e) => {
        const file = e.target.files[0]
        if (file) setFiles(prev => ({ ...prev, [key]: file }))
    }

    const handleSubmit = async () => {
        if (!metadata.state || !files.pharmacyImage || !files.drugLicense) {
            return alert("Please upload all mandatory documents (*)")
        }
        
        const fd = new FormData()
        Object.entries(metadata).forEach(([k, v]) => fd.append(k, v))
        Object.entries(files).forEach(([k, v]) => fd.append(k, v))
        
        try {
            await uploadPharmacyDocuments(fd)
            alert("Documents submitted successfully!")
            window.location.reload()
        } catch (e) {
            alert("Upload failed. Try again.")
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
                            <h1 className="text-xl font-extrabold tracking-tight text-slate-800">Verification Center</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`h-2 w-2 rounded-full animate-pulse ${isPending ? 'bg-amber-500' : isRejected ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Current Status: {status}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <button 
                            onClick={() => { logout(); router.push('/') }} 
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
                                <HiOutlineExclamationCircle size={24}/>
                            </div>
                            <div>
                                <h4 className="text-red-800 font-bold">Action Required: Application Rejected</h4>
                                <p className="text-red-600/80 text-sm mt-1">Admin has declined your previous submission. Please re-upload clear and valid documents to continue.</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <UploadCard 
                            title="Pharmacy Image" 
                            id="pharmacyImage" 
                            required 
                            file={files.pharmacyImage} 
                            onChange={handleFile} 
                        />
                        <UploadCard 
                            title="Drug License (Form 20/21)" 
                            id="drugLicense" 
                            required 
                            file={files.drugLicense} 
                            onChange={handleFile} 
                        />
                        <UploadCard 
                            title="GST Certificate" 
                            id="gst" 
                            file={files.gst} 
                            onChange={handleFile} 
                        />
                        <UploadCard 
                            title="Trade / Pharmacy License" 
                            id="pLicense" 
                            required 
                            file={files.pLicense} 
                            onChange={handleFile} 
                        />
                    </div>
                </div>

                {/* --- SIDEBAR: DETAILS --- */}
                <div className="lg:col-span-4 space-y-6">
                    <div className={`bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6 ${isPending ? 'opacity-40 pointer-events-none' : ''}`}>
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <HiOutlineCheckCircle className="text-green-500" size={24}/> 
                            Business Details
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="group">
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Operating State</label>
                                <div className="relative mt-2">
                                    <select 
                                        disabled={isPending}
                                        className="w-full bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#08B36A] rounded-2xl p-4 appearance-none transition-all font-semibold"
                                        onChange={(e) => setMetadata({...metadata, state: e.target.value})}
                                    >
                                        <option value="">Select State</option>
                                        <option value="Delhi">Delhi</option>
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
                                    placeholder="e.g. State Health Dept" 
                                    className="w-full mt-2 bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#08B36A] rounded-2xl p-4 transition-all font-semibold"
                                    onChange={(e) => setMetadata({...metadata, authority: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">License Category</label>
                                <div className="flex gap-3 mt-2">
                                    {['Retail', 'Wholesale'].map(t => (
                                        <button 
                                            key={t}
                                            onClick={() => setMetadata({...metadata, drugType: t})}
                                            className={`flex-1 py-4 rounded-2xl border-2 font-bold text-sm transition-all ${metadata.drugType === t ? 'bg-green-50 border-[#08B36A] text-[#08B36A]' : 'bg-white border-slate-100 text-slate-400'}`}
                                        >
                                            {t}
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
                                <HiOutlineClock size={32}/>
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

function UploadCard({ title, id, file, onChange, required }) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-slate-700 leading-tight">
                    {title} {required && <span className="text-red-500">*</span>}
                </h3>
                {file && <HiOutlineCheckCircle className="text-green-500" size={20}/>}
            </div>

            <label className="relative block border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer group-hover:bg-slate-50/50 group-hover:border-green-300 transition-all">
                <input 
                    type="file" 
                    hidden 
                    onChange={(e) => onChange(id, e)} 
                    accept="image/*,application/pdf"
                />
                
                {file ? (
                    <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                        <div className="bg-green-100 p-3 rounded-xl text-green-600 mb-2">
                            <HiOutlineDocumentText size={28}/>
                        </div>
                        <p className="text-xs font-bold text-slate-600 truncate max-w-full px-4">{file.name}</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Click to replace</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="bg-slate-50 group-hover:bg-green-50 p-4 rounded-2xl text-slate-400 group-hover:text-[#08B36A] transition-colors mb-3">
                            <HiOutlineCloudUpload size={32}/>
                        </div>
                        <p className="text-sm font-bold text-slate-500">Tap to upload</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">JPG, PNG or PDF up to 5MB</p>
                    </div>
                )}
            </label>
        </div>
    )
}