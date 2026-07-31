'use client'
import React, { useState } from 'react';
import { FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import FireHeadAPI from '@/app/services/FireHeadAPI';
import { toast, Toaster } from 'react-hot-toast';
 
export default function ChangePasswordPage() {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
 
    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });
 
    const [isLoading, setIsLoading] = useState(false);
 
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
 
    const toggleVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };
 
    const handleSubmit = async (e) => {
        e.preventDefault();
 
        // Basic Validation
        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error("New passwords do not match!");
        }
 
        if (formData.newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters.");
        }
 
        setIsLoading(true);
        try {
            const res = await FireHeadAPI.changePassword({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });
 
            if (res.success) {
                toast.success("Password updated successfully!");
                setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update password");
        } finally {
            setIsLoading(false);
        }
    };
 
    return (
        <div className="max-w-2xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Toaster position="top-right" />
           
            {/* Header Area */}
            <div className="text-center mb-10">
                <div className="inline-flex p-4 bg-emerald-50 rounded-3xl text-[#08B36A] mb-4 shadow-sm border border-emerald-100">
                    <FaShieldAlt size={32} />
                </div>
                <h1 className="text-3xl font-black text-gray-800 tracking-tight uppercase">Security Settings</h1>
                <p className="text-gray-500 font-medium mt-2">Update your account password to stay secure</p>
            </div>
 
            {/* Main Form Card */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-12">
                    <form onSubmit={handleSubmit} className="space-y-7">
                       
                        {/* Old Password */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#08B36A] transition-colors">
                                    <FaLock size={16} />
                                </div>
                                <input
                                    type={showPasswords.old ? "text" : "password"}
                                    name="oldPassword"
                                    value={formData.oldPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter current password"
                                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-[#08B36A] focus:bg-white transition-all font-bold text-gray-700 shadow-inner"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleVisibility('old')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2"
                                >
                                    {showPasswords.old ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
 
                        {/* Divider */}
                        <div className="flex items-center gap-4 py-2">
                            <div className="h-px flex-1 bg-gray-100"></div>
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">New Credentials</span>
                            <div className="h-px flex-1 bg-gray-100"></div>
                        </div>
 
                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#08B36A] transition-colors">
                                    <FaLock size={16} />
                                </div>
                                <input
                                    type={showPasswords.new ? "text" : "password"}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="Minimum 6 characters"
                                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-[#08B36A] focus:bg-white transition-all font-bold text-gray-700 shadow-inner"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleVisibility('new')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2"
                                >
                                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
 
                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#08B36A] transition-colors">
                                    <FaLock size={16} />
                                </div>
                                <input
                                    type={showPasswords.confirm ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="Re-type new password"
                                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-[#08B36A] focus:bg-white transition-all font-bold text-gray-700 shadow-inner"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleVisibility('confirm')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2"
                                >
                                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>
 
                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-6 py-5 bg-[#08B36A] text-white font-black rounded-2xl shadow-xl shadow-emerald-100 hover:bg-[#069356] hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em] disabled:bg-gray-300 disabled:shadow-none disabled:translate-y-0"
                        >
                            {isLoading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Updating Security...
                                </>
                            ) : (
                                <>
                                    <FaCheckCircle />
                                    Update Password
                                </>
                            )}
                        </button>
                    </form>
                </div>
 
                {/* Footer Tip */}
                <div className="bg-gray-50 px-8 py-5 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold text-center uppercase tracking-widest">
                        Tip: Use a combination of letters, numbers, and symbols for better safety.
                    </p>
                </div>
            </div>
        </div>
    );
}
 