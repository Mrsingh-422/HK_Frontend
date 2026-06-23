"use client";

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
    FaTimes,
    FaCheckCircle,
    FaExclamationTriangle,
    FaInfoCircle,
    FaExclamationCircle
} from 'react-icons/fa';

// Helper to find or create the shared toast stacking container in the DOM
const getToastContainer = () => {
    if (typeof window === "undefined") return null;

    let container = document.getElementById("custom-toast-stack-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "custom-toast-stack-container";
        container.className = "fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none";
        document.body.appendChild(container);
    }
    return container;
};

// The React Toast Component
function ToastComponent({ message, type, duration, onClose }) {
    const [isRendered, setIsRendered] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsRendered(false);
            // Allow transition animation to finish before removing from DOM
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const typeConfigs = {
        success: {
            bgColor: "bg-emerald-50",
            borderColor: "border-emerald-200",
            textColor: "text-emerald-800",
            iconColor: "text-emerald-500",
            icon: <FaCheckCircle className="size-5" />
        },
        error: {
            bgColor: "bg-rose-50",
            borderColor: "border-rose-200",
            textColor: "text-rose-800",
            iconColor: "text-rose-500",
            icon: <FaExclamationCircle className="size-5" />
        },
        warning: {
            bgColor: "bg-amber-50",
            borderColor: "border-amber-200",
            textColor: "text-amber-800",
            iconColor: "text-amber-500",
            icon: <FaExclamationTriangle className="size-5" />
        },
        info: {
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            textColor: "text-blue-800",
            iconColor: "text-blue-500",
            icon: <FaInfoCircle className="size-5" />
        }
    };

    const config = typeConfigs[type] || typeConfigs.success;

    return (
        <div
            className={`max-w-sm w-full pointer-events-auto transition-all duration-300 ease-out transform ${isRendered ? "translate-x-0 opacity-100 scale-100" : "translate-x-10 opacity-0 scale-95"
                }`}
        >
            <div className={`flex items-start gap-3 p-4 rounded-2xl border ${config.bgColor} ${config.borderColor} bg-white shadow-xl shadow-slate-200/40 relative overflow-hidden`}>

                {/* Visual Indicator Icon */}
                <div className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>
                    {config.icon}
                </div>

                {/* Message Panel */}
                <div className="flex-1 pr-6">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                        {type}
                    </p>
                    <p className={`text-xs md:text-sm font-semibold ${config.textColor} leading-normal`}>
                        {message}
                    </p>
                </div>

                {/* Close Interaction */}
                <button
                    onClick={() => {
                        setIsRendered(false);
                        setTimeout(onClose, 300);
                    }}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Dismiss"
                >
                    <FaTimes size={12} />
                </button>

                {/* Dynamic Visual Timer Bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-black/10 w-full">
                    <div
                        className="h-full bg-black/15"
                        style={{
                            animation: `shrinkWidth ${duration}ms linear forwards`
                        }}
                    />
                </div>
            </div>

            <style jsx>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    );
}

// 3. Dynamic Execution Function (Callable anywhere)
const CostoumPopup = (message, type = "success", duration = 3000) => {
    const container = getToastContainer();
    if (!container) return;

    // Create an isolated wrapper element for this specific toast card
    const toastWrapper = document.createElement("div");
    toastWrapper.className = "w-full flex justify-end";
    container.appendChild(toastWrapper);

    const root = createRoot(toastWrapper);

    const handleCleanup = () => {
        root.unmount();
        toastWrapper.remove();

        // Remove container from document body if no active toasts remain
        if (container.childNodes.length === 0) {
            container.remove();
        }
    };

    root.render(
        <ToastComponent
            message={message}
            type={type}
            duration={duration}
            onClose={handleCleanup}
        />
    );
};

export default CostoumPopup;