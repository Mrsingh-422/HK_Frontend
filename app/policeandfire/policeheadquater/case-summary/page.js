'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  FaArrowLeft, FaMapMarkerAlt, FaUserInjured, FaShieldAlt, 
  FaGavel, FaCheckCircle, FaTimesCircle, FaCarCrash, 
  FaStethoscope, FaFileAlt, FaVideo, FaImage, FaFileImage,
  FaFilePdf, FaNotesMedical, FaClock
} from 'react-icons/fa'
import PoliceAPI from '@/app/services/PoliceAPI' // Apna correct API path yahan dalein

export default function CaseSummaryPage() {
    const params = useParams(); // URL se ID lene ke liye (e.g. /cases/6a2a40678d9d...)
    const router = useRouter();
    const caseId = params?.id; // Agar as a prop pass kar rahe ho to props.caseId use kar lena

    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Agar real API abhi ready nahi hai, toh testing ke liye 
        // aap apna JSON yahan mockData me dal kar setCaseData(mockData) kar sakte ho
        if (caseId) {
            fetchCaseSummary(caseId);
        }
    }, [caseId]);

    const fetchCaseSummary = async (id) => {
        try {
            setLoading(true);
            const response = await PoliceAPI.getCaseSummary(id);
            if (response.success) {
                setCaseData(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch case summary", error);
        } finally {
            setLoading(false);
        }
    };

    // Date formatting helper
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-IN', { 
            day: '2-digit', month: 'short', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
    };

    if (loading) {
        return <div className="flex h-[80vh] items-center justify-center font-bold text-slate-400">Loading Summary...</div>
    }

    if (!caseData) {
        return <div className="flex h-[80vh] items-center justify-center font-bold text-red-400">Case Not Found</div>
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
            
            {/* HEADER SECTION */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-[#08B36A] hover:text-white transition-all">
                        <FaArrowLeft />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                                {caseData.caseNo}
                            </h2>
                            <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                                caseData.status === 'Closed' ? 'bg-emerald-50 text-[#08B36A]' : 'bg-amber-50 text-amber-600'
                            }`}>
                                {caseData.status}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-2">
                            Reported On: {formatDate(caseData.reportedAt)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
                    <FaClock className="text-[#08B36A]" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                        Last Updated: {formatDate(caseData.updatedAt)}
                    </span>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN (WIDER) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* 1. INCIDENT & VICTIM DETAILS */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><FaUserInjured /></div>
                            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Incident & Victim Details</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InfoLabel label="Victim Name" />
                                <p className="text-lg font-black text-slate-800">{caseData.victimName}</p>
                                <p className="text-xs font-bold text-slate-500 mt-1">Ph: {caseData.victimPhone || 'N/A'}</p>
                            </div>
                            <div>
                                <InfoLabel label="Incident Type" />
                                <p className="text-sm font-bold text-slate-700">{caseData.incidentType}</p>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                    caseData.severity === 'High' || caseData.severity === 'Critical' 
                                    ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-600'
                                }`}>
                                    Severity: {caseData.severity} ({caseData.severityLevel})
                                </span>
                            </div>
                            <div className="md:col-span-2">
                                <InfoLabel label="Incident Address" />
                                <p className="text-sm font-bold text-slate-600 flex items-start gap-2">
                                    <FaMapMarkerAlt className="text-red-400 mt-0.5 shrink-0" />
                                    {caseData.address}
                                </p>
                            </div>
                            <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <InfoLabel label="Incident Description" />
                                <p className="text-sm font-medium text-slate-600 mt-1">{caseData.description || 'No description provided.'}</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. STATION & STAFF INFO */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 text-[#08B36A] rounded-lg"><FaShieldAlt /></div>
                            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Handling Station & Staff</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InfoLabel label="Police Station" />
                                <p className="text-base font-black text-slate-800">{caseData.stationId?.stationName || 'N/A'}</p>
                                <p className="text-xs font-bold text-slate-500 mt-1">Code: {caseData.stationId?.stationCode || 'N/A'}</p>
                            </div>
                            <div>
                                <InfoLabel label="S.H.O Name" />
                                <p className="text-sm font-bold text-slate-700">{caseData.stationId?.shoName || 'N/A'}</p>
                                <p className="text-xs font-bold text-slate-500 mt-1">Ph: {caseData.stationId?.phone || 'N/A'}</p>
                            </div>
                            
                            {/* Assigned Staff Mapping */}
                            <div className="md:col-span-2">
                                <InfoLabel label="Primary Assigned Officers" />
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {caseData.assignedStaff?.length > 0 ? caseData.assignedStaff.map((staff, idx) => (
                                        <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-black text-slate-700">{staff.fullName}</p>
                                                <p className="text-[10px] font-bold text-slate-400">{staff.rank}</p>
                                            </div>
                                            <span className="text-[10px] font-black text-[#08B36A] bg-emerald-50 px-2 py-1 rounded">
                                                {staff.badgeId}
                                            </span>
                                        </div>
                                    )) : (
                                        <p className="text-xs text-slate-400 font-bold">No primary staff assigned.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. FINAL REMARKS */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg"><FaFileAlt /></div>
                            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Final Summary / Remarks</h3>
                        </div>
                        <div className="p-6">
                            <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                                <p className="text-sm font-bold text-slate-700 italic whitespace-pre-wrap leading-relaxed">
                                    "{caseData.remarks || 'No closing remarks provided by the officer.'}"
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN (NARROWER) */}
                <div className="space-y-6">
                    
                    {/* 4. LEGAL & PROGRESS STATUS */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                            <div className="p-2 bg-amber-50 text-amber-500 rounded-lg"><FaGavel /></div>
                            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Legal Progress</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                                <span className="text-xs font-bold text-slate-400 uppercase">Arrest Status</span>
                                <span className="text-sm font-black text-slate-700">{caseData.legalProgress?.arrestStatus || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                                <span className="text-xs font-bold text-slate-400 uppercase">Bail Status</span>
                                <span className="text-sm font-black text-slate-700">{caseData.legalProgress?.bailStatus || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                                <span className="text-xs font-bold text-slate-400 uppercase">Charge Sheet</span>
                                <span className={`text-xs font-black px-2 py-1 rounded ${caseData.legalProgress?.isChargeSheetFiled ? 'bg-emerald-50 text-[#08B36A]' : 'bg-red-50 text-red-500'}`}>
                                    {caseData.legalProgress?.isChargeSheetFiled ? 'FILED' : 'NOT FILED'}
                                </span>
                            </div>

                            {/* Toggles Checklist */}
                            <div className="pt-2 space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Investigation Checklist</p>
                                <CheckItem label="Case Accepted" isChecked={caseData.progress?.isAccepted} />
                                <CheckItem label="Site Visited" isChecked={caseData.progress?.isSiteVisited} />
                                <CheckItem label="Evidence Collected" isChecked={caseData.progress?.isEvidenceCollected} />
                                <CheckItem label="Report Submitted" isChecked={caseData.progress?.isReportSubmitted} />
                            </div>
                        </div>
                    </div>

                    {/* 5. IMPACT & RESOURCES */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                            <div className="p-2 bg-red-50 text-red-500 rounded-lg"><FaCarCrash /></div>
                            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Impact & Resources</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Casualties</p>
                                    <p className="text-lg font-black text-slate-700">{caseData.damageImpact?.casualties || 0}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Injuries</p>
                                    <p className="text-lg font-black text-slate-700">{caseData.damageImpact?.injuries || 0}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">PCR Vans</p>
                                    <p className="text-lg font-black text-slate-700">{caseData.resourcesUsed?.pcrVansAssigned || 0}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Personnel</p>
                                    <p className="text-lg font-black text-slate-700">{caseData.resourcesUsed?.personnelCount || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 6. EVIDENCE & MEDIA */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                            <div className="p-2 bg-teal-50 text-teal-500 rounded-lg"><FaImage /></div>
                            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Evidence Attachments</h3>
                        </div>
                        <div className="p-6">
                            {caseData.evidence?.length > 0 ? (
                                <div className="space-y-3">
                                    {caseData.evidence.map((ev, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#08B36A] transition-colors cursor-pointer">
                                            <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400">
                                                {ev.fileType === 'Image' ? <FaFileImage /> : ev.fileType === 'Video' ? <FaVideo /> : <FaFilePdf />}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-xs font-black text-slate-700 truncate">{ev.fileName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{ev.fileSize} • {formatDate(ev.uploadedAt)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 font-bold text-center py-4">No evidence attached.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

// Sub-components
function InfoLabel({ label }) {
    return <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">{label}</p>
}

function CheckItem({ label, isChecked }) {
    return (
        <div className="flex items-center gap-3">
            {isChecked ? (
                <FaCheckCircle className="text-[#08B36A] text-base" />
            ) : (
                <FaTimesCircle className="text-slate-300 text-base" />
            )}
            <span className={`text-xs font-bold ${isChecked ? 'text-slate-700' : 'text-slate-400'}`}>
                {label}
            </span>
        </div>
    )
}