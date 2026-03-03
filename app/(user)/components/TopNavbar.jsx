"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "../components/styles/TopNavbar.css";
import {
  FaMapMarkerAlt,
  FaShoppingCart,
  FaTag,
  FaUser,
  FaTimes,
  FaSearch,
  FaUserCircle,
  FaSignOutAlt,
  FaChevronRight,
  FaHistory,
  FaWallet,
  FaHospital,
  FaAmbulance,
  FaFilePrescription,
  FaAddressBook
} from "react-icons/fa";

import MainLogin from "./loginComponents/MainLogin";
import MainRegister from "./registerComponents/MainRegister";
import { useGlobalContext } from "@/app/context/GlobalContext";

export default function TopNavbar() {
  const [modalType, setModalType] = useState(null);
  const [token, setToken] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const { openModal } = useGlobalContext();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

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
        <div className="tnav-left">
          <div className="location-badge">
            <FaMapMarkerAlt className="tnav-icon-main" />
            <span className="tnav-location-text">aksj</span>
          </div>
        </div>

        <div className="tnavv-center">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              suppressHydrationWarning
              type="search"
              placeholder="Search medicines, health products..."
              className="tnavv-search-input"
            />
          </div>
        </div>

        <div className="tnav-right">
          {!token && (
            <div className="auth-buttons">
              <span className="tnav-link" onClick={() => openModal("login")}>
                Login
              </span>
              <span className="tnav-divider"></span>
              <span className="tnav-link" onClick={() => openModal("register")}>
                Register
              </span>
            </div>
          )}

          {token && (
            <div className="profile-trigger" onClick={() => setProfileOpen(true)}>
              <div className="avatar-sm">K</div>
              <span className="tnav-link">Profile</span>
            </div>
          )}

          <Link href="/cart" className="tnav-link-iconic">
            <div className="icon-badge-wrapper">
              <FaShoppingCart />
              <span className="badge-count">0</span>
            </div>
            <span>Cart</span>
          </Link>

          <Link href="/offers" className="tnav-link-iconic">
            <FaTag />
            <span>Offers</span>
          </Link>
        </div>
      </nav>

      {/* LOGIN / REGISTER MODAL */}
      {modalType && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            {modalType === "login" && (
              <MainLogin
                onClose={() => setModalType(null)}
                openModal={() => openModal("register")}
              />
            )}
            {modalType === "register" && (
              <MainRegister
                onClose={() => setModalType(null)}
                openModal={() => openModal("login")}
              />
            )}
          </div>
        </div>
      )}

      {/* PROFILE SIDE MODAL */}
      {profileOpen && (
        <div className="profile-overlay" onClick={() => setProfileOpen(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-header-new">
              <button className="close-btn" onClick={() => setProfileOpen(false)}>
                <FaTimes />
              </button>
              <div className="profile-user-card">
                <div className="profile-avatar-large">K</div>
                <div className="profile-user-details">
                  <h3>Khanday</h3>
                  <p>6006287541</p>
                  <span className="gender-tag">Male</span>
                </div>
              </div>
            </div>

            <div className="profile-menu">
              {menuItems.map((item, index) => (
                <Link href={item.link} key={index} className="profile-item-new">
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
      )}
    </>
  );
}