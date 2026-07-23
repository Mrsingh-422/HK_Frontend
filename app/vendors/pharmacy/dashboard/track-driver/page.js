'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FaArrowLeft, 
  FaPhoneAlt, 
  FaUser, 
  FaUndo, 
  FaTimes, 
  FaTruck, 
  FaMapMarkerAlt, 
  FaCheck, 
  FaCheckCircle, 
  FaSpinner, 
  FaInfoCircle,
  FaExclamationTriangle 
} from 'react-icons/fa'
import PharmacyVendorAPI from '@/app/services/PharmacyVendorAPI'

export default function TrackPharmacyDrivers() {
  const router = useRouter()
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Modal States
  const [selectedDriverDetails, setSelectedDriverDetails] = useState(null) // Active tracking modal (Modal 1)
  const [reassignTarget, setReassignTarget] = useState(null) // Active reassignment modal (Modal 2)
  const [selectedNewDriverId, setSelectedNewDriverId] = useState('')
  const [reassignLoading, setReassignLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  // Fetch all drivers from API
  const fetchDrivers = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!PharmacyVendorAPI || typeof PharmacyVendorAPI.trackPharmacyDrivers !== 'function') {
        throw new Error('PharmacyVendorAPI module is not fully loaded. Verify path is correct.')
      }

      const res = await PharmacyVendorAPI.trackPharmacyDrivers()
      if (res && res.success) {
        // Sort drivers so those with "Busy" status appear at the top
        const sortedDrivers = (res.data || []).sort((a, b) => {
          if (a.status === 'Busy' && b.status !== 'Busy') return -1
          if (a.status !== 'Busy' && b.status === 'Busy') return 1
          return 0
        })

        setDrivers(sortedDrivers)
        
        // Update details modal dynamically if open
        if (selectedDriverDetails) {
          const updated = sortedDrivers.find(d => d._id === selectedDriverDetails._id)
          if (updated) setSelectedDriverDetails(updated)
        }
      } else {
        setError(res?.message || 'Failed to fetch pharmacy drivers.')
      }
    } catch (err) {
      console.error('Fetch Drivers Error:', err)
      setError(err.message || err.response?.data?.message || 'Error occurred while loading drivers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  // Action: Open Tracking/Details Modal
  const handleOpenTracking = (driver) => {
    setSelectedDriverDetails(driver)
  }

  // Action: Trigger Reassignment setup (Open 2nd modal)
  const initReassignment = (orderId, currentDriverId) => {
    setReassignTarget({ orderId, currentDriverId })
    setSelectedNewDriverId('')
  }

  // Action: Submit reassignment API call
  const handleReassign = async () => {
    if (!reassignTarget || !selectedNewDriverId) return

    try {
      setReassignLoading(true)
      const res = await PharmacyVendorAPI.reassignDriver(reassignTarget.orderId, selectedNewDriverId)
      if (res && res.success) {
        showStatusNotification('success', res.message || 'Order reassigned successfully.')
        
        // Reset modal layers
        setReassignTarget(null)
        setSelectedDriverDetails(null) 
        
        // Refresh live stats
        fetchDrivers() 
      } else {
        showStatusNotification('error', res?.message || 'Failed to reassign driver.')
      }
    } catch (err) {
      console.error(err)
      showStatusNotification('error', err.response?.data?.message || 'Server error occurred during reassignment.')
    } finally {
      setReassignLoading(false)
    }
  }

  const showStatusNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  // Filter available drivers for dropdown options (Excludes current busy driver)
  const availableDrivers = drivers.filter(
    (drv) => drv.status === 'Available' && drv._id !== reassignTarget?.currentDriverId
  )

  // Dynamic Time Offsets Generator (Calculates steps based on real order dispatch date)
  const getFormattedOffsetTime = (baseTimeStr, minutesToAdd) => {
    try {
      const date = new Date(baseTimeStr)
      if (isNaN(date.getTime())) return 'PENDING'
      date.setMinutes(date.getMinutes() + minutesToAdd)
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch (e) {
      return 'PENDING'
    }
  }

  // Map backend deliveryStatus enum to timeline steps
  const getTimelineSteps = (activeOrder) => {
    if (!activeOrder) return []
    const currentStatus = activeOrder.deliveryStatus || activeOrder.status
    const baseTime = activeOrder.createdAt

    const steps = [
      {
        title: 'Pending Assignment',
        desc: 'Awaiting allocation of a standby delivery driver.',
        time: getFormattedOffsetTime(baseTime, 0),
        key: 'PendingAssignment',
        status: 'pending'
      },
      {
        title: 'Assigned & Accepted',
        desc: 'Driver assigned and route accepted for pickup.',
        time: 'PENDING',
        key: 'Accepted',
        status: 'pending'
      },
      {
        title: 'Picked Up & In Transit',
        desc: 'Package picked up from pharmacy, currently on the road.',
        time: 'PENDING',
        key: 'Transit',
        status: 'pending'
      },
      {
        title: 'Reached Location',
        desc: 'Driver arrived at the customer destination coordinates.',
        time: 'PENDING',
        key: 'Reached',
        status: 'pending'
      },
      {
        title: 'Delivered',
        desc: 'Handoff finished, payment collected, and documentation closed.',
        time: 'PENDING',
        key: 'Delivered',
        status: 'pending'
      }
    ]

    // Determine state progression based on exact database enum values
    switch (currentStatus) {
      case 'PendingAssignment':
        steps[0].status = 'active'
        break
      case 'Assigned':
      case 'Accepted':
        steps[0].status = 'completed'
        steps[1].status = 'active'
        steps[1].time = getFormattedOffsetTime(baseTime, 10)
        break
      case 'PickedUp':
      case 'OutForDelivery':
        steps[0].status = 'completed'
        steps[1].status = 'completed'
        steps[1].time = getFormattedOffsetTime(baseTime, 10)
        steps[2].status = 'active'
        steps[2].time = getFormattedOffsetTime(baseTime, 25)
        break
      case 'ReachedLocation':
        steps[0].status = 'completed'
        steps[1].status = 'completed'
        steps[1].time = getFormattedOffsetTime(baseTime, 10)
        steps[2].status = 'completed'
        steps[2].time = getFormattedOffsetTime(baseTime, 25)
        steps[3].status = 'active'
        steps[3].time = getFormattedOffsetTime(baseTime, 35)
        break
      case 'Delivered':
        steps[0].status = 'completed'
        steps[1].status = 'completed'
        steps[1].time = getFormattedOffsetTime(baseTime, 10)
        steps[2].status = 'completed'
        steps[2].time = getFormattedOffsetTime(baseTime, 25)
        steps[3].status = 'completed'
        steps[3].time = getFormattedOffsetTime(baseTime, 35)
        steps[4].status = 'completed'
        steps[4].time = getFormattedOffsetTime(baseTime, 45)
        break
      case 'CancelledByDriver':
        steps[0].status = 'completed'
        steps[1].status = 'failed'
        steps[1].title = 'Cancelled by Driver'
        steps[1].desc = 'The delivery driver cancelled or abandoned the assignment.'
        steps[1].time = getFormattedOffsetTime(baseTime, 12)
        break
      case 'UserUnreachable':
        steps[0].status = 'completed'
        steps[1].status = 'completed'
        steps[1].time = getFormattedOffsetTime(baseTime, 10)
        steps[2].status = 'completed'
        steps[2].time = getFormattedOffsetTime(baseTime, 25)
        steps[3].status = 'failed'
        steps[3].title = 'User Unreachable'
        steps[3].desc = 'The driver reached the destination but the recipient is unreachable.'
        steps[3].time = getFormattedOffsetTime(baseTime, 35)
        break
      case 'UserRefused':
        steps[0].status = 'completed'
        steps[1].status = 'completed'
        steps[1].time = getFormattedOffsetTime(baseTime, 10)
        steps[2].status = 'completed'
        steps[2].time = getFormattedOffsetTime(baseTime, 25)
        steps[3].status = 'failed'
        steps[3].title = 'Delivery Refused'
        steps[3].desc = 'The recipient refused to accept the package.'
        steps[3].time = getFormattedOffsetTime(baseTime, 35)
        break
      default:
        steps[0].status = 'active'
        break
    }

    return steps
  }

  return (
    <div className="w-full p-4 md:p-8 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-2">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a8a] mb-1">
              Pharmacy Driver Management
            </h1>
            <p className="text-gray-500 text-xs md:text-sm">
              Live tracking interface, dispatch optimization, and fallback driver assignment.
            </p>
          </div>

          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-5 py-2 bg-[#08B36A] hover:bg-green-600 text-white font-medium rounded text-sm transition-colors shadow-sm"
          >
            <FaArrowLeft className="text-xs" /> Back
          </button>
        </div>

        {/* Floating Notification */}
        {notification && (
          <div className={`p-4 mb-4 rounded-lg border text-sm flex items-center gap-2 shadow-sm animate-pulse z-40 relative ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border-green-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <FaInfoCircle />
            <span>{notification.message}</span>
          </div>
        )}

        {/* Loading / Error States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-gray-200 shadow-xs">
            <FaSpinner className="animate-spin text-blue-600 text-3xl mb-3" />
            <p className="text-gray-500 text-sm font-medium">Fetching real-time driver coordinates...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white rounded-xl border border-gray-200 shadow-xs">
            <p className="text-red-500 font-semibold mb-3">{error}</p>
            <button 
              onClick={fetchDrivers}
              className="px-5 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm border border-blue-200 hover:bg-blue-100 transition-all font-medium"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div>
            {/* Realtime Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                  <FaUser className="text-lg" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Active Drivers</p>
                  <h3 className="text-xl font-bold text-gray-800">{drivers.length}</h3>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-50 text-[#08B36A]">
                  <FaCheckCircle className="text-lg" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Available Status</p>
                  <h3 className="text-xl font-bold text-green-700">
                    {drivers.filter(d => d.status === 'Available').length}
                  </h3>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 col-span-2 md:col-span-1">
                <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                  <FaTruck className="text-lg" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Currently Busy</p>
                  <h3 className="text-xl font-bold text-amber-600">
                    {drivers.filter(d => d.status === 'Busy').length}
                  </h3>
                </div>
              </div>
            </div>

            {/* Drivers Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Driver Details</th>
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Status</th>
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Vehicle Number</th>
                      <th className="px-6 py-4 font-bold whitespace-nowrap">Current Order Assignment</th>
                      <th className="px-6 py-4 font-bold whitespace-nowrap text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {drivers.map((driver) => {
                      const isBusy = driver.status === 'Busy'
                      const activeOrder = driver.currentActiveOrder

                      return (
                        <tr key={driver._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 bg-blue-50 text-[#1e3a8a] flex items-center justify-center font-bold">
                                {driver.profilePhoto ? (
                                  <img src={driver.profilePhoto} alt={driver.name} className="h-full w-full object-cover" />
                                ) : (
                                  driver.name ? driver.name.charAt(0) : 'D'
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{driver.name}</p>
                                <span className="text-gray-500 flex items-center gap-1.5 mt-0.5 text-xs">
                                  <FaPhoneAlt className="text-[10px]" /> {driver.phone || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${
                              isBusy 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-[#08B36A]/10 text-[#08B36A]'
                            }`}>
                              {driver.status || 'Available'}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                            {driver.vehicleNumber || (
                              <span className="text-gray-400 italic text-xs">Unspecified</span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {activeOrder ? (
                              <div className="flex flex-col">
                                <span className="font-bold text-[#1e3a8a]">{activeOrder.orderId}</span>
                                <span className="text-[11px] text-gray-400 mt-0.5">
                                  {activeOrder.deliveryStatus}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic text-xs">Standing By</span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <button 
                              onClick={() => handleOpenTracking(driver)}
                              className="px-4 py-1.5 bg-white text-gray-700 hover:text-[#08B36A] hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-green-200 text-xs font-medium transition shadow-xs inline-flex items-center gap-1.5"
                            >
                              <FaTruck className="text-[11px]" /> View & Track
                            </button>
                          </td>
                        </tr>
                      )
                    })}

                    {drivers.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-16 text-gray-400 font-medium">
                          No registered drivers found on this roster.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: GLOBAL VIEWPORT-COVERING DUAL-COLUMN LIVE STATUS MONITOR */}
        {selectedDriverDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 flex flex-col my-8">
              
              {/* Header (Branded Green) */}
              <div className="p-5 border-b border-gray-100 bg-[#08B36A] text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white/20 text-white rounded-full flex items-center justify-center font-bold overflow-hidden">
                    {selectedDriverDetails.profilePhoto ? (
                      <img src={selectedDriverDetails.profilePhoto} alt={selectedDriverDetails.name} className="h-full w-full object-cover" />
                    ) : (
                      selectedDriverDetails.name?.charAt(0)
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Live Driver Tracker</h2>
                    <p className="text-xs text-white/85">Operational Monitoring Console</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDriverDetails(null)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition text-gray-400"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Responsive Columns */}
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                
                {/* Left Column (Driver profile & Timeline Status) */}
                <div className="md:col-span-7 p-6 space-y-6">
                  
                  {/* Driver Header Information */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
                        {selectedDriverDetails.profilePhoto ? (
                          <img src={selectedDriverDetails.profilePhoto} alt={selectedDriverDetails.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg">
                            {selectedDriverDetails.name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{selectedDriverDetails.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="h-2 w-2 rounded-full bg-[#08B36A] animate-pulse"></span>
                          <span className="text-[10px] text-[#08B36A] font-bold uppercase tracking-wider">
                            {selectedDriverDetails.status === 'Busy' ? 'In Transit' : 'Online / Available'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium hidden sm:inline">{selectedDriverDetails.phone}</span>
                    </div>
                  </div>

                  {/* Vertical Timeline */}
                  <div>
                    <h4 className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-4 pl-1">Route Status Timeline</h4>
                    {selectedDriverDetails.status === 'Busy' && selectedDriverDetails.currentActiveOrder ? (
                      <div className="relative border-l-2 border-gray-100 space-y-5 ml-3 pl-6">
                        {getTimelineSteps(selectedDriverDetails.currentActiveOrder).map((step) => {
                          const isCompleted = step.status === 'completed'
                          const isActive = step.status === 'active'
                          const isFailed = step.status === 'failed'

                          return (
                            <div key={step.key} className="relative">
                              <span className={`absolute -left-[31px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                                isCompleted 
                                  ? 'bg-[#08B36A] border-[#08B36A] text-white' 
                                  : isActive 
                                    ? 'bg-white border-[#08B36A] text-[#08B36A]' 
                                    : isFailed
                                      ? 'bg-red-500 border-red-500 text-white'
                                      : 'bg-white border-gray-200 text-gray-300'
                              }`}>
                                {isCompleted ? (
                                  <FaCheck className="text-[9px]" />
                                ) : isFailed ? (
                                  <FaTimes className="text-[9px]" />
                                ) : (
                                  <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-[#08B36A] animate-ping' : 'bg-gray-300'}`}></span>
                                )}
                              </span>

                              <div className="flex justify-between items-start gap-4">
                                <div className="space-y-0.5">
                                  <h4 className={`text-sm font-bold tracking-tight ${
                                    isCompleted || isActive ? 'text-gray-900' : isFailed ? 'text-red-600' : 'text-gray-300'
                                  }`}>
                                    {step.title}
                                  </h4>
                                  <p className={`text-xs ${
                                    isCompleted || isActive ? 'text-gray-500 font-medium' : isFailed ? 'text-red-500 font-medium' : 'text-gray-300'
                                  }`}>
                                    {step.desc}
                                  </p>
                                  
                                  {isActive && (
                                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-50 border border-green-100 rounded-md text-[9px] font-extrabold text-[#08B36A] uppercase tracking-wider">
                                      ● Current State
                                    </span>
                                  )}

                                  {isFailed && (
                                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-red-50 border border-red-100 rounded-md text-[9px] font-bold text-red-600 uppercase tracking-wider">
                                      <FaExclamationTriangle className="text-[9px]" /> Failed Attempt
                                    </span>
                                  )}
                                </div>
                                <span className={`text-[10px] font-bold whitespace-nowrap uppercase tracking-wider ${
                                  isCompleted || isActive ? 'text-gray-400' : isFailed ? 'text-red-400' : 'text-gray-300'
                                }`}>
                                  {step.time}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center space-y-3 bg-gray-50 border rounded-xl">
                        <FaCheckCircle className="mx-auto text-[#08B36A] text-3xl" />
                        <h4 className="font-bold text-gray-800 text-sm">Standby State</h4>
                        <p className="text-xs text-gray-500 max-w-xs mx-auto">
                          Driver is waiting for active route assignments. No active timeline statistics.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column (Expanded Order summaries & details) */}
                <div className="md:col-span-5 p-6 bg-slate-50/50 space-y-5">
                  <h3 className="text-[#1E3A8A] text-xs font-bold uppercase tracking-wider">Order Specifications</h3>

                  {selectedDriverDetails.status === 'Busy' && selectedDriverDetails.currentActiveOrder ? (
                    <div className="space-y-4">
                      
                      {/* Technical Reference Box */}
                      <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-3 text-xs shadow-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Order ID:</span>
                          <span className="font-bold text-gray-800">#{selectedDriverDetails.currentActiveOrder.orderId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Created:</span>
                          <span className="font-semibold text-gray-800">
                            {new Date(selectedDriverDetails.currentActiveOrder.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Bill Amount:</span>
                          <span className="font-bold text-[#08B36A] bg-green-50 px-2.5 py-0.5 rounded">
                            ₹{selectedDriverDetails.currentActiveOrder.billSummary?.totalAmount ?? 0}
                          </span>
                        </div>
                        {/* Dynamic DB Enum Badge */}
                        <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                          <span className="text-gray-400">Database Status:</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-green-100 text-[#08B36A] border border-green-200">
                            {selectedDriverDetails.currentActiveOrder.deliveryStatus || selectedDriverDetails.currentActiveOrder.status}
                          </span>
                        </div>
                      </div>

                      {/* Recipient Details Card */}
                      <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-3.5 text-xs shadow-xs">
                        <span className="text-gray-400 block font-semibold uppercase tracking-wider text-[10px]">Recipient Details</span>
                        <div className="flex flex-col space-y-2.5">
                          
                          {/* Recipient Name & Address Type Badge */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                                <FaUser className="text-[10px]" />
                              </div>
                              <span className="font-bold text-gray-800 truncate">
                                {selectedDriverDetails.currentActiveOrder.address?.name || 'Customer'}
                              </span>
                            </div>
                            {selectedDriverDetails.currentActiveOrder.address?.addressType && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-100">
                                {selectedDriverDetails.currentActiveOrder.address.addressType}
                              </span>
                            )}
                          </div>

                          {/* Recipient Phone */}
                          {selectedDriverDetails.currentActiveOrder.address?.phone && (
                            <div className="flex items-center gap-2 text-gray-600 pl-0.5">
                              <FaPhoneAlt className="text-[#08B36A] text-[10px] flex-shrink-0" />
                              <span className="font-medium text-gray-700">
                                {selectedDriverDetails.currentActiveOrder.address.phone}
                              </span>
                            </div>
                          )}

                          {/* Dynamic Full Structured Address */}
                          <div className="flex items-start gap-2 text-gray-600 pl-0.5 pt-1 border-t border-gray-100/70">
                            <FaMapMarkerAlt className="text-[#08B36A] mt-0.5 flex-shrink-0 text-xs" />
                            <div className="leading-relaxed text-gray-700 space-y-0.5">
                              <p className="font-medium">
                                {selectedDriverDetails.currentActiveOrder.address?.houseNo && `House No. ${selectedDriverDetails.currentActiveOrder.address.houseNo}`}
                                {selectedDriverDetails.currentActiveOrder.address?.sector && `, Sector ${selectedDriverDetails.currentActiveOrder.address.sector}`}
                              </p>
                              {selectedDriverDetails.currentActiveOrder.address?.landmark && (
                                <p className="text-gray-500 italic">Landmark: {selectedDriverDetails.currentActiveOrder.address.landmark}</p>
                              )}
                              <p className="text-gray-500">
                                {[
                                  selectedDriverDetails.currentActiveOrder.address?.city,
                                  selectedDriverDetails.currentActiveOrder.address?.state
                                ].filter(Boolean).join(', ')}
                                {selectedDriverDetails.currentActiveOrder.address?.pincode && ` - ${selectedDriverDetails.currentActiveOrder.address.pincode}`}
                              </p>
                              {selectedDriverDetails.currentActiveOrder.address?.country && (
                                <p className="text-[10px] text-gray-400 font-semibold uppercase">{selectedDriverDetails.currentActiveOrder.address.country}</p>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-400 text-xs">
                      <FaInfoCircle className="mx-auto text-lg mb-2 text-gray-300" />
                      No active cargo payload or route parameters defined for this driver.
                    </div>
                  )}
                </div>

              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
                {/* Dynamic Reassignment Actions or Inline Status Line */}
                <div className="text-xs">
                  {selectedDriverDetails.status === 'Busy' && selectedDriverDetails.currentActiveOrder && (() => {
                    const currentStatus = selectedDriverDetails.currentActiveOrder.deliveryStatus || selectedDriverDetails.currentActiveOrder.status
                    const canReassign = currentStatus === 'Assigned' || currentStatus === 'Accepted'

                    if (canReassign) {
                      return (
                        <button
                          onClick={() => initReassignment(
                            selectedDriverDetails.currentActiveOrder._id, 
                            selectedDriverDetails._id
                          )}
                          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                        >
                          <FaUndo className="text-[10px]" /> Reassign Route
                        </button>
                      )
                    } else {
                      return (
                        <span className="text-amber-600 font-bold flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3.5 py-2 rounded-lg">
                          <FaInfoCircle className="text-amber-500 flex-shrink-0" />
                          The order is on the way, you can't reassign the driver.
                        </span>
                      )
                    }
                  })()}
                </div>

                <button
                  onClick={() => setSelectedDriverDetails(null)}
                  className="px-5 py-2.5 bg-[#08B36A] hover:bg-green-600 text-white rounded-lg text-xs font-bold transition shadow-sm self-end sm:self-auto"
                >
                  Close Console
                </button>
              </div>

            </div>
          </div>
        )}

        {/* MODAL 2: GLOBAL VIEWPORT-COVERING REASSIGNMENT SELECTION CONSOLE */}
        {reassignTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 flex flex-col my-8 animate-scaleUp">
              
              {/* Header (Branded Green) */}
              <div className="p-5 border-b border-gray-100 bg-[#08B36A] text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white/20 text-white rounded-full flex items-center justify-center font-bold">
                    <FaUndo />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Fallback Route Reassignment</h2>
                    <p className="text-xs text-white/85">Redirection console for active dispatch routes</p>
                  </div>
                </div>
                <button 
                  onClick={() => setReassignTarget(null)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Body split */}
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                
                {/* Left Side: context warning */}
                <div className="md:col-span-4 p-6 bg-slate-50/50 space-y-4">
                  <h4 className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">Target Route</h4>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 text-xs space-y-3 shadow-xs">
                    <div>
                      <span className="text-gray-400 block">Target Order ID:</span>
                      <strong className="text-gray-800 font-bold block mt-0.5">#{reassignTarget.orderId}</strong>
                    </div>
                    <hr />
                    <div className="text-amber-800 space-y-1.5 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                      <FaInfoCircle className="text-amber-600 text-sm inline mr-1" />
                      <span className="text-[11px] leading-relaxed font-medium block">
                        Confirming alternative allocation will automatically unassign this order from the current driver.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: rich list grid selection */}
                <div className="md:col-span-8 p-6 space-y-4">
                  <h4 className="text-gray-500 text-[11px] font-bold uppercase tracking-wider pl-1">Available Standby Drivers ({availableDrivers.length})</h4>
                  
                  <div className="max-h-[300px] overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableDrivers.map((drv) => {
                        const isSelected = selectedNewDriverId === drv._id

                        return (
                          <div 
                            key={drv._id}
                            onClick={() => setSelectedNewDriverId(drv._id)}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between ${
                              isSelected 
                                ? 'border-[#08B36A] bg-green-50/40 shadow-xs' 
                                : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/30'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`h-11 w-11 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden ${
                                isSelected ? 'bg-green-100 text-[#08B36A]' : 'bg-slate-100 text-gray-600'
                              }`}>
                                {drv.profilePhoto ? (
                                  <img src={drv.profilePhoto} alt={drv.name} className="h-full w-full object-cover" />
                                ) : (
                                  drv.name?.charAt(0)
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 text-xs truncate">{drv.name}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5 truncate">Vehicle: {drv.vehicleNumber || 'None'}</p>
                              </div>
                            </div>

                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'border-[#08B36A] bg-[#08B36A]' : 'border-gray-300 bg-white'
                            }`}>
                              {isSelected && <FaCheck className="text-[8px] text-white" />}
                            </div>
                          </div>
                        )
                      })}

                      {availableDrivers.length === 0 && (
                        <div className="col-span-2 p-12 text-center bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                          <FaUser className="mx-auto text-gray-300 text-2xl" />
                          <p className="text-gray-500 text-xs font-medium">No standby drivers are active.</p>
                          <p className="text-gray-400 text-[10px]">Drivers must update their status to Available in their respective panels.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2.5">
                <button
                  onClick={() => setReassignTarget(null)}
                  className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold transition hover:bg-gray-50"
                >
                  Cancel Reassign
                </button>
                <button
                  onClick={handleReassign}
                  disabled={!selectedNewDriverId || reassignLoading}
                  className="px-6 py-2.5 bg-[#08B36A] hover:bg-green-600 disabled:opacity-55 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  {reassignLoading ? (
                    <>
                      <FaSpinner className="animate-spin" /> Processing...
                    </>
                  ) : (
                    'Confirm Reallocation'
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}