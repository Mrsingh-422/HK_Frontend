"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  FaChevronDown,
  FaUserMd,
  FaCapsules,
  FaMicroscope,
  FaUserNurse,
  FaStethoscope
} from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";

import MainLogin from "./loginComponents/MainLogin";
import MainRegister from "./registerComponents/MainRegister";
import { useGlobalContext } from "@/app/context/GlobalContext";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import UserAPI from "@/app/services/UserAPI";

export default function TopNavbar() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // --- SEARCH STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

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

  // --- SEARCH LOGIC ---

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 2) {
        fetchSearchSuggestions();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchSearchSuggestions = async () => {
    setIsSearching(true);
    try {
      const res = await UserAPI.getGlobalSearchSuggestions(searchQuery);
      if (res.success) {
        setSuggestions(res.data);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error("Search suggestion error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      setShowSuggestions(false);
      router.push(`/userscreens/searchresults?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  // --- DYNAMIC NAVIGATION LOGIC BASED ON TYPE ---
  const handleSuggestionClick = (item) => {
    setShowSuggestions(false);
    setSearchQuery(item.title);

    const id = item.id;
    const type = item.type; // Matches your API response 'type' field
    // alert(`Clicked on ${type} with ID: ${id}`); // For debugging

    switch (type) {
      case "Doctor":
        router.push(`/drappointment/doctordetail/${id}`);
        break;
      case "Lab":
        router.push(`/booklabtest/singlelabdetail/${id}`);
        break;
      case "Lab Test":
        router.push(`/booklabtest/testdetails/${id}`);
        break;
      case "Lab Package":
        router.push(`/booklabtest/packagedetails/${id}`);
        break;
      case "Medicine":
        router.push(`/buymedicine/singleproductdetail/${id}`);
        break;
      case "Hospital":
        router.push(`/hospital/hospitaldetail/${id}`);
        break;
      case "Ambulance":
        router.push(`/ambulance/medicalambuancebooking/${id}`);
        break;
      case "Nurse Service":
        router.push(`/nursingservice/nurseservicedetail/${id}`);
        break;
      default:
        // Fallback for general search results
        router.push(`/userscreens/searchresults?query=${encodeURIComponent(item.title)}`);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIconByType = (type) => {
    switch (type) {
      case 'Doctor': return <FaUserMd className="text-blue-500" />;
      case 'Medicine': return <FaCapsules className="text-green-500" />;
      case 'Lab Test': return <FaMicroscope className="text-purple-500" />;
      case 'Nurse Service': return <FaUserNurse className="text-pink-500" />;
      case 'Hospital': return <FaHospital className="text-red-500" />;
      case 'Ambulance': return <FaAmbulance className="text-orange-500" />;
      default: return <FaStethoscope className="text-gray-400" />;
    }
  };

  // --- LOCATION LOGIC ---
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

  const updateLocation = (lat, lng) => {
    const newCoords = { lat, lng };
    setCoords(newCoords);
    localStorage.setItem("userCoords", JSON.stringify(newCoords));
    fetchAddressName(lat, lng);
    setShowLocationPicker(false);
    setCityInput("");
    setCitySuggestions([]);
  };

  const handleDetectLocation = () => {
    if ("geolocation" in navigator) {
      setLocationName("Detecting...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateLocation(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation denied:", error);
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

    const savedCoords = localStorage.getItem("userCoords");
    if (savedCoords) {
      const parsed = JSON.parse(savedCoords);
      setCoords(parsed);
      fetchAddressName(parsed.lat, parsed.lng);
    } else {
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

  const handleCityInputChange = async (val) => {
    setCityInput(val);
    if (val.length > 1) {
      try {
        const res = await UserAPI.getCitySuggestions(val);
        if (res.success) setCitySuggestions(res.data);
      } catch (err) {
        console.error("City error:", err);
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
        setLocationName(item.city);
        setShowLocationPicker(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const menuItems = [
    { icon: <FaUserCircle />, label: "My Account", link: "/userscreens/myaccount" },
    { icon: <FaHistory />, label: "My Orders", link: "/userscreens/previousorders" },
    { icon: <FaHospital />, label: "Hospital Booking", link: "/userscreens/hospitalappointment" },
    { icon: <FaUserMd />, label: "Doctor Appointment", link: "/userscreens/doctorappointment" },
    { icon: <FaAmbulance />, label: "Ambulance Booking", link: "/userscreens/ambulanceappointment" },
    { icon: <FiMessageCircle />, label: "Chats", link: "/userscreens/mychats" },
    { icon: <FaFilePrescription />, label: "My Prescriptions", link: "/userscreens/myprescriptions" },
    { icon: <FaWallet />, label: "Wallet", link: "/" },
    { icon: <FaTimes />, label: "Health Locker", link: "/userscreens/lockerScreens" },
    { icon: <FaTimes />, label: "Verify AHBA", link: "/userscreens/abhascreen" },
  ];

  return (
    <>
      <nav className="w-full bg-[#08b36a] py-3 text-white shadow-md">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2.5 px-5 md:flex-nowrap md:gap-5">

          {/* LOCATION */}
          <div className="relative shrink-0 order-1">
            <div
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              className="flex items-center gap-2 rounded-lg bg-white/10 border border-white/10 px-3 py-1.5 cursor-pointer hover:bg-white/20"
            >
              <FaMapMarkerAlt className="text-white" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase opacity-80">Deliver to</span>
                <span className="flex items-center gap-1 text-xs font-semibold whitespace-nowrap">
                  {locationName} <FaChevronDown size={8} />
                </span>
              </div>
            </div>

            {showLocationPicker && (
              <div className="absolute top-[55px] left-0 w-[300px] rounded-xl bg-white p-4 shadow-2xl z-[1000] text-gray-900 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold">Change Location</h4>
                  <FaTimes className="cursor-pointer text-gray-400" onClick={() => setShowLocationPicker(false)} />
                </div>
                <div onClick={handleDetectLocation} className="flex items-center gap-2 rounded-lg bg-blue-50 p-2 text-blue-600 mb-3 cursor-pointer text-sm font-semibold">
                  <FaLocationArrow /> Detect current location
                </div>
                <input
                  type="text"
                  placeholder="Search city..."
                  value={cityInput}
                  onChange={(e) => handleCityInputChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 p-2 text-sm outline-none mb-2"
                />
                <div className="max-h-[200px] overflow-y-auto">
                  {citySuggestions.map((item, idx) => (
                    <div key={idx} onClick={() => selectCityFromSuggestion(item)} className="p-2 hover:bg-gray-100 cursor-pointer rounded text-sm">
                      <span className="font-bold">{item.city}</span>, <span className="text-gray-500">{item.state}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SEARCH BAR */}
          <div className="w-full max-w-full order-3 mt-1.5 md:max-w-[600px] md:flex-1 md:order-2 md:mt-0 relative" ref={searchRef}>
            <div className="relative w-full">
              <FaSearch className={`absolute left-4 top-1/2 -translate-y-1/2 ${isSearching ? 'text-[#08b36a] animate-pulse' : 'text-gray-400'}`} />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                placeholder="Search medicines, doctors, hospitals..."
                className="w-full rounded-xl border-none bg-white py-3 pl-12 pr-4 text-sm text-gray-800 outline-none shadow-sm focus:ring-2 focus:ring-white/50"
              />
            </div>

            {/* SUGGESTIONS DROPDOWN */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-[52px] left-0 w-full rounded-xl bg-white shadow-2xl z-[2000] border border-gray-100 overflow-hidden">
                <div className="max-h-[420px] overflow-y-auto py-1">
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSuggestionClick(item)}
                      className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-none"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg">
                        {item.image ? (
                          <img src={item.image} alt="" className="h-full w-full rounded-lg object-cover" />
                        ) : (
                          getIconByType(item.type)
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="m-0 truncate text-sm font-bold text-gray-900">{item.title}</p>
                        <p className="m-0 truncate text-xs text-gray-500">{item.subtitle}</p>
                      </div>
                      <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-[9px] font-bold uppercase text-gray-400 tracking-tighter">
                        {item.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex shrink-0 items-center gap-4 order-2 md:order-3">
            {!token ? (
              <div className="flex items-center gap-2">
                <button className="text-sm font-bold text-white bg-transparent border-none cursor-pointer" onClick={() => openModal("login")}>Login</button>
                <span className="opacity-30">|</span>
                <button className="text-sm font-bold text-white bg-transparent border-none cursor-pointer" onClick={() => openModal("register")}>Signup</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full bg-white/10 p-1 pr-3 cursor-pointer hover:bg-white/20" onClick={() => setProfileOpen(true)}>
                <div className="h-7 w-7 flex items-center justify-center rounded-full bg-white text-xs font-bold text-[#08b36a]">K</div>
                <span className="hidden sm:inline text-sm font-semibold">Profile</span>
              </div>
            )}

            <Link href="/userscreens/usercart" className="flex items-center gap-2 text-white no-underline relative">
              <FaShoppingCart className="text-xl" />
              {cartItemIds.length > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold animate-bounce">
                  {cartItemIds.length}
                </span>
              )}
              <span className="hidden lg:inline text-sm font-medium">Cart</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* MODALS */}
      {modalType && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="m-4 w-full max-w-md rounded-2xl bg-white p-2" onClick={(e) => e.stopPropagation()}>
            {modalType === "login" && <MainLogin onClose={closeModal} />}
            {modalType === "register" && <MainRegister onClose={closeModal} />}
          </div>
        </div>
      )}

      {/* PROFILE SIDE DRAWER */}
      <div
        className={`fixed inset-0 w-full h-full bg-black/50 backdrop-blur-sm z-[10001] transition-opacity duration-300 ${profileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setProfileOpen(false)}
      >
        <div
          className={`absolute right-0 top-0 w-[85%] sm:w-[350px] h-full bg-white shadow-2xl transition-transform duration-300 ${profileOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[#08b36a] px-6 py-10 text-white relative">
            <FaTimes className="absolute right-5 top-5 cursor-pointer" onClick={() => setProfileOpen(false)} />
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-white text-2xl font-bold text-[#08b36a]">K</div>
              <div>
                <h3 className="font-bold">Khanday</h3>
                <p className="text-sm opacity-80">+91 6006287541</p>
              </div>
            </div>
          </div>
          <div className="py-4 overflow-y-auto h-full">
            {menuItems.map((item, idx) => (
              <Link href={item.link} key={idx} className="flex items-center px-6 py-3.5 text-gray-700 no-underline hover:bg-gray-50 border-b border-gray-50" onClick={() => setProfileOpen(false)}>
                <span className="w-10 text-[#08b36a]">{item.icon}</span>
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                <FaChevronRight className="text-[10px] text-gray-300" />
              </Link>
            ))}
            <div className="flex items-center px-6 py-4 text-red-500 font-bold border-t mt-4 cursor-pointer" onClick={() => { setProfileOpen(false); logout(); }}>
              <span className="w-10"><FaSignOutAlt /></span> Logout
            </div>
          </div>
        </div>
      </div>
    </>
  );
}