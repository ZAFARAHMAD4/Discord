import React, { useEffect, useRef } from "react";
import { FiPhoneCall } from "react-icons/fi";
import { MdCallEnd } from "react-icons/md";
import tone from "../ringtone/phone-ringing-382734.mp3";

function RingingBanner({ onEnd, user }) {
  const audioRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(tone);
    audioRef.current.loop = true;

    const playTone = async () => {
      try {
        await audioRef.current.play();
      } catch (err) {
        console.warn("Autoplay blocked:", err);
      }
    };
    playTone();

    // Auto cut after 30s
    timeoutRef.current = setTimeout(() => {
      onEnd && onEnd();
    }, 30000);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      clearTimeout(timeoutRef.current);
    };
  }, [onEnd]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 z-50">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-2xl shadow-xl p-6 flex flex-col items-center animate-pulse">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-sm text-white/80">{user?.email}</p>
        </div>

        <div className="bg-white/20 p-4 rounded-full mb-3 animate-ping">
          <FiPhoneCall className="text-3xl" />
        </div>

        <span className="text-lg mb-6">Calling...</span>

        <button
          onClick={onEnd}
          className="flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-red-600 hover:bg-red-700 shadow-lg text-white font-semibold transition"
        >
          <MdCallEnd className="text-xl" />
          End
        </button>
      </div>
    </div>
  );
}

export default RingingBanner;
