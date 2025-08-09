// src/components/ChatList.js
import React, { useEffect, useState } from 'react';
import { listenChats } from '../services/chatService';
import './chatList.css';

export default function ChatList({ onSelectChat, selectedChatId }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    listenChats((newChat) => {
      setChats((prevChats) => {
        if (prevChats.find(c => c.chatId === newChat.chatId)) return prevChats;
        return [...prevChats, newChat];
      });
    });
  }, []);

  return (
    <div className="chat-list">
      <h3>Support Chats</h3>
      {chats.length === 0 && <p className="empty">No active chats</p>}
      {chats.map(chat => (
        <div
          key={chat.chatId}
          className={`chat-list-item ${selectedChatId === chat.chatId ? 'selected' : ''}`}
          onClick={() => onSelectChat(chat.chatId)}
        >
          <div className="chat-info">
            <strong>{chat.chatId}</strong>
            <span className={`status ${chat.status}`}>{chat.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
