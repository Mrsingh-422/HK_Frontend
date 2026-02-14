
"use client";
import React, { useState } from "react";
import "./MainRegister.css";
import UserRegister from "./userRegister/UserRegister";
import RegisterAsDoctorAppointment from "./regesterAsDoctorAppointment/RegisterAsDoctorAppointment";
import RegisterAsServiceProvider from "./registerAsServiceProvider/RegisterAsServiceProvider";
import RegisterAsHospital from "./registerAsHospital/RegisterAsHospital";

function MainRegister({ onClose, openModal }) {
    const [activeTab, setActiveTab] = useState("user");

    const renderContent = () => {
        switch (activeTab) {
            case "user": return <UserRegister onClose={onClose} openModal={openModal} />;
            case "hospital": return <RegisterAsHospital onClose={onClose} openModal={openModal} />;
            // case "doctor": return <LoginAsDoctor onClose={onClose} openModal={openModal} />;
            case "provider": return <RegisterAsServiceProvider onClose={onClose} openModal={openModal} />;
            case "appointment": return <RegisterAsDoctorAppointment onClose={onClose} openModal={openModal} />;
            default: return null;
        }
    };

    return (
        <div className="login-modal-container">
            <div className="loginAsContainer">
                <span>Registration Option</span>

                {/* CLOSE BUTTON */}
                <span onClick={onClose}>✖</span>
            </div>

            <div className="login-tabs">
                <button className={activeTab === "user" ? "tab active" : "tab"} onClick={() => setActiveTab("user")}>
                    Register as User
                </button>

                <button className={activeTab === "appointment" ? "tab active" : "tab"} onClick={() => setActiveTab("appointment")}>
                    Register as Doctor Appointment
                </button>

                <button className={activeTab === "provider" ? "tab active" : "tab"} onClick={() => setActiveTab("provider")}>
                    Register a Service Provider
                </button>

                <button className={activeTab === "hospital" ? "tab active" : "tab"} onClick={() => setActiveTab("hospital")}>
                    Register as Hospital
                </button>

                {/* <button className={activeTab === "doctor" ? "tab active" : "tab"} onClick={() => setActiveTab("doctor")}>
                    Login As Hospital Doctor
                </button> */}

            </div>

            <div className="login-body">
                {renderContent()}
            </div>
        </div>
    );
}

export default MainRegister;
