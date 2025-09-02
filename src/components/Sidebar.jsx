import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import "../css/Avatar.css";
import { Navigate, useNavigate } from "react-router";

import { IoIosSave } from "react-icons/io";
import { FiLogOut } from "react-icons/fi"
function Sidebar({ users, selectedUser, setSelectedUser, currentUser }) {
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("");
  };

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
    });
  }, [selectedUser]);
  const navigate = useNavigate();


  return (
    <>
      {/* Current User Header */}
      <div
        className="p-4 border-b flex items-center justify-between bg-primary text-primary-content"
        data-aos="zoom-in-up"
      >
        <div className="flex items-center gap-3">
          <div className="avatar placeholder relative">
            <div className="bg-neutral-focus text-neutral-content w-12 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold avatar-placeholder">
                {getInitials(currentUser.name || currentUser.email)}
              </span>
            </div>
            <div
              className="edit cursor-pointer absolute -bottom-1 -right-1 bg-white text-primary rounded-full p-1 shadow"
              onClick={() => setIsOffcanvasOpen(true)}
            >
              <FaEdit size={14} />
            </div>
          </div>
          <div className="name font-medium">{currentUser.name}</div>
        </div>
        <span className="badge badge-accent">{users.length}</span>
      </div>

      {/* Users List */}
      <ul className="menu p-2 w-full overflow-y-auto custom-scrollbar">
        {users.length > 0 ? (
          users.map((user, index) => (
            <li
              key={index}
              data-aos="fade-left"
              data-aos-delay={index * 100}
              className={`rounded-lg cursor-pointer transition-all hover:bg-primary hover:text-white shadow-sm mb-1 ${selectedUser?.email === user.email ? "bg-primary text-white" : ""
                }`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="flex items-center gap-3 p-2">
                <div
                  className={`avatar placeholder ${user.online ? "online" : "offline"
                    }`}
                >
                  <div className="bg-neutral-focus text-neutral-content w-12 rounded-full flex items-center justify-center">
                    <span className="text-md font-semibold avatar-placeholder">
                      {getInitials(user.name || user.email)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="font-medium text-sm truncate max-w-[120px]">
                    {user.name || user.email}
                  </p>
                  <span
                    className={`badge badge-xs mt-1 ${user.online ? "badge-success" : "badge-ghost"
                      }`}
                  >
                    {user.online ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </li>
          ))
        ) : (
          <div className="p-4 flex justify-center">
            <span className="loading loading-dots loading-sm"></span>
          </div>
        )}
      </ul>

      {/* Offcanvas (Profile Edit Drawer) */}
      {isOffcanvasOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Background Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOffcanvasOpen(false)}
          ></div>

          {/* Drawer */}
          <div className="relative w-80 bg-white h-full shadow-lg z-50 p-6 animate-slideInRight">
            <button
              className="absolute top-3 right-3 btn btn-sm btn-circle"
              onClick={() => setIsOffcanvasOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

            {/* Example Form */}
            <form className="flex flex-col gap-3 w-100">
              <input
                type="text"
                placeholder="Name"
                defaultValue={currentUser.name}
                className="input input-bordered w-70"
              />
              <input
                type="email"
                placeholder="Email"
                defaultValue={currentUser.email}
                className="input input-bordered w-70"
              />
              <button className="btn btn-primary w-70 mt-3">
                Save Changes  <IoIosSave />
              </button>
              <button
                type="button"
                className="btn btn-primary w-70 mt-3"
                onClick={() => {
                  localStorage.removeItem("currentUser"); // storage se user hatao
                  navigate("/"); // login page pe bhejo
                }}
              >
                Logout <FiLogOut />
              </button>

            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
