'use client'
import React, { useState, useEffect } from 'react'
import { FaTimes, FaBuilding, FaUserShield, FaExclamationTriangle } from 'react-icons/fa'
import PoliceAPI from '@/app/services/PoliceAPI';

export default function DeployStationModal({ isOpen, onClose, selectedCase, refreshData }) {
    const [stations, setStations] = useState([]);
    const [selectedStationId, setSelectedStationId] = useState('');
    const [severityLevel, setSeverityLevel] = useState('Level 1');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchAllStations();
            if (selectedCase) setSeverityLevel(selectedCase.severityLevel || 'Level 1');
        }
    }, [isOpen, selectedCase]);

    const fetchAllStations = async () => {
        try {
            const response = await PoliceAPI.getAllPoliceStations();
            if (response.success) {
                setStations(response.data);
            }
        } catch (error) {
            console.error("Error fetching stations:", error);
        }
    };

    const handleAssign = async () => {
        if (!selectedStationId) return alert("Please select a Police Station");
        
        setLoading(true);
        try {
            const response = await PoliceAPI.assignCaseToPoliceStataion(selectedCase._id, {
                stationId: selectedStationId,
                severityLevel: severityLevel
            });

            if (response.success) {
                alert("Case deployed successfully");
                refreshData();
                onClose();
            }
        } catch (error) {
            console.error("Assignment failed:", error);
            alert("Failed to assign case");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#08B36A] text-white rounded-xl shadow-lg shadow-green-100">
                            <FaUserShield size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Deploy to Station</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Case: {selectedCase?.caseNo}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                            Select Target Police Station
                        </label>
                        <select 
                            value={selectedStationId}
                            onChange={(e) => setSelectedStationId(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#08B36A]/20 transition-all appearance-none"
                        >
                            <option value="">Choose a Station...</option>
                            {stations.map(station => (
                                <option key={station._id} value={station._id}>
                                    {station.stationName} — SHO {station.shoName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                            Update Severity Level
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Level 1', 'Level 2', 'Level 3'].map((lvl) => (
                                <button
                                    key={lvl}
                                    onClick={() => setSeverityLevel(lvl)}
                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        severityLevel === lvl 
                                        ? 'bg-slate-800 text-white shadow-lg' 
                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                    }`}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-start gap-3">
                        <FaExclamationTriangle className="text-orange-500 mt-0.5" />
                        <p className="text-[10px] font-bold text-orange-700 leading-relaxed uppercase">
                            Warning: Deployment will instantly notify the station and change case status to 'Pending Dispatch'.
                        </p>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all">
                        Cancel
                    </button>
                    <button 
                        onClick={handleAssign}
                        disabled={loading}
                        className="flex-1 bg-[#08B36A] text-white py-4 rounded-2xl text-[11px] font-black shadow-xl shadow-green-100 uppercase tracking-widest hover:bg-[#07a25f] transition-all disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Confirm Deployment'}
                    </button>
                </div>
            </div>
        </div>
    )
}