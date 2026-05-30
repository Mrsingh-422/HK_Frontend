import React, { useState, useEffect } from 'react';
import AdminAPI from '../../../services/AdminAPI'; // Ensure this path is correct
import { Settings, RefreshCw, Save, AlertCircle, CheckCircle2, History } from 'lucide-react';

function ManageHospitalRechedule() {
    const [limit, setLimit] = useState('');
    const [currentLimit, setCurrentLimit] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Auto-hide notification after 4 seconds
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Fetch current limit from API
    const fetchCurrentLimit = async () => {
        setFetching(true);
        try {
            const response = await AdminAPI.adminGetHospitalRescheduleLimit();
            if (response.success) {
                setCurrentLimit(response.data.maxRescheduleLimit);
                setLimit(response.data.maxRescheduleLimit);
            }
        } catch (error) {
            showToast("Could not retrieve current settings", "error");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchCurrentLimit();
    }, []);

    const showToast = (message, type) => {
        setNotification({ show: true, message, type });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await AdminAPI.adminUpdateHospitalRescheduleLimit(limit);
            if (response.success) {
                setCurrentLimit(response.data); // Update the big number display
                showToast(response.message || "Limit updated successfully", "success");
            }
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to update configuration", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans">
            {/* Header Section */}
            <div className="max-w-4xl mx-auto mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[#08B36A] rounded-lg">
                        <Settings className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Hospital Reschedule Settings</h1>
                </div>
                <p className="text-slate-500 ml-12">
                    Configure the global limit for bed booking reschedules across all registered hospitals.
                </p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Information Card */}
                <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-[#08B36A]/10 rounded-full flex items-center justify-center mb-4">
                        <History className="text-[#08B36A] w-8 h-8" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Limit</span>

                    {fetching ? (
                        <div className="mt-4 animate-pulse flex flex-col items-center">
                            <div className="h-10 w-16 bg-slate-200 rounded-md mb-2"></div>
                            <div className="h-4 w-24 bg-slate-100 rounded-md"></div>
                        </div>
                    ) : (
                        <div className="mt-2">
                            <div className="text-6xl font-black text-slate-800 tracking-tight">
                                {currentLimit}
                            </div>
                            <div className="text-[#08B36A] font-semibold mt-1">Allowed Retries</div>
                        </div>
                    )}
                </div>

                {/* Form Card */}
                <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Change Reschedule Threshold
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={limit}
                                    onChange={(e) => setLimit(e.target.value)}
                                    className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#08B36A] focus:border-transparent outline-none transition-all text-lg font-medium"
                                    placeholder="Enter limit (e.g. 3)"
                                    min="0"
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                    Times
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || fetching}
                            className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-white transition-all shadow-lg ${loading
                                ? 'bg-slate-400 cursor-not-allowed'
                                : 'bg-[#08B36A] hover:bg-[#079e5e] active:scale-[0.98] shadow-[#08B36A]/20'
                                }`}
                        >
                            {loading ? (
                                <RefreshCw className="animate-spin h-5 w-5" />
                            ) : (
                                <Save className="h-5 w-5" />
                            )}
                            {loading ? 'Processing...' : 'Update Global Configuration'}
                        </button>
                    </form>

                    <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <AlertCircle className="text-amber-500 w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 leading-relaxed">
                            <strong>Note:</strong> Changes made here will affect all users immediately. A lower limit prevents frequent changes to bed management schedules, while a higher limit offers more flexibility to patients.
                        </p>
                    </div>
                </div>
            </div>

            {/* Notification Toast */}
            {notification.show && (
                <div className={`fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all animate-in fade-in slide-in-from-bottom-5 duration-300 ${notification.type === 'success'
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
                    <p className="font-semibold text-sm">{notification.message}</p>
                </div>
            )}
        </div>
    );
}

export default ManageHospitalRechedule;