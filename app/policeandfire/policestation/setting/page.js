'use client';

import React, { useState } from 'react';
import { 
  FaArrowRight, 
  FaArrowLeft, 
  FaInfoCircle, 
  FaFileAlt 
} from 'react-icons/fa';

export default function SettingPage() {
  const [activeView, setActiveView] = useState('main'); // Views: 'main', 'about', 'terms'

  // --- VIEW: MAIN SELECTION ---
  const renderMainView = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-10">
      
      {/* About Card */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="w-12 h-12 bg-emerald-50 text-[#08B36A] rounded-2xl flex items-center justify-center mb-6">
          <FaInfoCircle size={22} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">About Us</h3>
        <p className="text-slate-500 font-medium leading-relaxed mb-10">
          Learn more about our mission, the technology behind our platform, and our commitment to service.
        </p>
        <button 
          onClick={() => setActiveView('about')}
          className="flex items-center gap-3 bg-[#08B36A] hover:bg-[#07a25f] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-green-100"
        >
          Click now <FaArrowRight />
        </button>
      </div>

      {/* Terms Card */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
          <FaFileAlt size={22} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Terms & Conditions</h3>
        <p className="text-slate-500 font-medium leading-relaxed mb-10">
          Review the legal framework, usage policies, and security agreements that govern our digital ecosystem.
        </p>
        <button 
          onClick={() => setActiveView('terms')}
          className="flex items-center gap-3 bg-[#08B36A] hover:bg-[#07a25f] text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-green-100"
        >
          Click now <FaArrowRight />
        </button>
      </div>
    </div>
  );

  // --- VIEW: FULL INFO PAGES ---
  const renderInnerPage = (title, content, icon, accentColor) => (
    <div className="animate-in slide-in-from-right-8 duration-500 max-w-3xl mx-auto">
      <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl border border-slate-50">
        <button 
          onClick={() => setActiveView('main')}
          className="flex items-center gap-2 text-slate-400 hover:text-[#08B36A] font-black mb-12 transition-colors uppercase tracking-[0.2em] text-[10px]"
        >
          <FaArrowLeft /> Back to Options
        </button>
        
        <div className="flex items-center gap-6 mb-12">
          <div className={`p-5 ${accentColor} rounded-3xl text-3xl shadow-inner`}>
            {icon}
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{title}</h2>
            <p className="text-[#08B36A] font-bold text-[10px] uppercase tracking-widest mt-1">Official Document</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-slate-600 text-lg leading-relaxed font-medium">
          {content}
        </div>
      </div>
    </div>
  );

  const aboutContent = (
    <div className="space-y-6">
      <p>Our platform provides high-efficiency digital management solutions tailored for medical professionals and command headquarters. Established in 2024, our primary goal is the seamless integration of real-time data with secure operational workflows.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System Status</p>
          <p className="text-slate-800 font-black text-lg tracking-tight">v1.0.2 Stable</p>
        </div>
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tech Support</p>
          <p className="text-[#08B36A] font-black text-lg tracking-tight leading-none">support@system.com</p>
        </div>
      </div>
    </div>
  );

  const termsContent = (
    <div className="space-y-10">
      <section>
        <h4 className="font-black text-slate-900 text-xl mb-4 tracking-tight">1. Data Privacy</h4>
        <p className="text-slate-500">All information transmitted through this portal is protected by industry-standard encryption protocols. We maintain a zero-leak policy regarding sensitive case records.</p>
      </section>
      <section>
        <h4 className="font-black text-slate-900 text-xl mb-4 tracking-tight">2. User Responsibility</h4>
        <p className="text-slate-500">Authorized personnel are responsible for maintaining the confidentiality of their credentials. Sharing of access is strictly prohibited and subject to auditing.</p>
      </section>
      <section>
        <h4 className="font-black text-slate-900 text-xl mb-4 tracking-tight">3. System Usage</h4>
        <p className="text-slate-500">The platform is provided for official administrative purposes. Any misuse of the data retrieval tools will result in immediate termination of the session.</p>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FBFC] font-sans p-6 md:p-20">
      <main className="max-w-6xl mx-auto">
        {activeView === 'main' && renderMainView()}
        {activeView === 'about' && renderInnerPage('About Us', aboutContent, <FaInfoCircle />, 'bg-emerald-50 text-[#08B36A]')}
        {activeView === 'terms' && renderInnerPage('Terms & Conditions', termsContent, <FaFileAlt />, 'bg-blue-50 text-blue-600')}
      </main>
    </div>
  );
}