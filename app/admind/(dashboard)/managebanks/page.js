'use client'

import AdminAPI from '@/app/services/AdminAPI'
import React, { useState, useEffect, useMemo } from 'react'
import {
    FaSearch, FaFilter, FaCheck, FaTimes, FaSpinner,
    FaUniversity, FaUser, FaPhone, FaEnvelope,
    FaUserMd, FaUserNurse, FaMicroscope, FaPrescriptionBottle,
    FaHospital, FaAmbulance, FaExclamationTriangle, FaShieldAlt
} from "react-icons/fa"


export default function BankVerificationPage() {
    // --- Dynamic State ---
    const [pendingBanks, setPendingBanks] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalServerCount, setTotalServerCount] = useState(0)

    // Filter & Search Controls
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 25

    // Verification Action Modal States
    const [selectedBank, setSelectedBank] = useState(null) // bank object
    const [isConfirming, setIsConfirming] = useState(false)
    const [submittingAction, setSubmittingAction] = useState(false)

    // --- Dynamic API Sync ---
    const fetchPendingBanks = async () => {
        try {
            setLoading(true)
            const response = await AdminAPI.getPendingBanks(currentPage, itemsPerPage)
            if (response?.success) {
                setPendingBanks(response.data || [])
                setTotalServerCount(response.count || (response.data ? response.data.length : 0))
            }
        } catch (err) {
            console.error("Error fetching pending bank details:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPendingBanks()
    }, [currentPage])

    // --- Dynamic Live Analytics Calculations ---
    const computedStats = useMemo(() => {
        const stats = {
            totalUnverified: pendingBanks.length,
            Doctor: 0,
            Nurse: 0,
            Lab: 0,
            Pharmacy: 0,
            Hospital: 0,
            Ambulance: 0
        }

        pendingBanks.forEach(b => {
            const model = b.vendorModel
            if (model === "Doctor") stats.Doctor++
            else if (model === "Nurse") stats.Nurse++
            else if (model === "Lab" || model === "Laboratory") stats.Lab++
            else if (model === "Pharmacy") stats.Pharmacy++
            else if (model === "Hospital") stats.Hospital++
            else if (model === "Ambulance") stats.Ambulance++
        })

        return stats
    }, [pendingBanks])

    // Local filter operation on dynamic state
    const filteredBanks = useMemo(() => {
        return pendingBanks.filter(b => {
            const query = searchQuery.toLowerCase()
            const vendorName = b.name?.toLowerCase() || ""
            const email = b.email?.toLowerCase() || ""
            const phone = b.phone || ""
            const bankName = b.bankDetails?.bankName?.toLowerCase() || ""
            const accountNumber = b.bankDetails?.accountNumber || ""
            const ifsc = b.bankDetails?.ifscCode?.toLowerCase() || ""
            const model = b.vendorModel || ""

            const matchesSearch = vendorName.includes(query) ||
                email.includes(query) ||
                phone.includes(query) ||
                bankName.includes(query) ||
                accountNumber.includes(query) ||
                ifsc.includes(query)

            const matchesCategory = selectedCategory === "All" ||
                model.toLowerCase() === selectedCategory.toLowerCase() ||
                (selectedCategory === "Lab" && model === "Laboratory")

            return matchesSearch && matchesCategory
        })
    }, [pendingBanks, searchQuery, selectedCategory])

    // --- Verification Request Trigger ---
    const handleVerifyConfirm = async () => {
        if (!selectedBank) return

        try {
            setSubmittingAction(true)
            const response = await AdminAPI.verifyBank(
                selectedBank.vendorModel,
                selectedBank.vendorId,
                true
            )

            if (response?.success) {
                alert(`Bank details for ${selectedBank.name} verified successfully.`)
                closeModal()
                fetchPendingBanks()
            }
        } catch (err) {
            alert(err?.response?.data?.message || "Verification request failed. Check network parameters.")
        } finally {
            setSubmittingAction(false)
        }
    }

    const closeModal = () => {
        setSelectedBank(null)
        setIsConfirming(false)
    }

    // Dynamic Icon and badge generator for vendor profiles
    const renderVendorTypeBadgeAndIcon = (model) => {
        let icon = <FaUserMd className="text-orange-500" />
        let colorClasses = "bg-orange-50 text-orange-600"
        let label = model || "Doctor"

        if (model === "Nurse") {
            icon = <FaUserNurse className="text-teal-500" />
            colorClasses = "bg-teal-50 text-teal-600"
        } else if (model === "Lab" || model === "Laboratory") {
            icon = <FaMicroscope className="text-blue-500" />
            colorClasses = "bg-blue-50 text-blue-600"
            label = "Laboratory"
        } else if (model === "Pharmacy") {
            icon = <FaPrescriptionBottle className="text-emerald-500" />
            colorClasses = "bg-emerald-50 text-emerald-600"
        } else if (model === "Hospital") {
            icon = <FaHospital className="text-cyan-500" />
            colorClasses = "bg-cyan-50 text-cyan-600"
        } else if (model === "Ambulance") {
            icon = <FaAmbulance className="text-rose-500" />
            colorClasses = "bg-rose-50 text-rose-600"
        }

        return (
            <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-slate-100 flex items-center justify-center">
                    {icon}
                </span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${colorClasses}`}>
                    {label}
                </span>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">

            {/* --- TOP HEADER --- */}
            <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                        Bank <span className="text-[#08B36A]">Verification</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mt-1">Vendor Banking Audits & Profiling</p>
                </div>
            </div>

            {/* --- DYNAMIC STATS OVERVIEW CARDS --- */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#08B36A]/10 flex items-center justify-center text-[#08B36A]">
                            <FaShieldAlt />
                        </div>
                        <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-red-50 text-red-600">
                            Action Required
                        </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pending Audit Queue</p>
                    <p className="text-2xl font-black text-slate-800">{totalServerCount} Unverified Profiles</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900/10 flex items-center justify-center text-slate-900">
                            <FaHospital />
                        </div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Hospitals & Clinics</p>
                    <p className="text-2xl font-black text-slate-800">{computedStats.Hospital} Pending</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <FaUserMd />
                        </div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Medical Professionals</p>
                    <p className="text-2xl font-black text-slate-800">{computedStats.Doctor + computedStats.Nurse} Pending</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <FaMicroscope />
                        </div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Labs & Pharmacies</p>
                    <p className="text-2xl font-black text-slate-800">{computedStats.Lab + computedStats.Pharmacy} Pending</p>
                </div>
            </div>

            {/* --- CATEGORY QUICK FILTERS --- */}
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                <button
                    onClick={() => setSelectedCategory("Hospital")}
                    className={`bg-white border p-4 rounded-3xl flex flex-col items-center text-center hover:border-[#08B36A]/30 transition-all group ${selectedCategory === "Hospital" ? 'border-[#08B36A] ring-2 ring-[#08B36A]/10' : 'border-slate-100'}`}
                >
                    <div className="text-xl mb-3 p-3 rounded-2xl bg-slate-50 group-hover:bg-[#08B36A] group-hover:text-white transition-all text-cyan-500">
                        <FaHospital />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400 mb-1">Hospitals</p>
                    <p className="text-xs font-bold text-slate-700">{computedStats.Hospital} Profiles</p>
                </button>

                <button
                    onClick={() => setSelectedCategory("Doctor")}
                    className={`bg-white border p-4 rounded-3xl flex flex-col items-center text-center hover:border-[#08B36A]/30 transition-all group ${selectedCategory === "Doctor" ? 'border-[#08B36A] ring-2 ring-[#08B36A]/10' : 'border-slate-100'}`}
                >
                    <div className="text-xl mb-3 p-3 rounded-2xl bg-slate-50 group-hover:bg-[#08B36A] group-hover:text-white transition-all text-orange-500">
                        <FaUserMd />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400 mb-1">Doctors</p>
                    <p className="text-xs font-bold text-slate-700">{computedStats.Doctor} Profiles</p>
                </button>

                <button
                    onClick={() => setSelectedCategory("Nurse")}
                    className={`bg-white border p-4 rounded-3xl flex flex-col items-center text-center hover:border-[#08B36A]/30 transition-all group ${selectedCategory === "Nurse" ? 'border-[#08B36A] ring-2 ring-[#08B36A]/10' : 'border-slate-100'}`}
                >
                    <div className="text-xl mb-3 p-3 rounded-2xl bg-slate-50 group-hover:bg-[#08B36A] group-hover:text-white transition-all text-teal-500">
                        <FaUserNurse />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400 mb-1">Nurses</p>
                    <p className="text-xs font-bold text-slate-700">{computedStats.Nurse} Profiles</p>
                </button>

                <button
                    onClick={() => setSelectedCategory("Lab")}
                    className={`bg-white border p-4 rounded-3xl flex flex-col items-center text-center hover:border-[#08B36A]/30 transition-all group ${selectedCategory === "Lab" ? 'border-[#08B36A] ring-2 ring-[#08B36A]/10' : 'border-slate-100'}`}
                >
                    <div className="text-xl mb-3 p-3 rounded-2xl bg-slate-50 group-hover:bg-[#08B36A] group-hover:text-white transition-all text-blue-500">
                        <FaMicroscope />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400 mb-1">Labs</p>
                    <p className="text-xs font-bold text-slate-700">{computedStats.Lab} Profiles</p>
                </button>

                <button
                    onClick={() => setSelectedCategory("Pharmacy")}
                    className={`bg-white border p-4 rounded-3xl flex flex-col items-center text-center hover:border-[#08B36A]/30 transition-all group ${selectedCategory === "Pharmacy" ? 'border-[#08B36A] ring-2 ring-[#08B36A]/10' : 'border-slate-100'}`}
                >
                    <div className="text-xl mb-3 p-3 rounded-2xl bg-slate-50 group-hover:bg-[#08B36A] group-hover:text-white transition-all text-emerald-500">
                        <FaPrescriptionBottle />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400 mb-1">Pharmacies</p>
                    <p className="text-xs font-bold text-slate-700">{computedStats.Pharmacy} Profiles</p>
                </button>

                <button
                    onClick={() => setSelectedCategory("Ambulance")}
                    className={`bg-white border p-4 rounded-3xl flex flex-col items-center text-center hover:border-[#08B36A]/30 transition-all group ${selectedCategory === "Ambulance" ? 'border-[#08B36A] ring-2 ring-[#08B36A]/10' : 'border-slate-100'}`}
                >
                    <div className="text-xl mb-3 p-3 rounded-2xl bg-slate-50 group-hover:bg-[#08B36A] group-hover:text-white transition-all text-rose-500">
                        <FaAmbulance />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400 mb-1">Ambulances</p>
                    <p className="text-xs font-bold text-slate-700">{computedStats.Ambulance} Profiles</p>
                </button>
            </div>

            {/* --- MAIN AUDITING TABLE --- */}
            <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">

                {/* Table Header & Controls */}
                <div className="p-8 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                            <FaUniversity />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                            Unverified <span className="text-[#08B36A]">Banks</span>
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                            <input
                                type="text"
                                placeholder="Search Name, Bank, Account, IFSC..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium w-64 focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                            <FaFilter className="text-slate-400 text-xs" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="bg-transparent text-xs font-bold text-slate-600 outline-none uppercase tracking-widest"
                            >
                                <option value="All">All Categories</option>
                                <option value="Hospital">Hospitals</option>
                                <option value="Doctor">Doctors</option>
                                <option value="Nurse">Nurses</option>
                                <option value="Lab">Laboratories</option>
                                <option value="Pharmacy">Pharmacies</option>
                                <option value="Ambulance">Ambulances</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Layout */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <FaSpinner className="animate-spin text-3xl text-[#08B36A]" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Bank Registrations...</span>
                        </div>
                    ) : filteredBanks.length === 0 ? (
                        <div className="py-24 text-center">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-1">Clear Audit Queue</p>
                            <p className="text-xs text-slate-300">All vendor bank profiles have been verified.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Vendor Identity</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Account Holder</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Bank Name & Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Account Number</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">IFSC Code</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Verification</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredBanks.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-[#08B36A]/[0.02] transition-colors">
                                        <td className="px-8 py-5">
                                            <div>
                                                <p className="text-sm font-black text-slate-800">{item.name || "N/A"}</p>
                                                <p className="text-xs text-slate-400 font-medium">{item.email}</p>
                                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {renderVendorTypeBadgeAndIcon(item.vendorModel)}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-slate-700">
                                                {item.bankDetails?.accountHolderName || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">{item.bankDetails?.bankName || "N/A"}</p>
                                                <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase">
                                                    {item.bankDetails?.accountType || "N/A"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-mono font-bold text-slate-600">
                                                {item.bankDetails?.accountNumber || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-mono font-black text-slate-700 uppercase">
                                                {item.bankDetails?.ifscCode || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <button
                                                onClick={() => { setSelectedBank(item); setIsConfirming(true) }}
                                                className="px-4 py-2 bg-[#08B36A] hover:bg-[#079f5e] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
                                            >
                                                Verify Account
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Controls */}
                <div className="p-6 bg-slate-50/50 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100">
                    <span>Showing {filteredBanks.length} of {totalServerCount} Unverified Accounts</span>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            disabled={filteredBanks.length < itemsPerPage}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next Page
                        </button>
                    </div>
                </div>
            </div>

            {/* --- VERIFICATION CONFIRMATION MODAL OVERLAY --- */}
            {isConfirming && selectedBank && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">

                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-black uppercase text-slate-800 tracking-tight">Confirm Verification</h3>
                            <button onClick={closeModal} className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-all">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-6">
                            <div className="flex gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-xs text-amber-800">
                                <FaExclamationTriangle size={18} className="shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold mb-1">Verify Banking Record:</p>
                                    <p className="font-medium text-amber-700">Ensure the banking details match the vendor's physical registration documents. Verified accounts are eligible for instant platform payouts.</p>
                                </div>
                            </div>

                            {/* Detail Overview Card */}
                            <div className="border border-slate-100 p-4 rounded-2xl space-y-3.5 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-400 font-bold uppercase">Vendor Account</span>
                                    <span className="font-bold text-slate-800">{selectedBank.name}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-50 pt-2.5">
                                    <span className="text-slate-400 font-bold uppercase">Bank Name</span>
                                    <span className="font-bold text-slate-800">{selectedBank.bankDetails?.bankName}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-50 pt-2.5">
                                    <span className="text-slate-400 font-bold uppercase">Account Number</span>
                                    <span className="font-mono font-bold text-slate-800">{selectedBank.bankDetails?.accountNumber}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-50 pt-2.5">
                                    <span className="text-slate-400 font-bold uppercase">IFSC Code</span>
                                    <span className="font-mono font-black text-slate-800 uppercase">{selectedBank.bankDetails?.ifscCode}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                onClick={closeModal}
                                disabled={submittingAction}
                                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleVerifyConfirm}
                                disabled={submittingAction}
                                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-[#08B36A] hover:bg-[#079f5e] text-white rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                            >
                                {submittingAction ? (
                                    <>
                                        <FaSpinner className="animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    "Approve & Verify"
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    )
}