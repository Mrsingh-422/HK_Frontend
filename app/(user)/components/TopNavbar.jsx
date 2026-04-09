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
  FaTimes,
} from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";

import MainLogin from "./loginComponents/MainLogin";
import MainRegister from "./registerComponents/MainRegister";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";

export default function TopNavbar() {
  const [token, setToken] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // --- LOCATION STATES ---
  const [locationName, setLocationName] = useState("Detecting...");
  const [coords, setCoords] = useState({ lat: null, lng: null });

  const { cartItemIds } = useCart();
  const { openModal, modalType, closeModal } = useGlobalContext();
  const { logout } = useAuth();

  useEffect(() => {
    // 1. Get Auth Token
    const storedToken = localStorage.getItem("userToken");
    setToken(storedToken);

    // 2. Handle Body Scroll
    if (profileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // 3. GET USER LATITUDE AND LONGITUDE
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          setCoords({ lat: latitude, lng: longitude });

          // OPTIONAL: Store in localStorage for use in other components (like HeroSection)
          localStorage.setItem("userCoords", JSON.stringify({ lat: latitude, lng: longitude }));

          // 4. REVERSE GEOCODE (Turn Lat/Lng into a readable City/Area name)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();

            // Extract City or Neighborhood or Postcode
            const city = data.address.city || data.address.town || data.address.village || data.address.suburb || "Unknown Location";
            const pincode = data.address.postcode || "";

            setLocationName(`${city}${pincode ? ", " + pincode : ""}`);
          } catch (error) {
            console.error("Geocoding error:", error);
            setLocationName("Location Found");
          }
        },
        (error) => {
          console.error("Geolocation denied or error:", error);
          setLocationName("Location Denied");
        }
      );
    } else {
      setLocationName("Not Supported");
    }
  }, [profileOpen]);

  const menuItems = [
    { icon: <FaUserCircle />, label: "My Account", link: "/userscreens/myaccount" },
    { icon: <FaHistory />, label: "My Orders", link: "/userscreens/previousorders" },
    { icon: <FaHospital />, label: "Hospital Appointment", link: "/userscreens/hospitalappointment" },
    { icon: <FaAmbulance />, label: "Ambulance Booking", link: "/userscreens/ambulanceappointment" },
    { icon: <FiMessageCircle />, label: "Chats", link: "/userscreens/mychats" },
    { icon: <FaFilePrescription />, label: "My Prescriptions", link: "/userscreens/myprescriptions" },
    { icon: <FaWallet />, label: "Wallet", link: "/" },
    { icon: <FaTimes />, label: "Health Locker", link: "/userscreens/lockerScreens" },
    { icon: <FaTimes />, label: "Verify AHBA", link: "/userscreens/abhascreen" },
  ];

  return (
    <>
      <nav className="tnav-wrapper">
        <div className="tnav-container">
          {/* LEFT: Dynamic Location */}
          <div className="tnav-left">
            <div className="location-badge">
              <FaMapMarkerAlt className="tnav-icon-marker" />
              <div className="location-texts">
                <span className="loc-label">Deliver to</span>
                <span className="tnav-location-text">{locationName}</span>
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

            <Link href="/userscreens/offers" className="tnav-link-iconic hide-mobile">
              <FaTag />
              <span className="link-text">Offers</span>
            </Link>

            <Link href="/userscreens/usercart" className="tnav-link-iconic">
              <div className="icon-badge-wrapper">
                <FaShoppingCart />
                {cartItemIds.length > 0 && (
                  <span className="badge-count animate-bounce-subtle">
                    {cartItemIds.length}
                  </span>
                )}
              </div>
              <span className="link-text">Cart</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* MODALS (Login/Register) */}
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
            <div className="profile-item-new logout-new" onClick={() => {
              setProfileOpen(false);
              logout();
            }}>
              <span className="item-icon"><FaSignOutAlt /></span>
              <span className="item-label">Logout</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}