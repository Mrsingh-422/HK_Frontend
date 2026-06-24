'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
    FaUserInjured, FaMapMarkerAlt, FaShieldAlt, FaCarCrash, 
    FaFileAlt, FaBalanceScale, FaClock, FaCheckCircle, 
    FaMapMarkedAlt, FaSave, FaTimes
} from 'react-icons/fa'
import PoliceAPI from '@/app/services/PoliceAPI' // 👈 Apna path check kar lijiye

export default function CreateCasePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // 1. Basic Info
        incidentType: 'Other',
        severity: 'Medium',
        incidentDateTime: '',
        
        // 2. People Involved
        victimName: '',
        victimPhone: '',
        complainantName: '',
        accusedName: '',
        
        // 3. Location & Description
        address: '',
        lat: '',
        lng: '',
        description: '',
        
        // 4. Legal & Impact
        ipcSections: '', // Will be converted to array
        arrestStatus: 'Not Arrested',
        bailStatus: 'N/A',
        propertyDamageValue: '',
        injuries: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Auto-fetch location (Mock logic)
    const handleGetLocation = () => {
        setFormData({ ...formData, lat: '30.7398', lng: '76.7827' });
        alert("Location fetched via GPS!");
    };

    // Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Transform data to match Backend Schema
            const payload = {
                victimName: formData.victimName,
                victimPhone: formData.victimPhone,
                complainantName: formData.complainantName || null,
                accusedName: formData.accusedName || null,
                ipcSections: formData.ipcSections.split(',').map(s => s.trim()).filter(Boolean),
                incidentType: formData.incidentType,
                severity: formData.severity,
                description: formData.description,
                address: formData.address,
                location: {
                    lat: parseFloat(formData.lat) || 0,
                    lng: parseFloat(formData.lng) || 0
                },
                incidentDateTime: formData.incidentDateTime ? new Date(formData.incidentDateTime).toISOString() : null,
                legalProgress: {
                    arrestStatus: formData.arrestStatus,
                    bailStatus: formData.bailStatus
                },
                damageImpact: {
                    propertyDamageValue: Number(formData.propertyDamageValue) || 0,
                    injuries: Number(formData.injuries) || 0
                }
            };

            const response = await PoliceAPI.createStationCase(payload);
            
            if (response.success) {
                alert("Case Created Successfully!");
                router.push('/policeandfire/policestation/freshcase'); // Redirect to cases list
            }
        } catch (error) {
            console.error("Error creating case:", error);
            alert("Failed to create case. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-10">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Register New Case</h1>
                    <p className="text-slate-500 font-medium mt-1">File a new First Information Report (FIR) or Complaint</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => router.back()}
                        className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all"
                    >
                        <FaTimes /> Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-[#08B36A] text-white px-8 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-100 hover:bg-[#07a25f] transition-all disabled:opacity-70"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FaSave />}
                        {loading ? 'Saving...' : 'Register Case'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN (Wider) */}
                <div className="xl:col-span-2 space-y-6">
                    
                    {/* SECTION 1: PEOPLE INVOLVED */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><FaUserInjured /></div>
                            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Persons Involved</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Victim Name *" name="victimName" value={formData.victimName} onChange={handleChange} required placeholder="Enter primary victim name" />
                            <InputField label="Victim Phone *" name="victimPhone" value={formData.victimPhone} onChange={handleChange} required placeholder="Enter contact number" type="tel" />
                            <InputField label="Complainant Name" name="complainantName" value={formData.complainantName} onChange={handleChange} placeholder="If different from victim" />
                            <InputField label="Accused / Suspect Name" name="accusedName" value={formData.accusedName} onChange={handleChange} placeholder="Known suspect or 'Unknown'" />
                        </div>
                    </div>

                    {/* SECTION 2: INCIDENT DETAILS & LOCATION */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                            <div className="p-2 bg-red-50 text-red-500 rounded-lg"><FaMapMarkedAlt /></div>
                            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Incident Details & Location</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <InputField label="Full Address / Landmark *" name="address" value={formData.address} onChange={handleChange} required placeholder="E.g., Sector 17 Market, Near Fountain" />
                            </div>
                            
                            {/* MAP COORDINATES */}
                            <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row gap-4 items-end">
                                <div className="flex-1 w-full"><InputField label="Latitude" name="lat" value={formData.lat} onChange={handleChange} placeholder="E.g., 30.7398" type="number" step="any" /></div>
                                <div className="flex-1 w-full"><InputField label="Longitude" name="lng" value={formData.lng} onChange={handleChange} placeholder="E.g., 76.7827" type="number" step="any" /></div>
                                <button type="button" onClick={handleGetLocation} className="w-full sm:w-auto px-4 py-3 bg-slate-800 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-700 transition flex items-center justify-center gap-2">
                                    <FaMapMarkerAlt/> Fetch GPS
                                </button>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Incident Description</label>
                                <textarea 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleChange} 
                                    rows="4" 
                                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-bold text-slate-700 outline-none focus:border-[#08B36A] focus:ring-4 focus:ring-[#08B36A]/10 transition-all resize-none"
                                    placeholder="Briefly describe what happened..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (Narrower) */}
                <div className="space-y-6">
                    
                    {/* SECTION 3: CLASSIFICATION */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                            <div className="p-2 bg-emerald-50 text-[#08B36A] rounded-lg"><FaFileAlt /></div>
                            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Classification</h2>
                        </div>
                        <div className="space-y-5">
                            <SelectField label="Incident Type" name="incidentType" value={formData.incidentType} onChange={handleChange} options={['Theft', 'Assault', 'Robbery', 'Road Accident', 'Murder', 'Kidnapping', 'Drug Related', 'Cyber Crime', 'Domestic Violence', 'Other']} />
                            <SelectField label="Severity Level" name="severity" value={formData.severity} onChange={handleChange} options={['Low', 'Medium', 'High', 'Critical']} />
                            <InputField label="Date & Time of Incident" name="incidentDateTime" value={formData.incidentDateTime} onChange={handleChange} type="datetime-local" />
                        </div>
                    </div>

                    {/* SECTION 4: LEGAL & DAMAGES */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                            <div className="p-2 bg-amber-50 text-amber-500 rounded-lg"><FaBalanceScale /></div>
                            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Legal & Impact</h2>
                        </div>
                        <div className="space-y-5">
                            <InputField label="IPC Sections (Comma Separated)" name="ipcSections" value={formData.ipcSections} onChange={handleChange} placeholder="E.g., 420, 379, 302" />
                            <div className="grid grid-cols-2 gap-4">
                                <SelectField label="Arrest Status" name="arrestStatus" value={formData.arrestStatus} onChange={handleChange} options={['Not Arrested', 'Arrested', 'Fled']} />
                                <SelectField label="Bail Status" name="bailStatus" value={formData.bailStatus} onChange={handleChange} options={['Pending', 'Approved', 'Denied', 'N/A']} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Injuries Count" name="injuries" value={formData.injuries} onChange={handleChange} type="number" placeholder="0" />
                                <InputField label="Property Damage (₹)" name="propertyDamageValue" value={formData.propertyDamageValue} onChange={handleChange} type="number" placeholder="0" />
                            </div>
                        </div>
                    </div>

                </div>
            </form>
        </div>
    )
}

// --- HELPER UI COMPONENTS ---

function InputField({ label, name, value, onChange, type = "text", placeholder, required = false, step }) {
    return (
        <div className="w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                {label}
            </label>
            <input 
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                step={step}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-bold text-slate-700 outline-none focus:border-[#08B36A] focus:ring-4 focus:ring-[#08B36A]/10 transition-all"
            />
        </div>
    )
}

function SelectField({ label, name, value, onChange, options }) {
    return (
        <div className="w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                {label}
            </label>
            <select 
                name={name}
                value={value}
                onChange={onChange}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-bold text-slate-700 outline-none focus:border-[#08B36A] focus:ring-4 focus:ring-[#08B36A]/10 transition-all appearance-none cursor-pointer"
            >
                {options.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    )
}