"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
  HeartPulse, Stethoscope, Search, RefreshCw, Eye, Check, Ban, 
  CheckCircle2, XCircle, Clock, Calendar, Phone, Mail, 
  MapPin, ShieldCheck, AlertCircle, FileText, X, ChevronLeft, 
  ChevronRight, Loader2, Sparkles, Tag, Layers, Package, 
  User, DollarSign, Image as ImageIcon, ExternalLink, ArrowLeft
} from 'lucide-react';
import AdminAPI from '@/app/services/AdminAPI2'; // Or AdminAPI

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5002';

const getAuthHeaders = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) return { Authorization: `Bearer ${token}` };
  }
  return {};
};

export default function NursingServicesPage() {
  const [activeTab, setActiveTab] = useState('services'); // 'services' | 'packages'

  // =========================================================================
  // 1. NURSE SERVICES STATE (Section 4)
  // =========================================================================
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicePage, setServicePage] = useState(1);
  const [serviceTotalPages, setServiceTotalPages] = useState(1);
  const [serviceTotalItems, setServiceTotalItems] = useState(0);

  // Service Filters
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceStatusFilter, setServiceStatusFilter] = useState('All');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('All');

  // =========================================================================
  // 2. NURSE PACKAGES STATE (Section 5)
  // =========================================================================
  const [packages, setPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [packagePage, setPackagePage] = useState(1);
  const [packageTotalPages, setPackageTotalPages] = useState(1);
  const [packageTotalItems, setPackageTotalItems] = useState(0);

  // Package Filters
  const [packageSearch, setPackageSearch] = useState('');
  const [packageStatusFilter, setPackageStatusFilter] = useState('All');

  // =========================================================================
  // MODALS & ACTIONS
  // =========================================================================
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModalType, setDetailModalType] = useState('service'); // 'service' | 'package'

  const [confirmModal, setConfirmModal] = useState({ show: false, action: '', item: null, targetType: 'service' });
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Toast
  const [alertBanner, setAlertBanner] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlertBanner({ message, type });
    setTimeout(() => setAlertBanner(null), 4500);
  };

  // --- Safe API Fallbacks ---
  const callGetServicesAPI = async (params) => {
    if (typeof AdminAPI?.getNurseServices === 'function') {
      return await AdminAPI.getNurseServices(params);
    }
    return await axios.get(`${BACKEND_URL}/admin/nurse/services`, {
      params,
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
    });
  };

  const callUpdateServiceStatusAPI = async (id, data) => {
    if (typeof AdminAPI?.updateNurseServiceStatus === 'function') {
      return await AdminAPI.updateNurseServiceStatus(id, data);
    }
    return await axios.patch(`${BACKEND_URL}/admin/nurse/services/status/${id}`, data, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
    });
  };

  const callGetPackagesAPI = async (params) => {
    if (typeof AdminAPI?.getNursePackages === 'function') {
      return await AdminAPI.getNursePackages(params);
    }
    return await axios.get(`${BACKEND_URL}/admin/nurse/packages`, {
      params,
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
    });
  };

  const callUpdatePackageStatusAPI = async (id, data) => {
    if (typeof AdminAPI?.updateNursePackageStatus === 'function') {
      return await AdminAPI.updateNursePackageStatus(id, data);
    }
    return await axios.patch(`${BACKEND_URL}/admin/nurse/packages/status/${id}`, data, {
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
    });
  };

  // --- Fetch Services (4.1) ---
  const fetchServices = useCallback(async () => {
    setServicesLoading(true);
    try {
      const params = {
        page: servicePage,
        limit: 15,
        ...(serviceSearch.trim() && { search: serviceSearch.trim() }),
        ...(serviceStatusFilter !== 'All' && { status: serviceStatusFilter }),
        ...(serviceTypeFilter !== 'All' && { type: serviceTypeFilter }),
      };

      const res = await callGetServicesAPI(params);
      if (res.data?.success || res.status === 200) {
        setServices(res.data.data || []);
        setServiceTotalPages(res.data.totalPages || 1);
        setServiceTotalItems(res.data.totalItems || res.data.count || 0);
      }
    } catch (err) {
      console.error('Error fetching nurse services:', err);
      showAlert(err.response?.data?.message || 'Failed to load nurse services', 'error');
    } finally {
      setServicesLoading(false);
    }
  }, [servicePage, serviceSearch, serviceStatusFilter, serviceTypeFilter]);

  // --- Fetch Packages (5.1) ---
  const fetchPackages = useCallback(async () => {
    setPackagesLoading(true);
    try {
      const params = {
        page: packagePage,
        limit: 15,
        ...(packageSearch.trim() && { search: packageSearch.trim() }),
        ...(packageStatusFilter !== 'All' && { status: packageStatusFilter }),
      };

      const res = await callGetPackagesAPI(params);
      if (res.data?.success || res.status === 200) {
        setPackages(res.data.data || []);
        setPackageTotalPages(res.data.totalPages || 1);
        setPackageTotalItems(res.data.totalItems || res.data.count || 0);
      }
    } catch (err) {
      console.error('Error fetching nurse packages:', err);
      showAlert(err.response?.data?.message || 'Failed to load nurse packages', 'error');
    } finally {
      setPackagesLoading(false);
    }
  }, [packagePage, packageSearch, packageStatusFilter]);

  useEffect(() => {
    if (activeTab === 'services') {
      const timer = setTimeout(() => fetchServices(), 350);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => fetchPackages(), 350);
      return () => clearTimeout(timer);
    }
  }, [activeTab, fetchServices, fetchPackages]);

  // --- Approve / Reject Handlers (4.2 & 5.2) ---
  const handleActionConfirm = async () => {
    const { action, item, targetType } = confirmModal;
    if (!item?._id) return;

    setActionLoading(true);
    try {
      const payload = {
        status: action === 'Approve' ? 'Approved' : 'Rejected',
        ...(action === 'Reject' && { rejectionReason: rejectionReason.trim() }),
      };

      if (targetType === 'service') {
        const res = await callUpdateServiceStatusAPI(item._id, payload);
        showAlert(res.data?.message || `Nurse service ${payload.status.toLowerCase()} successfully!`);
        fetchServices();
      } else {
        const res = await callUpdatePackageStatusAPI(item._id, { ...payload, isActive: action === 'Approve' });
        showAlert(res.data?.message || `Nurse package ${payload.status.toLowerCase()} successfully!`);
        fetchPackages();
      }

      setConfirmModal({ show: false, action: '', item: null, targetType: 'service' });
      setRejectionReason('');
      if (selectedItem?._id === item._id) setSelectedItem(null);
    } catch (err) {
      console.error('Action error:', err);
      showAlert(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">Approved</span>;
      case 'Rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Toast Alert */}
        {alertBanner && (
          <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md animate-in fade-in duration-200 ${
            alertBanner.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}>
            <div className="flex items-center gap-2">
              {alertBanner.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{alertBanner.message}</span>
            </div>
            <button onClick={() => setAlertBanner(null)}><X size={16} /></button>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <HeartPulse className="text-pink-600" size={30} /> Nursing Services & Clinical Bundles
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and approve daily nursing procedures, consumables usage, and multi-service care packages.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => { if (activeTab === 'services') fetchServices(); else fetchPackages(); }}
              disabled={servicesLoading || packagesLoading}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={servicesLoading || packagesLoading ? 'animate-spin text-pink-600' : ''} /> Refresh
            </button>
            <button
              onClick={() => window.history.back()}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition uppercase"
            >
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('services')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'services'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Stethoscope size={15} /> Daily Care & Clinical Procedures ({serviceTotalItems})
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'packages'
                ? 'border-pink-600 text-pink-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Package size={15} /> Multi-Service Bundle Packages ({packageTotalItems})
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: NURSE SERVICES (DAILY CARE) */}
        {/* ========================================================================= */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search service title..."
                  value={serviceSearch}
                  onChange={(e) => { setServiceSearch(e.target.value); setServicePage(1); }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none"
                />
              </div>

              <select
                value={serviceStatusFilter}
                onChange={(e) => { setServiceStatusFilter(e.target.value); setServicePage(1); }}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="All">All Verification Statuses</option>
                <option value="Pending">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={serviceTypeFilter}
                onChange={(e) => { setServiceTypeFilter(e.target.value); setServicePage(1); }}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Daily Care">Daily Care</option>
                <option value="Package">Package Service</option>
              </select>
            </div>

            {/* Services Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-xs border-separate border-spacing-y-2 px-4 py-2">
                  <thead>
                    <tr className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                      <th className="px-5 py-2">Service Title</th>
                      <th className="px-5 py-2">Nurse Provider</th>
                      <th className="px-5 py-2">Category / Sub-category</th>
                      <th className="px-5 py-2">Pricing Tiers</th>
                      <th className="px-5 py-2">Status</th>
                      <th className="px-5 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servicesLoading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-20 text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-pink-600" />
                            <span className="font-bold">Loading nurse services...</span>
                          </div>
                        </td>
                      </tr>
                    ) : services.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-20 text-slate-400 font-bold">
                          No nurse services found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      services.map((srv) => (
                        <tr key={srv._id} className="hover:bg-slate-50/80 transition-all">
                          <td className="bg-slate-50/60 py-3.5 px-5 rounded-l-2xl">
                            <div className="font-bold text-slate-900 text-sm">{srv.title}</div>
                            <span className="text-[10px] text-pink-600 font-extrabold uppercase mt-0.5 block">{srv.type}</span>
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5">
                            <div className="font-bold text-slate-800">{srv.nurseId?.name || 'Assigned Nurse'}</div>
                            <div className="text-[11px] text-slate-500 font-mono">📞 +91 {srv.nurseId?.phone} • {srv.nurseId?.city}</div>
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5">
                            <div className="font-bold text-slate-800">{srv.careSubCategoryId?.subCategory || srv.careSubCategoryId?.category || 'General Nursing'}</div>
                            <span className="text-[10px] text-slate-400 truncate block max-w-xs">{srv.procedureIncluded}</span>
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5 font-mono font-bold text-slate-900">
                            <div>1-Day: ₹{srv.pricing?.oneDay?.final || srv.pricing?.oneDay?.base || 0}</div>
                            <span className="text-[10px] text-slate-500 font-normal">Hourly: ₹{srv.pricing?.hourly?.final || 0}</span>
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5">
                            {getStatusBadge(srv.status)}
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5 text-right rounded-r-2xl">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => { setSelectedItem(srv); setDetailModalType('service'); }}
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition shadow-sm"
                                title="Inspect Service Details"
                              >
                                <Eye size={13} />
                              </button>

                              {srv.status !== 'Approved' && (
                                <button
                                  onClick={() => setConfirmModal({ show: true, action: 'Approve', item: srv, targetType: 'service' })}
                                  className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-xl font-bold transition shadow-sm"
                                  title="Approve Service"
                                >
                                  <Check size={13} />
                                </button>
                              )}

                              {srv.status !== 'Rejected' && (
                                <button
                                  onClick={() => setConfirmModal({ show: true, action: 'Reject', item: srv, targetType: 'service' })}
                                  className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl font-bold transition shadow-sm"
                                  title="Reject Service"
                                >
                                  <Ban size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Total Services: {serviceTotalItems} | Page {servicePage} of {serviceTotalPages}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setServicePage(p => Math.max(1, p - 1))}
                    disabled={servicePage === 1 || servicesLoading}
                    className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-30"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span>{servicePage}</span>
                  <button
                    onClick={() => setServicePage(p => Math.min(serviceTotalPages, p + 1))}
                    disabled={servicePage === serviceTotalPages || servicesLoading}
                    className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-30"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: NURSE PACKAGES (BUNDLES) */}
        {/* ========================================================================= */}
        {activeTab === 'packages' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search package bundle name..."
                  value={packageSearch}
                  onChange={(e) => { setPackageSearch(e.target.value); setPackagePage(1); }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none"
                />
              </div>

              <select
                value={packageStatusFilter}
                onChange={(e) => { setPackageStatusFilter(e.target.value); setPackagePage(1); }}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Approval</option>
                <option value="Approved">Approved Bundles</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Packages Table */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left text-xs border-separate border-spacing-y-2 px-4 py-2">
                  <thead>
                    <tr className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                      <th className="px-5 py-2">Package Bundle Name</th>
                      <th className="px-5 py-2">Nurse Bureau</th>
                      <th className="px-5 py-2">Included Services</th>
                      <th className="px-5 py-2">Pricing Structure</th>
                      <th className="px-5 py-2">Status</th>
                      <th className="px-5 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packagesLoading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-20 text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-pink-600" />
                            <span className="font-bold">Loading care bundles...</span>
                          </div>
                        </td>
                      </tr>
                    ) : packages.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-20 text-slate-400 font-bold">
                          No multi-service nurse packages found.
                        </td>
                      </tr>
                    ) : (
                      packages.map((pkg) => (
                        <tr key={pkg._id} className="hover:bg-slate-50/80 transition-all">
                          <td className="bg-slate-50/60 py-3.5 px-5 rounded-l-2xl">
                            <div className="font-bold text-slate-900 text-sm">{pkg.packageName}</div>
                            <p className="text-[11px] text-slate-500 max-w-xs truncate mt-0.5">{pkg.description}</p>
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5">
                            <div className="font-bold text-slate-800">{pkg.nurseId?.name || 'Nurse Bureau'}</div>
                            <div className="text-[11px] text-slate-500 font-mono">📞 +91 {pkg.nurseId?.phone} • {pkg.nurseId?.city}</div>
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5">
                            <span className="bg-pink-50 text-pink-700 px-2.5 py-1 rounded-lg border border-pink-100 font-bold">
                              {pkg.includedServices?.length || 0} Clinical Services Included
                            </span>
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5 font-mono font-bold text-slate-900">
                            <div>1-Day: ₹{pkg.pricing?.oneDay?.final || pkg.pricing?.oneDay?.base || 0}</div>
                            <span className="text-[10px] text-slate-500 font-normal">Multiple Days: ₹{pkg.pricing?.multipleDays?.final || 0}</span>
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5">
                            {getStatusBadge(pkg.status)}
                          </td>

                          <td className="bg-slate-50/60 py-3.5 px-5 text-right rounded-r-2xl">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => { setSelectedItem(pkg); setDetailModalType('package'); }}
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition shadow-sm"
                                title="Inspect Package Details"
                              >
                                <Eye size={13} />
                              </button>

                              {pkg.status !== 'Approved' && (
                                <button
                                  onClick={() => setConfirmModal({ show: true, action: 'Approve', item: pkg, targetType: 'package' })}
                                  className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-xl font-bold transition shadow-sm"
                                  title="Approve Package"
                                >
                                  <Check size={13} />
                                </button>
                              )}

                              {pkg.status !== 'Rejected' && (
                                <button
                                  onClick={() => setConfirmModal({ show: true, action: 'Reject', item: pkg, targetType: 'package' })}
                                  className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl font-bold transition shadow-sm"
                                  title="Reject Package"
                                >
                                  <Ban size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Total Packages: {packageTotalItems} | Page {packagePage} of {packageTotalPages}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPackagePage(p => Math.max(1, p - 1))}
                    disabled={packagePage === 1 || packagesLoading}
                    className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-30"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span>{packagePage}</span>
                  <button
                    onClick={() => setPackagePage(p => Math.min(packageTotalPages, p + 1))}
                    disabled={packagePage === packageTotalPages || packagesLoading}
                    className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-30"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* INSPECTION MODAL */}
        {/* ========================================================================= */}
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white sticky top-0 z-10">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <HeartPulse className="text-pink-400" size={18} />
                    {detailModalType === 'service' ? 'Nurse Service Details' : 'Care Bundle Package Audit'}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {selectedItem._id}</span>
                </div>
                <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6 text-xs">
                {/* Nurse Provider */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Authorized Nurse Provider</span>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-black text-slate-900">{selectedItem.nurseId?.name}</h4>
                      <p className="text-slate-500 font-mono text-[11px]">📞 +91 {selectedItem.nurseId?.phone} • {selectedItem.nurseId?.email}</p>
                      <p className="text-pink-600 font-bold text-[11px] mt-0.5">{selectedItem.nurseId?.speciality} ({selectedItem.nurseId?.city})</p>
                    </div>
                    {getStatusBadge(selectedItem.status)}
                  </div>
                </div>

                {/* Service Details */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    {detailModalType === 'service' ? selectedItem.title : selectedItem.packageName}
                  </h4>
                  <p className="text-slate-600 leading-relaxed">{selectedItem.description}</p>
                </div>

                {/* Pricing Tiers Table */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Approved Pricing Structure</span>
                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">1-Day Rate</span>
                      <span className="text-sm font-black text-slate-900">₹{selectedItem.pricing?.oneDay?.final || 0}</span>
                      <span className="text-[9px] text-slate-400 block line-through">Base: ₹{selectedItem.pricing?.oneDay?.base || 0}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Multi-Day Daily</span>
                      <span className="text-sm font-black text-slate-900">₹{selectedItem.pricing?.multipleDays?.final || 0}</span>
                      <span className="text-[9px] text-slate-400 block line-through">Base: ₹{selectedItem.pricing?.multipleDays?.base || 0}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Hourly Rate</span>
                      <span className="text-sm font-black text-slate-900">₹{selectedItem.pricing?.hourly?.final || 0}</span>
                      <span className="text-[9px] text-slate-400 block line-through">Base: ₹{selectedItem.pricing?.hourly?.base || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Consumables Used */}
                {selectedItem.consumablesUsed && selectedItem.consumablesUsed.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Medical Consumables Included</span>
                    <div className="space-y-1.5">
                      {selectedItem.consumablesUsed.map((c, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                          <span className="font-bold text-slate-800">{c.masterItemId?.itemName} ({c.masterItemId?.size || 'Standard'})</span>
                          <span className="font-mono font-bold text-emerald-700">₹{c.finalPrice} ({c.discountPercentage}% off)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="flex gap-2">
                  {selectedItem.status !== 'Approved' && (
                    <button
                      onClick={() => setConfirmModal({ show: true, action: 'Approve', item: selectedItem, targetType: detailModalType })}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold inline-flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Check size={14} /> Approve
                    </button>
                  )}
                  {selectedItem.status !== 'Rejected' && (
                    <button
                      onClick={() => setConfirmModal({ show: true, action: 'Reject', item: selectedItem, targetType: detailModalType })}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold inline-flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Ban size={14} /> Reject
                    </button>
                  )}
                </div>
                <button onClick={() => setSelectedItem(null)} className="px-5 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CONFIRM APPROVE / REJECT MODAL */}
        {/* ========================================================================= */}
        {confirmModal.show && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className={`p-2.5 rounded-2xl ${confirmModal.action === 'Approve' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {confirmModal.action === 'Approve' ? <CheckCircle2 size={24} /> : <Ban size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{confirmModal.action} Nurse {confirmModal.targetType === 'service' ? 'Service' : 'Package'}</h3>
                  <p className="text-xs text-slate-500">{confirmModal.item?.title || confirmModal.item?.packageName}</p>
                </div>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <p className="text-slate-600 font-medium">
                  Are you sure you want to <strong>{confirmModal.action.toLowerCase()}</strong> this clinical offering?
                </p>

                {confirmModal.action === 'Reject' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Reason for Rejection (Required)</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Pricing is higher than platform benchmark standard."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConfirmModal({ show: false, action: '', item: null, targetType: 'service' })}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleActionConfirm}
                  className={`px-5 py-2 text-white rounded-xl font-bold shadow-md transition inline-flex items-center gap-1.5 disabled:opacity-50 ${
                    confirmModal.action === 'Approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                  Confirm {confirmModal.action}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}