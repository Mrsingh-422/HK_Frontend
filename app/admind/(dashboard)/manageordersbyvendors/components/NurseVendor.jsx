"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaEye } from 'react-icons/fa';
import AdminAPI from '@/app/services/AdminAPI';

function NurseVendor() {
  const router = useRouter();

  // State Management
  const [nurses, setNurses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10); // Synchronized default page size with LabVendor layout

  // Base URL for nurse images
  const IMAGE_BASE_URL = "http://192.168.1.26:5002";

  // Fetch data on component mount and page change
  useEffect(() => {
    const fetchNurseProviders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await AdminAPI.getNurseProvidersInAdmin(currentPage, limit);
        
        if (response && response.success) {
          setNurses(response.data || []);
          setTotalPages(response.totalPages || 1);
        } else {
          setError("Failed to fetch verified nurse providers.");
        }
      } catch (err) {
        console.error("Error retrieving nurse provider logs:", err);
        setError("An error occurred while loading the nurse vendor records.");
      } finally {
        setLoading(false);
      }
    };

    fetchNurseProviders();
  }, [currentPage, limit]);

  // Route directly to the matching vendor order view route path
  const handleViewOrders = (id) => {
    router.push(`/admind/manageordersbyvendors/viewnurseorders/${id}`);
  };

  // Pagination Handlers
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // Helper function to safely map and build image URL
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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Approved Nurse Providers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage, verify, and track orders across active nursing channels</p>
        </div>
        <div className="text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-4 py-2 rounded-xl text-xs font-bold shadow-sm tracking-wide flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Total Active Nurses: {nurses.length}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] border border-slate-200/60 overflow-hidden">
        {loading ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 mb-4 border-emerald-500"></div>
            <p className="text-slate-400 text-xs font-semibold tracking-wide">Loading approved networks...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-24 text-rose-500 font-semibold p-4 text-sm bg-rose-50/30">
            {error}
          </div>
        ) : nurses.length === 0 ? (
          /* Empty State */
          <div className="text-center py-24 text-slate-400 text-sm font-medium">
            No approved medical nurse practitioners registered yet.
          </div>
        ) : (
          /* Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold tracking-wider uppercase">
                  <th className="p-4 pl-6">Profile</th>
                  <th className="p-4">Nurse Name</th>
                  <th className="p-4">Email Contact</th>
                  <th className="p-4">Phone Line</th>
                  <th className="p-4">Speciality</th>
                  <th className="p-4 text-center">Verification</th>
                  <th className="p-4 text-center pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {nurses.map((nurse) => {
                  const imageUrl = getProfileImageUrl(nurse.profileImage);

                  return (
                    <tr key={nurse._id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Profile Image Column */}
                      <td className="p-4 pl-6 relative w-16">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={nurse.name} 
                            className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-inner"
                            onError={(e) => { 
                              e.currentTarget.onerror = null; 
                              e.currentTarget.style.display = 'none';
                              const fallbackDiv = e.currentTarget.nextSibling;
                              if (fallbackDiv) fallbackDiv.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        
                        {/* Avatar Fallback Layout */}
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-sm shadow-emerald-200"
                          style={{ 
                            backgroundColor: '#08b36a', 
                            display: imageUrl ? 'none' : 'flex' 
                          }}
                        >
                          {nurse.name ? nurse.name.charAt(0).toUpperCase() : 'N'}
                        </div>
                      </td>

                      {/* Details Row Elements */}
                      <td className="p-4 font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                        {nurse.name}
                      </td>
                      <td className="p-4 text-slate-500 font-medium">{nurse.email}</td>
                      <td className="p-4 text-slate-500 font-mono text-xs">{nurse.phone}</td>
                      <td className="p-4 text-slate-500 font-medium">{nurse.speciality || 'General Nursing'}</td>
                      
                      {/* Status Badge */}
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 inline-flex text-[11px] font-extrabold tracking-wide rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50 uppercase">
                          {nurse.profileStatus || 'Approved'}
                        </span>
                      </td>

                      {/* Action Interface Container */}
                      <td className="p-4 text-center pr-6">
                        <button
                          onClick={() => handleViewOrders(nurse._id)}
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

            {/* Pagination Controls */}
            <div className="flex items-center justify-between p-4 px-6 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-500">
                Showing page <strong className="text-slate-900 font-bold">{currentPage}</strong> of <strong className="text-slate-900 font-bold">{totalPages}</strong>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
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
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-xs font-bold rounded-xl text-white transition-all shadow-sm active:scale-95 ${
                    currentPage === totalPages 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'hover:bg-[rgb(6,138,82)]'
                  }`}
                  style={{ 
                    backgroundColor: currentPage === totalPages ? undefined : '#08b36a' 
                  }}
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

export default NurseVendor;