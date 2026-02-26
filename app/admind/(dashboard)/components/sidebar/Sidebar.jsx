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
import { useGlobalContext } from "@/app/context/GlobalContext";

export default function Sidebar() {
    const pathname = usePathname();
    const [openMenu, setOpenMenu] = useState(null);
    const [openSubMenu, setOpenSubMenu] = useState(null); // ✅ NEW
    const [isHovering, setIsHovering] = useState(false);

    const { sidebarOpen, toggleSidebar } = useGlobalContext();

    const toggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    const toggleSubMenu = (menu) => {
        setOpenSubMenu(openSubMenu === menu ? null : menu);
    };

    useEffect(() => {
        if (pathname.includes("/subadmin")) setOpenMenu("subadmin");
        if (pathname.includes("/users")) setOpenMenu("users");
        if (pathname.includes("/vendors")) setOpenMenu("vendors");
        if (pathname.includes("/drivers")) setOpenMenu("drivers");
        if (pathname.includes("/websitesetting")) {
            setOpenMenu("websitesetting");

            if (pathname.includes("/home/")) {
                setOpenSubMenu("homepage");
            }
        }
    }, [pathname]);

    const isActive = (route) => pathname === route;
    const isParentActive = (route) => pathname.startsWith(route);

    return (
        <div
            className={`sidebar ${(sidebarOpen || isHovering) ? "open" : "collapsed"}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >

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
                    {openMenu === "subadmin"
                        ? <FaChevronDown className="arrow" />
                        : <FaChevronRight className="arrow" />}
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
                    {openMenu === "users"
                        ? <FaChevronDown className="arrow" />
                        : <FaChevronRight className="arrow" />}
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

                {/* Website Setting */}
                <div
                    className={`menu-item dropdown ${isParentActive("/admind/websitesetting") ? "active" : ""}`}
                    onClick={() => toggleMenu("websitesetting")}
                >
                    <FaUser className="icon" />
                    <span>Website Setting</span>
                    {openMenu === "websitesetting"
                        ? <FaChevronDown className="arrow" />
                        : <FaChevronRight className="arrow" />}
                </div>

                {openMenu === "websitesetting" && (
                    <div className="submenu">

                        {/* Home Page (Nested Dropdown) */}
                        <div
                            className="menu-item dropdown"
                            onClick={() => toggleSubMenu("homepage")}
                        >
                            <span>Home Page</span>
                            {openSubMenu === "homepage"
                                ? <FaChevronDown className="arrow" />
                                : <FaChevronRight className="arrow" />}
                        </div>

                        {openSubMenu === "homepage" && (
                            <div className="submenu">
                                <Link
                                    href="/admind/websitesetting/home/homepage"
                                    className={isActive("/admind/websitesetting/home/homepage") ? "sub-active" : ""}
                                >
                                    Home
                                </Link>

                                <Link
                                    href="/admind/websitesetting/home/introductionpage"
                                    className={isActive("/admind/websitesetting/home/introductionpage") ? "sub-active" : ""}
                                >
                                    Introduction
                                </Link>

                                <Link
                                    href="/admind/websitesetting/home/aboutus"
                                    className={isActive("/admind/websitesetting/home/aboutus") ? "sub-active" : ""}
                                >
                                    About Us
                                </Link>

                                <Link
                                    href="/admind/websitesetting/home/featuredproducts"
                                    className={isActive("/admind/websitesetting/home/featuredproducts") ? "sub-active" : ""}
                                >
                                    Medicine Section
                                </Link>

                                <Link
                                    href="/admind/websitesetting/home/laboratory"
                                    className={isActive("/admind/websitesetting/home/laboratory") ? "sub-active" : ""}
                                >
                                    Laboratory Section
                                </Link>

                                <Link
                                    href="/admind/websitesetting/home/doctorsteam"
                                    className={isActive("/admind/websitesetting/home/doctorsteam") ? "sub-active" : ""}
                                >
                                    Doctor's Team
                                </Link>

                                <Link
                                    href="/admind/websitesetting/home/nursing"
                                    className={isActive("/admind/websitesetting/home/nursing") ? "sub-active" : ""}
                                >
                                    Nursing Section
                                </Link>

                                <Link
                                    href="/admind/websitesetting/home/ambulance"
                                    className={isActive("/admind/websitesetting/home/ambulance") ? "sub-active" : ""}
                                >
                                    Ambulance Section
                                </Link>

                                <Link
                                    href="/admind/websitesetting/home/hospital"
                                    className={isActive("/admind/websitesetting/home/hospital") ? "sub-active" : ""}
                                >
                                    Hospital Section
                                </Link>

                                <Link
                                    href="/admind/websitesetting/home/ouraffiliates"
                                    className={isActive("/admind/websitesetting/home/ouraffiliates") ? "sub-active" : ""}
                                >
                                    Our Affiliates
                                </Link>

                                <Link
                                    href="/admind/websitesetting/home/more"
                                    className={isActive("/admind/websitesetting/home/more") ? "sub-active" : ""}
                                >
                                    More
                                </Link>
                            </div>
                        )}

                        <div
                            className="menu-item dropdown"
                            onClick={() => toggleSubMenu("labpage")}
                        >
                            <span>Lab Page</span>
                            {openSubMenu === "labpage"
                                ? <FaChevronDown className="arrow" />
                                : <FaChevronRight className="arrow" />}
                        </div>

                        {openSubMenu === "labpage" && (
                            <div className="submenu">
                                <Link
                                    href="/admind/websitesetting/lab/labpage"
                                    className={isActive("/admind/websitesetting/lab/labpage") ? "sub-active" : ""}
                                >
                                    Lab
                                </Link>

                                <Link
                                    href="/admind/websitesetting/lab/introductionpage"
                                    className={isActive("/admind/websitesetting/lab/introductionpage") ? "sub-active" : ""}
                                >
                                    Introduction
                                </Link>

                                <Link
                                    href="/admind/websitesetting/lab/more"
                                    className={isActive("/admind/websitesetting/lab/more") ? "sub-active" : ""}
                                >
                                    More
                                </Link>
                            </div>
                        )}

                    </div>
                )}

            </div>
        </div>
    );
}