"use client";
import React, { useState, useEffect } from "react";
import {
    FaShieldAlt, FaCheckCircle, FaFingerprint, FaIdCard,
    FaSpinner, FaArrowRight, FaChevronLeft, FaQrcode, FaUniversity
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import UserAPI from "@/app/services/UserAPI";

function AbhaPage() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form States
    const [aadhaar, setAadhaar] = useState("");
    const [consent, setConsent] = useState(false);
    const [otp, setOtp] = useState("");
    const [txnId, setTxnId] = useState("");

    // Result State
    const [abhaData, setAbhaData] = useState({
        abhaNumber: "",
        abhaAddress: "",
        name: "Verified User" // Fallback name
    });

    // Check status on load
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const result = await UserAPI.checkAbhaStatus();
                if (result.isLinked) {
                    setAbhaData({
                        abhaNumber: result.data.abhaNumber,
                        abhaAddress: result.data.abhaAddress,
                        name: result.data.name || "Verified User"
                    });
                    setStep(4);
                } else {
                    setStep(1);
                }
            } catch (error) {
                toast.error("Failed to check status");
            } finally {
                setIsLoading(false);
            }
        };
        checkStatus();
    }, []);

    const handleGenerateOtp = async () => {
        if (aadhaar.length !== 12) return toast.error("Please enter a valid 12-digit Aadhaar number");
        if (!consent) return toast.error("Consent is required to proceed");

        setIsProcessing(true);
        try {
            const data = await UserAPI.abhaGenerateOtp(aadhaar);
            if (data.success) {
                setTxnId(data.txnId);
                setStep(3);
                toast.success("OTP sent to your linked mobile number");
            } else {
                toast.error(data.message || "Request failed");
            }
        } catch (error) {
            toast.error("Network error. Try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 4) return toast.error("Enter valid OTP");
        setIsProcessing(true);
        try {
            const data = await UserAPI.abhaVerifyOtp(otp, txnId);
            if (data.success) {
                finalizeAbha(data.nextTxnId || txnId);
            } else {
                toast.error(data.message || "Invalid OTP");
            }
        } catch (error) {
            toast.error("Verification error");
        } finally {
            setIsProcessing(false);
        }
    };

    const finalizeAbha = async (finalTxn) => {
        try {
            const data = await UserAPI.abhaFinalize(finalTxn);
            if (data.success) {
                setAbhaData({
                    abhaNumber: data.data.abhaNumber,
                    abhaAddress: data.data.abhaAddress,
                    name: data.data.name || "Verified User"
                });
                setStep(4);
                toast.success("ABHA Linked Successfully!");
            }
        } catch (error) {
            toast.error("Final link failed");
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-32">
            <FaSpinner className="animate-spin text-[#08b36a] text-5xl mb-4" />
            <p className="text-gray-400 font-black uppercase tracking-[4px] text-[10px]">Securing Connection...</p>
        </div>
    );

    return (
        <div className="max-w-xl mx-auto px-4 py-10">
            <Toaster />
            <div className="bg-white rounded-[50px] shadow-2xl shadow-green-100/50 border border-gray-100 overflow-hidden">

                {/* Header Section */}
                <div className="p-8 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                    {step > 1 && step < 4 ? (
                        <button onClick={() => setStep(step - 1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-2xl shadow-sm text-gray-400 hover:text-gray-900 transition-all">
                            <FaChevronLeft />
                        </button>
                    ) : <div className="w-10"></div>}
                    <div className="text-center">
                        <h3 className="text-xl font-black text-gray-800 m-0 tracking-tight">ABHA PORTAL</h3>
                        <p className="text-[9px] text-[#08b36a] font-black uppercase tracking-widest m-0">National Health Authority</p>
                    </div>
                    <div className="w-10"></div>
                </div>

                <div className="p-10">

                    {/* Step 1: Welcome */}
                    {step === 1 && (
                        <div className="text-center animate-in fade-in slide-in-from-bottom-6 duration-500">
                            <div className="w-20 h-20 bg-green-50 text-[#08b36a] rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">
                                <FaShieldAlt />
                            </div>
                            <h4 className="font-black text-gray-900 text-2xl mb-4">Create your Health ID</h4>
                            <p className="text-gray-500 text-sm leading-relaxed mb-10">Using Aadhaar is the fastest way to generate your ABHA and digitize your medical history.</p>

                            <div className="p-6 bg-blue-50/50 rounded-[35px] mb-10 border border-blue-100 flex items-center gap-4 text-left">
                                <FaFingerprint className="text-blue-500 text-3xl" />
                                <p className="text-xs text-blue-700 font-bold leading-tight">Your Aadhaar details are only used for verification via UIDAI secure servers.</p>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full bg-[#08b36a] text-white py-6 rounded-[30px] font-black text-lg flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-green-200 transition-all"
                            >
                                START WITH AADHAAR <FaArrowRight />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Aadhaar Input */}
                    {step === 2 && (
                        <div className="animate-in fade-in duration-500">
                            <h4 className="font-black text-gray-800 text-xl mb-1">Verify Aadhaar</h4>
                            <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-8">Step 2 of 3</p>

                            <div className="space-y-6">
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#08b36a] text-xl">
                                        <FaFingerprint />
                                    </div>
                                    <input
                                        type="text"
                                        maxLength={12}
                                        value={aadhaar}
                                        onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                                        placeholder="0000 0000 0000"
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-[25px] py-6 pl-16 pr-6 text-2xl font-black tracking-[4px] focus:border-[#08b36a] outline-none transition-all placeholder:text-gray-200"
                                    />
                                </div>

                                <label className="flex items-start gap-4 p-6 bg-gray-50 rounded-[30px] cursor-pointer group border border-transparent hover:border-gray-200 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={consent}
                                        onChange={(e) => setConsent(e.target.checked)}
                                        className="mt-1 w-6 h-6 rounded-lg accent-[#08b36a]"
                                    />
                                    <span className="text-[11px] text-gray-500 leading-relaxed font-bold">
                                        I hereby provide my voluntary consent to use my Aadhaar number for authentication with NHA to create my ABHA ID.
                                    </span>
                                </label>

                                <button
                                    onClick={handleGenerateOtp}
                                    disabled={isProcessing}
                                    className="w-full bg-[#08b36a] text-white py-6 rounded-[25px] font-black text-lg disabled:opacity-50"
                                >
                                    {isProcessing ? <FaSpinner className="animate-spin mx-auto" /> : "SEND OTP"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: OTP Verification */}
                    {step === 3 && (
                        <div className="text-center animate-in fade-in duration-500">
                            <h4 className="font-black text-gray-800 text-xl mb-2">Confirm OTP</h4>
                            <p className="text-gray-400 text-sm mb-10">Verification code sent to mobile linked with <span className="text-gray-900 font-bold">XXXX XXXX {aadhaar.slice(-4)}</span></p>

                            <input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="0 0 0 0 0 0"
                                className="w-full text-center bg-gray-50 border-2 border-gray-100 rounded-[30px] p-6 text-4xl font-black tracking-[12px] focus:border-[#08b36a] outline-none mb-10"
                            />

                            <button
                                onClick={handleVerifyOtp}
                                disabled={isProcessing}
                                className="w-full bg-[#08b36a] text-white py-6 rounded-[25px] font-black text-lg"
                            >
                                {isProcessing ? <FaSpinner className="animate-spin mx-auto" /> : "VERIFY & FINALIZE"}
                            </button>
                        </div>
                    )}

                    {/* Step 4: The Aadhaar Styled Card */}
                    {step === 4 && (
                        <div className="animate-in zoom-in duration-700">
                            <div className="flex flex-col items-center mb-8 text-center">
                                <div className="w-16 h-16 bg-green-100 text-[#08b36a] rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">
                                    <FaCheckCircle />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 uppercase">Verification Success</h3>
                                <p className="text-[10px] text-gray-400 font-black tracking-[3px]">ABHA ID GENERATED</p>
                            </div>

                            {/* --- THE AADHAAR STYLE CARD --- */}
                            <div className="relative group perspective-1000">
                                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-[#08b36a] to-orange-500 rounded-[40px] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                                <div className="relative bg-white border border-gray-100 rounded-[35px] overflow-hidden shadow-2xl">
                                    {/* Card Header Background */}
                                    <div className="h-2 bg-gradient-to-r from-orange-500 via-white to-green-500 w-full"></div>

                                    <div className="p-8">
                                        {/* Top Header */}
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#08b36a] border border-gray-100">
                                                    <FaUniversity size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black text-gray-400 uppercase leading-none mb-0.5">Government of India</p>
                                                    <p className="text-[10px] font-black text-gray-800 uppercase leading-none">ABDM Authority</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="bg-green-100 text-[#08b36a] px-3 py-1 rounded-full text-[8px] font-black inline-block uppercase">Verified</div>
                                            </div>
                                        </div>

                                        {/* Card Content Grid */}
                                        <div className="flex gap-6 items-start mb-8">
                                            {/* Left: Photo Placeholder */}
                                            <div className="w-24 h-28 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-200 relative overflow-hidden">
                                                <FaIdCard size={40} />
                                                <div className="absolute bottom-0 w-full bg-[#08b36a]/10 py-1 text-center">
                                                    <span className="text-[8px] font-bold text-[#08b36a]">PHOTO</span>
                                                </div>
                                            </div>

                                            {/* Right: Details */}
                                            <div className="flex-1 space-y-4">
                                                <div>
                                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Name</p>
                                                    <h5 className="text-sm font-black text-gray-800 uppercase">{abhaData.name}</h5>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">ABHA Address</p>
                                                    <h5 className="text-sm font-black text-[#08b36a]">{abhaData.abhaAddress}</h5>
                                                </div>
                                                <div className="pt-2">
                                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">Status</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 bg-[#08b36a] rounded-full animate-pulse"></div>
                                                        <span className="text-[10px] font-black text-[#08b36a]">Active Digital ID</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom: Big ABHA Number Block */}
                                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex items-center justify-between">
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[2px] mb-1">Your ABHA Number</p>
                                                <h4 className="text-2xl font-black text-gray-800 tracking-widest">{abhaData.abhaNumber || "00-0000-0000-0000"}</h4>
                                            </div>
                                            <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                                                <FaQrcode className="text-gray-800" size={32} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Band */}
                                    <div className="bg-[#08b36a] p-4 flex justify-between items-center text-white">
                                        <div className="flex items-center gap-2">
                                            <FaFingerprint size={16} />
                                            <span className="text-[8px] font-bold">Secure Health Identity</span>
                                        </div>
                                        <p className="text-[8px] font-black opacity-80">ABDM.GOV.IN</p>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => window.print()} className="mt-10 w-full text-gray-400 font-black text-xs uppercase hover:text-[#08b36a] transition-all">
                                Download as PDF
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AbhaPage;