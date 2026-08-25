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
  CheckCircle2
} from 'lucide-react';
import HospitalAPI from '../../../services/HospitalAPI'; // Ensure this contains the new uploadApprovalLetter call

export default function InsuranceTpaDesk() {
  // State for Directory List
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState('Un-Insured'); // "Un-Insured" or "Insured"
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

  // Load patient directory data
  const fetchDirectory = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await HospitalAPI.getPatientsDirectory({
        tab: activeTab,
        page: currentPage,
        limit: 10,
        search: searchQuery
      });
      if (response.success) {
        setPatients(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalRecords(response.totalRecords || 0);
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
                onClick={() => handleTabChange('Un-Insured')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'Un-Insured'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Un-Insured
              </button>
              <button
                onClick={() => handleTabChange('Insured')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'Insured'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Insured
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4.5 w-4.5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search patient or phone..."
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
                        <th className="px-6 py-3.5">Admission & Approval Status</th>
                      </>
                    ) : (
                      <th className="px-6 py-3.5">Contact Details</th>
                    )}
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Patient Info Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={patient.profilePic || 'https://via.placeholder.com/150'}
                            alt={patient.name}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                            className="h-10 w-10 rounded-full border border-slate-200 object-cover bg-slate-100"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">{patient.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">UID: {patient._id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Dynamic middle column alignment based on active tab */}
                      {activeTab === 'Insured' ? (
                        <>
                          {/* Insurance Coverage Info */}
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-800">
                              {patient.insuranceDetails?.companyName || 'N/A'}
                            </div>
                            <div className="text-xs text-slate-500">
                              No: <span className="font-mono text-slate-700">{patient.insuranceDetails?.insuranceNumber || 'N/A'}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {patient.insuranceType || patient.insuranceDetails?.insuranceType || 'Plan Type N/A'}
                            </div>
                          </td>

                          {/* Admission & TPA Approval Workflow Status */}
                          <td className="px-6 py-4">
                            {patient.latestAppointment ? (
                              <div className="space-y-1.5">
                                <div className="text-xs">
                                  <span className="font-semibold text-slate-700">ID:</span>{' '}
                                  <span className="font-mono text-slate-600">{patient.latestAppointment.bookingId}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Appointment Status Badge */}
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                                    patient.latestAppointment.appointmentStatus === 'Confirmed'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                      : 'bg-amber-50 text-amber-700 border-amber-100'
                                  }`}>
                                    {patient.latestAppointment.appointmentStatus}
                                  </span>

                                  {/* TPA Authorization Badge */}
                                  {patient.latestAppointment.approvalStatus === 'Approved' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-850 border border-emerald-200">
                                      Approved
                                    </span>
                                  ) : patient.latestAppointment.approvalStatus === 'Rejected' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                      Rejected
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-850 border border-amber-200 animate-pulse">
                                      Approval Pending
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">No Active Admission Link</span>
                            )}
                          </td>
                        </>
                      ) : (
                        /* Uninsured Content: Contact Details */
                        <td className="px-6 py-4">
                          <div className="text-slate-700 font-medium">{patient.phone}</div>
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

                              {/* TPA Approval Decisions */}
                              {patient.latestAppointment && (
                                <>
                                  {patient.latestAppointment.approvalStatus === 'Approved' ? (
                                    patient.latestAppointment.approvalLetterPdf && (
                                      <a
                                        href={`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${patient.latestAppointment.approvalLetterPdf}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors"
                                      >
                                        <ExternalLink className="h-3.5 w-3.5" /> View PDF
                                      </a>
                                    )
                                  ) : (
                                    <button
                                      onClick={() => openApprovalModal(patient.latestAppointment)}
                                      className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm"
                                    >
                                      <Upload className="h-3.5 w-3.5" /> Upload Letter
                                    </button>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
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
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-600 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
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
    </div>
  );
}

/**
 * Modal Sub-Component: Policy Form configuration
 */
function AddInsuranceModal({ patient, onClose, onSuccess }) {
  const [dropdowns, setDropdowns] = useState({ insuranceTypes: [], insuranceProviders: [] });
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
  const [submitError, setSubmitError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields State
  const [insuranceNumber, setInsuranceNumber] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [insuranceType, setInsuranceType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dual File Upload State & Previews
  const [frontFile, setFrontFile] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  // Prefill fields if modifying existing configuration
  useEffect(() => {
    if (patient.insuranceDetails?.hasInsurance) {
      setInsuranceNumber(patient.insuranceDetails.insuranceNumber || '');
      setInsuranceType(patient.insuranceDetails.insuranceType || '');
      setStartDate(patient.insuranceDetails.startDate || '');
      setEndDate(patient.insuranceDetails.endDate || '');
      
      if (patient.insuranceDetails.insuranceDocumentFront) {
        setFrontPreview(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${patient.insuranceDetails.insuranceDocumentFront}`);
      }
      if (patient.insuranceDetails.insuranceDocumentBack) {
        setBackPreview(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${patient.insuranceDetails.insuranceDocumentBack}`);
      }
    }
  }, [patient]);

  // Load dropdown resources
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const response = await HospitalAPI.getMasterDropdownData();
        if (response.success) {
          setDropdowns(response.data);
          
          // Match and prefill provider if editing
          if (patient.insuranceDetails?.companyName && response.data.insuranceProviders) {
            const matchedProvider = response.data.insuranceProviders.find(
              p => p.insuranceName === patient.insuranceDetails.companyName
            );
            if (matchedProvider) {
              setSelectedProviderId(matchedProvider._id);
            }
          }

          if (!insuranceType && response.data.insuranceTypes?.length > 0) {
            setInsuranceType(response.data.insuranceTypes[0].name);
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

  // Clean up Object URL instances
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

    if (!insuranceNumber.trim()) return setSubmitError('Please enter a policy number.');
    if (!selectedProviderId) return setSubmitError('Please select an insurance company.');
    if (!insuranceType) return setSubmitError('Please select a coverage type.');
    if (!startDate) return setSubmitError('Please provide a policy start date.');
    if (!endDate) return setSubmitError('Please provide a policy end date.');
    
    // Require new files only if we do not already have existing records in preview
    if (!frontFile && !patient.insuranceDetails?.insuranceDocumentFront) {
      return setSubmitError('Front card image upload is required.');
    }
    if (!backFile && !patient.insuranceDetails?.insuranceDocumentBack) {
      return setSubmitError('Back card image upload is required.');
    }

    const selectedProvider = dropdowns.insuranceProviders.find(p => p._id === selectedProviderId);
    const companyName = selectedProvider ? selectedProvider.insuranceName : '';

    setIsSaving(true);

    try {
      const payload = new FormData();
      payload.append('insuranceNumber', insuranceNumber);
      payload.append('companyName', companyName);
      payload.append('insuranceType', insuranceType);
      payload.append('startDate', startDate);
      payload.append('endDate', endDate);
      payload.append('masterInsuranceId', selectedProviderId);
      
      if (frontFile) {
        payload.append('insuranceDocumentFront', frontFile);
      }
      if (backFile) {
        payload.append('insuranceDocumentBack', backFile);
      }

      const result = await HospitalAPI.saveInsuranceDetails(patient._id, payload);
      if (result.success) {
        onSuccess();
      } else {
        setSubmitError(result.message || 'Failed to preserve patient details configuration.');
      }
    } catch (err) {
      setSubmitError(err?.message || 'Error occurred while saving insurance parameters.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Block */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Configure Health Insurance Policy</h2>
            <p className="text-xs text-slate-500 mt-0.5">Linking record profile for: <span className="font-semibold text-slate-700">{patient.name}</span></p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic Modal Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          {submitError && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-3 text-rose-850 text-xs animate-shake">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500" />
              <span>{submitError}</span>
            </div>
          )}

          {isLoadingDropdowns ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
              <span className="text-xs text-slate-500">Loading dropdown directory assets...</span>
            </div>
          ) : (
            <>
              {/* Form Input fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Insurance policy unique reference code */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Insurance Policy ID (Unique Number)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INS-000001"
                    value={insuranceNumber}
                    onChange={(e) => setInsuranceNumber(e.target.value)}
                    className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                  />
                </div>

                {/* Dynamic selection mapped via API dropdown options */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Health Insurance Company Name</label>
                  <select
                    required
                    value={selectedProviderId}
                    onChange={(e) => setSelectedProviderId(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                  >
                    <option value="">Select Insurer Provider</option>
                    {dropdowns.insuranceProviders?.map((provider) => (
                      <option key={provider._id} value={provider._id}>
                        {provider.insuranceName} ({provider.provider})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Insurance Type Dynamic Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 block">Type of Insurance Plan</label>
                  <select
                    required
                    value={insuranceType}
                    onChange={(e) => setInsuranceType(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white focus:ring-2 focus:ring-slate-900"
                  >
                    {dropdowns.insuranceTypes?.map((type) => (
                      <option key={type._id} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dates Selector block */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 block">Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

              </div>

              {/* Upload sections for dynamic documents */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-slate-600 block">Upload Card Certifications (Front & Back Cover Card)</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Front document upload block */}
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
                        <span className="text-xs font-semibold text-slate-700">Policy Card (Front-Side)</span>
                        <span className="text-[10px] text-slate-400 mt-1">Image or document up to 5MB</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFrontFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Back document upload block */}
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
                        <span className="text-xs font-semibold text-slate-700">Policy Card (Back-Side)</span>
                        <span className="text-[10px] text-slate-400 mt-1">Image or document up to 5MB</span>
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

        {/* Modal Operations Actions Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-850 transition-colors bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
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
                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              'Save Insurance Details'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

/**
 * Modal Sub-Component: TPA Approval Letter PDF Upload Workflow
 */
function UploadApprovalLetterModal({ appointment, onClose, onSuccess }) {
  const [pdfFile, setPdfFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setErrorMessage('Only authorized PDF configuration files are allowed.');
        return;
      }
      setPdfFile(file);
      setErrorMessage('');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      setErrorMessage('Please select a valid PDF file authorization to proceed.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      const payload = new FormData();
      payload.append('approvalLetterPdf', pdfFile);

      const response = await HospitalAPI.uploadApprovalLetter(appointment.appointmentId, payload);
      if (response.success) {
        onSuccess();
      } else {
        setErrorMessage(response.message || 'Failed to submit authorization letter.');
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Error occurred while connecting to the file distribution system.');
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
            <h2 className="text-base font-bold text-slate-900">Upload TPA Approval Letter</h2>
            <p className="text-xs text-slate-500 mt-0.5">Booking ID: <span className="font-mono font-semibold text-slate-700">{appointment.bookingId}</span></p>
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
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-2.5 text-rose-850 text-xs">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="border border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50/50 relative hover:bg-slate-100/50 transition-all">
            {pdfFile ? (
              <div className="text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <div className="text-xs font-semibold text-slate-800 break-all">{pdfFile.name}</div>
                <div className="text-[10px] text-slate-400">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</div>
                <button
                  type="button"
                  onClick={() => setPdfFile(null)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline mt-1"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center text-center p-4 w-full">
                <Upload className="h-8 w-8 text-indigo-500 mb-2.5" />
                <span className="text-xs font-semibold text-slate-700">Attach TPA Authorization Letter</span>
                <span className="text-[10px] text-slate-400 mt-1">PDF document only, up to 10MB</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            * Submitting the approval document updates the admission status to &apos;Confirmed&apos; and reserves the patient bed.
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
            disabled={isUploading || !pdfFile}
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