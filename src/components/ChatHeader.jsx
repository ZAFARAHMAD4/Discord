import React from "react";
import { FiPhone, FiVideo, FiMic, FiMoreHorizontal } from "react-icons/fi";
import { IoIosArrowBack } from "react-icons/io";
import '../css/ChatHeader.css'

function ChatHeader({ selectedUser, onBack, onCallVideo, showActions, onCallAudio,setShowActions }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 md:p-4 border-b bg-base-100 shadow-sm flex-wrap">
      <div className="flex items-center gap-3 min-w-[50%]">
        <button className="cursor-pointer md:btn-sm" onClick={onBack}>
          <IoIosArrowBack />
        </button>
        <div className="avatar">
          <div className="w-10 md:w-12 rounded-full">
            <img
              src={selectedUser.profilePic || "https://i.pravatar.cc/150?img=5"}
              alt={selectedUser.name}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <h2 className="text-sm md:text-lg font-semibold truncate">
            {selectedUser.name}
          </h2>
          <p className="text-xs md:text-sm text-gray-500">
            Last seen: {selectedUser.online ? "Online now" : "2 minutes ago"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-lg text-gray-600">
        <div className="hidden sm:flex items-center gap-2">
          <button
            className="btn btn-ghost btn-xs md:btn-sm"
            onClick={onCallAudio}  // 👈 added
          >
            <FiPhone />
          </button>

          <button className="btn btn-ghost btn-xs md:btn-sm" onClick={onCallVideo}>
            <FiVideo />
          </button>
          <button className="btn btn-ghost btn-xs md:btn-sm">
            <FiMic />
          </button>
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden relative">
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => setShowActions(!showActions)}
          >
            <FiMoreHorizontal />
          </button>
          {showActions && (
            <div className="absolute left-0 top-full mt-1 flex bg-white shadow-lg rounded-lg p-1 gap-1 z-10">
              <button
                className="btn btn-ghost btn-xs md:btn-sm"
                onClick={onCallAudio}   // 🔥 yahan add karna hai
              >
                <FiPhone />
              </button>
              <button className="btn btn-ghost btn-xs" onClick={onCallVideo}>
                <FiVideo />
              </button>
              <button className="btn btn-ghost btn-xs">
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