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
    FaChevronRight,
    FaBars
} from "react-icons/fa";

import "./Sidebar.css";

export default function Sidebar() {
    const pathname = usePathname();
    const [openMenu, setOpenMenu] = useState(null);
    const [collapsed, setCollapsed] = useState(false);

    const toggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
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
        <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

            {/* Toggle Button */}
            <div className="toggle-btn" onClick={toggleSidebar}>
                <FaBars />
            </div>

            {/* Logo */}
            <div className="logo-section">
                {!collapsed && (
                    <img
                        src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1742900654_Health_Kangaroo-1_1.png"
                        alt="Logo"
                        className="logo-in-admin"
                    />
                )}
            </div>

            <div className="menu">

                {/* Dashboard */}
                <Link
                    href="/admin"
                    className={`menu-item ${isActive("/admin") ? "active" : ""}`}
                >
                    <FaTachometerAlt className="icon" />
                    {!collapsed && <span>Dashboard</span>}
                </Link>

                {/* Admin Earning */}
                <Link
                    href="/admin/earning"
                    className={`menu-item ${isActive("/admin/earning") ? "active" : ""}`}
                >
                    <FaMoneyBill className="icon" />
                    {!collapsed && <span>Admin Earning</span>}
                </Link>

                {/* Sub Admin */}
                <div
                    className={`menu-item dropdown ${isParentActive("/admin/subadmin") ? "active" : ""}`}
                    onClick={() => toggleMenu("subadmin")}
                >
                    <FaUser className="icon" />
                    {!collapsed && <span>Sub Admin</span>}
                    {!collapsed && (
                        openMenu === "subadmin"
                            ? <FaChevronDown className="arrow" />
                            : <FaChevronRight className="arrow" />
                    )}
                </div>

                {openMenu === "subadmin" && !collapsed && (
                    <div className="submenu">
                        <Link
                            href="/admin/subadmin/managesubadmins"
                            className={isActive("/admin/subadmin/managesubadmins") ? "sub-active" : ""}
                        >
                            Manage Subadmin
                        </Link>
                        <Link
                            href="/admin/subadmin/managesubadminrole"
                            className={isActive("/admin/subadmin/managesubadminrole") ? "sub-active" : ""}
                        >
                            Manage Role
                        </Link>
                    </div>
                )}

                {/* Users */}
                <div
                    className={`menu-item dropdown ${isParentActive("/admin/users") ? "active" : ""}`}
                    onClick={() => toggleMenu("users")}
                >
                    <FaUsers className="icon" />
                    {!collapsed && <span>Users</span>}
                    {!collapsed && (
                        openMenu === "users"
                            ? <FaChevronDown className="arrow" />
                            : <FaChevronRight className="arrow" />
                    )}
                </div>

                {openMenu === "users" && !collapsed && (
                    <div className="submenu">
                        <Link
                            href="/admin/users/manage"
                            className={isActive("/admin/users/manage") ? "sub-active" : ""}
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
                    {!collapsed && <span>Vendors</span>}
                    {!collapsed && (
                        openMenu === "vendors"
                            ? <FaChevronDown className="arrow" />
                            : <FaChevronRight className="arrow" />
                    )}
                </div>

                {openMenu === "vendors" && !collapsed && (
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
                    {!collapsed && <span>Drivers</span>}
                    {!collapsed && (
                        openMenu === "drivers"
                            ? <FaChevronDown className="arrow" />
                            : <FaChevronRight className="arrow" />
                    )}
                </div>

                {openMenu === "drivers" && !collapsed && (
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