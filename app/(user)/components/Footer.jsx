"use client";

import React, { useState } from "react";
import "./styles/Footer.css";
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

function Footer() {
    const [email, setEmail] = useState("");
    return (
        <footer className="footer">
            {/* Top Contact Row */}
            <div className="footer-top">
                <div className="footer-box">
                    <FaMapMarkerAlt className="footer-icon" />
                    <div>
                        <h4>Find us</h4>
                        <p>#omnninos mohali punjab 160055</p>
                    </div>
                </div>

                <div className="footer-box">
                    <FaPhoneAlt className="footer-icon" />
                    <div>
                        <h4>Call us</h4>
                        <p>
                            +91 9879879879 <br />
                            +91 9876543210, +91 9875567283
                        </p>
                    </div>
                </div>

                <div className="footer-box">
                    <FaEnvelope className="footer-icon" />
                    <div>
                        <h4>Mail us</h4>
                        <p>
                            admin@gmail.com <br />
                            admin13@gmail.com, admin1234@gmail.com
                        </p>
                    </div>
                </div>
            </div>

            <hr />

            {/* Main Footer Content */}
            <div className="footer-main">
                {/* Left */}
                <div className="footer-about">
                    <h2>Health Kangaroo</h2>
                    <p>
                        Lorem ipsum dolor sit amet, consec tetur adipisicing elit, sed do
                        eiusmod tempor incididunt consectetur adipisicing elit.
                    </p>

                    <h4>Follow us</h4>
                    <div className="social-icons">
                        <FaFacebookF />
                        <FaTwitter />
                        <FaGooglePlusG />
                        <FaInstagram />
                        <FaYoutube />
                    </div>
                </div>

                {/* Services */}
                <div className="footer-services">
                    <h3>Our Services</h3>
                    <ul>
                        <Link href='/booklabtest'>Book Lab Tests</Link><br />
                        <Link href='/'>Book Appointments</Link><br />
                        <Link href='/'>Book Ambulances</Link> <br />
                        <Link href='/'>Buy Medicines</Link> <br />
                        <Link href='/'>Nursing Services</Link> <br />
                        <Link href='/'>Visit Hospital</Link> <br />
                    </ul>
                </div>

                {/* Subscribe */}
                <div className="footer-subscribe">
                    <h3>Subscribe</h3>
                    <p>
                        Don’t miss to subscribe to our new feeds, kindly fill the form
                        below.
                    </p>

                    <div className="subscribe-box">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                console.log(email);
                                setEmail("");
                            }}
                            className="subscribe-form"
                        >
                            <input
                                suppressHydrationWarning
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button type="submit">
                                <FaPaperPlane />
                            </button>
                        </form>
                    </div>
                    <div className="login-box">
                        <p>Login for Police Station and Fire Station</p>
                        <Link href="/" className="green-btn">
                            Police Station and Fire Station
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="footer-bottom">
                <p>
                    Copyright © 2018, All Right Reserved <span>Dr. Parveen</span>
                </p>

                <div className="footer-links">
                    <Link href="#">Home</Link>
                    <Link href="#">Terms & Condition</Link>
                    <Link href="#">Privacy Policy</Link>
                    <Link href="#">Return & refund</Link>
                    <Link href="#">About us</Link>
                    <Link href="#">Help & Support</Link>
                </div>
            </div>
        </footer>
    );
}

export default Footer;