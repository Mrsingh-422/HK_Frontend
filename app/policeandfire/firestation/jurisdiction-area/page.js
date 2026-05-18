'use client';
import React, { useEffect, useRef, useState } from 'react';
// Leaflet CSS zaruri hai map ko sahi se dikhane ke liye
import 'leaflet/dist/leaflet.css';
import FireStationAPI from '@/app/services/FireStationAPI';
import { FaSpinner } from 'react-icons/fa';

// Helper function: Dynamic Icons based on array index (A=Red, B=Yellow, C=Orange)
const getSectorIcon = (index) => {
    if (index === 0) return (
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    );
    if (index === 1) return (
        <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    );
    return (
        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );
};

export default function JurisdictionArea() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // States for API Data Integration
  const [jurisdictionData, setJurisdictionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Button loading ke liye state
  const [isRequesting, setIsRequesting] = useState(false);

  // Fetch API Data automatically when component loads
  useEffect(() => {
    const fetchJurisdiction = async () => {
      try {
        setIsLoading(true);
        const res = await FireStationAPI.getJurisdiction();
        if (res.success) {
          setJurisdictionData(res.data);
        }
      } catch (error) {
        console.error("Error fetching jurisdiction data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJurisdiction();
  }, []);

  // 🌟 UPDATE BOUNDARY BUTTON HANDLER 🌟
  const handleRequestBoundaryUpdate = async () => {
      // LocalStorage se safely ID nikali ja rahi hai
      let targetId = null;
      if (typeof window !== 'undefined') {
          const localData = JSON.parse(localStorage.getItem('firestationData') || '{}');
          targetId = localData._id || localData.id;
      }

      // Agar ID nahi mili toh block kar do
      if (!targetId) {
          alert("Station ID not found! Please logout and login again.");
          return;
      }

      setIsRequesting(true);
      try {
          const res = await FireStationAPI.requestJurisdictionUpdate(targetId);
          if (res.success) {
              alert(res.message || "Boundary update request sent successfully!");
          } else {
              alert(res.message || "Failed to send request.");
          }
      } catch (error) {
          console.error("Error sending update request:", error);
          alert("Server error while requesting update.");
      } finally {
          setIsRequesting(false);
      }
  };

  // DYNAMIC MAP INITIALIZATION (Depends on API Data)
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || !jurisdictionData?.location) return;

    import('leaflet').then((L) => {
      const lat = jurisdictionData.location.lat;
      const lng = jurisdictionData.location.lng;
      const centerPosition = [lat, lng];
      const stationName = jurisdictionData.stationName || 'Fire Station';

      if (!mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView(centerPosition, 13);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const fireIcon = L.divIcon({
          className: 'custom-fire-icon',
          html: `<div style="background-color: #ef4444; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.5); border: 3px solid white;">
                  <svg style="width: 20px; height: 20px; color: white;" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0013 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd" />
                  </svg>
                </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -15],
        });

        L.marker(centerPosition, { icon: fireIcon })
          .addTo(map)
          .bindPopup(`<b style="color: #374151;">${stationName}</b><br/><span style="color: #6b7280;">Active Zone</span>`)
          .openPopup();

        const offset = 0.015; 
        const dynamicBoundary = [
          [lat + offset, lng - offset],
          [lat + offset + 0.005, lng + offset + 0.005],
          [lat - offset, lng + offset],
          [lat - offset - 0.005, lng - offset - 0.005],
        ];

        L.polygon(dynamicBoundary, {
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.2,
          weight: 2,
        }).addTo(map);

      } else {
        mapInstanceRef.current.setView(centerPosition, 13);
      }
    });

  }, [jurisdictionData]);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans">
      
      {/* Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm mb-6 border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {jurisdictionData?.stationName ? `${jurisdictionData.stationName} - Jurisdiction` : 'Jurisdiction Area'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage and view station coverage boundaries</p>
        </div>
        
        {/* REQUEST UPDATE BUTTON */}
        <button 
            onClick={handleRequestBoundaryUpdate}
            disabled={isRequesting || !jurisdictionData}
            className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isRequesting ? (
                <><FaSpinner className="animate-spin" /> Requesting...</>
            ) : (
                <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Request Boundary Update
                </>
            )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Map Container */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex-grow flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xs font-bold text-gray-500 tracking-widest uppercase">Coverage Map</h2>
            </div>
            
            {isLoading && (
              <div className="absolute inset-0 top-14 m-5 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center border-2 border-dashed border-gray-200 z-10">
                 <span className="text-gray-400 font-medium">Locating Station on Map...</span>
              </div>
            )}

            <div ref={mapRef} className="relative w-full h-[500px] rounded-xl border border-gray-200 z-0 bg-[#e2e8f0]" style={{ minHeight: '400px' }} />
          </div>
        </div>

        {/* Right Column: Stats & Information */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-5">Coverage Summary</h2>
            
            {isLoading ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
            ) : jurisdictionData?.coverageSummary ? (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500 text-sm font-medium">Total Area</span>
                    <span className="text-sm font-bold text-gray-800">{jurisdictionData.coverageSummary.totalArea}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500 text-sm font-medium">Population</span>
                    <span className="text-sm font-bold text-gray-800">{jurisdictionData.coverageSummary.population}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500 text-sm font-medium">Active Zone</span>
                    <span className="text-sm font-bold text-gray-800">{jurisdictionData.coverageSummary.activeZone} Main Zones</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500 text-sm font-medium">Risk Level</span>
                    <span className="text-sm font-bold text-red-500">{jurisdictionData.coverageSummary.riskLevel}</span>
                  </div>
                </div>
            ) : (
                <p className="text-sm text-gray-500">No data available.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-grow">
            <h2 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-5">Primary Sectors</h2>
            
            {isLoading ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-gray-100 rounded-xl w-full"></div>
                    <div className="h-20 bg-gray-100 rounded-xl w-full"></div>
                    <div className="h-20 bg-gray-100 rounded-xl w-full"></div>
                </div>
            ) : jurisdictionData?.primarySectors ? (
                <div className="flex flex-col gap-4">
                  {jurisdictionData.primarySectors.map((sector, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-100 transition-colors cursor-default">
                      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                        {getSectorIcon(index)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm">{sector.sector}: {sector.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{sector.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
            ) : (
                 <p className="text-sm text-gray-500">No sectors assigned.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}