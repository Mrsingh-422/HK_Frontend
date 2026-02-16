
"use client";
import React, { useState } from "react";
import "./MainRegister.css";
import UserRegister from "./userRegister/UserRegister";
import RegisterAsDoctorAppointment from "./regesterAsDoctorAppointment/RegisterAsDoctorAppointment";
import RegisterAsServiceProvider from "./registerAsServiceProvider/RegisterAsServiceProvider";
import RegisterAsHospital from "./registerAsHospital/RegisterAsHospital";
import { useGlobalContext } from "@/app/context/GlobalContext";

function MainRegister() {
    const [activeTab, setActiveTab] = useState("user");

    const { closeModal, openModel } = useGlobalContext()

    const renderContent = () => {
        switch (activeTab) {
            case "user":
                return <UserRegister />;
            case "hospital":
                return <RegisterAsHospital />;
            case "provider":
                return <RegisterAsServiceProvider />;
            case "appointment":
                return <RegisterAsDoctorAppointment />;
            default: return null;
        }
    };

    return (
        <div className="login-modal-container">
            <div className="loginAsContainer">
                <span>Registration Option</span>

                {/* CLOSE BUTTON */}
                <span onClick={closeModal}>✖</span>
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

            </div>

            <div className="login-body">
                {renderContent()}
            </div>
        </div>
    );
}

export default MainRegister;
