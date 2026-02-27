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
  const [isHovering, setIsHovering] = useState(false);

  const { sidebarOpen } = useGlobalContext();

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
    if (pathname.includes("/websitesetting")) setOpenMenu("websitesetting");
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

        {/* Vendors */}
        <div
          className={`menu-item dropdown ${isParentActive("/admind/vendors") ? "active" : ""}`}
          onClick={() => toggleMenu("vendors")}
        >
          <FaStore className="icon" />
          <span>Vendors</span>
          {openMenu === "vendors"
            ? <FaChevronDown className="arrow" />
            : <FaChevronRight className="arrow" />}
        </div>

        {openMenu === "vendors" && (
          <div className="submenu">
            <Link
              href="/admind/vendors/pharmacy"
              className={isActive("/admind/vendors/pharmacy") ? "sub-active" : ""}
            >
              Pharmacy Vendors
            </Link>

            <Link
              href="/admind/vendors/lab"
              className={isActive("/admind/vendors/lab") ? "sub-active" : ""}
            >
              Lab Vendors
            </Link>

            <Link
              href="/admind/vendors/nurse"
              className={isActive("/admind/vendors/nurse") ? "sub-active" : ""}
            >
              Nurse Vendors
            </Link>

            <Link
              href="/admind/vendors/doctor"
              className={isActive("/admind/vendors/doctor") ? "sub-active" : ""}
            >
              Doctor Vendors
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
            <Link
              href="/admind/websitesetting/home"
              className={isActive("/admind/websitesetting/home") ? "sub-active" : ""}
            >
              Home Page Setting
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}