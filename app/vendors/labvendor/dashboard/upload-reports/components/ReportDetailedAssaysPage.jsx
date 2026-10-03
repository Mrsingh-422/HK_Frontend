'use client'
import React from 'react'
import { 
  FaUser, FaCalendarAlt, FaShieldAlt, FaFlask, FaUserMd, FaCheckCircle, 
  FaThermometerHalf, FaBarcode, FaInfoCircle, FaCheckSquare, FaVial, FaLayerGroup
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

  // Resolve dynamic Lab Name
  const resolvedLabName = 
    order?.labId?.name || 
    order?.lab?.name ||
    order?.labId?.labName || 
    order?.lab?.labName ||
    order?.labName || 
    labVendor?.name || 
    labVendor?.labName || 
    "Health Kangaroo Labs";

  // Resolve dynamic NABL Number
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

  // Pathologist signature path
  const signaturePath = 
    order?.labId?.signatureImage || 
    order?.lab?.signatureImage ||
    order?.signatureImage || 
    labVendor?.signatureImage || 
    null;

  const formatImagePath = (path) => {
    if (!path) return null;
    if (typeof path === 'string' && (path.startsWith('blob') || path.startsWith('http'))) return path;
    
    const cleanPath = String(path)
      .replace(/\\/g, '/')
      .replace(/^public\//, '')
      .replace(/^\/+/, '');

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.healthkangaroo.com';
    return `${backendUrl.replace(/\/$/, '')}/${cleanPath}`;
  };

  const signatureUrl = formatImagePath(signaturePath);

  // Dynamic Metadata
  const bookingId = order?.bookingId || "N/A";
  const barcodeValue = order?.barcode || order?.bookingId || "N/A";
  
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

  const formatCollectionAddress = () => {
    if (order?.collectionType === 'Visit Lab') return 'Walk-In (Visit Lab)';
    if (typeof order?.collectionAddress === 'string' && order.collectionAddress.trim()) return order.collectionAddress;
    if (typeof order?.addressString === 'string' && order.addressString.trim()) return order.addressString;
    if (typeof order?.formattedAddress === 'string' && order.formattedAddress.trim()) return order.formattedAddress;
    if (typeof order?.address === 'string' && order.address.trim()) return order.address;

    if (typeof order?.address === 'object' && order?.address !== null) {
      const parts = [
        order.address.houseNo,
        order.address.sector ? `Sector ${order.address.sector}` : '',
        order.address.city,
        order.address.state,
        order.address.pincode
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : 'Home Collection';
    }

    return 'Home Collection';
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
      hours = hours ? hours : 12;
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

  // Compile individual test parameters preserving group metadata
  const slicedParameters = [];
  tests.forEach(test => {
    const mainCategory = test.mainCategory || 'Biochemistry';
    const department = test.department || `Department of ${mainCategory}`;
    const category = test.category || 'General Health';
    const sampleType = test.sampleType || 'Serum / Blood';

    test.parameters?.forEach((p, paramIdx) => {
      slicedParameters.push({
        testName: test.testName || 'Diagnostic Assay',
        mainCategory: mainCategory,
        department: department,
        category: category,
        sampleType: sampleType,
        interpretation: test.interpretation || '',
        isFirstInTestGroup: paramIdx === 0, // Used to trigger the Test Name section header
        ...p
      });
    });
  });

  const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  // Chunk parameters into sets of 8 for strict A4 visual fit
  const parameterChunks = chunkArray(slicedParameters, 8);
  const safeChunks = parameterChunks.length > 0 ? parameterChunks : [[]];
  const safeAddressText = formatCollectionAddress();

  const safeEvaluateRange = typeof evaluateRange === 'function' ? evaluateRange : (val, min, max) => {
    if (!val || isNaN(val)) return 'normal';
    const num = parseFloat(val);
    const minN = parseFloat(min);
    const maxN = parseFloat(max);
    if (!isNaN(minN) && num < minN) return 'low';
    if (!isNaN(maxN) && num > maxN) return 'high';
    return 'normal';
  };

  return (
    <>
      {safeChunks.map((visibleParams, chunkIndex) => {
        const currentDepartmentBadge = visibleParams[0]?.department || 
          (visibleParams[0]?.mainCategory ? `Department of ${visibleParams[0].mainCategory}` : "Department of Biochemistry");

        const primarySampleType = visibleParams[0]?.sampleType || "Serum / Blood";

        return (
          /* Strict A4 Page Dimensions (794px x 1123px) */
          <div 
            key={chunkIndex} 
            className="w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] mx-auto bg-white border border-gray-200 rounded-[2rem] shadow-xl overflow-hidden font-sans relative flex flex-col justify-between shrink-0 p-8 select-none mb-10"
          >
            
            {/* Top Multi-Metric Header */}
            <div className="bg-[#00a859] px-6 py-3.5 rounded-2xl flex justify-between items-center text-white shrink-0 shadow-xs">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain bg-white rounded-lg px-2 py-0.5" />
                <span className="text-xs font-black tracking-wider">Health Kangaroo</span>
              </div>
              
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

            {/* Patient Metadata Split-Column Card */}
            <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 grid grid-cols-2 gap-x-6 gap-y-2 mt-3 text-[10px] font-bold text-slate-600 shrink-0">
              
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
                  <span className="text-slate-800 font-black">{primarySampleType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Collection Address</span>
                  <span className="text-slate-800 font-black truncate max-w-[170px]" title={safeAddressText}>
                    {safeAddressText}
                  </span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-1.5 border-l border-slate-100 pl-6">
                <div className="flex justify-between items-center border-b border-slate-100/50 pb-1">
                  <span>Barcode</span>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-slate-800 font-black tracking-widest">{barcodeValue}</span>
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

            {/* Department Badge */}
            <div className="flex flex-col items-center justify-center my-2 shrink-0">
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-black px-5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                {currentDepartmentBadge}
              </div>
            </div>

            {/* Parameters Table With Explicit Test Name Dividers */}
            <div className="flex-grow py-1 flex flex-col justify-start">
              <table className="w-full text-left border-collapse text-xs font-medium">
                <thead className="bg-[#007a3e] text-white text-[9px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2 rounded-l-xl">Test Parameter</th>
                    <th className="px-4 py-2 text-center">Value</th>
                    <th className="px-4 py-2 text-center">Unit</th>
                    <th className="px-4 py-2 text-center rounded-r-xl">Bio. Ref Interval</th>
                  </tr>
                </thead>
                
                <tbody className="divide-y divide-slate-100">
                  {visibleParams.map((param, index) => {
                    const status = safeEvaluateRange(param.value, param.minRef, param.maxRef);
                    const isNormal = status === 'normal';
                    
                    // Show a Test Section Heading if this is the first param of a test or test changed
                    const isNewTestGroup = index === 0 || visibleParams[index - 1]?.testName !== param.testName;

                    return (
                      <React.Fragment key={index}>
                        {/* Prominent Test Name Divider Row */}
                        {isNewTestGroup && (
                          <tr className="bg-slate-100/80 border-y border-slate-200">
                            <td colSpan={4} className="px-4 py-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FaVial className="text-[#00a859] text-xs" />
                                  <span className="font-black text-slate-800 text-xs uppercase tracking-wide">
                                    {param.testName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {param.category && (
                                    <span className="text-[9px] bg-white text-slate-600 font-bold px-2 py-0.5 rounded border border-slate-200 uppercase">
                                      Category: {param.category}
                                    </span>
                                  )}
                                  {param.sampleType && (
                                    <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200 uppercase">
                                      Sample: {param.sampleType}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}

                        {/* Parameter Row */}
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2">
                            <p className="font-black text-slate-800 leading-none">{param.name}</p>
                            <span className="text-[8px] text-slate-400 font-bold uppercase block mt-0.5">
                              Method: {param.method || 'ISE / Automated'} • Machine: {param.machine || 'Automated Analyzer'}
                            </span>
                          </td>
                          
                          <td className="px-4 py-2 text-center font-black">
                            <span className={`px-2 py-0.5 rounded ${
                              isNormal ? 'text-slate-800' : 'text-red-500 bg-red-50 font-black'
                            }`}>
                              {param.value || '-'}
                            </span>
                          </td>
                          
                          <td className="px-4 py-2 text-center font-bold text-slate-400">{param.unit || '-'}</td>
                          
                          <td className="px-4 py-2 text-center font-bold text-slate-500">
                            {param.minRef && param.maxRef ? `${param.minRef} - ${param.maxRef}` : 'N/A'}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Explanatory Clinical Note */}
            <div className="bg-[#f0faf5] rounded-xl p-3 border border-emerald-100/60 flex items-start gap-2 text-[9px] text-slate-500 leading-relaxed font-bold shrink-0 my-1.5">
              <div className="w-5 h-5 rounded-md bg-[#00a859] text-white flex items-center justify-center shrink-0">
                <FaInfoCircle size={10} />
              </div>
              <p>
                <span className="text-slate-800 font-black">Clinical Interpretation:</span> {visibleParams[0]?.interpretation || "Biological reference ranges vary across demographic cohorts, analytical assays, and equipment. Clinical interpretation must be corroborated with physical examination and a certified physician."}
              </p>
            </div>

            {/* Pathologist Verification Footer */}
            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs font-medium shrink-0">
              <div className="flex items-center gap-3">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=verify-report-${bookingId}`} 
                  alt="LIMS Signature" 
                  className="w-11 h-11 p-0.5 bg-white border border-slate-200 rounded-lg shrink-0" 
                />
                <div className="text-[9px]">
                  <p className="text-slate-400 font-bold uppercase leading-none">Scan to</p>
                  <p className="font-black text-slate-800 mt-0.5">verify report</p>
                </div>
              </div>
              
              <div className="text-center bg-slate-50 border border-slate-100 px-5 py-1.5 rounded-xl shrink-0 flex flex-col items-center justify-center min-w-[160px] min-h-[70px]">
                {signatureUrl ? (
                  <img 
                    src={signatureUrl} 
                    alt="Pathologist Signature" 
                    className="h-9 max-w-[130px] object-contain mb-0.5 mix-blend-multiply" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="h-7 flex items-center justify-center text-[9px] text-gray-300 italic">Signature Verified</div>
                )}
                <p className="font-black text-slate-800 text-xs mt-0.5">Dr. Verified Pathologist</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Consultant Pathologist</p>
              </div>

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

            {/* Brand Footer Strip */}
            <div className="bg-[#007a3e] px-6 py-2 rounded-xl flex justify-between items-center text-white text-[8px] font-black uppercase tracking-wider shrink-0 mt-2 border border-emerald-800">
              <span>{resolvedLabName} (A Unit of Health Kangaroo)</span>
              <span>Page {3 + chunkIndex}</span>
            </div>

          </div>
        );
      })}
    </>
  )
}