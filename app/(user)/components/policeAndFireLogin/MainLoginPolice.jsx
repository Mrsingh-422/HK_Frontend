"use client";
import React, { useState } from "react";
import { useGlobalContext } from "@/app/context/GlobalContext";

import LoginAsUser from "../loginComponents/loginAsUser/LoginAsUser";
import LoginAsHospital from "../loginComponents/loginAsHospital/LoginAsHospital";
import LoginAsDoctor from "../loginComponents/loginAsDoctor/LoginAsDoctor";
import LoginAsServiceProvider from "../loginComponents/loginAsServiceProvider/LoginAsServiceProvider";
import LoginAsDoctorAppointment from "../loginComponents/loginAsDoctorAppointment/LoginAsDoctorAppointment";

function MainLogin() {
    const [activeTab, setActiveTab] = useState("user");

    // ✅ Get modal controls from global context
    const { closeModal } = useGlobalContext();

    const renderContent = () => {
        switch (activeTab) {
            case "user":
                return <LoginAsUser />;
            case "hospital":
                return <LoginAsHospital />;
            case "doctor":
                return <LoginAsDoctor />;
            case "provider":
                return <LoginAsServiceProvider />;
            case "appointment":
                return <LoginAsDoctorAppointment />;
            default:
                return null;
        }
    };

    return (
        <div className="login-modal-container">
            <div className="loginAsContainer">
                <span>Login As</span>

                {/* CLOSE BUTTON */}
                <span onClick={closeModal}>✖</span>
            </div>

            <div className="login-tabs">
                <button
                    className={activeTab === "user" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("user")}
                >
                    Login As User
                </button>

                <button
                    className={activeTab === "provider" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("provider")}
                >
                    Login As Service Provider
                </button>

                <button
                    className={activeTab === "hospital" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("hospital")}
                >
                    Login As Hospital
                </button>

                <button
                    className={activeTab === "doctor" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("doctor")}
                >
                    Login As Hospital Doctor
                </button>

                <button
                    className={activeTab === "appointment" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("appointment")}
                >
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