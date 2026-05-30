"use client"

import React, { useState, useEffect } from 'react';
import AdminAPI from '../../../../services/AdminAPI'; // Adjust path
import { X, Settings, RefreshCw, Save, AlertCircle, CheckCircle2, History } from 'lucide-react';

function ManageDoctorReschedule({ isOpen, onClose }) {
    const [limit, setLimit] = useState('');
    const [currentLimit, setCurrentLimit] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Fetch current limit when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchCurrentLimit();
        }
    }, [isOpen]);

    // Auto-hide notification
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const fetchCurrentLimit = async () => {
        setFetching(true);
        try {
            const response = await AdminAPI.adminGetDoctorRescheduleLimit();
            if (response.success) {
                setCurrentLimit(response.data.maxRescheduleLimit);
                setLimit(response.data.maxRescheduleLimit);
            }
        } catch (error) {
            showToast("Could not retrieve doctor settings", "error");
        } finally {
            setFetching(false);
        }
    };

    const showToast = (message, type) => {
        setNotification({ show: true, message, type });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await AdminAPI.adminUpdateDoctorRescheduleLimit(Number(limit));
            if (response.success) {
                setCurrentLimit(response.data);
                showToast(response.message || "Doctor limit updated successfully", "success");
            }
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to update configuration", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            
            <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                
                {/* Header Section */}
                <div className="relative bg-white border-b border-slate-100 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#08B36A] rounded-lg shadow-lg shadow-[#08B36A]/20">
                            <Settings className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Doctor Settings</h2>
                            <p className="text-xs text-slate-500 font-medium">Global Reschedule Threshold</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    
                    {/* Information / Active Limit Section */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center gap-6">
                        <div className="w-14 h-14 bg-[#08B36A]/10 rounded-2xl flex items-center justify-center shrink-0">
                            <History className="text-[#08B36A] w-7 h-7" />
                        </div>
                        
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Active Limit</span>
                            {fetching ? (
                                <div className="mt-1 h-10 w-12 bg-slate-200 animate-pulse rounded-md"></div>
                            ) : (
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-slate-800 tracking-tight">{currentLimit}</span>
                                    <span className="text-[#08B36A] text-sm font-bold uppercase">Times</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-3 ml-1">
                                Set New Limit for Doctors
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={limit}
                                    onChange={(e) => setLimit(e.target.value)}
                                    className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] outline-none transition-all text-lg font-semibold text-slate-800"
                                    placeholder="e.g. 3"
                                    min="0"
                                    required
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                                    Retries
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || fetching}
                            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-white transition-all shadow-xl ${
                                loading 
                                ? 'bg-slate-400 cursor-not-allowed' 
                                : 'bg-[#08B36A] hover:bg-[#079e5e] active:scale-[0.97] shadow-[#08B36A]/25'
                            }`}
                        >
                            {loading ? (
                                <RefreshCw className="animate-spin h-5 w-5" />
                            ) : (
                                <Save className="h-5 w-5" />
                            )}
                            {loading ? 'Processing...' : 'Apply Changes Globally'}
                        </button>
                    </form>

                    {/* Small Alert Note */}
                    <div className="flex items-start gap-3 p-4 bg-amber-50/60 border border-amber-100 rounded-xl">
                        <AlertCircle className="text-amber-500 w-4 h-4 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                            Note: This configuration affects all doctor appointment reschedules immediately. Higher limits give patients more flexibility but may impact doctor scheduling stability.
                        </p>
                    </div>
                </div>
            </div>

            {/* Notification Toast (Specific style from Hospital Design) */}
            {notification.show && (
                <div className={`fixed bottom-8 right-8 z-[110] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all animate-in slide-in-from-right-10 duration-300 ${
                    notification.type === 'success' 
                    ? 'bg-white border-[#08B36A] text-slate-800' 
                    : 'bg-white border-red-500 text-slate-800'
                }`}>
                    {notification.type === 'success' ? (
                        <div className="bg-[#08B36A] p-1 rounded-full text-white">
                            <CheckCircle2 size={18} />
                        </div>
                    ) : (
                        <div className="bg-red-500 p-1 rounded-full text-white">
                            <AlertCircle size={18} />
                        </div>
                    )}
                    <p className="font-bold text-sm tracking-tight">{notification.message}</p>
                </div>
            )}
        </div>
    );
}

export default ManageDoctorReschedule;