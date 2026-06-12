"use client";

import React, { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaVideo, 
  FaPhoneAlt, 
  FaComment, 
  FaSpinner, 
  FaUser, 
  FaStethoscope, 
  FaWallet 
} from 'react-icons/fa';
import DoctorAPI from '@/app/services/DoctorAPI';
import { toast, Toaster } from 'react-hot-toast';

// Adjust this import path to match your actual folder structure
import VideoCallModal from '../../../../(user)/components/videoCall/VideoCallModal';

function Page() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Video/Audio Call States
  const [activeCallId, setActiveCallId] = useState(null);
  const [callType, setCallType] = useState('video'); // 'video' or 'audio'
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await DoctorAPI.getVideoCallAppointments();
      
      if (response && response.success) {
        setAppointments(response.data || []);
      } else {
        setError("Failed to retrieve valid appointment data.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err || "An error occurred while fetching appointments.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartCall = async (e, appointment, type) => {
    e.stopPropagation(); // Prevent row click events
    try {
      setSubmitting(true);
      setCallType(type);
      setSelectedAppointment(appointment);

      const payload = {
        appointmentId: appointment.appointmentId,
        callId: appointment.appointmentId,
        callType: type, // 'video' or 'audio'
        callerName: "Doctor",
        receiverId: appointment.userAccount?._id || appointment.appointmentId, 
      };

      const res = await DoctorAPI.initiateVideoCall(payload);

      if (res && res.success) {
        toast.success(`Calling patient via ${type}...`);
        setActiveCallId(res.callData?.callId || appointment.appointmentId);
        setIsVideoModalOpen(true);
      } else {
        toast.error(res?.message || "Patient is offline or unreachable");
      }
    } catch (error) {
      console.error(`Error starting ${type} call:`, error);
      toast.error(`An error occurred while starting the ${type} call`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMessage = (e, appointment) => {
    e.stopPropagation(); // Prevent row click events
    toast.success(`Opening secure message chat with ${appointment.patientName}`);
    // Implement messaging window/navigation logic here as needed
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <FaSpinner className="animate-spin text-[#08B36A] mb-4" size={30} />
        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Fetching video appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-[2rem] border border-gray-100 p-8 text-center max-w-md shadow-sm">
          <p className="text-red-500 font-black text-xs uppercase tracking-widest mb-2">Error Occurred</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button 
            onClick={fetchAppointments}
            className="px-6 py-2.5 bg-[#08B36A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Block */}
        <div>
          <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Video Consultations</h1>
          <p className="text-sm text-gray-500 font-medium">Manage and connect with your remote patients</p>
        </div>

        {/* Responsive Table View */}
        {appointments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No active video consultations found</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Patient Details</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Consultation Reason</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Schedule</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Payment & Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Consultation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {appointments.map((appt) => (
                    <tr 
                      key={appt.appointmentId} 
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      {/* Patient Details Column */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img 
                            src={appt.userAccount?.profilePic} 
                            alt={appt.patientName} 
                            className="w-12 h-12 rounded-2xl object-cover bg-gray-100 border border-gray-100"
                            onError={(e) => {
                              e.target.src = 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg';
                            }}
                          />
                          <div>
                            <p className="font-black text-gray-900 text-sm uppercase tracking-tight">
                              {appt.patientName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-black uppercase">
                                {appt.patientGender}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold">
                                Age: {appt.patientAge}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Consultation Reason Column */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 mb-1">
                          <FaStethoscope className="text-blue-500" />
                          <p className="text-sm font-black text-gray-700 truncate max-w-[200px]">
                            {appt.reasonForVisit}
                          </p>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                          ID: {appt.bookingId}
                        </p>
                      </td>

                      {/* Schedule Column */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-gray-800 font-black text-sm">
                          <FaCalendarAlt className="text-gray-300" size={14} />
                          {formatDate(appt.appointmentDate)}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-gray-400 font-bold text-xs">
                          <FaClock size={12} /> {appt.appointmentTime}
                        </div>
                      </td>

                      {/* Payment & Status Column */}
                      <td className="px-8 py-6">
                        <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-1 ${
                          appt.status === 'In-Progress' ? 'bg-green-50 text-[#08B36A]' : 'bg-yellow-50 text-yellow-600'
                        }`}>
                          {appt.status}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-[#08B36A]">₹{appt.totalAmount}</p>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">(Paid)</span>
                        </div>
                      </td>

                      {/* Multi-Call Actions Column */}
                      <td className="px-8 py-6">
                        <div className="flex justify-center items-center gap-2">
                          {appt.isCallActionEnabled ? (
                            <>
                              {/* Video Call Trigger */}
                              <button
                                disabled={submitting}
                                onClick={(e) => handleStartCall(e, appt, 'video')}
                                title="Start Video Call"
                                className="p-3.5 rounded-2xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all active:scale-90 hover:scale-105"
                              >
                                <FaVideo size={16} />
                              </button>

                              {/* Audio Call Trigger */}
                              <button
                                disabled={submitting}
                                onClick={(e) => handleStartCall(e, appt, 'audio')}
                                title="Start Audio Call"
                                className="p-3.5 rounded-2xl text-green-600 bg-green-50 hover:bg-green-100 transition-all active:scale-90 hover:scale-105"
                              >
                                <FaPhoneAlt size={15} />
                              </button>

                              {/* Messaging Trigger */}
                              <button
                                disabled={submitting}
                                onClick={(e) => handleMessage(e, appt)}
                                title="Send Message"
                                className="p-3.5 rounded-2xl text-purple-600 bg-purple-50 hover:bg-purple-100 transition-all active:scale-90 hover:scale-105"
                              >
                                <FaComment size={15} />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-4 py-2.5 bg-gray-50 rounded-xl">
                              Call Disabled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Video/Audio Call WebRTC Modal Container */}
      {isVideoModalOpen && (
        <VideoCallModal
          callId={activeCallId}
          callerName="Doctor"
          role="caller" // Dictates offer production for WebRTC signaling
          callType={callType} // Custom pass-through of chosen modality
          onClose={() => {
            setIsVideoModalOpen(false);
            setActiveCallId(null);
          }}
        />
      )}
    </div>
  );
}

export default Page;