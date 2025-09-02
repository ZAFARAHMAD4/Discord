import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import VideoCallScreen from "../components/VideoCallScreen";
import AudioCallScreen from "../components/AudioCallScreen"; // ✅ NEW
import IncomingCallPopup from "../components/IncomingCallPopup";
import RingingBanner from "../components/RingingBanner";
import "../css/Home.css";
import AOS from "aos";
import "aos/dist/aos.css";
function Home() {
  useEffect(() => {
  AOS.init({ duration: 800 });
}, []);
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
        name: JSON.parse(currentUsers).name,
        email: JSON.parse(currentUsers).email,
        profilePic: "https://i.pravatar.cc/40?img=2",
      }
    : { name: "Anonymous", email: "unknown@example.com" };

  // ---------- fetch users ----------
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_DEV_URL}/api/users`); // ✅ correct API
      const data = await response.json();
      console.log(data, "selectedUser");

      if (response.ok) {
        // ✅ backend ka response ka structure check karo
        const allUsers = data.users || [];
        const filteredUsers = allUsers.filter(
          (user) => user.email !== currentUser.email
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

  // =========================================
  // =============  WEBRTC  ==================
  // =========================================
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const remoteAudio = useRef(null); // ✅ audio-only ke liye
  const pcRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [callType, setCallType] = useState(null); // ✅ "audio" | "video"

  // ringing / incoming popup
  const [ringing, setRinging] = useState(false); // caller side waiting for accept
  const [incomingCall, setIncomingCall] = useState(null); // { from, name, type }
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
      if (e.candidate && (peerEmailForIce || selectedUser?.email)) {
        socket.current.emit("webrtc-ice", {
          to: peerEmailForIce || selectedUser.email,
          from: currentUser.email,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = (e) => {
      const [remoteStream] = e.streams;
      // ✅ Agar audio call hai to <audio> me stream lagao, warna <video>
      if (callType === "audio") {
        if (remoteAudio.current) {
          remoteAudio.current.srcObject = remoteStream;
        }
      } else {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = remoteStream;
        }
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

  // Caller: start VIDEO call -> ring callee
  const CallVideo = async () => {
    if (!selectedUser) return;
    try {
      setCallType("video"); // ✅ UI/render ke liye
      socket.current.emit("call_user", {
        to: selectedUser.email,
        from: currentUser.email,
        name: currentUser.name,
        type: "video", // ✅ server tak type jaayega
      });
      setRinging(true);
    } catch (err) {
      console.error("Error initiating call:", err);
    }
  };

  // Caller: start AUDIO call -> ring callee
  const CallAudio = async () => {
    if (!selectedUser) return;
    try {
      setCallType("audio"); // ✅ UI/render ke liye
      socket.current.emit("call_user", {
        to: selectedUser.email,
        from: currentUser.email,
        name: currentUser.name,
        type: "audio",
      });
      setRinging(true);
    } catch (err) {
      console.error("Error initiating audio call:", err);
    }
  };

  // Hangup
  const EndCall = () => {
    try {
      const toEmail =
        selectedUser?.email || callerEmail || incomingCall?.from || null;
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
    if (remoteAudio.current) remoteAudio.current.srcObject = null;
    setInCall(false);
    setMicOn(true);
    setVideoOn(true);
    setStream(null);
    setRinging(false);
    setIncomingCall(null);
    setCallerEmail(null);
    setCallType(null); // ✅ reset
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
        online: onlineUsers.has(prev.email),
      }));
    }
    setUsers((prevUsers) =>
      prevUsers.map((user) => ({
        ...user,
        online: onlineUsers.has(user.email),
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
      to: selectedUser.email,
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
        to: selectedUser?.email,
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

  // ---------- Signaling listeners ----------
  useEffect(() => {
    if (!socket.current) return;

    const onIncomingCall = ({ from, name, type }) => {
      // ✅ server se type zaroor aana chahiye
      setIncomingCall({ from, name, type });
      setCallType(type || "video"); // safety fallback
      setCallerEmail(from);
    };

    const onCallAccepted = async ({ from, type }) => {
      try {
        setRinging(false);
        const constraints =
          (type || callType) === "audio"
            ? { audio: true }
            : { video: true, audio: true };

        const mediaStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );
        setStream(mediaStream);
        if (myVideo.current) myVideo.current.srcObject = mediaStream; 

        pcRef.current = createPeerConnection(from);
        mediaStream.getTracks().forEach((t) =>
          pcRef.current.addTrack(t, mediaStream)
        );

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

    const onCallRejected = () => {
      setRinging(false);
      setCallType(null);
    };

    const onOffer = async ({ from, sdp, type }) => {
      try {
        // ✅ callee side: constraints type se decide
        const finalType = type || callType || incomingCall?.type || "video";
        if (!stream) {
          const mediaStream = await navigator.mediaDevices.getUserMedia(
            finalType === "audio" ? { audio: true } : { video: true, audio: true }
          );
          setStream(mediaStream);
        }

        if (!pcRef.current) pcRef.current = createPeerConnection(from);

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
          type: finalType, // optional: debugging ke liye
        });

        setCallType(finalType);
        setInCall(true);
        setIncomingCall(null);
      } catch (err) {
        console.error("Error handling offer (callee):", err);
      }
    };

    const onAnswer = async ({ sdp }) => {
      try {
        if (pcRef.current) {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
        }
      } catch (err) {
        console.error("Error setting remote answer (caller):", err);
      }
    };

    const onIce = async ({ candidate }) => {
      try {
        if (pcRef.current && candidate) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("Error adding ICE:", err);
      }
    };

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
  }, [stream, selectedUser, currentUser.email, callType, incomingCall]);

  // ---------- Accept/Reject actions (CALLEE) ----------
  const acceptIncoming = async () => {
    if (!incomingCall) return;
    try {
      const constraints =
        incomingCall.type === "audio"
          ? { audio: true }
          : { video: true, audio: true };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      pcRef.current = createPeerConnection(incomingCall.from);
      mediaStream.getTracks().forEach((t) =>
        pcRef.current.addTrack(t, mediaStream)
      );

      socket.current.emit("accept_call", {
        to: incomingCall.from,
        from: currentUser.email,
        type: incomingCall.type, // 👈 send back
      });

      setCallType(incomingCall.type || "video");
      setInCall(true);
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
    setCallType(null);
  };
  console.log(users,'usershome')
  console.log(selectedUser,'selectedUserhome')

  // ---------- Render ----------
  return (
    <div className="flex w-full h-screen bgg">
      {/* Left Sidebar */}
      <div
        className={`${
          selectedUser && window.innerWidth < 768 ? "hidden" : "block"
        } w-full md:w-1/4 lg:w-1/5 bg-base-200 border-r custom-sidebar`}
        style={{ height: sidebarHeight }}
      >
        <Sidebar
          users={users}
          selectedUser={selectedUser}
          setSelectedUser={(user) => {
            setSelectedUser(user);
            setMessages([]);
          }}
          currentUser={currentUser}
        />
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col w-full max-h-screen">
        {selectedUser ? (
          inCall ? (
            callType === "audio" ? (
              <AudioCallScreen
                remoteAudioRef={remoteAudio} // ✅ stream is set by pc.ontrack
                callerName={selectedUser?.name}
                onEndCall={EndCall}
                onMute={toggleMic}
                muted={!micOn}
              />
            ) : (
              <VideoCallScreen
                myVideo={myVideo}
                remoteVideo={remoteVideo}
                micOn={micOn}
                videoOn={videoOn}
                toggleMic={toggleMic}
                toggleVideo={toggleVideo}
                EndCall={EndCall}
                selectedName={selectedUser?.name}
              />
            )
          ) : (
            <>
              <ChatHeader
                selectedUser={selectedUser}
                onBack={() => setSelectedUser(null)}
                onCallVideo={CallVideo}
                onCallAudio={CallAudio}   // ✅ audio call button
                showActions={showActions}
                setShowActions={setShowActions}
                
              />

              <MessageList messages={messages} currentUser={currentUser} />

              <MessageInput
                message={message}
                setMessage={setMessage}
                onSend={handleSend}
                onFileSend={handleFileSend}
                onVoiceSend={(file) => handleSend(null, file)} // voice file bhi bhejna
              />
            </>
          )
        ) : (
         <main class="intro-container">
  <p class="intro-hello">Hello 👋 I'm</p>

  <h1 class="fire-wrapper">
    <span class="fire-text">ZAFAR AHMAD</span>
  </h1>

  <p class="fire-subtext">Web Developer | Software Engineer</p>
</main>

        )}
      </div>

      {/* Caller ringing banner */}
      {ringing && <RingingBanner   user={selectedUser} onEnd={EndCall}/>}

      {/* Incoming Call Popup */}
      {incomingCall && (
        <IncomingCallPopup
          incomingCall={incomingCall}
          onAccept={acceptIncoming}
          onReject={rejectIncoming}
        />
      )}
    </div>
  );
}

export default Home;
