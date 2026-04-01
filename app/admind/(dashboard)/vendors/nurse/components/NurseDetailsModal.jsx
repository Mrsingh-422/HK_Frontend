"use client";

import React, { useState } from "react";
import { 
  X, Phone, Mail, MapPin, CheckCircle, 
  XCircle, Clock, Eye, AlertCircle, Loader2, 
  FileText, ShieldCheck, Briefcase, GraduationCap 
} from "lucide-react";

export default function NurseDetailsModal({ 
  isOpen, 
  onClose, 
  vendor, 
  onApprove, 
  onReject 
}) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !vendor) return null;

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  const getImgUrl = (path) => {
    if (!path) return null;
    const cleanPath = path.replace(/\\/g, '/').replace(/^public\//, '');
    return `${baseUrl}/${cleanPath}`;
  };

  const handleApproveAction = async () => {
    setIsSubmitting(true);
    await onApprove(vendor._id);
    setIsSubmitting(false);
  };

  const handleRejectAction = async () => {
    if (!rejectionReason.trim()) return alert("Please provide a reason for rejection");
    setIsSubmitting(true);
    await onReject(vendor._id, rejectionReason);
    setIsSubmitting(false);
    setShowRejectInput(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 relative flex flex-col">
        
        {/* REJECTION REASON OVERLAY */}
        {showRejectInput && (
          <div className="absolute inset-0 z-50 bg-white/95 flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Rejection Reason</h3>
            <p className="text-sm text-slate-500 mb-6 text-center max-w-xs">
              Explain why this nurse application is being rejected.
            </p>
            <textarea 
              className="w-full max-w-md h-32 p-4 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-400 transition-all text-sm"
              placeholder="e.g. Expired license, Invalid certificates..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-4 mt-8 w-full max-w-md">
              <button 
                onClick={() => setShowRejectInput(false)} 
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleRejectAction} 
                disabled={isSubmitting}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Confirm Reject"}
              </button>
            </div>
          </div>
        )}

        {/* MODAL HEADER */}
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Application Review</h3>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
        </div>

        {/* MODAL CONTENT */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* PROFILE SECTION */}
          <div className="flex items-center gap-6 mb-10">
            <div className="relative">
              <img 
                src={vendor.profileImage ? getImgUrl(vendor.profileImage) : `https://ui-avatars.com/api/?name=${vendor.name}&background=6366f1&color=fff`} 
                className="w-24 h-24 rounded-3xl object-cover shadow-xl border-4 border-white" 
                alt="Profile"
              />
              <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-full border-2 border-white shadow-md ${vendor.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                {vendor.isActive ? <CheckCircle size={12} className="text-white" /> : <Clock size={12} className="text-white" />}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{vendor.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                  <ShieldCheck size={12} /> {vendor.role}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  vendor.profileStatus === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 
                  vendor.profileStatus === 'Rejected' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {vendor.profileStatus}
                </span>
              </div>
            </div>
          </div>

          {/* INFORMATION GRID */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] uppercase font-black text-slate-400 mb-2 tracking-widest">Contact Info</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><Phone size={14} className="text-indigo-500"/> {vendor.phone}</div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><Mail size={14} className="text-indigo-500"/> {vendor.email}</div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] uppercase font-black text-slate-400 mb-2 tracking-widest">Professional Info</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><Briefcase size={14} className="text-indigo-500"/> {vendor.experienceYears} Years Exp.</div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><MapPin size={14} className="text-indigo-500"/> {vendor.city || 'N/A'}, {vendor.state}</div>
              </div>
            </div>
          </div>

          {/* DOCUMENTS SECTION */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-l-2 border-indigo-500 pl-2">Submitted Verification Documents</h4>
            
            <div className="grid grid-cols-1 gap-6">
              {Object.entries(vendor.documents || {}).map(([key, docList]) => {
                if (!Array.isArray(docList) || docList.length === 0) return null;
                
                return (
                  <div key={key} className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {docList.map((doc, i) => (
                        <div key={i} className="group relative aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                          <img 
                            src={getImgUrl(doc)} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            alt={key}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <button 
                              onClick={() => window.open(getImgUrl(doc), '_blank')} 
                              className="bg-white p-2 rounded-lg text-slate-800 shadow-xl"
                            >
                              <Eye size={16}/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* REJECTION REASON DISPLAY */}
          {vendor.profileStatus === "Rejected" && (
            <div className="mt-8 p-5 bg-rose-50 border-2 border-rose-100 rounded-2xl flex gap-4 items-start">
              <XCircle className="text-rose-500 shrink-0 mt-1" size={20} />
              <div>
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Rejection Reason</p>
                <p className="text-sm font-bold text-rose-700 italic">"{vendor.rejectionReason || "No details provided"}"</p>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-8 bg-slate-50 border-t flex justify-end gap-3">
          {vendor.profileStatus !== 'Approved' && vendor.profileStatus !== 'Rejected' ? (
            <>
              <button 
                onClick={() => setShowRejectInput(true)} 
                className="px-8 py-3 bg-white border border-red-200 text-red-500 rounded-2xl font-black uppercase text-xs hover:bg-red-50 transition-all"
              >
                Reject Application
              </button>
              <button 
                onClick={handleApproveAction} 
                disabled={isSubmitting}
                className="px-10 py-3 bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={14}/> : <CheckCircle size={14}/>}
                Approve & Verify
              </button>
            </>
          ) : (
            <div className={`flex items-center gap-3 font-black text-[11px] uppercase tracking-wider px-6 py-2 rounded-xl border ${
              vendor.profileStatus === 'Approved' ? 'text-emerald-600 border-emerald-100 bg-emerald-50' : 'text-rose-600 border-rose-100 bg-rose-50'
            }`}>
              {vendor.profileStatus === 'Approved' ? <CheckCircle size={16}/> : <XCircle size={16}/>}
              Account {vendor.profileStatus}
            </div>
          )}
          <button 
            onClick={onClose} 
            className="px-8 py-3 bg-slate-800 text-white rounded-2xl font-black uppercase text-xs hover:bg-slate-900 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}