"use client";

import React from "react";
import DashboardTopNavbar from "../../components/topNavbar/DashboardTopNavbar";
import styles from "./ManageSubadmins.module.css";
import { FaEdit, FaTrash } from "react-icons/fa";

const subadmins = [
  {
    id: 1,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9lRck6miglY0SZF_BZ_sK829yiNskgYRUg&s", // put image in public folder
    name: "Himanshu",
    email: "himanshu@gmail.com",
    phone: "8271928271",
    password: "1234",
    role: "testing",
  },

  {
    id: 2,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9lRck6miglY0SZF_BZ_sK829yiNskgYRUg&s", // put image in public folder
    name: "Mudabir",
    email: "mudabir@gmail.com",
    phone: "8271928271",
    password: "1234",
    role: "testing",
  },

  {
    id: 3,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9lRck6miglY0SZF_BZ_sK829yiNskgYRUg&s", // put image in public folder
    name: "Khanday",
    email: "khanday@gmail.com",
    phone: "8271928271",
    password: "1234",
    role: "testing",
  },

  {
    id: 4,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9lRck6miglY0SZF_BZ_sK829yiNskgYRUg&s", // put image in public folder
    name: "Kowsar",
    email: "kowsar@gmail.com",
    phone: "8271928271",
    password: "1234",
    role: "testing",
  },

  {
    id: 5,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9lRck6miglY0SZF_BZ_sK829yiNskgYRUg&s", // put image in public folder
    name: "Himanshu",
    email: "himanshu@gmail.com",
    phone: "8271928271",
    password: "1234",
    role: "testing",
  },
];

export default function Page() {
  return (
    <div className={styles.wrapper}>
      <DashboardTopNavbar heading="Manage Subadmins" />

      {/* TOP BUTTONS */}
      <div className={styles.topActions}>
        <button className={styles.addBtn}>ADD NEW</button>
        {/* <button className={styles.backBtn}>GO BACK</button> */}
      </div>

      {/* TABLE */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>No.</th>
              <th>Image</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Password</th>
              <th>Assigned Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {subadmins.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>
                  <img src={user.image} alt="user" className={styles.avatar} />
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.password}</td>
                <td>{user.role}</td>
                <td className={styles.actions}>
                  <FaEdit className={styles.editIcon} />
                  <FaTrash className={styles.deleteIcon} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className={styles.pagination}>
          <button>FIRST</button>
          <button>PREVIOUS</button>
          <button className={styles.active}>1</button>
          <button>NEXT</button>
          <button>LAST</button>
        </div>
      </div>
    </div>
  );
}
