"use client";

import React, { useState, useEffect } from "react";
import "./AboutUs.css";

const AboutUs = () => {

    /* ---------------- IMAGE CAROUSEL DATA ---------------- */
    const images = [
        "https://healthvideos12-new1.s3.us-west-2.amazonaws.com/16925912431680342928appoint-dr.png",
        "https://healthvideos12-new1.s3.us-west-2.amazonaws.com/16925912531680342963kangaroo-wills.jpg",
    ];

    const [currentImage, setCurrentImage] = useState(0);

    // Auto change image every 4 sec
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) =>
                prev === images.length - 1 ? 0 : prev + 1
            );
        }, 4000);

        return () => clearInterval(interval);
    }, [images.length]);


    /* ---------------- TAB DATA ---------------- */
    const tabContent = {
        Work: "We provide professional healthcare consultation with expert doctors available 24/7. Our platform ensures easy booking, secure communication, and patient-first care experience.",
        Mission: "Our mission is to make healthcare accessible, affordable, and convenient for everyone by connecting patients with certified professionals digitally.",
        Achievement: "We have successfully served thousands of patients, partnered with top hospitals, and maintained 98% satisfaction rate across our healthcare services."
    };

    const [activeTab, setActiveTab] = useState("Work");


    return (
        <section className="au-section">
            <div className="au-container">

                {/* LEFT IMAGE SIDE (CAROUSEL) */}
                <div className="au-image-area">
                    <div className="au-dots"></div>

                    <div className="au-carousel">
                        <div
                            className="au-carousel-track"
                            style={{
                                transform: `translateX(-${currentImage * 100}%)`
                            }}
                        >
                            {images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt="Doctor Consultation"
                                    className="au-main-image"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT CONTENT SIDE */}
                <div className="au-content-area">

                    <div className="au-top-label">
                        <span className="au-small-title">About Us</span>
                        <span className="au-small-arrow">→</span>
                    </div>

                    <h2 className="au-heading">
                        We Are The Best To Take <br /> Care Of You
                    </h2>

                    {/* TABS */}
                    <div className="au-tabs">
                        {Object.keys(tabContent).map((tab) => (
                            <span
                                key={tab}
                                className={`au-tab ${activeTab === tab ? "active-tab" : ""}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </span>
                        ))}
                    </div>

                    {/* DESCRIPTION CHANGES BASED ON TAB */}
                    <div className="au-description">
                        <p>{tabContent[activeTab]}</p>
                    </div>

                    <div className="au-more-link">
                        <span className="au-more-arrow">→</span>
                        <a href="#" className="au-more-text">More</a>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default AboutUs;
