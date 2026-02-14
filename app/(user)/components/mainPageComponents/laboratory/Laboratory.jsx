"use client";

import React, { useState, useEffect } from "react";
import "./Laboratory.css";
import Link from "next/link";

const Laboratory = () => {

    /* ================= IMAGE ARRAY ================= */
    const images = [
        "https://healthvideos12-new1.s3.us-west-2.amazonaws.com/16925927881680343251lab-test.png",
        "https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602956lab1.png",
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto slide
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) =>
                prev === images.length - 1 ? 0 : prev + 1
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <section className="lab-section">
            <div className="lab-container">

                {/* LEFT SIDE IMAGE CAROUSEL */}
                <div className="lab-left">
                    <div className="lab-carousel">
                        <div
                            className="lab-carousel-track"
                            style={{
                                transform: `translateX(-${currentIndex * 100}%)`
                            }}
                        >
                            {images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt="Laboratory"
                                    className="lab-image"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE CONTENT */}
                <div className="lab-right">
                    <div className="lab-top-row">
                        <p className="lab-arrow">←</p>
                        <span className="lab-label">Laboratory</span>
                        <p className="lab-arrow">→</p>
                    </div>

                    <h2 className="lab-heading">
                        Best Laboratories
                    </h2>

                    <div className="lab-description">
                        <p>
                            A laboratory is a facility that provides controlled conditions in which scientific or technological research, experiments, and measurement may be performed. Laboratory services are provided in a variety of settings: physicians' offices, clinics, hospitals, and regional and national referral centers.The organisation and contents of laboratories are determined by the differing requirements of the specialists working within. A physics laboratory might contain a particle accelerator or vacuum chamber.
                        </p>
                    </div>

                    <Link href='/booklabtest' className="lab-btn">Book Now</Link>

                </div>

            </div>
        </section>
    );
};

export default Laboratory;
