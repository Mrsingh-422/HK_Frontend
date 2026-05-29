"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
    Calendar, Clock, User, MapPin, Search, 
    Video, Home, Building2, ChevronRight, 
    Stethoscope, Filter, Receipt, ArrowUpRight,
    ShieldCheck, AlertCircle, Activity, Info
} from "lucide-react";
import UserAPI from "@/app/services/UserAPI";

export default function MedicalHistoryPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("All"); // All, Appointment, Admission

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                setLoading(true);
                const response = await UserAPI.getMyDoctorAppointments();
                if (response.success) {
                    // Sort by newest created first
                    const sorted = response.data.sort((a, b) => 
                        new Date(b.createdAt) - new Date(a.createdAt)
                    );
                    setData(sorted);
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesFilter = filter === "All" || item.bookingType === filter;
            const matchesSearch = 
                item.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.doctorId?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.patients[0]?.patientName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [data, filter, searchQuery]);

    if (loading) return <LoadingSkeleton />;

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans antialiased text-slate-800">
            {/* --- STICKY PREMIUM HEADER --- */}
            <div className="sticky top-0 z-40 bg-white/75 backdrop-blur-md border-b border-slate-100 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Medical <span className="text-emerald-600 bg-emerald-50/60 px-2.5 py-0.5 rounded-xl">Timeline</span>
                            </h1>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1.5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                {data.length} Total Medical Records
                            </p>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/40">
                            {["All", "Appointment", "Admission"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setFilter(tab)}
                                    className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                                        filter === tab 
                                        ? "bg-white text-slate-900 shadow-md shadow-slate-200/80 scale-[1.02]" 
                                        : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                                    }`}
                                >
                                    {tab}s
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* Search Bar */}
                <div className="relative mb-8 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="Search by ID, Doctor or Patient name..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm group-hover:shadow-md focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all duration-300 font-medium text-slate-700 placeholder-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {filteredData.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredData.map((item) => (
                            <RecordCard key={item._id} record={item} />
                        ))}
                    </div>
                ) : (
                    <EmptyState />
                )}
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function RecordCard({ record }) {
    const isAdmission = record.bookingType === "Admission";
    const primaryPatient = record.patients?.[0];
    
    return (
        <div className="bg-white rounded-3xl border border-slate-200/70 overflow-hidden hover:shadow-[0_24px_48px_-12px_rgba(148,163,184,0.12)] transition-all duration-500 group flex flex-col justify-between">
            <div>
                {/* Status Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/40">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl transition-colors duration-300 ${isAdmission ? "bg-blue-50 text-blue-600 group-hover:bg-blue-100" : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"}`}>
                            {isAdmission ? <Building2 size={16} /> : <Stethoscope size={16} />}
                        </div>
                        <span className="text-xs font-bold text-slate-400 tracking-wider font-mono">{record.bookingId}</span>
                    </div>
                    <StatusBadge status={record.status} />
                </div>

                <div className="p-6">
                    {/* Entity Info (Doctor or Hospital) */}
                    <div className="flex items-start gap-4 mb-6">
                        <div className="relative shrink-0">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 shadow-inner group-hover:scale-[1.03] transition-transform duration-500">
                                {record.doctorId?.profileImage ? (
                                    <img 
                                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${record.doctorId.profileImage}`} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                        alt=""
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100/60">
                                        <Activity size={28} className="animate-pulse" />
                                    </div>
                                )}
                            </div>
                            {record.consultationType && (
                                <div className="absolute -bottom-1.5 -right-1.5 bg-white p-2 rounded-xl shadow-md border border-slate-100 transition-transform duration-300 group-hover:rotate-6">
                                    <ConsultationIcon type={record.consultationType} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-slate-900 truncate flex items-center gap-2 group-hover:text-emerald-700 transition-colors">
                                {record.doctorId?.name || (isAdmission ? "Hospital Care" : "Medical Staff")}
                                {record.paymentStatus === "Paid" && <ShieldCheck size={18} className="text-blue-500 shrink-0 fill-blue-50" />}
                            </h3>
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mt-0.5">{record.doctorId?.speciality || record.bedBookingType || "General Care"}</p>
                            
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-200/30">
                                    {isAdmission ? (record.wardName || "General Ward") : record.consultationType}
                                </span>
                                {record.triageLevel && (
                                    <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-red-100">
                                        {record.triageLevel}
                                    </span>
                                )}
                                {primaryPatient?.reasonForVisit && (
                                    <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-medium border border-slate-200/60 truncate max-w-[180px]">
                                        {primaryPatient.reasonForVisit}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Patient & Booking Details Box */}
                    <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient Name</p>
                            <div className="text-xs sm:text-sm font-semibold text-slate-700 flex flex-col gap-0.5 justify-start">
                                <span className="flex items-center gap-1.5 truncate">
                                    <User size={14} className="text-slate-400 shrink-0" /> {primaryPatient?.patientName}
                                </span>
                                {primaryPatient?.patientAge && (
                                    <span className="text-[11px] text-slate-400 pl-5 font-normal">
                                        {primaryPatient.patientAge} yrs • {primaryPatient.gender} ({primaryPatient.relation})
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Schedule</p>
                            <p className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Calendar size={14} className="text-slate-400 shrink-0" /> {record.appointmentDate ? new Date(record.appointmentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time / Slot</p>
                            <p className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-2 truncate">
                                <Clock size={14} className="text-slate-400 shrink-0" /> {record.appointmentTime || "All Day"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Paid</p>
                            <p className="text-sm font-extrabold text-slate-900 flex items-center gap-1">
                                <Receipt size={14} className="text-emerald-500 shrink-0" /> ₹{record.totalAmount}
                            </p>
                        </div>
                    </div>

                    {/* Extra context for Home visits (Dynamic Address View) */}
                    {record.consultationType === "Home Visit" && record.address && (
                        <div className="bg-slate-50/30 border border-dashed border-slate-200 rounded-xl px-4 py-2.5 flex items-start gap-2 text-[11px] text-slate-500">
                            <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                            <p className="truncate">
                                <span className="font-semibold text-slate-600">Deliver to:</span> H.No {record.address.houseNo}, Sector {record.address.sector}, {record.address.city}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Action */}
            <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-slate-50 mt-auto">
                <div className="flex -space-x-1.5 overflow-hidden">
                    {/* Visual representation of reschedule count */}
                    {Array.from({ length: Math.min(record.rescheduleCount || 0, 3) }).map((_, i) => (
                        <div key={i} className="w-7 h-7 rounded-full bg-amber-50 border-2 border-white flex items-center justify-center shadow-sm" title="Rescheduled appointment">
                            <Clock size={11} className="text-amber-600" />
                        </div>
                    ))}
                </div>
                <button className="flex items-center gap-1.5 bg-slate-900 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-slate-900/10 hover:shadow-emerald-600/20 transition-all duration-300 active:scale-[0.97]">
                    Details <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        "Confirmed": "bg-emerald-50 text-emerald-700 border-emerald-100/80 before:bg-emerald-500",
        "Completed": "bg-blue-50 text-blue-700 border-blue-100/80 before:bg-blue-500",
        "Hospital-Pending": "bg-amber-50 text-amber-700 border-amber-100/80 before:bg-amber-500",
        "Cancelled": "bg-red-50 text-red-700 border-red-100/80 before:bg-red-500",
    };
    return (
        <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 before:content-[''] before:w-1 before:h-1 before:rounded-full ${styles[status] || "bg-slate-50 text-slate-600 border-slate-200 before:bg-slate-400"}`}>
            {status}
        </span>
    );
}

