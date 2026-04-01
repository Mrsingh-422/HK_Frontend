"use client";

import React, { useState, useRef } from 'react';

// --- Zero-Dependency Icons ---
const Icons = {
  ChevronLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  ShieldAlert: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
};

export default function MaintenanceMode() {
  const [status, setStatus] = useState('disabled'); // 'enabled' or 'disabled'
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1742900654_Health_Kangaroo-1_1.png"); // Default placeholder logo
  const fileInputRef = useRef(null);

  // Handle Image Upload & Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving Configuration:", { status, selectedImage });
    alert(`Maintenance Mode ${status === 'enabled' ? 'Activated' : 'Deactivated'} Successfully!`);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Navigation */}
        <div className="flex justify-between items-center mb-10">
          <div className="relative">
             <div className="bg-[#5cb85c] text-white px-8 py-4 rounded-xl shadow-xl shadow-green-200/50 font-black text-lg uppercase tracking-tight relative z-10 border border-green-400/20">
               Maintenance Mode
             </div>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 uppercase text-xs tracking-widest">
            <Icons.ChevronLeft /> Go Back
          </button>
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden mb-10">
          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Left Side: Controls */}
              <div className="space-y-10">
                
                {/* Mode Selection */}
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Select Operational Mode</label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Enable Option */}
                    <div 
                      onClick={() => setStatus('enabled')}
                      className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${status === 'enabled' ? 'border-[#5cb85c] bg-green-50/50 shadow-lg shadow-green-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${status === 'enabled' ? 'border-[#5cb85c] bg-[#5cb85c]' : 'border-slate-200'}`}>
                        {status === 'enabled' && <div className="text-white scale-75"><Icons.Check /></div>}
                      </div>
                      <div>
                        <p className={`font-black text-sm ${status === 'enabled' ? 'text-[#5cb85c]' : 'text-slate-700'}`}>ENABLE</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Set site to offline</p>
                      </div>
                    </div>

                    {/* Disable Option */}
                    <div 
                      onClick={() => setStatus('disabled')}
                      className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex items-center gap-4 ${status === 'disabled' ? 'border-slate-800 bg-slate-900 shadow-xl' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${status === 'disabled' ? 'border-white bg-white' : 'border-slate-200'}`}>
                         {status === 'disabled' && <div className="text-slate-900 scale-75"><Icons.Check /></div>}
                      </div>
                      <div>
                        <p className={`font-black text-sm ${status === 'disabled' ? 'text-white' : 'text-slate-700'}`}>DISABLE</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Keep site public</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Maintenance Hero Image <span className="text-slate-300 ml-2">(1425 × 715 px)</span></label>
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="group border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center hover:border-[#5cb85c] hover:bg-green-50/20 transition-all cursor-pointer bg-slate-50/50"
                  >
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-[#5cb85c] group-hover:scale-110 transition-all mb-4">
                      <Icons.Upload />
                    </div>
                    <p className="text-sm font-bold text-slate-700">Choose file or drag here</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG or WebP (Max. 2MB)</p>
                  </div>
                </div>
              </div>

              {/* Right Side: Information / Guidelines */}
              <div className="bg-slate-50 rounded-3xl p-8 flex flex-col justify-center">
                 <div className="text-[#5cb85c] mb-6">
                    <Icons.ShieldAlert />
                 </div>
                 <h3 className="text-xl font-black text-slate-800 mb-4 tracking-tight uppercase">Operational Security</h3>
                 <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                    Enabling Maintenance Mode will redirect all public traffic to the maintenance screen. Admins with dashboard access will still be able to preview and test the website in real-time.
                 </p>
                 <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white p-3 rounded-xl border border-slate-100">
                      <span className="text-[#5cb85c]"><Icons.Check /></span> SEO metadata remains cached
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white p-3 rounded-xl border border-slate-100">
                      <span className="text-[#5cb85c]"><Icons.Check /></span> Database connections persist
                    </div>
                 </div>
              </div>

            </div>

            {/* Bottom Button */}
            <div className="mt-16 flex justify-center border-t border-slate-100 pt-10">
              <button 
                type="submit"
                className="px-16 py-4 bg-[#5cb85c] hover:bg-[#4cae4c] text-white font-black rounded-2xl shadow-2xl shadow-green-200 transition-all transform active:scale-95 uppercase tracking-[0.2em] text-sm"
              >
                SUBMIT DETAILS
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Section */}
        <div className="relative group animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="absolute -top-4 left-6 z-10 bg-slate-900 text-white px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl">
             Live Preview
          </div>
          <div className="bg-[#FFB938] min-h-[450px] rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between p-12 md:p-20 overflow-hidden relative border-8 border-white">
             {/* Text Content */}
             <div className="relative z-10 text-white max-w-lg">
                <img 
                  src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1742900654_Health_Kangaroo-1_1.png" 
                  alt="Health Kangaroo" 
                  className="h-20 mb-10 brightness-0 invert"
                />
                <h4 className="text-3xl md:text-5xl font-medium mb-4 opacity-90 tracking-tight">Website is</h4>
                <h5 className="text-4xl md:text-7xl font-black mb-8 leading-none">Under Maintenance</h5>
                <div className="w-20 h-1.5 bg-white rounded-full"></div>
             </div>

             {/* Dynamic Image Preview */}
             <div className="mt-12 md:mt-0 relative z-10 flex-shrink-0">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-[2rem] border border-white/20">
                   <img 
                      src={previewUrl} 
                      alt="Maintenance Illustration" 
                      className="w-full max-w-[400px] object-contain drop-shadow-2xl"
                   />
                </div>
             </div>

             {/* Background Decoration */}
             <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
          </div>
        </div>

      </div>
    </div>
  );
}