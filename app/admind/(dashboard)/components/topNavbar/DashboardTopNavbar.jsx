"use client";

import React, { useState, useRef, useEffect } from "react";
import "./DashboardTopNavbar.css";
import {
    FaEllipsisV,
    FaBell,
    FaUser,
    FaUserEdit,
    FaInfoCircle,
    FaKey,
    FaSignOutAlt
} from "react-icons/fa";
import Link from "next/link";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

const DashboardTopNavbar = ({ heading }) => {
    const [openProfile, setOpenProfile] = useState(false);
    const [openNotifications, setOpenNotifications] = useState(false);
    const router = useRouter()

    const { logout } = useAuth()

    const profileRef = useRef(null);
    const notificationRef = useRef(null);

    const { user } = useGlobalContext()

    const notifications = [
        {
            id: 1,
            message:
                "A new appointment has been successfully booked for tomorrow at 10:30 AM with Dr. Parveen. Please review the patient details and confirm availability."
        },
        {
            id: 2,
            message:
                "A new user has registered on the platform and is awaiting profile verification. Please review the submitted documents to approve the account."
        },
        {
            id: 3,
            message:
                "Warning: The stock level for Paracetamol 500mg has dropped below the minimum threshold. Immediate restocking is recommended to avoid shortages."
        },
        {
            id: 4,
            message:
                "You have received a new message from a patient regarding their recent prescription update. Please check your inbox to respond promptly."
        },
        {
            id: 5,
            message:
                "Monthly performance report for January is now available. Review analytics and revenue insights to track overall growth."
        },
        {
            id: 6,
            message:
                "System update scheduled for tonight at 2:00 AM. The dashboard may be temporarily unavailable during maintenance."
        }
    ];

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setOpenProfile(false);
            }

            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setOpenNotifications(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="dashboard-top-navbar">
            <div className="top-center">
                <p className="welcome-text">Welcome {user}</p>
            </div>

            <div className="top-navbar">

                {/* LEFT */}
                <div className="top-left">
                    <div className="menu-circle">
                        <FaEllipsisV className="menu-icon" />
                    </div>
                    <h2 className="page-heading">{heading}</h2>
                </div>

                {/* RIGHT */}
                <div className="top-right">

                    {/* NOTIFICATIONS */}
                    <div className="notification-wrapper" ref={notificationRef}>
                        <FaBell
                            className="nav-icon"
                            onClick={() => {
                                setOpenNotifications(!openNotifications);
                                setOpenProfile(false);
                            }}
                        />
                        <span className="notification-badge">
                            {notifications.length}
                        </span>

                        {openNotifications && (
                            <div className="notification-dropdown">

                                <div className="notification-header">
                                    <h4>Notifications</h4>
                                </div>

                                {notifications.length === 0 ? (
                                    <p className="no-notification">
                                        No Notifications
                                    </p>
                                ) : (
                                    notifications.map((item) => (
                                        <div
                                            key={item.id}
                                            className="notification-item"
                                        >
                                            <div className="notification-dot"></div>
                                            <span>{item.message}</span>
                                        </div>
                                    ))
                                )}

                                <div className="notification-footer">
                                    <Link
                                        href="/admin"
                                        className="view-all-link"
                                    >
                                        View All Notifications
                                    </Link>
                                </div>

                            </div>
                        )}
                    </div>

                    {/* PROFILE */}
                    <div className="profile-wrapper" ref={profileRef}>
                        <FaUser
                            className="nav-icon user-icon"
                            onClick={() => {
                                setOpenProfile(!openProfile);
                                setOpenNotifications(false);
                            }}
                        />

                        {openProfile && (
                            <div className="profile-dropdown">

                                <Link href="/admin" className="dropdown-item">
                                    <FaUserEdit className="dropdown-icon" />
                                    <span>Edit Profile</span>
                                </Link>

                                <Link href="/admin" className="dropdown-item">
                                    <FaInfoCircle className="dropdown-icon" />
                                    <span>More Info</span>
                                </Link>

                                <Link href="/admin" className="dropdown-item">
                                    <FaKey className="dropdown-icon" />
                                    <span>Change Password</span>
                                </Link>

                                <div className="dropdown-divider"></div>

                                <button className="dropdown-item logout-btn"
                                    onClick={
                                        () => {
                                            logout();
                                            router.push('/admind/login');
                                        }
                                    }
                                >
                                    <FaSignOutAlt className="dropdown-icon" />
                                    <span>Logout</span>
                                </button>

                            </div>
                        )}
                    </div>

                </div>
            </div >
        </div >
    );
};

export default DashboardTopNavbar;