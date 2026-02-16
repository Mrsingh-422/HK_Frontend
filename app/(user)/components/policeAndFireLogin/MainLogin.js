"use client";
import React, { useState } from "react";
import "./MainLogin.css";
import LoginAsUser from "./loginAsUser/LoginAsUser";
import LoginAsServiceProvider from "./loginAsServiceProvider/LoginAsServiceProvider";
import LoginAsHospital from "./loginAsHospital/LoginAsHospital";
import LoginAsDoctor from "./loginAsDoctor/LoginAsDoctor";
import LoginAsDoctorAppointment from "./loginAsDoctorAppointment/LoginAsDoctorAppointment";

function MainLogin({ onClose, openModal }) {
    const [activeTab, setActiveTab] = useState("user");

    const renderContent = () => {
        switch (activeTab) {
            case "user": return <LoginAsUser onClose={onClose} openModal={openModal} />;
            case "hospital": return <LoginAsHospital onClose={onClose} openModal={openModal} />;
            case "doctor": return <LoginAsDoctor onClose={onClose} openModal={openModal} />;
            case "provider": return <LoginAsServiceProvider onClose={onClose} openModal={openModal} />;
            case "appointment": return <LoginAsDoctorAppointment onClose={onClose} openModal={openModal} />;
            default: return null;
        }
    };

    return (
        <div className="login-modal-container">
            <div className="loginAsContainer">
                <span>Login As</span>

                {/* CLOSE BUTTON */}
                <span onClick={onClose}>✖</span>
            </div>

            <div className="login-tabs">
                <button className={activeTab === "user" ? "tab active" : "tab"} onClick={() => setActiveTab("user")}>
                    Login As User
                </button>

                <button className={activeTab === "provider" ? "tab active" : "tab"} onClick={() => setActiveTab("provider")}>
                    Login As Service Provider
                </button>

                <button className={activeTab === "hospital" ? "tab active" : "tab"} onClick={() => setActiveTab("hospital")}>
                    Login As Hospital
                </button>

                <button className={activeTab === "doctor" ? "tab active" : "tab"} onClick={() => setActiveTab("doctor")}>
                    Login As Hospital Doctor
                </button>

                <button className={activeTab === "appointment" ? "tab active" : "tab"} onClick={() => setActiveTab("appointment")}>
                    Login As Doctor Appointment
                </button>
            </div>

            <div className="login-body">
                {renderContent()}
            </div>
        </div>
    );
}

export default MainLogin;