function ConsultationIcon({ type }) {
    if (type === "Video Consult") return <Video size={14} className="text-blue-500" />;
    if (type === "Home Visit") return <Home size={14} className="text-orange-500" />;
    return <MapPin size={14} className="text-emerald-500" />;
}

function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 animate-pulse">
            <div className="h-24 bg-white border-b border-slate-100" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-80 bg-white rounded-3xl border border-slate-100 p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="w-1/3 h-6 bg-slate-200 rounded-lg" />
                            <div className="w-16 h-6 bg-slate-200 rounded-full" />
                        </div>
                        <div className="flex gap-4">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-200 rounded-2xl shrink-0" />
                            <div className="flex-1 space-y-2 mt-2">
                                <div className="w-2/3 h-5 bg-slate-200 rounded-lg" />
                                <div className="w-1/3 h-4 bg-slate-200 rounded-lg" />
                            </div>
                        </div>
                        <div className="h-24 bg-slate-100 rounded-2xl" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm border border-slate-200/60 mb-6 transition-transform duration-500 hover:rotate-12">
                <Calendar size={36} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">No Records Found</h3>
            <p className="text-slate-400 text-sm mt-1.5 font-medium leading-relaxed">Try adjusting your filters or search criteria to locate specific history elements.</p>
        </div>
    );
}