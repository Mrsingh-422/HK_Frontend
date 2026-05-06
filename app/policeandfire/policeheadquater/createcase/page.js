'use client'
import React, { useState, useRef } from 'react'
import { 
    FaRegFileAlt, FaMapMarkerAlt, FaShieldAlt, 
    FaUser, FaPhone, FaTrash, FaPlus, 
    FaInfoCircle, FaFileUpload, FaCheckCircle,
    FaExclamationTriangle, FaClock, FaCloudUploadAlt
} from 'react-icons/fa'

export default function AddPoliceCase() {
    // 1. Form State
    const [formData, setFormData] = useState({
        victimName: '',
        victimPhone: '',
        address: '',
        incidentType: 'Theft',
        severity: 'Medium',
        description: '',
    });

    // 2. Attachments State (Starting empty as requested)
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);

    // 3. Handlers
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const newAttachments = files.map(file => ({
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            type: file.type.split('/')[1].toUpperCase() || 'FILE',
            rawFile: file // Keeping reference if needed for API
        }));
        
        setAttachments(prev => [...prev, ...newAttachments]);
        // Reset input so same file can be uploaded again if deleted
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const payload = { ...formData, evidence: attachments };
        console.log("Submitting Case to Command Center:", payload);
        alert("Case Broadcasted Successfully!");
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] selection:bg-[#08B36A]/30">
            <div className="max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 p-6">
                
                {/* HEADER AREA */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-2 w-2 rounded-full bg-[#08B36A] animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Live • encrypted connection</p>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                            Register <span className="text-[#08B36A]">Police Case</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="bg-[#08B36A] h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#08B36A]/20">
                            <FaShieldAlt size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Status</p>
                            <p className="text-xs font-bold text-slate-700 uppercase">Fresh Assignment</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT & CENTER: MAIN DETAILS */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* 1. COMPLAINANT / VICTIM DETAILS */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
                                        <FaUser className="text-[#08B36A]" size={14} />
                                    </div>
                                    <h2 className="font-black text-slate-800 text-xs uppercase tracking-[0.15em]">Victim Information</h2>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">Step 01</span>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputField 
                                    label="Victim Full Name" 
                                    placeholder="Enter legal name" 
                                    icon={<FaUser/>} 
                                    value={formData.victimName}
                                    onChange={(v) => handleInputChange('victimName', v)}
                                />
                                <InputField 
                                    label="Contact Number" 
                                    placeholder="+91 00000-00000" 
                                    icon={<FaPhone/>} 
                                    value={formData.victimPhone}
                                    onChange={(v) => handleInputChange('victimPhone', v)}
                                />
                                <div className="md:col-span-2">
                                    <InputField 
                                        label="Incident Address" 
                                        placeholder="Specific street, block, or landmark..." 
                                        icon={<FaMapMarkerAlt/>} 
                                        value={formData.address}
                                        onChange={(v) => handleInputChange('address', v)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. INCIDENT OVERVIEW */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
                                        <FaRegFileAlt className="text-[#08B36A]" size={14} />
                                    </div>
                                    <h2 className="font-black text-slate-800 text-xs uppercase tracking-[0.15em]">Incident Overview</h2>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">Step 02</span>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Incident Category</label>
                                    <select 
                                        required
                                        className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-sm font-bold text-slate-700 outline-none focus:border-[#08B36A]/20 focus:bg-white focus:ring-4 focus:ring-[#08B36A]/5 transition-all appearance-none cursor-pointer"
                                        value={formData.incidentType}
                                        onChange={(e) => handleInputChange('incidentType', e.target.value)}
                                    >
                                        <option>Theft</option>
                                        <option>Assault</option>
                                        <option>Cyber Crime</option>
                                        <option>Road Accident</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Priority Severity</label>
                                    <div className="flex bg-slate-100/50 p-1.5 rounded-[1.25rem] gap-1 border border-slate-100">
                                        {['Low', 'Medium', 'High', 'Critical'].map(lvl => (
                                            <button 
                                                key={lvl}
                                                type="button"
                                                onClick={() => handleInputChange('severity', lvl)}
                                                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${
                                                    formData.severity === lvl 
                                                    ? 'bg-white text-[#08B36A] shadow-md shadow-[#000]/05 translate-y-[-1px]' 
                                                    : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                            >
                                                {lvl}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. DESCRIPTION */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
                                        <FaExclamationTriangle className="text-[#08B36A]" size={14} />
                                    </div>
                                    <h2 className="font-black text-slate-800 text-xs uppercase tracking-[0.15em]">Narrative Report</h2>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase">Step 03</span>
                            </div>
                            <div className="p-8">
                                <textarea 
                                    required
                                    rows="6"
                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[2rem] p-6 text-sm font-medium leading-relaxed text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#08B36A]/20 focus:bg-white focus:ring-4 focus:ring-[#08B36A]/5 transition-all resize-none"
                                    placeholder="Provide a comprehensive timeline of events..."
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR */}
                    <div className="space-y-8">
                        
                        {/* ATTACHMENTS SECTION */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                            <div className="px-7 py-6 border-b border-slate-50 flex items-center justify-between bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[#08B36A]/10 rounded-lg flex items-center justify-center text-[#08B36A]">
                                        <FaFileUpload size={14} />
                                    </div>
                                    <h3 className="font-black text-[11px] text-slate-800 uppercase tracking-widest">Evidence ({attachments.length})</h3>
                                </div>
                                
                                {/* Hidden File Input */}
                                <input 
                                    type="file" 
                                    multiple 
                                    className="hidden" 
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                />
                                
                                <button 
                                    type="button" 
                                    onClick={() => fileInputRef.current.click()}
                                    className="group flex items-center gap-1.5 text-[10px] font-black text-[#08B36A] uppercase hover:opacity-70 transition-opacity"
                                >
                                    <FaPlus size={10} /> Add Files
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-4 bg-slate-50/30 min-h-[200px] flex flex-col justify-center">
                                {attachments.length === 0 ? (
                                    <div className="text-center py-10">
                                        <FaCloudUploadAlt size={40} className="mx-auto text-slate-200 mb-4" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No evidence uploaded</p>
                                    </div>
                                ) : (
                                    attachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-slate-100 shadow-sm animate-in zoom-in-95 duration-300">
                                            <div className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-[#08B36A] border border-slate-100">
                                                <FaRegFileAlt size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black text-slate-700 truncate">{file.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">{file.size} • {file.type}</p>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => removeAttachment(idx)}
                                                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all"
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* SUBMIT CARD */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/40">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#08B36A] blur-[80px] opacity-20" />
                            <FaShieldAlt className="absolute -right-10 -bottom-10 text-white/5 rotate-12" size={240} />
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-6">
                                    <FaClock className="text-[#08B36A]" size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Assignment Preview</span>
                                </div>
                                
                                <h3 className="text-2xl font-black leading-tight mb-6">Dispatch to Command<br/><span className="text-[#08B36A]">Precinct Center</span></h3>
                                
                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[10px] font-black border border-white/10 text-[#08B36A]">#PS</div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Station</p>
                                            <p className="text-xs font-black text-white">Vaishali Nagar Precinct</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 px-2">
                                        <FaCheckCircle className="text-[#08B36A]" size={12} />
                                        <span className="text-[10px] font-bold text-slate-300 uppercase">Automatic backup enabled</span>
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full bg-[#08B36A] hover:bg-[#09c776] text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-[#08B36A]/30 transition-all active:scale-[0.97] flex items-center justify-center gap-3 group"
                                >
                                    Broadcast Case
                                    <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                        <FaPlus size={8} />
                                    </div>
                                </button>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    )
}

function InputField({ label, placeholder, icon, value, onChange }) {
    return (
        <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-[#08B36A] transition-colors">{label}</label>
            <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#08B36A] transition-all">
                    {React.cloneElement(icon, {size: 14})}
                </div>
                <input 
                    required
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-[1.25rem] pl-14 pr-6 py-4 text-sm font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:bg-white focus:border-[#08B36A]/20 focus:ring-4 focus:ring-[#08B36A]/5 transition-all"
                />
            </div>
        </div>
    )
}