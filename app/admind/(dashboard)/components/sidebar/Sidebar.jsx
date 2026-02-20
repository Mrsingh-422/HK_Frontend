"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FaTachometerAlt,
    FaMoneyBill,
    FaUser,
    FaUsers,
    FaStore,
    FaTruck,
    FaChevronDown,
    FaChevronRight
} from "react-icons/fa";

import "./Sidebar.css";

export default function Sidebar() {
    const pathname = usePathname();
    const [openMenu, setOpenMenu] = useState(null);

    const toggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    useEffect(() => {
        if (pathname.includes("/subadmin")) setOpenMenu("subadmin");
        if (pathname.includes("/users")) setOpenMenu("users");
        if (pathname.includes("/vendors")) setOpenMenu("vendors");
        if (pathname.includes("/drivers")) setOpenMenu("drivers");
    }, [pathname]);

    const isActive = (route) => pathname === route;
    const isParentActive = (route) => pathname.startsWith(route);

    return (
        <div className="sidebar">

            {/* Logo */}
            <div className="logo-section">
                <img
                    src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1742900654_Health_Kangaroo-1_1.png"
                    alt="Logo"
                    className="logo-in-admin"
                />
            </div>

            <div className="menu">

                {/* Dashboard */}
                <Link
                    href="/admind"
                    className={`menu-item ${isActive("/admind") ? "active" : ""}`}
                >
                    <FaTachometerAlt className="icon" />
                    <span>Dashboard</span>
                </Link>

                {/* Admin Earning */}
                <Link
                    href="/admind/earning"
                    className={`menu-item ${isActive("/admind/earning") ? "active" : ""}`}
                >
                    <FaMoneyBill className="icon" />
                    <span>Admin Earning</span>
                </Link>

                {/* Sub Admin */}
                <div
                    className={`menu-item dropdown ${isParentActive("/admind/subadmin") ? "active" : ""}`}
                    onClick={() => toggleMenu("subadmin")}
                >
                    <FaUser className="icon" />
                    <span>Sub Admin</span>
                    {
                        openMenu === "subadmin"
                            ? <FaChevronDown className="arrow" />
                            : <FaChevronRight className="arrow" />
                    }
                </div>

                {openMenu === "subadmin" && (
                    <div className="submenu">
                        <Link
                            href="/admind/subadmin/managesubadmins"
                            className={isActive("/admind/subadmin/managesubadmins") ? "sub-active" : ""}
                        >
                            Manage Subadmin
                        </Link>
                        <Link
                            href="/admind/subadmin/managesubadminrole"
                            className={isActive("/admind/subadmin/managesubadminrole") ? "sub-active" : ""}
                        >
                            Manage Role
                        </Link>
                    </div>
                )}

                {/* Users */}
                <div
                    className={`menu-item dropdown ${isParentActive("/admind/users") ? "active" : ""}`}
                    onClick={() => toggleMenu("users")}
                >
                    <FaUsers className="icon" />
                    <span>Users</span>
                    {
                        openMenu === "users"
                            ? <FaChevronDown className="arrow" />
                            : <FaChevronRight className="arrow" />
                    }
                </div>

                {openMenu === "users" && (
                    <div className="submenu">
                        <Link
                            href="/admind/users/manageusers"
                            className={isActive("/admind/users/manageusers") ? "sub-active" : ""}
                        >
                            Manage Users
                        </Link>
                    </div>
                )}

                {/* Vendors */}
                <div
                    className={`menu-item dropdown ${isParentActive("/admin/vendors") ? "active" : ""}`}
                    onClick={() => toggleMenu("vendors")}
                >
                    <FaStore className="icon" />
                    <span>Vendors</span>
                    {
                        openMenu === "vendors"
                            ? <FaChevronDown className="arrow" />
                            : <FaChevronRight className="arrow" />
                    }
                </div>

                {openMenu === "vendors" && (
                    <div className="submenu">
                        <Link
                            href="/admin/vendors/pharmacy"
                            className={isActive("/admin/vendors/pharmacy") ? "sub-active" : ""}
                        >
                            Pharmacy
                        </Link>
                        <Link
                            href="/admin/vendors/lab"
                            className={isActive("/admin/vendors/lab") ? "sub-active" : ""}
                        >
                            Lab
                        </Link>
                        <Link
                            href="/admin/vendors/nurse"
                            className={isActive("/admin/vendors/nurse") ? "sub-active" : ""}
                        >
                            Nurse
                        </Link>
                    </div>
                )}

                {/* Drivers */}
                <div
                    className={`menu-item dropdown ${isParentActive("/admin/drivers") ? "active" : ""}`}
                    onClick={() => toggleMenu("drivers")}
                >
                    <FaTruck className="icon" />
                    <span>Drivers</span>
                    {
                        openMenu === "drivers"
                            ? <FaChevronDown className="arrow" />
                            : <FaChevronRight className="arrow" />
                    }
                </div>

                {openMenu === "drivers" && (
                    <div className="submenu">
                        <Link
                            href="/admin/drivers/pharmacy"
                            className={isActive("/admin/drivers/pharmacy") ? "sub-active" : ""}
                        >
                            Pharmacy Drivers
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}