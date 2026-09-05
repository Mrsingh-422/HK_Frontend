'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Radio,
  Truck,
  PhoneCall,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  ShieldAlert,
} from 'lucide-react';
import AdminAPI2 from '@/app/services/AdminAPI2';


export default function AmbulanceBreakdownsPage() {
  const [fleet, setFleet] = useState([]);
  const [stats, setStats] = useState({ total: 0, online: 0, busy: 0 });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // --- Re-assign Breakdown Modal State ---
  const [reassignModal, setReassignModal] = useState({
    isOpen: false,
    bookingId: '',
    previousAmbulanceName: '',
  });
  const [reassignForm, setReassignForm] = useState({
    newAmbulanceId: '',
    reason: '',
  });

  // --- 108 Manual Dispatch Modal State ---
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchForm, setDispatchForm] = useState({
    patientName: '',
    patientPhone: '',
    pickupAddress: '',
    pickupLat: '',
    pickupLng: '',
    ambulanceId: '',
    emergencyDescription: '',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [alertBanner, setAlertBanner] = useState(null);

  // 1. Fetch Fleet Data (GET /admin/ambulance/live-fleet)
  const fetchFleet = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI2.getAmbulanceLiveFleet();
      if (res.data?.success) {
        setFleet(res.data.data || []);
        setStats({
          total: res.data.totalAmbulances || 0,
          online: res.data.onlineCount || 0,
          busy: res.data.busyCount || 0,
        });
      }
    } catch (err) {
      showAlert('Failed to load live fleet information.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
    // Auto-refresh fleet every 30 seconds
    const interval = setInterval(fetchFleet, 30000);
    return () => clearInterval(interval);
  }, []);

  const showAlert = (message, type = 'success') => {
    setAlertBanner({ message, type });
    setTimeout(() => setAlertBanner(null), 5000);
  };

  // 2. Handle Reassign Submit (PATCH /admin/ambulance/reassign-booking/:bookingId)
  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!reassignForm.newAmbulanceId || !reassignForm.reason) {
      alert('Please select a new ambulance and provide a reason.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await AdminAPI2.reassignAmbulanceBooking(reassignModal.bookingId, {
        newAmbulanceId: reassignForm.newAmbulanceId,
        reason: reassignForm.reason,
      });

      if (res.data?.success) {
        showAlert(res.data.message || 'Ambulance successfully reassigned!', 'success');
        setReassignModal({ isOpen: false, bookingId: '', previousAmbulanceName: '' });
        setReassignForm({ newAmbulanceId: '', reason: '' });
        fetchFleet();
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to reassign ambulance.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Handle Manual 108 Dispatch (POST /admin/ambulance/dispatch-call)
  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...dispatchForm,
        pickupLat: dispatchForm.pickupLat ? Number(dispatchForm.pickupLat) : 0,
        pickupLng: dispatchForm.pickupLng ? Number(dispatchForm.pickupLng) : 0,
      };

      const res = await AdminAPI2.dispatchEmergencyCall(payload);
      if (res.data?.success || res.status === 200 || res.status === 201) {
        showAlert('108 Emergency call dispatched successfully!', 'success');
        setDispatchModalOpen(false);
        setDispatchForm({
          patientName: '',
          patientPhone: '',
          pickupAddress: '',
          pickupLat: '',
          pickupLng: '',
          ambulanceId: '',
          emergencyDescription: '',
        });
        fetchFleet();
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Error creating dispatch order.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter List Logic
  const filteredFleet = fleet.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.activeTrip?.bookingId?.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'BUSY') return matchesSearch && item.dutyStatus?.toLowerCase().includes('busy');
    if (statusFilter === 'AVAILABLE') return matchesSearch && item.dutyStatus?.toLowerCase().includes('available');
    return matchesSearch;
  });

  const availableAmbulances = fleet.filter(
    (a) => !a.dutyStatus?.toLowerCase().includes('busy')
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800">
      {/* Alert Notification */}
      {alertBanner && (
        <div
          className={`mb-5 p-4 rounded-xl flex items-center justify-between text-sm font-medium transition-all shadow-sm ${
            alertBanner.type === 'error'
              ? 'bg-rose-100 text-rose-800 border border-rose-200'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}
        >
          <span>{alertBanner.message}</span>
          <button onClick={() => setAlertBanner(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600 rounded-lg text-white shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Ambulance Command Center & Breakdowns
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time fleet monitoring, vehicle breakdown reassignments, and 108 emergency call dispatches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFleet}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-xl shadow-sm hover:bg-slate-50 text-sm font-semibold transition disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-600' : 'text-slate-600'}`} />
            Refresh Fleet
          </button>

          <button
            onClick={() => setDispatchModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow font-semibold text-sm transition active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            108 Emergency Dispatch
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Fleet</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.total}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Online / Active</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.online}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Radio className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Busy / On Trip</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{stats.busy}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Ready</p>
            <h3 className="text-2xl font-black text-slate-700 mt-1">
              {Math.max(stats.online - stats.busy, 0)}
            </h3>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search driver, vehicle no, booking ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none transition"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {['ALL', 'BUSY', 'AVAILABLE'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition ${
                statusFilter === filter
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Live Fleet & Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5">Ambulance Details</th>
                <th className="py-4 px-5">Vehicle Type</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Active Trip Info</th>
                <th className="py-4 px-5">Current GPS</th>
                <th className="py-4 px-5 text-right">Breakdown Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFleet.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400 text-sm">
                    {loading ? 'Fetching live fleet data...' : 'No ambulances found matching your filters.'}
                  </td>
                </tr>
              ) : (
                filteredFleet.map((ambulance) => {
                  const isBusy = ambulance.dutyStatus?.toLowerCase().includes('busy');
                  return (
                    <tr key={ambulance._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900">{ambulance.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{ambulance.vehicleNumber}</div>
                      </td>

                      <td className="py-4 px-5">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                          {ambulance.vehicleType || 'Standard'}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isBusy
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isBusy ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                            }`}
                          />
                          {ambulance.dutyStatus}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        {ambulance.activeTrip?.bookingId ? (
                          <div>
                            <span className="font-mono text-xs font-semibold text-slate-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              {ambulance.activeTrip.bookingId}
                            </span>
                            <div className="text-xs text-slate-500 mt-1">
                              {ambulance.activeTrip.serviceType} &bull;{' '}
                              <span className="font-medium text-slate-700">{ambulance.activeTrip.status}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Idle / No active trip</span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        {ambulance.location?.lat && ambulance.location?.lng ? (
                          <span className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {ambulance.location.lat.toFixed(4)}, {ambulance.location.lng.toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">GPS Unavailable</span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        {ambulance.activeTrip?.bookingId ? (
                          <button
                            onClick={() => {
                              setReassignModal({
                                isOpen: true,
                                bookingId: ambulance.activeTrip.bookingId,
                                previousAmbulanceName: ambulance.name,
                              });
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold shadow-sm transition active:scale-95"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            Force Re-Assign
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: FORCE RE-ASSIGN AMBULANCE (BREAKDOWNS) */}
      {/* ========================================================================= */}
      {reassignModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-100 rounded-xl text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Ambulance Breakdown Dispatch</h3>
                  <p className="text-xs text-slate-500">
                    Booking: <span className="font-mono font-bold text-slate-800">{reassignModal.bookingId}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReassignModal({ isOpen: false, bookingId: '', previousAmbulanceName: '' })}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Available Replacement Ambulance <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={reassignForm.newAmbulanceId}
                  onChange={(e) => setReassignForm({ ...reassignForm, newAmbulanceId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="">-- Choose Available Ambulance --</option>
                  {availableAmbulances.map((amb) => (
                    <option key={amb._id} value={amb._id}>
                      {amb.name} ({amb.vehicleNumber}) - {amb.vehicleType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason for Breakdown / Note <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={reassignForm.reason}
                  onChange={(e) => setReassignForm({ ...reassignForm, reason: e.target.value })}
                  placeholder="e.g. Previous ambulance vehicle breakdown near Phase 7, engine overheated..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                ⚠️ Re-assigning will instantly notify the new driver, update the patient tracking screen, and send a newly synchronized OTP.
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReassignModal({ isOpen: false, bookingId: '', previousAmbulanceName: '' })}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow transition disabled:opacity-50"
                >
                  {actionLoading ? 'Re-assigning...' : 'Confirm Re-Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: 108 EMERGENCY MANUAL DISPATCH */}
      {/* ========================================================================= */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-100 rounded-xl text-red-600">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">108 Emergency Direct Dispatch</h3>
                  <p className="text-xs text-slate-500">Operator direct phone booking & immediate fleet dispatch</p>
                </div>
              </div>
              <button
                onClick={() => setDispatchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.patientName}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, patientName: e.target.value })}
                    placeholder="e.g. Kuldeep Singh"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Patient Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={dispatchForm.patientPhone}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, patientPhone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pickup Address / Landmark <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={dispatchForm.pickupAddress}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, pickupAddress: e.target.value })}
                  placeholder="e.g. Near Landran Chowk, Kharar"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Pickup Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={dispatchForm.pickupLat}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, pickupLat: e.target.value })}
                    placeholder="30.6942"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Pickup Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={dispatchForm.pickupLng}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, pickupLng: e.target.value })}
                    placeholder="76.6651"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assign Ambulance <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={dispatchForm.ambulanceId}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, ambulanceId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="">-- Choose Ambulance to Dispatch --</option>
                  {fleet.map((amb) => (
                    <option key={amb._id} value={amb._id}>
                      {amb.name} ({amb.vehicleNumber}) - [{amb.dutyStatus}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Emergency Description
                </label>
                <textarea
                  rows={2}
                  value={dispatchForm.emergencyDescription}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, emergencyDescription: e.target.value })}
                  placeholder="e.g. Highway car collision, unconscious patient..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDispatchModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow transition disabled:opacity-50"
                >
                  {actionLoading ? 'Dispatching...' : 'Dispatch Immediately'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}