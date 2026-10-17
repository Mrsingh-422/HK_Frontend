"use client";
import React, { useState, useEffect } from "react";
// React Icons
import {
  HiOutlineLocationMarker, HiOutlineX, HiOutlineReceiptTax,
  HiOutlineCalendar, HiOutlineDocumentDownload, HiOutlineClock, HiChevronLeft, HiChevronRight, HiStar
} from "react-icons/hi";
import {
  FaUserMd, FaUserAlt, FaWallet, FaBed, FaCalendarAlt, FaStethoscope,
  FaInfoCircle, FaExclamationTriangle, FaClock, FaCheckCircle, FaCreditCard,
  FaArrowRight, FaTimes, FaHeartbeat, FaMapMarkerAlt, FaShieldAlt, FaSpinner,
  FaDoorOpen, FaTag, FaMoneyBillWave
} from "react-icons/fa";
import { MdVerified, MdOutlineBedroomChild, MdOutlineRateReview } from "react-icons/md";
import { FiRefreshCw } from "react-icons/fi";
import UserAPI from "@/app/services/UserAPI";
import { Toaster, toast } from 'react-hot-toast';
import { createPortal } from "react-dom";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Dynamically load Razorpay SDK
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

  // -------------------------------------------------------------
  // MODULE 2: 30-MINUTE BED HOLD INTEGRATION STATES
  // -------------------------------------------------------------
  const [activeHold, setActiveHold] = useState(null);
  const [activeHoldTimer, setActiveHoldTimer] = useState("");
  const [isHoldBannerDismissed, setIsHoldBannerDismissed] = useState(false);

  // Hold Payment / Details Modal States (2.2, 2.4)
  const [isHoldPayModalOpen, setIsHoldPayModalOpen] = useState(false);
  const [pendingHoldDetail, setPendingHoldDetail] = useState(null);
  const [isHoldDetailLoading, setIsHoldDetailLoading] = useState(false);
  const [isPayingHoldOnline, setIsPayingHoldOnline] = useState(false);

  // Decline Hold States (2.3)
  const [isDeclineHoldModalOpen, setIsDeclineHoldModalOpen] = useState(false);
  const [declineHoldReason, setDeclineHoldReason] = useState("Patient opted for home treatment.");
  const [isDecliningHold, setIsDecliningHold] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchBookings(1);
    checkActiveHold();
    return () => setMounted(false);
  }, []);

  // Live Timer Interval for Active Hold & Pending Cards
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeHold?.holdExpiresAt) {
        const diff = new Date(activeHold.holdExpiresAt).getTime() - Date.now();
        if (diff <= 0) {
          setActiveHoldTimer("EXPIRED");
        } else {
          const mins = Math.floor(diff / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setActiveHoldTimer(`${mins}m ${secs < 10 ? "0" : ""}${secs}s`);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeHold]);

  useEffect(() => {
    if (isRescheduling && selectedAppt) {
      setRescheduleData({ start: "", end: "" });
      setCurrentMonth(new Date());
      const bedId = selectedAppt.bedId?._id || selectedAppt.bedId;
      if (bedId) {
        const today = new Date();
        fetchBedMonthlySchedule(bedId, today.getMonth() + 1, today.getFullYear());
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
    if (isModalOpen || isReviewModalOpen || isCancelModalOpen || isHoldPayModalOpen || isDeclineHoldModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen, isReviewModalOpen, isCancelModalOpen, isHoldPayModalOpen, isDeclineHoldModalOpen]);

  // -------------------------------------------------------------
  // MODULE 2.1: CHECK ACTIVE ADMISSION HOLD
  // -------------------------------------------------------------
  const checkActiveHold = async () => {
    try {
      if (typeof UserAPI.checkActiveAdmissionHold === "function") {
        const res = await UserAPI.checkActiveAdmissionHold();
        if (res && res.success && res.hasActiveHold && res.data) {
          setActiveHold(res.data);
          return;
        }
      }
      const token = typeof window !== 'undefined' ? (localStorage.getItem('userToken') || localStorage.getItem('token')) : '';
      const res = await fetch(`${BASE_URL}/user/hospital/admission/active-hold`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json && json.success && json.hasActiveHold && json.data) {
        setActiveHold(json.data);
      } else {
        setActiveHold(null);
      }
    } catch (err) {
      console.warn("Could not check active hold status:", err);
      setActiveHold(null);
    }
  };

  // -------------------------------------------------------------
  // MODULE 2.2: OPEN PENDING ADMISSION HOLD DETAILS MODAL
  // -------------------------------------------------------------
  const handleOpenHoldDetails = async (appointmentId) => {
    const targetId = appointmentId || activeHold?.appointmentId;
    if (!targetId) return;

    try {
      setIsHoldDetailLoading(true);
      setIsHoldPayModalOpen(true);
      let details = null;

      if (typeof UserAPI.getPendingAdmissionDetails === "function") {
        const res = await UserAPI.getPendingAdmissionDetails(targetId);
        if (res && res.success && res.data) {
          details = res.data;
        }
      } else {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('userToken') || localStorage.getItem('token')) : '';
        const res = await fetch(`${BASE_URL}/user/hospital/admission/pending-payment/${targetId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json && json.success && json.data) details = json.data;
      }

      setPendingHoldDetail(details || activeHold);
    } catch (err) {
      console.error("Error loading pending hold details:", err);
      toast.error("Failed to load admission hold details.");
      setPendingHoldDetail(activeHold);
    } finally {
      setIsHoldDetailLoading(false);
    }
  };

  // -------------------------------------------------------------
  // MODULE 2.4: PAY BED DEPOSIT ONLINE VIA RAZORPAY
  // -------------------------------------------------------------
  const handlePayHoldOnline = async () => {
    const apptId = pendingHoldDetail?.appointmentId || activeHold?.appointmentId;
    if (!apptId) return;

    try {
      setIsPayingHoldOnline(true);
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Failed to load Razorpay payment gateway.");
        setIsPayingHoldOnline(false);
        return;
      }

      // Step 1: Create Payment Order (POST /user/hospital/admission/create-payment-order)
      let orderRes;
      if (typeof UserAPI.createAdmissionPaymentOrder === "function") {
        orderRes = await UserAPI.createAdmissionPaymentOrder(apptId);
      } else {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('userToken') || localStorage.getItem('token')) : '';
        const res = await fetch(`${BASE_URL}/user/hospital/admission/create-payment-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ appointmentId: apptId })
        });
        orderRes = await res.json();
      }

      if (!orderRes?.success) {
        toast.error(orderRes?.message || "Failed to initiate payment order");
        setIsPayingHoldOnline(false);
        return;
      }

      // Step 2: Open Razorpay Window & Verify Signature
      const options = {
        key: orderRes.key_id,
        amount: orderRes.amount,
        currency: orderRes.currency || "INR",
        name: pendingHoldDetail?.hospital?.name || "Hospital Network",
        description: `Admission Deposit: ${pendingHoldDetail?.wardName || "Ward"} (${pendingHoldDetail?.bedNumber || "Bed"})`,
        order_id: orderRes.razorpayOrderId,
        prefill: {
          name: localStorage.getItem("userName") || "",
          contact: localStorage.getItem("userPhone") || ""
        },
        theme: { color: "#10b981" },
        modal: {
          ondismiss: () => {
            setIsPayingHoldOnline(false);
            toast("Payment cancelled.");
          }
        },
        handler: async function (paymentResponse) {
          try {
            setIsPayingHoldOnline(true);
            const verifyPayload = {
              appointmentId: apptId,
              razorpay_order_id: paymentResponse.razorpay_order_id || orderRes.razorpayOrderId,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature
            };

            let verifyRes;
            if (typeof UserAPI.verifyAdmissionPayment === "function") {
              verifyRes = await UserAPI.verifyAdmissionPayment(verifyPayload);
            } else {
              const token = typeof window !== 'undefined' ? (localStorage.getItem('userToken') || localStorage.getItem('token')) : '';
              const res = await fetch(`${BASE_URL}/user/hospital/admission/verify-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(verifyPayload)
              });
              verifyRes = await res.json();
            }

            if (verifyRes?.success) {
              toast.success("Online payment verified! Hospital admission confirmed.");
              setIsHoldPayModalOpen(false);
              setActiveHold(null);
              fetchBookings(pagination.currentPage);
            } else {
              toast.error(verifyRes?.message || "Payment verification failed.");
            }
          } catch (e) {
            console.error("Verification error:", e);
            toast.error("Payment verification error.");
          } finally {
            setIsPayingHoldOnline(false);
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      toast.error("Error initiating payment.");
      setIsPayingHoldOnline(false);
    }
  };

  // -------------------------------------------------------------
  // MODULE 2.3: DECLINE / CANCEL BED HOLD (Immediate Release)
  // -------------------------------------------------------------
  const handleConfirmDeclineHold = async () => {
    const apptId = pendingHoldDetail?.appointmentId || activeHold?.appointmentId;
    if (!apptId) return;

    try {
      setIsDecliningHold(true);
      let res;
      if (typeof UserAPI.cancelAdmissionHold === "function") {
        res = await UserAPI.cancelAdmissionHold(apptId, declineHoldReason);
      } else {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('userToken') || localStorage.getItem('token')) : '';
        const fetchRes = await fetch(`${BASE_URL}/user/hospital/admission/cancel-hold`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ appointmentId: apptId, reason: declineHoldReason })
        });
        res = await fetchRes.json();
      }

      if (res?.success) {
        toast.success(res.message || "Admission hold cancelled. Bed released back to hospital.");
        setIsDeclineHoldModalOpen(false);
        setIsHoldPayModalOpen(false);
        setActiveHold(null);
        fetchBookings(pagination.currentPage);
      } else {
        toast.error(res?.message || "Failed to cancel hold");
      }
    } catch (err) {
      console.error("Error cancelling bed hold:", err);
      toast.error("Something went wrong cancelling bed hold.");
    } finally {
      setIsDecliningHold(false);
    }
  };

  const handleMonthChange = (nextMonth) => {
    setCurrentMonth(nextMonth);
    const bedId = selectedAppt?.bedId?._id || selectedAppt?.bedId;
    if (bedId) {
      fetchBedMonthlySchedule(bedId, nextMonth.getMonth() + 1, nextMonth.getFullYear());
    }
  };

  const fetchBookings = async (page) => {
    try {
      // Calls updated getMyHospitalBookings supporting tab parameter
      const response = await UserAPI.getMyHospitalBookings("All");
      if (response && response.success) {
        setMyAppointments(response.data || []);
        setPagination(response.pagination || {
          currentPage: page,
          totalPages: Math.ceil((response.total || response.count || response.data?.length) / 10) || 1,
          totalCount: response.total || response.count || response.data?.length || 0
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

  const handleDayClick = (dateStr, isBooked, isPast) => {
    if (isBooked || isPast) return;
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
    const today = new Date();
    const currentYearMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const prevMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    
    if (prevMonthDate < currentYearMonth) return;

    handleMonthChange(prevMonthDate);
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
      case "Admitted":
      case "In-Progress": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Confirmed": return "bg-green-100 text-green-700 border-green-200";
      case "Completed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Cancelled":
      case "Cancelled-By-User":
      case "Cancelled-By-Hospital": return "bg-red-100 text-red-700 border-red-200";
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
    <div className="min-h-screen bg-[#fcfcfc] py-6 px-4 md:px-8 font-sans">
      <Toaster position="top-center" reverseOrder={false} />

      {/* ==============================================================
          MODULE 2.1: LIVE 30-MINUTE BED HOLD STICKY BANNER
      ============================================================== */}
      {activeHold && !isHoldBannerDismissed && activeHoldTimer !== "EXPIRED" && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-b border-indigo-500/30 px-4 py-3.5 mb-8 shadow-xl backdrop-blur-md rounded-2xl animate-in slide-in-from-top duration-300">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center text-base shrink-0">
                <FaBed />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-white uppercase tracking-wider text-[11px]">
                    Hospital Bed Hold Active &bull; {activeHold.bedNumber} ({activeHold.wardName})
                  </span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                </div>
                <p className="text-slate-300 text-[11px] font-medium mt-0.5">
                  Dr. {activeHold.doctorName} ordered in-patient admission at {activeHold.hospitalName}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-[11px] font-black text-amber-300">
                <FaClock size={11} />
                <span>{activeHoldTimer || activeHold.formattedRemainingTime || "30m"}</span>
              </div>

              <button
                onClick={() => handleOpenHoldDetails(activeHold.appointmentId)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Pay ₹{activeHold.depositPayable} & Admit</span>
                <FaArrowRight size={10} />
              </button>

              <button
                onClick={() => setIsHoldBannerDismissed(true)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Dismiss Banner"
              >
                <FaTimes size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Medical Records</h1>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">Appointments & Admissions</p>
          </div>
        </div>

        {/* ==============================================================
            MODULE 2.5: LIST OF BOOKINGS (Separated OPD vs Bed Admissions)
        ============================================================== */}
        <div className="space-y-6">
          {myAppointments.map((appt) => {
            const isOpd = appt.isOpd || appt.bookingType === "OPD";
            const isIpd = appt.isIpd || appt.bookingType === "Admission";
            const isPendingHold = appt.status === "Hospital-Pending";

            return (
              <div key={appt._id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                  {/* Left Column Image & Badges */}
                  <div className="md:w-1/3 space-y-4">
                    <div className="relative group overflow-hidden rounded-2xl h-48 bg-gray-100">
                      {appt.hospitalId?.hospitalImage ? (
                        <img src={`${BASE_URL}${appt.hospitalId.hospitalImage[0]}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-black uppercase">
                          {isOpd ? "OPD Consultation" : "Hospital Stay"}
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${getStatusColor(appt.status)}`}>
                          {appt.status}
                        </span>

                        {/* Dedicated Module 2.5 Display Badges */}
                        {appt.displayBadge && (
                          <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-900 text-white shadow-xs">
                            {appt.displayBadge}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        {appt.hospitalId?.name || "Hospital Facility"} {appt.hospitalId && <MdVerified className="text-blue-500" />}
                      </h3>
                      <p className="text-gray-400 text-xs font-bold flex items-center gap-1 mt-1">
                        <HiOutlineLocationMarker /> {appt.hospitalId?.address || appt.address?.city}
                      </p>
                    </div>
                  </div>

                  {/* Right Column Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">
                          {isOpd ? `Patient (Token #${appt.tokenNumber || "--"})` : "Patient Profile"}
                        </p>
                        <p className="font-bold text-gray-800">
                          {appt.patients?.[0]?.patientName || appt.patientName}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          Age: {appt.patients?.[0]?.patientAge || appt.patientAge || "25"} &bull; {appt.patients?.[0]?.gender || "Male"}
                        </p>
                      </div>

                      <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                        <p className="text-[10px] font-black text-[#08b36a] uppercase mb-1">
                          {isPendingHold ? "Admission Deposit" : "Total Amount"}
                        </p>
                        <p className="text-lg font-black text-gray-900">₹{appt.totalAmount?.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-[#08b36a]">
                          {appt.paymentStatus} ({appt.paymentMethod || "Online"})
                        </p>
                      </div>
                    </div>

                    {/* OPD Cabin Room or IPD Ward & Bed */}
                    <div className="mt-4 p-3 bg-slate-50/70 rounded-xl text-xs flex items-center justify-between border border-slate-100">
                      {isOpd ? (
                        <span className="font-bold text-slate-700">
                          Cabin: <strong>{appt.opdRoomNumber || appt.doctorId?.department?.roomNumber || "Cabin 1"}</strong> &bull; Token: <strong>#{appt.tokenNumber}</strong>
                        </span>
                      ) : (
                        <span className="font-bold text-slate-700">
                          Ward: <strong>{appt.wardName || appt.bedId?.wardId?.name || "In-Patient"}</strong> &bull; Bed: <strong>{appt.bedNumber || appt.bedId?.bedNumber || "Bed"}</strong>
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        #{appt.bookingId}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-300 uppercase">Consultant</span>
                          <span className="text-xs font-bold text-gray-700">Dr. {appt.doctorId?.name || appt.doctor?.name || "Doctor"}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-300 uppercase">Date</span>
                          <span className="text-xs font-bold text-gray-700">
                            {new Date(appt.appointmentDate || appt.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* 30-Min Bed Hold Payment CTA */}
                        {isIpd && isPendingHold && (
                          <button
                            onClick={() => handleOpenHoldDetails(appt._id)}
                            className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                          >
                            <FaCreditCard size={11} /> Pay Deposit & Admit
                          </button>
                        )}

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
                          className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#08b36a] transition-all active:scale-95 shadow-lg shadow-gray-200 cursor-pointer"
                        >
                          Full Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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

      {/* ==============================================================
          MODULE 2.2 & 2.4: PENDING ADMISSION HOLD PAYMENT MODAL
      ============================================================== */}
      {isHoldPayModalOpen && pendingHoldDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                  <FaBed />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Confirm Bed Admission Hold
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    Booking ID: #{pendingHoldDetail.bookingId} &bull; 30-Min Priority Window
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHoldPayModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <HiOutlineX size={16} />
              </button>
            </div>

            {/* Countdown Alert */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <FaClock className="text-amber-600" />
                <span>Hold Countdown Timer:</span>
              </div>
              <span className="text-sm font-black text-amber-700 font-mono">
                {activeHoldTimer || pendingHoldDetail.formattedRemainingTime || "30m 00s"}
              </span>
            </div>

            {/* Facility & Doctor Overview */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Hospital Facility</span>
                <p className="font-black text-slate-900">{pendingHoldDetail.hospital?.name || "Hospital"}</p>
                <p className="text-slate-500 text-[11px]">{pendingHoldDetail.hospital?.city}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Attending Consultant</span>
                <p className="font-black text-slate-900">Dr. {pendingHoldDetail.doctor?.name || "Consultant"}</p>
                <p className="text-indigo-600 text-[11px] font-bold">{pendingHoldDetail.doctor?.speciality}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Ward & Bed</span>
                <p className="font-black text-slate-900">{pendingHoldDetail.wardName}</p>
                <p className="text-emerald-700 text-[11px] font-bold">{pendingHoldDetail.bedNumber}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Daily Bed Rate</span>
                <p className="font-black text-slate-900">₹{pendingHoldDetail.pricePerDay || pendingHoldDetail.depositPayable} / day</p>
                <p className="text-slate-400 text-[10px]">Standard Charge</p>
              </div>
            </div>

            {/* Vitals Summary at Admission */}
            {pendingHoldDetail.vitals && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FaHeartbeat className="text-rose-500" /> Recorded Patient Vitals
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[8px] font-black text-slate-400 block uppercase">BP</span>
                    <span className="font-black text-slate-900">{pendingHoldDetail.vitals.bp || "--"}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[8px] font-black text-slate-400 block uppercase">Pulse</span>
                    <span className="font-black text-slate-900">{pendingHoldDetail.vitals.pulse || "--"} bpm</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[8px] font-black text-slate-400 block uppercase">Temp</span>
                    <span className="font-black text-slate-900">{pendingHoldDetail.vitals.temp || "--"} °F</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[8px] font-black text-slate-400 block uppercase">SpO2</span>
                    <span className="font-black text-emerald-600">{pendingHoldDetail.vitals.spo2 || "--"}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Total Payable & Pay Online CTA */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Initial Deposit Due</span>
                  <span className="text-[10px] text-slate-400">Adjusted / Refundable at discharge</span>
                </div>
                <span className="text-2xl font-black text-slate-900">
                  ₹{pendingHoldDetail.depositPayable || 3500}
                </span>
              </div>

              <button
                type="button"
                disabled={isPayingHoldOnline}
                onClick={handlePayHoldOnline}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPayingHoldOnline ? <FaSpinner className="animate-spin" /> : <FaCreditCard />}
                <span>Pay Online ₹{pendingHoldDetail.depositPayable || 3500} & Confirm Admission</span>
              </button>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeclineHoldModalOpen(true)}
                  className="text-xs font-bold text-red-500 hover:text-red-700 underline cursor-pointer"
                >
                  Decline admission & release bed
                </button>

                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Or pay cash at hospital desk
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          MODULE 2.3: DECLINE BED HOLD MODAL
      ============================================================== */}
      {isDeclineHoldModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[32px] p-6 sm:p-7 space-y-4 shadow-2xl">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              Decline Hospital Bed Admission
            </h3>
            <p className="text-slate-600 text-xs font-medium leading-relaxed">
              Are you sure you want to decline this admission? The reserved bed will be released immediately back to the hospital. (Your OPD visit remains completed).
            </p>

            <textarea
              rows="2"
              value={declineHoldReason}
              onChange={(e) => setDeclineHoldReason(e.target.value)}
              placeholder="Reason for declining..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none"
            />

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsDeclineHoldModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={isDecliningHold}
                onClick={handleConfirmDeclineHold}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
              >
                {isDecliningHold ? "Releasing..." : "Confirm Decline"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                        { label: "Patient", value: selectedAppt.patients?.[0]?.patientName || selectedAppt.patientName },
                        { label: "Gender", value: selectedAppt.patients?.[0]?.gender || selectedAppt.patientGender || "Male" },
                        { label: "Relation", value: selectedAppt.patients?.[0]?.relation || "Self" },
                        { label: "Age", value: selectedAppt.patients?.[0]?.patientAge || selectedAppt.patientAge || "25" },
                      ].map((item, i) => (
                        <div key={i} className="bg-gray-50 p-4 rounded-2xl"><p className="text-[9px] font-black text-gray-300 uppercase mb-1">{item.label}</p><p className="text-[11px] font-bold text-gray-800">{item.value}</p></div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-600"><HiOutlineCalendar size={20} /> <div><p className="text-[9px] uppercase font-black text-gray-400">Start Date</p><p className="font-bold text-sm">{new Date(selectedAppt.startDate || selectedAppt.appointmentDate).toLocaleDateString()}</p></div></div>
                      <div className="flex items-center gap-3 text-gray-600"><HiOutlineClock size={20} /> <div><p className="text-[9px] uppercase font-black text-gray-400">Time</p><p className="font-bold text-sm">{selectedAppt.appointmentTime}</p></div></div>
                      {selectedAppt.bedId && <div className="flex items-center gap-3 text-gray-600"><FaBed size={20} /> <div><p className="text-[9px] uppercase font-black text-gray-400">Bed No</p><p className="font-bold text-sm">{selectedAppt.bedId.bedNumber || selectedAppt.bedNumber} ({selectedAppt.bedId.wardId?.name || selectedAppt.wardName})</p></div></div>}
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-600"><HiOutlineCalendar size={20} /> <div><p className="text-[9px] uppercase font-black text-gray-400">End Date</p><p className="font-bold text-sm">{new Date(selectedAppt.endDate || selectedAppt.appointmentDate).toLocaleDateString()}</p></div></div>
                      <div className="flex items-center gap-3 text-gray-600"><MdVerified size={20} /> <div><p className="text-[9px] uppercase font-black text-gray-400">Triage</p><p className="font-bold text-sm">{selectedAppt.triageLevel || 'N/A'}</p></div></div>
                    </div>
                  </section>

                  {/* Rating & Review Summary */}
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
                            {selectedAppt.rescheduleCount || 0} / {maxRescheduleLimit} Used
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
                        const todayStr = formatDateString(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
                        const isPast = dateStr < todayStr;
                        const daySchedule = monthlySchedule.find((item) => item.date === dateStr);
                        const isBooked = daySchedule ? daySchedule.status !== "Available" : false;
                        const isStart = rescheduleData.start === dateStr;
                        const isEnd = rescheduleData.end === dateStr;
                        const isInRange = rescheduleData.start && rescheduleData.end && dateStr > rescheduleData.start && dateStr < rescheduleData.end;
                        let dayStyle = "bg-white text-gray-800 hover:bg-gray-100";
                        if (isPast) dayStyle = "bg-gray-100 text-gray-300 cursor-not-allowed opacity-50";
                        else if (isBooked) dayStyle = "bg-red-50 text-red-500 line-through cursor-not-allowed opacity-60";
                        else if (isStart || isEnd) dayStyle = "bg-[#08b36a] text-white font-black scale-105 shadow-md shadow-green-100";
                        else if (isInRange) dayStyle = "bg-green-50 text-[#08b36a] font-bold";
                        return (
                          <button key={`day-${day}`} type="button" disabled={isBooked || isPast} onClick={() => handleDayClick(dateStr, isBooked, isPast)} className={`h-10 w-full rounded-xl text-xs flex items-center justify-center transition-all ${dayStyle}`}>{day}</button>
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