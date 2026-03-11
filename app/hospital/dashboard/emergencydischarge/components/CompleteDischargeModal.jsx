'use client'
import React, { useState, useRef } from 'react'
import { 
  FaTimes, FaCloudUploadAlt, FaReceipt, FaDollarSign, 
  FaCheckCircle, FaFileImage, FaTrashAlt, FaHospitalUser 
} from 'react-icons/fa'

const CompleteDischargeModal = ({ patient, onClose, onConfirm }) => {
  const [totalPrice, setTotalPrice] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  if (!patient) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!totalPrice || !selectedFile) {
      alert("Please enter the total price and upload a receipt.");
      return;
    }
    
    // Passing data back to parent
    onConfirm({
      patientId: patient.id,
      amount: totalPrice,
      receipt: selectedFile
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <form onSubmit={handleSubmit} className="p-10 md:p-12">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Finalize Billing</h2>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Discharging: {patient.name}</p>
            </div>
            <button 
              type="button"
              onClick={onClose} 
              className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="space-y-8">
            
            {/* 1. Total Price Input */}
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-3 block">Total Treatment Cost</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-[#08B36A]">
                    <FaDollarSign />
                </div>
                <input 
                  type="number" 
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-20 pr-6 py-6 bg-slate-50 border-2 border-transparent focus:border-[#08B36A] focus:bg-white rounded-3xl outline-none transition-all text-2xl font-black text-slate-800"
                  required
                />
              </div>
            </div>

            {/* 2. Photo/Receipt Upload */}
            <div>
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-3 block">Upload Receipt / Clearance Photo</label>
              
              {!previewUrl ? (
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="border-4 border-dashed border-slate-100 hover:border-green-100 hover:bg-green-50/30 rounded-[2.5rem] p-10 transition-all cursor-pointer group text-center"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden" 
                    accept="image/*,.pdf"
                  />
                  <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <FaCloudUploadAlt className="text-slate-300 group-hover:text-[#08B36A] text-2xl" />
                  </div>
                  <p className="text-slate-500 font-bold text-sm">Drag photo here or <span className="text-[#08B36A]">browse</span></p>
                  <p className="text-[10px] text-slate-300 font-bold uppercase mt-1">Supports JPG, PNG, PDF (Max 5MB)</p>
                </div>
              ) : (
                <div className="relative rounded-[2.5rem] overflow-hidden border-2 border-slate-100 group">
                  <img src={previewUrl} alt="Receipt Preview" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      type="button"
                      onClick={handleRemoveFile}
                      className="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-2xl flex items-center gap-3">
                    <FaFileImage className="text-[#08B36A]" />
                    <span className="text-xs font-bold text-slate-700 truncate">{selectedFile.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Information Alert */}
            <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3">
                <FaReceipt className="text-blue-500 mt-0.5" />
                <p className="text-[11px] font-bold text-blue-700 leading-relaxed">
                    Finalizing this will mark the patient as "Discharged" and archive their emergency record. Please ensure the receipt matches the total price entered above.
                </p>
            </div>

            {/* Confirm Button */}
            <button 
              type="submit"
              className="w-full bg-[#08B36A] hover:bg-[#069e5d] text-white py-6 rounded-[2rem] font-black text-lg shadow-xl shadow-green-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              <FaCheckCircle /> CONFIRM DISCHARGE
            </button>

          </div>
        </form>
      </div>
    </div>
  )
}

export default CompleteDischargeModal