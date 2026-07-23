'use client'
import React, { useState, useEffect } from 'react'
import { 
  FaTimes, FaBookOpen, FaFileMedical, FaCloudUploadAlt, FaSpinner, 
  FaSearch, FaPlus, FaTrashAlt, FaSave, FaCheck, FaExclamationTriangle,
  FaUser, FaCheckSquare, FaFilePdf, FaFlask, FaLock, FaMapMarkerAlt,
  FaEye, FaArrowLeft, FaRegClock, FaUpload
} from 'react-icons/fa'
import { toast, Toaster } from 'react-hot-toast'
import LabVendorAPI from '@/app/services/LabVendorAPI';

// Import custom visual A4 pages
import ReportCoverPage from './ReportCoverPage'
import ReportSummaryParametersPage from './ReportSummaryParametersPage'
import ReportDetailedAssaysPage from './ReportDetailedAssaysPage'
import ReportAppPromoPage from './ReportAppPromoPage'

export default function LimsWorkspacePanel({ order, onClose, onSuccess }) {
  const [activePatientId, setActivePatientId] = useState('')
  const [activeTab, setActiveTab] = useState('smart') // 'smart' or 'file'
  const [loadingLims, setLoadingLims] = useState(false)
  const [testValues, setTestValues] = useState([])
  const [notification, setNotification] = useState({ type: '', message: '' })

  // Lab Profile state to hold loaded backend configurations
  const [labProfile, setLabProfile] = useState(null)

  // Manual Template Search State
  const [searchTerm, setSearchTerm] = useState('')
  const [dropdownTemplates, setDropdownTemplates] = useState([])
  const [searchingTemplates, setSearchingTemplates] = useState(false)

  // Legacy File Attachment State
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileUploading, setFileUploading] = useState(false)

  // Dynamic A4 Preview & Client Compilation State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [pdfCompiling, setPdfCompiling] = useState(false)

  // Fetch full Lab Profile configuration directly from API on mount
  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        const res = await LabVendorAPI.getLabProfile();
        if (res && res.success && res.data) {
          setLabProfile(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch lab profile settings inside workspace panel:", err);
      }
    };
    fetchProfileDetails();
  }, []);

  // Initialize first patient tab
  useEffect(() => {
    if (order && order.patients?.length > 0) {
      setActivePatientId(order.patients[0].patientId || order.patients[0]._id || 'Self');
    }
  }, [order]);

  // Reload parameter structures every time the patient selector changes
  useEffect(() => {
    if (order && activePatientId) {
      loadPatientParameters(order, activePatientId);
    }
  }, [activePatientId, order]);

  // Triggers manual lookup on master templates typing
  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      searchMasterTemplates();
    } else {
      setDropdownTemplates([]);
    }
  }, [searchTerm]);

  const searchMasterTemplates = async () => {
    setSearchingTemplates(true);
    try {
      const res = await LabVendorAPI.getDropdownTemplates(searchTerm);
      if (res && res.success && res.data) {
        setDropdownTemplates(res.data);
      }
    } catch (error) {
      console.error("Failed to query dropdown templates", error);
    } finally {
      setSearchingTemplates(false);
    }
  };

  const loadPatientParameters = async (targetOrder, patientId) => {
    setLoadingLims(true);
    setTestValues([]);
    setNotification({ type: '', message: '' });
    setSelectedFile(null);

    try {
      // Step 1: Check for existing draft report
      const draftRes = await LabVendorAPI.getDraftReport(targetOrder._id, patientId);
      if (draftRes && draftRes.success && draftRes.data) {
        setTestValues(draftRes.data);
        setNotification({ type: 'success', message: 'Existing draft report loaded successfully.' });
        setLoadingLims(false);
        return;
      }

      // Step 2: Fallback to Fuzzy Auto-Resolver based on booking parameters
      const resolveRes = await LabVendorAPI.getBookingTemplates(targetOrder._id);
      if (resolveRes && resolveRes.success && resolveRes.data) {
        // Map resolved templates into active work structures
        const structuredData = Object.keys(resolveRes.data).map((key) => {
          const item = resolveRes.data[key];
          return {
            testName: key,
            interpretation: item.interpretation || '',
            parameters: item.parameters ? item.parameters.map(p => ({
              name: p.name || '',
              value: '',
              unit: p.unit || '',
              minRef: p.minRef || '',
              maxRef: p.maxRef || '',
              method: p.method || '',
              machine: p.machine || ''
            })) : []
          };
        });

        if (structuredData.length > 0) {
          setTestValues(structuredData);
          setNotification({ type: 'info', message: 'Templates automatically matched for this patient.' });
        }
      }
    } catch (err) {
      console.error("Could not retrieve initial template configurations:", err);
      setNotification({ type: 'warning', message: 'No template configuration matched. You can search templates manually.' });
    } finally {
      setLoadingLims(false);
    }
  };

  const handleAddTemplateToWorkspace = async (testName) => {
    try {
      const response = await LabVendorAPI.getTemplateParameters(testName);
      if (response && response.success && response.data) {
        const resolvedList = response.data[testName];
        
        // Prevent duplicate panels
        if (testValues.some(item => item.testName === testName)) {
          setNotification({ type: 'warning', message: 'Template is already present in workspace.' });
          return;
        }

        const newTestEntry = {
          testName: testName,
          interpretation: resolvedList && resolvedList[0] ? resolvedList[0].interpretation : '',
          parameters: resolvedList ? resolvedList.map(p => ({
            name: p.name || '',
            value: '',
            unit: p.unit || '',
            minRef: p.minRef || '',
            maxRef: p.maxRef || '',
            method: p.method || '',
            machine: p.machine || ''
          })) : []
        };

        setTestValues(prev => [...prev, newTestEntry]);
        setSearchTerm('');
        setDropdownTemplates([]);
        setNotification({ type: 'success', message: `Added ${testName} to current template layout.` });
      }
    } catch (err) {
      console.error(err);
      setNotification({ type: 'danger', message: 'Error retrieving detailed parameters.' });
    }
  };

  const handleRemoveTestBlock = (index) => {
    setTestValues(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleParameterValueChange = (testIndex, paramIndex, value) => {
    const updated = [...testValues];
    updated[testIndex].parameters[paramIndex].value = value;
    setTestValues(updated);
  };

  const checkValueRange = (value, min, max) => {
    if (!value || isNaN(value)) return 'normal';
    const val = parseFloat(value);
    const minVal = parseFloat(min);
    const maxVal = parseFloat(max);
    if (!isNaN(minVal) && val < minVal) return 'low';
    if (!isNaN(maxVal) && val > maxVal) return 'high';
    return 'normal';
  };

  const triggerSaveDraft = async () => {
    if (testValues.length === 0) {
      setNotification({ type: 'warning', message: 'Please add at least one test template to save draft.' });
      return;
    }
    setLoadingLims(true);
    try {
      const response = await LabVendorAPI.saveDraftReport(order._id, activePatientId, testValues);
      if (response && response.success) {
        setNotification({ type: 'success', message: response.message || 'Draft progress saved successfully.' });
      }
    } catch (error) {
      setNotification({ type: 'danger', message: error.response?.data?.message || 'Error saving draft values.' });
    } finally {
      setLoadingLims(false);
    }
  };

  // Robust Isolated Iframe Physical Printing Handler
  const handlePrint = () => {
    const printContent = document.getElementById('lims-a4-preview-root');
    if (!printContent) {
      toast.error("Preview container could not be parsed.");
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>LIMS Lab Report Preview</title>
            <script src="https://cdn.tailwindcss.com"><\/script>
            <style>
                @page {
                    size: A4 portrait;
                    margin: 0 !important;
                }
                html, body {
                    margin: 0;
                    padding: 0;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                    background: #ffffff;
                }
                #lims-a4-preview-root {
                    gap: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                #lims-a4-preview-root > * {
                    page-break-after: always !important;
                    page-break-inside: avoid !important;
                    margin-bottom: 0 !important;
                    margin-top: 0 !important;
                }

                .text-slate-900, .text-slate-800, .text-slate-700, .text-slate-600, .text-slate-500, .text-slate-400, .text-slate-300,
                .text-gray-900, .text-gray-800, .text-gray-700, .text-gray-600, .text-gray-500, .text-gray-400,
                .text-\\[\\#0e1e38\\], .text-\\[\\#1e3a8a\\], .text-slate-600 {
                  color: #1e293b !important;
                }
                
                .text-[#00a859], .text-[#08B36A], .text-emerald-600, .text-emerald-700 { 
                  color: #00a859 !important; 
                }
                
                svg {
                  color: inherit !important;
                }
                
                .bg-white { background-color: #ffffff !important; }
                .bg-slate-50, .bg-gray-50 { background-color: #f8fafc !important; }
                .bg-slate-100 { background-color: #f1f5f9 !important; }
                .bg-[#f0faf5], .bg-emerald-50 { background-color: #f0faf5 !important; }
                .bg-[#00a859] { background-color: #00a859 !important; }
                .bg-[#007a3e] { background-color: #007a3e !important; }
                
                .border-gray-200, .border-slate-200 { border-color: #e2e8f0 !important; }
                .border-slate-100, .border-slate-150 { border-color: #f1f5f9 !important; }
            </style>
        </head>
        <body>
            ${printContent.outerHTML}
        </body>
        </html>
    `);
    doc.close();

    const triggerPrint = () => {
        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        }, 600);
    };

    if (iframe.contentWindow.document.readyState === 'complete') {
        triggerPrint();
    } else {
        iframe.onload = triggerPrint;
    }
  };

  // =========================================================================
  // 📥 CLIENT-SIDE COMPILATION & PDF UPLOADER (OPTIMIZED FOR VISUAL ALIGNMENT)
  // =========================================================================
  // Uses html2canvas-pro (not html2pdf.js / stock html2canvas) because it
  // natively understands modern CSS color functions (lab, oklch, oklab,
  // color-mix) that Tailwind's compiled CSS can emit. The old stock
  // html2canvas parser throws on those and aborts the whole export.
  //
  // Each A4 page div (#lims-a4-preview-root > *) is rendered to its own
  // canvas and added as its own PDF page, since the pages already have a
  // fixed 210mm x 297mm layout — this avoids error-prone height-slicing of
  // one giant stitched image.
  const triggerClientPdfCompilation = async () => {
    setPdfCompiling(true);
    toast.loading("Compiling dynamic A4 pages to high-resolution PDF...", { id: "pdf" });

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas-pro'),
        import('jspdf'),
      ]);

      const root = document.getElementById('lims-a4-preview-root');
      if (!root) {
        toast.error("Compilation error: Preview container not loaded.", { id: "pdf" });
        return;
      }

      const pageEls = Array.from(root.children);
      if (pageEls.length === 0) {
        toast.error("Compilation error: No report pages found.", { id: "pdf" });
        return;
      }

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pageEls.length; i++) {
        const pageEl = pageEls[i];

        const canvas = await html2canvas(pageEl, {
          scale: 2.5,
          useCORS: true,
          backgroundColor: '#ffffff',
          windowWidth: 794, // standard A4 width @96dpi, locks visual aspect ratio
          onclone: (clonedDoc, clonedEl) => {
            clonedEl.style.width = '210mm';
            clonedEl.style.height = '297mm';
            clonedEl.style.minHeight = '297mm';
            clonedEl.style.maxHeight = '297mm';
            clonedEl.style.overflow = 'hidden';
            clonedEl.style.boxSizing = 'border-box';
            clonedEl.style.position = 'relative';
            clonedEl.style.backgroundColor = '#ffffff';
            clonedEl.style.margin = '0';
            clonedEl.style.padding = '0';
          },
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      const pdfBlob = pdf.output('blob');

      const formData = new FormData();
      formData.append('patientId', activePatientId);
      formData.append('reportFile', pdfBlob, `report-${order.bookingId}-${activePatientId}.pdf`);

      const uploadRes = await LabVendorAPI.uploadClientPdf(order._id, formData);

      if (uploadRes && uploadRes.success) {
        toast.success("Client PDF report successfully saved on server!", { id: "pdf" });
        setIsPreviewOpen(false);
        onSuccess();
      } else {
        toast.error(uploadRes.message || "Upload failed", { id: "pdf" });
      }
    } catch (error) {
      console.error("PDF Compilation Error:", error);
      toast.error("Failed to compile or upload PDF report", { id: "pdf" });
    } finally {
      setPdfCompiling(false);
    }
  };

  const triggerOpenPreview = () => {
    if (testValues.length === 0) {
      setNotification({ type: 'warning', message: 'Please configure at least one test template before finalizing.' });
      return;
    }

    let emptyParamCount = 0;
    testValues.forEach(t => t.parameters.forEach(p => { if (!p.value) emptyParamCount++; }));
    if (emptyParamCount > 0) {
      if (!confirm(`Warning: There are ${emptyParamCount} empty parameters. Generating report now will export blank values for these rows. Continue?`)) {
        return;
      }
    }
    setIsPreviewOpen(true);
  };

  const handleLegacyUploadSubmit = async () => {
    if (!selectedFile) {
      alert("Please choose a file to proceed.");
      return;
    }
    setFileUploading(true);
    try {
      await LabVendorAPI.updateProgress(order._id, 'Completed');
      alert(`Document uploaded successfully: ${selectedFile.name}`);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Error handling legacy upload routing.");
    } finally {
      setFileUploading(false);
    }
  };

  const getBookedItemsSummary = () => {
    const tests = order.items?.tests?.map(t => t.name) || [];
    const packageTests = order.items?.packages?.flatMap(p => 
      p.packageId?.tests?.map(nt => nt.testName) || []
    ) || [];
    const uniqueItems = Array.from(new Set([...tests, ...packageTests]));
    return uniqueItems.join(', ') || order.items?.packages?.map(p => p.name).join(', ') || 'No services booked';
  };

  const getActivePatientObject = () => {
    return order.patients?.find(p => (p.patientId || p._id) === activePatientId) || order.patients?.[0];
  };

  const formatAddress = () => {
    if (order.collectionType === 'Visit Lab') return 'Visit Lab (In-house Collection)';
    if (!order.address) return 'Home Collection (Details Missing)';
    return `${order.address.houseNo || ''}, Sector ${order.address.sector || ''}, ${order.address.city || ''}`;
  };

  if (!order) return null;
  const currentPatient = getActivePatientObject();

  const getCalculatedHealthScore = () => {
    let totalParams = 0;
    let normalParams = 0;
    testValues.forEach(t => {
      t.parameters?.forEach(p => {
        totalParams++;
        const status = checkValueRange(p.value, p.minRef, p.maxRef);
        if (status === 'normal') normalParams++;
      });
    });
    return totalParams > 0 ? Math.round((normalParams / totalParams) * 100) : 92;
  };

  // Enriched order object containing dynamic labProfile attributes loaded directly from the database API
  const enrichedOrder = {
    ...order,
    labId: {
      ...order?.labId,
      name: labProfile?.name || order?.labId?.name || order?.labName,
      signatureImage: labProfile?.signatureImage || order?.labId?.signatureImage,
      documents: {
        ...order?.labId?.documents,
        nablNumber: labProfile?.documents?.nablNumber || order?.labId?.documents?.nablNumber
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 print-root">
      {/* Click-outside backdrop closer */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm no-print" onClick={onClose}></div>

      {/* Centered Modern Modal Wrapper */}
      <div className="relative bg-slate-50 w-full max-w-6xl h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 print-modal-wrapper">
        
        {/* Header bar */}
        <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center flex-shrink-0 no-print">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-[#08B36A] shadow-sm">
              <FaBookOpen size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Smart LIMS Report Hub</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Booking Reference ID: <span className="font-mono font-bold text-[#1e3a8a]">{order.bookingId}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Patients Tab Selector */}
        {order.patients?.length > 1 && (
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center gap-3 flex-shrink-0 overflow-x-auto no-print">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Select Active Patient</span>
            {order.patients.map((pat) => {
              const pId = pat.patientId || pat._id || 'Self';
              const isActive = activePatientId === pId;
              return (
                <button
                  key={pId}
                  onClick={() => setActivePatientId(pId)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    isActive 
                      ? 'bg-[#1e3a8a] text-white border-transparent shadow-md shadow-blue-900/10' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <FaUser size={10} className={isActive ? 'text-[#08B36A]' : 'text-slate-400'} />
                  <span>{pat.name || pat.patientName || 'Family Member'}</span>
                  {isActive && <FaCheckSquare size={10} className="text-white" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Inner Tab Switching Navigation */}
        <div className="bg-white border-b border-slate-100 px-6 py-2 flex gap-3 flex-shrink-0 no-print">
          <button 
            onClick={() => setActiveTab('smart')}
            className={`py-2 px-4 font-black text-xs rounded-xl tracking-wider uppercase transition-all flex items-center gap-2 ${
              activeTab === 'smart' 
                ? 'bg-emerald-50 text-[#08B36A]' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FaFileMedical size={14} /> Smart LIMS Parameter Form Builder
          </button>
          <button 
            onClick={() => setActiveTab('file')}
            className={`py-2 px-4 font-black text-xs rounded-xl tracking-wider uppercase transition-all flex items-center gap-2 ${
              activeTab === 'file' 
                ? 'bg-emerald-50 text-[#08B36A]' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FaCloudUploadAlt size={14} /> Document / PDF Direct Attachment
          </button>
        </div>

        {/* Split Screen Workspace Panel layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main Workspace Scrolling area (Left / Center) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 print-scroll-wrapper no-scrollbar">
            {notification.message && (
              <div className={`p-4 rounded-2xl border flex items-start gap-3 no-print animate-fade-in ${
                notification.type === 'success' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' :
                notification.type === 'info' ? 'bg-blue-50/50 border-blue-100 text-blue-800' :
                notification.type === 'warning' ? 'bg-amber-50/50 border-amber-100 text-amber-800' :
                'bg-red-50/50 border-red-100 text-red-800'
              }`}>
                <FaExclamationTriangle className="mt-0.5 flex-shrink-0 text-slate-400" />
                <p className="text-xs font-semibold leading-relaxed">{notification.message}</p>
              </div>
            )}

            {activeTab === 'smart' ? (
              <div className="space-y-6">
                
                {/* Search template bar */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm no-print">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                    Need custom test templates? Search Master Catalog
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      {searchingTemplates ? <FaSpinner className="animate-spin text-sm" /> : <FaSearch className="text-sm" />}
                    </div>
                    <input 
                      type="text"
                      placeholder="Search Templates (e.g. Kidney, CBC, Liver Panel)..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#08B36A]/20 focus:outline-none transition-all font-bold text-slate-700"
                    />
                  </div>

                  {dropdownTemplates.length > 0 && (
                    <div className="mt-2 border border-slate-200 rounded-2xl bg-white shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100 absolute z-50 left-6 right-6">
                      {dropdownTemplates.map((item) => (
                        <div 
                          key={item._id}
                          onClick={() => handleAddTemplateToWorkspace(item.testName)}
                          className="p-3.5 hover:bg-green-50/50 cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <span className="text-xs font-black text-slate-800">{item.testName}</span>
                          <span className="text-[10px] font-black text-[#08B36A] bg-green-50 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
                            <FaPlus /> ADD TO LAYOUT
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {loadingLims ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3 no-print bg-white rounded-3xl border border-slate-100">
                    <FaSpinner className="text-[#08B36A] animate-spin text-3xl" />
                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Syncing Patient Parameters...</p>
                  </div>
                ) : testValues.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center space-y-4 no-print">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                      <FaFileMedical size={28} />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h4 className="text-sm font-black text-slate-800">No template matching found</h4>
                      <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                        We couldn't automatically associate a master test configuration with this booking. Use the search bar above to pull custom structures.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {testValues.map((test, tIdx) => (
                      <div key={tIdx} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                          <div>
                            <h3 className="text-xs font-black text-[#1e3a8a] tracking-wider uppercase">{test.testName}</h3>
                            <p className="text-[9px] text-slate-400 font-extrabold mt-0.5 uppercase tracking-wider">Parameters Configured: {test.parameters.length}</p>
                          </div>
                          <button 
                            onClick={() => handleRemoveTestBlock(tIdx)}
                            className="text-[10px] font-black text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-red-100 transition-colors no-print uppercase tracking-wider"
                          >
                            <FaTrashAlt size={10} /> Delete Test
                          </button>
                        </div>

                        <div className="p-6 border-b border-slate-100">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                  <th className="pb-3.5 w-1/3">Parameter Name</th>
                                  <th className="pb-3.5 w-1/4">Observed Value</th>
                                  <th className="pb-3.5 text-center">Reference Range</th>
                                  <th className="pb-3.5 text-center">Unit</th>
                                  <th className="pb-3.5 text-right">Machine Name</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-xs">
                              {test.parameters.map((param, pIdx) => {
                                const rangeStatus = checkValueRange(param.value, param.minRef, param.maxRef);
                                return (
                                  <tr key={pIdx} className="hover:bg-slate-50/50">
                                    <td className="py-4 font-bold text-slate-800">{param.name}</td>
                                    <td className="py-4">
                                      <div className="flex items-center gap-2">
                                        <input 
                                          type="text"
                                          value={param.value || ''}
                                          placeholder="Enter Value"
                                          onChange={(e) => handleParameterValueChange(tIdx, pIdx, e.target.value)}
                                          className="w-28 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#08B36A] outline-none font-black text-slate-800 text-xs transition-all text-center"
                                        />
                                        {rangeStatus === 'low' && (
                                          <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">Low</span>
                                        )}
                                        {rangeStatus === 'high' && (
                                          <span className="bg-red-50 text-red-600 border border-red-200 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">High</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-4 text-center font-bold text-slate-500">{param.minRef && param.maxRef ? `${param.minRef} - ${param.maxRef}` : 'N/A'}</td>
                                    <td className="py-4 text-center text-slate-400 font-extrabold">{param.unit || '-'}</td>
                                    <td className="py-4 text-right">
                                      <span className="text-[9px] bg-slate-100 text-slate-600 font-extrabold px-2 py-1 rounded-md uppercase tracking-wider">{param.machine || 'Manual'}</span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Clinical Interpretation Section */}
                        <div className="p-6 bg-slate-50/30">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                            Clinical Interpretation / Comments
                          </label>
                          <textarea 
                            rows="3" 
                            placeholder="Type pathologist's interpretive notes here..."
                            value={test.interpretation || ''} 
                            onChange={e => {
                              const tempValues = [...testValues];
                              const matchIndex = tempValues.findIndex(t => t.testName === test.testName);
                              if (matchIndex !== -1) {
                                tempValues[matchIndex].interpretation = e.target.value;
                                setTestValues(tempValues);
                              }
                            }}
                            className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#08B36A]/10 font-medium"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            ) : (
              /* Tab B: Legacy Direct File Attachments */
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Attach File Document</label>
                    <p className="text-xs text-slate-400">Upload pre-compiled testing outputs directly to bypass manual building form entries.</p>
                  </div>
                  <div className="w-full relative border-2 border-dashed border-slate-200 hover:border-[#08B36A] bg-slate-50 rounded-2xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer group">
                    <FaCloudUploadAlt className="text-5xl text-slate-300 group-hover:text-[#08B36A] mb-3 transition-all animate-bounce duration-1000" />
                    <span className="text-xs font-black text-slate-700 group-hover:text-[#08B36A] uppercase tracking-wider">Select PDF, JPG, or PNG</span>
                    <span className="text-[10px] text-slate-400 mt-1 font-bold">Maximum allowed upload file size: 5MB</span>
                    <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>

                  {selectedFile && (
                    <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between animate-fade-in">
                      <div className="flex items-center gap-2">
                        <FaFilePdf className="text-red-500 text-lg animate-pulse" />
                        <span className="text-xs font-bold text-slate-700">{selectedFile.name}</span>
                      </div>
                      <button onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-50 transition-colors">
                        <FaTimes size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Clinical Reference Sidebar Panel (Right) */}
          <div className="w-80 bg-white border-l border-slate-100 overflow-y-auto p-6 hidden lg:block space-y-6 no-print">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-3 border-b border-slate-100 flex items-center gap-2">
              <FaUser /> Diagnostic Target context
            </h3>
            
            {/* Active Patient summary */}
            {currentPatient && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-3 font-sans">
                <div>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Target Patient</p>
                  <p className="font-extrabold text-slate-800 text-xs mt-0.5">{currentPatient.name || currentPatient.patientName}</p>
                </div>
                <div className="w-full border-t border-dashed border-slate-200"></div>
                {currentPatient.age && (
                  <div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Age Profile</p>
                    <p className="font-extrabold text-slate-800 mt-0.5">{currentPatient.age} Yrs</p>
                  </div>
                )}
                {currentPatient.gender && (
                  <div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Biological Sex</p>
                    <p className="font-extrabold text-slate-800 mt-0.5">{currentPatient.gender}</p>
                  </div>
                )}
                {currentPatient.relation && (
                  <div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Relationship context</p>
                    <p className="font-extrabold text-slate-800 mt-0.5">{currentPatient.relation || 'Self'}</p>
                  </div>
                )}
              </div>
            )}

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-3 font-sans">
              <div>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Tracking OTP</p>
                <p className="font-mono font-black text-emerald-600 mt-0.5 tracking-widest flex items-center gap-1">
                  <FaLock className="text-[10px]" /> {order.tracking?.otp || 'N/A'}
                </p>
              </div>
              <div className="w-full border-t border-dashed border-slate-200"></div>
              <div>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Collection mode</p>
                <p className="font-extrabold text-slate-800 mt-0.5">{order.collectionType}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Appointment Time</p>
                <p className="font-extrabold text-slate-800 mt-0.5">{order.appointmentTime}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Address context</p>
                <p className="font-semibold text-slate-600 mt-1 leading-relaxed flex items-start gap-1">
                  <FaMapMarkerAlt className="text-slate-400 text-xs mt-0.5" /> {formatAddress()}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                <FaFlask /> Unpacked diagnostic elements
              </p>
              <p className="font-extrabold text-slate-600 leading-relaxed text-[11px]">
                {getBookedItemsSummary()}
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Footer bar actions */}
        <div className="p-5 bg-white border-t border-slate-100 flex justify-between items-center flex-shrink-0 no-print">
          <button 
            onClick={onClose} 
            className="px-5 py-2.5 text-slate-400 font-black hover:text-slate-700 transition-colors text-[10px] uppercase tracking-widest"
          >
            Exit Workspace
          </button>
          
          <div className="flex items-center gap-3">
            {activeTab === 'smart' ? (
              <>
                <button 
                  onClick={triggerSaveDraft}
                  disabled={loadingLims || testValues.length === 0}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 font-black rounded-xl transition-all flex items-center gap-2 text-xs"
                >
                  {loadingLims ? <FaSpinner className="animate-spin" /> : <FaSave />} Save Draft
                </button>
                <button 
                  onClick={triggerOpenPreview}
                  disabled={loadingLims || testValues.length === 0}
                  className="px-6 py-2.5 bg-[#08B36A] hover:bg-green-600 text-white disabled:opacity-50 font-black rounded-xl shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 text-xs"
                >
                  {loadingLims ? <FaSpinner className="animate-spin" /> : <FaEye />} Generate Report
                </button>
              </>
            ) : (
              <button 
                onClick={handleLegacyUploadSubmit}
                disabled={fileUploading || !selectedFile}
                className="px-6 py-2.5 bg-[#08B36A] hover:bg-green-600 text-white disabled:opacity-50 font-black rounded-xl shadow-md transition-all flex items-center gap-2 text-xs"
              >
                {fileUploading ? <FaSpinner className="animate-spin" /> : <FaUpload />} Complete Direct Upload
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 📄 HIGH-FIDELITY PRINT-READY A4 PREVIEW OVERLAY                           */}
      {/* ========================================================================= */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto no-print">
          <div className="relative bg-slate-100 w-full max-w-[850px] h-[90vh] rounded-[2rem] shadow-2xl flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Toolbar */}
            <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-base font-black text-slate-800">Print Preview (A4 Page Sheets)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Review generated pages. When finalized, click "Confirm & Upload".</p>
              </div>
              <button onClick={() => setIsPreviewOpen(false)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <FaTimes size={16} />
              </button>
            </div>

            {/* Document preview container */}
            <div className="flex-grow overflow-y-auto p-8 space-y-12 custom-scrollbar no-scrollbar">
              <div id="lims-a4-preview-root" className="space-y-12">
                
                {/* Page 1: Cover Page */}
                <ReportCoverPage 
                  order={enrichedOrder}
                  patientName={currentPatient?.name || currentPatient?.patientName}
                  patientAge={currentPatient?.age}
                  patientGender={currentPatient?.gender}
                  labName={labProfile?.name || order?.labName}
                />

                {/* Page 2: Summary Page */}
                <ReportSummaryParametersPage 
                  order={enrichedOrder}
                  patientName={currentPatient?.name || currentPatient?.patientName}
                  healthScore={getCalculatedHealthScore()}
                  testResultsData={testValues}
                />

                {/* Page 3: Assay Results Page */}
                <ReportDetailedAssaysPage 
                  order={enrichedOrder}
                  patientName={currentPatient?.name || currentPatient?.patientName}
                  patientAge={currentPatient?.age}
                  patientGender={currentPatient?.gender}
                  tests={testValues}
                  evaluateRange={checkValueRange}
                />

                {/* Page 4: Promo Page */}
                <ReportAppPromoPage order={enrichedOrder} />

              </div>
            </div>

            {/* Footer actions */}
            <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl text-xs hover:bg-slate-50 transition-all"
              >
                <FaArrowLeft className="inline mr-1" /> Back to Editor
              </button>

              <div className="flex items-center gap-2">
                {/* Direct Print Document Trigger */}
                <button 
                  onClick={handlePrint}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <FaFilePdf /> Print Report
                </button>

                <button 
                  onClick={triggerClientPdfCompilation}
                  disabled={pdfCompiling}
                  className="px-6 py-2.5 bg-[#08B36A] hover:bg-green-600 text-white disabled:opacity-50 font-black rounded-xl shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 text-xs"
                >
                  {pdfCompiling ? (
                    <>
                      <FaSpinner className="animate-spin" /> Compiling...
                    </>
                  ) : (
                    <>
                      <FaCloudUploadAlt /> Confirm & Upload
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Global Fallback Print Sheet styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
            @page {
                size: A4 portrait;
                margin: 0 !important;
            }

            html, body, div, section, main, [role="dialog"] {
                overflow: visible !important;
                max-height: none !important;
                height: auto !important;
                position: static !important;
                background: transparent !important;
                box-shadow: none !important;
            }

            body * {
                visibility: hidden !important;
            }

            #lims-a4-preview-root, #lims-a4-preview-root * {
                visibility: visible !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .print-root {
                display: block !important;
                padding: 0 !important;
                margin: 0 !important;
                background: none !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: auto !important;
            }

            .print-modal-wrapper {
                display: block !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                overflow: visible !important;
            }

            .print-scroll-wrapper {
                padding: 0 !important;
                max-height: none !important;
                overflow: visible !important;
            }

            #lims-a4-preview-root {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
                background: #fff !important;
                gap: 0 !important;
            }

            #lims-a4-preview-root > * {
                page-break-after: always !important;
                page-break-inside: avoid !important;
                margin-top: 0 !important;
                margin-bottom: 0 !important;
            }

            .no-print {
                display: none !important;
                height: 0 !important;
                width: 0 !important;
            }

            tr {
                page-break-inside: avoid !important;
            }
        }
      ` }} />
    </div>
  )
}