import React from "react";
import { FaEdit } from "react-icons/fa";
import '../css/Avatar.css'
function Sidebar({ users, selectedUser, setSelectedUser, currentUser }) {
  // Function to get initials from name
  const getInitials = (name = "") => {
    return name
      .split(" ") // naam ko words me todho
      .map((n) => n[0]?.toUpperCase()) // har word ka pehla letter
      .join(""); // join karke return
  };

  return (
    <>
      {/* Current User Header */}
      <div className="p-4 border-b flex items-center justify-between bg-primary text-primary-content">
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="bg-neutral-focus text-neutral-content w-12 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold avatar-placeholder">
                {getInitials(currentUser.name || currentUser.email)}
              </span>
            </div>
            <div className="edit cursor-pointer"> <FaEdit /> </div>
          </div>
          <div className="name font-medium">{currentUser.name}</div>
          <div className="edit text-sm cursor-pointer ml-2">
            <FaEdit />
          </div>
        </div>
        <span className="badge badge-accent">{users.length}</span>
      </div>

      {/* Users List */}
      <ul className="menu p-2 w-full overflow-y-auto custom-scrollbar">
        {users.length > 0 ? (
          users.map((user, index) => (
            <li
              key={index}
              className={`rounded-lg cursor-pointer transition-all hover:bg-primary hover:text-white shadow-sm mb-1 ${
                selectedUser?.email === user.email ? "bg-primary text-white" : ""
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="flex items-center gap-3 p-2">
                <div
                  className={`avatar placeholder ${
                    user.online ? "online" : "offline"
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
                    className={`badge badge-xs mt-1 ${
                      user.online ? "badge-success" : "badge-ghost"
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
    </>
  );
}

export default Sidebar;
