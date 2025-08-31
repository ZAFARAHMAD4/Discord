import React from "react";
import '../css/MessageList.css'
function MessageList({ messages, currentUser }) {
  return (
    <div className="flex-1 p-2 md:p-4 overflow-y-auto space-y-2">
      {messages.length > 0 ? (
        messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat ${msg.from === currentUser.email ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-bubble max-w-[80%] md:max-w-[60%] break-words">
              {msg.message && <p className="text-sm md:text-base">{msg.message}</p>}

              {msg.file && (
                <div className="mt-2">
                  {msg.file.type.startsWith("image/") ? (
                    <img
                      src={msg.file.content}
                      alt={msg.file.name}
                      className="rounded-lg max-h-48 md:max-h-72 object-cover"
                    />
                  ) : msg.file.type.startsWith("video/") ? (
                    <video controls className="rounded-lg max-h-48 md:max-h-72 object-cover">
                      <source src={msg.file.content} type={msg.file.type} />
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
        <p className="text-gray-400 text-sm text-center">Start the conversation...</p>
      )}
    </div>
  );
}

export default MessageList;