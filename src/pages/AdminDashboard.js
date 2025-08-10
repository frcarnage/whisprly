import React, { useState } from 'react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';

export default function AdminDashboard() {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <ChatList selectedChatId={selectedChat} onSelectChat={setSelectedChat} />
      <ChatWindow chatId={selectedChat} />
    </div>
  );
}
