"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";
import "../components/styles/SecondNavbar.css";

function SecondNavbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (path) => pathname === path;

    return (
        <div className="snav-wrapper">
            {/* Logo */}
            <div className="snav-left">
                <Link href='/' >
                <img
                    src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1742900654_Health_Kangaroo-1_1.png"
                    alt="Health Kangaroo"
                    className="snav-logo"
                /></Link>
            </div>

            {/* Hamburger */}
            <div
                className="snav-hamburger"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                {menuOpen ? <FaTimes /> : <FaBars />}
            </div>

            {/* Menu */}
            <div className={`snav-menu ${menuOpen ? "active" : ""}`}>
                <Link
                    href="/"
                    className={`snav-link ${isActive("/") ? "snav-active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                >
                    Home
                </Link>

                <Link
                    href="/booklabtest"
                    className={`snav-link ${isActive("/booklabtest") ? "snav-active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                >
                    Book Lab Tests
                </Link>

                <Link
                    href="/medicine"
                    className={`snav-link ${isActive("/medicine") ? "snav-active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                >
                    Buy Medicine
                </Link>

                <Link
                    href="/doctor-appointment"
                    className={`snav-link ${isActive("/doctor-appointment") ? "snav-active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                >
                    Dr. Appointment
                </Link>

                <Link
                    href="/nursing"
                    className={`snav-link ${isActive("/nursing") ? "snav-active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                >
                    Nursing Service
                </Link>

                <Link
                    href="/ambulance"
                    className={`snav-link ${isActive("/ambulance") ? "snav-active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                >
                    Ambulance
                </Link>

                <Link
                    href="/hospital"
                    className={`snav-link ${isActive("/hospital") ? "snav-active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                >
                    Hospital
                </Link>
            </div>
        </div>
    );
}

export default SecondNavbar;