"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FaTachometerAlt,
    FaMoneyBillWave,
    FaUserCog,
    FaUsers,
    FaStore,
    FaChevronDown,
    FaChevronRight,
    FaCog,
    FaPills,
    FaTruck,
    FaHospital,
    FaFlask,
    FaUserMd,
    FaHandHoldingHeart,
    FaBuilding,
    FaUserShield,
    FaUserTag,
    FaTags, FaGift, FaAd
} from "react-icons/fa";

import "./Sidebar.css";
import { useGlobalContext } from "@/app/context/GlobalContext";

export default function Sidebar() {
    const pathname = usePathname();
    const [openMenu, setOpenMenu] = useState(null);
    const [openSubMenu, setOpenSubMenu] = useState(null);
    const [openNestedMenu, setOpenNestedMenu] = useState(null);
    const [isHovering, setIsHovering] = useState(false);

    const { sidebarOpen } = useGlobalContext();

    const toggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
        setOpenSubMenu(null);
        setOpenNestedMenu(null);
    };

    const toggleSubMenu = (menu) => {
        setOpenSubMenu(openSubMenu === menu ? null : menu);
        setOpenNestedMenu(null);
    };

    const toggleNestedMenu = (menu) => {
        setOpenNestedMenu(openNestedMenu === menu ? null : menu);
    };

    useEffect(() => {
        if (pathname.includes("/subadmin")) setOpenMenu("subadmin");
        if (pathname.includes("/users")) setOpenMenu("users");
        if (pathname.includes("/vendors")) setOpenMenu("vendors");
        if (pathname.includes("/websitesetting")) setOpenMenu("websitesetting");
        if (pathname.includes("/vendors/lab")) {
            setOpenMenu("vendors");
            setOpenSubMenu("lab");
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
            <div className="logo-section">
                <img
                    src="https://healthvideos12-new1.s3.us-west-2.amazonaws.com/1742900654_Health_Kangaroo-1_1.png"
                    alt="Logo"
                    className="logo-in-admin"
                />
            </div>

            <div className="menu">

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
                    <FaMoneyBillWave className="icon" />
                    <span>Admin Earning</span>
                </Link>

                {/* Manage Subadmin */}
                <div
                    className={`menu-item dropdown ${isParentActive("/admind/subadmin") ? "active" : ""}`}
                    onClick={() => toggleMenu("subadmin")}
                >
                    <FaUserShield className="icon" />
                    <span>Sub Admin</span>
                    {openMenu === "subadmin"
                        ? <FaChevronDown className="arrow rotate" />
                        : <FaChevronRight className="arrow" />}
                </div>

                {openMenu === "subadmin" && (
                    <div className="submenu fade-in">
                        <Link
                            href="/admind/subadmin/managesubadmins"
                            className={`submenu-link ${isActive("/admind/subadmin/managesubadmins") ? "sub-active" : ""}`}
                        >
                            Manage Subadmin
                        </Link>
                        <Link
                            href="/admind/subadmin/managesubadminrole"
                            className={`submenu-link ${isActive("/admind/subadmin/managesubadminrole") ? "sub-active" : ""}`}
                        >
                            Manage Role
                        </Link>
                    </div>
                )}

                {/* Manage Users  */}
                <div
                    className={`menu-item dropdown ${isParentActive("/admind/users") ? "active" : ""}`}
                    onClick={() => toggleMenu("users")}
                >
                    <FaUsers className="icon" />
                    <span>Users</span>
                    {openMenu === "users"
                        ? <FaChevronDown className="arrow rotate" />
                        : <FaChevronRight className="arrow" />}
                </div>

                {openMenu === "users" && (
                    <div className="submenu fade-in">
                        <Link
                            href="/admind/users/manageusers"
                            className={`submenu-link ${isActive("/admind/users/manageusers") ? "sub-active" : ""}`}
                        >
                            Manage Users
                        </Link>
                    </div>
                )}

                {/* Manage Vendors  */}

                <div
                    className={`menu-item dropdown ${isParentActive("/admind/vendors") ? "active" : ""}`}
                    onClick={() => toggleMenu("vendors")}
                >
                    <FaStore className="icon" />
                    <span>Vendors</span>
                    {openMenu === "vendors"
                        ? <FaChevronDown className="arrow rotate" />
                        : <FaChevronRight className="arrow" />}
                </div>

                {openMenu === "vendors" && (
                    <div className="submenu fade-in">

                        <Link
                            href="/admind/vendors/pharmacy"
                            className={`submenu-link ${isActive("/admind/vendors/pharmacy") ? "sub-active" : ""}`}
                        >
                            <FaPills className="sub-icon" /> Pharmacy Vendors
                        </Link>

                        <Link
                            href="/admind/vendors/lab"
                            className={`submenu-link ${isActive("/admind/vendors/lab") ? "sub-active" : ""}`}
                        >
                            <FaFlask className="sub-icon" /> Lab Vendors
                        </Link>

                        <Link
                            href="/admind/vendors/nurse"
                            className={`submenu-link ${isActive("/admind/vendors/nurse") ? "sub-active" : ""}`}
                        >
                            <FaHandHoldingHeart className="sub-icon" /> Nurse Vendors
                        </Link>

                        <Link
                            href="/admind/vendors/doctor"
                            className={`submenu-link ${isActive("/admind/vendors/doctor") ? "sub-active" : ""}`}
                        >
                            <FaUserMd className="sub-icon" /> Doctor Vendors
                        </Link>

                    </div>
                )}

                {/* Manage website Setting */}
                <div
                    className={`menu-item dropdown ${isParentActive("/admind/websitesetting") ? "active" : ""}`}
                    onClick={() => toggleMenu("websitesetting")}
                >
                    <FaCog className="icon" />
                    <span>Website Setting</span>
                    {openMenu === "websitesetting"
                        ? <FaChevronDown className="arrow rotate" />
                        : <FaChevronRight className="arrow" />}
                </div>

                {openMenu === "websitesetting" && (
                    <>
                        <div className="submenu fade-in">
                            <Link
                                href="/admind/websitesetting/home"
                                className={`submenu-link ${isActive("/admind/websitesetting/home") ? "sub-active" : ""}`}
                            > Home Page Setting
                            </Link>
                        </div>

                        <div className="submenu fade-in">
                            <Link
                                href="/admind/websitesetting/lab"
                                className={`submenu-link ${isActive("/admind/websitesetting/lab") ? "sub-active" : ""}`}
                            > Lab Page Setting
                            </Link>
                        </div>

                        <div className="submenu fade-in">
                            <Link
                                href="/admind/websitesetting/buymedicine"
                                className={`submenu-link ${isActive("/admind/websitesetting/buymedicine") ? "sub-active" : ""}`}
                            > Buy Medicine Setting
                            </Link>
                        </div>

                        <div className="submenu fade-in">
                            <Link
                                href="/admind/websitesetting/doctorscreens"
                                className={`submenu-link ${isActive("/admind/websitesetting/doctorscreens") ? "sub-active" : ""}`}
                            > Doctors Screen Setting
                            </Link>
                        </div>

                        <div className="submenu fade-in">
                            <Link
                                href="/admind/websitesetting/nursing"
                                className={`submenu-link ${isActive("/admind/websitesetting/nursing") ? "sub-active" : ""}`}
                            > Nursing Screen Setting
                            </Link>
                        </div>

                        <div className="submenu fade-in">
                            <Link
                                href="/admind/websitesetting/ambulancescreen"
                                className={`submenu-link ${isActive("/admind/websitesetting/ambulancescreen") ? "sub-active" : ""}`}
                            > Ambulance Screen Setting
                            </Link>
                        </div>

                        <div className="submenu fade-in">
                            <Link
                                href="/admind/websitesetting/hospitalscreen"
                                className={`submenu-link ${isActive("/admind/websitesetting/hospitalscreen") ? "sub-active" : ""}`}
                            > Hospital Screen Setting
                            </Link>
                        </div>
                    </>
                )}

                {/* Manage Medicines */}
                <div
                    className={`menu-item dropdown ${isParentActive("/admind/managemedicines") ? "active" : ""}`}
                    onClick={() => toggleMenu("managemedicines")}
                >
                    <FaPills className="icon" />
                    <span>Manage Medicine</span>
                    {openMenu === "managemedicines"
                        ? <FaChevronDown className="arrow rotate" />
                        : <FaChevronRight className="arrow" />}
                </div>

                {openMenu === "managemedicines" && (
                    <>
                        <div className="submenu fade-in">
                            <Link
                                href="/admind/managemedicines/approvedmedicines"
                                className={`submenu-link ${isActive("/admind/managemedicines/approvedmedicines") ? "sub-active" : ""}`}
                            >
                                Approve Medicine
                            </Link>
                        </div>

                        <div className="submenu fade-in">
                            <Link
                                href="/admind/managemedicines/manageallmedicines"
                                className={`submenu-link ${isActive("/admind/managemedicines/manageallmedicines") ? "sub-active" : ""}`}
                            >
                                Manage All Medicines
                            </Link>
                        </div>
                    </>
                )}

                {/* Manage Drivers */}
                <Link
                    href="/admind/managedrivers"
                    className={`menu-item ${isActive("/admind/managedrivers") ? "active" : ""}`}
                >
                    <FaTruck className="icon" />
                    <span>Manage Drivers</span>
                </Link>

                {/* Manage Hospital */}
                <Link
                    href="/admind/managehospital"
                    className={`menu-item ${isActive("/admind/managehospital") ? "active" : ""}`}
                >
                    <FaHospital className="icon" />
                    <span>Manage Hospital</span>
                </Link>

                {/* Manage Coupon */}
                <Link
                    href="/admind/managecoupon"
                    className={`menu-item ${isActive("/admind/managecoupon") ? "active" : ""}`}
                >
                    <FaTags className="icon" />
                    <span>Manage Coupon</span>
                </Link>

                {/* Vendor Offers */}
                <Link
                    href="/admind/vendoroffers"
                    className={`menu-item ${isActive("/admind/vendoroffers") ? "active" : ""}`}
                >
                    <FaGift className="icon" />
                    <span>Vendor Offers</span>
                </Link>

                {/* Manage Advertisements */}
                <Link
                    href="/admind/manageadvertisements"
                    className={`menu-item ${isActive("/admind/manageadvertisements") ? "active" : ""}`}
                >
                    <FaAd className="icon" />
                    <span>Manage Advertisements</span>
                </Link>

                {/* Manage Insurance Companies */}
                <Link
                    href="/admind/manageinsurancecompanies"
                    className={`menu-item ${isActive("/admind/manageinsurancecompanies") ? "active" : ""}`}
                >
                    <FaAd className="icon" />
                    <span>Manage Insurance Companies</span>
                </Link>

                {/* Manage Helpline */}
                <Link
                    href="/admind/managehelpline"
                    className={`menu-item ${isActive("/admind/managehelpline") ? "active" : ""}`}
                >
                    <FaAd className="icon" />
                    <span>Manage Helpline</span>
                </Link>


            </div>
        </div>
    );
}