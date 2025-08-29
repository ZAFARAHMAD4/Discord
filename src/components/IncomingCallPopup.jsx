import React, { useEffect, useRef } from "react";
import { FiPhoneIncoming, FiX } from "react-icons/fi";
import ringtone from "../ringtone/mixkit-marimba-ringtone-1359.wav";

function IncomingCallPopup({ incomingCall, onAccept, onReject }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (incomingCall) {
      audioRef.current = new Audio(ringtone);
      audioRef.current.loop = true;

      const playAudio = async () => {
        try {
          await audioRef.current.play();
        } catch (err) {
          console.warn("Autoplay blocked. Will start after user interaction:", err);
        }
      };

      playAudio();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [incomingCall]);

  const handleAccept = () => {
    if (audioRef.current) audioRef.current.pause();
    // ✅ parent ko signal bhejo ki call accept ho gaya
    onAccept(incomingCall);
  };

  const handleReject = () => {
    if (audioRef.current) audioRef.current.pause();
    // ✅ parent ko signal bhejo ki call reject ho gaya
    onReject(incomingCall);
  };

  if (!incomingCall) return null; // agar call na ho to popup na dikhe

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fadeIn">
        {/* Caller Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-4xl font-bold shadow-inner">
              {incomingCall?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping"></span>
          </div>

          {/* Caller Info */}
          <h2 className="text-xl font-semibold text-gray-800">
            {incomingCall?.name || "Unknown User"}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {incomingCall?.from || "Incoming call…"}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-6">
          <button
            className="flex cursor-pointer items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition"
            onClick={handleAccept}
          >
            <FiPhoneIncoming className="text-2xl" />
          </button>
          <button
            className="flex cursor-pointer items-center justify-center w-14 h-14 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition"
            onClick={handleReject}
          >
            <FiX className="text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingCallPopup;
