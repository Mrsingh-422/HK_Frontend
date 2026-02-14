"use client";
import React, { useState, useEffect } from "react";
import "./Hospitals.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Link from "next/link";

const images = [
    "https://healthvideos12-new1.s3.us-west-2.amazonaws.com/16925932861680679867hospital-book.png",
    "https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1692603059SMS-Hospital.jpeg",
];

function Hospitals() {
    const [current, setCurrent] = useState(0);

    // Same slider logic as Nursing
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) =>
                prev === images.length - 1 ? 0 : prev + 1
            );
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="hospital-section">
            <div className="hospital-container">

                {/* LEFT SIDE - IMAGE SLIDER */}
                <div className="hospital-left">
                    <div
                        className="slider-track"
                        style={{
                            transform: `translateX(-${current * 100}%)`,
                        }}
                    >
                        {images.map((img, index) => (
                            <img key={index} src={img} alt="Hospital" />
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDE - CONTENT */}
                <div className="hospital-right">
                    <div className="hospital-header">
                        <span>
                            <FaArrowLeft /> Hospitals <FaArrowRight />
                        </span>
                        <h2>Hospital Facilities</h2>
                    </div>

                    <div className="hospital-description">
                        <p>
                            A health facility is, in general, any location where healthcare is provided.
                            Health facilities range from small clinics and doctor's offices to urgent
                            care centers and large hospitals with elaborate emergency rooms and trauma centers.
                        </p>
                        <p>
                            Modern hospitals provide advanced diagnostic services, surgical procedures,
                            emergency care, and specialized treatment options to ensure patients receive
                            comprehensive medical support.
                        </p>
                        <p>
                            Our hospitals are equipped with modern technology, skilled professionals,
                            and patient-centered care systems to ensure the highest standards of healthcare.
                        </p>
                    </div>

                    <Link href="/" className="book-btn">
                        Book Now
                    </Link>
                </div>

            </div>
        </section>
    );
}

export default Hospitals;
