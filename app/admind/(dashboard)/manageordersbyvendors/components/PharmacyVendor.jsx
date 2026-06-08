"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaEye } from 'react-icons/fa';
import AdminAPI from '@/app/services/AdminAPI';

function PharmacyVendor() {
  const router = useRouter();

  // State management
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10); // Number of items per page

  // Base URL for pharmacy images
  const IMAGE_BASE_URL = "http://192.168.1.26:5002";

  // Fetch data on component mount and page change
  useEffect(() => {
    const fetchPharmacies = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await AdminAPI.getAllPharmaciesInAdmin(currentPage, limit);
        
        if (response && response.success) {
          setPharmacies(response.data || []);
          setTotalPages(response.totalPages || 1);
        } else {
          setError("Failed to fetch approved pharmacies.");
        }
      } catch (err) {
        console.error("Error fetching pharmacies:", err);
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, [currentPage, limit]);

  // Navigate to the dynamic pharmacy orders viewer page
  const handleViewOrders = (pharmacyId) => {
    router.push(`/admind/manageordersbyvendors/viewpharmacyorders/${pharmacyId}`);
  };

  // Pagination Handlers
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  // Helper function to safely parse custom profile image URLs
  const getProfileImageUrl = (profileImagePath) => {
    if (!profileImagePath) return null;
    const cleanPath = profileImagePath.replace(/^\/?public\//, '');
    return `${IMAGE_BASE_URL}/${cleanPath}`;
  };

  return (
    <div className="bg-[#FAFBFD] min-h-screen text-slate-600 antialiased">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Approved Pharmacy Vendors</h1>
          <p className="text-sm text-slate-500 mt-1">Manage, audit, and track orders across your premium pharmacy supply networks</p>
        </div>
        <div className="text-blue-700 bg-blue-50 border border-blue-200/60 px-4 py-2 rounded-xl text-xs font-bold shadow-sm tracking-wide flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          Active Pharmacies: {pharmacies.length}
        </div>
      </div>

      {/* Main Table Block */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] border border-slate-200/60 overflow-hidden">
        {loading ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 mb-4 border-blue-500"></div>
            <p className="text-slate-400 text-xs font-semibold tracking-wide">Polling approved supply lines...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-24 text-rose-500 font-semibold p-4 text-sm bg-rose-50/30">
            {error}
          </div>
        ) : pharmacies.length === 0 ? (
          /* Empty State */
          <div className="text-center py-24 text-slate-400 text-sm font-medium">
            No approved pharmacy channels discovered.
          </div>
        ) : (
          /* Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold tracking-wider uppercase">
                  <th className="p-4 pl-6">Profile</th>
                  <th className="p-4">Pharmacy Name</th>
                  <th className="p-4">Email Contact</th>
                  <th className="p-4">Phone Line</th>
                  <th className="p-4">City Hub</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {pharmacies.map((pharmacy) => {
                  const imageUrl = getProfileImageUrl(pharmacy.profileImage);
                  
                  return (
                    <tr key={pharmacy._id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Avatar Render */}
                      <td className="p-4 pl-6 relative w-16">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={pharmacy.name} 
                            className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-inner"
                            onError={(e) => { 
                              e.currentTarget.onerror = null; 
                              e.currentTarget.style.display = 'none';
                              const fallbackDiv = e.currentTarget.nextSibling;
                              if (fallbackDiv) fallbackDiv.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        
                        {/* Custom Monogram Initial Fallback (Blue themed for pharmacy aspect) */}
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-sm shadow-blue-200 bg-blue-500"
                          style={{ display: imageUrl ? 'none' : 'flex' }}
                        >
                          {pharmacy.name ? pharmacy.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                      </td>

                      {/* Content Column Items */}
                      <td className="p-4 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {pharmacy.name}
                      </td>
                      <td className="p-4 text-slate-500 font-medium">{pharmacy.email}</td>
                      <td className="p-4 text-slate-500 font-mono text-xs">{pharmacy.phone}</td>
                      <td className="p-4 text-slate-500 font-medium">{pharmacy.city || 'N/A'}</td>
                      
                      {/* Static or Dynamic Verification Badge */}
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 inline-flex text-[11px] font-extrabold tracking-wide rounded-full bg-blue-50 text-blue-700 border border-blue-200/40 uppercase">
                          {pharmacy.profileStatus || 'Approved'}
                        </span>
                      </td>

                      {/* View Action Click Trigger */}
                      <td className="p-4 text-center pr-6">
                        <button
                          onClick={() => handleViewOrders(pharmacy._id)}
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

            {/* Premium Pagination Toolbar */}
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

export default PharmacyVendor;