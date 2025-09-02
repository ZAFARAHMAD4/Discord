import React, { useEffect, useRef } from "react";
import { FiPhone, FiVideo, FiMic, FiMoreHorizontal } from "react-icons/fi";
import { IoIosArrowBack } from "react-icons/io";

import "../css/Avatar.css";

function ChatHeader({
  selectedUser,
  onBack,
  onCallVideo,
  showActions,
  onCallAudio,
  setShowActions,
}) {
  const socket = useRef(null);



  return (
    
    <div
      className="flex items-center justify-between gap-3 p-3 md:p-4 border-b bg-base-100 shadow-sm flex-wrap"
    >
      {/* Left side (Back + Avatar + Name) */}
      <div className="flex items-center gap-3 min-w-[50%]">
        <button className="cursor-pointer md:btn-sm" onClick={onBack}>
          <IoIosArrowBack size={22} />
        </button>

        <div className="avatar">
          {selectedUser?.profilePic ? (
            <img
              src={selectedUser.profilePic}
              alt={selectedUser.name}
              className="w-10 md:w-12 rounded-full"
            />
          ) : (
            <div className="avatar-initial">
              {selectedUser?.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h2 className="text-sm md:text-lg font-semibold truncate">
            {selectedUser?.name}
          </h2>
          <p className="text-xs md:text-sm text-gray-500">
            Last seen: {selectedUser?.online ? "Online now" : "2 minutes ago"}
          </p>
        </div>
      </div>

      {/* Right side (buttons) */}
      <div className="flex items-center gap-2 text-lg text-gray-600">
        {/* Desktop buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <button className="btn btn-ghost btn-xs md:btn-sm" onClick={onCallAudio}>
            <FiPhone />
          </button>
          <button className="btn btn-ghost btn-xs md:btn-sm" onClick={onCallVideo}>
            <FiVideo />
          </button>
          <button className="btn btn-ghost btn-xs md:btn-sm">
            <FiMic />
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className="sm:hidden relative">
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => setShowActions((prev) => !prev)}
          >
            <FiMoreHorizontal size={20} />
          </button>

          {showActions && (
            <div
              className="absolute right-0 top-full mt-1 flex bg-white shadow-lg rounded-lg p-1 gap-1 z-20"
            >
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => {
                  onCallAudio();
                  setShowActions(false);
                }}
              >
                <FiPhone />
              </button>
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => {
                  onCallVideo();
                  setShowActions(false);
                }}
              >
                <FiVideo />
              </button>
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => {
                  // Mic ka logic
                  setShowActions(false);
                }}
              >
                <FiMic />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;
