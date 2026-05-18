'use client'
import React, { useState, useEffect } from 'react';
import { 
    FaSearch, FaMapMarkerAlt, FaBuilding, FaSpinner, 
    FaEdit, FaTimes, FaShieldAlt, FaChartPie, FaCheckCircle 
} from 'react-icons/fa';

import FireHeadAPI from '@/app/services/FireHeadAPI';

export default function JurisdictionRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Form Data State for Modal Editing (Mapped to new Schema keys)
    const [formData, setFormData] = useState({
        jurisdiction: { totalArea: '', population: '', activeZones: '', riskLevel: '' },
        primarySectors: [] 
    });

    // ==========================================
    // 🌟 FETCH REQUESTS (GET) 🌟
    // ==========================================
    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const res = await FireHeadAPI.getJurisdictionRequests();
            if (res.success && res.data) {
                setRequests(res.data);
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // ==========================================
    // 🌟 FILTER LOGIC 🌟
    // ==========================================
    const filteredRequests = requests.filter(req => 
        req.stationName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        req.stationCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- HELPER TO FORMAT DATE ---
    const formatDate = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // ==========================================
    // 🌟 OPEN MODAL HANDLER 🌟
    // ==========================================
    const openUpdateModal = (request, e) => {
        if (e) e.stopPropagation();
        setSelectedRequest(request);
        
        // Deep copy the incoming data and map to strict Schema keys (sector, desc, title)
        setFormData({
            jurisdiction: { ...request.jurisdiction },
            primarySectors: request.primarySectors.map(sec => ({ 
                // Using fallback logic just in case GET API sends old keys
                sector: sec.sector || sec.sectorName || '', 
                desc: sec.desc || sec.description || '', 
                title: sec.title || sec.iconType || 'Commercial'
            }))
        });
        
        setIsModalOpen(true);
    };

    // ==========================================
    // 🌟 SUBMIT UPDATE (PUT) 🌟
    // ==========================================
    const handleApproveUpdate = async () => {
        if (!selectedRequest) return;
        setIsUpdating(true);

        try {
            // Payload strictly matching Mongoose Schema requirements
            const payload = {
                jurisdiction: formData.jurisdiction,
                primarySectors: formData.primarySectors.map(sec => ({
                    sector: sec.sector,
                    desc: sec.desc,
                    title: sec.title // Enum: ['Commercial', 'Residential', 'Industrial']
                }))
            };

            const res = await FireHeadAPI.updateStationJurisdiction(selectedRequest._id, payload);
            
            if (res.success) {
                alert("Jurisdiction Updated & Request Cleared Successfully!");
                setIsModalOpen(false);
                fetchRequests(); // Refresh the list
            } else {
                alert(res.message || "Failed to update jurisdiction.");
            }
        } catch (error) {
            console.error("Error updating jurisdiction:", error);
            alert("Something went wrong during the update process.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans animate-in fade-in duration-500">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                        Jurisdiction Updates 
                        {requests.length > 0 && (
                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                {requests.length} Pending
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 mt-1">Review and approve area coverage updates requested by Fire Stations.</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-8">
                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search by Station Name or Code..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-14 pr-4 shadow-sm outline-none focus:ring-2 focus:ring-[#08B36A] transition-all" 
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 text-[11px] font-black tracking-widest text-gray-400 uppercase">Requesting Station</th>
                                <th className="px-6 py-5 text-[11px] font-black tracking-widest text-gray-400 uppercase">Coverage Stats</th>
                                <th className="px-6 py-5 text-[11px] font-black tracking-widest text-gray-400 uppercase">Sector Summary</th>
                                <th className="px-6 py-5 text-[11px] font-black tracking-widest text-gray-400 uppercase text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="py-24 text-center">
                                        <FaSpinner className="animate-spin text-4xl text-[#08B36A] mx-auto mb-4" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Fetching Requests...</p>
                                    </td>
                                </tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-24 text-center">
                                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FaCheckCircle className="text-3xl text-[#08B36A]" />
                                        </div>
                                        <p className="font-bold text-gray-800 text-lg">All Caught Up!</p>
                                        <p className="text-sm text-gray-500 mt-1">There are no pending jurisdiction update requests.</p>
                                    </td>
                                </tr>
                            ) : filteredRequests.map((req) => (
                                <tr 
                                    key={req._id} 
                                    onClick={() => openUpdateModal(req)} 
                                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                                >
                                    {/* Station Info & Date */}
                                    <td className="px-6 py-5 align-top">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                                                <FaBuilding size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800 text-sm">{req.stationName}</span>
                                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Code: {req.stationCode}</span>
                                            </div>
                                        </div>
                                        <div className="text-[11px] text-gray-500 mt-3 flex items-center gap-1.5 font-medium">
                                            Request Date: {formatDate(req.requestDate)}
                                        </div>
                                    </td>

                                    {/* Coverage Stats */}
                                    <td className="px-6 py-5 align-top">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
                                                <FaChartPie className="text-[#08B36A]" /> {req.jurisdiction.totalArea}
                                            </span>
                                            <span className="text-xs font-medium text-gray-600 flex items-center gap-2">
                                                Pop: {req.jurisdiction.population}
                                            </span>
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider w-max ${req.jurisdiction.riskLevel === 'High' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                                Risk: {req.jurisdiction.riskLevel}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Sector Summary */}
                                    <td className="px-6 py-5 align-top">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                                                <FaShieldAlt className="text-blue-500 shrink-0" />
                                                {req.jurisdiction.activeZones} Active Zones
                                            </span>
                                            <span className="text-[11px] text-gray-500 mt-1 font-medium">
                                                {req.primarySectors.length} Sectors defined in request.
                                            </span>
                                        </div>
                                    </td>

                                    {/* Action Button */}
                                    <td className="px-6 py-5 align-middle text-right">
                                        <button 
                                            onClick={(e) => openUpdateModal(req, e)}
                                            className="bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-end gap-2 ml-auto"
                                        >
                                            <FaEdit size={14}/> Review & Approve
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ========================================== */}
            {/* 🌟 REVIEW & UPDATE MODAL 🌟                */}
            {/* ========================================== */}
            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="p-6 md:px-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-[#08B36A]" /> Update Station Jurisdiction
                                </h2>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Station: {selectedRequest.stationName}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 bg-white p-2 rounded-full shadow-sm"><FaTimes size={18}/></button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 md:p-8 overflow-y-auto space-y-8">
                            
                            {/* SECTION 1: Jurisdiction Stats */}
                            <div>
                                <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4">Coverage Statistics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Total Area</label>
                                        <input 
                                            type="text" 
                                            value={formData.jurisdiction.totalArea} 
                                            onChange={(e) => setFormData({...formData, jurisdiction: {...formData.jurisdiction, totalArea: e.target.value}})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[#08B36A]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Population</label>
                                        <input 
                                            type="text" 
                                            value={formData.jurisdiction.population} 
                                            onChange={(e) => setFormData({...formData, jurisdiction: {...formData.jurisdiction, population: e.target.value}})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[#08B36A]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Active Zones</label>
                                        <input 
                                            type="number" 
                                            value={formData.jurisdiction.activeZones} 
                                            onChange={(e) => setFormData({...formData, jurisdiction: {...formData.jurisdiction, activeZones: e.target.value}})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[#08B36A]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Risk Level</label>
                                        <select 
                                            value={formData.jurisdiction.riskLevel} 
                                            onChange={(e) => setFormData({...formData, jurisdiction: {...formData.jurisdiction, riskLevel: e.target.value}})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[#08B36A]"
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Moderate">Moderate</option>
                                            <option value="Moderate-High">Moderate-High</option>
                                            <option value="High">High</option>
                                            <option value="Severe">Severe</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* SECTION 2: Primary Sectors list */}
                            <div>
                                <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4">Primary Operating Sectors</h3>
                                <div className="space-y-4">
                                    {formData.primarySectors.map((sectorItem, index) => (
                                        <div key={index} className="bg-white border border-gray-200 rounded-[1.5rem] p-5 shadow-sm relative">
                                            <span className="absolute -top-3 -left-3 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-xs border-2 border-white">{index + 1}</span>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pl-2">
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Sector Name</label>
                                                    <input 
                                                        type="text" 
                                                        value={sectorItem.sector}
                                                        onChange={(e) => {
                                                            const updated = [...formData.primarySectors];
                                                            updated[index].sector = e.target.value;
                                                            setFormData({...formData, primarySectors: updated});
                                                        }}
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-[#08B36A]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Title (Category)</label>
                                                    <select 
                                                        value={sectorItem.title}
                                                        onChange={(e) => {
                                                            const updated = [...formData.primarySectors];
                                                            updated[index].title = e.target.value;
                                                            setFormData({...formData, primarySectors: updated});
                                                        }}
                                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-[#08B36A]"
                                                    >
                                                        {/* Must exactly match Mongoose Enum: ['Commercial', 'Residential', 'Industrial'] */}
                                                        <option value="Residential">Residential</option>
                                                        <option value="Commercial">Commercial</option>
                                                        <option value="Industrial">Industrial</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="pl-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Description / Info</label>
                                                <input 
                                                    type="text" 
                                                    value={sectorItem.desc}
                                                    onChange={(e) => {
                                                        const updated = [...formData.primarySectors];
                                                        updated[index].desc = e.target.value;
                                                        setFormData({...formData, primarySectors: updated});
                                                    }}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 outline-none focus:border-[#08B36A]"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {formData.primarySectors.length === 0 && (
                                        <p className="text-sm text-gray-400 italic">No sectors provided in this request.</p>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 md:px-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4 rounded-b-[2.5rem]">
                            <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-gray-400 hover:text-gray-600 transition-colors">
                                Cancel
                            </button>
                            <button 
                                onClick={handleApproveUpdate}
                                disabled={isUpdating}
                                className="bg-[#08B36A] hover:bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl shadow-green-100 disabled:opacity-50 transition-all active:scale-95"
                            >
                                {isUpdating ? <FaSpinner className="animate-spin" /> : <FaCheckCircle size={16} />}
                                {isUpdating ? "Processing..." : "Approve & Update Station"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}