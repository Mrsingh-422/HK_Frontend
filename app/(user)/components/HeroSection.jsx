"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import "../components/styles/HeroSection.css";
import {
    FaFlask,
    FaPills,
    FaUserMd,
    FaUserNurse,
    FaAmbulance,
    FaHospital,
} from "react-icons/fa";

const images = [
    "https://healthvideos12-new1.s3.us-west-2.amazonaws.com/16925912031680098876appoint-dr.png",
    "https://healthvideos12-new1.s3.us-west-2.amazonaws.com/16925911941680098842kangaroo-wills.jpg",
    "https://healthvideos12-new1.s3.us-west-2.amazonaws.com/16925911781680098765wave-ground.jpg",
];

function HeroSection() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="hero-wrapper">
            {/* Background Carousel */}
            <div
                className="hero-background"
                style={{ backgroundImage: `url(${images[current]})` }}
            >
                <div className="hero-overlay">
                    <div className="hero-content">
                        <h1>Health Kangaroo Website</h1>
                        <p>
                            Here you will order medicines, book tests,
                            consultations and many more
                        </p>
                    </div>
                </div>
            </div>

            {/* Clickable Cards */}
            <div className="hero-cards">
                <Link href="/booklabtest" className="hero-card">
                    <FaFlask className="card-icon orange" />
                    <span>Book Lab Test</span>
                </Link>

                <Link href="/medicine" className="hero-card">
                    <FaPills className="card-icon purple" />
                    <span>Buy Medicines</span>
                </Link>

                <Link href="/doctor-appointment" className="hero-card">
                    <FaUserMd className="card-icon blue" />
                    <span>Dr. Appointment</span>
                </Link>

                <Link href="/nursing" className="hero-card">
                    <FaUserNurse className="card-icon green" />
                    <span>Nursing Service</span>
                </Link>

                <Link href="/ambulance" className="hero-card">
                    <FaAmbulance className="card-icon red" />
                    <span>Ambulance</span>
                </Link>

                <Link href="/hospital" className="hero-card">
                    <FaHospital className="card-icon darkred" />
                    <span>Hospital</span>
                </Link>
            </div>
        </div>
    );
}

export default HeroSection;
