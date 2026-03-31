import React, { useState } from 'react';
import {
    FaTimes, FaCheckCircle, FaPhoneAlt, FaEnvelope, FaIdBadge,
    FaUserCheck, FaBan, FaExclamationTriangle, FaSpinner,
    FaHospital, FaGraduationCap, FaMapMarkerAlt, FaFileAlt,
    FaStethoscope, FaSearchPlus, FaMoneyBillWave, FaClock, FaMedkit
} from "react-icons/fa";

const DoctorDetailsModal = ({ isOpen, onClose, doctor, onApprove, onReject }) => {
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    if (!isOpen || !doctor) return null;

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    // Action buttons visible for Pending or Incomplete
    const canAction = doctor.profileStatus === 'Pending' || doctor.profileStatus === 'Incomplete';
    const isApproved = doctor.profileStatus === 'Approved';

    // IMAGE URL HELPER
    const getImgUrl = (path) => {
        if (!path) return "https://via.placeholder.com/150?text=No+Image";
        let cleanPath = path.replace(/\\/g, '/');
        if (cleanPath.startsWith('public/')) {
            cleanPath = cleanPath.replace('public/', '');
        }
        const finalBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
        return `${finalBase}${finalPath}`;
    };

    const handleApproveAction = async () => {
        setSubmitting(true);
        await onApprove(doctor._id);
        setSubmitting(false);
    };

    const handleRejectAction = async () => {
        if (!reason.trim()) return alert("Please provide a rejection reason");
        setSubmitting(true);
        await onReject(doctor._id, reason);
        setSubmitting(false);
        setShowRejectInput(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">

            {/* LIGHTBOX PREVIEW */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setPreviewImage(null)}
                >
                    <button className="absolute top-10 right-10 text-white text-4xl"><FaTimes /></button>
                    <img src={previewImage} className="max-w-full max-h-full rounded-lg object-contain animate-in zoom-in duration-300" alt="Full Preview" />
                </div>
            )}

            <div className="bg-white w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative max-h-[95vh] flex flex-col animate-in fade-in zoom-in duration-300">

                {/* REJECTION OVERLAY */}
                {showRejectInput && (
                    <div className="absolute inset-0 z-[110] bg-white/95 flex flex-col items-center justify-center p-8">
                        <FaExclamationTriangle size={40} className="text-red-500 mb-4" />
                        <h3 className="text-xl font-black mb-2 tracking-tight">Specify Rejection Reason</h3>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full max-w-md p-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-red-400 transition-all h-32"
                            placeholder="Reason for rejecting this doctor..."
                        />
                        <div className="flex gap-4 mt-6 w-full max-w-md">
                            <button onClick={() => setShowRejectInput(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-slate-500">Cancel</button>
                            <button onClick={handleRejectAction} disabled={submitting} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-200">
                                {submitting ? <FaSpinner className="animate-spin m-auto" /> : "Confirm Reject"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Banner */}
                <div className="relative h-32 shrink-0 bg-gradient-to-r from-[#08B36A] to-[#047a46]">
                    <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-all z-10"><FaTimes /></button>
                </div>

                {/* Content Area */}
                <div className="px-8 pb-8 overflow-y-auto custom-scrollbar flex-1">
                    {/* Profile Header */}
                    <div className="relative -mt-16 mb-6 flex justify-between items-end">
                        <div className="relative group cursor-pointer" onClick={() => setPreviewImage(getImgUrl(doctor.profileImage))}>
                            <img src={getImgUrl(doctor.profileImage)} className="w-36 h-36 rounded-3xl border-4 border-white object-cover shadow-xl bg-slate-100" alt="Profile" />
                            <div className="absolute inset-0 bg-black/20 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"><FaSearchPlus /></div>
                        </div>
                        <div className={`px-5 py-2 rounded-2xl border font-black text-[10px] uppercase tracking-widest ${isApproved ? 'bg-green-50 border-green-200 text-[#08B36A]' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
                            {doctor.profileStatus}
                        </div>
                    </div>

                    <div className="text-left mb-8">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{doctor.name}</h2>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1"><FaStethoscope /> {doctor.speciality}</span>
                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1"><FaGraduationCap /> {doctor.qualification}</span>
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1"><FaIdBadge /> {doctor.role}</span>
                        </div>
                    </div>

                    <div className="space-y-10">
                        {/* 1. Bio Section */}
                        {doctor.about && (
                            <section className="text-left">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">About Doctor</h4>
                                <p className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-slate-100 pl-4">"{doctor.about}"</p>
                            </section>
                        )}

                        {/* 2. Professional Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            <DetailItem label="Email" value={doctor.email} icon={<FaEnvelope />} />
                            <DetailItem label="Phone" value={doctor.phone} icon={<FaPhoneAlt />} />
                            <DetailItem label="Experience" value={`${doctor.experienceYears} Years`} icon={<FaIdBadge />} />
                            <DetailItem label="Location" value={`${doctor.city}, ${doctor.state}`} icon={<FaMapMarkerAlt />} />
                            <DetailItem label="Slot Duration" value={`${doctor.slotDuration} Minutes`} icon={<FaClock />} />
                            <DetailItem label="Clinic Address" value={doctor.address} icon={<FaMapMarkerAlt />} />
                        </div>

                        {/* 3. Hospital & Department (If available) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {doctor.hospitalId && (
                                <section className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-left">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Affiliated Hospital</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#08B36A] shadow-sm border border-slate-100"><FaHospital size={20} /></div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800">{doctor.hospitalId.name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{doctor.hospitalId.email}</p>
                                        </div>
                                    </div>
                                </section>
                            )}
                            {doctor.department && (
                                <section className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-left">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Department Status</h4>
                                    <div className="flex gap-2">
                                        <StatusBadge active={doctor.department.isNormal} label="Normal" />
                                        <StatusBadge active={doctor.department.isEmergency} label="Emergency" />
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* 4. Consultation Fees */}
                        <section className="text-left">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Consultation Fees</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <FeeCard label="Clinic" amount={doctor.fees.clinic} />
                                <FeeCard label="Online" amount={doctor.fees.online} />
                                <FeeCard label="Home" amount={doctor.fees.home} />
                            </div>
                        </section>

                        {/* 5. Medical Credentials */}
                        <section className="text-left">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Registration & Medical Council</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">License No</p>
                                    <p className="text-xs font-bold text-slate-700">{doctor.licenseNumber}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Council Name</p>
                                    <p className="text-xs font-bold text-slate-700">{doctor.councilName}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Council No</p>
                                    <p className="text-xs font-bold text-slate-700">{doctor.councilNumber}</p>
                                </div>
                            </div>
                        </section>

                        {/* 6. Documents */}
                        <section className="text-left">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Medical Documents</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {doctor.documents?.map((doc, i) => (
                                    <div key={i} className="group relative h-32 rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 cursor-pointer" onClick={() => setPreviewImage(getImgUrl(doc))}>
                                        <img src={getImgUrl(doc)} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="doc" />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"><FaSearchPlus /></div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Rejection Note */}
                        {doctor.profileStatus === "Rejected" && (
                            <div className="p-6 bg-red-50 border-2 border-red-100 rounded-[2rem] text-left">
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Rejection Reason</p>
                                <p className="text-sm font-bold text-red-700 italic">"{doctor.rejectionReason}"</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 shrink-0">
                    <div className="flex flex-col gap-3">
                        {canAction && (
                            <div className="flex gap-3">
                                <button onClick={() => setShowRejectInput(true)} className="flex-1 py-4 bg-white border-2 border-red-100 text-red-500 rounded-2xl font-black text-[11px] uppercase hover:bg-red-50 transition-all flex items-center justify-center gap-2"><FaBan /> Reject</button>
                                <button onClick={handleApproveAction} disabled={submitting} className="flex-[2] py-4 bg-[#08B36A] text-white rounded-2xl font-black text-[11px] uppercase hover:bg-[#069658] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100">
                                    {submitting ? <FaSpinner className="animate-spin" /> : <><FaUserCheck /> Approve Profile</>}
                                </button>
                            </div>
                        )}
                        <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase hover:bg-slate-800 transition-all">Close Profile</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal Sub-components
const DetailItem = ({ label, value, icon }) => (
    <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-slate-50 text-[#08B36A] flex items-center justify-center">{icon}</div>
        <div className="overflow-hidden">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-[11px] font-bold text-slate-700 truncate">{value || 'N/A'}</p>
        </div>
    </div>
);

const FeeCard = ({ label, amount }) => (
    <div className="p-4 bg-white rounded-2xl border border-slate-100 text-center shadow-sm">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-black text-[#08B36A]">₹{amount}</p>
    </div>
);

const StatusBadge = ({ active, label }) => (
    <div className={`flex-1 py-2 px-3 rounded-xl border-2 text-center text-[10px] font-black uppercase tracking-tighter ${active ? 'bg-white border-[#08B36A] text-[#08B36A]' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
        {label}
    </div>
);

export default DoctorDetailsModal;