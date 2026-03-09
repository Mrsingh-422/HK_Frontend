"use client";

import React, { useState } from "react";
import {
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope,
    FaFacebookF,
    FaTwitter,
    FaGooglePlusG,
    FaInstagram,
    FaYoutube,
    FaPaperPlane,
} from "react-icons/fa";
import Link from "next/link";
import { useGlobalContext } from "@/app/context/GlobalContext";

function Footer() {
    const { openModal } = useGlobalContext();
    const [email, setEmail] = useState("");

    // Define the navigation links for the bottom bar
    const bottomLinks = [
        { name: "Home", href: "/" },
        { name: "Terms & Condition", href: "/terms-and-conditions" },
        { name: "Privacy Policy", href: "/privacy-policy" },
        { name: "Return & refund", href: "/refund-policy" },
        { name: "About us", href: "/about" },
        { name: "Help & Support", href: "/help" },
    ];

    return (
        <footer className="bg-[#0f0f0f] text-[#ccc] px-[5%] py-10 font-sans md:px-[8%]">
            {/* Top Contact Row */}
            <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-3">
                <div className="flex items-start gap-4">
                    <FaMapMarkerAlt className="text-[#08B36A] text-2xl mt-1 shrink-0" />
                    <div>
                        <h4 className="text-white font-bold mb-1">Find us</h4>
                        <p className="text-sm">#omnninos mohali punjab 160055</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <FaPhoneAlt className="text-[#08B36A] text-2xl mt-1 shrink-0" />
                    <div>
                        <h4 className="text-white font-bold mb-1">Call us</h4>
                        <p className="text-sm leading-relaxed">
                            +91 9879879879 <br />
                            +91 9876543210, +91 9875567283
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <FaEnvelope className="text-[#08B36A] text-2xl mt-1 shrink-0" />
                    <div>
                        <h4 className="text-white font-bold mb-1">Mail us</h4>
                        <p className="text-sm leading-relaxed">
                            admin@gmail.com <br />
                            admin13@gmail.com, admin1234@gmail.com
                        </p>
                    </div>
                </div>
            </div>

            <hr className="border-t border-[#222] my-8" />

            {/* Main Footer Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* About */}
                <div className="lg:col-span-4">
                    <h2 className="text-white text-2xl font-bold mb-4">Health Kangaroo</h2>
                    <p className="text-sm leading-[1.7] mb-5 text-gray-400">
                        Providing accessible healthcare solutions including lab tests,
                        doctor appointments, and emergency services at your fingertips.
                    </p>

                    <h4 className="text-white font-bold mb-3">Follow us</h4>
                    <div className="flex flex-wrap gap-3">
                        {[FaFacebookF, FaTwitter, FaGooglePlusG, FaInstagram, FaYoutube].map((Icon, idx) => (
                            <Link
                                key={idx}
                                href="#"
                                className="bg-[#08B36A] text-white p-2.5 rounded-full transition-all hover:-translate-y-1 hover:brightness-110"
                            >
                                <Icon size={18} />
                            </Link>
                        ))}
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

                {/* Subscribe */}
                <div className="lg:col-span-5">
                    <h3 className="text-white text-lg font-bold mb-5 border-b-2 border-[#08B36A] inline-block pb-1">
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
                        className="flex w-full mb-6"
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

                    {/* Special Login Button */}
                    <div
                        className="cursor-pointer group"
                        onClick={() => openModal("policeandfire")}
                    >
                        <p className="text-sm mb-2">Login for Police Station and Fire Station</p>
                        <div className="bg-[#08B36A] text-white py-3 px-5 rounded text-center text-sm font-medium group-hover:bg-[#079b5c] transition-all">
                            Police Station and Fire Station
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar - THE UPDATED NAVIGATION SECTION */}
            <div className="mt-10 pt-6 border-t border-[#222] flex flex-col items-center gap-6 md:flex-row md:justify-between">
                <p className="text-sm text-center md:text-left">
                    Copyright © 2018, All Right Reserved{" "}
                    <span className="text-[#08B36A] font-semibold">Dr. Parveen</span>
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