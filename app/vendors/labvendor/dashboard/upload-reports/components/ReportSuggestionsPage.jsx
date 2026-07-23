'use client'
import React from 'react'
import { FaInfoCircle } from 'react-icons/fa'

const KangarooLogo = () => (
  <svg viewBox="0 0 100 100" className="w-6 h-6 text-[#08B36A]" fill="currentColor">
    <circle cx="50" cy="50" r="46" fill="white" />
    <path d="M30 65 C35 55, 45 42, 55 42 C65 42, 68 50, 72 45 C75 42, 72 32, 68 28 C64 24, 58 22, 55 18 C53 15, 54 10, 52 8 C50 6, 45 8, 44 12 C43 16, 46 22, 44 26 C42 30, 35 34, 30 38 C25 42, 20 48, 18 55 C16 62, 22 66, 30 65 Z" fill="#08B36A" />
  </svg>
);

export default function ReportSuggestionsPage({ healthScore, recommendations }) {
  return (
    <div className="w-full max-w-[800px] h-[1130px] bg-white shadow-2xl relative flex flex-col justify-between p-10 overflow-hidden shrink-0 border border-gray-100 rounded-lg">
      
      {/* Header Block */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <KangarooLogo />
          <span className="font-extrabold text-xs text-gray-700">Health Kangaroo</span>
        </div>
        <span className="text-[9px] font-black uppercase text-[#08B36A] bg-green-50 px-2.5 py-1 rounded-md">Smart Report 3.0</span>
      </div>

      {/* Body content suggestions */}
      <div className="my-auto space-y-6">
        <div className="flex justify-between items-start gap-6">
          <div className="space-y-3">
            <span className="text-[10px] font-black text-[#08B36A] uppercase tracking-widest bg-green-50 px-2.5 py-1 rounded-md">New Features</span>
            <h2 className="text-2xl font-black text-[#1e3a8a]">Diagnostic Summary Report</h2>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Understanding laboratory reports can be complex, often leading to unwanted anxiety. At Healthians, we understand that you should not have to rely on a Google search to decipher your own health report. That's why we offer comprehensive summaries that are easy to understand.
            </p>
          </div>
          
          <div className="bg-[#08B36A] text-white p-5 rounded-2xl text-center w-36 flex-shrink-0 flex flex-col items-center justify-center shadow-sm">
            <span className="text-[9px] font-black uppercase tracking-wider opacity-85">Health Score</span>
            <span className="text-3xl font-black mt-1">{healthScore}</span>
            <span className="text-[8px] font-bold opacity-60">Percent Normal</span>
          </div>
        </div>

        {/* Suggestions dynamic layout */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <FaInfoCircle /> Suggestions for Your Health
          </h3>
          
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 bg-white border border-gray-150 shadow-xs rounded-2xl flex gap-4 text-xs font-medium">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#08B36A] border border-[#08B36A]/20 flex items-center justify-center font-black flex-shrink-0">
                  {rec.id}
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-[#08B36A]">{rec.title}</h4>
                  <p className="text-gray-500 leading-relaxed font-normal">{rec.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 pt-4 text-center text-[10px] font-bold text-gray-400 flex-shrink-0">
        Your health is our priority. Stay consistent with regular checkups and a healthy lifestyle.
      </div>
    </div>
  )
}