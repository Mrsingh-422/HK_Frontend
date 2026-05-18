"use client";

import React, { useState, useEffect } from 'react';
import { 
    User, MapPin, Phone, Calendar, 
    ClipboardList, Pill, CreditCard, X, 
    Loader2, ChevronRight, Info, Search,
    Hash, Activity
} from 'lucide-react';
import DoctorAPI from '@/app/services/DoctorAPI';

const PatientHistoryPage = () => {
    const [historyList, setHistoryList] = useState([]);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await DoctorAPI.getPatientHistory();
            if (res.success) {
                setHistoryList(res.data);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDetails = async (id) => {
        try {
            setDetailLoading(true);
            setIsModalOpen(true);
            const res = await DoctorAPI.getPatientHistoryDetails(id);
            if (res.success) {
                setSelectedDetail(res.data);
            }
        } catch (error) {
            console.error("Error fetching details:", error);
            setIsModalOpen(false);
        } finally {
            setDetailLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-[#08B36A]" />
                    <div className="absolute inset-0 scale-150 blur-2xl bg-[#08B36A]/20 -z-10 rounded-full"></div>
                </div>
                <p className="mt-4 text-gray-500 font-medium animate-pulse">Retrieving records...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50/50">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Patient History</h1>
                <p className="text-gray-500 mt-1">Review and manage past medical consultations and treatments.</p>
            </div>

            {/* Table View */}
            {historyList.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Patient Details</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Location</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {historyList.map((item) => (
                                    <tr 
                                        key={item.appointmentId}
                                        className="hover:bg-[#08B36A]/5 transition-all cursor-pointer group"
                                        onClick={() => fetchDetails(item.appointmentId)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#08B36A]/5 to-[#08B36A]/10 flex items-center justify-center overflow-hidden shrink-0 border border-[#08B36A]/20 shadow-sm group-hover:scale-105 transition-transform">
                                                    {item.profileImage ? (
                                                        <img src={item.profileImage} alt={item.patientName} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <User className="text-[#08B36A] w-5 h-5" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 group-hover:text-[#08B36A] transition-colors">
                                                        {item.patientName}
                                                    </div>
                                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Hash size={12} /> ID: {item.appointmentId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <div className="p-1.5 bg-gray-100 rounded-md mr-2.5">
                                                    <MapPin size={14} className="text-gray-500" />
                                                </div>
                                                {item.location}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#08B36A] bg-white border border-[#08B36A]/20 rounded-xl shadow-sm hover:bg-[#08B36A] hover:text-white hover:border-[#08B36A] transition-all active:scale-95">
                                                View Records
                                                <ChevronRight size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* Empty State */
                <div className="text-center py-24 bg-white border-2 border-dashed border-gray-200 rounded-3xl">
                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="text-gray-300 w-10 h-10" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No records found</h3>
                    <p className="mt-1 text-gray-500 max-w-xs mx-auto">You haven't completed any patient consultations yet.</p>
                </div>
            )}

            {/* Detail Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-white/20">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#08B36A]/10 rounded-lg">
                                    <Activity className="text-[#08B36A] w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Treatment Summary</h2>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Medical Record</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Scrollable Content */}
                        <div className="overflow-y-auto custom-scrollbar flex-1">
                            {detailLoading ? (
                                <div className="p-24 flex flex-col items-center justify-center">
                                    <Loader2 className="animate-spin text-[#08B36A] w-8 h-8" />
                                    <p className="text-sm text-gray-400 mt-4">Fetching details...</p>
                                </div>
                            ) : selectedDetail && (
                                <div className="p-8 space-y-10">
                                    
                                    {/* 1. Patient Profile Card */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="h-1 w-8 bg-[#08B36A] rounded-full"></div>
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#08B36A]">Patient Identity</h3>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-100 shadow-inner">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Full Name</p>
                                                <p className="font-bold text-gray-900">{selectedDetail.patientInfo.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Age / Gender</p>
                                                <p className="font-semibold text-gray-700">{selectedDetail.patientInfo.age} yrs • {selectedDetail.patientInfo.gender}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Blood Group</p>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                                                    {selectedDetail.patientInfo.bloodGroup}
                                                </span>
                                            </div>
                                            <div className="col-span-full border-t border-gray-200/60 pt-4 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone size={14} className="text-[#08B36A]" />
                                                    {selectedDetail.patientInfo.phone}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <MapPin size={14} className="text-[#08B36A]" />
                                                    <span className="truncate">{selectedDetail.patientInfo.address}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* 2. Diagnosis Section */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="h-1 w-8 bg-orange-500 rounded-full"></div>
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-orange-600">Consultation Summary</h3>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap gap-2">
                                                {selectedDetail.consultationSummary.diagnosis.map((d, i) => (
                                                    <span key={i} className="px-4 py-1.5 bg-orange-50 text-orange-700 rounded-xl text-xs font-bold border border-orange-100 shadow-sm">
                                                        {d}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                                    <p className="text-[10px] font-bold text-orange-600 uppercase mb-2">Symptoms Reported</p>
                                                    <p className="text-sm text-gray-700 leading-relaxed font-medium">{selectedDetail.consultationSummary.symptoms}</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                                    <p className="text-[10px] font-bold text-[#08B36A] uppercase mb-2">Duration & Mode</p>
                                                    <p className="text-sm text-gray-700 leading-relaxed font-medium">{selectedDetail.consultationSummary.mode} • {selectedDetail.consultationSummary.duration}</p>
                                                </div>
                                            </div>
                                            <div className="bg-[#08B36A]/5 p-5 rounded-2xl border border-[#08B36A]/10 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                                    <Info size={40} className="text-[#08B36A]" />
                                                </div>
                                                <p className="text-[10px] font-bold text-[#08B36A] uppercase mb-2">Clinical Observation</p>
                                                <p className="text-sm text-gray-800 italic font-medium">"{selectedDetail.consultationSummary.doctorNotes}"</p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* 3. Prescription Table */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="h-1 w-8 bg-[#08B36A] rounded-full"></div>
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-[#08B36A]">Prescription</h3>
                                        </div>
                                        <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50/80">
                                                    <tr>
                                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Medicine</th>
                                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dosage</th>
                                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Duration</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {selectedDetail.prescription.map((med, index) => (
                                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-5 py-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="p-1.5 bg-[#08B36A]/10 rounded-lg">
                                                                        <Pill size={14} className="text-[#08B36A]" />
                                                                    </div>
                                                                    <span className="font-bold text-gray-800">{med.medicineName}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <span className="px-2 py-1 bg-[#08B36A]/10 text-[#08B36A] rounded-md text-xs font-bold uppercase border border-[#08B36A]/20">
                                                                    {med.dosage}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-4 text-gray-500 font-medium">{med.duration}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>

                                    {/* 4. Payment Invoice */}
                                    <section className="bg-gray-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-gray-200">
                                        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-[#08B36A] rounded-full blur-[100px] opacity-20"></div>
                                        
                                        <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6">
                                            <div>
                                                <h3 className="text-xl font-bold tracking-tight">Payment Receipt</h3>
                                                <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest font-semibold">Transaction ID: TXN-{(Math.random() * 100000).toFixed(0)}</p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="px-3 py-1.5 bg-[#08B36A]/20 text-[#08B36A] text-[10px] rounded-full font-bold border border-[#08B36A]/30 uppercase tracking-wider">Paid via {selectedDetail.paymentDetails.paymentMode}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 relative z-10">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Consultation Fee</span>
                                                <span className="font-mono">₹{selectedDetail.paymentDetails.consultationFee.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">Platform Services</span>
                                                <span className="font-mono">₹{selectedDetail.paymentDetails.platformFee.toLocaleString()}</span>
                                            </div>
                                            <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-center">
                                                <div>
                                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Total Amount</p>
                                                    <p className="text-3xl font-black text-white tracking-tighter mt-1">₹{selectedDetail.paymentDetails.totalPaid.toLocaleString()}</p>
                                                </div>
                                                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                                    <CreditCard className="text-white w-6 h-6" />
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                    
                                </div>
                            )}
                        </div>
                        
                        {/* Footer - Close Button for convenience */}
                        <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg"
                            >
                                Close Records
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientHistoryPage;