import React, { useEffect, useRef } from "react";
import { FiPhoneCall } from "react-icons/fi";
import tone from "../ringtone/phone-ringing-382734.mp3"; // ✅ import your tone

function RingingBanner() {
  const audioRef = useRef(null);

  useEffect(() => {
    // When banner mounts, start playing tone
    audioRef.current = new Audio(tone);
    audioRef.current.loop = true;

    const playTone = async () => {
      try {
        await audioRef.current.play();
      } catch (err) {
        console.warn("Autoplay blocked. Will play after user interaction:", err);
      }
    };

    playTone();

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-2xl shadow-lg animate-pulse">
        <div className="bg-white/20 p-2 rounded-full animate-ping">
          <FiPhoneCall className="text-xl" />
        </div>
        <span className="flex items-center">
          Calling
          <span className="animate-bounce ml-1">.</span>
          <span className="animate-bounce ml-1 delay-200">.</span>
          <span className="animate-bounce ml-1 delay-400">.</span>
        </span>
      </div>
    </div>
  );
}

export default RingingBanner;
