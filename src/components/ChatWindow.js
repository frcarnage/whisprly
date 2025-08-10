import React, { useEffect, useState } from 'react';
import { listenMessages, sendAgentMessage, assignAgent, updateChatStatus, onChatInfoChange } from '../services/chatService';
import { auth } from '../firebase';

export default function ChatWindow({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [chatInfo, setChatInfo] = useState(null);

  useEffect(() => {
    if (!chatId) return;
    setMessages([]);
    listenMessages(chatId, (msg) => { setMessages(prev => [...prev, msg]); });
    onChatInfoChange(chatId, setChatInfo);
  }, [chatId]);

  const closed = chatInfo?.status === "closed";
  const assigned = chatInfo?.participants ? Object.keys(chatInfo.participants || {}).includes(auth.currentUser?.uid) : false;
  
  return !chatId ? (
    <div style={{ padding: 20, color: "#aaa" }}>Select a chat to view messages</div>
  ) : (
    <div style={{ flex: 1, background: "#181818", color: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 10, borderBottom: "1px solid #333" }}>
        <b>ID:</b> {chatId} | 
        <span style={{ marginLeft: 8, color: closed ? "tomato" : "#7fff7f" }}>Status: {chatInfo?.status || "open"}</span>
        <span style={{ marginLeft: 16, color: "#aaa", fontSize: 12 }}>
          Assigned: {chatInfo?.participants ? Object.keys(chatInfo.participants).join(', ') : "None"}
        </span>
        {!assigned && !closed && (
          <button onClick={() => assignAgent(chatId, auth.currentUser.uid)} style={{marginLeft:12}}>Assign to me</button>
        )}
        {assigned && !closed && (
          <button onClick={() => updateChatStatus(chatId, "closed")} style={{marginLeft:12, background:"tomato", color:"white"}}>Resolve</button>
        )}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {messages.map(m => (
          <div key={m.messageId} style={{
            marginBottom: 8,
            textAlign: m.senderId === auth.currentUser?.uid ? "right" : "left"
          }}>
            <div style={{
              display: "inline-block",
              background: m.senderId === auth.currentUser?.uid ? "#4080ff" : "#333",
              color: "#fff",
              borderRadius: 10,
              padding: "7px 12px"
            }}>
              {m.text}
            </div>
            <div style={{ fontSize: 10, color: "#ccc" }}>{m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ""}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", padding: 8 }}>
        <input
          style={{ flex: 1, padding: 8, borderRadius: 6, border: "none", background: "#222", color: "#fff" }}
          disabled={closed || !assigned}
          placeholder={closed ? "Chat closed." : (!assigned ? "Please assign yourself to this chat" : "Type your reply...")}
          value={reply} onChange={e => setReply(e.target.value)}
        />
        <button
          style={{ marginLeft: 8, padding: "6px 16px" }}
          disabled={closed || !assigned || !reply.trim()}
          onClick={() => { sendAgentMessage(chatId, auth.currentUser.uid, reply); setReply(""); }}
        >Send</button>
      </div>
    </div>
  );
}
