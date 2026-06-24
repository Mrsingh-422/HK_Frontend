'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaTimes 
} from 'react-icons/fa'
import PoliceAPI from '@/app/services/PoliceAPI'

export default function ChangePasswordPage() {
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return alert("Please fill all fields");
    }
    if (newPassword !== confirmPassword) {
      return alert("New password and confirm password do not match!");
    }

    setSubmitting(true);
    try {
      const response = await PoliceAPI.changeStationPassword({ oldPassword, newPassword });
      if (response.success) {
        alert("Password updated successfully!");
        // Password update hone ke baad wapas settings ya dashboard par bhej dein
        router.back(); 
      } else {
        alert(response.message || "Failed to update password");
      }
    } catch (error) {
      alert("Something went wrong!");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans animate-in fade-in duration-500">
      
      {/* Main Card */}
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
        
        {/* Header / Close Button */}
        <div className="flex justify-between items-center mb-6">
            <div className="w-12 h-12 bg-emerald-50 text-[#08B36A] rounded-2xl flex items-center justify-center shadow-inner">
                <FaLock size={20} />
            </div>
            <button 
              onClick={() => router.back()} 
              className="w-8 h-8 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
            >
                <FaTimes />
            </button>
        </div>
        
        <h3 className="font-black text-2xl text-slate-800 tracking-tight mb-1">Update Security</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Create a new strong password</p>

        <div className="space-y-5 mb-8">
          
          {/* Old Password */}
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#08B36A]" size={14} />
            <input 
              type={showOld ? "text" : "password"} 
              placeholder="Enter Old Password" 
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-11 pr-12 py-3.5 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#08B36A] focus:shadow-[0_0_0_4px_rgba(8,179,106,0.1)] transition-all"
            />
            <button onClick={() => setShowOld(!showOld)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showOld ? <FaEyeSlash size={16}/> : <FaEye size={16}/>}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#08B36A]" size={14} />
            <input 
              type={showNew ? "text" : "password"} 
              placeholder="Enter New Password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-11 pr-12 py-3.5 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#08B36A] focus:shadow-[0_0_0_4px_rgba(8,179,106,0.1)] transition-all"
            />
            <button onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showNew ? <FaEyeSlash size={16}/> : <FaEye size={16}/>}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#08B36A]" size={14} />
            <input 
              type={showConfirm ? "text" : "password"} 
              placeholder="Confirm New Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white border border-slate-200 pl-11 pr-12 py-3.5 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-[#08B36A] focus:shadow-[0_0_0_4px_rgba(8,179,106,0.1)] transition-all"
            />
            <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showConfirm ? <FaEyeSlash size={16}/> : <FaEye size={16}/>}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          onClick={handleSubmit} 
          disabled={submitting} 
          className="w-full bg-[#08B36A] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-200 disabled:opacity-50 hover:bg-[#07a25f] hover:-translate-y-0.5 transition-all active:scale-95"
        >
          {submitting ? 'UPDATING...' : 'SUBMIT'}
        </button>

      </div>
    </div>
  )
}