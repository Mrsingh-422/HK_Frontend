"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "../components/styles/TopNavbar.css";
import {
  FaMapMarkerAlt,
  FaShoppingCart,
  FaTag,
  FaSearch,
  FaUserCircle,
  FaSignOutAlt,
  FaChevronRight,
  FaHistory,
  FaWallet,
  FaHospital,
  FaAmbulance,
  FaFilePrescription,
  FaAddressBook,
  FaTimes
} from "react-icons/fa";

import MainLogin from "./loginComponents/MainLogin";
import MainRegister from "./registerComponents/MainRegister";
import { useGlobalContext } from "@/app/context/GlobalContext";

export default function TopNavbar() {
  const [token, setToken] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Note: Using modalType from GlobalContext if that's where your state lives
  // Otherwise, keeping local state logic for the Login/Register visibility
  const { openModal, modalType, closeModal } = useGlobalContext();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    // Prevent body scroll when profile is open
    if (profileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [profileOpen]);

  const menuItems = [
    { icon: <FaUserCircle />, label: "My Account", link: "/" },
    { icon: <FaAddressBook />, label: "Address Book", link: "/" },
    { icon: <FaHistory />, label: "My Orders", link: "/" },
    { icon: <FaHospital />, label: "Hospital Appointment", link: "/" },
    { icon: <FaAmbulance />, label: "Ambulance Booking", link: "/" },
    { icon: <FaFilePrescription />, label: "My Prescriptions", link: "/" },
    { icon: <FaWallet />, label: "Wallet", link: "/" },
  ];

  return (
    <>
      <nav className="tnav-wrapper">
        <div className="tnav-container">
          {/* LEFT: Location */}
          <div className="tnav-left">
            <div className="location-badge">
              <FaMapMarkerAlt className="tnav-icon-marker" />
              <div className="location-texts">
                <span className="loc-label">Deliver to</span>
                <span className="tnav-location-text">Khanday, 190001</span>
              </div>
            </div>
          </div>

          {/* CENTER: Search Bar */}
          <div className="tnav-center">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="search"
                placeholder="Search medicines, health products..."
                className="tnav-search-input"
              />
            </div>
          </div>

          {/* RIGHT: Actions */}
          <div className="tnav-right">
            {!token ? (
              <div className="auth-buttons">
                <button className="tnav-auth-btn" onClick={() => openModal("login")}>
                  Login
                </button>
                <span className="tnav-divider">|</span>
                <button className="tnav-auth-btn" onClick={() => openModal("register")}>
                  Signup
                </button>
              </div>
            ) : (
              <div className="profile-trigger" onClick={() => setProfileOpen(true)}>
                <div className="avatar-sm">K</div>
                <span className="profile-name-label">Profile</span>
              </div>
            )}

            <Link href="/offers" className="tnav-link-iconic hide-mobile">
              <FaTag />
              <span className="link-text">Offers</span>
            </Link>

            <Link href="/cart" className="tnav-link-iconic">
              <div className="icon-badge-wrapper">
                <FaShoppingCart />
                <span className="badge-count">0</span>
              </div>
              <span className="link-text">Cart</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* LOGIN / REGISTER MODAL (Controlled by Global Context) */}
      {modalType && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            {modalType === "login" && <MainLogin onClose={closeModal} />}
            {modalType === "register" && <MainRegister onClose={closeModal} />}
          </div>
        </div>
      )}

      {/* PROFILE SIDE MODAL */}
      <div className={`profile-overlay ${profileOpen ? 'active' : ''}`} onClick={() => setProfileOpen(false)}>
        <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
          <div className="profile-header-new">
            <button className="close-btn" onClick={() => setProfileOpen(false)}>
              <FaTimes />
            </button>
            <div className="profile-user-card">
              <div className="profile-avatar-large">K</div>
              <div className="profile-user-details">
                <h3>Khanday</h3>
                <p>+91 6006287541</p>
                <span className="gender-tag">Male</span>
              </div>
            </div>
          </div>

          <div className="profile-menu">
            {menuItems.map((item, index) => (
              <Link href={item.link} key={index} className="profile-item-new" onClick={() => setProfileOpen(false)}>
                <span className="item-icon">{item.icon}</span>
                <span className="item-label">{item.label}</span>
                <FaChevronRight className="arrow-right" />
              </Link>
            ))}
            <div className="profile-item-new logout-new">
              <span className="item-icon"><FaSignOutAlt /></span>
              <span className="item-label">Logout</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}