'use client';

import React, { useState } from 'react';
import { 
  FaArrowRight, 
  FaArrowLeft, 
  FaInfoCircle, 
  FaFileAlt,
  FaFireExtinguisher,
  FaTruck,
  FaShieldAlt
} from 'react-icons/fa';

export default function FireStationSettingPage() {
  const [activeView, setActiveView] = useState('main'); // Views: 'main', 'about', 'terms'

  // --- VIEW: MAIN SELECTION ---
  const renderMainView = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-10">
      
      {/* About Card */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="w-12 h-12 bg-emerald-50 text-[#08B36A] rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <FaInfoCircle size={22} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">About Ops</h3>
        <p className="text-slate-500 font-medium leading-relaxed mb-10">
          Learn about our Fire & Rescue mission, tactical technology, and our commitment to district safety.
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
        <div className="w-12 h-12 bg-emerald-50 text-[#08B36A] rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <FaFileAlt size={22} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Protocols & Terms</h3>
        <p className="text-slate-500 font-medium leading-relaxed mb-10">
          Review the operational framework, dispatch policies, and safety agreements governing this station.
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
  const renderInnerPage = (title, content, icon) => (
    <div className="animate-in slide-in-from-right-8 duration-500 max-w-3xl mx-auto">
      <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl border border-slate-50">
        <button 
          onClick={() => setActiveView('main')}
          className="flex items-center gap-2 text-slate-400 hover:text-[#08B36A] font-black mb-12 transition-colors uppercase tracking-[0.2em] text-[10px]"
        >
          <FaArrowLeft /> Back to Station Options
        </button>
        
        <div className="flex items-center gap-6 mb-12 border-b border-slate-50 pb-8">
          <div className={`p-5 bg-emerald-50 text-[#08B36A] rounded-3xl text-3xl shadow-inner`}>
            {icon}
          </div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{title}</h2>
            <p className="text-[#08B36A] font-bold text-[10px] uppercase tracking-widest mt-1">Official Fire HQ Resource</p>
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
      <p>Our platform provides high-efficiency digital management solutions specifically engineered for fire departments and emergency rescue Marshall units. Established in 2024, we focus on the integration of live dispatch data with streamlined incident reporting.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
          <FaShieldAlt className="text-[#08B36A]" />
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System Status</p>
            <p className="text-slate-800 font-black text-lg tracking-tight leading-none">v1.0.2 Ready</p>
          </div>
        </div>
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
          <FaTruck className="text-[#08B36A]" />
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fleet Comms</p>
            <p className="text-[#08B36A] font-black text-lg tracking-tight leading-none">fire.support@hq.com</p>
          </div>
        </div>
      </div>
    </div>
  );

  const termsContent = (
    <div className="space-y-10">
      <section>
        <h4 className="font-black text-slate-900 text-xl mb-4 tracking-tight">1. Operational Data Security</h4>
        <p className="text-slate-500">All emergency incident logs and personnel deployment data are encrypted. We maintain a strict confidentiality protocol for all district fire records.</p>
      </section>
      <section>
        <h4 className="font-black text-slate-900 text-xl mb-4 tracking-tight">2. Dispatch Responsibility</h4>
        <p className="text-slate-500">Authorized Marshalls are responsible for the accuracy of live dispatches. Unauthorized transmission of SOS alerts is subject to administrative audit.</p>
      </section>
      <section>
        <h4 className="font-black text-slate-900 text-xl mb-4 tracking-tight">3. Incident Reporting</h4>
        <p className="text-slate-500">This platform is intended for official fire station management only. Digital evidence collected during operations must be handled as per State Fire Code.</p>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FBFC] font-sans p-6 md:p-10">
      <main className="max-w-6xl mx-auto">
        {activeView === 'main' && renderMainView()}
        {activeView === 'about' && renderInnerPage('About Station Ops', aboutContent, <FaFireExtinguisher />)}
        {activeView === 'terms' && renderInnerPage('Fire Service Terms', termsContent, <FaShieldAlt />)}
      </main>
    </div>
  );
}