'use client'

import AdminAPI from '@/app/services/AdminAPI'
import Link from 'next/link'
import React, { useState, useEffect, useMemo } from 'react'
import {
    FaWallet, FaSearch, FaFilter,
    FaEye, FaFileInvoiceDollar, FaMicroscope,
    FaPrescriptionBottle, FaUserNurse, FaUserMd,
    FaHospital, FaAmbulance, FaCalendarDay,
    FaCheck, FaTimes, FaSpinner, FaUniversity, FaUser, FaPhone, FaEnvelope,
    FaExclamationCircle
} from "react-icons/fa"


export default function AdminEarningPage() {
    // --- Dynamic API Payout States ---
    const [withdrawals, setWithdrawals] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalServerCount, setTotalServerCount] = useState(0)

    // --- Dynamic Dashboard Stats State ---
    const [dashboardStats, setDashboardStats] = useState(null)
    const [statsLoading, setStatsLoading] = useState(true)

    // Filter & Search States
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 25

    // Modal Interaction States
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [modalAction, setModalAction] = useState(null) // 'approve' | 'reject' | 'details' | null
    const [transactionReference, setTransactionReference] = useState("")
    const [rejectionReason, setRejectionReason] = useState("")
    const [submittingAction, setSubmittingAction] = useState(false)

    // --- Dynamic API Fetch Execution ---
    const fetchWithdrawals = async () => {
        try {
            setLoading(true)
            const response = await AdminAPI.getPendingWithdrawals(currentPage, itemsPerPage)
            if (response?.success) {
                setWithdrawals(response.data || [])
                setTotalServerCount(response.count || (response.data ? response.data.length : 0))
            }
        } catch (err) {
            console.error("Error retrieving pending withdrawal items:", err)
        } finally {
            setLoading(false)
        }
    }

    const fetchDashboardStats = async () => {
        try {
            setStatsLoading(true)
            const response = await AdminAPI.getAdminAmountStats()
            if (response?.success) {
                setDashboardStats(response.data)
            }
        } catch (err) {
            console.error("Error retrieving dashboard amount stats:", err)
        } finally {
            setStatsLoading(false)
        }
    }

    useEffect(() => {
        fetchWithdrawals()
        fetchDashboardStats()
    }, [currentPage])

    // --- Real-time Local Analytics Calculations ---
    const computedStats = useMemo(() => {
        const stats = {
            totalAmount: 0,
            avgAmount: 0,
            count: withdrawals.length,
            Doctor: 0,
            Nurse: 0,
            Lab: 0,
            Pharmacy: 0,
            Hospital: 0,
            Ambulance: 0
        }

        withdrawals.forEach(w => {
            const amt = Number(w.amount) || 0
            stats.totalAmount += amt

            const model = w.vendorModel
            if (model === "Doctor") stats.Doctor += amt
            else if (model === "Nurse") stats.Nurse += amt
            else if (model === "Lab" || model === "Laboratory") stats.Lab += amt
            else if (model === "Pharmacy") stats.Pharmacy += amt
            else if (model === "Hospital") stats.Hospital += amt
            else if (model === "Ambulance") stats.Ambulance += amt
        })

        stats.avgAmount = stats.count > 0 ? Math.round(stats.totalAmount / stats.count) : 0
        return stats
    }, [withdrawals])

    // Filter dynamic withdrawals based on search and category selections
    const filteredWithdrawals = useMemo(() => {
        return withdrawals.filter(w => {
            const query = searchQuery.toLowerCase()
            const vendorName = w.vendorId?.name?.toLowerCase() || ""
            const email = w.vendorId?.email?.toLowerCase() || ""
            const bankName = w.bankDetails?.bankName?.toLowerCase() || ""
            const model = w.vendorModel || ""

            const matchesSearch = vendorName.includes(query) || email.includes(query) || bankName.includes(query)
            const matchesCategory = selectedCategory === "All" ||
                model.toLowerCase() === selectedCategory.toLowerCase() ||
                (selectedCategory === "Lab" && model === "Laboratory")

            return matchesSearch && matchesCategory
        })
    }, [withdrawals, searchQuery, selectedCategory])

    // --- Action Processing Handlers ---
    const handleApproveAction = async () => {
        if (!transactionReference.trim()) {
            alert("Please enter a manual payment UTR Reference ID before confirming approval.")
            return
        }

        try {
            setSubmittingAction(true)
            const response = await AdminAPI.approveWithdrawal(selectedRequest._id, transactionReference)
            if (response?.success) {
                alert("Withdrawal verified and finalized successfully.")
                closeModal()
                fetchWithdrawals()
                fetchDashboardStats()
            }
        } catch (err) {
            alert(err?.response?.data?.message || "Verification failed. Check network parameters.")
        } finally {
            setSubmittingAction(false)
        }
    }

    const handleRejectAction = async () => {
        if (!rejectionReason.trim()) {
            alert("Please enter a specific rejection reason.")
            return
        }

        try {
            setSubmittingAction(true)
            const response = await AdminAPI.rejectWithdrawal(selectedRequest._id, rejectionReason)
            if (response?.success) {
                alert("Withdrawal successfully declined. Balance refunded to vendor wallet.")
                closeModal()
                fetchWithdrawals()
                fetchDashboardStats()
            }
        } catch (err) {
            alert(err?.response?.data?.message || "Declination request failed. Check system logs.")
        } finally {
            setSubmittingAction(false)
        }
    }

    const closeModal = () => {
        setSelectedRequest(null)
        setModalAction(null)
        setTransactionReference("")
        setRejectionReason("")
    }

    // Dynamic Icon selector for vendor models
    const renderVendorTypeBadgeAndIcon = (model, speciality) => {
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
                <div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${colorClasses}`}>
                        {label}
                    </span>
                    {speciality && (
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{speciality}</p>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">

            {/* --- TOP HEADER --- */}
            <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                        Pending <span className="text-[#08B36A]">Withdrawals</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mt-1">Platform Settlements & Financial Administration</p>
                </div>
            </div>

            {/* --- PRIMARY REAL-TIME SUMMARY CARDS --- */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                
                {/* Platform Total Liability */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900/10 flex items-center justify-center text-slate-900">
                            <FaWallet />
                        </div>
                        <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-slate-100 text-slate-800">
                            Total Liability
                        </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Platform Liability</p>
                    <p className="text-2xl font-black text-slate-800">
                        {statsLoading ? (
                            <FaSpinner className="animate-spin text-sm text-slate-400" />
                        ) : (
                            `₹${(dashboardStats?.platformTotalLiability ?? 0).toLocaleString()}`
                        )}
                    </p>
                </div>

                {/* Pending Payout Statistics */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                            <FaCalendarDay />
                        </div>
                        <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-amber-50 text-amber-600">
                            {statsLoading ? "..." : `${dashboardStats?.payoutStats?.Pending?.count ?? 0} Request(s)`}
                        </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pending Amount</p>
                    <p className="text-2xl font-black text-slate-800">
                        {statsLoading ? (
                            <FaSpinner className="animate-spin text-sm text-slate-400" />
                        ) : (
                            `₹${(dashboardStats?.payoutStats?.Pending?.amount ?? 0).toLocaleString()}`
                        )}
                    </p>
                </div>

                {/* Approved Payout Statistics */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-[#08B36A]">
                            <FaFileInvoiceDollar />
                        </div>
                        <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-emerald-50 text-[#08B36A]">
                            {statsLoading ? "..." : `${dashboardStats?.payoutStats?.Approved?.count ?? 0} Settled`}
                        </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Approved Amount</p>
                    <p className="text-2xl font-black text-slate-800">
                        {statsLoading ? (
                            <FaSpinner className="animate-spin text-sm text-slate-400" />
                        ) : (
                            `₹${(dashboardStats?.payoutStats?.Approved?.amount ?? 0).toLocaleString()}`
                        )}
                    </p>
                </div>

                {/* Rejected Stats & Bank Verifications */}
                <Link href="/admind/managebanks" className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                            <FaExclamationCircle />
                        </div>
                        <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-rose-50 text-rose-600">
                            {statsLoading ? "..." : `Rejected: ₹${(dashboardStats?.payoutStats?.Rejected?.amount ?? 0).toLocaleString()}`}
                        </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Bank Verifications</p>
                    <p className="text-2xl font-black text-slate-800">
                        {statsLoading ? (
                            <FaSpinner className="animate-spin text-sm text-slate-400" />
                        ) : (
                            `${dashboardStats?.pendingBankVerificationsCount ?? 0} Awaiting`
                        )}
                    </p>
                </Link>
            </div>

            {/* --- CATEGORY BREAKDOWN --- */}
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                <button
                    onClick={() => setSelectedCategory("Pharmacy")}
                    className={`bg-white border p-4 rounded-3xl flex flex-col items-center text-center hover:border-[#08B36A]/30 transition-all group ${selectedCategory === "Pharmacy" ? 'border-[#08B36A] ring-2 ring-[#08B36A]/10' : 'border-slate-100'}`}
                >
                    <div className="text-xl mb-3 p-3 rounded-2xl bg-slate-50 group-hover:bg-[#08B36A] group-hover:text-white transition-all text-emerald-500">
                        <FaPrescriptionBottle />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400 mb-1">Pharmacy</p>
                    <p className="text-xs font-bold text-slate-700">₹{computedStats.Pharmacy.toLocaleString()}</p>
                </button>

                <button
                    onClick={() => setSelectedCategory("Lab")}
                    className={`bg-white border p-4 rounded-3xl flex flex-col items-center text-center hover:border-[#08B36A]/30 transition-all group ${selectedCategory === "Lab" ? 'border-[#08B36A] ring-2 ring-[#08B36A]/10' : 'border-slate-100'}`}
                >
                    <div className="text-xl mb-3 p-3 rounded-2xl bg-slate-50 group-hover:bg-[#08B36A] group-hover:text-white transition-all text-blue-500">
                        <FaMicroscope />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400 mb-1">Laboratory</p>
                    <p className="text-xs font-bold text-slate-700">₹{computedStats.Lab.toLocaleString()}</p>
                </button>

                <button
                    onClick={() => setSelectedCategory("Nurse")}
                    className={`bg-white border p-4 rounded-3xl flex flex-col items-center text-center hover:border-[#08B36A]/30 transition-all group ${selectedCategory === "Nurse" ? 'border-[#08B36A] ring-2 ring-[#08B36A]/10' : 'border-slate-100'}`}
                >
                    <div className="text-xl mb-3 p-3 rounded-2xl bg-slate-50 group-hover:bg-[#08B36A] group-hover:text-white transition-all text-teal-500">
                        <FaUserNurse />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400 mb-1">Nurse</p>
                    <p className="text-xs font-bold text-slate-700">₹{computedStats.Nurse.toLocaleString()}</p>
                </button>

                <button
                    onClick={() => setSelectedCategory("Doctor")}
                    className={`bg-white border p-4 rounded-3xl flex flex-col items-center text-center hover:border-[#08B36A]/30 transition-all group ${selectedCategory === "Doctor" ? 'border-[#08B36A] ring-2 ring-[#08B36A]/10' : 'border-slate-100'}`}
                >
                    <div className="text-xl mb-3 p-3 rounded-2xl bg-slate-50 group-hover:bg-[#08B36A] group-hover:text-white transition-all text-orange-500">
                        <FaUserMd />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400 mb-1">Doctor</p>
                    <p className="text-xs font-bold text-slate-700">₹{computedStats.Doctor.toLocaleString()}</p>
                </button>

                <button
                    onClick={() => setSelectedCategory("Hospital")}
                    className={`bg-white border p-4 rounded-3xl flex flex-col items-center text-center hover:border-[#08B36A]/30 transition-all group ${selectedCategory === "Hospital" ? 'border-[#08B36A] ring-2 ring-[#08B36A]/10' : 'border-slate-100'}`}
                >
                    <div className="text-xl mb-3 p-3 rounded-2xl bg-slate-50 group-hover:bg-[#08B36A] group-hover:text-white transition-all text-cyan-500">
                        <FaHospital />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400 mb-1">Hospital</p>
                    <p className="text-xs font-bold text-slate-700">₹{computedStats.Hospital.toLocaleString()}</p>
                </button>

                <button
                    onClick={() => setSelectedCategory("Ambulance")}
                    className={`bg-white border p-4 rounded-3xl flex flex-col items-center text-center hover:border-[#08B36A]/30 transition-all group ${selectedCategory === "Ambulance" ? 'border-[#08B36A] ring-2 ring-[#08B36A]/10' : 'border-slate-100'}`}
                >
                    <div className="text-xl mb-3 p-3 rounded-2xl bg-slate-50 group-hover:bg-[#08B36A] group-hover:text-white transition-all text-rose-500">
                        <FaAmbulance />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-tighter text-slate-400 mb-1">Ambulance</p>
                    <p className="text-xs font-bold text-slate-700">₹{computedStats.Ambulance.toLocaleString()}</p>
                </button>
            </div>

            {/* --- MAIN TRANSACTION TABLE --- */}
            <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">

                {/* Table Header / Filters */}
                <div className="p-8 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                            <FaFileInvoiceDollar />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                            Payout <span className="text-[#08B36A]">Requests</span>
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                            <input
                                type="text"
                                placeholder="Search Name, Email, Bank..."
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
                                <option value="Doctor">Doctors Only</option>
                                <option value="Nurse">Nurses Only</option>
                                <option value="Lab">Laboratories Only</option>
                                <option value="Pharmacy">Pharmacies Only</option>
                                <option value="Hospital">Hospitals Only</option>
                                <option value="Ambulance">Ambulances Only</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Actual Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <FaSpinner className="animate-spin text-3xl text-[#08B36A]" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syncing Payout Records...</span>
                        </div>
                    ) : filteredWithdrawals.length === 0 ? (
                        <div className="py-24 text-center">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-1">No pending payouts found</p>
                            <p className="text-xs text-slate-300">All withdrawal request items match current filters or are completed.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Request Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Vendor Identity</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Bank Details</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Requested Sum</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Settlement Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredWithdrawals.map((req) => (
                                    <tr key={req._id} className="group hover:bg-[#08B36A]/[0.02] transition-colors">
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                                                {new Date(req.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric', month: 'short', day: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div>
                                                <p className="text-sm font-black text-slate-800">{req.vendorId?.name || "N/A"}</p>
                                                <p className="text-xs text-slate-400 font-medium">{req.vendorId?.email || "No email"}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {renderVendorTypeBadgeAndIcon(req.vendorModel, req.vendorId?.speciality)}
                                        </td>
                                        <td className="px-8 py-5">
                                            {req.bankDetails ? (
                                                <div className="text-xs">
                                                    <p className="font-bold text-slate-700">{req.bankDetails.bankName}</p>
                                                    <p className="font-medium text-slate-500 font-mono">A/C: {req.bankDetails.accountNumber}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">IFSC: {req.bankDetails.ifscCode}</p>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-rose-500 font-semibold">Missing Account Details</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg">
                                                ₹{req.amount?.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => { setSelectedRequest(req); setModalAction('details') }}
                                                    title="View Complete Information"
                                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                                                >
                                                    <FaEye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedRequest(req); setModalAction('approve') }}
                                                    title="Approve Settlement"
                                                    className="p-2 text-emerald-500 hover:text-white hover:bg-emerald-500 rounded-xl transition-all"
                                                >
                                                    <FaCheck size={14} />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedRequest(req); setModalAction('reject') }}
                                                    title="Decline Request"
                                                    className="p-2 text-rose-500 hover:text-white hover:bg-rose-500 rounded-xl transition-all"
                                                >
                                                    <FaTimes size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Placeholder */}
                <div className="p-6 bg-slate-50/50 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100">
                    <span>Showing {filteredWithdrawals.length} of {totalServerCount} Payout Requests</span>
                    <div className="flex gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            disabled={filteredWithdrawals.length < itemsPerPage}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next Page
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MODAL DIALOG OVERLAYS (APPROVE / REJECT / DETAILS) --- */}
            {selectedRequest && modalAction && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in">

                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-black uppercase text-slate-800 tracking-tight">
                                {modalAction === 'approve' && "Confirm Wire Transfer"}
                                {modalAction === 'reject' && "Reject Payout Request"}
                                {modalAction === 'details' && "Payout Specification"}
                            </h3>
                            <button onClick={closeModal} className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-all">
                                <FaTimes size={16} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 space-y-6">

                            {/* Target Vendor Profile card */}
                            <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FaUser className="text-slate-400 text-xs" />
                                        <span className="text-xs font-bold text-slate-700">{selectedRequest.vendorId?.name}</span>
                                    </div>
                                    <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-bold uppercase">
                                        {selectedRequest.vendorModel}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <FaEnvelope className="text-[10px]" />
                                        <span>{selectedRequest.vendorId?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <FaPhone className="text-[10px]" />
                                        <span>{selectedRequest.vendorId?.phone || "N/A"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic context panels based on Action */}
                            {modalAction === 'approve' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-800">
                                        <p className="font-bold mb-1">Manual Action Required:</p>
                                        <p className="font-medium text-emerald-700">Execute an IMPS, NEFT, or UPI transfer of <strong>₹{selectedRequest.amount?.toLocaleString()}</strong> to the vendor account specified below. Provide the bank UTR verification code to finalize.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Transaction Reference Number (UTR)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. IMPS172648261947"
                                            value={transactionReference}
                                            onChange={(e) => setTransactionReference(e.target.value)}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all font-mono"
                                        />
                                    </div>
                                </div>
                            )}

                            {modalAction === 'reject' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-xs text-rose-800">
                                        <p className="font-bold mb-1">Declining Settlement Policy:</p>
                                        <p className="font-medium text-rose-700">This action declines the payout request and immediately refunds the held sum of <strong>₹{selectedRequest.amount?.toLocaleString()}</strong> back to the vendor's withdrawable balance.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Rejection Reason</label>
                                        <textarea
                                            placeholder="Provide detail for rejection..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {modalAction === 'details' && (
                                <div className="space-y-4">
                                    <div className="border border-slate-100 p-4 rounded-2xl space-y-3">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400 font-bold uppercase">Requested Amount</span>
                                            <span className="font-black text-slate-800 text-sm">₹{selectedRequest.amount?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs border-t border-slate-50 pt-2.5">
                                            <span className="text-slate-400 font-bold uppercase">Status</span>
                                            <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">{selectedRequest.status}</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-2xl space-y-2.5">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <FaUniversity /> Bank Destination
                                        </p>
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-medium">Beneficiary Name</p>
                                                <p className="font-bold text-slate-700">{selectedRequest.bankDetails?.accountHolderName || "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-medium">Bank Name</p>
                                                <p className="font-bold text-slate-700">{selectedRequest.bankDetails?.bankName || "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-medium">Account Number</p>
                                                <p className="font-mono font-bold text-slate-700">{selectedRequest.bankDetails?.accountNumber || "N/A"}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-medium">IFSC Code</p>
                                                <p className="font-mono font-bold text-slate-700 uppercase">{selectedRequest.bankDetails?.ifscCode || "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
                            <button
                                onClick={closeModal}
                                disabled={submittingAction}
                                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                            >
                                Close
                            </button>

                            {modalAction === 'approve' && (
                                <button
                                    onClick={handleApproveAction}
                                    disabled={submittingAction}
                                    className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                                >
                                    {submittingAction ? (
                                        <>
                                            <FaSpinner className="animate-spin" /> Approving...
                                        </>
                                    ) : (
                                        "Confirm & Pay"
                                    )}
                                </button>
                            )}

                            {modalAction === 'reject' && (
                                <button
                                    onClick={handleRejectAction}
                                    disabled={submittingAction}
                                    className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                                >
                                    {submittingAction ? (
                                        <>
                                            <FaSpinner className="animate-spin" /> Rejecting...
                                        </>
                                    ) : (
                                        "Confirm Rejection"
                                    )}
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            )}

        </div>
    )
}