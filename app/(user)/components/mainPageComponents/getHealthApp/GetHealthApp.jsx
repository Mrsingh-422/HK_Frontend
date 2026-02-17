"use client";
import React from "react";
import "./GetHealthApp.css";
import { FaGooglePlay, FaApple } from "react-icons/fa";
import Link from "next/link";

function GetHealthApp() {
    return (
        <section className="health-app">
            <div className="health-container">

                {/* Left Content */}
                <div className="health-left">
                    <h4>Search Health Kangaroo APP</h4>
                    <h1>Get Health APP Now</h1>
                    <p>
                        Why I say old chap that is spiffing in my flat a blinding shot,
                        Elizabeth blow off arse ummm I'm telling sloshed smashing.!
                    </p>

                    <div className="app-buttons">
                        <Link href="" className="playstore-btn">
                            <FaGooglePlay className="icon" />
                            <div>
                                <span>GET IT ON</span>
                                <strong>Google Play</strong>
                            </div>
                        </Link>

                        <Link href="" className="appstore-btn">
                            <FaApple className="icon" />
                            <div>
                                <span>Download on the</span>
                                <strong>App Store</strong>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Right Content */}
                <div className="health-right">
                    <div className="image-column column-one">
                        <img
                            src="./phone_one.png"
                            alt="Doctor"
                        />
                    </div>

                    <div className="image-column column-two">
                        <img
                            src="https://healthkangaroo.com/home/img/phone_one-22.png"
                            alt="Doctor"
                        />
                    </div>
                </div>


            </div>
        </section>
    );
}

export default GetHealthApp;
