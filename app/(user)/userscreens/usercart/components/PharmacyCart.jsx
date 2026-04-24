"use client";

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaPills, FaSpinner, FaTruck, FaFilePrescription, FaPrescriptionBottleAlt, FaMinus, FaPlus, FaClock, FaCalendarAlt, FaChevronRight, FaCamera, FaTrash, FaCheckCircle, FaStore, FaShieldAlt } from 'react-icons/fa';
import { useCart } from '@/app/context/CartContext';
import toast from 'react-hot-toast';
import UserAPI from '@/app/services/UserAPI';

// Import Modular Components
import PharmacyAddressSection from './PharmacyAddressSection';
import PharmacyCouponSection from './PharmacyCouponSection';
import PharmacyBillingSummary from './PharmacyBillingSummary';
import PharmacyDeliverySection from './PharmacyDeliverySection';
import PharmacySlotModal from './PharmacySlotModal';

const PharmacyCart = () => {
    const router = useRouter();
    const { pharmacyCart, updatePharmacyCartQuantity, loading, removePharmacyItem, clearFullCart } = useCart();

    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCouponName, setAppliedCouponName] = useState(null);
    const [serverDiscount, setServerDiscount] = useState(0);
    const [isValidating, setIsValidating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddressLoading, setIsAddressLoading] = useState(false);

    // Delivery & Slot States
    const [deliveryOption, setDeliveryOption] = useState('fast');
    const [collectionType, setCollectionType] = useState('Home Delivery'); // "Home Delivery" or "Self Pickup"
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [rawSlotData, setRawSlotData] = useState(null);
    const [slotFee, setSlotFee] = useState(0);
    const [deliveryChargesConfig, setDeliveryChargesConfig] = useState(null);
    const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

    // Prescription State
    const [prescriptionFiles, setPrescriptionFiles] = useState([]);

    const pharmacyItems = useMemo(() => pharmacyCart?.items || [], [pharmacyCart]);
    const pharmacyId = useMemo(() => pharmacyCart?.pharmacyId?._id || pharmacyCart?.pharmacyId, [pharmacyCart]);

    const subtotal = useMemo(() => {
        return pharmacyItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }, [pharmacyItems]);

    const needsPrescription = useMemo(() => {
        return pharmacyItems.some(item => item.medicineId?.prescription_required === "YES");
    }, [pharmacyItems]);

    // FIXED: Improved handleFileChange to ensure upload triggers every time
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (prescriptionFiles.length + files.length > 5) {
            return toast.error("Maximum 5 prescription images allowed");
        }
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        if (validFiles.length !== files.length) {
            toast.error("Only image files are allowed");
        }
        
        setPrescriptionFiles(prev => [...prev, ...validFiles]);
        
        // CRITICAL: Reset the input value so the same file can be picked again if deleted
        e.target.value = null;
        
        if (validFiles.length > 0) {
            toast.success(`${validFiles.length} file(s) added to prescription list`);
        }
    };

    const removeFile = (index) => {
        setPrescriptionFiles(prev => prev.filter((_, i) => i !== index));
    };

    const fetchDeliveryCharges = useCallback(async () => {
        if (!pharmacyId) return;
        try {
            const res = await UserAPI.getPharmacyDeliveryCharges({ vendorId: pharmacyId });
            if (res.success) setDeliveryChargesConfig(res.data);
        } catch (error) { console.error("Delivery Charge Error:", error); }
    }, [pharmacyId]);

    const fetchSuggested = useCallback(async () => {
        if (pharmacyItems.length === 0) return;
        try {
            const response = await UserAPI.getPharmacyCoupons();
            if (response.success) setAvailableCoupons(response.data);
        } catch (error) { console.error(error); }
    }, [pharmacyItems.length]);

    const fetchAddresses = useCallback(async () => {
        setIsAddressLoading(true);
        try {
            const res = await UserAPI.getUserAddresses();
            if (res.success) {
                setAddresses(res.data);
                const defaultAddr = res.data.find(a => a.isDefault);
                if (defaultAddr) setSelectedAddress(defaultAddr);
            }
        } catch (error) { console.error(error); }
        finally { setIsAddressLoading(false); }
    }, []);

    useEffect(() => {
        fetchSuggested();
        fetchAddresses();
        fetchDeliveryCharges();
    }, [fetchSuggested, fetchAddresses, fetchDeliveryCharges]);

    const handleApplyCoupon = async (name) => {
        const codeToApply = name || couponCode;
        if (!codeToApply) return toast.error("Please enter a coupon code");
        if (!pharmacyId) return toast.error("Pharmacy information missing");
        setIsValidating(true);
        try {
            const res = await UserAPI.validatePharmacyCoupon(codeToApply.toUpperCase(), pharmacyId, subtotal);
            if (res.success) {
                setAppliedCouponName(codeToApply.toUpperCase());
                setServerDiscount(res.discount);
                setCouponCode("");
                toast.success(`Coupon Applied! Saved ₹${res.discount}`);
            }
        } catch (error) {
            setAppliedCouponName(null);
            setServerDiscount(0);
            toast.error(error.response?.data?.message || "Invalid Coupon");
        } finally { setIsValidating(false); }
    };

    useEffect(() => {
        if (appliedCouponName) handleApplyCoupon(appliedCouponName);
    }, [subtotal]);

    const handleSetDeliveryOption = (option) => {
        setDeliveryOption(option);
        if (option !== 'slot') {
            setSlotFee(0);
            setSelectedSlot(null);
            setRawSlotData(null);
        }
    };

    const totals = useMemo(() => {
        const discountedAmount = Math.max(0, subtotal - serverDiscount);
        let shippingFee = 40;
        let freeThreshold = 500;

        if (deliveryChargesConfig) {
            freeThreshold = deliveryChargesConfig.freeDeliveryThreshold;
            shippingFee = subtotal >= freeThreshold ? 0 : (deliveryChargesConfig.fixedPrice || 40);
        } else {
            shippingFee = subtotal >= 500 ? 0 : 40;
        }

        if (collectionType === 'Self Pickup') shippingFee = 0;

        const fastFee = (deliveryOption === 'fast' && deliveryChargesConfig && collectionType === 'Home Delivery') ? deliveryChargesConfig.fastDeliveryExtra : 0;
        const currentSlotFee = (deliveryOption === 'slot' && collectionType === 'Home Delivery') ? slotFee : 0;
        const tax = deliveryChargesConfig?.taxInRupees || 0;

        return {
            subtotal,
            discount: serverDiscount,
            shippingFee,
            fastFee,
            slotFee: currentSlotFee,
            tax,
            freeThreshold,
            total: discountedAmount + shippingFee + fastFee + currentSlotFee + tax
        };
    }, [subtotal, serverDiscount, slotFee, deliveryOption, deliveryChargesConfig, collectionType]);

    // --- FINAL CHECKOUT HANDLER (FIXED FOR MULTIPART) ---
    const onConfirmCheckout = async () => {
        if (collectionType === 'Home Delivery' && !selectedAddress) return toast.error("Please select a delivery address");
        
        // Prescription Validation
        if (needsPrescription && prescriptionFiles.length === 0) {
            return toast.error("One or more medicines in your cart require a valid prescription. Please upload it.");
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();

            // 1. Appointment Date/Time Logic
            let appDate = new Date().toISOString().split('T')[0];
            let appTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

            if (deliveryOption === 'slot' && rawSlotData) {
                appDate = rawSlotData.date; 
                appTime = rawSlotData.time; 
            }

            // 2. Append Text Fields (Exactly as per backend endpoint specs)
            formData.append('appointmentDate', appDate);
            formData.append('appointmentTime', appTime);
            formData.append('collectionType', collectionType);
            formData.append('isRapid', deliveryOption === 'fast' ? "true" : "false");
            formData.append('paymentMethod', "COD");

            // Address as Stringified JSON
            if (selectedAddress) {
                formData.append('address', JSON.stringify({
                    name: selectedAddress.name,
                    phone: selectedAddress.phone,
                    houseNo: selectedAddress.houseNo,
                    city: selectedAddress.city,
                    pincode: selectedAddress.pincode,
                    state: selectedAddress.state,
                    landmark: selectedAddress.landmark,
                    addressType: selectedAddress.addressType
                }));
            }

            if (appliedCouponName) formData.append('couponName', appliedCouponName);

            // 3. Append Files (Array of Files)
            prescriptionFiles.forEach((file) => {
                formData.append('prescriptionImages', file);
            });

            // Call API
            const res = await UserAPI.checkoutPharmacyOrder(formData);

            if (res.success) {
                toast.success("Order Placed Successfully!");
                await clearFullCart();
                router.push(`/order-success/pharmacy?id=${res.data?._id || ''}`);
            }
        } catch (error) {
            console.error("Checkout Error:", error);
            toast.error(error.response?.data?.message || "Failed to place order");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading && pharmacyItems.length === 0) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">Syncing Pharmacy Cart...</div>;

    if (pharmacyItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <FaPills className="text-slate-100 text-7xl mb-6" />
                <h2 className="text-2xl font-black text-slate-800">Pharmacy Cart is Empty</h2>
                <button onClick={() => router.push('/pharmacy')} className="mt-8 bg-emerald-600 text-white px-10 py-3 rounded-2xl font-black uppercase text-sm">Shop Medicines</button>
            </div>
        );
    }

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-20 font-['Plus_Jakarta_Sans']">
            <div className="bg-white border-b border-gray-100 px-4 py-4 mb-6">
                <div className="max-w-7xl mx-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="hover:text-emerald-600 cursor-pointer" onClick={() => router.push('/')}>Home</span>
                    <FaChevronRight size={8} />
                    <span className="text-slate-900">Pharmacy Checkout</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="flex-1 w-full space-y-6">

                        <div className="space-y-4">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2 px-1">
                                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                                Review Items ({pharmacyItems.length})
                            </h2>
                            <div className="space-y-3">
                                {pharmacyItems.map((item) => (
                                    <div key={item._id} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center border border-gray-50 flex-shrink-0 overflow-hidden">
                                                {item.medicineId?.image_url?.[0] ? <img src={item.medicineId.image_url[0]} className="w-full h-full object-contain p-2 mix-blend-multiply" /> : <FaPills size={24} className="text-emerald-600 opacity-20" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 text-md leading-tight">{item.name}</h3>
                                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter mt-1">{item.medicineId?.manufacturers}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-slate-900 text-lg">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                        <button onClick={() => removePharmacyItem(item.medicineId._id)} className="text-[10px] text-rose-500 font-black uppercase tracking-wider hover:underline">Remove</button>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg w-fit overflow-hidden">
                                                        <button onClick={() => updatePharmacyCartQuantity(item.medicineId._id, 'dec')} className="px-3 py-1.5 hover:bg-white text-slate-400 transition-colors"><FaMinus size={10} /></button>
                                                        <span className="px-4 text-xs font-black text-slate-900 border-x border-slate-100">{item.quantity}</span>
                                                        <button onClick={() => updatePharmacyCartQuantity(item.medicineId._id, 'inc')} className="px-3 py-1.5 hover:bg-white text-slate-400 transition-colors"><FaPlus size={10} /></button>
                                                    </div>

                                                    {/* UPLOAD Rx INSIDE CARD */}
                                                    {item.medicineId?.prescription_required === "YES" && (
                                                        <label className="flex items-center gap-2 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg border border-rose-100 cursor-pointer hover:bg-rose-100 transition-colors">
                                                            <FaCamera size={12} />
                                                            <span className="text-[9px] font-black uppercase">Upload Rx</span>
                                                            <input type="file" hidden accept="image/*" multiple onChange={handleFileChange} />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* PREVIEW INSIDE CARD */}
                                        {item.medicineId?.prescription_required === "YES" && prescriptionFiles.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-50">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <FaCheckCircle className="text-emerald-500" size={10} />
                                                    <span className="text-[9px] font-black uppercase text-slate-400">Prescription Files ({prescriptionFiles.length}/5)</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {prescriptionFiles.map((file, idx) => (
                                                        <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100 group">
                                                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                                            <button onClick={() => removeFile(idx)} className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <FaTrash size={8} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2 px-1">
                                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                                Collection Type
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setCollectionType('Home Delivery')}
                                    className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${collectionType === 'Home Delivery' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-white'}`}
                                >
                                    <FaTruck className={collectionType === 'Home Delivery' ? 'text-emerald-600' : 'text-slate-300'} />
                                    <span className={`text-[10px] font-black uppercase tracking-wider ${collectionType === 'Home Delivery' ? 'text-emerald-900' : 'text-slate-500'}`}>Home Delivery</span>
                                </button>
                                <button
                                    onClick={() => setCollectionType('Self Pickup')}
                                    className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${collectionType === 'Self Pickup' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-white'}`}
                                >
                                    <FaStore className={collectionType === 'Self Pickup' ? 'text-emerald-600' : 'text-slate-300'} />
                                    <span className={`text-[10px] font-black uppercase tracking-wider ${collectionType === 'Self Pickup' ? 'text-emerald-900' : 'text-slate-500'}`}>Self Pickup</span>
                                </button>
                            </div>
                        </div>

                        {collectionType === 'Home Delivery' && (
                            <>
                                <div className="space-y-4">
                                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2 px-1">
                                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">3</span>
                                        Delivery Preference
                                    </h2>
                                    <PharmacyDeliverySection
                                        deliveryOption={deliveryOption}
                                        setDeliveryOption={handleSetDeliveryOption}
                                        selectedSlot={selectedSlot}
                                        openSlotModal={() => setIsSlotModalOpen(true)}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2 px-1">
                                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">4</span>
                                        Delivery Address
                                    </h2>
                                    <PharmacyAddressSection addresses={addresses} selectedAddress={selectedAddress} setSelectedAddress={setSelectedAddress} isLoading={isAddressLoading} />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="w-full lg:w-[400px] space-y-6 sticky top-6">
                        <PharmacyCouponSection availableCoupons={availableCoupons} couponCode={couponCode} setCouponCode={setCouponCode} appliedCouponName={appliedCouponName} setAppliedCouponName={setAppliedCouponName} setServerDiscount={setServerDiscount} handleApplyCoupon={handleApplyCoupon} isValidating={isValidating} />

                        <PharmacyBillingSummary
                            totals={totals}
                            selectedAddress={selectedAddress}
                            subtotal={subtotal}
                            needsPrescription={needsPrescription}
                            prescriptionFiles={prescriptionFiles}
                            onConfirm={onConfirmCheckout}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </div>
            </div>

            <PharmacySlotModal  
                isOpen={isSlotModalOpen}
                onClose={() => setIsSlotModalOpen(false)}
                pharmacyId={pharmacyId}
                onSelectSlot={(data) => {
                    setSelectedSlot(data.displayText);
                    setRawSlotData({ date: data.apiDate, time: data.apiTime });
                    setSlotFee(data.fee);
                    setDeliveryOption('slot');
                    setIsSlotModalOpen(false);
                }}
            />
        </div>
    );
};

export default PharmacyCart;