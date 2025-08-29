import React, { useState } from "react";
import { FiPhone, FiVideo, FiMic, FiMicOff, FiVolume2, FiVolumeX } from "react-icons/fi";
import { MdCallEnd } from "react-icons/md";

function IncomingCall({ caller }) {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col items-center text-center relative">
        
        {/* Caller Avatar */}
        <div className="w-28 h-28 rounded-full bg-gray-200 overflow-hidden shadow-lg animate-pulse">
          <img
            src={caller?.avatar || "https://via.placeholder.com/150"}
            alt={caller?.name || "Caller"}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Caller Info */}
        <h2 className="mt-4 text-2xl font-bold text-gray-800">
          {caller?.name || "Unknown Caller"}
        </h2>
        <p className="text-gray-500 text-lg mb-4">
          {caller?.type === "video" ? "Incoming Video Call..." : "Incoming Voice Call..."}
        </p>

        {/* Call Control Toggles */}
        <div className="flex gap-5 mb-6">
          {/* Mic Button */}
          <button
            onClick={() => setMicOn(!micOn)}
            className={`w-12 h-12 rounded-full shadow-md flex items-center justify-center transition ${
              micOn ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"
            }`}
          >
            {micOn ? <FiMic size={22} /> : <FiMicOff size={22} />}
          </button>

          {/* Video Button */}
          <button
            onClick={() => setVideoOn(!videoOn)}
            className={`w-12 h-12 rounded-full shadow-md flex items-center justify-center transition ${
              videoOn ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"
            }`}
          >
            <FiVideo size={22} />
          </button>

          {/* Speaker Button */}
          <button
            onClick={() => setSpeakerOn(!speakerOn)}
            className={`w-12 h-12 rounded-full shadow-md flex items-center justify-center transition ${
              speakerOn ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {speakerOn ? <FiVolume2 size={22} /> : <FiVolumeX size={22} />}
          </button>
        </div>

        {/* Accept / Reject Buttons */}
        <div className="flex gap-12">
          {/* Reject Call */}
          <button
            className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-transform transform hover:scale-110"
            onClick={() => alert("Call Rejected")}
          >
            <MdCallEnd size={28} />
          </button>

          {/* Accept Call */}
          <button
            className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg transition-transform transform hover:scale-110"
            onClick={() => alert("Call Accepted")}
          >
            {caller?.type === "video" ? <FiVideo size={28} /> : <FiPhone size={28} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingCall;
