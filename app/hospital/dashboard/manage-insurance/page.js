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
  ImageIcon,
  Eye
} from 'lucide-react';
import HospitalAPI from '../../../services/HospitalAPI';

export default function InsuranceTpaDesk() {
  // State for Directory List
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState('Insured'); // "Insured" or "Un-Insured"
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

  // Load patient directory data from GET /hospital/panel/insurance/patients?status=PendingApproval
  const fetchDirectory = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await HospitalAPI.getPatientsDirectory({
        tab: activeTab,
        status: activeTab === 'Insured' ? 'PendingApproval' : undefined,
        page: currentPage,
        limit: 10,
        search: searchQuery
      });
      if (response.success) {
        setPatients(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalRecords(response.totalRecords || response.total || response.count || (response.data ? response.data.length : 0));
      } else {
        setErrorMessage(response.message || 'Failed to retrieve directory records.');
      }
    } catch (error) {
      setErrorMessage(error?.message || 'Failed to fetch patient records.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, currentPage, searchQuery]);

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  // Handle Tab Switching
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setCurrentPage(1);
    setPatients([]);
  };

  // Handle search with local trigger
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
            {/* Tabs Selector */}
            <div className="flex border border-slate-200 rounded-lg p-1 bg-white max-w-sm w-full">
              <button
                onClick={() => handleTabChange('Insured')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'Insured'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Insured Queue
              </button>
              <button
                onClick={() => handleTabChange('Un-Insured')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'Un-Insured'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Un-Insured
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4.5 w-4.5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search patient, policy or phone..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
              />
            </div>
          </div>

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
                <p className="text-xs text-slate-400 mt-1">Try switching tabs or refining your search parameters.</p>
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
                  {patients.map((patient) => {
                    // Extract data considering nested "insurance" object per Endpoint 1 docs
                    const insObj = patient.insurance || patient.insuranceDetails || {};

                    const patientName = patient.patientName || patient.name || 'Unknown Patient';
                    const patientPhone = patient.phone || 'N/A';
                    const bookingId = patient.bookingId || patient.latestAppointment?.bookingId || patient.appointmentId || patient._id;
                    const appointmentId = patient.appointmentId || patient.latestAppointment?.appointmentId || patient.latestAppointment?._id || patient._id;
                    
                    const company = insObj.companyName || patient.companyName || 'N/A';
                    const policyNo = insObj.insuranceNumber || patient.insuranceNumber || 'N/A';
                    const planType = insObj.insuranceType || patient.insuranceType || 'Cashless Mediclaim';

                    const approvalStatus = insObj.approvalStatus || patient.approvalStatus || patient.latestAppointment?.approvalStatus || 'Pending';
                    const approvalPdf = insObj.approvalLetterPdf || patient.approvalLetterPdf || patient.latestAppointment?.approvalLetterPdf;

                    const frontCard = insObj.cardFront || insObj.insuranceDocumentFront || patient.cardFront;
                    const backCard = insObj.cardBack || insObj.insuranceDocumentBack || patient.cardBack;

                    return (
                      <tr key={patient.appointmentId || patient._id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Patient Info Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={patient.profilePic || 'https://via.placeholder.com/150'}
                              alt={patientName}
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                              className="h-10 w-10 rounded-full border border-slate-200 object-cover bg-slate-100"
                            />
                            <div>
                              <div className="font-semibold text-slate-900">{patientName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                ID: {bookingId}
                              </div>
                              <div className="text-[11px] text-slate-500">{patientPhone}</div>
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
                              {(frontCard || backCard) && (
                                <button
                                  type="button"
                                  onClick={() => setCardPreviewModal({
                                    isOpen: true,
                                    front: frontCard ? `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${frontCard}` : '',
                                    back: backCard ? `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${backCard}` : '',
                                    title: `${patientName}'s Insurance Cards`
                                  })}
                                  className="mt-1 text-[11px] text-[#08B36A] font-bold hover:underline inline-flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" /> View Cards
                                </button>
                              )}
                            </td>

                            {/* Ward & Bed Allocation */}
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-800">{patient.wardName || 'General Ward'}</div>
                              <div className="text-xs text-slate-500">{patient.bedNumber || 'Bed Unassigned'}</div>
                              {patient.bookingType && (
                                <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 rounded">
                                  {patient.bookingType}
                                </span>
                              )}
                            </td>

                            {/* Admission & TPA Approval Workflow Status */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1.5 items-start">
                                {approvalStatus === 'Approved' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" /> Approved
                                  </span>
                                ) : approvalStatus === 'Rejected' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                    Rejected
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                                    Pending Approval
                                  </span>
                                )}
                              </div>
                            </td>
                          </>
                        ) : (
                          /* Uninsured Content: Contact Details */
                          <td className="px-6 py-4">
                            <div className="text-slate-700 font-medium">{patientPhone}</div>
                            <div className="text-xs text-slate-400">{patient.email || 'N/A'}</div>
                          </td>
                        )}

                        {/* Table Actions block */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {activeTab === 'Un-Insured' ? (
                              <button
                                onClick={() => openInsuranceModal(patient)}
                                className="inline-flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 transition-colors text-xs font-semibold px-3 py-2 rounded-lg shadow-sm"
                              >
                                <Plus className="h-3.5 w-3.5" /> Add Insurance
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => openInsuranceModal(patient)}
                                  className="text-slate-700 hover:bg-slate-100 transition-colors text-xs font-semibold border border-slate-300 px-2.5 py-1.5 rounded-lg"
                                >
                                  Edit Policy
                                </button>

                                {approvalStatus === 'Approved' && approvalPdf ? (
                                  <a
                                    href={`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${approvalPdf}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" /> View Letter
                                  </a>
                                ) : (
                                  <button
                                    onClick={() => openApprovalModal({
                                      appointmentId: appointmentId,
                                      bookingId: bookingId
                                    })}
                                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm"
                                  >
                                    <Upload className="h-3.5 w-3.5" /> Upload Approval
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
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-600 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-600 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Insurance Form Config Modal */}
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

      {/* Dynamic Approval Letter Upload Modal */}
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

      {/* Card Preview Modal */}
      {cardPreviewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">{cardPreviewModal.title}</h3>
              <button 
                onClick={() => setCardPreviewModal({ isOpen: false, front: '', back: '', title: '' })}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"
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

    const front = insObj.cardFront || insObj.insuranceDocumentFront || patient.cardFront;
    const back = insObj.cardBack || insObj.insuranceDocumentBack || patient.cardBack;

    if (front) {
      setFrontPreview(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${front}`);
    }
    if (back) {
      setBackPreview(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${back}`);
    }
  }, [patient]);

  // Load Dropdowns from GET /hospital/panel/insurance/master-data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const response = await HospitalAPI.getMasterDropdownData();
        if (response.success) {
          const compList = response.companies || response.data?.insuranceProviders || [];
          const typeList = response.types || response.data?.insuranceTypes || [];
          setCompanies(compList);
          setTypes(typeList);

          // Default fallback selection for types
          if (!insuranceType && typeList.length > 0) {
            setInsuranceType(typeof typeList[0] === 'string' ? typeList[0] : typeList[0].name);
          }
        } else {
          setSubmitError(response.message || 'Could not fetch dropdown resources.');
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

    // Require front and back files if not already uploaded
    const insObj = patient.insurance || patient.insuranceDetails || {};
    const hasFrontExisting = insObj.cardFront || insObj.insuranceDocumentFront || patient.cardFront;
    const hasBackExisting = insObj.cardBack || insObj.insuranceDocumentBack || patient.cardBack;

    if (!frontFile && !hasFrontExisting) {
      return setSubmitError('Please upload the Front Card image/PDF.');
    }
    if (!backFile && !hasBackExisting) {
      return setSubmitError('Please upload the Back Card image/PDF.');
    }

    setIsSaving(true);

    try {
      const payload = new FormData();
      // Multipart keys matching Endpoint 2 documentation
      payload.append('companyName', companyName.trim());
      payload.append('insuranceNumber', insuranceNumber.trim());
      payload.append('insuranceType', insuranceType);

      if (frontFile) {
        payload.append('insuranceDocumentFront', frontFile);
      }
      if (backFile) {
        payload.append('insuranceDocumentBack', backFile);
      }

      // Resolve patientUserId per PUT /hospital/panel/insurance/save/:patientUserId
      const patientUserId = patient.patientUserId || patient.userId || patient._id || patient.appointmentId;
      const result = await HospitalAPI.saveInsuranceDetails(patientUserId, payload);
      
      if (result.success) {
        onSuccess();
      } else {
        setSubmitError(result.message || 'Failed to save patient insurance details.');
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
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          {submitError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-3 text-rose-850 text-xs animate-shake">
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
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all font-medium"
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
                  placeholder="e.g. HDFC-POL-984021"
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
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none bg-white focus:ring-2 focus:ring-slate-900 font-medium"
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
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow"
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
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 shadow"
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
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || isLoadingDropdowns}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
 * Modal Sub-Component: TPA Approval Letter Upload Workflow (PUT /hospital/panel/insurance/upload-approval-letter/:appointmentId)
 */
function UploadApprovalLetterModal({ appointment, onClose, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Target ID resolved per Endpoint: /hospital/panel/insurance/upload-approval-letter/:appointmentId
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
    if (!selectedFile) {
      setErrorMessage('Please attach the approval letter file (PDF or Image).');
      return;
    }

    if (!appointmentId) {
      setErrorMessage('Invalid appointment reference ID.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      const payload = new FormData();
      // Multipart Field: approvalLetterPdf (PDF/Image file)
      payload.append('approvalLetterPdf', selectedFile);

      const response = await HospitalAPI.uploadApprovalLetter(appointmentId, payload);
      if (response.success) {
        onSuccess();
      } else {
        setErrorMessage(response.message || 'Failed to submit authorization letter.');
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
            <h2 className="text-base font-bold text-slate-900">Upload Pre-Auth Approval Letter</h2>
            <p className="text-xs text-slate-500 mt-0.5">Booking ID: <span className="font-mono font-semibold text-slate-700">{appointment.bookingId || appointmentId}</span></p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
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

          <div className="border border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50/50 relative hover:bg-slate-100/50 transition-all">
            {selectedFile ? (
              <div className="text-center space-y-2 w-full">
                {previewUrl ? (
                  <div className="w-full h-32 rounded-lg overflow-hidden border border-slate-200 mb-2">
                    <img src={previewUrl} alt="Letter preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                )}
                <div className="text-xs font-semibold text-slate-800 break-all">{selectedFile.name}</div>
                <div className="text-[10px] text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline mt-1"
                >
                  Remove & Replace
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center text-center p-4 w-full">
                <Upload className="h-8 w-8 text-indigo-500 mb-2.5" />
                <span className="text-xs font-semibold text-slate-700">Attach TPA Pre-Auth Letter</span>
                <span className="text-[10px] text-slate-400 mt-1">PDF or Image document up to 10MB</span>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            * Submitting the approval document updates the admission status to &apos;Approved&apos; and confirms cashless coverage.
          </p>
        </form>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isUploading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUploadSubmit}
            disabled={isUploading || !selectedFile}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
              </>
            ) : (
              'Upload & Confirm'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}