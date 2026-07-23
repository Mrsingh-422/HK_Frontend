'use client'
import React from 'react'
import { 
  FaUser, FaCalendarAlt, FaShieldAlt, FaFlask, FaUserMd, FaCheckCircle, 
  FaThermometerHalf, FaBarcode, FaInfoCircle, FaCheckSquare
} from 'react-icons/fa'
import { useAuth } from '@/app/context/AuthContext'

export default function ReportDetailedAssaysPage({ 
  order = {}, 
  patientName = "Mrs Kriti Tiwari", 
  patientAge = "31", 
  patientGender = "Female", 
  tests = [], 
  evaluateRange 
}) {
  const { labVendor } = useAuth() || {};

  // Resolve dynamic Lab Name checking order first, then vendor profile fields
  const resolvedLabName = 
    order?.labId?.name || 
    order?.lab?.name ||
    order?.labId?.labName || 
    order?.lab?.labName ||
    order?.labName || 
    labVendor?.name || 
    labVendor?.labName || 
    "Healthians Labs";

  // Resolve dynamic NABL Number checking order first, then vendor profile fields
  const resolvedNablNumber = 
    order?.labId?.documents?.nablNumber || 
    order?.lab?.documents?.nablNumber ||
    order?.documents?.nablNumber || 
    order?.labId?.nablNumber || 
    order?.lab?.nablNumber ||
    order?.nablNumber ||
    labVendor?.documents?.nablNumber || 
    labVendor?.nablNumber || 
    "mc-6666";

  // Resolve pathologist signature path safely with structural fallbacks
  const signaturePath = 
    order?.labId?.signatureImage || 
    order?.lab?.signatureImage ||
    order?.signatureImage || 
    labVendor?.signatureImage || 
    null;

  // Format Pathologist Signature image URL safely
  const formatImagePath = (path) => {
    if (!path) return null;
    if (typeof path === 'string' && (path.startsWith('blob') || path.startsWith('http'))) return path;
    
    // Standardize Windows backslashes and strip the "public/" prefix
    const cleanPath = String(path)
      .replace(/\\/g, '/')
      .replace(/^public\//, '')
      .replace(/^\/+/, '');

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.healthkangaroo.com';
    return `${backendUrl.replace(/\/$/, '')}/${cleanPath}`;
  };

  const signatureUrl = formatImagePath(signaturePath);

  // Dynamic Metadata Resolving
  const bookingId = order?.bookingId ;
  const barcodeValue = order?.barcode ;
  
  const sampleCollectedOn = order?.appointmentDate 
    ? formatDate(order.appointmentDate) 
    : "31/Mar/2026";

  const sampleReceivedOn = order?.createdAt 
    ? formatTime(order.createdAt) 
    : "08:08AM";

  const reportGeneratedOn = order?.updatedAt 
    ? formatFullDate(order.updatedAt) 
    : "31/Mar/2026 12:54PM";

  const sampleTempDate = order?.appointmentDate 
    ? formatDate(order.appointmentDate) 
    : "31/Mar/2026";

  // Dynamically format address based on order's collection values
  const formatCollectionAddress = () => {
    return (
      order?.collectionAddress || 
      order?.address || 
      (order?.collectionType === 'Visit Lab' ? 'Walk-In (Visit Lab)' : 'Home Collection (Address N/A)')
    );
  };

  function formatDate(dateStr) {
    try {
      const date = new Date(dateStr);
      if (isNaN(date)) return "31/Mar/2026";
      const day = String(date.getDate()).padStart(2, '0');
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${day}/${months[date.getMonth()]}/${date.getFullYear()}`;
    } catch {
      return "31/Mar/2026";
    }
  }

  function formatTime(dateStr) {
    try {
      const date = new Date(dateStr);
      if (isNaN(date)) return "08:08AM";
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      return `${String(hours).padStart(2, '0')}:${minutes}${ampm}`;
    } catch {
      return "08:08AM";
    }
  }

  function formatFullDate(dateStr) {
    try {
      const date = new Date(dateStr);
      if (isNaN(date)) return "31/Mar/2026 12:54PM";
      return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
    } catch {
      return "31/Mar/2026 12:54PM";
    }
  }

  // Pre-filtered tests for dynamic parameters array compilation
  const slicedParameters = [];
  tests.forEach(test => {
    test.parameters?.forEach(p => {
      slicedParameters.push({
        testCategoryName: test.testName || 'Biochemistry Assays',
        ...p
      });
    });
  });

  // Array chunking helper function
  const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  // Chunk parameters dynamically into sets of 9 per strict A4 container page height bounds
  const parameterChunks = chunkArray(slicedParameters, 9);
  const safeChunks = parameterChunks.length > 0 ? parameterChunks : [[]];

  return (
    <>
      {safeChunks.map((visibleParams, chunkIndex) => (
        /* Strict A4 Page Dimensions (794px x 1123px) */
        <div 
          key={chunkIndex} 
          className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] mx-auto bg-white border border-gray-200 rounded-[2rem] shadow-xl overflow-hidden font-sans relative flex flex-col justify-between shrink-0 p-8 select-none mb-10"
        >
          
          {/* ========================================= */}
          {/* 🟢 TOP MULTI-METRIC HEADER                */}
          {/* ========================================= */}
          <div className="bg-[#00a859] px-6 py-3.5 rounded-2xl flex justify-between items-center text-white shrink-0 shadow-xs">
            {/* Left Side: Brand Logo */}
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain bg-white rounded-lg px-2 py-0.5" />
              <span className="text-xs font-black tracking-wider">Health Kangaroo</span>
            </div>
            
            {/* Metric Columns Row */}
            <div className="flex items-center gap-6 text-[8px] font-black uppercase tracking-wider opacity-90 border-l border-white/20 pl-6">
              <div className="flex items-center gap-1.5">
                <FaFlask className="text-emerald-200" />
                <span>22+ Labs India</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaCheckCircle className="text-emerald-200" />
                <span>100M+ Reports</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FaUserMd className="text-emerald-200" />
                <span>2000+ experts</span>
              </div>
            </div>
          </div>

          {/* ========================================= */}
          {/* 📋 PATIENT METADATA SPLIT-COLUMN CARD     */}
          {/* ========================================= */}
          <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 grid grid-cols-2 gap-x-6 gap-y-2 mt-4 text-[10px] font-bold text-slate-600 shrink-0">
            
            {/* Left Column */}
            <div className="space-y-1.5">
              <div className="flex justify-between border-b border-slate-100/50 pb-1">
                <span>Patient Name</span>
                <span className="text-slate-800 font-black">{patientName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100/50 pb-1">
                <span>Age / Sex</span>
                <span className="text-slate-800 font-black">{patientAge}Y / {patientGender}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100/50 pb-1">
                <span>Order ID</span>
                <span className="text-slate-800 font-black font-mono">{bookingId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100/50 pb-1">
                <span>Referred By</span>
                <span className="text-slate-800 font-black">Self</span>
              </div>
              <div className="flex justify-between border-b border-slate-100/50 pb-1">
                <span>Customer Since</span>
                <span className="text-slate-800 font-black">{sampleCollectedOn}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100/50 pb-1">
                <span>Sample Type</span>
                <span className="text-slate-800 font-black">Serum</span>
              </div>
              <div className="flex justify-between">
                <span>Collection Address</span>
                <span className="text-slate-800 font-black truncate max-w-[170px]" title={formatCollectionAddress()}>
                  {formatCollectionAddress()}
                </span>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-1.5 border-l border-slate-100 pl-6">
              <div className="flex justify-between items-center border-b border-slate-100/50 pb-1">
                <span>Barcode</span>
                <div className="flex flex-col items-end">
                  <span className="font-mono text-slate-800 font-black tracking-widest">{barcodeValue}</span>
                  {/* Virtual Barcode representation */}
                  <div className="h-3 w-16 bg-[repeating-linear-gradient(90deg,black,black_2px,transparent_2px,transparent_4px)] mt-0.5 opacity-80"></div>
                </div>
              </div>
              <div className="flex justify-between border-b border-slate-100/50 pb-1">
                <span>Sample Collected On</span>
                <span className="text-slate-800 font-black">{sampleCollectedOn}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100/50 pb-1">
                <span>Sample Received On</span>
                <span className="text-slate-800 font-black">{sampleReceivedOn}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100/50 pb-1">
                <span>Report Generated On</span>
                <span className="text-slate-800 font-black">{reportGeneratedOn}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100/50 pb-1">
                <span>Sample Temperature</span>
                <span className="text-slate-800 font-black flex items-center gap-1">
                  {sampleTempDate} <FaThermometerHalf className="text-[#00a859]" /> 03:14PM
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100/50 pb-1">
                <span>Collection Type</span>
                <span className="text-slate-800 font-black">{order?.collectionType || 'Home Collection'}</span>
              </div>
              <div className="flex justify-between">
                <span>Report Status</span>
                <span className="bg-emerald-50 text-emerald-700 font-black px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider border border-emerald-100">Maintained</span>
              </div>
            </div>

          </div>

          {/* ========================================= */}
          {/* 🔬 DEPARTMENT & SUB-CAPSULES SECTION       */}
          {/* ========================================= */}
          <div className="flex flex-col items-center justify-center mt-4 shrink-0">
            <div className="bg-[#00a859]/10 border border-[#00a859]/30 text-[#00a859] text-[9px] font-black px-5 py-1 rounded-full uppercase tracking-wider">
              Department of Biochemistry
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Final Report</span>
            <h3 className="text-xs font-black text-slate-800 tracking-tight flex items-center gap-3 mt-1 w-full justify-center">
              <span className="h-[1px] w-12 bg-slate-100"></span>
              One Plus One Healthy India 2026 Full Body Checkup Lite
              <span className="h-[1px] w-12 bg-slate-100"></span>
            </h3>
          </div>

          {/* ========================================= */}
          {/* 📊 DETAILED PARAMETERS ASSAYS TABLE        */}
          {/* ========================================= */}
          <div className="flex-grow py-3 flex flex-col justify-start">
            
            {/* Table Container */}
            <table className="w-full text-left border-collapse text-xs font-medium">
              
              <thead className="bg-[#007a3e] text-white text-[9px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2 rounded-l-xl">Test Name</th>
                  <th className="px-4 py-2 text-center">Value</th>
                  <th className="px-4 py-2 text-center">Unit</th>
                  <th className="px-4 py-2 text-center rounded-r-xl">Bio. Ref Interval</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100">
                {visibleParams.map((param, index) => {
                  const status = evaluateRange(param.value, param.minRef, param.maxRef);
                  const isNormal = status === 'normal';
                  return (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Parameter Details */}
                      <td className="px-4 py-2.5">
                        <p className="font-black text-slate-800 leading-none">{param.name}</p>
                        <span className="text-[8px] text-slate-400 font-bold uppercase block mt-1">
                          Method: {param.method || 'Diazonium Ion'} • Machine: {param.machine || 'Manual'}
                        </span>
                      </td>
                      
                      {/* Measured Value */}
                      <td className="px-4 py-2.5 text-center font-black">
                        <span className={`px-2 py-0.5 rounded ${
                          isNormal ? 'text-slate-800' : 'text-red-500 bg-red-50 font-black'
                        }`}>
                          {param.value}
                        </span>
                      </td>
                      
                      {/* Units */}
                      <td className="px-4 py-2.5 text-center font-bold text-slate-400">{param.unit || '-'}</td>
                      
                      {/* Bio reference interval */}
                      <td className="px-4 py-2.5 text-center font-bold text-slate-500">
                        {param.minRef && param.maxRef ? `${param.minRef} - ${param.maxRef}` : 'N/A'}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>

          </div>

          {/* ========================================= */}
          {/* ℹ️ EXPLANATORY MEDICAL BOX                 */}
          {/* ========================================= */}
          <div className="bg-[#f0faf5] rounded-xl p-3 border border-emerald-100/60 flex items-start gap-2 text-[9px] text-slate-500 leading-relaxed font-bold shrink-0 my-2">
            <div className="w-5 h-5 rounded-md bg-[#00a859] text-white flex items-center justify-center shrink-0">
              <FaInfoCircle size={10} />
            </div>
            <p>
              <span className="text-slate-800 font-black">Clinical Note:</span> Bilirubin is a yellowish pigment found in bile and is a breakdown product of normal heme catabolism. Elevated levels result from increased bilirubin production (e.g., hemolysis and ineffective erythropoiesis), decreased bilirubin excretion (e.g., obstruction and hepatitis), and abnormal bilirubin metabolism.
            </p>
          </div>

          {/* ========================================= */}
          {/* 🖋️ PATHOLOGIST VERIFICATION FOOTER         */}
          {/* ========================================= */}
          <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs font-medium shrink-0">
            
            {/* QR Scanner Validation */}
            <div className="flex items-center gap-3">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=verify-report-${bookingId}`} 
                alt="LIMS Signature" 
                className="w-12 h-12 p-0.5 bg-white border border-slate-200 rounded-lg shrink-0" 
              />
              <div className="text-[9px]">
                <p className="text-slate-400 font-bold uppercase leading-none">Scan to</p>
                <p className="font-black text-slate-800 mt-0.5">verify report</p>
              </div>
            </div>
            
            {/* Pathologist Details with Dynamic Signature (Center) */}
            <div className="text-center bg-slate-50 border border-slate-100 px-6 py-2 rounded-xl shrink-0 flex flex-col items-center justify-center min-w-[170px] min-h-[75px]">
              {signatureUrl ? (
                <img 
                  src={signatureUrl} 
                  alt="Pathologist Signature" 
                  className="h-10 max-w-[140px] object-contain mb-1 mix-blend-multiply" 
                  onError={(e) => {
                    // Force a retry replacing standard slash layouts if there's any file resolve latency
                    if (!e.currentTarget.dataset.retried) {
                      e.currentTarget.dataset.retried = 'true';
                      const altPath = String(signaturePath).replace(/\\/g, '/');
                      const cleanAlt = altPath.startsWith('public/') ? altPath : `public/${altPath}`;
                      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.healthkangaroo.com';
                      e.currentTarget.src = `${backendUrl.replace(/\/$/, '')}/${cleanAlt}`;
                    } else {
                      // Hide image smoothly if both file paths fail
                      e.currentTarget.style.display = 'none';
                    }
                  }}
                />
              ) : (
                <div className="h-8 flex items-center justify-center text-[9px] text-gray-300 italic">Signature Pending</div>
              )}
              <p className="font-black text-slate-800 text-xs mt-0.5">Dr. Verified Pathologist</p>
              <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Consultant Pathologist</p>
            </div>

            {/* NABL Gear/Seal Representation on Right */}
            <div className="flex items-center gap-2 border border-slate-150 px-3 py-1.5 rounded-xl bg-white shadow-xs">
              <div className="w-6 h-6 bg-slate-50 rounded-full flex items-center justify-center text-slate-500">
                <FaCheckSquare size={12} />
              </div>
              <div className="text-[8px]">
                <p className="font-black text-slate-700 leading-none uppercase">{resolvedNablNumber}</p>
                <p className="text-[7px] text-slate-400 font-bold uppercase mt-0.5">NABL APPROVED</p>
              </div>
            </div>

          </div>

          {/* Solid green brand footer strip */}
          <div className="bg-[#007a3e] px-6 py-2.5 rounded-xl flex justify-between items-center text-white text-[8px] font-black uppercase tracking-wider shrink-0 mt-3 border border-emerald-800">
            <span>{resolvedLabName} (A Unit of Expedient Healthcare Marketing Pvt. Ltd.)</span>
            <span>Page {3 + chunkIndex}</span>
          </div>

        </div>
      ))}
    </>
  )
}