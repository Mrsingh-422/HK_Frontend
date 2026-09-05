"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import VerifyPhoneAndSetPasswordModal from "@/app/(user)/components/VerifyPhoneAndSetPasswordModal";

// React Icons
import { 
    HiOutlinePhone, 
    HiOutlineLocationMarker, 
    HiStar, 
    HiOutlineClock, 
    HiChevronDown, 
    HiChevronUp, 
    HiShieldCheck, 
    HiX, 
    HiOutlineKey 
} from "react-icons/hi";
import { 
    FiTruck, 
    FiUser, 
    FiInfo, 
    FiAlertCircle, 
    FiCreditCard, 
    FiActivity, 
    FiCheckCircle, 
    FiPhoneCall, 
    FiNavigation, 
    FiXCircle, 
    FiMessageSquare, 
    FiChevronLeft, 
    FiChevronRight, 
    FiCamera, 
    FiAlertOctagon,
    FiLock
} from "react-icons/fi";
import { MdVerified, MdTag, MdOutlineLocalActivity, MdEmergency, MdLocalHospital } from "react-icons/md";
import UserAPI from "@/app/services/UserAPI";

// Helper function to dynamically load external Razorpay Script
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

const SERVICE_TYPE_TABS = [
    { key: "all", label: "All Dispatches", icon: FiTruck },
    { key: "accidental", label: "Accident Emergency", icon: MdEmergency },
    { key: "medical", label: "Medical Ambulance", icon: FiActivity },
    { key: "referral", label: "Referral Transfer", icon: MdLocalHospital },
];

const STATUS_PILLS = ['All', 'Searching', 'Confirmed', 'Arrived', 'Picked-Up', 'En-Route', 'Delivered', 'Cancelled'];

