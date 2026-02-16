"use client";

import { useEffect } from "react";
import { useGlobalContext } from "@/app/context/GlobalContext";
import MainLogin from "./loginComponents/MainLogin";
import MainLoginPolice from "./policeAndFireLogin/MainLoginPolice";
import MainRegister from "./registerComponents/MainRegister";

export default function GlobalModal() {
    const { modalType, closeModal } = useGlobalContext();

    // ✅ Prevent background scroll when modal opens
    useEffect(() => {
        if (modalType) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [modalType]);

    if (!modalType) return null;

    return (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center">

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeModal}
            />

            {/* Modal Content */}
            <div className="relative z-10 w-[80%] max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-y-auto p-6 animate-[fadeIn_0.2s_ease-in-out]">

                {modalType === "login" && <MainLogin />}
                {modalType === "register" && <MainRegister />}
                {modalType === "policeandfire" && <MainLoginPolice />}

            </div>
        </div>
    );
}