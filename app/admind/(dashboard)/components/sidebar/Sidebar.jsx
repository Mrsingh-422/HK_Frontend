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
    FaChevronDown,
    FaChevronRight
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

                <Link
                    href="/admind/earning"
                    className={`menu-item ${isActive("/admind/earning") ? "active" : ""}`}
                >
                    <FaMoneyBill className="icon" />
                    <span>Admin Earning</span>
                </Link>

                <div
                    className={`menu-item dropdown ${isParentActive("/admind/subadmin") ? "active" : ""}`}
                    onClick={() => toggleMenu("subadmin")}
                >
                    <FaUser className="icon" />
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
                            Pharmacy Vendors
                        </Link>

                        <Link
                            href="/admind/vendors/lab"
                            className={`submenu-link ${isActive("/admind/vendors/lab") ? "sub-active" : ""}`}
                        >
                            Lab Vendors
                        </Link>

                        {/* <div
                            className={`submenu-item dropdown ${isParentActive("/admind/vendors/lab") ? "sub-active" : ""}`}
                            onClick={() => toggleSubMenu("lab")}
                        >
                            <span>Lab Vendors</span>
                            {openSubMenu === "lab"
                                ? <FaChevronDown className="arrow rotate" />
                                : <FaChevronRight className="arrow" />}
                        </div> */}

                        {/* {openSubMenu === "lab" && (
                            <div className="submenu nested fade-in">

                                <Link href="/admind/vendors/lab/manage" className="submenu-link">Manage Lab Vendor</Link>
                                <Link href="/admind/vendors/lab/report" className="submenu-link">Lab Test Report</Link>
                                <Link href="/admind/vendors/lab/type" className="submenu-link">Lab Test Type</Link>

                                <div
                                    className="submenu-item dropdown"
                                    onClick={() => toggleNestedMenu("labPackage")}
                                >
                                    <span>Lab Test Package</span>
                                    {openNestedMenu === "labPackage"
                                        ? <FaChevronDown className="arrow rotate" />
                                        : <FaChevronRight className="arrow" />}
                                </div>

                                {openNestedMenu === "labPackage" && (
                                    <div className="submenu nested fade-in">
                                        <Link href="/admind/vendors/lab/package/manage" className="submenu-link">Manage Lab Test Packages</Link>
                                        <Link href="/admind/vendors/lab/package/pending" className="submenu-link">Pending Package Detail</Link>
                                        <Link href="/admind/vendors/lab/package/approved" className="submenu-link">Approved Packages Detail</Link>
                                        <Link href="/admind/vendors/lab/package/rejected" className="submenu-link">Rejected Packages Detail</Link>
                                    </div>
                                )}

                                <div
                                    className="submenu-item dropdown"
                                    onClick={() => toggleNestedMenu("labTest")}
                                >
                                    <span>Manage Lab Test</span>
                                    {openNestedMenu === "labTest"
                                        ? <FaChevronDown className="arrow rotate" />
                                        : <FaChevronRight className="arrow" />}
                                </div>

                                {openNestedMenu === "labTest" && (
                                    <div className="submenu nested fade-in">
                                        <Link href="/admind/vendors/lab/test/category" className="submenu-link">Manage Lab Test Category</Link>
                                        <Link href="/admind/vendors/lab/test/subcategory" className="submenu-link">Manage Lab Test Sub Category</Link>
                                        <Link href="/admind/vendors/lab/test/pending" className="submenu-link">Pending Lab Test</Link>
                                        <Link href="/admind/vendors/lab/test/approved" className="submenu-link">Approved Lab Test</Link>
                                        <Link href="/admind/vendors/lab/test/rejected" className="submenu-link">Rejected Lab Test</Link>
                                    </div>
                                )}

                            </div>
                        )} */}

                        <Link
                            href="/admind/vendors/nurse"
                            className={`submenu-link ${isActive("/admind/vendors/nurse") ? "sub-active" : ""}`}
                        >
                            Nurse Vendors
                        </Link>

                        <Link
                            href="/admind/vendors/doctor"
                            className={`submenu-link ${isActive("/admind/vendors/doctor") ? "sub-active" : ""}`}
                        >
                            Doctor Vendors
                        </Link>

                    </div>
                )}

                <div
                    className={`menu-item dropdown ${isParentActive("/admind/websitesetting") ? "active" : ""}`}
                    onClick={() => toggleMenu("websitesetting")}
                >
                    <FaUser className="icon" />
                    <span>Website Setting</span>
                    {openMenu === "websitesetting"
                        ? <FaChevronDown className="arrow rotate" />
                        : <FaChevronRight className="arrow" />}
                </div>

                {openMenu === "websitesetting" && (
                    <div className="submenu fade-in">
                        <Link
                            href="/admind/websitesetting/home"
                            className={`submenu-link ${isActive("/admind/websitesetting/home") ? "sub-active" : ""}`}
                        >
                            Home Page Setting
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}