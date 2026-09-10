"use client";

import React, { useState, useEffect } from "react";
import {
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope,
    FaFacebookF,
    FaTwitter,
    FaGooglePlusG,
    FaInstagram,
    FaYoutube,
    FaWhatsapp,
    FaLinkedinIn,
    FaGlobe,
    FaPaperPlane,
    FaHeadset,
    FaExclamationCircle
} from "react-icons/fa";
import Link from "next/link";
import { useGlobalContext } from "@/app/context/GlobalContext";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5002";

// Icon mapping helper for dynamic social links
const getSocialIcon = (platform = "") => {
    const p = platform.toLowerCase();
    if (p.includes("facebook") || p.includes("fb")) return FaFacebookF;
    if (p.includes("twitter") || p.includes("x")) return FaTwitter;
    if (p.includes("instagram") || p.includes("insta")) return FaInstagram;
    if (p.includes("youtube") || p.includes("yt")) return FaYoutube;
    if (p.includes("whatsapp") || p.includes("wa")) return FaWhatsapp;
    if (p.includes("linkedin")) return FaLinkedinIn;
    if (p.includes("google")) return FaGooglePlusG;
    return FaGlobe;
};

function Footer() {
    const { openModal } = useGlobalContext();
    const [email, setEmail] = useState("");

    // Dynamic Footer Data with exact initial defaults
    const [footerData, setFooterData] = useState({
        address: "#omnninos mohali punjab 160055",
        phones: ["+91 9879879879", "+91 9876543210, +91 9875567283"],
        emails: ["admin@gmail.com", "admin13@gmail.com, admin1234@gmail.com"],
        aboutTitle: "Health Kangaroo",
        aboutDescription: "Providing accessible healthcare solutions including lab tests, doctor appointments, and emergency services at your fingertips.",
        socialLinks: [
            { platform: "facebook", url: "#", icon: FaFacebookF },
            { platform: "twitter", url: "#", icon: FaTwitter },
            { platform: "google", url: "#", icon: FaGooglePlusG },
            { platform: "instagram", url: "#", icon: FaInstagram },
            { platform: "youtube", url: "#", icon: FaYoutube }
        ],
        copyrightText: "Copyright © 2018, All Right Reserved Dr. Parveen"
    });

    // Navigation links for the bottom bar matching your exact folder structure
    const [bottomLinks, setBottomLinks] = useState([
        { name: "Home", href: "/" },
        { name: "Report Issue", href: "/reportissue/report-issue" },
        { name: "My Tickets", href: "/reportissue/my-tickets" },
        { name: "Track Status", href: "/reportissue/track" },
        { name: "Terms & Condition", href: "/terms-and-conditions" },
        { name: "Privacy Policy", href: "/privacy-policy" },
        { name: "Return & refund", href: "/refund-policy" },
        { name: "About us", href: "/about" },
        { name: "Help & Support", href: "/help" },
    ]);

    // --- FETCH DYNAMIC FOOTER CONTENT (GET /api/footer) ---
    useEffect(() => {
        const fetchFooter = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/footer`);
                const result = await res.json();

                if (result?.success && result?.data) {
                    const data = result.data;

                    setFooterData((prev) => ({
                        address: data.address || prev.address,
                        phones: Array.isArray(data.phones) && data.phones.length > 0 ? data.phones : prev.phones,
                        emails: Array.isArray(data.emails) && data.emails.length > 0 ? data.emails : prev.emails,
                        aboutTitle: data.aboutTitle || prev.aboutTitle,
                        aboutDescription: data.aboutDescription || prev.aboutDescription,
                        copyrightText: data.copyrightText || prev.copyrightText,
                        socialLinks: Array.isArray(data.socialLinks) && data.socialLinks.length > 0
                            ? data.socialLinks.map((item) => ({
                                  platform: item.platform,
                                  url: item.url || "#",
                                  icon: getSocialIcon(item.platform)
                              }))
                            : prev.socialLinks
                    }));

                    if (Array.isArray(data.bottomLinks) && data.bottomLinks.length > 0) {
                        setBottomLinks(data.bottomLinks.map(l => ({ name: l.name, href: l.url || l.href })));
                    }
                }
            } catch (err) {
                console.error("Error fetching footer data:", err);
            }
        };

        fetchFooter();
    }, []);

    return (
        <footer className="bg-[#0f0f0f] text-[#ccc] px-[5%] py-10 font-sans md:px-[8%]">
            {/* Top Contact Row */}
            <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-3">
                <div className="flex items-start gap-4">
                    <FaMapMarkerAlt className="text-[#08B36A] text-2xl mt-1 shrink-0" />
                    <div>
                        <h4 className="text-white font-bold mb-1">Find us</h4>
                        <p className="text-sm">{footerData.address}</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <FaPhoneAlt className="text-[#08B36A] text-2xl mt-1 shrink-0" />
                    <div>
                        <h4 className="text-white font-bold mb-1">Call us</h4>
                        <p className="text-sm leading-relaxed">
                            {footerData.phones[0]} <br />
                            {footerData.phones.slice(1).join(", ")}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <FaEnvelope className="text-[#08B36A] text-2xl mt-1 shrink-0" />
                    <div>
                        <h4 className="text-white font-bold mb-1">Mail us</h4>
                        <p className="text-sm leading-relaxed">
                            {footerData.emails[0]} <br />
                            {footerData.emails.slice(1).join(", ")}
                        </p>
                    </div>
                </div>
            </div>

            <hr className="border-t border-[#222] my-8" />

            {/* Main Footer Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* About & Social Links */}
                <div className="lg:col-span-4">
                    <h2 className="text-white text-2xl font-bold mb-4">{footerData.aboutTitle}</h2>
                    <p className="text-sm leading-[1.7] mb-5 text-gray-400">
                        {footerData.aboutDescription}
                    </p>

                    <h4 className="text-white font-bold mb-3">Follow us</h4>
                    <div className="flex flex-wrap gap-3 mb-6">
                        {footerData.socialLinks.map((item, idx) => {
                            const Icon = item.icon || FaGlobe;
                            return (
                                <Link
                                    key={idx}
                                    href={item.url || "#"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#08B36A] text-white p-2.5 rounded-full transition-all hover:-translate-y-1 hover:brightness-110"
                                >
                                    <Icon size={18} />
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Services */}
                <div className="lg:col-span-3">
                    <h3 className="text-white text-lg font-bold mb-5 border-b-2 border-[#08B36A] inline-block pb-1">
                        Our Services
                    </h3>
                    <ul className="flex flex-col gap-3">
                        {[
                            { name: "Book Lab Tests", href: "/booklabtest" },
                            { name: "Buy Medicines", href: "/buymedicine" },
                            { name: "Book Appointments", href: "/drappointment" },
                            { name: "Nursing Services", href: "/nursingservice" },
                            { name: "Book Ambulances", href: "/ambulance" },
                            { name: "Visit Hospital", href: "/hospital" },
                        ].map((service) => (
                            <li key={service.name}>
                                <Link
                                    href={service.href}
                                    className="text-white text-sm hover:text-[#08B36A] transition-colors"
                                >
                                    {service.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Subscribe & Issue Action Buttons */}
                <div className="lg:col-span-5 space-y-5">
                    <div>
                        <h3 className="text-white text-lg font-bold mb-3 border-b-2 border-[#08B36A] inline-block pb-1">
                            Subscribe
                        </h3>
                        <p className="text-sm mb-4">
                            Don’t miss to subscribe to our new feeds, kindly fill the form below.
                        </p>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                console.log("Subscribed:", email);
                                setEmail("");
                            }}
                            className="flex w-full mb-4"
                        >
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="flex-1 p-3 bg-[#1c1c1c] text-white border-none focus:ring-1 focus:ring-[#08B36A] outline-none text-sm"
                            />
                            <button
                                type="submit"
                                className="bg-[#08B36A] px-5 text-white hover:bg-[#079b5c] transition-colors"
                            >
                                <FaPaperPlane />
                            </button>
                        </form>
                    </div>

                    {/* 🚨 24/7 Issue Reporting & Live Tracking Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link
                            href="/reportissue/report-issue"
                            className="flex items-center justify-center gap-2 bg-[#1c1c1c] border border-amber-500/40 hover:border-amber-500 text-amber-400 hover:text-white hover:bg-amber-600/20 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm group"
                        >
                            <FaExclamationCircle className="text-amber-400 group-hover:scale-110 transition-transform" />
                            <span>Report an Issue</span>
                        </Link>

                        <Link
                            href="/reportissue/my-tickets"
                            className="flex items-center justify-center gap-2 bg-[#1c1c1c] border border-[#08B36A]/40 hover:border-[#08B36A] text-[#08B36A] hover:text-white hover:bg-[#08B36A]/20 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm group"
                        >
                            <FaHeadset className="text-[#08B36A] group-hover:scale-110 transition-transform" />
                            <span>Track My Tickets</span>
                        </Link>
                    </div>

                    {/* Special Login Button */}
                    <div
                        className="cursor-pointer group pt-1"
                        onClick={() => openModal("policeandfire")}
                    >
                        <p className="text-xs text-gray-400 mb-1.5">Login for Police Station and Fire Station</p>
                        <div className="bg-[#08B36A] text-white py-2.5 px-5 rounded-xl text-center text-xs font-bold group-hover:bg-[#079b5c] transition-all">
                            Police Station and Fire Station
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-10 pt-6 border-t border-[#222] flex flex-col items-center gap-6 md:flex-row md:justify-between">
                <p className="text-sm text-center md:text-left">
                    {footerData.copyrightText.includes("Dr. Parveen") ? (
                        <>
                            Copyright © 2018, All Right Reserved{" "}
                            <span className="text-[#08B36A] font-semibold">Dr. Parveen</span>
                        </>
                    ) : (
                        footerData.copyrightText
                    )}
                </p>

                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                    {bottomLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-[#ccc] text-sm hover:text-[#08B36A] transition-colors whitespace-nowrap"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}

export default Footer;