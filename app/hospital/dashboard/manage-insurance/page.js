"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  FileText, 
  Upload, 
  X, 
  AlertCircle, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Eye,
  Filter
} from 'lucide-react';
import HospitalAPI from '../../../services/HospitalAPI';

// Helper for image and PDF URLs
const getFullUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

export default function InsuranceTpaDesk() {
  // State for Directory List
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState('Insured'); // "Insured" or "Self-Pay"
  const [claimStatus, setClaimStatus] = useState('All'); // 'All' | 'Pending' | 'Approved' | 'Rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Modal Control - Insurance Policy Details
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Modal Control - TPA Approval Letter
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Modal Control - Card Preview
  const [cardPreviewModal, setCardPreviewModal] = useState({ isOpen: false, front: '', back: '', title: '' });

  // Load patient directory data from GET /hospital/panel/insurance/patients
  const fetchDirectory = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      // Build clean query object per documentation instructions
      const params = {
        tab: activeTab,
        page: currentPage,
        limit: 10
      };

      if (activeTab === 'Insured') {
        params.claimStatus = claimStatus;
      }

      // Omit search parameter if empty
      if (searchQuery && searchQuery.trim() !== '') {
        params.search = searchQuery.trim();
      }

      const response = await HospitalAPI.getPatientsDirectory(params);
      if (response && response.success) {
        setPatients(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalRecords(response.totalRecords ?? response.count ?? (response.data ? response.data.length : 0));
      } else {
        setErrorMessage(response?.message || 'Failed to retrieve directory records.');
      }
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to fetch patient records.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, claimStatus, currentPage, searchQuery]);

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  // Handle Main Tab Switch ('Insured' vs 'Self-Pay')
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setCurrentPage(1);
    setPatients([]);
  };

  // Handle Claim Status Filter ('All', 'Pending', 'Approved', 'Rejected')
  const handleClaimStatusChange = (status) => {
    setClaimStatus(status);
    setCurrentPage(1);
  };

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const openInsuranceModal = (patient) => {
    setSelectedPatient(patient);
    setIsInsuranceModalOpen(true);
  };

  const openApprovalModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsApprovalModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Panel */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Hospital Health Insurance (TPA Desk)</h1>
            <p className="text-sm text-slate-500 mt-1">Manage patient insurance directory alignment, records verification, and cashless eligibility sync.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 self-start md:self-center">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            TPA Gateways Active
          </div>
        </div>

        {/* Action Bar & Filtering Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            
            {/* Primary Tab Selector ('Insured' vs 'Self-Pay') */}
            <div className="flex border border-slate-200 rounded-lg p-1 bg-white max-w-sm w-full">
              <button
                onClick={() => handleTabChange('Insured')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === 'Insured'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Insured Queue
              </button>
              <button
                onClick={() => handleTabChange('Self-Pay')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                  activeTab === 'Self-Pay'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Self-Pay
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4.5 w-4.5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search patient, policy or booking ID..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
              />
            </div>
          </div>

          {/* Sub-Filters for Claim Status (Only on Insured Tab) */}
          {activeTab === 'Insured' && (
            <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
                <Filter className="w-3.5 h-3.5" /> Claim Status:
              </span>
              {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleClaimStatusChange(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    claimStatus === status
                      ? 'bg-[#08B36A] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status === 'All' ? 'All Inpatients' : status}
                </button>
              ))}
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="m-6 p-4 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-3 text-rose-700 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Table Container */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                <span className="text-sm text-slate-500 font-medium">Retrieving insurance records...</span>
              </div>
            ) : patients.length === 0 ? (
              <div className="py-20 text-center">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No matching patient records found</p>
                <p className="text-xs text-slate-400 mt-1">Try switching claim status tabs or refining your search parameters.</p>
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                    <th className="px-6 py-3.5">Patient Info</th>
                    {activeTab === 'Insured' ? (
                      <>
                        <th className="px-6 py-3.5">Insurance Coverage</th>
                        <th className="px-6 py-3.5">Ward / Admission</th>
                        <th className="px-6 py-3.5">Approval Status</th>
                      </>
                    ) : (
                      <th className="px-6 py-3.5">Contact Details</th>
                    )}
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((item) => {
                    const patient = item.patient || {};
                    const insObj = item.insurance || item.insuranceDetails || {};

                    const patientName = patient.name || item.patientName || 'Unknown Patient';
                    const patientPhone = patient.phone || item.phone || 'N/A';
                    const patientAge = patient.age || item.age;
                    const patientGender = patient.gender || item.gender;
                    const patientUserId = patient.userId || item.userId || item._id;

                    const bookingId = item.bookingId || item.appointmentId || item._id;
                    const appointmentId = item.appointmentId || item._id;
                    
                    const company = insObj.companyName || 'N/A';
                    const policyNo = insObj.insuranceNumber || 'N/A';
                    const planType = insObj.insuranceType || 'Cashless';

                    const approvalStatus = insObj.approvalStatus || 'Pending';
                    const rejectionReason = insObj.rejectionReason;
                    const approvalPdf = insObj.approvalLetterPdf;

                    // Front & Back Card Previews matching keys guide
                    const frontCard = insObj.cardFrontUrl || insObj.cardFront || insObj.insuranceDocumentFront;
                    const backCard = insObj.cardBackUrl || insObj.cardBack || insObj.insuranceDocumentBack;

                    return (
                      <tr key={appointmentId} className="hover:bg-slate-50/50 transition-colors">
                        {/* Patient Info Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full border border-slate-200 bg-[#08B36A]/10 text-[#08B36A] font-bold flex items-center justify-center shrink-0">
                              {patientName.charAt(0) || 'P'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{patientName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                ID: #{bookingId}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {patientPhone} {patientAge ? `• ${patientAge}y` : ''} {patientGender ? `(${patientGender})` : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Middle columns */}
                        {activeTab === 'Insured' ? (
                          <>
                            {/* Insurance Coverage Info */}
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-800">{company}</div>
                              <div className="text-xs text-slate-500">
                                No: <span className="font-mono text-slate-700">{policyNo}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">{planType}</div>
                              
                              {/* Card Front & Back Preview Action */}
                              {(frontCard || backCard) && (
                                <button
                                  type="button"
                                  onClick={() => setCardPreviewModal({
                                    isOpen: true,
                                    front: frontCard ? getFullUrl(frontCard) : '',
                                    back: backCard ? getFullUrl(backCard) : '',
                                    title: `${patientName}'s Insurance Cards`
                                  })}
                                  className="mt-1 text-[11px] text-[#08B36A] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" /> View Cards
                                </button>
                              )}
                            </td>

                            {/* Ward & Bed Allocation */}
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-800">{item.wardName || 'General Ward'}</div>
                              <div className="text-xs text-slate-500">{item.bedNumber || 'Bed Unassigned'}</div>
                              {item.totalEstimatedAmount && (
                                <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 rounded">
                                  Est: ₹{item.totalEstimatedAmount}
                                </span>
                              )}
                            </td>

                            {/* Approval Status Badges per Documentation */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1 items-start">
                                {approvalStatus === 'Approved' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" /> Cashless Approved
                                  </span>
                                ) : approvalStatus === 'Rejected' ? (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                      <XCircle className="w-3 h-3" /> Claim Rejected
                                    </span>
                                    {rejectionReason && (
                                      <p className="text-[10px] text-rose-600 font-semibold max-w-[160px] truncate" title={rejectionReason}>
                                        {rejectionReason}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                                    TPA Approval Pending
                                  </span>
                                )}
                              </div>
                            </td>
                          </>
                        ) : (
                          /* Self-Pay Content: Contact & Bill Details */
                          <td className="px-6 py-4">
                            <div className="text-slate-700 font-medium">{patientPhone}</div>
                            <div className="text-xs text-slate-400">
                              {item.wardName ? `${item.wardName} - ${item.bedNumber}` : 'Self-Pay Admission'}
                            </div>
                            {item.totalEstimatedAmount && (
                              <span className="text-[11px] font-bold text-slate-600">
                                Deposit: ₹{item.totalEstimatedAmount}
                              </span>
                            )}
                          </td>
                        )}

                        {/* Table Actions block */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {activeTab === 'Self-Pay' ? (
                              <button
                                onClick={() => openInsuranceModal({
                                  ...item,
                                  patientUserId,
                                  name: patientName,
                                  phone: patientPhone
                                })}
                                className="inline-flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 transition-colors text-xs font-semibold px-3 py-2 rounded-lg shadow-sm cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" /> Add Insurance
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => openInsuranceModal({
                                    ...item,
                                    patientUserId,
                                    name: patientName,
                                    phone: patientPhone
                                  })}
                                  className="text-slate-700 hover:bg-slate-100 transition-colors text-xs font-semibold border border-slate-300 px-2.5 py-1.5 rounded-lg cursor-pointer"
                                >
                                  Edit Policy
                                </button>

                                {approvalStatus === 'Approved' && approvalPdf ? (
                                  <a
                                    href={getFullUrl(approvalPdf)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" /> View Letter
                                  </a>
                                ) : (
                                  <button
                                    onClick={() => openApprovalModal({
                                      appointmentId: appointmentId,
                                      bookingId: bookingId,
                                      patientName: patientName,
                                      companyName: company,
                                      policyNo: policyNo
                                    })}
                                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm cursor-pointer"
                                  >
                                    <Upload className="h-3.5 w-3.5" /> Upload Letter
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {patients.length > 0 && (
            <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50/50">
              <div className="text-xs text-slate-500">
                Page <strong className="text-slate-900">{currentPage}</strong> of <strong className="text-slate-900">{totalPages}</strong> ({totalRecords} records)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-600 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-600 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Insurance Form Config Modal (PUT /hospital/panel/insurance/save/:patientUserId) */}
      {isInsuranceModalOpen && selectedPatient && (
        <AddInsuranceModal 
          patient={selectedPatient} 
          onClose={() => {
            setIsInsuranceModalOpen(false);
            setSelectedPatient(null);
          }} 
          onSuccess={() => {
            setIsInsuranceModalOpen(false);
            setSelectedPatient(null);
            fetchDirectory();
          }}
        />
      )}

      {/* Dynamic Approval Letter / Decision Modal (PUT /hospital/panel/insurance/upload-approval-letter/:appointmentId) */}
      {isApprovalModalOpen && selectedAppointment && (
        <UploadApprovalLetterModal
          appointment={selectedAppointment}
          onClose={() => {
            setIsApprovalModalOpen(false);
            setSelectedAppointment(null);
          }}
          onSuccess={() => {
            setIsApprovalModalOpen(false);
            setSelectedAppointment(null);
            fetchDirectory();
          }}
        />
      )}

      {/* Front & Back Card Lightbox Preview Modal */}
      {cardPreviewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">{cardPreviewModal.title}</h3>
              <button 
                onClick={() => setCardPreviewModal({ isOpen: false, front: '', back: '', title: '' })}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">Front Card</span>
                {cardPreviewModal.front ? (
                  <img src={cardPreviewModal.front} alt="Card Front" className="w-full h-44 object-cover rounded-xl border" />
                ) : (
                  <div className="w-full h-44 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400">No front image</div>
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">Back Card</span>
                {cardPreviewModal.back ? (
                  <img src={cardPreviewModal.back} alt="Card Back" className="w-full h-44 object-cover rounded-xl border" />
                ) : (
                  <div className="w-full h-44 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400">No back image</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * Modal Sub-Component: Policy Form configuration (PUT /hospital/panel/insurance/save/:patientUserId)
 */
function AddInsuranceModal({ patient, onClose, onSuccess }) {
  const [companies, setCompanies] = useState([]);
  const [types, setTypes] = useState([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields State
  const [companyName, setCompanyName] = useState('');
  const [insuranceNumber, setInsuranceNumber] = useState('');
  const [insuranceType, setInsuranceType] = useState('');

  // Dual File Upload State & Previews
  const [frontFile, setFrontFile] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  useEffect(() => {
    const insObj = patient.insurance || patient.insuranceDetails || {};
    setCompanyName(insObj.companyName || patient.companyName || '');
    setInsuranceNumber(insObj.insuranceNumber || patient.insuranceNumber || '');
    setInsuranceType(insObj.insuranceType || patient.insuranceType || '');

    const front = insObj.cardFrontUrl || insObj.cardFront || insObj.insuranceDocumentFront;
    const back = insObj.cardBackUrl || insObj.cardBack || insObj.insuranceDocumentBack;

    if (front) {
      setFrontPreview(getFullUrl(front));
    }
    if (back) {
      setBackPreview(getFullUrl(back));
    }
  }, [patient]);

  // Load Dropdowns from GET /hospital/panel/insurance/master-data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const response = await HospitalAPI.getMasterDropdownData();
        if (response && response.success) {
          const compList = response.companies || response.data?.insuranceProviders || [];
          const typeList = response.types || response.data?.insuranceTypes || [];
          setCompanies(compList);
          setTypes(typeList);

          if (!insuranceType && typeList.length > 0) {
            setInsuranceType(typeof typeList[0] === 'string' ? typeList[0] : typeList[0].name);
          }
        } else {
          setSubmitError(response?.message || 'Could not fetch dropdown resources.');
        }
      } catch (err) {
        setSubmitError('Unable to contact master server to retrieve provider dropdowns.');
      } finally {
        setIsLoadingDropdowns(false);
      }
    };

    loadDropdownData();
  }, [patient, insuranceType]);

  useEffect(() => {
    return () => {
      if (frontPreview && frontFile) URL.revokeObjectURL(frontPreview);
      if (backPreview && backFile) URL.revokeObjectURL(backPreview);
    };
  }, [frontPreview, backPreview, frontFile, backFile]);

  const handleFrontFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFrontFile(file);
      setFrontPreview(URL.createObjectURL(file));
    }
  };

  const handleBackFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackFile(file);
      setBackPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!companyName.trim()) return setSubmitError('Please select or specify the insurance company name.');
    if (!insuranceNumber.trim()) return setSubmitError('Please enter a policy number.');
    if (!insuranceType) return setSubmitError('Please select a policy type.');

    const insObj = patient.insurance || patient.insuranceDetails || {};
    const hasFrontExisting = insObj.cardFrontUrl || insObj.cardFront || insObj.insuranceDocumentFront;
    const hasBackExisting = insObj.cardBackUrl || insObj.cardBack || insObj.insuranceDocumentBack;

    if (!frontFile && !hasFrontExisting) {
      return setSubmitError('Please upload the Front Card image/PDF.');
    }
    if (!backFile && !hasBackExisting) {
      return setSubmitError('Please upload the Back Card image/PDF.');
    }

    setIsSaving(true);

    try {
      const payload = new FormData();
      payload.append('companyName', companyName.trim());
      payload.append('insuranceNumber', insuranceNumber.trim());
      payload.append('insuranceType', insuranceType);

      if (patient.appointmentId) {
        payload.append('appointmentId', patient.appointmentId);
      }

      // Exact Multer Keys
      if (frontFile) {
        payload.append('insuranceDocumentFront', frontFile);
      }
      if (backFile) {
        payload.append('insuranceDocumentBack', backFile);
      }

      const patientUserId = patient.patientUserId || patient.userId || patient.patient?.userId || patient._id;
      const result = await HospitalAPI.saveInsuranceDetails(patientUserId, payload);
      
      if (result && result.success) {
        onSuccess();
      } else {
        setSubmitError(result?.message || 'Failed to save patient insurance details.');
      }
    } catch (err) {
      setSubmitError(err?.message || 'Error occurred while saving insurance parameters.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Desk Counter: Save Patient Insurance</h2>
            <p className="text-xs text-slate-500 mt-0.5">Patient: <span className="font-semibold text-slate-700">{patient.patientName || patient.name}</span></p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-3 text-rose-850 text-xs">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500" />
              <span>{submitError}</span>
            </div>
          )}

          {isLoadingDropdowns ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
              <span className="text-xs text-slate-500">Loading master dropdown assets...</span>
            </div>
          ) : (
            <>
              {/* Company Provider Selector / Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Insurance Company Name</label>
                <select
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all font-medium cursor-pointer"
                >
                  <option value="">Select Insurance Provider</option>
                  {companies.map((comp) => {
                    const name = comp.insuranceName || comp.name || comp;
                    const provider = comp.provider ? ` (${comp.provider})` : '';
                    return (
                      <option key={comp._id || name} value={name}>
                        {name}{provider}
                      </option>
                    );
                  })}
                  <option value="Other">Other / Custom</option>
                </select>

                {companyName === "Other" && (
                  <input
                    type="text"
                    required
                    placeholder="Enter Custom Insurance Company Name"
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-2 w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                )}
              </div>

              {/* Policy Number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Insurance Policy Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. POL1234567"
                  value={insuranceNumber}
                  onChange={(e) => setInsuranceNumber(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all font-medium font-mono"
                />
              </div>

              {/* Policy Type Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">Policy Type</label>
                <select
                  required
                  value={insuranceType}
                  onChange={(e) => setInsuranceType(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none bg-white focus:ring-2 focus:ring-slate-900 font-medium cursor-pointer"
                >
                  <option value="">Select Policy Type</option>
                  {types.map((t, idx) => {
                    const typeLabel = typeof t === 'string' ? t : t.name;
                    return (
                      <option key={idx} value={typeLabel}>
                        {typeLabel}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Dual Upload for Card Front & Back */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-slate-600 block">Upload Policy Card (Front & Back Photos)</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Front Side Upload */}
                  <div className="border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 relative hover:bg-slate-100/50 transition-all">
                    {frontPreview ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200">
                        <img src={frontPreview} alt="Front Card" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setFrontFile(null); setFrontPreview(null); }}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center text-center p-3 w-full">
                        <Upload className="h-7 w-7 text-slate-400 mb-2" />
                        <span className="text-xs font-semibold text-slate-700">Card Front (insuranceDocumentFront)</span>
                        <span className="text-[10px] text-slate-400 mt-1">Image or PDF file</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFrontFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Back Side Upload */}
                  <div className="border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 relative hover:bg-slate-100/50 transition-all">
                    {backPreview ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-200">
                        <img src={backPreview} alt="Back Card" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setBackFile(null); setBackPreview(null); }}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center text-center p-3 w-full">
                        <Upload className="h-7 w-7 text-slate-400 mb-2" />
                        <span className="text-xs font-semibold text-slate-700">Card Back (insuranceDocumentBack)</span>
                        <span className="text-[10px] text-slate-400 mt-1">Image or PDF file</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleBackFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </form>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || isLoadingDropdowns}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              'Save & Sync Details'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal Sub-Component: TPA Approval / Rejection Workflow
 * PUT /hospital/panel/insurance/upload-approval-letter/:appointmentId
 * FormData: approvalLetterPdf, approvalStatus ("Approved" | "Rejected"), rejectionReason
 */
function UploadApprovalLetterModal({ appointment, onClose, onSuccess }) {
  const [approvalStatus, setApprovalStatus] = useState('Approved'); // 'Approved' | 'Rejected'
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const appointmentId = appointment.appointmentId || appointment._id;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isValid = file.type === 'application/pdf' || file.type.startsWith('image/');
      if (!isValid) {
        setErrorMessage('Allowed formats: PDF or Image files only (JPG, PNG).');
        return;
      }
      setSelectedFile(file);
      setErrorMessage('');

      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!appointmentId) {
      setErrorMessage('Invalid appointment reference ID.');
      return;
    }

    if (approvalStatus === 'Approved' && !selectedFile) {
      setErrorMessage('Please attach the official approval letter file (PDF or Image).');
      return;
    }

    if (approvalStatus === 'Rejected' && !rejectionReason.trim()) {
      setErrorMessage('Please specify the reason for claim rejection (e.g. Limit exceeded, policy expired).');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      const payload = new FormData();
      payload.append('approvalStatus', approvalStatus);

      if (approvalStatus === 'Approved') {
        payload.append('approvalLetterPdf', selectedFile);
      } else {
        payload.append('rejectionReason', rejectionReason.trim());
        if (selectedFile) {
          payload.append('approvalLetterPdf', selectedFile);
        }
      }

      const response = await HospitalAPI.uploadApprovalLetter(appointmentId, payload);
      if (response && response.success) {
        onSuccess();
      } else {
        setErrorMessage(response?.message || 'Failed to submit authorization letter.');
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Error occurred while connecting to the server.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header Block */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Process Cashless Claim</h2>
            <p className="text-xs text-slate-500 mt-0.5">Booking ID: <span className="font-mono font-semibold text-slate-700">{appointment.bookingId || appointmentId}</span></p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Decision Status Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">Claim Decision</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setApprovalStatus('Approved')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  approvalStatus === 'Approved'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approve Claim
              </button>
              <button
                type="button"
                onClick={() => setApprovalStatus('Rejected')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  approvalStatus === 'Rejected'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" /> Reject Claim
              </button>
            </div>
          </div>

          {/* Rejection Reason (Mandatory when Rejected) */}
          {approvalStatus === 'Rejected' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-rose-700 block">Rejection Reason *</label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Limit exceeded, policy expired, or non-covered procedure."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full text-xs p-3 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-rose-50/30 text-slate-800 resize-none font-medium"
              />
            </div>
          )}

          {/* File Upload Box */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              {approvalStatus === 'Approved' ? 'Attach Approval Letter (PDF / Image) *' : 'Attach Rejection Notice (Optional)'}
            </label>
            <div className="border border-dashed border-slate-300 rounded-xl p-5 flex flex-col items-center justify-center bg-slate-50/50 relative hover:bg-slate-100/50 transition-all">
              {selectedFile ? (
                <div className="text-center space-y-2 w-full">
                  {previewUrl ? (
                    <div className="w-full h-28 rounded-lg overflow-hidden border border-slate-200 mb-2">
                      <img src={previewUrl} alt="Document preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                  )}
                  <div className="text-xs font-semibold text-slate-800 break-all">{selectedFile.name}</div>
                  <div className="text-[10px] text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline mt-1 cursor-pointer"
                  >
                    Remove & Replace
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center text-center p-3 w-full">
                  <Upload className="h-7 w-7 text-indigo-500 mb-2" />
                  <span className="text-xs font-semibold text-slate-700">Choose Letter Document</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">PDF or Image up to 10MB</span>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center">
            {approvalStatus === 'Approved'
              ? '* Confirms cashless coverage and notifies patient with letter download.'
              : '* Marks claim as rejected and notifies patient with the supplied reason.'}
          </p>
        </form>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isUploading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUploadSubmit}
            disabled={isUploading || (approvalStatus === 'Approved' && !selectedFile) || (approvalStatus === 'Rejected' && !rejectionReason.trim())}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white transition-colors rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
              approvalStatus === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...
              </>
            ) : approvalStatus === 'Approved' ? (
              'Confirm Approval'
            ) : (
              'Confirm Rejection'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}