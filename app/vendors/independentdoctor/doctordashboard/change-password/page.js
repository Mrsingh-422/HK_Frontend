'use client'
import React, { useState } from 'react'
import { FaLock, FaEye, FaEyeSlash, FaSyncAlt, FaUserShield } from 'react-icons/fa'
import { toast, Toaster } from 'react-hot-toast'
import DoctorAPI from '@/app/services/DoctorAPI'

export default function ChangePasswordPage() {
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: ''
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const handlePasswordTextChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      toast.error("Please fill in all security fields.")
      return
    }

    try {
      setChangingPassword(true)
      const res = await DoctorAPI.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      })

      if (res && res.success) {
        toast.success(res.message || "Password updated successfully.")
        setPasswordData({ oldPassword: '', newPassword: '' })
      } else {
        toast.error(res?.message || "Failed to update password.")
      }
    } catch (error) {
      console.error("Security update error:", error)
      const responseMessage = error.response?.data?.message || "Error modifying password credentials"
      
      if (responseMessage.includes("bcrypt is not defined")) {
        toast.error("Server Error: Missing password hashing libraries (bcrypt) on backend.")
      } else {
        toast.error(responseMessage)
      }
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto pb-20 px-4 space-y-6">
      <Toaster position="top-right" />
      
      <div className="mb-12 flex flex-col items-center text-center">
        <div className="p-4 bg-[#08B36A] text-white rounded-[2rem] shadow-xl shadow-green-100 mb-4">
            <FaUserShield size={32}/>
        </div>
        <h1 className="text-4xl font-black text-[#1e3a8a] tracking-tighter uppercase leading-none">Security Settings</h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-3">Modify your login credentials securely</p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-red-50 text-red-600 rounded-xl"><FaLock/></div>
            <h2 className="text-xl font-black text-[#1e3a8a] uppercase tracking-tighter">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
              <label className="label-style">Current Password</label>
              <div className="relative">
                  <input 
                      type={showOldPassword ? "text" : "password"}
                      name="oldPassword" 
                      value={passwordData.oldPassword} 
                      onChange={handlePasswordTextChange} 
                      placeholder="••••••••" 
                      className="input-style pr-12" 
                      required 
                  />
                  <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                      {showOldPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
              </div>
          </div>
          
          <div>
              <label className="label-style">New Secure Password</label>
              <div className="relative">
                  <input 
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword" 
                      value={passwordData.newPassword} 
                      onChange={handlePasswordTextChange} 
                      placeholder="••••••••" 
                      className="input-style pr-12" 
                      required 
                  />
                  <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                      {showNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
              </div>
          </div>

          <div className="pt-4">
              <button 
                  type="submit" 
                  disabled={changingPassword}
                  className="w-full flex items-center justify-center gap-4 py-5 bg-[#08B36A] hover:bg-green-600 text-white font-black rounded-[1.5rem] shadow-xl shadow-green-100 transition-all active:scale-95 uppercase tracking-tighter text-sm disabled:opacity-50"
              >
                  {changingPassword ? <FaSyncAlt className="animate-spin" /> : 'Save Secure Password'}
              </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .label-style { display: block; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 900; font-size: 0.65rem; color: #9ca3af; margin-bottom: 0.5rem; margin-left: 0.5rem; }
        .input-style { width: 100%; padding: 16px 20px; background-color: #f8fafc; border-radius: 1.5rem; border: 1px solid #f1f5f9; font-weight: 800; color: #1e293b; font-size: 0.95rem; outline: none; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .input-style:focus { background-color: white; border-color: #08B36A; box-shadow: 0 15px 30px -10px rgba(8, 179, 106, 0.15); transform: translateY(-2px); }
        .input-style:disabled { cursor: not-allowed; opacity: 0.7; }
      `}</style>
    </div>
  )
}