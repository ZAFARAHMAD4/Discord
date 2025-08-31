import React, { useEffect, useState } from "react";
import { FiPhone, FiMic, FiMicOff, FiVolume2, FiVolumeX } from "react-icons/fi";
import { IoMdPerson } from "react-icons/io";
import { motion } from "framer-motion";

function AudioCallScreen({ callerName, onEndCall, onMute, muted, remoteAudioRef }) {
  const [callDuration, setCallDuration] = useState(0);
  const [speakerOn, setSpeakerOn] = useState(false);

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Remote audio autoplay
  useEffect(() => {
    if (remoteAudioRef?.current) {
      remoteAudioRef.current.autoplay = true;
      remoteAudioRef.current.playsInline = true;
    }
  }, [remoteAudioRef]);

  // Speaker toggle
  const toggleSpeaker = async () => {
    if (remoteAudioRef?.current) {
      try {
        if (speakerOn) {
          // 🔇 Reset to default output
          await remoteAudioRef.current.setSinkId("default");
        } else {
          // 🔊 Force to speaker (works in supported browsers/devices)
          await remoteAudioRef.current.setSinkId("speaker");
        }
        setSpeakerOn(!speakerOn);
      } catch (err) {
        console.warn("Speaker toggle not supported on this device/browser:", err);
        setSpeakerOn(!speakerOn);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gradient-to-br from-[#1E3C72] via-[#2A5298] to-[#4ECDC4] text-white p-4">
      {/* Avatar + Name */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0.9 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-white/20 flex items-center justify-center text-5xl shadow-lg">
          <IoMdPerson />
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold">
          {callerName || "Unknown User"}
        </h2>
        <p className="text-sm sm:text-base opacity-80">Audio call in progress…</p>
        {/* Call duration */}
        <p className="text-lg sm:text-xl font-medium mt-2">{formatTime(callDuration)}</p>
      </motion.div>

      {/* Remote Audio (hidden element) */}
      <audio ref={remoteAudioRef} className="hidden" />

      {/* Controls */}
      <div className="flex gap-6 mt-10 sm:mt-12 flex-wrap justify-center">
        {/* Mute / Unmute */}
        <button
          onClick={onMute}
          className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition shadow-lg"
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? <FiMicOff size={20} /> : <FiMic size={20} />}
        </button>

        {/* Speaker Toggle */}
        <button
          onClick={toggleSpeaker}
          className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition shadow-lg"
          title={speakerOn ? "Speaker Off" : "Speaker On"}
        >
          {speakerOn ? <FiVolume2 size={20} /> : <FiVolumeX size={20} />}
        </button>

        {/* End Call */}
        <button
          onClick={onEndCall}
          className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 transition shadow-lg"
          title="End Call"
        >
          <FiPhone size={22} className="rotate-135" />
        </button>
      </div>
    </div>
  );
}

export default AudioCallScreen;
