// src/components/ChatWindow.js
import React, { useEffect, useState } from 'react';
import { listenMessages, sendAgentMessage } from '../services/chatService';
import { auth } from '../firebase';
import './chatWindow.css';

export default function ChatWindow({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');

  useEffect(() => {
    if (!chatId) return;
    setMessages([]);
    listenMessages(chatId, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
  }, [chatId]);

  const sendReply = () => {
    if (!reply.trim() || !auth.currentUser) return;
    sendAgentMessage(chatId, auth.currentUser.uid, reply.trim());
    setReply('');
  };

  if (!chatId) {
    return <div className="chat-window empty">Select a chat to view messages</div>;
  }

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((m) => (
          <div
            key={m.messageId}
            className={`message ${m.senderId === auth.currentUser.uid ? 'agent' : 'user'}`}
          >
            <p>{m.text}</p>
            <span className="time">{new Date(m.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
      <div className="reply-box">
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply..."
        />
        <button onClick={sendReply}>Send</button>
      </div>
    </div>
  );
}
