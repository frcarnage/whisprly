import React, { useEffect, useState } from 'react';
import { listenChats } from '../services/chatService';

export default function ChatList({ onSelectChat, selectedChatId }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    listenChats((newChat) => {
      setChats(prev => prev.find(c => c.chatId === newChat.chatId) ? prev : [...prev, newChat]);
    });
  }, []);

  return (
    <div style={{ width: 260, background: "#222", color: "#fff", padding: 10 }}>
      <h3>Support Chats</h3>
      {chats.length === 0 && <p>No active chats</p>}
      {chats.map(chat => (
        <div
          key={chat.chatId}
          style={{
            padding: 8, margin: '8px 0', borderRadius: 6,
            background: selectedChatId === chat.chatId ? "#444" : (chat.status === 'closed' ? "#333" : "#222"),
            opacity: chat.status === "closed" ? 0.5 : 1, cursor: chat.status === "closed" ? "default" : "pointer"
          }}
          onClick={chat.status === "closed" ? undefined : () => onSelectChat(chat.chatId)}
        >
          <div><strong>{chat.chatId}</strong></div>
          <div style={{ fontSize: 11, color: "#aaa" }}>Status: {chat.status || "open"}</div>
        </div>
      ))}
    </div>
  );
}
