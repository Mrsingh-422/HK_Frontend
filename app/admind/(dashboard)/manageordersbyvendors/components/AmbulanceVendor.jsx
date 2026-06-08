"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaAmbulance, FaEye, FaPhone, FaEnvelope, FaIdCard } from 'react-icons/fa';
import AdminAPI from '@/app/services/AdminAPI';

function AmbulanceVendor() {
  const router = useRouter();

  // Core Data States
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Server-driven Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10); 

  // Base URL for vehicle/profile assets
  const IMAGE_BASE_URL = "http://192.168.1.26:5002";

  useEffect(() => {
    const fetchAmbulanceFleet = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await AdminAPI.getAmbulancesInAdmin(currentPage, limit);
        
        if (response && response.success) {
          setAmbulances(response.data || []);
          setTotalPages(response.totalPages || 1);
          setCurrentPage(response.currentPage || 1);
        } else {
          setError("Failed to fetch verified transport logs from the vendor database.");
        }
      } catch (err) {
        console.error("Error connecting to admin ambulance endpoints:", err);
        setError("An unexpected connection error occurred. Could not load layout context.");
      } finally {
        setLoading(false);
      }
    };

    fetchAmbulanceFleet();
  }, [currentPage, limit]);

  // Navigate to the dynamic ambulance bookings tracking sub-route
  const handleViewOrders = (ambulanceId) => {
    router.push(`/admind/manageordersbyvendors/viewambulanceorders/${ambulanceId}`);
  };

  // Badge utility stylings based on medical response category strings
  const getVehicleTypeStyles = (type) => {
    switch (type?.toLowerCase()) {
      case 'icu ambulance':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      case 'mini van':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'van':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200/60';
    }
  };

  // Helper function to safely parse custom vehicle profile image paths
  const getProfileImageUrl = (profileImagePath) => {
    if (!profileImagePath) return null;
    const cleanPath = profileImagePath.replace(/^\/?public\//, '');
    return `${IMAGE_BASE_URL}/${cleanPath}`;
  };

  return (
    <div className="bg-[#FAFBFD] min-h-screen text-slate-600 antialiased p-4 md:p-8">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Approved Ambulance Fleet</h1>
          <p className="text-sm text-slate-500 mt-1">Manage, audit, and track emergency dispatch requests across transit operators</p>
        </div>
        {ambulances.length > 0 && (
          <div className="text-blue-700 bg-blue-50 border border-blue-200/60 px-4 py-2 rounded-xl text-xs font-bold shadow-sm tracking-wide flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            Active Dispatch Units: {ambulances.length}
          </div>
        )}
      </div>

      {/* Main Table Block Container */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] border border-slate-200/60 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 mb-4 border-blue-500"></div>
            <p className="text-slate-400 text-xs font-semibold tracking-wide">Polling approved supply lines...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24 text-rose-500 font-semibold p-4 text-sm bg-rose-50/30">
            {error}
          </div>
        ) : ambulances.length === 0 ? (
          <div className="text-center py-24 text-slate-400 text-sm font-medium">
            No approved emergency channels discovered inside this ledger grid context.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold tracking-wider uppercase">
                  <th className="p-4 pl-6 w-20">Display</th>
                  <th className="p-4">Operator/Vehicle Name</th>
                  <th className="p-4">Registration Code</th>
                  <th className="p-4">Email Contact</th>
                  <th className="p-4">Phone Line</th>
                  <th className="p-4 text-center">Vehicle Class</th>
                  <th className="p-4 text-center pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {ambulances.map((unit) => {
                  // Checks for fallback availability across potential image parameter variations
                  const imageUrl = getProfileImageUrl(unit.profileImage || unit.vehicleImage);
                  
                  return (
                    <tr key={unit._id} className="hover:bg-slate-50/60 transition-colors group">
                      
                      {/* Avatar Dynamic Thumbnail Frame */}
                      <td className="p-4 pl-6 relative">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={unit.name} 
                            className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-inner"
                            onError={(e) => { 
                              e.currentTarget.onerror = null; 
                              e.currentTarget.style.display = 'none';
                              const fallbackDiv = e.currentTarget.nextSibling;
                              if (fallbackDiv) fallbackDiv.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        
                        {/* Custom Medical Monogram Fallback Frame */}
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-sm shadow-blue-200 bg-blue-500"
                          style={{ display: imageUrl ? 'none' : 'flex' }}
                        >
                          <FaAmbulance className="text-xs" />
                        </div>
                      </td>

                      {/* Name Identifiers */}
                      <td className="p-4 font-bold text-slate-900 group-hover:text-blue-600 transition-colors capitalize">
                        {unit.name}
                      </td>

                      {/* Registration Code Numbers */}
                      <td className="p-4">
                        {unit.vehicleNumber ? (
                          <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs font-bold uppercase border border-slate-200/50">
                            {unit.vehicleNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Pending Logs</span>
                        )}
                      </td>

                      {/* Contact Metrics columns */}
                      <td className="p-4 text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <FaEnvelope className="text-slate-400 text-[10px]" />
                          <span>{unit.email}</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-500 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <FaPhone className="text-slate-400 text-[10px]" />
                          <span>{unit.phone || 'N/A'}</span>
                        </div>
                      </td>
                      
                      {/* Operational Specialty Badge Class */}
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 inline-flex text-[10px] font-extrabold tracking-wide rounded-full border uppercase ${getVehicleTypeStyles(unit.vehicleType)}`}>
                          {unit.vehicleType || 'Standard'}
                        </span>
                      </td>

                      {/* View Action Click Trigger Button */}
                      <td className="p-4 text-center pr-6">
                        <button
                          onClick={() => handleViewOrders(unit._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-900 hover:text-white transition-all duration-200 active:scale-95 shadow-sm"
                        >
                          <FaEye className="text-xs" />
                          <span>View Orders</span>
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Standard Pagination Control Interface footer layout */}
            <div className="flex items-center justify-between p-4 px-6 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-500">
                Showing page <strong className="text-slate-900 font-bold">{currentPage}</strong> of <strong className="text-slate-900 font-bold">{totalPages}</strong>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                    currentPage === 1 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200/60' 
                      : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-sm active:scale-95'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-xs font-bold rounded-xl text-white transition-all shadow-sm active:scale-95 ${
                    currentPage === totalPages 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default AmbulanceVendor;