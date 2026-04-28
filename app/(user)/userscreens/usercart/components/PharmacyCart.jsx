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
    const [collectionType] = useState('Home Delivery'); // Hardcoded to Home Delivery only
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
        let shippingFee = 0;
        let fastFee = 0;
        let freeThreshold = 500;

        if (deliveryChargesConfig) {
            freeThreshold = deliveryChargesConfig.freeDeliveryThreshold;

            if (deliveryOption === 'fast') {
                fastFee = deliveryChargesConfig.fastDeliveryExtra || 0;
                shippingFee = 0;
            } else {
                shippingFee = subtotal >= freeThreshold ? 0 : (deliveryChargesConfig.fixedPrice || 40);
                fastFee = 0;
            }
        } else {
            shippingFee = subtotal >= 500 ? 0 : 40;
        }

        const currentSlotFee = (deliveryOption === 'slot') ? slotFee : 0;
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
    }, [subtotal, serverDiscount, slotFee, deliveryOption, deliveryChargesConfig]);

    const onConfirmCheckout = async () => {
        if (!selectedAddress) {
            return toast.error("Please select a delivery address");
        }

        if (needsPrescription && prescriptionFiles.length === 0) {
            return toast.error("One or more medicines require a prescription. Please upload it.");
        }

        setIsSubmitting(true);

        try {
            // 1. Prepare Date and Time
            let appDate = new Date().toISOString();
            let appTime = new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            if (deliveryOption === 'slot' && rawSlotData) {
                // Convert YYYY-MM-DD to ISO String for consistency with your backend sample
                appDate = new Date(rawSlotData.date).toISOString();
                appTime = rawSlotData.time;
            }

            // 2. Prepare Form Data
            const formData = new FormData();

            formData.append('pharmacyId', pharmacyId);
            formData.append('collectionType', collectionType);
            formData.append('appointmentDate', appDate);
            formData.append('appointmentTime', appTime);
            formData.append('isRapid', deliveryOption === 'fast');
            formData.append('paymentMethod', 'COD');

            // 3. Address Object
            const addressData = {
                name: selectedAddress.name,
                phone: selectedAddress.phone,
                houseNo: selectedAddress.houseNo,
                sector: selectedAddress.sector,
                country: selectedAddress.country,
                landmark: selectedAddress.landmark,
                city: selectedAddress.city,
                state: selectedAddress.state,
                pincode: selectedAddress.pincode,
                addressType: selectedAddress.addressType
            };
            formData.append('address', JSON.stringify(addressData));

            // 4. Bill Summary
            const billSummary = {
                itemTotal: totals.subtotal,
                deliveryCharge: totals.shippingFee,
                rapidDeliveryCharge: totals.fastFee,
                slotCharge: totals.slotFee,
                couponDiscount: totals.discount,
                couponId: appliedCouponName || null,
                totalAmount: totals.total
            };
            formData.append('billSummary', JSON.stringify(billSummary));

            // 5. Items
            const itemsToSend = pharmacyItems.map(item => ({
                medicineId: item.medicineId._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                duration: "Full Course"
            }));
            formData.append('items', JSON.stringify(itemsToSend));

            // 6. Prescription Images
            prescriptionFiles.forEach((file) => {
                formData.append('prescriptionImages', file);
            });

            // 7. API Call
            const res = await UserAPI.placePharmacyOrder(formData);

            if (res.success) {
                toast.success(res.message || "Order Placed Successfully!");
                await clearFullCart();
                router.push(`/order-success/pharmacy?id=${res.orderId || res.data?._id || ''}`);
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
                                                    {item.medicineId?.prescription_required === "YES" && (
                                                        <span className="flex items-center gap-1.5 text-rose-500 text-[9px] font-black uppercase bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
                                                            <FaFilePrescription size={10} /> Prescription Required
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {needsPrescription && (
                            <div className="space-y-4">
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2 px-1">
                                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                                    Upload Prescription
                                </h2>
                                <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
                                    <div className="max-w-xs mx-auto">
                                        <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FaCamera className="text-rose-500" size={20} />
                                        </div>
                                        <h3 className="text-sm font-black text-slate-800 mb-1">Prescription Needed</h3>
                                        <p className="text-[11px] text-slate-400 font-medium mb-4">Please upload a clear image of your doctor's prescription to proceed.</p>

                                        <label className="inline-flex items-center justify-center px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer hover:bg-slate-800 transition-colors">
                                            <span>Select Files ({prescriptionFiles.length}/5)</span>
                                            <input type="file" hidden accept="image/*" multiple onChange={handleFileChange} />
                                        </label>

                                        {prescriptionFiles.length > 0 && (
                                            <div className="mt-6 pt-6 border-t border-slate-50">
                                                <div className="flex flex-wrap gap-3 justify-center">
                                                    {prescriptionFiles.map((file, idx) => (
                                                        <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-500 group">
                                                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                                            <button onClick={() => removeFile(idx)} className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <FaTrash size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2 px-1">
                                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">{needsPrescription ? '3' : '2'}</span>
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
                                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">{needsPrescription ? '4' : '3'}</span>
                                Delivery Address
                            </h2>
                            <PharmacyAddressSection addresses={addresses} selectedAddress={selectedAddress} setSelectedAddress={setSelectedAddress} isLoading={isAddressLoading} />
                        </div>
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