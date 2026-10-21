'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';
import OpdCheckout from './components/OpdCheckout';
import IpdCheckout from './components/IpdCheckout';

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [checkoutType, setCheckoutType] = useState(null); // 'OPD' | 'IPD' | null
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 1. Explicit URL Query Param (?type=ipd or ?type=opd or ?bookingType=ipd/opd)
        const paramType = (searchParams.get('type') || searchParams.get('bookingType'))?.toUpperCase();
        if (paramType === 'IPD' || paramType === 'OPD') {
            if (paramType === 'IPD') {
                sessionStorage.removeItem('activeOpdBooking'); // Clean stale OPD
            } else {
                sessionStorage.removeItem('activeBooking'); // Clean stale IPD
            }
            sessionStorage.setItem('lastActiveCheckoutType', paramType);
            setCheckoutType(paramType);
            setIsLoading(false);
            return;
        }

        const rawOpd = sessionStorage.getItem('activeOpdBooking');
        const rawIpd = sessionStorage.getItem('activeBooking');

        // Safely parse active booking objects
        let opdData = null;
        let ipdData = null;
        try { if (rawOpd) opdData = JSON.parse(rawOpd); } catch (e) {}
        try { if (rawIpd) ipdData = JSON.parse(rawIpd); } catch (e) {}

        let resolvedType = null;

        // Case A: Only one session exists
        if (rawIpd && !rawOpd) {
            resolvedType = 'IPD';
        } else if (rawOpd && !rawIpd) {
            resolvedType = 'OPD';
        } 
        // Case B: BOTH exist (User selected OPD earlier, then chose IPD bed, or vice-versa)
        else if (rawIpd && rawOpd) {
            const opdTime = Number(opdData?.timestamp || opdData?.createdAt || opdData?._timestamp || 0);
            const ipdTime = Number(ipdData?.timestamp || ipdData?.createdAt || ipdData?._timestamp || 0);

            if (opdTime > 0 || ipdTime > 0) {
                resolvedType = ipdTime >= opdTime ? 'IPD' : 'OPD';
            } else {
                // Check if user came from doctor consultation vs bed admission
                const referrer = (typeof document !== 'undefined' ? document.referrer : '').toLowerCase();
                if (referrer.includes('doctor') || referrer.includes('opd') || referrer.includes('consult')) {
                    resolvedType = 'OPD';
                } else {
                    // Default to IPD: Bed admissions are urgent/higher-intent bookings
                    resolvedType = 'IPD';
                }
            }
        }

        // Apply resolution and purge stale session
        if (resolvedType === 'IPD') {
            sessionStorage.removeItem('activeOpdBooking'); // Wipe abandoned OPD session
            sessionStorage.setItem('lastActiveCheckoutType', 'IPD');
            setCheckoutType('IPD');
        } else if (resolvedType === 'OPD') {
            sessionStorage.removeItem('activeBooking'); // Wipe abandoned IPD session
            sessionStorage.setItem('lastActiveCheckoutType', 'OPD');
            setCheckoutType('OPD');
        } else {
            // Neither exists, redirect to hospital main portal
            router.replace('/hospital');
            return;
        }

        setIsLoading(false);
    }, [router, searchParams]);

    if (isLoading || !checkoutType) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
                <FaSpinner className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Preparing Checkout Desk...
                </p>
            </div>
        );
    }

    return checkoutType === 'OPD' ? <OpdCheckout /> : <IpdCheckout />;
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <FaSpinner className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}