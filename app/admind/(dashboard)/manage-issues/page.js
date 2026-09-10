"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ClipboardList, Search, Edit3, Trash2, CheckCircle2, 
  Clock, AlertCircle, RefreshCw, X, ChevronLeft, ChevronRight, 
  Loader2, Check, ArrowLeft, Tag, Calendar, AlertTriangle, Eye, 
  ExternalLink, Globe, Smartphone, Laptop, Layers
} from 'lucide-react';
import AdminAPI from '@/app/services/AdminAPI2';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://hk-backend-9jm8.onrender.com';

export default function ManageIssuesPage() {
  const [issues, setIssues] = useState([]);
  const [overview, setOverview] = useState({
    totalOpen: 0,
    totalInProgress: 0,
    totalResolved: 0,
    totalWebIssues: 0,
    totalAppIssues: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  
  // 4.1 Query Filters & Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [platformFilter, setPlatformFilter] = useState('All'); // 'All' | 'Web' | 'App' | 'Android' | 'iOS'
  const [reporterModelFilter, setReporterModelFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('');

  // 4.2 Update Status Modal State
  const [statusModalData, setStatusModalData] = useState(null);
  const [newStatus, setNewStatus] = useState('IN PROGRESS');
  const [statusNote, setStatusNote] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // View Details Modal State
  const [viewDetailItem, setViewDetailItem] = useState(null);

  // Toast
  const [alertBanner, setAlertBanner] = useState(null);

  const showAlert = (message, type = 'success') => {
    setAlertBanner({ message, type });
    setTimeout(() => setAlertBanner(null), 4000);
  };

  const getFullAttachmentUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanBase = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  };

  // Helper for platform badges and icons
  const getPlatformBadge = (platform) => {
    const p = platform?.toLowerCase() || 'web';
    if (p.includes('web')) {
      return (
        <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[10px] uppercase">
          <Globe size={11} className="text-indigo-600" /> Web Browser
        </span>
      );
    }
    if (p.includes('android')) {
      return (
        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] uppercase">
          <Smartphone size={11} className="text-emerald-600" /> Android App
        </span>
      );
    }
    if (p.includes('ios')) {
      return (
        <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[10px] uppercase">
          <Smartphone size={11} className="text-slate-800" /> iOS App
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded text-[10px] uppercase">
        <Smartphone size={11} className="text-purple-600" /> Mobile App
      </span>
    );
  };

  // =========================================================================
  // 4.1 FETCH ISSUES (GET /admin/issues)
  // =========================================================================
  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        ...(search.trim() && { search: search.trim() }),
        ...(statusFilter !== 'All' && { status: statusFilter }),
        ...(platformFilter !== 'All' && { platform: platformFilter }),
        ...(reporterModelFilter !== 'All' && { reporterModel: reporterModelFilter }),
        ...(categoryFilter.trim() && { category: categoryFilter.trim() }),
      };

      const res = await AdminAPI.getIssuesList(params);
      if (res.data?.success || res.status === 200) {
        setIssues(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalRecords(res.data.totalRecords || res.data.data?.length || 0);
        if (res.data.overview) {
          setOverview(res.data.overview);
        }
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to load issues registry', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, statusFilter, platformFilter, reporterModelFilter, categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchIssues();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchIssues]);

  // =========================================================================
  // 4.2 UPDATE STATUS (PATCH /admin/issues/update-status/:id)
  // =========================================================================
  const handleOpenStatusModal = (issue) => {
    setStatusModalData(issue);
    setNewStatus(issue.status || 'IN PROGRESS');
    setStatusNote('');
    setResolutionNote('');
  };

  const handleStatusModalSubmit = async (e) => {
    e.preventDefault();
    if (!statusModalData?._id) return;

    setStatusSubmitting(true);
    try {
      const payload = {
        status: newStatus,
        note: statusNote.trim() || `Status updated to ${newStatus}`,
        resolutionNote: newStatus === 'RESOLVED' ? (resolutionNote.trim() || '') : ''
      };

      const res = await AdminAPI.updateIssueStatus(statusModalData._id, payload);
      showAlert(res.data?.message || `Issue status updated to ${newStatus}!`, 'success');
      setStatusModalData(null);
      fetchIssues();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to update issue status', 'error');
    } finally {
      setStatusSubmitting(false);
    }
  };

  // =========================================================================
  // 4.3 QUICK RESOLVE (PATCH /admin/issues/resolve/:id)
  // =========================================================================
  const handleQuickResolve = async (issueId) => {
    try {
      setActionLoadingId(issueId);
      const res = await AdminAPI.resolveIssue(issueId);
      showAlert(res.data?.message || 'Issue marked as RESOLVED by Super Admin.', 'success');
      fetchIssues();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to resolve issue', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // =========================================================================
  // 4.4 DELETE ISSUE (DELETE /admin/issues/delete/:id)
  // =========================================================================
  const handleDeleteIssue = async (issueId, displayId) => {
    if (!confirm(`Are you sure you want to delete Issue ${displayId || ''}?`)) return;
    try {
      setActionLoadingId(issueId);
      const res = await AdminAPI.deleteIssue(issueId);
      showAlert(res.data?.message || 'Issue deleted successfully.');
      fetchIssues();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to delete issue', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">RESOLVED</span>;
      case 'IN PROGRESS':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide uppercase bg-amber-50 text-amber-700 border border-amber-200">IN PROGRESS</span>;
      case 'OPEN':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-200">OPEN</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide uppercase bg-rose-50 text-rose-700 border border-rose-200">REJECTED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide uppercase bg-slate-100 text-slate-700 border border-slate-200">{status || 'OPEN'}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-slate-100 text-slate-600 border border-slate-200">{priority || 'Low'}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Global Toast Alert */}
        {alertBanner && (
          <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-lg animate-in fade-in duration-200 ${
            alertBanner.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}>
            <div className="flex items-center gap-2">
              {alertBanner.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{alertBanner.message}</span>
            </div>
            <button onClick={() => setAlertBanner(null)}><X size={16} /></button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-2.5 rounded-xl shadow-sm transition"
              title="Go Back"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <ClipboardList className="text-indigo-600" size={28} /> System Issue Registry & Incident Support
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Track issues across Web browsers & Mobile applications with origin diagnostic tags.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={fetchIssues}
              disabled={loading}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-600' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* 4.1 Overview KPI Cards (Including Web vs App Counts) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Open</span>
              <h3 className="text-2xl font-black text-blue-600 mt-1">{overview.totalOpen || 0}</h3>
              <span className="text-[10px] text-slate-400">Pending Review</span>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <AlertTriangle size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Progress</span>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{overview.totalInProgress || 0}</h3>
              <span className="text-[10px] text-amber-600/80">Troubleshooting</span>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resolved</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{overview.totalResolved || 0}</h3>
              <span className="text-[10px] text-emerald-600/80">Closed by Admin</span>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Web Issues</span>
              <h3 className="text-2xl font-black text-indigo-600 mt-1">{overview.totalWebIssues || 0}</h3>
              <span className="text-[10px] text-indigo-600/80">Browser Portal</span>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Globe size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">App Issues</span>
              <h3 className="text-2xl font-black text-purple-600 mt-1">{overview.totalAppIssues || 0}</h3>
              <span className="text-[10px] text-purple-600/80">iOS & Android</span>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Smartphone size={20} />
            </div>
          </div>
        </div>

        {/* 4.1 Search & Multi-Filters (With Platform Filter) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search Title, Category, TicketId..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="IN PROGRESS">IN PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          {/* Platform Filter (Web vs Mobile App vs Android vs iOS) */}
          <select
            value={platformFilter}
            onChange={(e) => { setPlatformFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
          >
            <option value="All">All Platforms (Web & App)</option>
            <option value="Web">🌐 Web Browser</option>
            <option value="App">📱 Mobile App</option>
            <option value="Android">🤖 Android</option>
            <option value="iOS">🍎 iOS</option>
          </select>

          {/* Reporter Role Filter */}
          <select
            value={reporterModelFilter}
            onChange={(e) => { setReporterModelFilter(e.target.value); setCurrentPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
          >
            <option value="All">All Reporter Roles</option>
            <option value="User">Patient / User</option>
            <option value="Doctor">Doctor</option>
            <option value="Hospital">Hospital Admin</option>
            <option value="Lab">Lab Provider</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Ambulance">Ambulance Driver</option>
            <option value="Nurse">Nurse</option>
          </select>

          {/* Custom Category Input Filter */}
          <input
            type="text"
            placeholder="Filter by custom category..."
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* 4.1 Issues Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-xs border-separate border-spacing-y-2 px-4 py-2">
              <thead>
                <tr className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                  <th className="px-5 py-2">ID & Ticket #</th>
                  <th className="px-5 py-2">Platform / Environment</th>
                  <th className="px-5 py-2">Category & Priority</th>
                  <th className="px-5 py-2">Issue Title & Details</th>
                  <th className="px-5 py-2">Reporter</th>
                  <th className="px-5 py-2">Date</th>
                  <th className="px-5 py-2">Status</th>
                  <th className="px-5 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-20 text-slate-400 font-bold">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
                      Loading incident records...
                    </td>
                  </tr>
                ) : issues.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-20 text-slate-400 font-bold">
                      No issues found matching the query criteria.
                    </td>
                  </tr>
                ) : (
                  issues.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-all">
                      {/* Display ID & Ticket ID */}
                      <td className="bg-slate-50/60 py-3.5 px-5 rounded-l-2xl">
                        <div className="font-black text-slate-900 text-sm">{item.displayId || `#${item.issueNumber || 1}`}</div>
                        <span className="text-[10px] text-slate-400 font-mono block">{item.ticketId || item._id?.slice(-8)}</span>
                      </td>

                      {/* 📍 Platform & App/Browser Version (Where the issue happened) */}
                      <td className="bg-slate-50/60 py-3.5 px-5">
                        <div>{getPlatformBadge(item.platform)}</div>
                        <span className="text-[10px] text-slate-400 font-mono block mt-1 truncate max-w-[130px]" title={item.appVersion}>
                          {item.appVersion || 'Web / Browser'}
                        </span>
                      </td>

                      {/* Category & Priority */}
                      <td className="bg-slate-50/60 py-3.5 px-5">
                        <span className="font-bold text-slate-800 text-[11px] block truncate max-w-[140px] mb-1" title={item.category}>
                          {item.category || 'General'}
                        </span>
                        <div>{getPriorityBadge(item.priority)}</div>
                      </td>

                      {/* Title & Description */}
                      <td className="bg-slate-50/60 py-3.5 px-5 max-w-xs">
                        <div className="font-bold text-slate-900 text-sm">{item.title}</div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate" title={item.detailedDescription}>
                          {item.detailedDescription || 'No details provided.'}
                        </p>
                      </td>

                      {/* Reporter Profile */}
                      <td className="bg-slate-50/60 py-3.5 px-5">
                        <div className="font-bold text-slate-800">{item.reporter?.name || 'Anonymous'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {item.reporter?.role ? `[${item.reporter.role}] ` : ''}{item.reporter?.phone || item.reporter?.email || ''}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="bg-slate-50/60 py-3.5 px-5 text-slate-500 font-medium">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400" />
                          <span>{item.loggedDateFormatted || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A')}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="bg-slate-50/60 py-3.5 px-5">
                        {getStatusBadge(item.status)}
                        {item.resolvedByAdmin && (
                          <span className="text-[9px] text-slate-400 block font-mono mt-0.5">By: {item.resolvedByAdmin}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="bg-slate-50/60 py-3.5 px-5 text-right rounded-r-2xl">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Dossier Details Modal */}
                          <button
                            onClick={() => setViewDetailItem(item)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition shadow-sm"
                            title="View Diagnostic Dossier & Audit Timeline"
                          >
                            <Eye size={13} />
                          </button>

                          {/* 4.2 Update Status */}
                          <button
                            onClick={() => handleOpenStatusModal(item)}
                            className="p-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl font-bold transition shadow-sm"
                            title="Update Status"
                          >
                            <Edit3 size={13} />
                          </button>

                          {/* 4.3 1-Click Quick Resolve */}
                          {item.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleQuickResolve(item._id)}
                              disabled={actionLoadingId === item._id}
                              className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50"
                              title="1-Click Quick Resolve"
                            >
                              {actionLoadingId === item._id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                            </button>
                          )}

                          {/* 4.4 Delete */}
                          <button
                            onClick={() => handleDeleteIssue(item._id, item.displayId)}
                            disabled={actionLoadingId === item._id}
                            className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50"
                            title="Delete Issue"
                          >
                            <Trash2 size={13} />
                          </button>
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
            <span>Total Tickets: {totalRecords} | Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition"
              >
                <ChevronLeft size={14} />
              </button>
              <span>{currentPage}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-30 transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4.2 UPDATE STATUS MODAL */}
        {/* ========================================================================= */}
        {statusModalData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Edit3 className="text-indigo-600" size={18} /> Update Status: {statusModalData.displayId || statusModalData.ticketId}
                </h3>
                <button onClick={() => setStatusModalData(null)}><X size={18} /></button>
              </div>

              <form onSubmit={handleStatusModalSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold outline-none"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Timeline Progress Note</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Progress updates sent via push alert..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium outline-none"
                  />
                </div>

                {newStatus === 'RESOLVED' && (
                  <div>
                    <label className="block font-bold text-slate-600 uppercase mb-1">Resolution Summary Note</label>
                    <input
                      type="text"
                      placeholder="e.g. Bug fixed in storage pipeline. Prescriptions uploading smoothly."
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium outline-none"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStatusModalData(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={statusSubmitting}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md inline-flex items-center gap-2"
                  >
                    {statusSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
                    Save Status Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DOSSIER & AUDIT TIMELINE MODAL */}
        {/* ========================================================================= */}
        {viewDetailItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white sticky top-0 z-10">
                <div>
                  <h3 className="font-bold text-base">Issue Diagnostic Dossier</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Ticket: {viewDetailItem.ticketId || viewDetailItem.displayId}</span>
                </div>
                <button onClick={() => setViewDetailItem(null)}><X size={18} /></button>
              </div>

              <div className="p-6 space-y-6 text-xs">
                {/* Header Summary with Platform origin */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-black text-slate-900">{viewDetailItem.title}</h4>
                      <p className="text-slate-600 text-xs mt-1">{viewDetailItem.detailedDescription || 'No description provided.'}</p>
                    </div>
                    {getStatusBadge(viewDetailItem.status)}
                  </div>
                  
                  {/* Origin Diagnostics */}
                  <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-3 text-slate-600 font-bold">
                    <span>Platform: <strong>{getPlatformBadge(viewDetailItem.platform)}</strong></span>
                    <span>Version / Browser: <strong className="font-mono text-slate-900">{viewDetailItem.appVersion || 'Web Portal / Desktop'}</strong></span>
                    <span>Category: <strong>{viewDetailItem.category}</strong></span>
                    <span>Priority: {getPriorityBadge(viewDetailItem.priority)}</span>
                  </div>
                </div>

                {/* Reporter Details */}
                {viewDetailItem.reporter && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Reporter Information</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>Name: <strong className="text-slate-900">{viewDetailItem.reporter.name}</strong></div>
                      <div>Role: <strong className="text-indigo-600">{viewDetailItem.reporter.role}</strong></div>
                      {viewDetailItem.reporter.phone && <div>Phone: <strong className="font-mono">{viewDetailItem.reporter.phone}</strong></div>}
                      {viewDetailItem.reporter.email && <div>Email: <strong>{viewDetailItem.reporter.email}</strong></div>}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Audit Resolution Timeline</span>
                  {viewDetailItem.timeline && viewDetailItem.timeline.length > 0 ? (
                    <div className="space-y-3 relative border-l-2 border-slate-200 ml-3 pl-4">
                      {viewDetailItem.timeline.map((entry, idx) => (
                        <div key={idx} className="relative space-y-0.5">
                          <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full absolute -left-[21px] top-1" />
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{entry.status}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''}
                            </span>
                          </div>
                          <p className="text-slate-600">{entry.note}</p>
                          {entry.updatedByName && (
                            <span className="text-[10px] text-indigo-600 font-bold block">
                              Updated By: {entry.updatedByName} ({entry.updatedByRole || 'Admin'})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic p-3 bg-slate-50 rounded-xl">No timeline records.</p>
                  )}
                </div>

                {/* Attachments */}
                {viewDetailItem.attachments && viewDetailItem.attachments.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Uploaded Error Attachments</span>
                    <div className="flex flex-wrap gap-2">
                      {viewDetailItem.attachments.map((img, i) => (
                        <a key={i} href={getFullAttachmentUrl(img)} target="_blank" rel="noreferrer" className="w-24 h-24 rounded-xl border border-slate-200 overflow-hidden block hover:scale-105 transition shadow-sm">
                          <img src={getFullAttachmentUrl(img)} alt="Attachment" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button onClick={() => setViewDetailItem(null)} className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}