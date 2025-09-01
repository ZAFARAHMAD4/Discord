import React, { useEffect, useRef } from "react";
import { FiPaperclip, FiSend } from "react-icons/fi";
import AOS from "aos";
import "aos/dist/aos.css";
function MessageInput({ message, setMessage, onSend, onFileSend }) {
  const fileInputRef = useRef(null);
    useEffect(() => {
    AOS.init({ duration: 800, once: true });
    AOS.refresh();
  }, []);

  return (
    <div className="p-2 md:p-4 border-t bg-base-100 flex items-center gap-2" data-aos="fade-up"
     data-aos-anchor-placement="center-bottom" >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSend(file);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
      />

      <button
        className="btn btn-ghost btn-xs md:btn-sm"
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
      >
        <FiPaperclip />
      </button>

      <input
        type="text"
        className="input input-bordered flex-1 text-sm md:text-base"
        placeholder="Type your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
      />

      <button className="btn btn-primary btn-xs md:btn-sm" onClick={onSend}>
        <FiSend />
      </button>
    </div>
  );
}

export default MessageInput;
