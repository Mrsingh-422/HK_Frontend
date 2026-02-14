"use client";

import React, { useState, useEffect } from "react";
import "./Medicines.css";
import Link from "next/link";

const Medicines = () => {

    /* ================= IMAGE ARRAY ================= */
    const images = [
        "https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692602940med1.jpg",
        "https://healthvideos12-new1.s3.us-west-2.amazonaws.com/16925926181680343192med18.png",
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto slide every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 4000);

        return () => clearInterval(interval);
    }, [currentIndex]);

    const nextSlide = () => {
        setCurrentIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    return (
        <section className="med-section">
            <div className="med-container">

                {/* LEFT SIDE */}
                <div className="med-left">

                    <div className="med-top-row">
                        <p className="med-arrow">←</p>
                        <span className="med-label">Medicines</span>
                        <p className="med-arrow">→</p>
                    </div>

                    <h1 className="med-heading">Featured Products</h1>

                    <div className="med-description">
                        <p>
                            Medicines can treat diseases and improve your health. If you are like most people, you need to take medicine at some point in your life. You may need to take medicine every day, or you may only need to take medicine once in a while. Either way, you want to make sure that your medicines are safe, and that they will help you get better. You may need to take medicine every day, or you may only need to take medicine once in a while
                        </p>
                    </div>

                    <Link href='/' className="med-btn">Order Now</Link>

                </div>

                {/* RIGHT SIDE IMAGE CAROUSEL */}
                <div className="med-right">

                    <div className="med-carousel">
                        <div
                            className="med-carousel-track"
                            style={{
                                transform: `translateX(-${currentIndex * 100}%)`
                            }}
                        >
                            {images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt="Medicine"
                                    className="med-image"
                                />
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
};

export default Medicines;
