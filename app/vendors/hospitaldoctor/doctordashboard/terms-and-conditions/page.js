'use client';
import React, { useState, useEffect } from 'react';
import HospitalAPI from '@/app/services/HospitalAPI';
import { 
  FaFileContract, FaSave, FaSyncAlt, 
  FaExclamationCircle, FaCheckCircle, 
  FaHistory, FaGlobeAmericas, FaInfoCircle,
  FaExclamationTriangle, FaShieldAlt, FaKeyboard,
  FaUpload, FaHospitalUser
} from 'react-icons/fa';

export default function ManageAbout() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const fetchAboutContent = async () => {
    setLoading(true);
    try {
      // API call placeholder - to be updated with your endpoint later
      const res = await HospitalAPI.getAbout();
      if (res && res.success) {
        setContent(res.data || ''); 
      } else {
        showMsg('error', res?.message || 'Could not load about content.');
      }
    } catch (error) {
      showMsg('error', 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeClick = () => {
    const cleanContent = content ? content.trim() : "";
    if (!cleanContent) {
        return showMsg('error', 'Content cannot be empty.');
    }
    setShowConfirmModal(true); 
  };

  const handleUpdate = async () => {
    setShowConfirmModal(false); 
    setSaving(true);
    try {
      // API call placeholder - to be updated with your endpoint later
      const res = await HospitalAPI.updateAbout(content);
      if (res && res.success) {
        showMsg('success', 'Changes published successfully!');
        if (res.data) setContent(res.data);
      } else {
        showMsg('error', res?.message || 'Failed to update content.');
      }
    } catch (error) {
      console.error("Update Error:", error);
      showMsg('error', 'A server error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  // Handler for .txt file upload with size and format validation
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation: Only .txt files allowed
    const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt');
    if (!isTxt) {
      return showMsg('error', 'Only .txt files are allowed.');
    }

    // Validation: Maximum file size limit 5MB
    const maxLimitBytes = 5 * 1024 * 1024;
    if (file.size > maxLimitBytes) {
      return showMsg('error', 'File size must be under 5MB.');
    }

    const formData = new FormData();
    formData.append('aboutFile', file);

    setLoading(true);
    try {
      // API call placeholder - to be updated with your endpoint later
      const res = await HospitalAPI.uploadAboutFile(formData);
      if (res && res.success) {
        showMsg('success', 'File uploaded and content updated successfully!');
        if (res.data) {
          setContent(res.data);
        } else {
          fetchAboutContent();
        }
      } else {
        showMsg('error', res?.message || 'Failed to upload the file.');
      }
    } catch (error) {
      console.error("File Upload Error:", error);
      showMsg('error', 'An error occurred during file upload.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-10 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600 font-bold text-[10px] uppercase tracking-widest shadow-sm">
              <FaShieldAlt className="animate-pulse" />
              <span>Verified Directory Listing</span>
            </div>
            <div className="space-y-1">
               <h1 className="text-5xl font-[1000] text-slate-900 tracking-tight leading-none">
  Terms & <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8">Conditions</span>
</h1>
                <p className="text-slate-500 font-medium text-lg max-w-lg pt-2">
                  Maintain the public profile of your healthcare institution. Changes reflect instantly on patient-facing booking channels.
                </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white">
            <button 
              onClick={fetchAboutContent}
              disabled={loading}
              className="group flex items-center gap-2 px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 font-bold hover:bg-white hover:border-slate-200 transition-all disabled:opacity-50"
            >
              <FaSyncAlt className={`${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-700"}`} />
              <span className="hidden sm:inline">Sync Data</span>
            </button>
            <button 
              onClick={handleFinalizeClick}
              disabled={saving || loading}
              className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3.5 rounded-2xl font-black shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] disabled:opacity-50 transition-all active:scale-95 hover:-translate-y-1"
            >
              {saving ? <FaSyncAlt className="animate-spin" /> : <FaCheckCircle className="text-lg" />}
              {saving ? 'Publishing...' : 'Finalize & Publish'}
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {message.text && (
          <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[150] px-6 py-4 rounded-3xl flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border backdrop-blur-xl animate-in zoom-in-90 duration-300 ${
            message.type === 'success' ? 'bg-white/90 border-emerald-100 text-emerald-900' : 'bg-white/90 border-red-100 text-red-900'
          }`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                {message.type === 'success' ? <FaCheckCircle size={20} /> : <FaExclamationCircle size={20} />}
            </div>
            <div className="flex flex-col">
                <span className="font-black text-sm">{message.type === 'success' ? 'Success' : 'Attention Needed'}</span>
                <span className="text-xs font-bold text-slate-500">{message.text}</span>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.3)] max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner border border-emerald-100 rotate-12 hover:rotate-0 transition-transform duration-500">
                  <FaExclamationTriangle />
                </div>
                <h3 className="text-3xl font-[1000] text-slate-900 mb-4 tracking-tight">Update Overview</h3>
                <p className="text-slate-500 font-semibold text-lg leading-relaxed">
                  Are you ready to publish this hospital profile overview? Your modifications will become instantly visible to patients.
                </p>
              </div>
              <div className="flex gap-4 p-8 bg-slate-50/50 border-t border-slate-100">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-5 px-6 bg-white border border-slate-200 rounded-3xl text-slate-500 font-black hover:bg-slate-100 transition-all"
                >
                  Go Back
                </button>
                <button 
                  onClick={handleUpdate}
                  className="flex-1 py-5 px-6 bg-emerald-600 text-white rounded-3xl font-black hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all active:scale-95"
                >
                  Publish Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* The Editor Canvas */}
        <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-br from-emerald-400/20 via-transparent to-blue-400/20 rounded-[3.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            
            <div className="relative bg-white rounded-[3rem] border border-slate-200/60 shadow-2xl shadow-slate-300/40 overflow-hidden ring-1 ring-slate-100">
                
                {/* Editor Control Bar */}
                <div className="bg-slate-50/80 backdrop-blur-md border-b border-slate-100 px-10 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex gap-2.5">
                            <div className="w-3.5 h-3.5 rounded-full bg-red-200 border border-red-300" />
                            <div className="w-3.5 h-3.5 rounded-full bg-amber-200 border border-amber-300" />
                            <div className="w-3.5 h-3.5 rounded-full bg-emerald-200 border border-emerald-300" />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                                <FaKeyboard className="text-emerald-500 text-xs" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Profile Editor</span>
                            </div>

                            {/* Text File Upload Action Widget */}
                            <label className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 shadow-sm cursor-pointer hover:bg-emerald-50/25 transition-all text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <FaUpload className="text-emerald-500 text-xs" />
                                <span>Upload .txt</span>
                                <input 
                                  type="file" 
                                  accept=".txt" 
                                  onChange={handleFileUpload} 
                                  className="hidden" 
                                />
                            </label>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                           Auto-sync active
                        </div>
                        <FaHistory className="text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors" />
                    </div>
                </div>

                {/* Editor Content Area */}
                <div className="relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-6">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-slate-100 rounded-full border-t-emerald-600 animate-spin"></div>
                                <FaHospitalUser className="absolute inset-0 m-auto text-emerald-600 text-lg" />
                            </div>
                            <p className="font-black text-slate-400 text-xs uppercase tracking-widest animate-pulse">Fetching Profile data...</p>
                        </div>
                    )}

                    <div className="p-12 md:p-20">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Describe your hospital's specialty, mission statement, history, and standards of care..."
                            className="w-full min-h-[600px] text-slate-700 text-xl md:text-2xl leading-[2] bg-transparent border-none focus:ring-0 resize-none font-medium placeholder:text-slate-200 transition-all"
                        />
                    </div>
                </div>

                {/* Editor Status Bar */}
                <div className="bg-white px-10 py-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Words</span>
                            <span className="text-sm font-black text-emerald-700 underline decoration-emerald-200">{content ? content.trim().split(/\s+/).length : 0}</span>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Chars</span>
                            <span className="text-sm font-black text-emerald-700 underline decoration-emerald-200">{content?.length || 0}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400 font-bold text-xs italic">
                        Edits are transmitted via securely encrypted channels
                        <FaHistory />
                    </div>
                </div>
            </div>
        </div>

        {/* Informative Tips Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 bg-white rounded-[2.5rem] border border-slate-200/50 shadow-xl shadow-slate-200/20 flex gap-6 items-start hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl shadow-inner">
                    <FaInfoCircle />
                </div>
                <div className="space-y-1">
                    <h4 className="font-black text-slate-800 text-base">Build Trust</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">Highlight your core medical expertise, certifications, and high standards of patient clinical care to attract new bookings.</p>
                </div>
            </div>
            <div className="p-8 bg-white rounded-[2.5rem] border border-slate-200/50 shadow-xl shadow-slate-200/20 flex gap-6 items-start hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl shadow-inner">
                    <FaGlobeAmericas />
                </div>
                <div className="space-y-1">
                    <h4 className="font-black text-slate-800 text-base">Portal Integration</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">This overview displays at the top of the patient mobile search listing and institutional bio dashboards.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}