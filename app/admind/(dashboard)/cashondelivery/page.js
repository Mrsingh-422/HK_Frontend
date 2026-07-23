"use client";
import React, { useState, useEffect } from 'react';
import {
    FaFlask, FaPills, FaUserNurse, FaHospital, FaStethoscope,
    FaAmbulance, FaMoneyBillWave, FaArrowLeft, FaCheckCircle,
    FaTimesCircle, FaShieldAlt
} from 'react-icons/fa';
import AdminAPI from '@/app/services/AdminAPI'; // Apne folder path ke hisab se modify karein
 
export default function CodManagementPage() {
    // States
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [togglingVendor, setTogglingVendor] = useState(null); // specific vendor loader
    const [alertMessage, setAlertMessage] = useState({ type: '', text: '' });
 
    // Fetch configs on mount
    const fetchCodConfigs = async () => {
        setLoading(true);
        try {
            const response = await AdminAPI.getCODConfigurations();
            if (response.success) {
                setConfigs(response.data || []);
            } else {
                showAlert('error', 'Failed to retrieve COD configurations.');
            }
        } catch (error) {
            showAlert('error', 'Error occurred while loading COD configurations.');
        } finally {
            setLoading(false);
        }
    };
 
    useEffect(() => {
        fetchCodConfigs();
    }, []);
 
    // Helper to display alert banner
    const showAlert = (type, text) => {
        setAlertMessage({ type, text });
        setTimeout(() => setAlertMessage({ type: '', text: '' }), 5000);
    };
 
    // Toggle Handler
    const handleToggle = async (vendorType, currentStatus) => {
        setTogglingVendor(vendorType); // Set loader on that specific card
        try {
            const newStatus = !currentStatus;
            const response = await AdminAPI.toggleCODAvailability(vendorType, newStatus);
            if (response.success) {
                // Dynamically update the local state array
                setConfigs(prev =>
                    prev.map(item =>
                        item.vendorType === vendorType
                            ? { ...item, isCodAvailable: newStatus }
                            : item
                    )
                );
                showAlert('success', response.message || `COD status for ${vendorType} updated successfully.`);
            } else {
                showAlert('error', response.message || 'Failed to toggle status.');
            }
        } catch (error) {
            showAlert('error', 'Error updating database configuration.');
        } finally {
            setTogglingVendor(null);
        }
    };
 
    // Helper function to map vendor types to icons & colors
    const getVendorStyles = (vendorType) => {
        const styles = {
            'Lab': {
                icon: <FaFlask className="text-xl text-blue-600" />,
                bg: 'bg-blue-50 border-blue-100',
                themeColor: 'text-blue-700'
            },
            'Pharmacy': {
                icon: <FaPills className="text-xl text-emerald-600" />,
                bg: 'bg-emerald-50 border-emerald-100',
                themeColor: 'text-emerald-700'
            },
            'Nurse': {
                icon: <FaUserNurse className="text-xl text-cyan-600" />,
                bg: 'bg-cyan-50 border-cyan-100',
                themeColor: 'text-cyan-700'
            },
            'Hospital': {
                icon: <FaHospital className="text-xl text-indigo-600" />,
                bg: 'bg-indigo-50 border-indigo-100',
                themeColor: 'text-indigo-700'
            },
            'Doctor': {
                icon: <FaStethoscope className="text-xl text-rose-600" />,
                bg: 'bg-rose-50 border-rose-100',
                themeColor: 'text-rose-700'
            },
            'Ambulance': {
                icon: <FaAmbulance className="text-xl text-amber-600" />,
                bg: 'bg-amber-50 border-amber-100',
                themeColor: 'text-amber-700'
            }
        };
        return styles[vendorType] || {
            icon: <FaMoneyBillWave className="text-xl text-slate-600" />,
            bg: 'bg-slate-50 border-slate-100',
            themeColor: 'text-slate-700'
        };
    };
 
    // Derived values for stats
    const totalEnabled = configs.filter(c => c.isCodAvailable).length;
    const totalDisabled = configs.filter(c => !c.isCodAvailable).length;
 
    return (
        <div className="w-full min-h-screen bg-[#F4F7F6] p-4 md:p-8 font-sans antialiased">
            <div className="max-w-7xl mx-auto space-y-6">
 
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-5 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#e6f7eb] p-3 rounded-xl border border-[#08B36A]/20">
                            <FaMoneyBillWave className="text-[#08B36A] text-xl" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-wide">COD Availability settings</h1>
                            <p className="text-[13px] text-gray-500 font-medium mt-0.5">Manage and toggle Cash on Delivery configuration policies dynamically.</p>
                        </div>
                    </div>
                   
                    <div>
                        <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border-2 border-[#08B36A] text-[#08B36A] hover:bg-[#e6f7eb] text-[13px] font-bold rounded-xl transition-all">
                            <FaArrowLeft size={12} /> Go Back
                        </button>
                    </div>
                </div>
 
                {/* Toast Alerts */}
                {alertMessage.text && (
                    <div className={`p-4 rounded-xl text-sm border-l-4 shadow-sm transition-all duration-300 ${
                        alertMessage.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-500 animate-in slide-in-from-top-3'
                            : 'bg-rose-50 text-rose-800 border-rose-500 animate-in slide-in-from-top-3'
                    }`}>
                        <div className="flex items-center gap-2">
                            {alertMessage.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
                            <span>{alertMessage.text}</span>
                        </div>
                    </div>
                )}
 
                {/* Stats / Overview Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Configured Services</p>
                        <h3 className="text-2xl font-black text-slate-900">{configs.length} Services</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow border-b-4 border-b-emerald-500">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">COD Allowed</p>
                        <h3 className="text-2xl font-black text-emerald-600 flex items-center gap-2">
                            {totalEnabled} Enabled <FaCheckCircle className="text-emerald-500 text-sm" />
                        </h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow border-b-4 border-b-rose-500">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">COD Blocked</p>
                        <h3 className="text-2xl font-black text-rose-600 flex items-center gap-2">
                            {totalDisabled} Disabled <FaTimesCircle className="text-rose-500 text-sm" />
                        </h3>
                    </div>
                </div>
 
                {/* Main Cards Grid */}
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-32 gap-3 bg-white border border-slate-100 rounded-3xl shadow-sm">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-[#08B36A]"></div>
                        <span className="text-xs font-bold text-slate-400">Syncing COD policy matrices...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {configs.map((config) => {
                            const configStyle = getVendorStyles(config.vendorType);
                            const isToggling = togglingVendor === config.vendorType;
 
                            return (
                                <div
                                    key={config.vendorType}
                                    className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between h-52 relative overflow-hidden"
                                >
                                    {/* Card Loading Overlay when toggling */}
                                    {isToggling && (
                                        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex justify-center items-center z-10 transition-all">
                                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-100 border-t-[#08B36A]"></div>
                                        </div>
                                    )}
 
                                    {/* Top Metadata */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-xl border ${configStyle.bg}`}>
                                                {configStyle.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-slate-800 text-[16px] tracking-tight">{config.vendorType} Configuration</h4>
                                                <span className={`text-[10px] font-black uppercase tracking-wider ${configStyle.themeColor}`}>Service Segment</span>
                                            </div>
                                        </div>
                                    </div>
 
                                    {/* Middle Status Indicator */}
                                    <div className="flex items-center gap-2 pt-2">
                                        <span className={`w-2 h-2 rounded-full ${config.isCodAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                            Cash on Delivery: <span className={config.isCodAvailable ? 'text-emerald-600 font-extrabold' : 'text-slate-500 font-bold'}>{config.isCodAvailable ? 'ENABLED' : 'DISABLED'}</span>
                                        </span>
                                    </div>
 
                                    {/* Footer Switch Toggle */}
                                    <div className="border-t border-slate-100 pt-4 mt-2 flex justify-between items-center bg-slate-50/50 -mx-6 -mb-6 p-6 rounded-b-2xl">
                                        <span className="text-[12px] font-bold text-slate-600 flex items-center gap-1.5">
                                            <FaShieldAlt className="text-slate-400" />
                                            Toggle Status
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={config.isCodAvailable}
                                                onChange={() => handleToggle(config.vendorType, config.isCodAvailable)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#08B36A]"></div>
                                        </label>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
 