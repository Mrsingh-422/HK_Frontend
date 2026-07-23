'use client'
import React, { useState, useEffect } from 'react'
import { FaTimes, FaFilePdf, FaUser, FaDownload, FaEye } from 'react-icons/fa'
import BrandedReportPreview from './BrandedReportPreview'

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';

export default function ReportViewModal({ order, onClose }) {
  const [activeReportUrl, setActiveReportUrl] = useState('')
  const [activePatientId, setActivePatientId] = useState('')
  const [previewMode, setPreviewMode] = useState('smart') // 'smart' (HTML Live) or 'raw' (PDF Iframe)

  useEffect(() => {
    if (order) {
      const reports = order.patientReports || [];
      if (reports.length > 0) {
        setActivePatientId(reports[0].patientId);
        setActiveReportUrl(reports[0].reportFile);
      } else {
        setActivePatientId('Self');
        setActiveReportUrl(order.reportFile || '');
      }
    }
  }, [order]);

  // Helper to ensure relative path uploads resolve properly to backend port
  const getFullReportUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\//, '');
    const baseUrl = BASE_URL.replace(/\/$/, '');
    return `${baseUrl}/${cleanPath}`;
  };

  const handlePatientChange = (patient) => {
    setActivePatientId(patient.patientId);
    setActiveReportUrl(patient.reportFile);
  };

  if (!order) return null;

  const hasMultipleReports = order.patientReports?.length > 1;

  // Attempt to load standard testResults structure if present inside response payload
  const defaultTestValues = order.testResults || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header bar */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <FaFilePdf size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Review Diagnostic Report</h2>
              <p className="text-[11px] text-gray-500 font-mono">Booking ID: {order.bookingId}</p>
            </div>
          </div>

          {/* Toggle Switcher */}
          <div className="flex bg-gray-200 p-1 rounded-xl border border-gray-300">
            <button
              onClick={() => setPreviewMode('smart')}
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                previewMode === 'smart' ? 'bg-[#1e3a8a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <FaEye /> Smart View 3.0
            </button>
            <button
              onClick={() => setPreviewMode('raw')}
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                previewMode === 'raw' ? 'bg-[#1e3a8a] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <FaFilePdf /> RAW PDF preview
            </button>
          </div>

          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0">
            <FaTimes size={16} />
          </button>
        </div>

        {/* Multi-patient Selector Tab Bar */}
        {hasMultipleReports && (
          <div className="bg-slate-100 px-6 py-2 border-b border-gray-200 flex items-center gap-2 overflow-x-auto flex-shrink-0">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mr-2">Select Report:</span>
            {order.patientReports.map((pat) => {
              const isActive = activePatientId === pat.patientId;
              return (
                <button
                  key={pat.patientId}
                  onClick={() => handlePatientChange(pat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive ? 'bg-[#1e3a8a] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <FaUser size={10} className={isActive ? 'text-[#08B36A]' : 'text-gray-400'} />
                  <span>{pat.patientName}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Frame Display */}
        <div className="flex-1 bg-slate-50 overflow-hidden relative p-4 flex flex-col">
          {previewMode === 'smart' ? (
            <BrandedReportPreview 
              order={order} 
              patientId={activePatientId} 
              testResultsData={defaultTestValues}
            />
          ) : (
            <div className="w-full h-full">
              {activeReportUrl ? (
                <iframe 
                  src={`${getFullReportUrl(activeReportUrl)}#toolbar=0`} 
                  className="w-full h-full rounded-xl border border-gray-200 bg-white shadow-sm"
                  title="Raw Document File Preview"
                />
              ) : (
                <div className="text-center p-8 bg-white rounded-2xl border border-gray-200 max-w-sm shadow-xs space-y-4 mx-auto my-12">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                    <FaFilePdf size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Preview Not Available</h4>
                    <p className="text-xs text-gray-500 mt-1">PDF document URL was not found for this completed booking.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center flex-shrink-0">
          <p className="text-[11px] text-gray-400 font-semibold font-sans">Branded diagnostic outputs compiled securely under HK LIMS.</p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 text-xs transition-colors">
              Close Preview
            </button>
            {activeReportUrl && (
              <a 
                href={getFullReportUrl(activeReportUrl)} 
                download 
                target="_blank" 
                rel="noreferrer"
                className="px-4 py-2 bg-[#08B36A] hover:bg-green-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <FaDownload size={11} /> Download PDF
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}