"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FaTachometerAlt,
    FaMoneyBillWave,
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
    FaUserShield,
    FaTags,
    FaGift,
    FaAd,
    FaBan,
    FaUserTimes,
    FaShieldAlt,
    FaFire,
    FaClipboardList,
    FaWallet,
    FaBoxes,
    FaQuestionCircle,
    FaImages,
    FaNewspaper,
    FaUserPlus,
    FaMoneyBill,
    FaUser
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

    useEffect(() => {
        if (pathname.includes("/subadmin")) setOpenMenu("subadmin");
        if (pathname.includes("/users")) setOpenMenu("users");
        if (pathname.includes("/vendors")) setOpenMenu("vendors");
        if (pathname.includes("/manageorders")) setOpenMenu("manageorders");
        if (pathname.includes("/managepackages")) setOpenMenu("managepackages");
        if (pathname.includes("/requests")) setOpenMenu("requests");
        if (pathname.includes("/appbanners")) setOpenMenu("appbanners");
        if (pathname.includes("/articles")) setOpenMenu("articles");
        if (pathname.includes("/subscribers")) setOpenMenu("subscribers");
        if (pathname.includes("/websitesetting")) setOpenMenu("websitesetting");
        if (pathname.includes("/managemedicines")) setOpenMenu("managemedicines");
        if (pathname.includes("/manage-headquater")) setOpenMenu("manage-headquater");
        if (pathname.includes("/manage-firestation")) setOpenMenu("manage-firestation");
        if (pathname.includes("/manage-issues")) setOpenMenu("/admind/manage-issues");
        if (pathname.includes("/withdraw-request")) setOpenMenu("/admind/manage-withdraw");
        if (pathname.includes("/settings")) setOpenMenu("settings");

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
                {/* Dashboard */}
                <Link href="/admind" className={`menu-item ${isActive("/admind") ? "active" : ""}`}>
                    <FaTachometerAlt className="icon" />
                    <span>Dashboard</span>
                </Link>

                {/* Admin Earning */}
                <Link href="/admind/earning" className={`menu-item ${isActive("/admind/earning") ? "active" : ""}`}>
                    <FaMoneyBillWave className="icon" />
                    <span>Admin Earning</span>
                </Link>

                {/* Sub Admin */}
                <div className={`menu-item dropdown ${isParentActive("/admind/subadmin") ? "active" : ""}`} onClick={() => toggleMenu("subadmin")}>
                    <FaUserShield className="icon" />
                    <span>Sub Admin</span>
                    {openMenu === "subadmin" ? <FaChevronDown className="arrow rotate" /> : <FaChevronRight className="arrow" />}
                </div>
                {openMenu === "subadmin" && (
                    <div className="submenu fade-in">
                        <Link href="/admind/subadmin/managesubadmins" className={`submenu-link ${isActive("/admind/subadmin/managesubadmins") ? "sub-active" : ""}`}>Manage Subadmin</Link>
                        <Link href="/admind/subadmin/managesubadminrole" className={`submenu-link ${isActive("/admind/subadmin/managesubadminrole") ? "sub-active" : ""}`}>Manage Role</Link>
                    </div>
                )}

                {/* Users */}
                <div className={`menu-item dropdown ${isParentActive("/admind/users") ? "active" : ""}`} onClick={() => toggleMenu("users")}>
                    <FaUsers className="icon" />
                    <span>Users</span>
                    {openMenu === "users" ? <FaChevronDown className="arrow rotate" /> : <FaChevronRight className="arrow" />}
                </div>
                {openMenu === "users" && (
                    <div className="submenu fade-in">
                        <Link href="/admind/users/manageusers" className={`submenu-link ${isActive("/admind/users/manageusers") ? "sub-active" : ""}`}>Manage Users</Link>
                    </div>
                )}

                {/* Vendors */}
                <div className={`menu-item dropdown ${isParentActive("/admind/vendors") ? "active" : ""}`} onClick={() => toggleMenu("vendors")}>
                    <FaStore className="icon" />
                    <span>Vendors</span>
                    {openMenu === "vendors" ? <FaChevronDown className="arrow rotate" /> : <FaChevronRight className="arrow" />}
                </div>
                {openMenu === "vendors" && (
                    <div className="submenu fade-in">
                        <Link href="/admind/vendors/pharmacy" className={`submenu-link ${isActive("/admind/vendors/pharmacy") ? "sub-active" : ""}`}><FaPills className="sub-icon" /> Pharmacy Vendors</Link>
                        <Link href="/admind/vendors/lab" className={`submenu-link ${isActive("/admind/vendors/lab") ? "sub-active" : ""}`}><FaFlask className="sub-icon" /> Lab Vendors</Link>
                        <Link href="/admind/vendors/nurse" className={`submenu-link ${isActive("/admind/vendors/nurse") ? "sub-active" : ""}`}><FaHandHoldingHeart className="sub-icon" /> Nurse Vendors</Link>
                        <Link href="/admind/vendors/doctor" className={`submenu-link ${isActive("/admind/vendors/doctor") ? "sub-active" : ""}`}><FaUserMd className="sub-icon" /> Doctor Vendors</Link>
                    </div>
                )}

                {/* Manage Orders */}
                <div className={`menu-item dropdown ${isParentActive("/admind/manageorders") ? "active" : ""}`} onClick={() => toggleMenu("manageorders")}>
                    <FaClipboardList className="icon" />
                    <span>Manage Orders</span>
                    {openMenu === "manageorders" ? <FaChevronDown className="arrow rotate" /> : <FaChevronRight className="arrow" />}
                </div>
                {openMenu === "manageorders" && (
                    <div className="submenu fade-in">
                        <Link href="/admind/manageorders/doctor" className={`submenu-link ${isActive("/admind/manageorders/doctor") ? "sub-active" : ""}`}>Doctor Orders</Link>
                        <Link href="/admind/manageorders/ambulance" className={`submenu-link ${isActive("/admind/manageorders/ambulance") ? "sub-active" : ""}`}>Ambulance Orders</Link>
                        <Link href="/admind/manageorders/pharmacy" className={`submenu-link ${isActive("/admind/manageorders/pharmacy") ? "sub-active" : ""}`}>Pharmacy Orders</Link>
                        <Link href="/admind/manageorders/lab" className={`submenu-link ${isActive("/admind/manageorders/lab") ? "sub-active" : ""}`}>Lab Orders</Link>
                        <Link href="/admind/manageorders/hospital" className={`submenu-link ${isActive("/admind/manageorders/hospital") ? "sub-active" : ""}`}>Hospital Orders</Link>
                        <Link href="/admind/manageorders/nurse" className={`submenu-link ${isActive("/admind/manageorders/nurse") ? "sub-active" : ""}`}>Nurse Orders</Link>
                        <Link href="/admind/manageorders/free-ambulance" className={`submenu-link ${isActive("/admind/manageorders/free-ambulance") ? "sub-active" : ""}`}>Free Ambulance Orders</Link>
                    </div>
                )}

                {/* Manage Packages */}
                <div className={`menu-item dropdown ${isParentActive("/admind/managepackages") ? "active" : ""}`} onClick={() => toggleMenu("managepackages")}>
                    <FaBoxes className="icon" />
                    <span>Manage Packages</span>
                    {openMenu === "managepackages" ? <FaChevronDown className="arrow rotate" /> : <FaChevronRight className="arrow" />}
                </div>
                {openMenu === "managepackages" && (
                    <div className="submenu fade-in">
                        <Link href="/admind/managepackages/labtest" className={`submenu-link ${isActive("/admind/managepackages/labtest") ? "sub-active" : ""}`}>Lab Test</Link>
                        <Link href="/admind/managepackages/nursingservices" className={`submenu-link ${isActive("/admind/managepackages/nursingservices") ? "sub-active" : ""}`}>Nursing Services</Link>
                    </div>
                )}

                {/* Requests Issue */}
                <div className={`menu-item dropdown ${isParentActive("/admind/requests") ? "active" : ""}`} onClick={() => toggleMenu("requests")}>
                    <FaQuestionCircle className="icon" />
                    <span>Requests Issue</span>
                    {openMenu === "requests" ? <FaChevronDown className="arrow rotate" /> : <FaChevronRight className="arrow" />}
                </div>
                {openMenu === "requests" && (
                    <div className="submenu fade-in">
                        <Link href="/admind/requests/helprequest" className={`submenu-link ${isActive("/admind/requests/helprequest") ? "sub-active" : ""}`}>Help Request</Link>
                    </div>
                )}

                {/* Website Setting */}
                <div className={`menu-item dropdown ${isParentActive("/admind/websitesetting") ? "active" : ""}`} onClick={() => toggleMenu("websitesetting")}>
                    <FaCog className="icon" />
                    <span>Website Setting</span>
                    {openMenu === "websitesetting" ? <FaChevronDown className="arrow rotate" /> : <FaChevronRight className="arrow" />}
                </div>
                {openMenu === "websitesetting" && (
                    <div className="submenu fade-in">
                        <Link href="/admind/websitesetting/home" className={`submenu-link ${isActive("/admind/websitesetting/home") ? "sub-active" : ""}`}>Home Page Setting</Link>
                        <Link href="/admind/websitesetting/lab" className={`submenu-link ${isActive("/admind/websitesetting/lab") ? "sub-active" : ""}`}>Lab Page Setting</Link>
                        <Link href="/admind/websitesetting/buymedicine" className={`submenu-link ${isActive("/admind/websitesetting/buymedicine") ? "sub-active" : ""}`}>Buy Medicine Setting</Link>
                        <Link href="/admind/websitesetting/doctorscreens" className={`submenu-link ${isActive("/admind/websitesetting/doctorscreens") ? "sub-active" : ""}`}>Doctors Screen Setting</Link>
                        <Link href="/admind/websitesetting/nursing" className={`submenu-link ${isActive("/admind/websitesetting/nursing") ? "sub-active" : ""}`}>Nursing Screen Setting</Link>
                        <Link href="/admind/websitesetting/ambulancescreen" className={`submenu-link ${isActive("/admind/websitesetting/ambulancescreen") ? "sub-active" : ""}`}>Ambulance Screen Setting</Link>
                        <Link href="/admind/websitesetting/hospitalscreen" className={`submenu-link ${isActive("/admind/websitesetting/hospitalscreen") ? "sub-active" : ""}`}>Hospital Screen Setting</Link>
                    </div>
                )}

                {/* Manage Medicine */}
                <div className={`menu-item dropdown ${isParentActive("/admind/managemedicines") ? "active" : ""}`} onClick={() => toggleMenu("managemedicines")}>
                    <FaPills className="icon" />
                    <span>Manage Medicine</span>
                    {openMenu === "managemedicines" ? <FaChevronDown className="arrow rotate" /> : <FaChevronRight className="arrow" />}
                </div>
                {openMenu === "managemedicines" && (
                    <div className="submenu fade-in">
                        <Link href="/admind/managemedicines/approvedmedicines" className={`submenu-link ${isActive("/admind/managemedicines/approvedmedicines") ? "sub-active" : ""}`}>Approve Medicine</Link>
                        <Link href="/admind/managemedicines/manageallmedicines" className={`submenu-link ${isActive("/admind/managemedicines/manageallmedicines") ? "sub-active" : ""}`}>Manage All Medicines</Link>
                    </div>
                )}

                {/* Manage Drivers */}
                <Link href="/admind/managedrivers" className={`menu-item ${isActive("/admind/managedrivers") ? "active" : ""}`}>
                    <FaTruck className="icon" />
                    <span>Manage Drivers</span>
                </Link>

                {/* Manage Hospital */}
                <Link href="/admind/managehospital" className={`menu-item ${isActive("/admind/managehospital") ? "active" : ""}`}>
                    <FaHospital className="icon" />
                    <span>Manage Hospital</span>
                </Link>

                {/* App Banners */}
                <div className={`menu-item dropdown ${isParentActive("/admind/appbanners") ? "active" : ""}`} onClick={() => toggleMenu("appbanners")}>
                    <FaImages className="icon" />
                    <span>App Banners</span>
                    {openMenu === "appbanners" ? <FaChevronDown className="arrow rotate" /> : <FaChevronRight className="arrow" />}
                </div>
                {openMenu === "appbanners" && (
                    <div className="submenu fade-in">
                        <Link href="/admind/appbanners/homescreen" className={`submenu-link ${isActive("/admind/appbanners/homescreen") ? "sub-active" : ""}`}>App Home Banners</Link>
                        <Link href="/admind/appbanners/nurse" className={`submenu-link ${isActive("/admind/appbanners/nurse") ? "sub-active" : ""}`}>App Nurse Banners</Link>
                        <Link href="/admind/appbanners/medicine" className={`submenu-link ${isActive("/admind/appbanners/medicine") ? "sub-active" : ""}`}>App Medicine Banners</Link>
                    </div>
                )}

                {/* Articles */}
                <div className={`menu-item dropdown ${isParentActive("/admind/articles") ? "active" : ""}`} onClick={() => toggleMenu("articles")}>
                    <FaNewspaper className="icon" />
                    <span>Articles</span>
                    {openMenu === "articles" ? <FaChevronDown className="arrow rotate" /> : <FaChevronRight className="arrow" />}
                </div>
                {openMenu === "articles" && (
                    <div className="submenu fade-in">
                        <Link href="/admind/articles/health" className={`submenu-link ${isActive("/admind/articles/health") ? "sub-active" : ""}`}>Health Articles</Link>
                        <Link href="/admind/articles/medical" className={`submenu-link ${isActive("/admind/articles/medical") ? "sub-active" : ""}`}>Medical Articles</Link>
                    </div>
                )}

                {/* Manage Coupon */}
                <Link href="/admind/managecoupon" className={`menu-item ${isActive("/admind/managecoupon") ? "active" : ""}`}>
                    <FaTags className="icon" />
                    <span>Manage Coupon</span>
                </Link>

                {/* Vendor Offers */}
                <Link href="/admind/vendoroffers" className={`menu-item ${isActive("/admind/vendoroffers") ? "active" : ""}`}>
                    <FaGift className="icon" />
                    <span>Vendor Offers</span>
                </Link>

                {/* Manage Advertisements */}
                <Link href="/admind/manageadvertisements" className={`menu-item ${isActive("/admind/manageadvertisements") ? "active" : ""}`}>
                    <FaAd className="icon" />
                    <span>Manage Advertisements</span>
                </Link>

                {/* Manage Insurance Companies */}
                <Link href="/admind/manageinsurancecompanies" className={`menu-item ${isActive("/admind/manageinsurancecompanies") ? "active" : ""}`}>
                    <FaAd className="icon" />
                    <span>Manage Insurance Companies</span>
                </Link>

                {/* Manage Helpline */}
                <Link href="/admind/managehelpline" className={`menu-item ${isActive("/admind/managehelpline") ? "active" : ""}`}>
                    <FaAd className="icon" />
                    <span>Manage Helpline</span>
                </Link>

                {/* Manage Cancellation */}
                <Link href="/admind/manage-cancellation" className={`menu-item ${isActive("/admind/manage-cancellation") ? "active" : ""}`}>
                    <FaBan className="icon" />
                    <span>Manage Cancellation</span>
                </Link>

                {/* No Show */}
                <Link href="/admind/noshow" className={`menu-item ${isActive("/admind/noshow") ? "active" : ""}`}>
                    <FaUserTimes className="icon" />
                    <span>No Show Management</span>
                </Link>

                {/* Police Headquarter */}
                <div className={`menu-item dropdown ${isParentActive("/admind/manage-headquater") ? "active" : ""}`} onClick={() => toggleMenu("manage-headquater")}>
                    <FaShieldAlt className="icon" />
                    <span>Police Headquarter</span>
                    {openMenu === "manage-headquater" ? <FaChevronDown className="arrow rotate" /> : <FaChevronRight className="arrow" />}
                </div>
                {openMenu === "manage-headquater" && (
                    <div className="submenu fade-in">
                        <Link href="/admind/police-headquater" className={`submenu-link ${isActive("/admind/police-headquater") ? "sub-active" : ""}`}>Manage Police Headquarter</Link>
                        <Link href="/admind/police-station" className={`submenu-link ${isActive("/admind/police-station") ? "sub-active" : ""}`}>Manage Police Station</Link>
                    </div>
                )}

                {/* Fire Station */}
                <div className={`menu-item dropdown ${isParentActive("/admind/manage-firestation") ? "active" : ""}`} onClick={() => toggleMenu("manage-firestation")}>
                    <FaFire className="icon" />
                    <span>Fire Station</span>
                    {openMenu === "manage-firestation" ? <FaChevronDown className="arrow rotate" /> : <FaChevronRight className="arrow" />}
                </div>
                {openMenu === "manage-firestation" && (
                    <div className="submenu fade-in">
                        <Link href="/admind/firestation-headquater" className={`submenu-link ${isActive("/admind/firestation-headquater") ? "sub-active" : ""}`}>Fire Station Headquarter</Link>
                        <Link href="/admind/firestation" className={`submenu-link ${isActive("/admind/firestation") ? "sub-active" : ""}`}>Fire Station</Link>
                    </div>
                )}

                {/* Manage Issues */}
                <div className={`menu-item dropdown ${isParentActive("/admind/manage-issues") ? "active" : ""}`} onClick={() => toggleMenu("/admind/manage-issues")}>
                    <FaClipboardList className="icon" />
                    <span>Manage Issues</span>
                    {openMenu === "/admind/manage-issues" ? <FaChevronDown className="arrow rotate" /> : <FaChevronRight className="arrow" />}
                </div>
                {openMenu === "/admind/manage-issues" && (
                    <div className="submenu fade-in">
                        <Link href="/admind/manage-issues/issuelists" className={`submenu-link ${isActive("/admind/manage-issues/issuelists") ? "sub-active" : ""}`}>Issue Lists</Link>
                        <Link href="/admind/manage-issues/user-issues" className={`submenu-link ${isActive("/admind/manage-issues/user-issues") ? "sub-active" : ""}`}>User Issues</Link>
                    </div>
                )}

                {/* Withdraw Request */}
                <div className={`menu-item dropdown ${isParentActive("/admind/manage-withdraw") ? "active" : ""}`} onClick={() => toggleMenu("/admind/manage-withdraw")}>
                    <FaWallet className="icon" />
                    <span>Withdraw Request</span>
                    {openMenu === "/admind/manage-withdraw" ? <FaChevronDown className="arrow rotate" /> : <FaChevronRight className="arrow" />}
                </div>
                {openMenu === "/admind/manage-withdraw" && (
                    <div className="submenu fade-in">
                        <Link href="/admind/withdraw-request/vendorwithdraw" className={`submenu-link ${isActive("/admind/withdraw-request/vendorwithdraw") ? "sub-active" : ""}`}>Vendor Withdraw Request</Link>
                        <Link href="/admind/withdraw-request/hospitalwithdraw" className={`submenu-link ${isActive("/admind/withdraw-request/hospitalwithdraw") ? "sub-active" : ""}`}>Hospital Withdraw Request</Link>
                        <Link href="/admind/withdraw-request/doctorwithdraw" className={`submenu-link ${isActive("/admind/withdraw-request/doctorwithdraw") ? "sub-active" : ""}`}>Doctor Withdraw Request</Link>
                        <Link href="/admind/withdraw-request/withdrawlimit" className={`submenu-link ${isActive("/admind/withdraw-request/withdrawlimit") ? "sub-active" : ""}`}>Withdraw Limit</Link>
                    </div>
                )}

                {/* Subscribers */}
                <div className={`menu-item dropdown ${isParentActive("/admind/subscribers") ? "active" : ""}`} onClick={() => toggleMenu("subscribers")}>
                    <FaUserPlus className="icon" />
                    <span>Subscribers</span>
                    {openMenu === "subscribers" ? <FaChevronDown className="arrow rotate" /> : <FaChevronRight className="arrow" />}
                </div>
                {openMenu === "subscribers" && (
                    <div className="submenu fade-in">
                        <Link href="/admind/subscribers/addsubscribers" className={`submenu-link ${isActive("/admind/subscribers/addsubscribers") ? "sub-active" : ""}`}>Add Subscribers</Link>
                    </div>
                )}

                {/* Settings */}
                <div className={`menu-item dropdown ${isParentActive("/admind/settings") ? "active" : ""}`} onClick={() => toggleMenu("settings")}>
                    <FaCog className="icon" />
                    <span>Settings</span>
                    {openMenu === "settings" ? <FaChevronDown className="arrow rotate" /> : <FaChevronRight className="arrow" />}
                </div>
                {openMenu === "settings" && (
                    <div className="submenu fade-in">
                        <Link href="/admind/settings/managecommission" className={`submenu-link ${isActive("/admind/settings/managecommission") ? "sub-active" : ""}`}>Manage Commission</Link>
                        <Link href="/admind/settings/commissiondetails" className={`submenu-link ${isActive("/admind/settings/commissiondetails") ? "sub-active" : ""}`}>Commission Details</Link>
                        <Link href="/admind/settings/socialmedia" className={`submenu-link ${isActive("/admind/settings/socialmedia") ? "sub-active" : ""}`}>Social Media</Link>
                        <Link href="/admind/settings/maintenancemode" className={`submenu-link ${isActive("/admind/settings/maintenancemode") ? "sub-active" : ""}`}>Maintenance Mode</Link>
                        <Link href="/admind/settings/projectdetails" className={`submenu-link ${isActive("/admind/settings/projectdetails") ? "sub-active" : ""}`}>Manage Project Details</Link>
                        <Link href="/admind/settings/paymentmethod" className={`submenu-link ${isActive("/admind/settings/paymentmethod") ? "sub-active" : ""}`}>Manage Payment Method</Link>
                    </div>
                )}

                {/* Notifications */}
                <Link href="/admind/notifications" className={`menu-item ${isActive("/admind/notifications") ? "active" : ""}`}>
                    <FaBan className="icon" />
                    <span>Notifications</span>
                </Link>
            </div>
        </div>
    );
}