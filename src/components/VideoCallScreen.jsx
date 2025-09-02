import React from "react";
import { FiMic, FiVideo } from "react-icons/fi";
import { FaPhoneSlash } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import '../css/VideoCallScreen.css'

function VideoCallScreen({ myVideo, remoteVideo, micOn, videoOn, toggleMic, toggleVideo, EndCall, selectedName }) {
  return (
    <div className="vc-container">
      <div className="vc-header">
        <button className="btn btn-ghost btn-sm" onClick={EndCall}>
          <IoIosArrowBack />
        </button>
        <h2 className="vc-title">📹 Video Call {selectedName ? `with ${selectedName}` : ""}</h2>
        <div className="vc-header-right"></div>
      </div>

      <div className="vc-stage">
        <div className="vc-video-box">
          <video ref={myVideo} autoPlay  playsInline className="vc-video" />
          <span className="vc-badge">You</span>
        </div>
        <div className="vc-video-box">
          <video ref={remoteVideo} autoPlay playsInline className="vc-video" />
          <span className="vc-badge">{selectedName || "Peer"}</span>
        </div>
      </div>

      <div className="vc-controls">
        <button className={`vc-btn ${micOn ? "vc-on" : "vc-off"}`} onClick={toggleMic} title={micOn ? "Mute" : "Unmute"}>
          <FiMic />
        </button>
        <button className={`vc-btn ${videoOn ? "vc-on" : "vc-off"}`} onClick={toggleVideo} title={videoOn ? "Turn camera off" : "Turn camera on"}>
          <FiVideo />
        </button>
        <button className="vc-btn vc-end" onClick={EndCall} title="End Call">
          <FaPhoneSlash />
        </button>
      </div>
    </div>
  );
}

export default VideoCallScreen;
