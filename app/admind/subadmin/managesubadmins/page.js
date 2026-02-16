"use client";

import React, { useState } from "react";
import DashboardTopNavbar from "../../components/topNavbar/DashboardTopNavbar";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import AddNewSubadmin from "./components/AddNewSubadmin";

const subadminsData = [
  {
    id: 1,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9lRck6miglY0SZF_BZ_sK829yiNskgYRUg&s",
    name: "Himanshu",
    email: "himanshu@gmail.com",
    phone: "8271928271",
    password: "1234",
    role: "Testing",
  },
  {
    id: 2,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9lRck6miglY0SZF_BZ_sK829yiNskgYRUg&s",
    name: "Mudabir",
    email: "mudabir@gmail.com",
    phone: "8271928271",
    password: "1234",
    role: "Manager",
  },
  {
    id: 3,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9lRck6miglY0SZF_BZ_sK829yiNskgYRUg&s",
    name: "Khanday",
    email: "khanday@gmail.com",
    phone: "8271928271",
    password: "1234",
    role: "Editor",
  },
  {
    id: 4,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9lRck6miglY0SZF_BZ_sK829yiNskgYRUg&s",
    name: "Khanday",
    email: "khanday@gmail.com",
    phone: "8271928271",
    password: "1234",
    role: "Editor",
  },
  {
    id: 5,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9lRck6miglY0SZF_BZ_sK829yiNskgYRUg&s",
    name: "Khanday",
    email: "khanday@gmail.com",
    phone: "8271928271",
    password: "1234",
    role: "Editor",
  },
  {
    id: 6,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9lRck6miglY0SZF_BZ_sK829yiNskgYRUg&s",
    name: "Khanday",
    email: "khanday@gmail.com",
    phone: "8271928271",
    password: "1234",
    role: "Editor",
  },
];

export default function Page() {
  const [search, setSearch] = useState("");
  const [openNew, setOpenNew] = useState(false);

  // 🔎 Filter Logic
  const filteredSubadmins = subadminsData.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.phone.includes(search) ||
    user.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      <DashboardTopNavbar heading="Manage Subadmins" />

      <div className="pt-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            Subadmin List
          </h2>

          <div className="flex gap-5">
            {/* 🔍 Search Bar */}
            <div className="mb-0 flex justify-end">
              <div className="relative w-72">
                <FaSearch className="absolute top-3 left-3 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search subadmin..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 w-40 rounded-lg shadow-md transition duration-200 text-sm font-medium cursor-pointer"
              onClick={() => { setOpenNew(!openNew) }}
            >
              {
                openNew ? "Back" : "+ Add New"
              }
            </button>
          </div>
        </div>

        {
          openNew ?
            <AddNewSubadmin />
            :
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

              <div className="overflow-x-auto">
                <table className="w-full text-sm">

                  <thead className="bg-gray-50 border-b">
                    <tr className="text-gray-600 uppercase text-xs tracking-wider">
                      <th className="px-6 py-4 text-left">S.No</th>
                      <th className="px-6 py-4 text-left">Image</th>
                      <th className="px-6 py-4 text-left">Name</th>
                      <th className="px-6 py-4 text-left">Email</th>
                      <th className="px-6 py-4 text-left">Phone</th>
                      <th className="px-6 py-4 text-left">Password</th>
                      <th className="px-6 py-4 text-left">Role</th>
                      <th className="px-6 py-4 text-left">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {filteredSubadmins.length > 0 ? (
                      filteredSubadmins.map((user, index) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50 transition duration-150"
                        >
                          <td className="px-6 py-4 font-medium text-gray-500">
                            {index + 1}
                          </td>

                          <td className="px-6 py-4">
                            <img
                              src={user.image}
                              alt="user"
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            />
                          </td>

                          <td className="px-6 py-4 font-semibold text-gray-800">
                            {user.name}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {user.email}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {user.phone}
                          </td>

                          <td className="px-6 py-4 text-gray-500">
                            ••••••
                          </td>

                          <td className="px-6 py-4">
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-600">
                              {user.role}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex gap-4 text-lg">
                              <button className="text-blue-500 hover:text-blue-700 transition cursor-pointer">
                                <FaEdit />
                              </button>
                              <button className="text-red-500 hover:text-red-700 transition cursor-pointer">
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="text-center py-6 text-gray-500"
                        >
                          No subadmin found.
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t">
                <p className="text-xs text-gray-500">
                  Showing 1 to {filteredSubadmins.length} of {subadminsData.length} entries
                </p>

                <div className="flex gap-2 text-xs">
                  <button className="px-3 py-1 rounded-md border bg-white hover:bg-gray-100">
                    Previous
                  </button>
                  <button className="px-3 py-1 rounded-md bg-emerald-500 text-white">
                    1
                  </button>
                  <button className="px-3 py-1 rounded-md border bg-white hover:bg-gray-100">
                    Next
                  </button>
                </div>
              </div>

            </div>
        }

      </div>
    </div>
  );
}