export default function AmbulanceBookings() {
    const { user } = useAuth();
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Filter & Pagination States ---
    const [selectedType, setSelectedType] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [activePricingId, setActivePricingId] = useState(null);
    const [paymentProcessingId, setPaymentProcessingId] = useState(null);

    // --- Live Tracking Modal States ---
    const [selectedTrackBooking, setSelectedTrackBooking] = useState(null);
    const [liveTrackData, setLiveTrackData] = useState(null);
    const [trackingLoading, setTrackingLoading] = useState(false);

    // --- Cancel Modal & Auto-Ban Warning States ---
    const [cancelModalBooking, setCancelModalBooking] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);
    const [cancelSuccessResult, setCancelSuccessResult] = useState(null);
    const [bannedAccountAlert, setBannedAccountAlert] = useState(null);

    // --- Rating Modal States ---
    const [rateModalBooking, setRateModalBooking] = useState(null);
    const [ratingValue, setRatingValue] = useState(5);
    const [ratingComment, setRatingComment] = useState("");
    const [submittingRating, setSubmittingRating] = useState(false);

    // --- Post-Booking Photo Upload State ---
    const [photoUploadBooking, setPhotoUploadBooking] = useState(null);
    const [postIncidentPhoto, setPostIncidentPhoto] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    // --- Fetch Data ---
    const fetchBookings = async (page = currentPage, type = selectedType, status = selectedStatus) => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page: page,
                limit: 10,
                type: type !== "all" ? type : undefined,
                status: status !== "All" ? status : undefined
            };

            const res = await UserAPI.myAmbulanceBooking(params);
            if (res.success) {
                setBookings(res.data || []);
                setCurrentPage(res.currentPage || page);
                setTotalPages(res.totalPages || 1);
                setTotalItems(res.totalItems || res.count || (res.data || []).length);
            } else {
                setError(res.message || "Failed to load bookings");
            }
        } catch (err) {
            setError("An error occurred while fetching bookings.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings(currentPage, selectedType, selectedStatus);
    }, [selectedType, selectedStatus, currentPage]);

    const handleTypeChange = (typeKey) => {
        setSelectedType(typeKey);
        setCurrentPage(1);
    };

    const handleStatusChange = (status) => {
        setSelectedStatus(status);
        setCurrentPage(1);
    };

    // --- Live Tracking Details & Real-Time Polling ---
    const fetchLiveTracking = async (bookingId) => {
        try {
            if (UserAPI.getAmbulanceLiveTrack) {
                const res = await UserAPI.getAmbulanceLiveTrack(bookingId);
                if (res.success && res.data) {
                    setLiveTrackData(res.data);
                }
            }
        } catch (err) {
            console.error("Live track fetch error:", err);
        }
    };

    const handleOpenTracking = async (booking) => {
        setSelectedTrackBooking(booking);
        setTrackingLoading(true);
        await fetchLiveTracking(booking._id);
        setTrackingLoading(false);
    };

    useEffect(() => {
        let intervalId;
        if (selectedTrackBooking) {
            intervalId = setInterval(() => {
                fetchLiveTracking(selectedTrackBooking._id);
            }, 10000);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [selectedTrackBooking]);

    // --- 1. Cancel Booking Action ---
    const handleConfirmCancel = async () => {
        if (!cancelModalBooking) return;

        setCancelling(true);
        try {
            const bookingIdentifier = cancelModalBooking._id || cancelModalBooking.bookingId;
            const res = await UserAPI.cancelAmbulanceBooking(bookingIdentifier, {
                reason: cancelReason.trim() || "Patient arranged private vehicle for transit"
            });

            if (res.success) {
                setCancelModalBooking(null);
                setCancelReason("");

                if (res.isBanned) {
                    localStorage.removeItem('userToken');
                    setBannedAccountAlert({
                        message: res.message || "Your account has been suspended for cancelling 2 accidental emergency bookings in a single day."
                    });
                    return;
                }

                setCancelSuccessResult({
                    message: res.message || "Booking cancelled successfully.",
                    cancellationFee: res.data?.cancellationFee ?? 0,
                    refundAmount: res.data?.refundAmount ?? 0,
                    booking: res.data?.booking || {}
                });
                fetchBookings(currentPage, selectedType, selectedStatus);
            } else {
                alert(res.message || "Failed to cancel booking.");
            }
        } catch (err) {
            console.error("Cancellation Error:", err);
            alert("An error occurred while cancelling booking.");
        } finally {
            setCancelling(false);
        }
    };

    // --- 2. Post-Booking Incident Photo Upload Action ---
    const handleUploadPostBookingPhoto = async () => {
        if (!photoUploadBooking || !postIncidentPhoto) return;
        setUploadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append("incidentPhoto", postIncidentPhoto);

            const res = await UserAPI.uploadIncidentPhoto(photoUploadBooking._id, formData);
            if (res.success) {
                alert("Incident photo uploaded and attached to emergency record successfully!");
                setPhotoUploadBooking(null);
                setPostIncidentPhoto(null);
                fetchBookings(currentPage, selectedType, selectedStatus);
            } else {
                alert(res.message || "Failed to upload photo.");
            }
        } catch (err) {
            console.error("Photo Upload Error:", err);
            alert("Error uploading incident photo.");
        } finally {
            setUploadingPhoto(false);
        }
    };

    // --- 3. Rate & Review Handler ---
    const handleSubmitRating = async () => {
        if (!rateModalBooking) return;
        setSubmittingRating(true);
        try {
            const payload = {
                bookingId: rateModalBooking._id || rateModalBooking.bookingId,
                rating: Number(ratingValue),
                comment: ratingComment.trim()
            };

            const res = await UserAPI.addRatingAndReviewAmbulance(payload);
            if (res.success) {
                alert(res.message || "Thank you for rating our emergency ambulance service!");
                setRateModalBooking(null);
                setRatingComment("");
                setRatingValue(5);
                fetchBookings(currentPage, selectedType, selectedStatus);
            } else {
                alert(res.message || "Failed to submit rating.");
            }
        } catch (err) {
            console.error("Rating Error:", err);
            alert("An error occurred while submitting rating.");
        } finally {
            setSubmittingRating(false);
        }
    };

    // --- 4. Razorpay Payment Checkout Flow ---
    const handlePayNow = async (booking) => {
        try {
            setPaymentProcessingId(booking._id);

            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                alert("Failed to load payment gateway. Check your internet connection.");
                setPaymentProcessingId(null);
                return;
            }

            const initResponse = await UserAPI.initiatePaymentAmbulance(booking._id);
            if (!initResponse || !initResponse.success) {
                alert(initResponse?.message || "Failed to initiate payment session.");
                setPaymentProcessingId(null);
                return;
            }

            const { key_id, amount, razorpayOrderId, appointmentId, bookingId } = initResponse;

            const options = {
                key: key_id,
                amount: amount,
                currency: "INR",
                name: "Ambulance Dispatch Services",
                description: `Emergency Transport - Booking ID: ${bookingId}`,
                order_id: razorpayOrderId,
                handler: async function (response) {
                    try {
                        setPaymentProcessingId(booking._id);

                        const verifyPayload = {
                            appointmentId: appointmentId,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        };

                        const verificationRes = await UserAPI.verifyPaymentAmbulance(verifyPayload);
                        if (verificationRes && verificationRes.success) {
                            alert(verificationRes.message || "Payment verified successfully!");
                            fetchBookings(currentPage, selectedType, selectedStatus);
                        } else {
                            alert(verificationRes?.message || "Payment verification failed.");
                        }
                    } catch (verifyError) {
                        console.error("Verification endpoint error:", verifyError);
                        alert("An error occurred while verifying the payment signature.");
                    } finally {
                        setPaymentProcessingId(null);
                    }
                },
                prefill: {
                    name: booking.patientDetails?.name || "Patient",
                    contact: ""
                },
                theme: {
                    color: "#08b36a"
                },
                modal: {
                    ondismiss: function () {
                        setPaymentProcessingId(null);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (initErr) {
            console.error("Initialization process failure:", initErr);
            alert("An error occurred during payment generation.");
            setPaymentProcessingId(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Confirmed": return "bg-green-100 text-green-700 border-green-200";
            case "Arrived": return "bg-purple-100 text-purple-700 border-purple-200";
            case "Picked-Up":
            case "En-Route": return "bg-blue-100 text-blue-700 border-blue-200";
            case "Completed":
            case "Delivered": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "Cancelled": return "bg-red-100 text-red-700 border-red-200";
            case "Searching": return "bg-yellow-100 text-yellow-700 border-yellow-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case "Pending": return "bg-amber-100 text-amber-700 border-amber-200";
            case "Paid": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "Refunded":
            case "Refund-Initiated": return "bg-cyan-100 text-cyan-700 border-cyan-200";
            case "Failed": return "bg-rose-100 text-rose-700 border-rose-200";
            default: return "bg-gray-100 text-gray-600 border-gray-200";
        }
    };

    // =========================================================================
    // 🎯 1. GUEST VS REGISTERED USER DETECTION
    // =========================================================================
    const isRegisteredUser = Boolean(
        user?.email || 
        user?.hasPassword === true || 
        user?.isPasswordSet === true ||
        (user?.isPhoneVerified === true && user?.isShortRegistered === false)
    );

    const hasToken = typeof window !== "undefined" && Boolean(localStorage.getItem("userToken"));
    const isGuestUser = Boolean((user || hasToken) && !isRegisteredUser);

    // =========================================================================
    // 🔍 2. EXTRACT MOBILE NUMBER ENTERED AT TIME OF BOOKING
    // =========================================================================
    const getBookingMobileNumber = () => {
        // Iterate through bookings to find the exact number entered at dispatch
        for (const b of bookings) {
            const num =
                b?.patientDetails?.phone ||
                b?.patientDetails?.phoneNumber ||
                b?.patientDetails?.contactNumber ||
                b?.patientDetails?.patientPhone ||
                b?.patientPhone ||
                b?.contactNumber ||
                b?.userPhone ||
                b?.phone ||
                b?.userId?.phone ||
                b?.userId?.phoneNumber;

            if (num) return String(num).replace("+91", "").replace(/\s+/g, "").trim();
        }

        // Fallback to Auth user phone
        if (user?.phone) return String(user.phone).replace("+91", "").replace(/\s+/g, "").trim();
        if (user?.phoneNumber) return String(user.phoneNumber).replace("+91", "").replace(/\s+/g, "").trim();
        
        // Fallback to LocalStorage
        if (typeof window !== "undefined") {
            const localNum = localStorage.getItem("guestPhone") || localStorage.getItem("phone");
            if (localNum) return String(localNum).replace("+91", "").replace(/\s+/g, "").trim();
        }

        return "";
    };

    const bookingMobileNumber = getBookingMobileNumber();

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* 🌟 GUEST USER ACTION BANNER (SHOWS ONLY FOR GUEST LOGINS) 🌟 */}
                {isGuestUser && (
                    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-3xl p-5 md:p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-orange-400">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shrink-0 backdrop-blur-xs">
                                <FiLock />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-white text-orange-700 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                                        Guest User Account
                                    </span>
                                    <h3 className="font-extrabold text-base md:text-lg leading-tight">
                                        Verify Mobile & Set Permanent Password
                                    </h3>
                                </div>
                                <p className="text-white/90 text-xs font-medium max-w-xl">
                                    You booked via 1-click emergency dispatch. Verify your phone with SMS OTP to lift the 1-time emergency restriction and log in anytime.
                                </p>
                            </div>
                        </div>

                        {/* Button that triggers the OTP flow */}
                        <button
                            onClick={() => setShowVerifyModal(true)}
                            className="bg-white hover:bg-orange-50 text-orange-600 font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider shadow-md whitespace-nowrap transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        >
                            Verify & Set Password →
                        </button>
                    </div>
                )}

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                            Ambulance Bookings <MdVerified className="text-[#08b36a]" />
                        </h1>
                        <p className="text-gray-500 mt-1">Manage your emergency dispatches, live tracking, and records.</p>
                    </div>
                    <div className="text-left sm:text-right">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Records</span>
                        <p className="text-[#08b36a] font-bold">{totalItems} Dispatches</p>
                    </div>
                </div>

                {/* 1. SERVICE TYPE TABS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {SERVICE_TYPE_TABS.map((tab) => {
                        const isSelected = selectedType === tab.key;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => handleTypeChange(tab.key)}
                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs transition-all border cursor-pointer ${
                                    isSelected
                                        ? "bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-slate-400"}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* 2. STATUS FILTER PILLS */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {STATUS_PILLS.map((status) => {
                        const isActive = selectedStatus === status;
                        return (
                            <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 border cursor-pointer ${
                                    isActive
                                        ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                                }`}
                            >
                                {status}
                            </button>
                        );
                    })}
                </div>

                {/* LOADING STATE */}
                {loading && (
                    <div className="py-20 flex flex-col items-center justify-center space-y-3">
                        <div className="w-10 h-10 border-4 border-[#08b36a] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading dispatches...</p>
                    </div>
                )}

                {/* ERROR STATE */}
                {!loading && error && (
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full mx-auto">
                        <div className="bg-red-50 text-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FiAlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h3>
                        <p className="text-gray-500 text-sm mb-6">{error}</p>
                        <button
                            onClick={() => fetchBookings(currentPage, selectedType, selectedStatus)}
                            className="w-full bg-[#08b36a] text-white py-3 rounded-xl font-bold shadow-md transition-all active:scale-98 hover:bg-[#069656] cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* EMPTY STATE */}
                {!loading && !error && bookings.length === 0 && (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                        <div className="bg-gray-50 text-gray-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FiTruck size={32} />
                        </div>
                        <p className="text-gray-700 font-bold text-lg">No bookings found</p>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto mt-1">
                            No ambulance rides found for the selected category & status filters.
                        </p>
                    </div>
                )}

                {/* BOOKINGS LIST */}
                {!loading && !error && (
                    <div className="space-y-6">
                        {bookings.map((item) => {
                            const isPayable = item.status === "Confirmed" && item.paymentStatus === "Pending";
                            const isDelivered = item.status === "Delivered" || item.status === "Completed";
                            const isCancellable = !['Delivered', 'Completed', 'Cancelled'].includes(item.status);
                            const isAlreadyRated = Boolean(item.isRated || item.rating || item.reviewSubmitted);
                            const isAccidental = item.serviceType === "Accident emergency" || item.isFreeCase;

                            return (
                                <div key={item._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">

                                    {/* TOP STRIP */}
                                    <div className="bg-gray-50 px-6 py-3 flex flex-wrap justify-between items-center border-b border-gray-100 gap-2">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {item.bookingId}</span>
                                            <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                            <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getPaymentStatusColor(item.paymentStatus)}`}>
                                                Payment: {item.paymentStatus}
                                            </span>
                                            {item.caseReference && (
                                                <span className="text-xs text-gray-500 font-semibold bg-gray-200/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                    <MdTag className="text-gray-400" /> {item.caseReference}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                            <HiOutlineClock className="text-[#08b36a]" />
                                            {item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString() : new Date(item.createdAt).toLocaleDateString()}
                                            {item.scheduledTime && <span className="text-gray-400">({item.scheduledTime})</span>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row">
                                        {/* IMAGE CONTAINER */}
                                        <div className="w-full md:w-1/3 xl:w-1/4 h-48 md:h-auto shrink-0 relative bg-gray-100 flex items-center justify-center overflow-hidden">
                                            <img
                                                src={item.serviceType === "Referral Ambulance"
                                                    ? "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=600&auto=format&fit=crop&q=80"
                                                    : "https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=600&auto=format&fit=crop&q=80"
                                                }
                                                alt="Ambulance Unit"
                                                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-3 left-3 bg-[#08b36a] text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                                {item.ambulanceId?.vehicleType || "Standard"}
                                            </div>
                                            {item.ambulanceId?.vehicleNumber && (
                                                <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider">
                                                    {item.ambulanceId.vehicleNumber}
                                                </div>
                                            )}
                                        </div>

                                        {/* DETAILS CONTENT */}
                                        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                                            <div>
                                                {/* Row Title */}
                                                <div className="flex justify-between items-start mb-3 gap-2">
                                                    <div>
                                                        <h2 className="text-xl font-bold text-gray-800 tracking-tight leading-tight">
                                                            {item.ambulanceId?.name || "LifeLine Emergency Unit"}
                                                        </h2>
                                                        <p className="text-xs font-semibold text-[#08b36a] mt-0.5 uppercase tracking-wide">
                                                            {item.serviceType} • <span className="text-red-500 font-bold">{item.triageLevel}</span>
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                                                        {isAccidental ? (
                                                            <div className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-lg text-xs font-black tracking-wider">
                                                                <HiShieldCheck size={16} /> Spot Pickup (No OTP)
                                                            </div>
                                                        ) : (
                                                            item.otp && !['Delivered', 'Completed', 'Cancelled'].includes(item.status) && (
                                                                <div className="flex items-center gap-1 bg-emerald-50 text-[#08b36a] border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-black tracking-wider">
                                                                    <HiOutlineKey className="w-3.5 h-3.5" /> PIN: {item.otp}
                                                                </div>
                                                            )
                                                        )}
                                                        {item.rating && (
                                                            <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-lg text-xs font-bold">
                                                                <HiStar className="text-yellow-500" /> {item.rating}/5
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <p className="text-gray-500 text-sm leading-relaxed mb-6 italic bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                                                    "{item.patientDetails?.emergencyDescription || item.patientDetails?.referralReason || item.cancellationReason || "Emergency medical dispatch handover protocol active."}"
                                                </p>

                                                {/* INFO GRID */}
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="bg-green-50 p-2 rounded-xl text-[#08b36a] shrink-0"><FiUser size={18} /></div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Patient</p>
                                                            <p className="text-xs font-bold text-gray-700 truncate">{item.patientDetails?.name || "Unknown Patient"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="bg-green-50 p-2 rounded-xl text-[#08b36a] shrink-0"><FiInfo size={18} /></div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Relation / Condition</p>
                                                            <p className="text-xs font-bold text-gray-700 truncate">
                                                                {item.patientDetails?.relation || "Self"}
                                                                {item.patientDetails?.condition && ` (${item.patientDetails.condition})`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="bg-green-50 p-2 rounded-xl text-[#08b36a] shrink-0"><HiOutlineLocationMarker size={18} /></div>
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Destination</p>
                                                            <p className="text-xs font-bold text-gray-700 truncate" title={item.hospitalId?.name}>
                                                                {item.hospitalId?.name || "Emergency Trauma Unit"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* PICKUP ADDRESS */}
                                                {item.pickupLocation?.address && (
                                                    <div className="flex items-start gap-2 text-xs bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/30 mb-4">
                                                        <HiOutlineLocationMarker className="text-red-500 mt-0.5 shrink-0" size={16} />
                                                        <div>
                                                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-wide">Pickup Point:</span>
                                                            <p className="text-gray-600 font-medium leading-tight">{item.pickupLocation.address}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* INCIDENT PHOTO BADGE OR ADD PHOTO BUTTON */}
                                                {isAccidental && !['Delivered', 'Completed', 'Cancelled'].includes(item.status) && (
                                                    <div className="mb-4">
                                                        {item.patientDetails?.incidentPhoto ? (
                                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg inline-flex items-center gap-1.5">
                                                                <FiCheckCircle size={12} /> Accident Scene Photo Attached
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setPhotoUploadBooking(item);
                                                                    setPostIncidentPhoto(null);
                                                                }}
                                                                className="text-[10px] font-black text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer"
                                                            >
                                                                <FiCamera size={12} /> + Add Accident Scene Photo
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* PRICING BREAKDOWN ACCORDION */}
                                            <div className="border-t border-gray-100 pt-4 pb-2 mb-4">
                                                <button
                                                    onClick={() => setActivePricingId(activePricingId === item._id ? null : item._id)}
                                                    className="w-full flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors cursor-pointer"
                                                >
                                                    <span>Pricing & Fare Breakdowns</span>
                                                    {activePricingId === item._id ? <HiChevronUp size={16} /> : <HiChevronDown size={16} />}
                                                </button>

                                                {activePricingId === item._id && (
                                                    <div className="mt-3 space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
                                                        <div className="flex justify-between text-gray-600">
                                                            <span>Ambulance Vehicle Base Fee</span>
                                                            <span>₹{item.pricing?.ambulanceCharge || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between text-gray-600">
                                                            <span>Supporting Medical Staff Charge</span>
                                                            <span>₹{item.pricing?.supportingStaffCharge || 0}</span>
                                                        </div>
                                                        <div className="flex justify-between text-gray-600 border-t border-dashed border-gray-200 pt-2 font-semibold">
                                                            <span>Subtotal</span>
                                                            <span>₹{item.pricing?.subtotal || 0}</span>
                                                        </div>
                                                        {item.couponDetails?.couponCode && (
                                                            <div className="flex justify-between text-emerald-600 text-xs font-bold">
                                                                <span className="flex items-center gap-1">
                                                                    <MdOutlineLocalActivity /> Coupon Discount ({item.couponDetails.couponCode})
                                                                </span>
                                                                <span>- ₹{item.pricing?.discount || 0}</span>
                                                            </div>
                                                        )}
                                                        {item.pricing?.cancellationFeeApplied > 0 && (
                                                            <div className="flex justify-between text-rose-600 font-bold">
                                                                <span>Cancellation Fee Deducted</span>
                                                                <span>₹{item.pricing.cancellationFeeApplied}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between text-gray-900 font-black border-t border-gray-200 pt-2">
                                                            <span>Total Valuation</span>
                                                            <span>₹{item.pricing?.total || 0}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* FOOTER ACTIONS */}
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-5 border-t border-gray-100 gap-4 mt-auto">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Fare</p>
                                                    <p className="text-2xl font-black text-gray-900">
                                                        {item.pricing?.total > 0 ? `₹${item.pricing.total}` : (item.isFreeCase ? "Free Emergency Dispatch" : "₹0")}
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {isPayable && (
                                                        <button
                                                            onClick={() => handlePayNow(item)}
                                                            disabled={paymentProcessingId === item._id}
                                                            className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-amber-100 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                                                        >
                                                            {paymentProcessingId === item._id ? (
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                <FiCreditCard size={14} />
                                                            )}
                                                            Pay Now
                                                        </button>
                                                    )}

                                                    {isCancellable && (
                                                        <button
                                                            onClick={() => {
                                                                setCancelModalBooking(item);
                                                                setCancelReason("");
                                                            }}
                                                            className="flex-1 sm:flex-none bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-4 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                                                        >
                                                            <FiXCircle size={14} />
                                                            Cancel Ride
                                                        </button>
                                                    )}

                                                    {isDelivered && (
                                                        isAlreadyRated ? (
                                                            <div className="flex-1 sm:flex-none bg-emerald-50 text-[#08b36a] border border-emerald-200 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-default">
                                                                <HiStar className="text-yellow-500" size={16} />
                                                                Feedback Recorded ({item.rating || 5}/5)
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setRateModalBooking(item);
                                                                    setRatingValue(5);
                                                                    setRatingComment("");
                                                                }}
                                                                className="flex-1 sm:flex-none bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                                                            >
                                                                <HiStar className="text-yellow-500" size={16} />
                                                                Rate Trip
                                                            </button>
                                                        )
                                                    )}

                                                    {!['Delivered', 'Completed', 'Cancelled'].includes(item.status) && (
                                                        <button
                                                            onClick={() => handleOpenTracking(item)}
                                                            className="flex-1 sm:flex-none bg-[#08b36a] hover:bg-[#069656] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                                                        >
                                                            <FiNavigation size={14} />
                                                            Live Tracking & Pin
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 3. PAGINATION CONTROLS */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm">
                        <span className="text-xs font-bold text-slate-500">
                            Page {currentPage} of {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                <FiChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                <FiChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

            </div>

            {/* --- VERIFY PHONE & SET PASSWORD MODAL --- */}
            {showVerifyModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-2 md:p-4 shadow-2xl relative border border-gray-100">
                        <VerifyPhoneAndSetPasswordModal 
                            onClose={() => setShowVerifyModal(false)}
                            onSuccess={() => {
                                setShowVerifyModal(false);
                                fetchBookings(currentPage, selectedType, selectedStatus);
                            }}
                            initialPhone={bookingMobileNumber}
                            isLocked={Boolean(bookingMobileNumber)}
                        />
                    </div>
                </div>
            )}

            {/* --- 1. LIVE TRACKING & OTP MODAL --- */}
            {selectedTrackBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                    <FiNavigation className="text-[#08b36a]" /> Live Dispatch Tracking
                                </h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                    Booking ID: {selectedTrackBooking.bookingId}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedTrackBooking(null);
                                    setLiveTrackData(null);
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <HiX size={22} />
                            </button>
                        </div>

                        {trackingLoading && !liveTrackData ? (
                            <div className="py-16 text-center space-y-3">
                                <div className="w-8 h-8 border-3 border-[#08b36a] border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Connecting to GPS Unit...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-slate-900 rounded-2xl p-5 text-white flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                                        <p className="text-lg font-black text-emerald-400">
                                            {liveTrackData?.status || selectedTrackBooking.status}
                                        </p>
                                    </div>
                                    {liveTrackData?.eta && (
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Arrival</p>
                                            <p className="text-xl font-black text-yellow-400 flex items-center justify-end gap-1">
                                                <HiOutlineClock className="w-4 h-4" /> {liveTrackData.eta}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {selectedTrackBooking.serviceType === "Accident emergency" || selectedTrackBooking.isFreeCase ? (
                                    <div className="bg-red-50 rounded-2xl p-4 border border-red-200 text-center space-y-1">
                                        <p className="text-xs font-black text-red-600 uppercase tracking-wider flex items-center justify-center gap-1.5">
                                            <HiShieldCheck size={16} /> Direct Spot Pickup Protocol
                                        </p>
                                        <p className="text-[11px] text-slate-500 font-medium">No pickup PIN required. Driver will assist immediately on scene.</p>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-200 text-center space-y-2">
                                        <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest flex items-center justify-center gap-1.5">
                                            <HiOutlineKey className="w-4 h-4" /> 6-Digit Pickup OTP PIN
                                        </p>
                                        <p className="text-4xl font-black text-slate-900 tracking-[0.25em]">
                                            {liveTrackData?.otp || selectedTrackBooking.otp || "------"}
                                        </p>
                                        <p className="text-xs font-semibold text-slate-500">
                                            Show this verification PIN to the ambulance crew upon arrival
                                        </p>
                                    </div>
                                )}

                                {liveTrackData?.driver && (
                                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Driver & Vehicle</p>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-[#08b36a] overflow-hidden shrink-0 font-black text-lg">
                                                    {liveTrackData.driver.profilePic ? (
                                                        <img src={liveTrackData.driver.profilePic} alt={liveTrackData.driver.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FiUser />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                                                        {liveTrackData.driver.name}
                                                        {liveTrackData.driver.rating && (
                                                            <span className="flex items-center gap-0.5 text-xs text-yellow-600 bg-yellow-100/70 px-1.5 py-0.5 rounded-md font-bold">
                                                                <HiStar className="text-yellow-500" /> {liveTrackData.driver.rating}
                                                            </span>
                                                        )}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 font-medium">
                                                        {liveTrackData.driver.trips || "Verified Driver"} {liveTrackData.driver.totalReviews ? `• ${liveTrackData.driver.totalReviews} Reviews` : ""}
                                                    </p>
                                                </div>
                                            </div>

                                            {liveTrackData.driver.phone && (
                                                <a
                                                    href={`tel:${liveTrackData.driver.phone}`}
                                                    className="p-3 bg-[#08b36a] text-white rounded-xl hover:bg-[#069656] shadow-sm transition-all active:scale-95 flex items-center gap-1 text-xs font-bold"
                                                >
                                                    <FiPhoneCall size={16} />
                                                </a>
                                            )}
                                        </div>

                                        {liveTrackData.vehicle && (
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-200/60 text-xs">
                                                <div>
                                                    <span className="text-gray-400 font-bold uppercase text-[9px] block">Vehicle Type</span>
                                                    <span className="font-bold text-gray-800">{liveTrackData.vehicle.type || "Ambulance"}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-gray-400 font-bold uppercase text-[9px] block">Plate Number</span>
                                                    <span className="font-mono font-black text-gray-900 bg-gray-200 px-2 py-0.5 rounded text-[11px]">
                                                        {liveTrackData.vehicle.plateNumber}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                onClick={() => {
                                    setSelectedTrackBooking(null);
                                    setLiveTrackData(null);
                                }}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                            >
                                Close Tracking
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 2. CANCEL RIDE MODAL --- */}
            {cancelModalBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-100 space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-2.5 text-rose-600">
                                <div className="p-2 bg-rose-50 rounded-xl">
                                    <FiXCircle size={20} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900">Cancel Ambulance</h3>
                            </div>
                            <button
                                onClick={() => setCancelModalBooking(null)}
                                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
                            >
                                <HiX size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                Are you sure you want to cancel dispatch for Booking <b>#{cancelModalBooking.bookingId}</b>?
                            </p>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Reason for Cancellation (Optional)
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="Enter your cancellation reason here..."
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold outline-none resize-none focus:border-rose-400"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setCancelModalBooking(null)}
                                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                            >
                                Keep Ride
                            </button>
                            <button
                                onClick={handleConfirmCancel}
                                disabled={cancelling}
                                className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-rose-200 cursor-pointer"
                            >
                                {cancelling ? "Cancelling..." : "Confirm Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 3. AUTO-BAN SUSPENSION WARNING DIALOG --- */}
            {bannedAccountAlert && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-in zoom-in duration-200">
                    <div className="bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl border-2 border-red-200 text-center space-y-6">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                            <FiAlertOctagon size={36} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-red-600 uppercase tracking-tight">Account Suspended</h3>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                {bannedAccountAlert.message}
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 font-semibold text-left space-y-1">
                            <p className="font-bold text-slate-700">Need Immediate Help?</p>
                            <p>Contact Admin Support: <b className="text-slate-900">+91 98765 43210</b></p>
                            <p>Email: <b className="text-slate-900">emergency-support@hospital.com</b></p>
                        </div>
                        <button
                            onClick={() => {
                                setBannedAccountAlert(null);
                                window.location.href = '/ambulance';
                            }}
                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-red-200 cursor-pointer"
                        >
                            Understood (Exit to Home)
                        </button>
                    </div>
                </div>
            )}

            {/* --- 4. CANCELLATION SUMMARY SUCCESS DIALOG --- */}
            {cancelSuccessResult && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-100 space-y-6 text-center">
                        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                            <FiCheckCircle size={32} />
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900">Ride Cancelled</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                {cancelSuccessResult.message}
                            </p>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5 text-xs text-left">
                            <div className="flex justify-between text-slate-600">
                                <span className="font-semibold">Cancellation Fee Applied</span>
                                <span className="font-bold text-rose-600">₹{cancelSuccessResult.cancellationFee}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span className="font-semibold">Refund Amount</span>
                                <span className="font-bold text-emerald-600">₹{cancelSuccessResult.refundAmount}</span>
                            </div>
                            {cancelSuccessResult.booking?.paymentStatus && (
                                <div className="flex justify-between border-t border-slate-200 pt-2 text-slate-700">
                                    <span className="font-semibold">Payment Status</span>
                                    <span className="font-bold uppercase text-[10px] bg-slate-200 px-2 py-0.5 rounded">
                                        {cancelSuccessResult.booking.paymentStatus}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setCancelSuccessResult(null)}
                            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}

            {/* --- 5. POST-BOOKING PHOTO UPLOAD MODAL --- */}
            {photoUploadBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-100 space-y-6 text-center">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <h3 className="text-lg font-black text-slate-900">Add Accident Photo</h3>
                            <button onClick={() => setPhotoUploadBooking(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <HiX size={20} />
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 font-medium">
                            Upload a photo of the accident spot or vehicle for Booking <b>#{photoUploadBooking.bookingId}</b>
                        </p>

                        <label className="cursor-pointer block border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 bg-slate-50 hover:bg-slate-100 transition-all">
                            {postIncidentPhoto ? (
                                <p className="text-xs font-bold text-emerald-600 truncate">{postIncidentPhoto.name}</p>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <FiCamera size={28} className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-600">Select image from gallery or camera</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setPostIncidentPhoto(e.target.files[0])}
                            />
                        </label>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setPhotoUploadBooking(null)}
                                className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-2xl text-xs font-black uppercase cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUploadPostBookingPhoto}
                                disabled={uploadingPhoto || !postIncidentPhoto}
                                className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-2xl text-xs font-black uppercase shadow-md shadow-blue-100 cursor-pointer"
                            >
                                {uploadingPhoto ? "Saving..." : "Upload Photo"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- 6. RATE & REVIEW POPUP MODAL --- */}
            {rateModalBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-gray-100 space-y-6 text-center">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <h3 className="text-lg font-black text-slate-900">Rate Your Ambulance Trip</h3>
                            <button onClick={() => setRateModalBooking(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                                <HiX size={20} />
                            </button>
                        </div>

                        <p className="text-xs text-slate-500">
                            How was your emergency transport experience with {rateModalBooking.ambulanceId?.name || "the dispatch unit"}?
                        </p>

                        <div className="flex justify-center gap-2 py-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRatingValue(star)}
                                    className="p-1 hover:scale-125 transition-transform cursor-pointer"
                                >
                                    <HiStar
                                        size={36}
                                        className={star <= ratingValue ? "text-yellow-400 fill-current" : "text-slate-200"}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <FiMessageSquare size={12} /> Feedback / Comments (Optional)
                            </label>
                            <textarea
                                rows="3"
                                placeholder="E.g., Driver arrived within 5 minutes with full oxygen support. Highly professional!"
                                value={ratingComment}
                                onChange={(e) => setRatingComment(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-[#08b36a] rounded-2xl p-4 text-xs font-semibold outline-none resize-none"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setRateModalBooking(null)}
                                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer"
                            >
                                Later
                            </button>
                            <button
                                onClick={handleSubmitRating}
                                disabled={submittingRating}
                                className="flex-1 py-3.5 bg-[#08b36a] hover:bg-[#069656] disabled:bg-emerald-300 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-100 cursor-pointer"
                            >
                                {submittingRating ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}