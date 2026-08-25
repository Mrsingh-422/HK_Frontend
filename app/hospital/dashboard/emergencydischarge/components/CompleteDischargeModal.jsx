'use client'

import React, { useState, useEffect } from 'react'
import { 
  FaTimes, FaReceipt, FaPlus, FaSpinner, FaHospitalAlt, FaCalendarAlt, FaClock, FaStethoscope,
  FaCheckCircle, FaTrashAlt, FaDollarSign, FaBed, FaAmbulance, FaRoute, FaWallet, FaHourglassHalf, FaHome
} from 'react-icons/fa'
import HospitalAPI from '@/app/services/HospitalAPI';

const CompleteDischargeModal = ({ 
  patient, 
  onClose, 
  onConfirm, 
  initialBillingItems = [] 
}) => {
  const [billingItems, setBillingItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // General Dispatch Wizard State
  const [showAmbulanceWizard, setShowAmbulanceWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState('choice'); // 'choice' | 'home-select' | 'home-details' | 'ref-hospitals' | 'ref-ambulances' | 'ref-details'
  
  // Fleet & Transport State
  const [availableAmbulances, setAvailableAmbulances] = useState([]);
  const [loadingAmbs, setLoadingAmbs] = useState(false);
  const [selectedAmb, setSelectedAmb] = useState(null);
  const [bookedTransport, setBookedTransport] = useState(null);
  const [isProcessingTransport, setIsProcessingTransport] = useState(false);

  // Home Drop-off States
  const [homeAddress, setHomeAddress] = useState("");
  const [homeLat, setHomeLat] = useState("30.7046");
  const [homeLng, setHomeLng] = useState("76.7179");
  const [loadingFare, setLoadingFare] = useState(false);
  const [calculatedFare, setCalculatedFare] = useState(null);

  // Referral Hospital States
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [searchHospitalTerm, setSearchHospitalTerm] = useState("");
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);

  // Referral Booking Form States
  const [scheduledDate, setScheduledDate] = useState("2026-08-19");
  const [scheduledTime, setScheduledTime] = useState("10:30 AM");
  const [referralReason, setReferralReason] = useState("");
  const [includeDoctor, setIncludeDoctor] = useState(false);
  const [includeNurse, setIncludeNurse] = useState(false);

  // Sync state when dynamic service charges change
  useEffect(() => {
    if (initialBillingItems && initialBillingItems.length > 0) {
      setBillingItems(initialBillingItems.map(item => ({
        serviceName: item.serviceName || item.name,
        price: Number(item.price)
      })));
    } else {
      setBillingItems([]);
    }
  }, [initialBillingItems]);

  if (!patient) return null;

  // --- AMBULANCE & REFERRAL FLOW ACTIONS ---
  const handleOpenAmbulanceWizard = () => {
    setShowAmbulanceWizard(true);
    setWizardStep('choice');
    setSelectedAmb(null);
    setSelectedHospital(null);
    setCalculatedFare(null);
  };

  const handleChooseHomeTransfer = async () => {
    setWizardStep('home-select');
    await fetchAmbulances();
  };

  const handleChooseHospitalReferral = async () => {
    setWizardStep('ref-hospitals');
    await fetchHospitals("");
  };

  const fetchAmbulances = async () => {
    setLoadingAmbs(true);
    try {
      const res = await HospitalAPI.getAvailableDischargeAmbulances();
      if (res?.success) {
        setAvailableAmbulances(res.data || []);
      } else {
        alert(res?.message || "Failed to load drop-off ambulances");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAmbs(false);
    }
  };

  const fetchHospitals = async (searchTerm) => {
    setLoadingHospitals(true);
    try {
      const res = await HospitalAPI.getNearbyHospitals(searchTerm);
      if (res?.success) {
        setNearbyHospitals(res.data || []);
      } else {
        alert(res?.message || "Failed to load nearby hospital list.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHospitals(false);
    }
  };

  const handleHospitalSearchChange = (e) => {
    const val = e.target.value;
    setSearchHospitalTerm(val);
    fetchHospitals(val);
  };

  // Home Transfer: Calculate Distance & Surcharge Price
  const handleCalculateHomeFare = async () => {
    if (!selectedAmb) return alert("Please select an ambulance.");
    if (!homeLat.trim() || !homeLng.trim()) return alert("Coordinates are required.");

    setLoadingFare(true);
    try {
      const res = await HospitalAPI.calculateDischargeFare({
        ambulanceId: selectedAmb._id,
        homeLat: Number(homeLat),
        homeLng: Number(homeLng)
      });
      if (res?.success) {
        setCalculatedFare(res.data);
      } else {
        alert(res?.message || "Failed to calculate route fare details.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFare(false);
    }
  };

  // Home Transfer: Final confirmation dispatch
  const handleConfirmAndDispatchHome = async () => {
    if (!selectedAmb || !calculatedFare) return;
    if (!homeAddress.trim()) return alert("Please specify the destination physical address.");

    setIsProcessingTransport(true);
    try {
      const payload = {
        appointmentId: patient._id,
        ambulanceId: selectedAmb._id,
        homeAddress: homeAddress.trim(),
        homeLat: Number(homeLat),
        homeLng: Number(homeLng),
        totalFare: calculatedFare.totalDispatchPrice,
        distance: calculatedFare.distance
      };

      const res = await HospitalAPI.dispatchDischargeAmbulance(payload);
      if (res?.success) {
        setBookedTransport({
          type: 'home',
          ambulanceName: selectedAmb.name,
          vehicleNumber: selectedAmb.vehicleNumber,
          homeAddress: homeAddress.trim(),
          distance: calculatedFare.distance,
          totalFare: calculatedFare.totalDispatchPrice
        });
        
        setBillingItems(prev => [
          ...prev,
          { serviceName: `Home Drop-off: ${selectedAmb.name} (${selectedAmb.vehicleNumber})`, price: calculatedFare.totalDispatchPrice }
        ]);

        setShowAmbulanceWizard(false);
        alert("Home drop-off configured and added to the ledger.");
      } else {
        alert(res?.message || "Failed to register transport assignment.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingTransport(false);
    }
  };

  // Hospital Referral: Complete Booking
  const handleConfirmReferralBooking = async () => {
    if (!selectedHospital) return alert("Please select a target facility.");
    if (!selectedAmb) return alert("Please choose a support ambulance.");
    if (!referralReason.trim()) return alert("Reason for referral shifts is mandatory.");

    setIsProcessingTransport(true);
    try {
      const staffArray = [];
      if (includeDoctor) staffArray.push("Doctor");
      if (includeNurse) staffArray.push("Nurse");

      const rawName = patient.patients?.[0]?.patientName || patient.userId?.name || "Patient";
      const rawAge = Number(patient.patients?.[0]?.patientAge || patient.userId?.age || 30);
      const rawGender = patient.patients?.[0]?.gender || patient.userId?.gender || "Male";

      const payload = {
        appointmentId: patient._id,
        destinationHospitalId: selectedHospital._id,
        ambulanceId: selectedAmb._id,
        scheduledDate,
        scheduledTime,
        patientName: rawName,
        patientAge: rawAge,
        gender: rawGender,
        referralReason: referralReason.trim(),
        staffType: staffArray.join(",")
      };

      const res = await HospitalAPI.bookReferralTransfer(payload);
      if (res?.success) {
        const booking = res.data?.booking || {};
        const pricing = booking.pricing || {};

        setBookedTransport({
          type: 'referral',
          bookingId: booking.bookingId || "N/A",
          hospitalName: selectedHospital.name,
          ambulanceName: selectedAmb.name,
          vehicleNumber: selectedAmb.vehicleNumber,
          scheduledDate,
          scheduledTime,
          staffType: staffArray.join(", ") || "None",
          totalFare: pricing.total || 2800
        });

        setBillingItems(prev => [
          ...prev,
          { serviceName: `Referral Shifting: ${selectedHospital.name} (${selectedAmb.name})`, price: pricing.total || 2800 }
        ]);

        setShowAmbulanceWizard(false);
        alert(`Referral shifting booked successfully! ID: ${booking.bookingId || 'Confirmed'}`);
      } else {
        alert(res?.message || "Failed to book clinical transfer.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingTransport(false);
    }
  };

  const handleCancelAmbulanceAddon = async () => {
    if (!confirm("Are you sure you want to cancel and remove this ambulance drop-off service?")) return;

    try {
      const res = await HospitalAPI.cancelDischargeAmbulance(patient._id);
      if (res?.success) {
        setBillingItems(prev => prev.filter(item => 
          !item.serviceName.startsWith("Home Drop-off:") && 
          !item.serviceName.startsWith("Referral Shifting:")
        ));
        setBookedTransport(null);
        setSelectedAmb(null);
        setSelectedHospital(null);
        setCalculatedFare(null);
        setHomeAddress("");
        alert(res.message || "Ambulance add-on reverted successfully.");
      } else {
        alert(res?.message || "Failed to revert ambulance add-on.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- GENERAL BILLING ACTIONS ---
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;
    
    setBillingItems([
      ...billingItems,
      { serviceName: newItemName.trim(), price: Number(newItemPrice) }
    ]);
    setNewItemName("");
    setNewItemPrice("");
  };

  const handleRemoveItem = (index) => {
    const itemToRemove = billingItems[index];
    if (itemToRemove.serviceName.startsWith("Home Drop-off:") || itemToRemove.serviceName.startsWith("Referral Shifting:")) {
      handleCancelAmbulanceAddon();
      return;
    }
    setBillingItems(billingItems.filter((_, idx) => idx !== index));
  };

  // NATIVE ALIGNMENT WITH DYNAMIC RESPONSE PAYLOAD CODES
  const baseFee = patient.billingBreakdown?.baseStayCharge || patient.pricingBreakdown?.baseFee || 0;
  const visitCharges = patient.pricingBreakdown?.visitCharges || 0;
  const overstayCharge = patient.billingBreakdown?.overstayCharge || patient.pricingBreakdown?.extraCharges || 0;
  const discountAmount = patient.pricingBreakdown?.discountAmount || 0;
  
  const cancellationFee = patient.pricingBreakdown?.cancellationFeeApplied || 0;
  const noShowFee = patient.pricingBreakdown?.noShowFeeApplied || 0;
  const totalPenalties = cancellationFee + noShowFee;

  // Extraction of Pre-paid booking advance
  const advancePaid = Number(
    patient.billingBreakdown?.paidOnBooking ||
    patient.amountPaid || 
    patient.bookingAmount || 
    patient.advancePaid || 
    patient.paymentDetails?.amount ||
    patient.pricingBreakdown?.advancePaid || 
    0
  );

  const calculatedServiceCost = billingItems.reduce((sum, item) => sum + item.price, 0);
  const totalCalculatedCost = baseFee + visitCharges + overstayCharge + calculatedServiceCost + totalPenalties - discountAmount;
  
  // Remaining Outstandings Due
  const outstandingBalance = Math.max(0, totalCalculatedCost - advancePaid);

  const handlePreSubmit = (e) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const handleFinalConfirm = () => {
    onConfirm({
      appointmentId: patient._id,
      billingItems: billingItems,
      totalAmount: totalCalculatedCost,
      isEmergency: !!patient.ambulanceId,
      bookedTransport: bookedTransport,
      advancePaid: advancePaid,
      outstandingBalance: outstandingBalance
    });
    setShowConfirmDialog(false);
    onClose();
  };

  const patientName = patient.patients?.[0]?.patientName || patient.userId?.name || "Unknown Patient";

  return (
    <>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose}></div>

        <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-8 md:p-10 max-h-[85vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Discharge Ledger</h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-0.5">Patient: {patientName}</p>
              </div>
              <button 
                type="button"
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <div className="space-y-6">
              
              {/* Dynamic Base Stay Breakdown Info */}
              <div className="bg-slate-50/50 rounded-2xl border border-slate-150 p-4 space-y-2">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Stay Breakdown</span>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  
                  <div className="text-slate-500 font-semibold">
                    Admission Stay Charge {patient.billingBreakdown?.baseStayDays ? `(${patient.billingBreakdown.baseStayDays} Days)` : ''}:
                  </div>
                  <div className="text-right text-slate-800 font-bold">₹{baseFee.toFixed(2)}</div>
                  
                  {patient.bedId && (
                    <>
                      <div className="text-slate-500 font-semibold flex items-center gap-1">
                        <FaBed className="text-[#08B36A]" /> Bed rate ({patient.bedNumber || patient.bedId.bedNumber}):
                      </div>
                      <div className="text-right text-slate-800 font-bold">₹{(patient.bedId.pricePerDay || 0).toFixed(2)} / day</div>
                    </>
                  )}

                  {visitCharges > 0 && (
                    <>
                      <div className="text-slate-500 font-semibold">Consultation Charges:</div>
                      <div className="text-right text-slate-800 font-bold">₹{visitCharges.toFixed(2)}</div>
                    </>
                  )}

                  {overstayCharge > 0 && (
                    <>
                      <div className="text-slate-500 font-semibold">
                        Overstay Charge {patient.billingBreakdown?.overstayDays ? `(${patient.billingBreakdown.overstayDays} Days)` : ''}:
                      </div>
                      <div className="text-right text-rose-600 font-bold">₹{overstayCharge.toFixed(2)}</div>
                    </>
                  )}

                  {totalPenalties > 0 && (
                    <>
                      <div className="text-slate-500 font-semibold">Late Penalties Applied:</div>
                      <div className="text-right text-rose-600 font-bold">₹{totalPenalties.toFixed(2)}</div>
                    </>
                  )}

                  {discountAmount > 0 && (
                    <>
                      <div className="text-slate-500 font-semibold text-green-600">Discounts Applied:</div>
                      <div className="text-right text-green-600 font-bold">-₹{discountAmount.toFixed(2)}</div>
                    </>
                  )}
                </div>
              </div>

              {/* AMBULANCE & REFERRAL DISPATCH WORKFLOW SECTION */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/20">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <FaAmbulance className="text-[#08B36A]" size={16} />
                    <span className="text-xs font-black uppercase text-slate-800 tracking-wider">Discharge Transport / Referral Shifting</span>
                  </div>
                  {!bookedTransport ? (
                    <button
                      type="button"
                      onClick={handleOpenAmbulanceWizard}
                      className="px-3 py-1.5 bg-[#08B36A] hover:bg-[#068c51] text-white text-[10px] font-black rounded-lg uppercase tracking-wider transition-all"
                    >
                      Book Transport
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCancelAmbulanceAddon}
                      className="px-3 py-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-600 hover:text-white text-rose-600 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all"
                    >
                      Cancel Drop-off
                    </button>
                  )}
                </div>

                {bookedTransport ? (
                  <div className="bg-[#08B36A]/10 border border-[#08B36A]/20 p-3.5 rounded-xl text-xs space-y-1.5 animate-in fade-in">
                    <div className="flex justify-between items-center">
                      <p className="font-extrabold text-[#08B36A] uppercase text-[9px] tracking-wider">
                        {bookedTransport.type === 'home' ? 'Home drop-off booked' : 'Inter-Hospital Referral shift booked'}
                      </p>
                      {bookedTransport.bookingId && (
                        <span className="text-[9px] font-black bg-[#08B36A] text-white px-2 py-0.5 rounded uppercase">
                          Ref: {bookedTransport.bookingId}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between font-bold text-slate-800 text-xs">
                      {bookedTransport.type === 'home' ? (
                        <span>{bookedTransport.ambulanceName} ({bookedTransport.vehicleNumber})</span>
                      ) : (
                        <span>Referral shift to {bookedTransport.hospitalName}</span>
                      )}
                      <span>₹{bookedTransport.totalFare.toFixed(2)}</span>
                    </div>

                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                      {bookedTransport.type === 'home' ? (
                        `Drop-off Destination: ${bookedTransport.homeAddress} (${bookedTransport.distance})`
                      ) : (
                        `Scheduled: ${bookedTransport.scheduledDate} &bull; ${bookedTransport.scheduledTime} | Staff: ${bookedTransport.staffType}`
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] font-semibold text-slate-400">
                    No hospital transit dispatched for this discharge statement yet. Click Book to configure coordination.
                  </p>
                )}
              </div>

              {/* Active Items Table */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                  Dynamic Service Line Items
                </label>
                {billingItems.length > 0 ? (
                  <div className="border border-slate-150 rounded-2xl overflow-hidden divide-y divide-slate-100">
                    {billingItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-50/50 text-xs">
                        <span className="font-bold text-slate-700">{item.serviceName}</span>
                        <div className="flex items-center space-x-3">
                          <span className="font-black text-slate-900">₹{(item.price || 0).toFixed(2)}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-300 hover:text-rose-600 transition"
                          >
                            <FaTrashAlt size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-semibold">
                    No additional service items added.
                  </div>
                )}
              </div>

              {/* Quick Add Form */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Add Additional Charge</span>
                <div className="grid grid-cols-12 gap-2">
                  <input 
                    type="text" 
                    placeholder="Service Name" 
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="col-span-7 bg-white border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none"
                  />
                  <input 
                    type="number" 
                    placeholder="Price" 
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="col-span-3 bg-white border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none"
                  />
                  <button 
                    onClick={handleAddItem}
                    className="col-span-2 bg-[#08B36A] hover:bg-[#079d5c] text-white rounded-xl flex items-center justify-center transition shadow-sm"
                  >
                    <FaPlus size={12} />
                  </button>
                </div>
              </div>

              {/* ADVANCED BALANCE SETTLEMENT LEDGER */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="bg-emerald-50/60 border border-emerald-100 p-3.5 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <FaWallet size={14} />
                  </div>
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Paid on Booking</span>
                    <span className="text-sm font-black text-emerald-700">₹{advancePaid.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <FaHourglassHalf size={14} />
                  </div>
                  <div>
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider">Remaining Balance</span>
                    <span className="text-sm font-black text-amber-700">₹{outstandingBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-900">
                <span className="uppercase tracking-wide text-xs text-slate-400">Total Accumulated Cost</span>
                <span className="text-xl text-[#08B36A]">₹{totalCalculatedCost.toFixed(2)}</span>
              </div>

              <button 
                type="button"
                onClick={handlePreSubmit}
                className="w-full bg-[#08B36A] hover:bg-[#069e5d] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                <FaCheckCircle /> CONFIRM DISCHARGE & SETTLE
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* BRANCHING AMBULANCE & REFERRAL BOOKING SUB-MODAL WIZARD */}
      {showAmbulanceWizard && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAmbulanceWizard(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl p-6 md:p-8 animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                <FaAmbulance className="text-[#08B36A]" /> Dispatch Configuration
              </h3>
              <button onClick={() => setShowAmbulanceWizard(false)} className="text-slate-400 hover:text-red-500">
                <FaTimes size={16} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 flex-grow">
              
              {/* STEP: CHOICE SELECTION (Home vs Hospital Referral) */}
              {wizardStep === 'choice' && (
                <div className="space-y-4 py-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Select Patient Shifting Category</p>
                  <div className="grid grid-cols-2 gap-4">
                    
                    <button
                      type="button"
                      onClick={handleChooseHomeTransfer}
                      className="p-5 border border-slate-200 hover:border-[#08B36A] bg-slate-50/50 hover:bg-[#08B36A]/5 rounded-2xl transition flex flex-col items-center justify-center text-center gap-3 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#08B36A]/10 text-[#08B36A] flex items-center justify-center text-xl">
                        <FaHome />
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-slate-800 uppercase group-hover:text-[#08B36A]">Home Drop-off</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Direct Patient Transit</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={handleChooseHospitalReferral}
                      className="p-5 border border-slate-200 hover:border-indigo-600 bg-slate-50/50 hover:bg-indigo-50/20 rounded-2xl transition flex flex-col items-center justify-center text-center gap-3 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl">
                        <FaHospitalAlt />
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-slate-800 uppercase group-hover:text-indigo-600">Referral Shifting</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Inter-Facility Transfer</p>
                      </div>
                    </button>

                  </div>
                </div>
              )}

              {/* HOME FLOW STEP 1: Ambulance Listing */}
              {wizardStep === 'home-select' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Available Ambulance</label>
                    <button onClick={() => setWizardStep('choice')} className="text-[10px] font-black text-[#08B36A] uppercase">&larr; Back</button>
                  </div>
                  {loadingAmbs ? (
                    <div className="flex flex-col items-center py-8 gap-2">
                      <FaSpinner className="animate-spin text-[#08B36A]" size={20} />
                      <span className="text-xs font-bold text-slate-400">Loading Fleet...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
                      {availableAmbulances.map(amb => (
                        <div
                          key={amb._id}
                          onClick={() => { setSelectedAmb(amb); setWizardStep('home-details'); }}
                          className="p-3 bg-slate-50 border border-slate-150 hover:border-[#08B36A] rounded-xl cursor-pointer flex justify-between items-center transition-all"
                        >
                          <div>
                            <p className="text-xs font-black text-slate-900">{amb.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{amb.vehicleNumber} &bull; {amb.vehicleType}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* HOME FLOW STEP 2: Configure Location & Surcharge */}
              {wizardStep === 'home-details' && selectedAmb && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex justify-between items-center border-b pb-1">
                    <span className="text-xs font-bold text-slate-600">Unit Selected: {selectedAmb.name}</span>
                    <button onClick={() => setWizardStep('home-select')} className="text-[10px] font-black text-slate-400 uppercase">&larr; Back</button>
                  </div>

                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Physical Destination Address (e.g. Chandigarh, Punjab)"
                      value={homeAddress}
                      onChange={(e) => setHomeAddress(e.target.value)}
                      className="w-full border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase ml-1">Latitude</span>
                      <input
                        type="number"
                        step="any"
                        value={homeLat}
                        onChange={(e) => { setHomeLat(e.target.value); setCalculatedFare(null); }}
                        className="w-full border border-slate-200 p-2 text-xs font-semibold rounded-xl focus:outline-none bg-slate-50"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase ml-1">Longitude</span>
                      <input
                        type="number"
                        step="any"
                        value={homeLng}
                        onChange={(e) => { setHomeLng(e.target.value); setCalculatedFare(null); }}
                        className="w-full border border-slate-200 p-2 text-xs font-semibold rounded-xl focus:outline-none bg-slate-50"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCalculateHomeFare}
                    disabled={loadingFare || !homeAddress.trim()}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    {loadingFare ? "Calculating Distance..." : "Fetch Route Fare Summary"}
                  </button>

                  {calculatedFare && (
                    <div className="bg-slate-950 text-white p-4 rounded-xl space-y-2 text-xs animate-in slide-in-from-bottom-2">
                      <div className="flex justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider pb-1.5 border-b border-slate-800">
                        <span className="flex items-center gap-1"><FaRoute /> Distance: {calculatedFare.distance}</span>
                        <span>Estimated Route Details</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Base Transport Fee:</span>
                        <span className="font-bold">₹{calculatedFare.baseAmbulanceRate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Destination Surge:</span>
                        <span className="font-bold">₹{calculatedFare.destinationSurge}</span>
                      </div>
                      <div className="flex justify-between text-[#08B36A] font-black border-t border-slate-800 pt-2 text-sm uppercase">
                        <span>Dynamic Grand Total:</span>
                        <span>₹{calculatedFare.totalDispatchPrice}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* REFERRAL FLOW STEP 1: Destination Hospital List */}
              {wizardStep === 'ref-hospitals' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Destination Referral Facility</label>
                    <button onClick={() => setWizardStep('choice')} className="text-[10px] font-black text-[#08B36A] uppercase">&larr; Back</button>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Search hospitals by name..."
                    value={searchHospitalTerm}
                    onChange={handleHospitalSearchChange}
                    className="w-full border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none bg-slate-50/50"
                  />

                  {loadingHospitals ? (
                    <div className="flex flex-col items-center py-8 gap-2">
                      <FaSpinner className="animate-spin text-indigo-600" size={20} />
                      <span className="text-xs font-bold text-slate-400 font-sans">Scanning Nearest Facilities...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto pr-1">
                      {nearbyHospitals.map(hosp => (
                        <div
                          key={hosp._id}
                          onClick={() => { setSelectedHospital(hosp); setWizardStep('ref-ambulances'); fetchAmbulances(); }}
                          className="p-3 bg-slate-50 border border-slate-150 hover:border-indigo-600 rounded-xl cursor-pointer flex justify-between items-center transition-all"
                        >
                          <div>
                            <p className="text-xs font-black text-slate-900">{hosp.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{hosp.address}, {hosp.city}</p>
                          </div>
                          <span className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-100 font-extrabold px-2 py-0.5 rounded uppercase">Choose</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* REFERRAL FLOW STEP 2: Choose Transport Ambulance */}
              {wizardStep === 'ref-ambulances' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Shifting Transport Vehicle</label>
                    <button onClick={() => setWizardStep('ref-hospitals')} className="text-[10px] font-black text-slate-400 uppercase">&larr; Back</button>
                  </div>

                  {loadingAmbs ? (
                    <div className="flex flex-col items-center py-8 gap-2">
                      <FaSpinner className="animate-spin text-[#08B36A]" size={20} />
                      <span className="text-xs font-bold text-slate-400">Loading Fleet...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-1">
                      {availableAmbulances.map(amb => (
                        <div
                          key={amb._id}
                          onClick={() => { setSelectedAmb(amb); setWizardStep('ref-details'); }}
                          className="p-3 bg-slate-50 border border-slate-150 hover:border-[#08B36A] rounded-xl cursor-pointer flex justify-between items-center transition-all"
                        >
                          <div>
                            <p className="text-xs font-black text-slate-900">{amb.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{amb.vehicleNumber} &bull; {amb.vehicleType}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* REFERRAL FLOW STEP 3: Configure Scheduling & Support Crew */}
              {wizardStep === 'ref-details' && selectedHospital && selectedAmb && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex justify-between items-center border-b pb-1.5">
                    <div>
                      <span className="block text-[9px] font-black uppercase text-slate-400">Hospital Destination</span>
                      <span className="text-xs font-black text-slate-800">{selectedHospital.name}</span>
                    </div>
                    <button onClick={() => setWizardStep('ref-ambulances')} className="text-[10px] font-black text-slate-400 uppercase">&larr; Back</button>
                  </div>

                  {/* Scheduled Date/Time Input */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase ml-1 flex items-center gap-1"><FaCalendarAlt /> Date</span>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none bg-slate-50"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase ml-1 flex items-center gap-1"><FaClock /> Time</span>
                      <input
                        type="text"
                        placeholder="e.g. 10:30 AM"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none bg-slate-50"
                      />
                    </div>
                  </div>

                  {/* Referral Reason Input */}
                  <div>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase ml-1 flex items-center gap-1"><FaStethoscope /> Referral Reason</span>
                    <input
                      type="text"
                      placeholder="Specify critical diagnosis or special shifting reasons"
                      value={referralReason}
                      onChange={(e) => setReferralReason(e.target.value)}
                      className="w-full border border-slate-200 p-2.5 text-xs font-semibold rounded-xl focus:outline-none bg-slate-50"
                    />
                  </div>

                  {/* Supporting Staff Checkboxes */}
                  <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-150 space-y-2">
                    <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Medical Shifting Support Staff (Optional)</span>
                    <div className="flex gap-4 text-xs font-bold text-slate-700">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeDoctor}
                          onChange={(e) => setIncludeDoctor(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 border-slate-200 focus:ring-0"
                        />
                        <span>Lead Physician (Doctor)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeNurse}
                          onChange={(e) => setIncludeNurse(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 border-slate-200 focus:ring-0"
                        />
                        <span>Paramedic / Nurse</span>
                      </label>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* CONFIRM ACTIONS SUBMIT BUTTONS */}
            <div className="border-t pt-4 mt-2">
              {wizardStep === 'home-details' && calculatedFare && (
                <button
                  type="button"
                  onClick={handleConfirmAndDispatchHome}
                  disabled={isProcessingTransport}
                  className="w-full bg-[#08B36A] hover:bg-[#068c51] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  {isProcessingTransport ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  Confirm Home Drop-off
                </button>
              )}

              {wizardStep === 'ref-details' && selectedHospital && selectedAmb && (
                <button
                  type="button"
                  onClick={handleConfirmReferralBooking}
                  disabled={isProcessingTransport || !referralReason.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {isProcessingTransport ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  Confirm Clinical Shift Booking
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Nested Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150" 
            onClick={() => setShowConfirmDialog(false)}
          ></div>
          
          <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 text-center animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-slate-900 mb-2">Confirm Discharge</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to discharge <span className="font-bold text-slate-800">{patientName}</span> and finalize this ledger?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalConfirm}
                className="flex-1 bg-[#08B36A] hover:bg-[#069e5d] text-white py-3 rounded-xl text-xs font-bold transition shadow-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CompleteDischargeModal;