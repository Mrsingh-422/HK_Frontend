"use client";
import React, { useState, useEffect } from "react";
// React Icons
import {
  HiOutlineLocationMarker, HiOutlineX, HiOutlineReceiptTax,
  HiOutlineCalendar, HiOutlineDocumentDownload, HiOutlineClock, HiChevronLeft, HiChevronRight, HiStar
} from "react-icons/hi";
import { FaUserMd, FaUserAlt, FaWallet, FaBed, FaCalendarAlt, FaStethoscope, FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";
import { MdVerified, MdOutlineBedroomChild, MdOutlineRateReview } from "react-icons/md";
import { FiRefreshCw } from "react-icons/fi";
import UserAPI from "@/app/services/UserAPI";
import { Toaster, toast } from 'react-hot-toast';
import { createPortal } from "react-dom";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// --- Helper Functions for Date calculations ---
const getUtcDate = (dateStr) => {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
};

const formatDateString = (y, m, d) => {
  const mm = String(m + 1).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
};

const getDatesInRange = (startDate, endDate) => {
  if (!startDate || !endDate) return [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates = [];
  let current = new Date(start);

  while (current <= end) {
    const y = current.getFullYear();
    const m = current.getMonth();
    const d = current.getDate();
    dates.push(formatDateString(y, m, d));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

function MyHospitalAppointments() {
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myAppointments, setMyAppointments] = useState([]);

  // Review & Rating Modal States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  // Cancellation Modal States
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Pagination State
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });

  // Reschedule & Calendar States
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ start: "", end: "" });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Logic States from API
  const [maxRescheduleLimit, setMaxRescheduleLimit] = useState(0);
  const maxCancellationLimit = 1; // Assuming 1 based on common hospital policies

  // States for API monthly bed schedule
  const [monthlySchedule, setMonthlySchedule] = useState([]);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchBookings(1);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isRescheduling && selectedAppt) {
      if (selectedAppt.startDate) {
        setCurrentMonth(new Date(selectedAppt.startDate));
      }
      const bedId = selectedAppt.bedId?._id || selectedAppt.bedId;
      if (bedId) {
        fetchBedMonthlySchedule(bedId, currentMonth.getMonth() + 1, currentMonth.getFullYear());
      }
    }
  }, [isRescheduling, selectedAppt]);

  // Fetch submitted review dynamically for selected Completed appointment inside detail modal
  useEffect(() => {
    const fetchApptReview = async () => {
      if (selectedAppt?._id && selectedAppt.status === "Completed" && isModalOpen) {
        setIsReviewLoading(true);
        try {
          const res = await UserAPI.getReviewsByOrder(selectedAppt._id);
          if (res && res.success && res.hasReviewed) {
            setSelectedReview(res.data);
          } else {
            setSelectedReview(null);
          }
        } catch (error) {
          console.error("Failed to fetch review details:", error);
          setSelectedReview(null);
        } finally {
          setIsReviewLoading(false);
        }
      } else {
        setSelectedReview(null);
      }
    };
    fetchApptReview();
  }, [selectedAppt, isModalOpen]);

  // Prevent body scroll when modals are active
  useEffect(() => {
    if (isModalOpen || isReviewModalOpen || isCancelModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen, isReviewModalOpen, isCancelModalOpen]);

  const handleMonthChange = (nextMonth) => {
    setCurrentMonth(nextMonth);
    const bedId = selectedAppt?.bedId?._id || selectedAppt?.bedId;
    if (bedId) {
      fetchBedMonthlySchedule(bedId, nextMonth.getMonth() + 1, nextMonth.getFullYear());
    }
  };

  const fetchBookings = async (page) => {
    try {
      const response = await UserAPI.getMyHospitalBookings(page);
      if (response.success) {
        setMyAppointments(response.data);
        setPagination(response.pagination || {
          currentPage: page,
          totalPages: Math.ceil(response.total / 10),
          totalCount: response.total
        });
        setMaxRescheduleLimit(response.maxRescheduleLimit || 0);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchBedMonthlySchedule = async (bedId, month, year) => {
    setIsScheduleLoading(true);
    try {
      if (typeof UserAPI.getBedMonthlySchedule === "function") {
        const response = await UserAPI.getBedMonthlySchedule(bedId, month, year);
        if (response && response.success) {
          setMonthlySchedule(response.data || []);
          setIsScheduleLoading(false);
          return;
        }
      }
      const res = await fetch(`${BASE_URL}/user/hospital/bed-monthly-schedule?bedId=${bedId}&month=${month}&year=${year}`);
      const json = await res.json();
      if (json.success) {
        setMonthlySchedule(json.data || []);
      }
    } catch (error) {
      console.error("Error fetching bed monthly schedule:", error);
      setMonthlySchedule([]);
    } finally {
      setIsScheduleLoading(false);
    }
  };

  // Submit Rating & Review handler
  const handleReviewSubmit = async (orderId, ratingData, isUpdate = false) => {
    try {
      let res;
      if (isUpdate) {
        res = await UserAPI.updateReview(orderId, {
          rating: ratingData.rating,
          comment: ratingData.comment
        });
      } else {
        res = await UserAPI.addRatingAndReviewHospital({
          bookingId: orderId,
          rating: ratingData.rating,
          comment: ratingData.comment
        });
      }

      if (res && res.success) {
        toast.success(res.message || "Thank you for your rating & feedback!");
        setIsReviewModalOpen(false);
        fetchBookings(pagination.currentPage);
      } else {
        toast.error(res?.message || "Failed to submit rating.");
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("An error occurred while submitting the rating.");
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleData.start || !rescheduleData.end) {
      toast.error("Please select both dates on the calendar.");
      return;
    }

    const originalDiffDays = Math.round((getUtcDate(selectedAppt.endDate) - getUtcDate(selectedAppt.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    const newDiffDays = Math.round((getUtcDate(rescheduleData.end) - getUtcDate(rescheduleData.start)) / (1000 * 60 * 60 * 24)) + 1;

    if (originalDiffDays !== newDiffDays) {
      toast.error(`The rescheduled booking must be exactly ${originalDiffDays} days.`);
      return;
    }

    const rangeDates = getDatesInRange(rescheduleData.start, rescheduleData.end);
    const hasBookedDate = rangeDates.some((d) => {
      const dayData = monthlySchedule.find((item) => item.date === d);
      return dayData ? dayData.status !== "Available" : false;
    });

    if (hasBookedDate) {
      toast.error("The selected range includes days that are already booked.");
      return;
    }

    const payload = {
      appointmentId: selectedAppt._id,
      newStartDate: rescheduleData.start,
      newEndDate: rescheduleData.end,
      newBedId: selectedAppt.bedId?._id || selectedAppt.bedId,
    };

    try {
      const response = await UserAPI.recheduleHospitalBooking(payload);
      if (response.success) {
        toast.success("Booking rescheduled successfully!");
        setIsRescheduling(false);
        setIsModalOpen(false);
        setRescheduleData({ start: "", end: "" });
        fetchBookings(pagination.currentPage);
      } else {
        toast.error(response.message || "Reschedule failed");
      }
    } catch (error) {
      console.error("Error rescheduling:", error);
      toast.error("Something went wrong.");
    }
  };

  const submitCancellation = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation.");
      return;
    }

    setIsCancelling(true);
    try {
      const response = await UserAPI.cancelHospitalBooking(selectedAppt._id, { reason: cancelReason });
      if (response.success) {
        toast.success("Booking cancelled successfully!");
        setIsCancelModalOpen(false);
        setIsModalOpen(false);
        setCancelReason("");
        fetchBookings(pagination.currentPage);
      } else {
        toast.error(response.message || "Cancellation failed");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Something went wrong while cancelling.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDayClick = (dateStr, isBooked) => {
    if (isBooked) return;
    if (!rescheduleData.start || (rescheduleData.start && rescheduleData.end)) {
      setRescheduleData({ start: dateStr, end: "" });
    } else {
      if (dateStr < rescheduleData.start) {
        setRescheduleData({ start: dateStr, end: "" });
      } else {
        const rangeDates = getDatesInRange(rescheduleData.start, dateStr);
        const hasBookedDate = rangeDates.some((d) => {
          const dayData = monthlySchedule.find((item) => item.date === d);
          return dayData ? dayData.status !== "Available" : false;
        });
        if (hasBookedDate) {
          toast.error("Selected range includes booked days.");
          return;
        }
        setRescheduleData({ ...rescheduleData, end: dateStr });
      }
    }
  };

  const handlePrevMonth = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    handleMonthChange(nextMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    handleMonthChange(nextMonth);
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array(firstDayIndex).fill(null);
  const daysInMonth = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);
  const allDays = [...blanks, ...daysInMonth];

  const getStatusColor = (status) => {
    switch (status) {
      case "Admitted": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Confirmed": return "bg-green-100 text-green-700 border-green-200";
      case "Completed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Cancelled":
      case "Cancelled-By-User": return "bg-red-100 text-red-700 border-red-200";
      case "Hospital-Pending": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // --- PORTAL COMPONENT: HOSPITAL RATINGS & REVIEW ---
  const HospitalReviewModal = ({ isOpen, onClose, data }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [hoverRating, setHoverRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [modalLoading, setModalLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
      const fetchReviewStatus = async () => {
        if (!isOpen || !data?._id) return;
        setModalLoading(true);
        try {
          const res = await UserAPI.getReviewsByOrder(data._id);
          if (res && res.success && res.hasReviewed) {
            setIsEditMode(true);
            setRating(res.data?.rating || 5);
            setComment(res.data?.comment || "");
          } else {
            setIsEditMode(false);
            setRating(5);
            setComment("");
          }
        } catch (error) {
          console.error("Failed to check review details:", error);
          setIsEditMode(false);
        } finally {
          setModalLoading(false);
        }
      };
      fetchReviewStatus();
    }, [isOpen, data]);

    if (!mounted || !isOpen || !data) return null;

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      await handleReviewSubmit(data._id, { rating, comment }, isEditMode);
      setSubmitting(false);
    };

    const getRatingLabel = (val) => {
      switch (val) {
        case 1: return "Extremely Disappointed";
        case 2: return "Needs Improvement";
        case 3: return "Average Experience";
        case 4: return "Very Good Quality";
        case 5: return "Excellent Service!";
        default: return "Select Rating";
      }
    };

    return createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 md:p-6 bg-gray-900/60 backdrop-blur-sm">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />
        <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden p-6 md:p-8 animate-in zoom-in-95 fade-in duration-300">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-600 p-2 rounded-xl">
                <MdOutlineRateReview size={20} />
              </span>
              <div>
                <h4 className="font-black text-slate-900 text-sm md:text-base uppercase tracking-widest">
                  {modalLoading ? "Checking..." : isEditMode ? "Edit Review" : "Rate Booking"}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Reviewing {data.hospitalId?.name || "Hospital"}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-full text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all">
              <HiOutlineX size={16} />
            </button>
          </div>

          {modalLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <FiRefreshCw className="animate-spin text-amber-500" size={24} />
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Syncing status...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center justify-center gap-2 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Tap to Rate Stars</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform active:scale-90 hover:scale-110"
                    >
                      <HiStar
                        className={`w-8 h-8 ${
                          star <= (hoverRating || rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-200"
                        } transition-colors duration-150`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-600 mt-1 transition-all duration-300">
                  {getRatingLabel(hoverRating || rating)}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest px-1 block">Comment Feedback</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  required
                  placeholder="Describe the medical care, nurse behavior, clinic safety, or response times..."
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-semibold outline-none ring-1 ring-slate-100 focus:ring-indigo-500 transition-all placeholder:text-slate-400 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {submitting ? <FiRefreshCw className="animate-spin" /> : isEditMode ? "Update Review" : "Submit Feedback"}
              </button>
            </form>
          )}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-10 px-4 md:px-8 font-sans">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Medical Records</h1>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">Appointments & Admissions</p>
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-6">
          {myAppointments.map((appt) => (
            <div key={appt._id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 space-y-4">
                  <div className="relative group overflow-hidden rounded-2xl h-48 bg-gray-100">
                    {appt.hospitalId?.hospitalImage ? (
                      <img src={`${BASE_URL}${appt.hospitalId.hospitalImage[0]}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-black uppercase">Home Visit</div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${getStatusColor(appt.status)}`}>
                        {appt.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                      {appt.hospitalId?.name || "Home Visit"} {appt.hospitalId && <MdVerified className="text-blue-500" />}
                    </h3>
                    <p className="text-gray-400 text-xs font-bold flex items-center gap-1 mt-1"><HiOutlineLocationMarker /> {appt.hospitalId?.address || appt.address?.city}</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Patient</p>
                      <p className="font-bold text-gray-800">{appt.patients[0]?.patientName}</p>
                      <p className="text-xs text-gray-500 font-medium">Age: {appt.patients[0]?.patientAge}</p>
                    </div>
                    <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                      <p className="text-[10px] font-black text-[#08b36a] uppercase mb-1">Total Amount</p>
                      <p className="text-lg font-black text-gray-900">₹{appt.totalAmount.toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-[#08b36a]">{appt.paymentStatus}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-300 uppercase">Specialist</span>
                        <span className="text-xs font-bold text-gray-700">{appt.doctorId?.name || "N/A"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-300 uppercase">Date</span>
                        <span className="text-xs font-bold text-gray-700">{new Date(appt.appointmentDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {appt.status === "Completed" && (
                        <button 
                          onClick={() => { setSelectedAppt(appt); setIsReviewModalOpen(true); }}
                          className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center gap-1.5 shadow-md shadow-amber-100"
                        >
                          <HiStar className="fill-white" /> Rate Service
                        </button>
                      )}
                      <button
                        onClick={() => { setSelectedAppt(appt); setIsModalOpen(true); }}
                        className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#08b36a] transition-all active:scale-95 shadow-lg shadow-gray-200"
                      >
                        Full Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button disabled={pagination.currentPage === 1} onClick={() => fetchBookings(pagination.currentPage - 1)} className="p-3 bg-white rounded-xl shadow-sm border"><HiChevronLeft /></button>
            <span className="font-black text-sm">Page {pagination.currentPage} of {pagination.totalPages}</span>
            <button disabled={pagination.currentPage === pagination.totalPages} onClick={() => fetchBookings(pagination.currentPage + 1)} className="p-3 bg-white rounded-xl shadow-sm border"><HiChevronRight /></button>
          </div>
        )}
      </div>

      {/* --- DETAILED MODAL --- */}
      {isModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gray-900 px-8 py-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest">{selectedAppt.hospitalId?.name || "Home Visit"}</h2>
                <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">Booking ID: {selectedAppt.bookingId}</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setIsRescheduling(false); setRescheduleData({ start: "", end: "" }); }} className="p-2 hover:bg-white/10 rounded-full"><HiOutlineX size={24} /></button>
            </div>

            <div className="p-8 overflow-y-auto space-y-10">
              {!isRescheduling ? (
                <>
                  <section>
                    <div className="flex items-center gap-2 mb-4"><FaUserAlt className="text-[#08b36a]" /><h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Patient Details</h4></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Patient", value: selectedAppt.patients[0]?.patientName },
                        { label: "Gender", value: selectedAppt.patients[0]?.gender },
                        { label: "Relation", value: selectedAppt.patients[0]?.relation },
                        { label: "Age", value: selectedAppt.patients[0]?.patientAge },
                      ].map((item, i) => (
                        <div key={i} className="bg-gray-50 p-4 rounded-2xl"><p className="text-[9px] font-black text-gray-300 uppercase mb-1">{item.label}</p><p className="text-[11px] font-bold text-gray-800">{item.value}</p></div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-600"><HiOutlineCalendar size={20} /> <div><p className="text-[9px] uppercase font-black text-gray-400">Start Date</p><p className="font-bold text-sm">{new Date(selectedAppt.startDate).toLocaleDateString()}</p></div></div>
                      <div className="flex items-center gap-3 text-gray-600"><HiOutlineClock size={20} /> <div><p className="text-[9px] uppercase font-black text-gray-400">Time</p><p className="font-bold text-sm">{selectedAppt.appointmentTime}</p></div></div>
                      {selectedAppt.bedId && <div className="flex items-center gap-3 text-gray-600"><FaBed size={20} /> <div><p className="text-[9px] uppercase font-black text-gray-400">Bed No</p><p className="font-bold text-sm">{selectedAppt.bedId.bedNumber} ({selectedAppt.bedId.wardId?.name})</p></div></div>}
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-600"><HiOutlineCalendar size={20} /> <div><p className="text-[9px] uppercase font-black text-gray-400">End Date</p><p className="font-bold text-sm">{new Date(selectedAppt.endDate).toLocaleDateString()}</p></div></div>
                      <div className="flex items-center gap-3 text-gray-600"><MdVerified size={20} /> <div><p className="text-[9px] uppercase font-black text-gray-400">Triage</p><p className="font-bold text-sm">{selectedAppt.triageLevel || 'N/A'}</p></div></div>
                    </div>
                  </section>

                  {/* Rating & Review Summary (Loaded Dynamically inside Details Modal) */}
                  {selectedAppt.status === "Completed" && (
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <FaUserMd className="text-[#08b36a]" />
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Your Rating & Review</h4>
                      </div>
                      {isReviewLoading ? (
                        <div className="flex items-center gap-2 bg-gray-50 p-6 rounded-[2rem] text-xs text-gray-400">
                          <FiRefreshCw className="animate-spin" />
                          <span>Syncing review history...</span>
                        </div>
                      ) : selectedReview ? (
                        <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-[2rem] space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Submitted Feedback</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <HiStar
                                  key={star}
                                  className={`w-4 h-4 ${star <= selectedReview.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs font-bold text-gray-700 italic">"{selectedReview.comment}"</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase">
                            Date: {new Date(selectedReview.updatedAt || selectedReview.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-100 p-6 rounded-[2rem] text-center">
                          <p className="text-xs font-bold text-gray-400">You have not rated this admission yet.</p>
                          <button
                            onClick={() => {
                              setIsModalOpen(false);
                              setIsReviewModalOpen(true);
                            }}
                            className="mt-2 text-[10px] font-black uppercase text-[#08b36a] hover:text-green-600"
                          >
                            Add Rating Now
                          </button>
                        </div>
                      )}
                    </section>
                  )}

                  {selectedAppt.hospitalId && !selectedAppt.status.toLowerCase().includes("cancel") && (
                    <div className="flex flex-col bg-green-50/50 p-6 rounded-3xl border border-green-100 gap-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#08b36a] shadow-sm"><MdOutlineBedroomChild size={24} /></div>
                          <div>
                            <p className="text-[10px] font-black text-[#08b36a] uppercase">Booking Type</p>
                            <p className="font-bold text-gray-800">{selectedAppt.bookingType}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-gray-400 uppercase">Reschedule Status</p>
                          <p className={`text-xs font-bold ${selectedAppt.rescheduleCount >= maxRescheduleLimit ? 'text-red-500' : 'text-gray-700'}`}>
                            {selectedAppt.rescheduleCount} / {maxRescheduleLimit} Used
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {/* CANCEL BUTTON WITH LIMIT LOGIC (HIDDEN IF COMPLETED) */}
                        {selectedAppt.status !== "Completed" && (
                          selectedAppt.cancellationCount < maxCancellationLimit ? (
                            <button
                              onClick={() => setIsCancelModalOpen(true)}
                              className="flex-1 bg-red-500 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-red-600 transition-all active:scale-95"
                            >
                              Cancel Booking
                            </button>
                          ) : (
                            <button
                              disabled
                              className="flex-1 bg-gray-200 text-gray-400 cursor-not-allowed px-6 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2"
                            >
                              Limit Reached <FaInfoCircle />
                            </button>
                          )
                        )}

                        {/* RESCHEDULE BUTTON WITH LIMIT LOGIC */}
                        {selectedAppt.rescheduleCount < maxRescheduleLimit ? (
                          <button
                            onClick={() => setIsRescheduling(true)}
                            className="flex-1 bg-[#08b36a] text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-green-600 transition-all active:scale-95"
                          >
                            Reschedule
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-1 bg-gray-200 text-gray-400 cursor-not-allowed px-6 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2"
                          >
                            Limit Reached <FaInfoCircle />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <section className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Select New Dates</h4>
                    </div>
                    <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                      Duration: {Math.round((getUtcDate(selectedAppt.endDate) - getUtcDate(selectedAppt.startDate)) / (1000 * 60 * 60 * 24)) + 1} Days
                    </span>
                  </div>

                  {/* CUSTOM HOTEL-STYLE CALENDAR */}
                  <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                      <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-gray-200 rounded-xl transition-all"><HiChevronLeft size={20} /></button>
                      <h5 className="font-black text-sm text-gray-800 uppercase tracking-wider">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h5>
                      <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-gray-200 rounded-xl transition-all"><HiChevronRight size={20} /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center mb-2">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (<span key={day} className="text-[10px] font-black text-gray-400 uppercase">{day}</span>))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {allDays.map((day, idx) => {
                        if (day === null) return <div key={`empty-${idx}`} />;
                        const dateStr = formatDateString(year, month, day);
                        const daySchedule = monthlySchedule.find((item) => item.date === dateStr);
                        const isBooked = daySchedule ? daySchedule.status !== "Available" : false;
                        const isStart = rescheduleData.start === dateStr;
                        const isEnd = rescheduleData.end === dateStr;
                        const isInRange = rescheduleData.start && rescheduleData.end && dateStr > rescheduleData.start && dateStr < rescheduleData.end;
                        let dayStyle = "bg-white text-gray-800 hover:bg-gray-100";
                        if (isBooked) dayStyle = "bg-red-50 text-red-500 line-through cursor-not-allowed opacity-60";
                        else if (isStart || isEnd) dayStyle = "bg-[#08b36a] text-white font-black scale-105 shadow-md shadow-green-100";
                        else if (isInRange) dayStyle = "bg-green-50 text-[#08b36a] font-bold";
                        return (
                          <button key={`day-${day}`} type="button" disabled={isBooked} onClick={() => handleDayClick(dateStr, isBooked)} className={`h-10 w-full rounded-xl text-xs flex items-center justify-center transition-all ${dayStyle}`}>{day}</button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => { setIsRescheduling(false); setRescheduleData({ start: "", end: "" }); }} className="flex-1 py-4 rounded-2xl font-black text-xs uppercase bg-gray-100 text-gray-600">Back</button>
                    <button onClick={handleReschedule} className="flex-1 py-4 rounded-2xl font-black text-xs uppercase bg-gray-900 text-white hover:bg-[#08b36a] transition-all">Confirm Reschedule</button>
                  </div>
                </section>
              )}

              <section>
                <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><FaWallet className="text-[#08b36a]" /><h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Billing Summary</h4></div></div>
                <div className="border border-gray-100 rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase">Description</th><th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase text-right">Amount</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      <tr><td className="px-6 py-4 text-xs font-bold text-gray-600">Base Fee</td><td className="px-6 py-4 text-xs font-bold text-gray-800 text-right">₹{selectedAppt.pricingBreakdown?.baseFee?.toLocaleString()}</td></tr>
                      <tr><td className="px-6 py-4 text-xs font-bold text-gray-600">Subtotal</td><td className="px-6 py-4 text-xs font-bold text-gray-800 text-right">₹{selectedAppt.pricingBreakdown?.subtotal?.toLocaleString()}</td></tr>
                      {selectedAppt.pricingBreakdown?.discountAmount > 0 && <tr><td className="px-6 py-4 text-xs font-bold text-red-500">Discount</td><td className="px-6 py-4 text-xs font-bold text-red-500 text-right">-₹{selectedAppt.pricingBreakdown.discountAmount.toLocaleString()}</td></tr>}
                    </tbody>
                    <tfoot className="bg-gray-900 text-white"><tr><td className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Total Payable</td><td className="px-6 py-4 font-black text-right">₹{selectedAppt.totalAmount?.toLocaleString()}</td></tr></tfoot>
                  </table>
                </div>
              </section>

              {selectedAppt.specialServices?.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4"><FaStethoscope className="text-[#08b36a]" /><h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Special Services</h4></div>
                  <div className="flex flex-wrap gap-2">
                    {selectedAppt.specialServices.map((svc) => (<span key={svc._id} className="bg-gray-100 px-4 py-2 rounded-xl text-[10px] font-black text-gray-600 uppercase">{svc.serviceName} (+₹{svc.price})</span>))}
                  </div>
                </section>
              )}
            </div>

            {/* Modal Footer actions */}
            <div className="p-6 md:p-8 bg-gray-50 border-t flex gap-3 shrink-0">
              {selectedAppt.status === "Completed" && (
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsReviewModalOpen(true);
                  }}
                  className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-100 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <HiStar className="fill-white" size={16} /> {selectedReview ? "Edit Review & Rating" : "Add Review & Rating"}
                </button>
              )}
              <button className="flex-1 py-4 bg-gray-900 hover:bg-gray-850 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                Download invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CANCELLATION REASON MODAL --- */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden p-8 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-2">
                <FaExclamationTriangle size={32} />
              </div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Cancel Booking?</h2>
              <p className="text-gray-400 text-xs font-bold leading-relaxed uppercase tracking-widest">
                This action cannot be undone. Please provide a reason for cancelling your admission.
              </p>

              <div className="w-full mt-6">
                <label className="block text-[9px] font-black text-gray-400 uppercase text-left mb-2 ml-1">Cancellation Reason</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="E.g., Medical emergency at home, recovered early..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-red-500 focus:outline-none transition-all h-32 resize-none"
                />
              </div>

              <div className="flex gap-3 w-full mt-6">
                <button
                  onClick={() => setIsCancelModalOpen(false)}
                  disabled={isCancelling}
                  className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
                >
                  Go Back
                </button>
                <button
                  onClick={submitCancellation}
                  disabled={isCancelling}
                  className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200 transition-all flex items-center justify-center"
                >
                  {isCancelling ? "Processing..." : "Confirm Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- RATING & REVIEW PORTAL MODAL --- */}
      {isReviewModalOpen && selectedAppt && (
        <HospitalReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          data={selectedAppt}
        />
      )}
    </div>
  );
}

export default MyHospitalAppointments;