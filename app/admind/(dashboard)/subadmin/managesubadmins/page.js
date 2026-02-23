"use client";

import React, { useState } from "react";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import AddNewSubadmin from "./components/AddNewSubadmin";
import EditSubadmin from "./components/EditSubadmin";
import DashboardTopNavbar from "../../components/topNavbar/DashboardTopNavbar";

const initialSubadminsData = [
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
    name: "Himanshu",
    email: "himanshu@gmail.com",
    phone: "8271928271",
    password: "1234",
    role: "Testing",
  },
  {
    id: 6,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9lRck6miglY0SZF_BZ_sK829yiNskgYRUg&s",
    name: "Mudabir",
    email: "mudabir@gmail.com",
    phone: "8271928271",
    password: "1234",
    role: "Manager",
  },
  {
    id: 7,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9lRck6miglY0SZF_BZ_sK829yiNskgYRUg&s",
    name: "Khanday",
    email: "khanday@gmail.com",
    phone: "8271928271",
    password: "1234",
    role: "Editor",
  },

  {
    id: 8,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9lRck6miglY0SZF_BZ_sK829yiNskgYRUg&s",
    name: "Himanshu",
    email: "himanshu@gmail.com",
    phone: "8271928271",
    password: "1234",
    role: "Testing",
  },
  {
    id: 9,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9lRck6miglY0SZF_BZ_sK829yiNskgYRUg&s",
    name: "Mudabir",
    email: "mudabir@gmail.com",
    phone: "8271928271",
    password: "1234",
    role: "Manager",
  },
  {
    id: 10,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9lRck6miglY0SZF_BZ_sK829yiNskgYRUg&s",
    name: "Khanday",
    email: "khanday@gmail.com",
    phone: "8271928271",
    password: "1234",
    role: "Editor",
  },
  {
    id: 11,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9lRck6miglY0SZF_BZ_sK829yiNskgYRUg&s",
    name: "Himanshu",
    email: "himanshu@gmail.com",
    phone: "8271928271",
    password: "1234",
    role: "Testing",
  },
  {
    id: 12,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9lRck6miglY0SZF_BZ_sK829yiNskgYRUg&s",
    name: "Mudabir",
    email: "mudabir@gmail.com",
    phone: "8271928271",
    password: "1234",
    role: "Manager",
  },
  {
    id: 13,
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
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [subadmins, setSubadmins] = useState(initialSubadminsData);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);

  // ✅ PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const filteredSubadmins = subadmins.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.phone.includes(search) ||
    user.role.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ PAGINATION LOGIC
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredSubadmins.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

  const totalPages = Math.ceil(filteredSubadmins.length / usersPerPage);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setOpenEdit(true);
    setOpenNew(false);
  };

  const handleDeleteClick = (user) => {
    setDeleteUser(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setSubadmins(subadmins.filter((u) => u.id !== deleteUser.id));
    setDeleteModalOpen(false);
    setDeleteUser(null);
  };

  return (
    <div className="bg-gray-100 min-h-screen relative">
      <DashboardTopNavbar heading="Manage Subadmins" />

      <div className="pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            Subadmin List
          </h2>

          <div className="flex gap-5">
            <div className="relative w-72">
              <FaSearch className="absolute top-3 left-3 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search subadmin..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <button
              className="bg-[#08B36A] hover:bg-[#08b369d6] text-white px-6 w-40 rounded-lg shadow-md transition duration-200 text-sm font-medium cursor-pointer"
              onClick={() => {
                setOpenNew(!openNew);
                setOpenEdit(false);
              }}
            >
              {openNew ? "Back" : "+ Add New"}
            </button>
          </div>
        </div>

        {openNew ? (
          <AddNewSubadmin />
        ) : openEdit ? (
          <EditSubadmin
            user={selectedUser}
            onClose={() => setOpenEdit(false)}
          />
        ) : (
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
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 font-medium text-gray-500">
                          {indexOfFirstUser + index + 1}
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
                            <button
                              className="text-blue-500 hover:text-blue-700 transition cursor-pointer"
                              onClick={() => handleEdit(user)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="text-red-500 hover:text-red-700 transition cursor-pointer"
                              onClick={() => handleDeleteClick(user)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-6 text-gray-500">
                        No subadmin found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ✅ GREEN PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 py-6">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition ${currentPage === i + 1
                        ? "bg-[#08B36A]  text-white"
                        : "bg-emerald-100 hover:bg-[#08b369d6]"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* DELETE MODAL (unchanged) */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-1000">
          <div className="bg-white w-96 rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Delete Subadmin
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                {deleteUser?.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
