"use client";
import React, { useState } from "react";
import { FaEye } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { IoChevronDown } from "react-icons/io5";
import DashboardTopNavbar from "../../components/topNavbar/DashboardTopNavbar";
import { useRouter } from "next/navigation";

export default function Page() {
    const router = useRouter();

    const [users, setUsers] = useState([
        { id: 1, name: "abc", email: "abc@gmail.com", number: "2308202130", active: false },
        { id: 2, name: "abc", email: "abc2@gmail.com", number: "9876123450", active: false },
        { id: 3, name: "", email: "user3@gmail.com", number: "0909090909", active: false },
        { id: 4, name: "", email: "user4@gmail.com", number: "7876742489", active: false },
        { id: 5, name: "", email: "user5@gmail.com", number: "7412589630", active: false },
        { id: 6, name: "Hardeep", email: "hs2681966@gmail.com", number: "9306160236", active: true },
        { id: 7, name: "Nitish", email: "nitishuser@yopmail.com", number: "8219353441", active: true },
        { id: 8, name: "", email: "user8@gmail.com", number: "9872826836", active: true },
    ]);

    const toggleStatus = (id) => {
        setUsers((prev) =>
            prev.map((user) =>
                user.id === id ? { ...user, active: !user.active } : user
            )
        );
    };

    const handleView = (user) => {
        const encodedUser = encodeURIComponent(JSON.stringify(user));
        router.push(`/admind/users/ViewUserDetail?data=${encodedUser}`);
    };

    return (
        <>
            <DashboardTopNavbar heading="Manage Users" />

            <div className="bg-gray-100 min-h-screen">

                <div className="bg-white shadow rounded-xl overflow-hidden">
                    <div className="flex justify-between p-4 text-sm text-gray-600">
                        <div>
                            Show <span className="font-semibold">10</span> entries
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Search records"
                                className="border-b outline-none px-2 py-1"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr className="text-left">
                                    <th className="px-4 py-3">S No.</th>
                                    <th className="px-4 py-3">Username</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Number</th>
                                    <th className="px-4 py-3">Image</th>
                                    <th className="px-4 py-3">Active Status</th>
                                    <th className="px-4 py-3">My Orders</th>
                                    <th className="px-4 py-3">Join Date</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {users.map((user, index) => (
                                    <tr
                                        key={user.id}
                                        className="border-t hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-3">{index + 1}</td>
                                        <td className="px-4 py-3">{user.name || "—"}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-3">{user.number}</td>

                                        <td className="px-4 py-3">
                                            <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                                                📷
                                            </div>
                                        </td>

                                        <td className="px-5 py-2">
                                            <div
                                                onClick={() => toggleStatus(user.id)}
                                                className={`w-9 h-5 flex items-center rounded-full p-1 cursor-pointer transition ${user.active
                                                    ? "bg-green-500"
                                                    : "bg-red-500"
                                                    }`}
                                            >
                                                <div
                                                    className={`bg-white w-3 h-3 rounded-full shadow-md transform transition ${user.active
                                                        ? "translate-x-4"
                                                        : ""
                                                        }`}
                                                />
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="relative inline-block">
                                                <select className="border rounded px-3 py-1 text-sm appearance-none pr-8">
                                                    <option>---View Orders---</option>
                                                    <option>Pharmacy</option>
                                                    <option>Lab</option>
                                                    <option>Nurse</option>
                                                    <option>Doctor</option>
                                                    <option>Hospital Booking</option>
                                                    <option>Ambulance Booking</option>
                                                </select>
                                                <IoChevronDown className="absolute right-2 top-2 text-gray-500 pointer-events-none" />
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            2025-03-06 <br />
                                            14:34:37
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <FaEye
                                                onClick={() => handleView(user)}
                                                className="text-orange-500 cursor-pointer text-2xl hover:scale-110 transition"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
