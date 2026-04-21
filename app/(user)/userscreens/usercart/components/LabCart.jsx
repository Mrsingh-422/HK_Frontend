"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaPlus, FaMinus, FaShieldAlt,
    FaPrescriptionBottleAlt, FaTag, FaSpinner, FaArrowLeft, FaCheckCircle, FaTicketAlt, FaUserCircle, FaWalking, FaHome, FaBolt, FaMapMarkerAlt
} from 'react-icons/fa';
import { useCart } from '@/app/context/CartContext';
import toast from 'react-hot-toast';
import UserAPI from '@/app/services/UserAPI';
import SlotSelectionModal from './SlotSelectionModal';
import FamilyMemberModal from './FamilyMemberModal';

const LabCart = () => {
    const router = useRouter();
    const { cart, updateQuantity, removeItem, loading } = useCart();

    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCouponName, setAppliedCouponName] = useState(null);
    const [serverDiscount, setServerDiscount] = useState(0);
    const [isValidating, setIsValidating] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Collection Method State
    const [collectionMethod, setCollectionMethod] = useState('Walk-in'); // 'Walk-in' or 'Home'

    // Address State
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddressLoading, setIsAddressLoading] = useState(false);

    // Delivery Charges State
    const [deliveryConfig, setDeliveryConfig] = useState(null);
    const [isFastDelivery, setIsFastDelivery] = useState(false);
    const [userDistance, setUserDistance] = useState(0);

    // Patient & Slot State (MODIFIED: selectedMembers is now an Array)
    const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
    const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const labItems = useMemo(() => cart?.items || [], [cart]);
    const currentLabId = useMemo(() => cart?.labId?._id, [cart]);

    // Validation: Home collection allowed only for Pathology
    const isHomeCollectionAllowed = useMemo(() => {
        return cart?.categoryType === 'Pathology';
    }, [cart?.categoryType]);

    // Force Walk-in if Radiology is detected
    useEffect(() => {
        if (!isHomeCollectionAllowed && collectionMethod === 'Home') {
            setCollectionMethod('Walk-in');
        }
    }, [isHomeCollectionAllowed, collectionMethod]);

    // BASE SUBTOTAL (Items * Quantity)
    const baseSubtotal = useMemo(() => {
        return labItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }, [labItems]);

    // MULTIPLIED SUBTOTAL (Base * Number of Patients)
    const subtotal = useMemo(() => {
        const multiplier = selectedMembers.length || 1;
        return baseSubtotal * multiplier;
    }, [baseSubtotal, selectedMembers]);

    const fetchSuggested = useCallback(async () => {
        if (labItems.length === 0) return;
        try {
            const response = await UserAPI.getCouponsForCart();
            if (response.success) setAvailableCoupons(response.data);
        } catch (error) {
            console.error("Fetch Coupons Error:", error);
        }
    }, [labItems.length]);

    // Fetch Delivery Charges Configuration
    const fetchDeliveryCharges = useCallback(async () => {
        if (!currentLabId) return;
        try {
            const res = await UserAPI.getLabDeliveryCharges({ labId: currentLabId });
            if (res.success) {
                setDeliveryConfig(res.data);
            }
        } catch (error) {
            console.error("Error fetching delivery charges:", error);
        }
    }, [currentLabId]);

    // Fetch Addresses from API
    const fetchAddresses = useCallback(async () => {
        setIsAddressLoading(true);
        try {
            const res = await UserAPI.getUserAddresses();
            if (res.success) {
                setAddresses(res.data);
                const defaultAddr = res.data.find(a => a.isDefault);
                if (defaultAddr) setSelectedAddress(defaultAddr);
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
        } finally {
            setIsAddressLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSuggested();
        fetchDeliveryCharges();
        fetchAddresses();
    }, [fetchSuggested, fetchDeliveryCharges, fetchAddresses]);

    const handleApplyCoupon = async (name) => {
        const codeToApply = name || couponCode;
        if (!codeToApply) return toast.error("Please enter a coupon code");
        if (!currentLabId) return toast.error("Lab information missing");

        setIsValidating(true);
        try {
            const res = await UserAPI.validateCouponCart(codeToApply.toUpperCase(), currentLabId, subtotal);
            if (res.success) {
                setAppliedCouponName(codeToApply.toUpperCase());
                setServerDiscount(res.discount);
                setCouponCode("");
                toast.success(`Coupon Applied! Saved ₹${res.discount}`);
            }
        } catch (error) {
            setAppliedCouponName(null);
            setServerDiscount(0);
            const errorMsg = error.response?.data?.message || "Invalid or Expired Coupon";
            toast.error(errorMsg);
        } finally {
            setIsValidating(false);
        }
    };

    useEffect(() => {
        if (appliedCouponName) {
            handleApplyCoupon(appliedCouponName);
        }
    }, [subtotal]);

    const totals = useMemo(() => {
        const extraFee = selectedAppointment?.slot?.extraFee || 0;
        const discountedAmount = Math.max(0, subtotal - serverDiscount);

        let homeCollectionFee = 0;
        let distanceFee = 0;
        let fastReportFee = 0;
        let taxAmount = 0;

        if (deliveryConfig) {
            if (isFastDelivery) {
                fastReportFee = deliveryConfig.fastDeliveryExtra;
            }
            if (collectionMethod === 'Home') {
                if (subtotal < deliveryConfig.freeDeliveryThreshold) {
                    homeCollectionFee = deliveryConfig.fixedPrice;
                }
                if (userDistance > deliveryConfig.fixedDistance) {
                    distanceFee = (userDistance - deliveryConfig.fixedDistance) * deliveryConfig.pricePerKM;
                }
            }
            if (deliveryConfig.taxPercentage > 0) {
                taxAmount = (discountedAmount * deliveryConfig.taxPercentage) / 100;
            }
            taxAmount += (deliveryConfig.taxInRupees || 0);
        }

        const total = discountedAmount + extraFee + homeCollectionFee + distanceFee + fastReportFee + taxAmount;

        return {
            subtotal,
            baseSubtotal,
            multiplier: selectedMembers.length || 1,
            discount: serverDiscount,
            extraFee,
            homeCollectionFee,
            distanceFee,
            fastReportFee,
            taxAmount,
            total
        };
    }, [subtotal, baseSubtotal, selectedMembers, serverDiscount, selectedAppointment, collectionMethod, deliveryConfig, userDistance, isFastDelivery]);

    const handleQtyChange = (itemId, currentQty, action) => {
        if (action === 'dec' && currentQty <= 1) return toast.error("Quantity cannot be less than 1");
        updateQuantity(itemId, action);
    };

    const onFamilyConfirm = (membersList) => {
        setSelectedMembers(membersList);
        setIsFamilyModalOpen(false);
        if (!selectedAppointment) setIsSlotModalOpen(true);
    };

    const onSlotConfirm = (date, slot) => {
        setSelectedAppointment({ date, slot });
        setIsSlotModalOpen(false);
        toast.success(`Slot selected: ${slot.time}`);
    };

    const handleProceed = async () => {
        if (collectionMethod === 'Home' && !selectedAddress) {
            return toast.error("Please select a home collection address");
        }
        if (selectedMembers.length === 0) {
            setIsFamilyModalOpen(true);
        } else if (!selectedAppointment) {
            setIsSlotModalOpen(true);
        } else {
            // HIT checkoutLabCart API
            setIsCheckingOut(true);
            try {
                const payload = {
                    appointmentDate: selectedAppointment.date,
                    appointmentTime: selectedAppointment.slot.time,

                    selectedPatientIds: selectedMembers.map(m =>
                        m.relation === 'Self' ? 'Self' : m._id
                    ),

                    collectionType: collectionMethod === 'Home Collection'
                        ? "Home Collection"
                        : "Visit Lab",

                    address: collectionMethod === 'Home' ? {
                        addressType: selectedAddress.addressType,
                        name: selectedAddress.name,
                        phone: selectedAddress.phone,
                        houseNo: selectedAddress.houseNo,
                        sector: selectedAddress.sector,
                        landmark: selectedAddress.landmark,
                        city: selectedAddress.city,
                        state: selectedAddress.state,
                        country: selectedAddress.country,
                        pincode: selectedAddress.pincode,
                        isDefault: selectedAddress.isDefault,
                        _id: selectedAddress._id
                    } : null,

                    isRapid: isFastDelivery,
                    couponCode: appliedCouponName || "",
                    paymentMethod: "COD"
                };

                const res = await UserAPI.checkoutLabCart(payload);
                if (res.success) {
                    toast.success("Order Placed Successfully!");
                    router.push('/checkout/success');
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Checkout failed");
            } finally {
                setIsCheckingOut(false);
            }
        }
    };

    if (loading && labItems.length === 0) {
        return <div className="p-20 text-center font-bold text-slate-400 animate-pulse uppercase tracking-widest">Loading Lab Cart...</div>;
    }

    if (labItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <FaPrescriptionBottleAlt className="text-slate-100 text-7xl mb-6" />
                <h2 className="text-2xl font-black text-slate-800">Lab Cart is Empty</h2>
                <button onClick={() => router.push('/')} className="mt-8 bg-emerald-600 text-white px-10 py-3 rounded-2xl font-black uppercase text-sm tracking-widest">Browse Tests</button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* LEFT: LAB ITEMS */}
                    <div className="flex-1 w-full space-y-4">
                        {/* COLLECTION METHOD SELECTION */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Choose Collection Method</h3>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setCollectionMethod('Walk-in')}
                                    className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${collectionMethod === 'Walk-in' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                                >
                                    <FaWalking size={20} />
                                    <span className="text-sm font-bold">Walk-in at Lab</span>
                                </button>
                                <button
                                    disabled={!isHomeCollectionAllowed}
                                    onClick={() => setCollectionMethod('Home')}
                                    className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${!isHomeCollectionAllowed ? 'opacity-40 cursor-not-allowed grayscale border-gray-100 bg-gray-50' : collectionMethod === 'Home' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                                >
                                    <FaHome size={20} />
                                    <span className="text-sm font-bold">Home Collection</span>
                                </button>
                            </div>
                            {!isHomeCollectionAllowed && (
                                <p className="text-[10px] text-rose-500 font-bold mt-3 uppercase tracking-tighter">* Home collection not available for {cart?.categoryType} tests</p>
                            )}

                            {/* ADDRESS SELECTION SECTION */}
                            {collectionMethod === 'Home' && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Address</h3>
                                        <button onClick={() => router.push('/profile/addresses')} className="text-[10px] font-bold text-emerald-600 uppercase">+ Add New</button>
                                    </div>

                                    {isAddressLoading ? (
                                        <div className="flex justify-center py-4"><FaSpinner className="animate-spin text-emerald-500" /></div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {addresses.map((addr) => (
                                                <div
                                                    key={addr._id}
                                                    onClick={() => setSelectedAddress(addr)}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress?._id === addr._id ? 'border-emerald-600 bg-emerald-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <FaMapMarkerAlt className={selectedAddress?._id === addr._id ? 'text-emerald-600 mt-1' : 'text-gray-400 mt-1'} />
                                                        <div className="flex-1">
                                                            <div className="flex justify-between">
                                                                <span className="text-xs font-black text-gray-900 uppercase">{addr.addressType}</span>
                                                            </div>
                                                            <p className="text-[11px] font-bold text-gray-700 mt-1">{addr.name}</p>
                                                            <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                                                                H.No {addr.houseNo}, {addr.city}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* SELECTION SUMMARY */}
                        {(selectedMembers.length > 0 || selectedAppointment || (collectionMethod === 'Home' && selectedAddress)) && (
                            <div className="bg-white border border-emerald-100 rounded-xl p-4 flex flex-wrap gap-4 items-center">
                                {selectedMembers.length > 0 && (
                                    <div className="flex items-center gap-2 border-r pr-4 border-gray-100">
                                        <FaUserCircle className="text-emerald-500" />
                                        <span className="text-xs font-bold text-gray-700">Patients: {selectedMembers.map(m => m.memberName).join(", ")}</span>
                                    </div>
                                )}
                                {selectedAppointment && (
                                    <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 border-r pr-4 border-gray-100">
                                        <FaCheckCircle /> Slot: {selectedAppointment.date} @ {selectedAppointment.slot.time}
                                    </div>
                                )}
                                <button
                                    onClick={() => { setSelectedMembers([]); setSelectedAppointment(null); setSelectedAddress(null); }}
                                    className="text-[10px] font-bold text-rose-500 uppercase ml-auto underline"
                                >
                                    Reset
                                </button>
                            </div>
                        )}

                        {labItems.map((item) => (
                            <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-5 shadow-sm">
                                <div className="w-16 h-16 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 flex-shrink-0"><FaPrescriptionBottleAlt size={24} /></div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.name}</h3>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">{item.productType}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900 text-lg">₹{(item.price * item.quantity * (selectedMembers.length || 1)).toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-400">₹{item.price} x {selectedMembers.length || 1} Patient(s)</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center border border-gray-200 rounded-lg w-fit overflow-hidden">
                                        <button onClick={() => handleQtyChange(item.itemId, item.quantity, 'dec')} className="px-3 py-1 bg-gray-50 hover:bg-gray-100"><FaMinus size={10} /></button>
                                        <span className="px-4 text-sm font-bold">{item.quantity}</span>
                                        <button onClick={() => handleQtyChange(item.itemId, item.quantity, 'inc')} className="px-3 py-1 bg-gray-50 hover:bg-gray-100"><FaPlus size={10} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT: BILLING & COUPONS */}
                    <div className="w-full lg:w-[400px] space-y-6">

                        {/* COUPON SECTION (PRESERVED) */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><FaTicketAlt className="text-emerald-500" /> Apply Coupon</h3>
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    placeholder={appliedCouponName || "Enter code"}
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    disabled={!!appliedCouponName}
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:border-emerald-500 disabled:opacity-50"
                                />
                                {appliedCouponName ? (
                                    <button onClick={() => { setAppliedCouponName(null); setServerDiscount(0); }} className="bg-rose-50 text-rose-600 px-4 rounded-lg text-xs font-bold border border-rose-100">REMOVE</button>
                                ) : (
                                    <button onClick={() => handleApplyCoupon()} disabled={isValidating || !couponCode} className="bg-gray-900 text-white px-6 rounded-lg text-xs font-bold">
                                        {isValidating ? <FaSpinner className="animate-spin" /> : "APPLY"}
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                {availableCoupons.map((coupon) => (
                                    <div
                                        key={coupon._id}
                                        onClick={() => !appliedCouponName && coupon.isApplicable && handleApplyCoupon(coupon.couponName)}
                                        className={`p-3 rounded-lg border text-xs transition-all ${appliedCouponName === coupon.couponName ? "border-emerald-500 bg-emerald-50" : coupon.isApplicable ? "border-gray-100 bg-gray-50 cursor-pointer" : "opacity-40 grayscale cursor-not-allowed"}`}
                                    >
                                        <div className="flex justify-between font-bold text-gray-800">
                                            <span>{coupon.couponName}</span>
                                            {appliedCouponName === coupon.couponName && <FaCheckCircle className="text-emerald-600" />}
                                        </div>
                                        <p className="text-gray-500 text-[10px]">Get {coupon.discountPercentage}% OFF (Max ₹{coupon.maxDiscount})</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ORDER SUMMARY (CLEAN & DETAILED) */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-black text-gray-900 mb-5">Order Summary</h2>
                            <div className="space-y-3 pb-5 border-b border-gray-100 text-sm">
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Items Subtotal</span>
                                    <span className="text-gray-900">₹{totals.baseSubtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Patient Multiplier</span>
                                    <span className="text-gray-900 font-bold">x {totals.multiplier}</span>
                                </div>
                                <div className="flex justify-between text-emerald-700 font-black pt-1">
                                    <span>Cart Total</span>
                                    <span>₹{totals.subtotal.toLocaleString()}</span>
                                </div>

                                {totals.discount > 0 && <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg"><span>Coupon Discount</span><span>-₹{totals.discount.toLocaleString()}</span></div>}

                                <div className="pt-2 space-y-2">
                                    <div className="flex justify-between text-gray-500 text-xs"><span>Collection ({collectionMethod})</span><span className="font-semibold text-gray-900">{totals.homeCollectionFee === 0 ? 'FREE' : `+₹${totals.homeCollectionFee}`}</span></div>
                                    {totals.fastReportFee > 0 && <div className="flex justify-between text-amber-600 text-xs font-bold"><span>Fast Report Delivery</span><span>+₹{totals.fastReportFee}</span></div>}
                                    <div className="flex justify-between text-gray-500 text-xs"><span>Taxes & Service Fees</span><span className="font-semibold text-gray-900">+₹{Math.round(totals.taxAmount).toLocaleString()}</span></div>
                                    {totals.extraFee > 0 && <div className="flex justify-between text-amber-600 text-xs font-bold"><span>Urgent Slot Fee</span><span>+₹{totals.extraFee.toLocaleString()}</span></div>}
                                </div>
                            </div>

                            <div className="py-5 flex justify-between items-center">
                                <span className="font-black text-gray-400 text-[10px] uppercase tracking-widest">Grand Total</span>
                                <span className="text-2xl font-black text-gray-900">₹{Math.round(totals.total).toLocaleString()}</span>
                            </div>

                            <button onClick={handleProceed} disabled={isCheckingOut} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 uppercase">
                                {isCheckingOut ? <FaSpinner className="animate-spin" /> : selectedMembers.length === 0 ? "Select Patients" : !selectedAppointment ? "Select Time Slot" : "Confirm & Pay COD"} <FaShieldAlt />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <FamilyMemberModal
                isOpen={isFamilyModalOpen}
                onClose={() => setIsFamilyModalOpen(false)}
                onConfirm={onFamilyConfirm}
                initialSelected={selectedMembers}
            />
            <SlotSelectionModal
                isOpen={isSlotModalOpen}
                onClose={() => setIsSlotModalOpen(false)}
                labId={currentLabId}
                onConfirm={onSlotConfirm}
            />
        </div>
    );
};

export default LabCart;