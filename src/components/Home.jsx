import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  FiPhone,
  FiVideo,
  FiMic,
  FiPaperclip,
  FiSend,
  FiMoreHorizontal,
} from "react-icons/fi";
import { FaPhoneSlash, FaEdit } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import "../css/Home.css";

const Home = () => {
  const socket = useRef(null);

  // ---------- UI states ----------
  const [showActions, setShowActions] = useState(false);
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [selectedUser, setSelectedUser] = useState(null);
  const [sidebarHeight, setSidebarHeight] = useState(window.innerHeight);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // ---------- current user ----------
  const currentUsers = localStorage.getItem("currentUser");
  const currentUser = currentUsers
    ? {
        name: JSON.parse(currentUsers).NAME,
        email: JSON.parse(currentUsers).Email,
        profilePic: "https://i.pravatar.cc/40?img=2",
      }
    : { name: "Anonymous", email: "unknown@example.com" };

  // ---------- fetch users ----------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_DEV_URL}/api/test2`);
        const data = await response.json();
        if (response.ok) {
          const allUsers = data.students || data.studentss || [];
          const filteredUsers = allUsers.filter(
            (user) => user.Email !== currentUser.email
          );
          setUsers(filteredUsers);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  // ---------- resize ----------
  useEffect(() => {
    const updateHeight = () => setSidebarHeight(window.innerHeight);
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // ---------- socket setup ----------
  useEffect(() => {
    socket.current = io(`${import.meta.env.VITE_DEV_URL}`);

    socket.current.on("receive_private_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.current.on("user_online", (userId) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));
    });

    socket.current.on("user_offline", (userId) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    socket.current.on("online_users", (onlineUserEmails) => {
      setOnlineUsers(new Set(onlineUserEmails));
    });

    socket.current.on("connect", () => {
      socket.current.emit("register_user", currentUser.email);
      setTimeout(() => {
        socket.current.emit("get_online_users");
      }, 100);
    });

    return () => {
      socket.current.disconnect();
    };
  }, [currentUser.email]);

  // ---------- reflect online status ----------
  useEffect(() => {
    if (selectedUser) {
      setSelectedUser((prev) => ({
        ...prev,
        online: onlineUsers.has(prev.Email),
      }));
    }
    setUsers((prevUsers) =>
      prevUsers.map((user) => ({
        ...user,
        online: onlineUsers.has(user.Email),
      }))
    );
  }, [onlineUsers]);

  // ---------- network up/down ----------
  useEffect(() => {
    const handleOffline = () => {
      if (socket.current) socket.current.emit("user_offline", currentUser.email);
    };
    const handleOnline = () => {
      if (!socket.current) return;
      socket.current.emit("register_user", currentUser.email);
      socket.current.emit("get_online_users");
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [isOnline, currentUser.email]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ---------- chat send ----------
  const handleSend = () => {
    if (!message.trim() || !selectedUser) return;
    const newMessage = {
      from: currentUser.email,
      to: selectedUser.Email,
      message: message.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
    socket.current.emit("send_private_message", newMessage);
    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  // ---------- file send ----------
  const handleFileSend = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        content: reader.result,
      };
      const newMessage = {
        from: currentUser.email,
        to: selectedUser?.Email,
        file: fileData,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };
      socket.current.emit("send_private_message", newMessage);
      setMessages((prev) => [...prev, newMessage]);
    };
    reader.readAsDataURL(file);
  };

  // =========================================
  // =============  WEBRTC  ==================
  // =========================================
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const pcRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  // ringing / incoming popup
  const [ringing, setRinging] = useState(false); // caller side waiting for accept
  const [incomingCall, setIncomingCall] = useState(null); // { from, name }
  const [callerEmail, setCallerEmail] = useState(null); // who is calling you (callee)

  // reflect local stream to <video>
  useEffect(() => {
    if (myVideo.current && stream) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);

  // create RTCPeerConnection with handlers
  const createPeerConnection = (peerEmailForIce) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate && (peerEmailForIce || selectedUser?.Email)) {
        socket.current.emit("webrtc-ice", {
          to: peerEmailForIce || selectedUser.Email,
          from: currentUser.email,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = (e) => {
      const [remoteStream] = e.streams;
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = remoteStream;
      }
    };

    pc.onconnectionstatechange = () => {
      const st = pc.connectionState;
      if (st === "failed" || st === "disconnected" || st === "closed") {
        cleanupCall();
      }
    };

    return pc;
  };

  // Caller: start call -> ring callee, wait for accept, then send offer
  const CallVideo = async () => {
    if (!selectedUser) return;
    try {
      // ring callee (just UI + notify)
      socket.current.emit("call_user", {
        to: selectedUser.Email,
        from: currentUser.email,
        name: currentUser.name,
      });
      setRinging(true);
    } catch (err) {
      console.error("Error initiating call:", err);
    }
  };

  // Hangup
  const EndCall = () => {
    try {
      const toEmail =
        selectedUser?.Email || callerEmail || incomingCall?.from || null;
      if (toEmail) {
        socket.current.emit("webrtc-end", {
          to: toEmail,
          from: currentUser.email,
        });
      }
    } catch {}
    cleanupCall();
  };

  const cleanupCall = () => {
    try {
      if (pcRef.current) {
        pcRef.current.onicecandidate = null;
        pcRef.current.ontrack = null;
        pcRef.current.close();
        pcRef.current = null;
      }
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch (e) {
      console.warn(e);
    }
    if (myVideo.current) myVideo.current.srcObject = null;
    if (remoteVideo.current) remoteVideo.current.srcObject = null;
    setInCall(false);
    setMicOn(true);
    setVideoOn(true);
    setStream(null);
    setRinging(false);
    setIncomingCall(null);
    setCallerEmail(null);
  };

  // Controls
  const toggleMic = () => {
    if (!stream) return;
    const audio = stream.getAudioTracks()[0];
    if (!audio) return;
    audio.enabled = !audio.enabled;
    setMicOn(audio.enabled);
  };

  const toggleVideo = () => {
    if (!stream) return;
    const video = stream.getVideoTracks()[0];
    if (!video) return;
    video.enabled = !video.enabled;
    setVideoOn(video.enabled);
  };

  // ---------- Signaling listeners (single place) ----------
  useEffect(() => {
    if (!socket.current) return;

    // You are CALLEE: someone is calling you -> show popup
    const onIncomingCall = ({ from, name }) => {
      setIncomingCall({ from, name });
      setCallerEmail(from);
    };

    // You are CALLER: callee accepted -> now create offer and send
    const onCallAccepted = async ({ from }) => {
      try {
        setRinging(false);
        // get camera/mic
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);

        // create pc
        pcRef.current = createPeerConnection(from);

        // add tracks
        mediaStream.getTracks().forEach((t) =>
          pcRef.current.addTrack(t, mediaStream)
        );

        // create & send offer
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);

        socket.current.emit("webrtc-offer", {
          to: from,
          from: currentUser.email,
          sdp: offer,
        });

        setInCall(true);
      } catch (err) {
        console.error("Error after call_accepted (caller):", err);
      }
    };

    // You are CALLER: callee rejected
    const onCallRejected = () => {
      setRinging(false);
    };

    // CALLEE: got offer -> set remote, create answer, send
    const onOffer = async ({ from, sdp }) => {
      try {
        // ensure local media (callee accepts)
        if (!stream) {
          // If user clicked Accept, stream already exists; if not, still get it
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          setStream(mediaStream);
        }

        if (!pcRef.current) pcRef.current = createPeerConnection(from);

        // add local tracks once
        const senders = pcRef.current.getSenders();
        const hasTracks = senders && senders.length > 0;
        const local = stream || myVideo.current?.srcObject;
        if (local && !hasTracks) {
          local.getTracks().forEach((t) => pcRef.current.addTrack(t, local));
        }

        await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);

        socket.current.emit("webrtc-answer", {
          to: from,
          from: currentUser.email,
          sdp: answer,
        });

        setInCall(true);
        setIncomingCall(null);
      } catch (err) {
        console.error("Error handling offer (callee):", err);
      }
    };

    // CALLER: receive answer
    const onAnswer = async ({ sdp }) => {
      try {
        if (pcRef.current) {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        }
      } catch (err) {
        console.error("Error setting remote answer (caller):", err);
      }
    };

    // Both: ICE
    const onIce = async ({ candidate }) => {
      try {
        if (pcRef.current && candidate) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("Error adding ICE:", err);
      }
    };

    // Both: remote ended
    const onEnd = () => {
      cleanupCall();
    };

    socket.current.on("incoming_call", onIncomingCall);
    socket.current.on("call_accepted", onCallAccepted);
    socket.current.on("call_rejected", onCallRejected);
    socket.current.on("webrtc-offer", onOffer);
    socket.current.on("webrtc-answer", onAnswer);
    socket.current.on("webrtc-ice", onIce);
    socket.current.on("webrtc-end", onEnd);

    return () => {
      socket.current.off("incoming_call", onIncomingCall);
      socket.current.off("call_accepted", onCallAccepted);
      socket.current.off("call_rejected", onCallRejected);
      socket.current.off("webrtc-offer", onOffer);
      socket.current.off("webrtc-answer", onAnswer);
      socket.current.off("webrtc-ice", onIce);
      socket.current.off("webrtc-end", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream, selectedUser, currentUser.email]);

  // ---------- Accept/Reject actions (CALLEE) ----------
  const acceptIncoming = async () => {
    if (!incomingCall) return;
    try {
      // mic/cam before accept so streams ready
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);

      // create pc now (callee)
      pcRef.current = createPeerConnection(incomingCall.from);

      // add tracks
      mediaStream.getTracks().forEach((t) =>
        pcRef.current.addTrack(t, mediaStream)
      );

      // tell caller: accepted
      socket.current.emit("accept_call", {
        to: incomingCall.from,
        from: currentUser.email,
      });

      // UI updates; actual connection finalizes when OFFER arrives
      setInCall(true);
      // keep popup hidden, wait for offer -> answer in onOffer()
      setIncomingCall(null);
    } catch (err) {
      console.error("Error accepting call:", err);
    }
  };

  const rejectIncoming = () => {
    if (!incomingCall) return;
    socket.current.emit("reject_call", {
      to: incomingCall.from,
      from: currentUser.email,
    });
    setIncomingCall(null);
    setCallerEmail(null);
  };

  // ---------- Call UI ----------
  const VideoCallScreen = () => (
    <div className="vc-container">
      <div className="vc-header">
        <button className="btn btn-ghost btn-sm" onClick={EndCall}>
          <IoIosArrowBack />
        </button>
        <h2 className="vc-title">📹 Video Call {selectedUser ? `with ${selectedUser?.NAME}` : ""}</h2>
        <div className="vc-header-right"></div>
      </div>

      <div className="vc-stage">
        {/* Me */}
        <div className="vc-video-box">
          <video ref={myVideo} autoPlay muted playsInline className="vc-video" />
          <span className="vc-badge">You</span>
        </div>

        {/* Remote */}
        <div className="vc-video-box">
          <video ref={remoteVideo} autoPlay playsInline className="vc-video" />
          <span className="vc-badge">{selectedUser?.NAME || "Peer"}</span>
        </div>
      </div>

      <div className="vc-controls">
        <button
          className={`vc-btn ${micOn ? "vc-on" : "vc-off"}`}
          onClick={toggleMic}
          title={micOn ? "Mute" : "Unmute"}
        >
          <FiMic />
        </button>

        <button
          className={`vc-btn ${videoOn ? "vc-on" : "vc-off"}`}
          onClick={toggleVideo}
          title={videoOn ? "Turn camera off" : "Turn camera on"}
        >
          <FiVideo />
        </button>

        <button className="vc-btn vc-end" onClick={EndCall} title="End Call">
          <FaPhoneSlash />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex w-full h-screen bgg">
      {/* Left Sidebar */}
      <div
        className={`${
          selectedUser && window.innerWidth < 768 ? "hidden" : "block"
        } w-full md:w-1/4 lg:w-1/5 bg-base-200 border-r custom-sidebar`}
        style={{ height: sidebarHeight }}
      >
        <div className="p-4 border-b flex items-center justify-between bg-primary text-primary-content">
          <div className="flex">
            <div className="profile">
              <img
                src={currentUser.profilePic || "https://i.pravatar.cc/150?img=3"}
                alt={currentUser.name}
              />
              <div className="edit">
                <FaEdit />
              </div>
            </div>
            <div className="name">{currentUser.name}</div>
          </div>
          <span className="badge badge-accent">{users.length}</span>
        </div>

        <ul className="menu p-2 w-full overflow-y-auto custom-scrollbar">
          {users.length > 0 ? (
            users.map((user, index) => (
              <li
                key={index}
                className={`rounded-lg cursor-pointer transition-all hover:bg-primary hover:text-white shadow-sm mb-1 ${
                  selectedUser?.Email === user.Email ? "bg-primary text-white" : ""
                }`}
                onClick={() => {
                  setSelectedUser(user);
                  setMessages([]);
                }}
              >
                <div className="flex items-center gap-3 p-2">
                  <div className={`avatar ${user.online ? "online" : "offline"}`}>
                    <div className="w-12 rounded-full ring ring-offset-base-100 ring-offset-2">
                      <img
                        src={user.profilePic || "https://i.pravatar.cc/150?img=3"}
                        alt={user.NAME}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p className="font-medium text-sm truncate max-w=[120px]">
                      {user.NAME || user.Email}
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
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col w-full max-h-screen">
        {selectedUser ? (
          inCall ? (
            <VideoCallScreen />
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between gap-3 p-3 md:p-4 border-b bg-base-100 shadow-sm flex-wrap">
                <div className="flex items-center gap-3 min-w-[50%]">
                  <button
                    className="cursor-pointer  md:btn-sm"
                    onClick={() => setSelectedUser(null)}
                  >
                    <IoIosArrowBack />
                  </button>
                  <div className="avatar">
                    <div className="w-10 md:w-12 rounded-full">
                      <img
                        src={
                          selectedUser.profilePic ||
                          "https://i.pravatar.cc/150?img=5"
                        }
                        alt={selectedUser.NAME}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-sm md:text-lg font-semibold truncate">
                      {selectedUser.NAME}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500">
                      Last seen: {selectedUser.online ? "Online now" : "2 minutes ago"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 text-lg text-gray-600">
                  <div className="hidden sm:flex items-center gap-2">
                    <button className="btn btn-ghost btn-xs md:btn-sm">
                      <FiPhone />
                    </button>
                    <button className="btn btn-ghost btn-xs md:btn-sm" onClick={CallVideo}>
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
                        <button className="btn btn-ghost btn-xs">
                          <FiPhone />
                        </button>
                        <button className="btn btn-ghost btn-xs" onClick={CallVideo}>
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

              {/* Messages */}
              <div className="flex-1 p-2 md:p-4 overflow-y-auto space-y-2">
                {messages.length > 0 ? (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`chat ${
                        msg.from === currentUser.email ? "chat-end" : "chat-start"
                      }`}
                    >
                      <div className="chat-bubble max-w-[80%] md:max-w-[60%] break-words">
                        {msg.message && (
                          <p className="text-sm md:text-base">{msg.message}</p>
                        )}

                        {msg.file && (
                          <div className="mt-2">
                            {msg.file.type.startsWith("image/") ? (
                              <img
                                src={msg.file.content}
                                alt={msg.file.name}
                                className="rounded-lg max-h-48 md:max-h-72 object-cover"
                              />
                            ) : msg.file.type.startsWith("video/") ? (
                              <video
                                controls
                                className="rounded-lg max-h-48 md:max-h-72 object-cover"
                              >
                                <source
                                  src={msg.file.content}
                                  type={msg.file.type}
                                />
                                Your browser does not support the video tag.
                              </video>
                            ) : (
                              <a
                                href={msg.file.content}
                                download={msg.file.name}
                                className="text-blue-500 underline text-sm"
                              >
                                📎 {msg.file.name}
                              </a>
                            )}
                          </div>
                        )}

                        <div className="text-[10px] md:text-xs text-right mt-1 text-gray-400">
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm text-center">
                    Start the conversation...
                  </p>
                )}
              </div>

              {/* Input */}
              <div className="p-2 md:p-4 border-t bg-base-100 flex items-center gap-2">
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*,video/*,.gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleFileSend(file);
                    e.target.value = "";
                  }}
                />
                <button
                  className="btn btn-ghost btn-xs md:btn-sm"
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  <FiPaperclip />
                </button>

                <input
                  type="text"
                  className="input input-bordered flex-1 text-sm md:text-base"
                  placeholder="Type your message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />

                <button
                  className="btn btn-primary btn-xs md:btn-sm"
                  onClick={handleSend}
                >
                  <FiSend />
                </button>
              </div>
            </>
          )
        ) : (
          <main className="container">
            <p>Hello 👋 I'm</p>
            <section className="animation">
              <div className="first">
                <div>ZAFAR AHMAD</div>
              </div>
              <div className="second">
                <div>Web Developer</div>
              </div>
              <div className="third">
                <div>Software Engineer</div>
              </div>
            </section>
          </main>
        )}
      </div>

      {/* ---------- Caller ringing banner ---------- */}
      {ringing && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded shadow">
            Calling… waiting for other user to accept
          </div>
        </div>
      )}

      {/* ---------- Incoming Call Popup (CALLEE) ---------- */}
      {incomingCall && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-5 rounded-xl shadow-xl w-full max-w-sm">
            <div className="text-center">
              <div className="text-lg font-semibold mb-2">
                {incomingCall.name || "Someone"} is calling…
              </div>
              <div className="text-sm text-gray-600 mb-4">{incomingCall.from}</div>
            </div>
            <div className="flex gap-3 justify-center">
              <button className="btn btn-success" onClick={acceptIncoming}>
                Accept
              </button>
              <button className="btn btn-error" onClick={rejectIncoming}>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
