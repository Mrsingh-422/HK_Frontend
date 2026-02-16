"use client";

import React, { useState } from "react";
import Link from "next/link";
import "../components/styles/TopNavbar.css";
import { FaMapMarkerAlt, FaShoppingCart, FaTag } from "react-icons/fa";
import MainLogin from "./loginComponents/MainLogin";
import MainRegister from "./registerComponents/MainRegister";
import { useAuth } from "@/app/context/AuthContext";

export default function TopNavbar() {
  const [modalType, setModalType] = useState(null); // login | register | null

  const { user } = useAuth()

  const openModal = (type) => {
    switch (type) {
      case "login":
        setModalType("login");
        break;
      case "register":
        setModalType("register");
        break;
      case "policeandfire":
        setModalType("policeandfore")
      default:
        setModalType(null);
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <div className="tnav-wrapper">
        <div className="tnav-left">
          <FaMapMarkerAlt className="tnav-icon" />
          <span className="tnav-location-text">aksj</span>
        </div>

        <div className="tnavv-center">
          <input
            suppressHydrationWarning
            type="search"
            placeholder="Search your own things..."
            className="tnavv-search-input"
          />
        </div>

        <div className="tnav-right">
          <span className="tnav-link" onClick={() => openModal("login")}>
            Login
          </span>
          <span className="tnav-divider">|</span>

          <span className="tnav-link" onClick={() => openModal("register")}>
            Register
          </span>
          <span className="tnav-divider">|</span>

          <Link href="/cart" className="tnav-link">
            <FaShoppingCart className="tnav-icon" /> Cart
          </Link>
          <span className="tnav-divider">|</span>

          <Link href="/offers" className="tnav-link">
            <FaTag className="tnav-icon" /> Offers
          </Link>
        </div>
      </div>

      {/* MODAL */}
      {modalType && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>

            {/* SWITCH MODAL CONTENT */}
            {(() => {
              switch (modalType) {
                case "login":
                  return <MainLogin
                    onClose={() => setModalType(null)}
                    openModal={() => openModal("register")} />;

                case "register":
                  return <MainRegister
                    onClose={() => setModalType(null)}
                    openModal={() => openModal("login")}
                  />;

                default:
                  return null;
              }
            })()}
          </div>
        </div>
      )}
    </>
  );
}
