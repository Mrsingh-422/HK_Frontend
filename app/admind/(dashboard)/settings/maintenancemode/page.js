"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, Upload, Check, ChevronLeft, RefreshCw, 
  Save, AlertCircle, CheckCircle2, X, Clock, Eye, Sparkles, Shield
} from 'lucide-react';
import AdminAPI2 from '@/app/services/AdminAPI2';

export default function MaintenanceMode() {
  const [status, setStatus] = useState('disabled');
  const [title, setTitle] = useState("System Under Scheduled Maintenance");
  const [message, setMessage] = useState("We are improving our platform to serve you better. We will be back online shortly.");
  const [estimatedEndTime, setEstimatedEndTime] = useState("");
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1742900654_Health_Kangaroo-1_1.png");
  
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertBanner, setAlertBanner] = useState(null);
  const fileInputRef = useRef(null);

  const showAlert = (msg, type = 'success') => {
    setAlertBanner({ message: msg, type });
    setTimeout(() => setAlertBanner(null), 4500);
  };

  const fetchSettings = async () => {
    setFetching(true);
    try {
      const res = await AdminAPI2.getMaintenanceSettings();
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        setStatus(data.isEnabled ? 'enabled' : 'disabled');
        if (data.title) setTitle(data.title);
        if (data.message) setMessage(data.message);
        if (data.estimatedEndTime) {
          setEstimatedEndTime(new Date(data.estimatedEndTime).toISOString().slice(0, 16));
        }
        if (data.heroImage) {
          setPreviewUrl(AdminAPI2.getMaintenanceMediaUrl(data.heroImage));
        }
      }
    } catch (err) {
      console.error("Error loading maintenance settings:", err);
      showAlert(err.response?.data?.message || "Could not retrieve maintenance settings", "error");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showAlert("Image file size exceeds 2MB limit", "error");
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('isEnabled', status === 'enabled');
      formData.append('title', title.trim());
      formData.append('message', message.trim());
      
      if (estimatedEndTime) {
        formData.append('estimatedEndTime', new Date(estimatedEndTime).toISOString());
      }
      if (selectedImage) {
        formData.append('heroImage', selectedImage);
      }

      const res = await AdminAPI2.updateMaintenanceSettings(formData);
      if (res.data?.success || res.status === 200) {
        showAlert(res.data?.message || `Maintenance mode successfully ${status === 'enabled' ? 'ENABLED (Site is Offline)' : 'DISABLED (Site is Live)'}!`);
        fetchSettings();
      } else {
        showAlert(res.data?.message || "Failed to update maintenance settings", "error");
      }
    } catch (err) {
      console.error("Maintenance save error:", err);
      showAlert(err.response?.data?.message || "Error updating maintenance mode", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Global Toast Alert */}
        {alertBanner && (
          <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md animate-in fade-in duration-200 ${
            alertBanner.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}>
            <div className="flex items-center gap-2">
              {alertBanner.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{alertBanner.message}</span>
            </div>
            <button onClick={() => setAlertBanner(null)}><X size={16} /></button>
          </div>
        )}
        
        {/* Top Navigation */}
        <div className="flex justify-between items-center">
          <div className="bg-[#08B36A] text-white px-7 py-3.5 rounded-2xl shadow-xl shadow-green-200/50 font-black text-base uppercase tracking-tight border border-green-400/20 flex items-center gap-2">
            <ShieldAlert size={20} /> Maintenance Mode Control
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchSettings} 
              disabled={fetching}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition shadow-sm text-xs uppercase tracking-wider disabled:opacity-50"
            >
              <RefreshCw size={14} className={fetching ? "animate-spin text-[#08B36A]" : ""} /> Refresh
            </button>
            <button 
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition shadow-sm text-xs uppercase tracking-wider"
            >
              <ChevronLeft size={16} /> Go Back
            </button>
          </div>
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Left Controls */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                    Select Operational Mode
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      onClick={() => setStatus('enabled')}
                      className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                        status === 'enabled' 
                          ? 'border-[#08B36A] bg-emerald-50/50 shadow-lg shadow-emerald-50' 
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        status === 'enabled' ? 'border-[#08B36A] bg-[#08B36A]' : 'border-slate-200'
                      }`}>
                        {status === 'enabled' && <Check size={14} className="text-white" />}
                      </div>
                      <div>
                        <p className={`font-black text-sm ${status === 'enabled' ? 'text-[#08B36A]' : 'text-slate-700'}`}>ENABLE</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Set site to offline</p>
                      </div>
                    </div>

                    <div 
                      onClick={() => setStatus('disabled')}
                      className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                        status === 'disabled' 
                          ? 'border-slate-800 bg-slate-900 shadow-xl' 
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        status === 'disabled' ? 'border-white bg-white' : 'border-slate-200'
                      }`}>
                         {status === 'disabled' && <Check size={14} className="text-slate-900" />}
                      </div>
                      <div>
                        <p className={`font-black text-sm ${status === 'disabled' ? 'text-white' : 'text-slate-700'}`}>DISABLE</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Keep site public</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Maintenance Heading
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. System Under Scheduled Maintenance"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#08B36A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Visitor Notification Message
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Provide detailed information on why the platform is temporarily offline..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#08B36A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Estimated Uptime / Countdown End Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={estimatedEndTime}
                      onChange={(e) => setEstimatedEndTime(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#08B36A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                    Hero Banner Image <span className="text-slate-300 ml-1 font-normal">(1425 × 715 px, Max 2MB)</span>
                  </label>
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="group border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center hover:border-[#08B36A] hover:bg-emerald-50/20 transition-all cursor-pointer bg-slate-50/50"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      className="hidden" 
                      accept="image/*" 
                    />
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-[#08B36A] group-hover:scale-110 transition-all mb-3">
                      <Upload size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-700">Click to choose image or drag here</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG or WebP (Max. 2MB)</p>
                  </div>
                </div>
              </div>

              {/* Right Side Guidelines */}
              <div className="bg-slate-50 rounded-3xl p-8 flex flex-col justify-center space-y-6">
                 <div className="p-3 bg-emerald-100 text-[#08B36A] w-fit rounded-2xl">
                    <ShieldAlert size={26} />
                 </div>
                 <div>
                   <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">Security & Operational Continuity</h3>
                   <p className="text-slate-500 text-xs leading-relaxed font-medium">
                      Enabling Maintenance Mode intercepts public visitors at the root layout and presents the maintenance screen. Admins with active tokens maintain 100% uninterrupted access.
                   </p>
                 </div>

                 <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-sm">
                      <Check size={16} className="text-[#08B36A] shrink-0" /> Admin bypass guarantees continuous dashboard operations
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-sm">
                      <Check size={16} className="text-[#08B36A] shrink-0" /> Automated asset lifecycle purges outdated banners on update
                    </div>
                 </div>
              </div>

            </div>

            <div className="flex justify-center border-t border-slate-100 pt-8">
              <button 
                type="submit"
                disabled={saving}
                className="px-16 py-4 bg-[#08B36A] hover:bg-[#06965a] text-white font-black rounded-2xl shadow-xl shadow-green-200/50 transition-all transform active:scale-95 uppercase tracking-[0.2em] text-xs flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Updating System...' : 'Submit & Apply Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Display Matching Public Screen */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">
            <Eye size={15} /> Real-Time Visitor Screen Preview (Branded):
          </div>

          <div className="bg-[#070d18] min-h-[440px] rounded-[3rem] shadow-2xl flex flex-col justify-between p-8 md:p-12 overflow-hidden relative border-4 border-slate-800">
             
             {/* Header Logo In Preview */}
             <div className="flex items-center justify-between pb-4 border-b border-white/5 relative z-10">
                <div className="flex items-center gap-2.5">
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="h-8 w-auto brightness-0 invert" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <span className="text-sm font-black text-white uppercase italic">
                    Health <span className="text-[#08B36A]">Kangaroo</span>
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-white/10 text-emerald-400 px-3 py-1 rounded-full border border-white/10">
                  {status === 'enabled' ? '● Public Traffic Intercepted' : '○ Platform Currently Live'}
                </span>
             </div>

             {/* Content */}
             <div className="my-auto py-6 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="text-white max-w-lg space-y-3 text-left">
                  <span className="inline-block text-[#fbbf24] text-[10px] font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    Scheduled Platform Upgrade
                  </span>
                  <h4 className="text-2xl md:text-4xl font-black text-white leading-tight">
                    {title || "System Under Scheduled Maintenance"}
                  </h4>
                  <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                    {message || "We are improving our platform to serve you better. We will be back online shortly."}
                  </p>
                  {estimatedEndTime && (
                    <p className="text-xs text-slate-400 font-mono bg-white/5 px-4 py-1.5 rounded-xl border border-white/10 w-fit">
                      Estimated Uptime: {new Date(estimatedEndTime).toLocaleString()}
                    </p>
                  )}
                  <div className="w-16 h-1 bg-[#08B36A] rounded-full mt-3" />
                </div>

                <div className="relative z-10 flex-shrink-0">
                  <div className="bg-gradient-to-b from-[#131e30] to-[#0d1624] p-4 rounded-[2.5rem] border border-white/10 max-w-xs shadow-2xl">
                    <img 
                      src={previewUrl} 
                      alt="Maintenance Banner Preview" 
                      className="w-full h-auto max-h-[220px] rounded-2xl object-contain shadow-2xl"
                    />
                  </div>
                </div>
             </div>

             <div className="pt-3 border-t border-white/5 text-[10px] text-slate-500 flex justify-between relative z-10">
                <span>© {new Date().getFullYear()} Health Kangaroo</span>
                <span>HELPLINE: +91 9879879879</span>
             </div>

             {/* Glow effect */}
             <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
          </div>
        </div>

      </div>
    </div>
  );
}