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
  FaLocationArrow,
  FaCity,
  FaChevronDown
} from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";

import MainLogin from "./loginComponents/MainLogin";
import MainRegister from "./registerComponents/MainRegister";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import UserAPI from "@/app/services/UserAPI";

export default function TopNavbar() {
  const [token, setToken] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // --- LOCATION STATES ---
  const [locationName, setLocationName] = useState("Detecting...");
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [cityInput, setCityInput] = useState("");
  const [citySuggestions, setCitySuggestions] = useState([]);

  const { cartItemIds } = useCart();
  const { openModal, modalType, closeModal } = useGlobalContext();
  const { logout } = useAuth();

  const DELHI_COORDS = { lat: 28.6139, lng: 77.209 };

  // Helper: Reverse Geocode to get City Name
  const fetchAddressName = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const city = data.address.city || data.address.town || data.address.village || data.address.suburb || "Delhi";
      const pincode = data.address.postcode || "";
      setLocationName(`${city}${pincode ? ", " + pincode : ""}`);
    } catch (error) {
      setLocationName("Location Found");
    }
  };

  // Helper: Update Coords in State and LocalStorage
  const updateLocation = (lat, lng) => {
    const newCoords = { lat, lng };
    setCoords(newCoords);
    localStorage.setItem("userCoords", JSON.stringify(newCoords));
    fetchAddressName(lat, lng);
    setShowLocationPicker(false);
    setCityInput("");
    setCitySuggestions([]);
  };

  // Helper: Get Current GPS Location
  const handleDetectLocation = () => {
    if ("geolocation" in navigator) {
      setLocationName("Detecting...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation denied:", error);
          alert("Location access denied. Setting default location to Delhi.");
          updateLocation(DELHI_COORDS.lat, DELHI_COORDS.lng);
        }
      );
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("userToken");
    setToken(storedToken);

    if (profileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // INITIAL LOAD LOGIC
    const savedCoords = localStorage.getItem("userCoords");
    if (savedCoords) {
      const parsed = JSON.parse(savedCoords);
      setCoords(parsed);
      fetchAddressName(parsed.lat, parsed.lng);
    } else {
      // If no saved coords, try to auto-detect or fallback to Delhi
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => updateLocation(position.coords.latitude, position.coords.longitude),
          () => updateLocation(DELHI_COORDS.lat, DELHI_COORDS.lng)
        );
      } else {
        updateLocation(DELHI_COORDS.lat, DELHI_COORDS.lng);
      }
    }
  }, [profileOpen]);

  // --- MANUAL SEARCH LOGIC ---
  const handleCityInputChange = async (val) => {
    setCityInput(val);
    if (val.length > 1) {
      try {
        const res = await UserAPI.getCitySuggestions(val);
        if (res.success) {
          setCitySuggestions(res.data);
        }
      } catch (err) {
        console.error("City suggestion error:", err);
      }
    } else {
      setCitySuggestions([]);
    }
  };

  const selectCityFromSuggestion = async (item) => {
    try {
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(item.city + ", " + item.state)}`;
      const geoRes = await fetch(geocodeUrl);
      const geoData = await geoRes.json();

      if (geoData && geoData.length > 0) {
        updateLocation(parseFloat(geoData[0].lat), parseFloat(geoData[0].lon));
      } else {
        // Fallback if geocoding fails, just update name
        setLocationName(item.city);
        setShowLocationPicker(false);
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
    }
  };

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
          <div className="tnav-left" style={{ position: 'relative' }}>
            <div
              className="location-badge-new"
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                padding: '6px 12px', borderRadius: '8px', backgroundColor: '#f3f4f6',
                transition: 'all 0.2s'
              }}
            >
              <FaMapMarkerAlt className="tnav-icon-marker" style={{ color: '#ef4444' }} />
              <div className="location-texts">
                <span className="loc-label" style={{ fontSize: '10px', display: 'block', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>Deliver to</span>
                <span className="tnav-location-text" style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {locationName} <FaChevronDown size={10} style={{ opacity: 0.5 }} />
                </span>
              </div>
            </div>

            {/* DESIGNED LOCATION PICKER PANEL */}
            {showLocationPicker && (
              <div className="location-panel-dropdown" style={{
                position: 'absolute', top: '55px', left: '0', width: '320px',
                backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                zIndex: 1000, border: '1px solid #f3f4f6', overflow: 'hidden', padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111827' }}>Change Location</h4>
                  <FaTimes style={{ cursor: 'pointer', color: '#9ca3af' }} onClick={() => setShowLocationPicker(false)} />
                </div>

                <div
                  onClick={handleDetectLocation}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                    backgroundColor: '#eff6ff', borderRadius: '12px', cursor: 'pointer',
                    color: '#2563eb', marginBottom: '16px', transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                >
                  <FaLocationArrow />
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>Detect my current location</span>
                </div>

                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <FaSearch style={{ position: 'absolute', left: '12px', top: '14px', color: '#9ca3af' }} />
                  <input
                    type="text"
                    placeholder="Search for city or area..."
                    value={cityInput}
                    onChange={(e) => handleCityInputChange(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px',
                      border: '1px solid #e5e7eb', outline: 'none', fontSize: '14px',
                      backgroundColor: '#f9fafb ', color: '#111827',
                    }}
                  />
                </div>

                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {citySuggestions.length > 0 ? (
                    citySuggestions.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => selectCityFromSuggestion(item)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '10px',
                          cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ width: '32px', height: '32px', backgroundColor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FaCity style={{ color: '#6b7280', fontSize: '14px' }} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#374151' }}>{item.city}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{item.state}, {item.country}</p>
                        </div>
                      </div>
                    ))
                  ) : cityInput.length > 1 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>No results found</div>
                  ) : (
                    <div style={{ padding: '10px', color: '#9ca3af', fontSize: '12px', fontWeight: '500' }}>RECENT CITIES</div>
                  )}
                </div>
              </div>
            )}
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

      {/* Backdrop for Location Picker */}
      {showLocationPicker && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 999, backgroundColor: 'transparent' }}
          onClick={() => setShowLocationPicker(false)}
        />
      )}

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