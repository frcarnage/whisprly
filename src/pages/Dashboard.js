// src/pages/Dashboard.js
import React, { useState } from 'react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import './dashboard.css';

export default function Dashboard() {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="dashboard">
      <ChatList selectedChatId={selectedChat} onSelectChat={setSelectedChat} />
      <ChatWindow chatId={selectedChat} />
    </div>
  );
}
