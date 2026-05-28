'use client'
import React, { useState } from 'react'
import { 
  FaEye, 
  FaUpload, 
  FaTimes, 
  FaUser, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaFileMedical,
  FaCheckCircle,
  FaCloudUploadAlt
} from 'react-icons/fa'

export default function UploadReportPage() {
  
  // State for Modals
  const[selectedReport, setSelectedReport] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Dummy Data (Based on your images)
  const reportsList =[
    { 
      id: '140820241108065850', 
      name: 'Yash User', 
      phone: '9999999999', 
      address: 'Chandigarh, Sahibzada Ajit Singh Nagar, Ropar Division, Punjab', 
      status: 'Approved' 
    },
    { 
      id: '573520241212065043', 
      name: 'Yash User', 
      phone: '6239904039', 
      address: 'Pincode: 160071, House: 8B, Sector/Village: Ropar Division', 
      status: 'Approved' 
    },
    { 
      id: '110420241213040747', 
      name: 'Yash User', 
      phone: '6239904039', 
      address: 'Pincode: 160071, House: 8B, Sector/Village: Ropar Division', 
      status: 'Approved' 
    },
    { 
      id: '788520241231062228', 
      name: 'Aarush Singh', 
      phone: '7597272101', 
      address: 'Sector 62, Mohali, Punjab', 
      status: 'Approved' 
    },
  ];

  // Handlers for Info Modal
  const handleOpenInfo = (report) => {
    setSelectedReport(report);
    setIsInfoModalOpen(true);
  };

  const handleCloseInfo = () => {
    setIsInfoModalOpen(false);
    setSelectedReport(null);
  };

  // Handlers for Upload Modal
  const handleOpenUpload = (report) => {
    setSelectedReport(report);
    setIsUploadModalOpen(true);
  };

  const handleCloseUpload = () => {
    setIsUploadModalOpen(false);
    setSelectedReport(null);
  };

  return (
    <div className="w-full relative">
      
      {/* ========================================= */}
      {/* HEADER SECTION                            */}
      {/* ========================================= */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a8a] flex items-center gap-2">
            <FaFileMedical className="text-[#08B36A]"/> Upload Reports
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage and upload patient test reports securely.</p>
        </div>
      </div>

      {/* ========================================= */}
      {/* TABLE SECTION                             */}
      {/* ========================================= */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Report ID</th>
                <th className="px-6 py-4 font-semibold">Patient Info</th>
                <th className="px-6 py-4 font-semibold">Address / Details</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportsList.map((report) => (
                <tr 
                  key={report.id} 
                  onClick={() => handleOpenInfo(report)} // Row pe click karne se info khulega
                  className="hover:bg-green-50/50 transition-colors duration-200 cursor-pointer group"
                >
                  
                  {/* Report ID */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-gray-800">{report.id}</span>
                  </td>

                  {/* Patient Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 flex items-center gap-2">
                        <FaUser className="text-gray-400 text-xs"/> {report.name}
                      </span>
                      <span className="text-sm font-bold text-[#08B36A] mt-1 flex items-center gap-2">
                        <FaPhoneAlt className="text-gray-400 text-xs"/> {report.phone}
                      </span>
                    </div>
                  </td>

                  {/* Address */}
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2 text-sm text-gray-600 max-w-xs">
                      <FaMapMarkerAlt className="text-gray-400 mt-1 flex-shrink-0" />
                      <span className="line-clamp-2" title={report.address}>{report.address}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                      <FaCheckCircle /> {report.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      
                      {/* VIEW BUTTON */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenInfo(report); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg transition-colors border border-blue-100"
                      >
                        <FaEye size={14} /> View
                      </button>

                      {/* UPLOAD BUTTON */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenUpload(report); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#08B36A] hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                      >
                        <FaUpload size={12} /> Upload
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* ========================================= */}
      {/* 🌟 1. PATIENT INFO MODAL 🌟               */}
      {/* ========================================= */}
      {isInfoModalOpen && selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={handleCloseInfo}></div>

          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-[#1e3a8a] flex items-center gap-2">
                <FaFileMedical className="text-[#08B36A]"/> Report Information
              </h2>
              <button onClick={handleCloseInfo} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <FaTimes size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center mb-6">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Report / Order ID</p>
                <p className="text-xl font-black text-[#1e3a8a] tracking-wider">{selectedReport.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Patient Name</p>
                  <p className="font-bold text-gray-800">{selectedReport.name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Phone Number</p>
                  <p className="font-bold text-[#08B36A]">{selectedReport.phone}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Complete Address Details</p>
                <p className="font-medium text-gray-700 leading-relaxed">{selectedReport.address}</p>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={handleCloseInfo} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                Close
              </button>
              <button 
                onClick={() => { handleCloseInfo(); handleOpenUpload(selectedReport); }} 
                className="px-6 py-2.5 bg-[#08B36A] text-white font-bold rounded-xl shadow-md hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <FaUpload /> Upload Report Now
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ========================================= */}
      {/* 🌟 2. UPLOAD REPORT MODAL 🌟              */}
      {/* ========================================= */}
      {isUploadModalOpen && selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={handleCloseUpload}></div>

          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#08B36A] flex items-center gap-2">
                Upload Report
              </h2>
              <button onClick={handleCloseUpload} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <FaTimes size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* File Input Area (Modern Look) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Document</label>
                <div className="w-full relative border-2 border-dashed border-gray-300 hover:border-[#08B36A] bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-pointer group">
                  <FaCloudUploadAlt className="text-4xl text-gray-300 group-hover:text-[#08B36A] mb-2 transition-colors" />
                  <span className="text-sm font-bold text-gray-600 group-hover:text-[#08B36A]">Choose File to Upload</span>
                  <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</span>
                  {/* Invisible real file input over the box */}
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>

              {/* Readonly ID Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Report / Order ID</label>
                <input 
                  type="text" 
                  value={selectedReport.id} 
                  readOnly 
                  className="w-full px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 text-gray-700 font-bold focus:outline-none cursor-not-allowed"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 flex justify-between items-center bg-gray-50">
              <button onClick={handleCloseUpload} className="px-5 py-2 text-gray-500 font-bold hover:text-gray-800 transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => { alert('Report Uploaded!'); handleCloseUpload(); }}
                className="px-8 py-2.5 bg-[#08B36A] text-white font-bold rounded-xl shadow-md shadow-green-200 hover:bg-green-600 transition-transform hover:-translate-y-0.5"
              >
                UPLOAD
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}