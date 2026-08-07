'use client'
import React, { useState, useRef } from 'react'
import { FaLock, FaEye, FaEyeSlash, FaSpinner, FaShieldAlt, FaPhone, FaKey, FaCheckCircle, FaChevronLeft, FaUserCheck, FaUsers, FaUserCircle, FaFlask } from 'react-icons/fa'
import { toast, Toaster } from 'react-hot-toast'
import { RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth' 
import { auth } from '@/lib/firebase' 
import LabAPI from '@/app/services/LabVendorAPI'

export default function LabChangePasswordPage() {
  const [mode, setMode] = useState('traditional')
  const [otpStep, setOtpStep] = useState(1) 

  // Traditional Mode Form State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: ''
  })
  const [changingPassword, setChangingPassword] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // OTP Mode Form State
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpNewPassword, setOtpNewPassword] = useState('')
  const [otpConfirmPassword, setOtpConfirmPassword] = useState('')
  const [showOtpNewPassword, setShowOtpNewPassword] = useState(false)
  const [showOtpConfirmPassword, setShowOtpConfirmPassword] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState(null)
  
  // Multi-Profile States
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [showAccountSelector, setShowAccountSelector] = useState(false)
  
  // Reset Token and dynamic Account Info state from API response
  const [resetToken, setResetToken] = useState('')
  const [accountInfo, setAccountInfo] = useState(null)

  // ✅ Use ref to track if reCAPTCHA is rendered
  const recaptchaRendered = useRef(false);

  // ✅ Cleanup function - completely reset reCAPTCHA
  const cleanupRecaptcha = () => {
    try {
      const container = document.getElementById('recaptcha-container');
      if (container) {
        // ✅ Completely clear the container
        container.innerHTML = '';
      }
      // ✅ Reset the verifier reference
      if (window.recaptchaVerifier) {
        try {
          // Try to clear if method exists
          if (typeof window.recaptchaVerifier.clear === 'function') {
            window.recaptchaVerifier.clear();
          }
        } catch (e) {
          // Ignore clear errors
        }
        window.recaptchaVerifier = null;
      }
      recaptchaRendered.current = false;
    } catch (error) {
      console.debug('Cleanup done');
    }
  };

  // ✅ Creates RecaptchaVerifier instance - only if not already rendered
  const getOrCreateRecaptchaVerifier = () => {
    if (typeof window === 'undefined') return null;

    try {
      // ✅ If already rendered, clean up first
      if (recaptchaRendered.current) {
        cleanupRecaptcha();
      }

      const container = document.getElementById('recaptcha-container');
      if (!container) {
        console.error('reCAPTCHA container not found');
        return null;
      }

      // ✅ Ensure container is empty
      container.innerHTML = '';

      // ✅ Create new verifier
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          recaptchaRendered.current = false;
          cleanupRecaptcha();
        }
      });

      window.recaptchaVerifier = verifier;
      recaptchaRendered.current = true;
      return verifier;
    } catch (error) {
      console.error('Error creating reCAPTCHA verifier:', error);
      recaptchaRendered.current = false;
      toast.error('Failed to initialize verification. Please refresh and try again.');
      return null;
    }
  };

  // Handle Input Changes for Traditional Form
  const handlePasswordTextChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  // Submit Traditional Change Password Form
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      toast.error("Please fill in all security fields.")
      return
    }

    if (passwordData.oldPassword === passwordData.newPassword) {
      toast.error("New password must be different from current password.")
      return
    }

    try {
      setChangingPassword(true)
      
      const res = await LabAPI.changePassword({
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
      
      const responseMessage = error.response?.data?.message || error.message || error.toString()
      
      if (error.response?.status === 401) {
        toast.error("Current password is incorrect. Please try again.")
      } else if (error.response?.status === 400) {
        toast.error(responseMessage || "Invalid request. Please check your inputs.")
      } else if (responseMessage.includes("bcrypt is not defined")) {
        toast.error("Server Error: Missing password hashing configuration on backend.")
      } else {
        toast.error(responseMessage)
      }
    } finally {
      setChangingPassword(false)
    }
  }

  // --- OTP Flow: Step 1 Submit (Get Accounts) ---
  const handleOtpPhoneSubmit = async (e) => {
    e.preventDefault()
    if (!phone) {
      toast.error("Please enter your registered phone number.")
      return
    }

    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      toast.error("Please enter a valid phone number in international format (e.g., +919876543210).")
      return
    }

    try {
      setChangingPassword(true)
      
      // ✅ Clean up any existing reCAPTCHA before new request
      cleanupRecaptcha();
      
      const res = await LabAPI.verifyForgotPasswordPhone(phone)
      
      if (res && res.success && res.accounts) {
        // Filter only Lab accounts
        const labAccounts = res.accounts.filter(
          account => account.role === 'Lab' || account.role === 'lab'
        );
        
        if (labAccounts.length === 0) {
          toast.error("No Lab account registered with this phone number.");
          setAccounts([]);
          setSelectedAccount(null);
          setShowAccountSelector(false);
          return;
        }
        
        setAccounts(labAccounts);
        
        if (labAccounts.length === 1) {
          const account = labAccounts[0];
          setSelectedAccount(account);
          setShowAccountSelector(false);
          toast.success(`Lab account found: ${account.name}`);
          await sendOtpForSelectedAccount(account);
        } else {
          setShowAccountSelector(true);
          setOtpStep(1.5);
          toast.success(`${labAccounts.length} Lab accounts found. Please select one.`);
        }
      } else {
        toast.error(res?.message || "No account found with this phone number.")
      }
    } catch (error) {
      console.error("OTP Step 1 Error:", error)
      
      let errorMessage = "Verification failed. Please try again."
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-phone-number':
            errorMessage = "Invalid phone number format. Please use international format."
            break
          case 'auth/too-many-requests':
            errorMessage = "Too many requests. Please try again later."
            break
          case 'auth/network-request-failed':
            errorMessage = "Network error. Please check your internet connection."
            break
          default:
            errorMessage = error.response?.data?.message || error.message || "Verification failed."
        }
      }
      toast.error(errorMessage)
      // ✅ Clean up on error
      cleanupRecaptcha();
    } finally {
      setChangingPassword(false)
    }
  }

  // ✅ Fixed: Send OTP with proper reCAPTCHA handling
  const sendOtpForSelectedAccount = async (account) => {
    try {
      setChangingPassword(true)
      
      // ✅ Ensure clean reCAPTCHA before creating new one
      cleanupRecaptcha();
      
      // ✅ Wait a moment for DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const appVerifier = getOrCreateRecaptchaVerifier();
      if (!appVerifier) {
        throw new Error("Unable to load the verification provider.")
      }

      setSelectedAccount(account)
      setShowAccountSelector(false)

      // ✅ Send SMS
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(confirmation)
      setOtpStep(2)
      toast.success(`OTP sent to ${phone} for Lab account!`)
    } catch (error) {
      console.error("Send OTP Error:", error)
      
      // ✅ Better error message for reCAPTCHA errors
      let errorMessage = error.message || "Failed to send OTP. Please try again.";
      if (error.message && error.message.includes('reCAPTCHA')) {
        errorMessage = "Verification failed. Please refresh and try again.";
        cleanupRecaptcha();
      }
      
      toast.error(errorMessage)
      cleanupRecaptcha();
    } finally {
      setChangingPassword(false)
    }
  }

  const handleAccountSelect = (account) => {
    setSelectedAccount(account)
    setShowAccountSelector(false)
    toast.success(`Selected: ${account.name}`)
    sendOtpForSelectedAccount(account)
  }

  // --- OTP Flow: Step 2 Submit (Verify OTP) ---
  const handleOtpVerifySubmit = async (e) => {
    e.preventDefault()
    if (!otp) {
      toast.error("Please enter the 6-digit OTP.")
      return
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP.")
      return
    }

    if (!selectedAccount) {
      toast.error("No account selected. Please go back and try again.")
      return
    }

    try {
      setChangingPassword(true)
      if (!confirmationResult) {
        throw new Error("Missing verification state. Please send OTP again.")
      }

      const credential = await confirmationResult.confirm(otp)
      const user = credential.user
      const idToken = await user.getIdToken(true)
      await signOut(auth);

      const res = await LabAPI.verifyFirebaseOtp({ 
        phone, 
        idToken,
        selectedRole: selectedAccount.role
      })

      if (res && res.success && res.resetToken) {
        setResetToken(res.resetToken)
        setAccountInfo(res.accountInfo)
        toast.success("OTP Verified Successfully!")
        setOtpStep(3)
      } else {
        toast.error(res?.message || "Verification failed.")
      }
    } catch (error) {
      console.error("OTP Step 2 Error:", error)
      
      if (error.response) {
        console.error('📛 Backend error response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      try {
        await signOut(auth);
      } catch (clearErr) {
        console.error("Error clearing session:", clearErr);
      }

      let errorMessage = "Invalid or expired OTP code."
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = "Invalid OTP. Please check and try again."
      } else if (error.code === 'auth/code-expired') {
        errorMessage = "OTP has expired. Please request a new one."
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage)
    } finally {
      setChangingPassword(false)
    }
  }

  // --- OTP Flow: Step 3 Submit (Reset Password) ---
  const handleOtpPasswordSubmit = async (e) => {
    e.preventDefault()
    if (!otpNewPassword || !otpConfirmPassword) {
      toast.error("Please fill in all password fields.")
      return
    }

    if (otpNewPassword !== otpConfirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    if (!selectedAccount) {
      toast.error("No account selected. Please try again.")
      return
    }

    try {
      setChangingPassword(true)
      const res = await LabAPI.resetPasswordPhone({
        phone,
        resetToken,
        selectedRole: selectedAccount.role,
        newPassword: otpNewPassword,
        confirmPassword: otpConfirmPassword
      })

      if (res && res.success) {
        toast.success(res.message || "Password Reset Successfully. Please Login.")
        setMode('traditional')
        setOtpStep(1)
        setPhone('')
        setOtp('')
        setOtpNewPassword('')
        setOtpConfirmPassword('')
        setAccounts([])
        setSelectedAccount(null)
        setAccountInfo(null)
        setResetToken('')
        setConfirmationResult(null)
        setShowAccountSelector(false)
        cleanupRecaptcha();
      } else {
        toast.error(res?.message || "Failed to reset password.")
      }
    } catch (error) {
      console.error("OTP Step 3 Error:", error)
      toast.error(error.response?.data?.message || error.message || "Error resetting password.")
    } finally {
      setChangingPassword(false)
    }
  }

  const switchToOtpMode = () => {
    cleanupRecaptcha();
    setMode('otp');
    setOtpStep(1);
    setAccounts([]);
    setSelectedAccount(null);
    setShowAccountSelector(false);
  };

  const switchToTraditionalMode = () => {
    cleanupRecaptcha();
    setMode('traditional');
    setOtpStep(1);
    setAccounts([]);
    setSelectedAccount(null);
    setShowAccountSelector(false);
  };

  const renderAccountSelector = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><FaFlask/></div>
          <h2 className="text-xl font-extrabold text-[#1e3a8a] uppercase tracking-tight">Select Lab Profile</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Multiple Lab accounts found with this phone number. Please select which one you want to reset:
        </p>
        <div className="space-y-3">
          {accounts.map((account, index) => (
            <button
              key={index}
              onClick={() => handleAccountSelect(account)}
              className="w-full p-4 bg-slate-50 hover:bg-[#08B36A]/5 border border-slate-200 hover:border-[#08B36A] rounded-2xl transition-all text-left flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-[#08B36A]/10 text-[#08B36A] flex items-center justify-center flex-shrink-0">
                <FaFlask size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#1e3a8a] text-sm truncate">{account.name}</p>
                <div className="flex gap-2 items-center mt-0.5">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{account.role}</span>
                  <span className="text-[10px] text-gray-400">•</span>
                  <span className="text-[10px] text-gray-400 truncate">{account.email}</span>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-[#08B36A] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </button>
          ))}
        </div>
        <button 
          type="button" 
          onClick={switchToTraditionalMode}
          className="w-full py-4 border border-gray-200 text-gray-500 font-bold rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-wider hover:bg-slate-50 mt-4"
        >
          Cancel
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12 px-4 md:px-0">
      <Toaster position="top-right" />
      
      {/* ✅ reCAPTCHA container - ensure it exists */}
      <div id="recaptcha-container"></div>

      <div className="mb-12 flex flex-col items-center text-center">
        <div className="p-4 bg-[#08B36A] text-white rounded-[2rem] shadow-xl shadow-green-100 mb-4">
            <FaShieldAlt size={32}/>
        </div>
        <h1 className="text-4xl font-extrabold text-[#1e3a8a] tracking-tight uppercase leading-none">Lab Security Center</h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-3">Configure and secure your operational registry credentials</p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100">
        
        {mode === 'traditional' && (
          <>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-red-50 text-red-600 rounded-xl"><FaLock/></div>
              <h2 className="text-xl font-extrabold text-[#1e3a8a] uppercase tracking-tight">Change Password</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Current Password</label>
                <div className="relative">
                  <input 
                    type={showOldPassword ? "text" : "password"}
                    name="oldPassword" 
                    value={passwordData.oldPassword} 
                    onChange={handlePasswordTextChange} 
                    placeholder="••••••••" 
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] outline-none font-medium text-gray-800 pr-12 text-sm bg-slate-50/50"
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
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">New Secure Password</label>
                <div className="relative">
                  <input 
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword" 
                    value={passwordData.newPassword} 
                    onChange={handlePasswordTextChange} 
                    placeholder="••••••••" 
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] outline-none font-medium text-gray-800 pr-12 text-sm bg-slate-50/50"
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

              <div className="pt-4 space-y-4">
                <button 
                  type="submit" 
                  disabled={changingPassword}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[#08B36A] hover:bg-green-600 text-white font-bold rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-wider disabled:opacity-50 shadow-lg shadow-green-600/20"
                >
                  {changingPassword ? <FaSpinner className="animate-spin" /> : 'Save New Password'}
                </button>
                
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={switchToOtpMode}
                    className="text-xs font-bold text-[#1e3a8a] hover:text-[#08B36A] transition-colors uppercase tracking-wider"
                  >
                    Forgot Password? Reset via Phone OTP
                  </button>
                </div>
              </div>
            </form>
          </>
        )}

        {mode === 'otp' && (
          <>
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${otpStep >= 1 ? 'text-[#08B36A]' : 'text-gray-300'}`}>
                <span className="w-5 h-5 flex items-center justify-center rounded-full border border-current text-[10px]">1</span> Phone
              </div>
              <div className="h-[2px] flex-1 mx-3 bg-gray-100"></div>
              <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${otpStep >= 2 ? 'text-[#08B36A]' : 'text-gray-300'}`}>
                <span className="w-5 h-5 flex items-center justify-center rounded-full border border-current text-[10px]">2</span> OTP
              </div>
              <div className="h-[2px] flex-1 mx-3 bg-gray-100"></div>
              <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${otpStep >= 3 ? 'text-[#08B36A]' : 'text-gray-300'}`}>
                <span className="w-5 h-5 flex items-center justify-center rounded-full border border-current text-[10px]">3</span> New Pass
              </div>
            </div>

            {showAccountSelector && (
              renderAccountSelector()
            )}

            {otpStep === 1 && !showAccountSelector && (
              <form onSubmit={handleOtpPhoneSubmit} className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-50 text-[#08B36A] rounded-xl"><FaPhone/></div>
                  <h2 className="text-xl font-extrabold text-[#1e3a8a] uppercase tracking-tight">Verify Phone Number</h2>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Registered Phone Number</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="+919876543210" 
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] outline-none font-medium text-gray-800 text-sm bg-slate-50/50"
                    required 
                  />
                  <span className="text-[10px] text-gray-400 mt-2 block leading-normal uppercase font-bold tracking-wide">Enter in complete international format (e.g. +919876543210)</span>
                </div>
                <div className="pt-2 flex flex-col gap-4">
                  <button 
                    type="submit" 
                    disabled={changingPassword}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-[#08B36A] hover:bg-green-600 text-white font-bold rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-wider disabled:opacity-50 shadow-lg shadow-green-600/20"
                  >
                    {changingPassword ? <FaSpinner className="animate-spin" /> : 'Find My Lab Accounts'}
                  </button>
                  <button 
                    type="button" 
                    onClick={switchToTraditionalMode}
                    className="w-full py-4 border border-gray-200 text-gray-500 font-bold rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-wider hover:bg-slate-50"
                  >
                    Cancel & Back
                  </button>
                </div>
              </form>
            )}

            {otpStep === 2 && selectedAccount && (
              <form onSubmit={handleOtpVerifySubmit} className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-50 text-[#08B36A] rounded-xl"><FaKey/></div>
                  <h2 className="text-xl font-extrabold text-[#1e3a8a] uppercase tracking-tight">Enter Code</h2>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3 mb-4">
                  <FaFlask className="text-blue-600" size={18} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-700 truncate">{selectedAccount.name}</p>
                    <p className="text-[10px] text-gray-500">Lab • {selectedAccount.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">6-Digit Verification Code</label>
                  <input 
                    type="text" 
                    maxLength="6"
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••" 
                    className="w-full px-5 py-4 text-center rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] outline-none font-extrabold text-gray-800 text-lg bg-slate-50/50 tracking-[0.4em]"
                    required 
                  />
                </div>
                <div className="pt-2 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setOtpStep(1);
                      setShowAccountSelector(false);
                      cleanupRecaptcha();
                    }}
                    className="w-1/3 flex items-center justify-center gap-2 py-4 border border-gray-200 text-gray-500 font-bold rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-wider"
                  >
                    <FaChevronLeft/> Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={changingPassword}
                    className="w-2/3 flex items-center justify-center gap-2 py-4 bg-[#08B36A] hover:bg-green-600 text-white font-bold rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-wider disabled:opacity-50 shadow-lg shadow-green-600/20"
                  >
                    {changingPassword ? <FaSpinner className="animate-spin" /> : 'Verify OTP'}
                  </button>
                </div>
              </form>
            )}

            {otpStep === 3 && selectedAccount && (
              <form onSubmit={handleOtpPasswordSubmit} className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-50 text-[#08B36A] rounded-xl"><FaCheckCircle/></div>
                  <h2 className="text-xl font-extrabold text-[#1e3a8a] uppercase tracking-tight">Create New Password</h2>
                </div>

                {accountInfo && (
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl flex items-center gap-4 transition-all animate-fade-in mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#08B36A]/10 text-[#08B36A] flex items-center justify-center">
                      <FaFlask size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Target Profile</p>
                      <h3 className="font-extrabold text-[#1e3a8a] text-sm truncate leading-snug">{accountInfo.name || selectedAccount.name}</h3>
                      <p className="text-[11px] text-gray-500 truncate leading-none mt-1">{accountInfo.email || selectedAccount.email}</p>
                    </div>
                    <div className="px-3 py-1.5 bg-[#08B36A]/10 text-[#08B36A] rounded-xl text-[9px] font-black uppercase tracking-wider">
                      {accountInfo.role || selectedAccount.role}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative">
                    <input 
                      type={showOtpNewPassword ? "text" : "password"}
                      value={otpNewPassword} 
                      onChange={(e) => setOtpNewPassword(e.target.value)} 
                      placeholder="••••••••" 
                      className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] outline-none font-medium text-gray-800 pr-12 text-sm bg-slate-50/50"
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowOtpNewPassword(!showOtpNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showOtpNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Confirm Password</label>
                  <div className="relative">
                    <input 
                      type={showOtpConfirmPassword ? "text" : "password"}
                      value={otpConfirmPassword} 
                      onChange={(e) => setOtpConfirmPassword(e.target.value)} 
                      placeholder="••••••••" 
                      className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-[#08B36A]/10 focus:border-[#08B36A] outline-none font-medium text-gray-800 pr-12 text-sm bg-slate-50/50"
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowOtpConfirmPassword(!showOtpConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showOtpConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={changingPassword}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-[#08B36A] hover:bg-green-600 text-white font-bold rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-wider disabled:opacity-50 shadow-lg shadow-green-600/20"
                  >
                    {changingPassword ? <FaSpinner className="animate-spin" /> : 'Set New Password'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

      </div>
    </div>
  )
}