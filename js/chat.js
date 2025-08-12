// /js/chat.js

import { auth, db, rtdb } from './firebaseconfig.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { onChildAdded, push, ref, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// HTML references
const messagesContainer = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const sendAsCheckbox = document.getElementById("sendAsSystem"); // new checkbox

// Get caseId from URL
const urlParams = new URLSearchParams(window.location.search);
const caseId = urlParams.get("id");

let currentUser = null;

// ============================
// Logout
// ============================
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "admin-login.html";
});

// ============================
// Auth guard
// ============================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "admin-login.html";
    return;
  }

  // Check admin role in Firestore
  currentUser = user;
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists() || userDoc.data().role !== "admin") {
    await signOut(auth);
    window.location.href = "admin-login.html";
    return;
  }

  // Load messages for this case
  loadMessages();
});

// ============================
// Real-time message loader
// ============================
function loadMessages() {
  const messagesRef = ref(rtdb, `support_cases/${caseId}/messages`);

  messagesContainer.innerHTML = "";

  onChildAdded(messagesRef, (snapshot) => {
    const msg = snapshot.val();
    appendMessage(msg);
    scrollToBottom();
  });
}

// ============================
// Render single message
// ============================
function appendMessage(msg) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message");

  // Safe timestamp formatting
  let timeStr = "";
  if (typeof msg.timestamp === "number") {
    timeStr = new Date(msg.timestamp).toLocaleString();
  }

  let senderLabel = msg.senderId || "Unknown";

  if (msg.type === "system" || msg.senderId === "SYSTEM") {
    msgDiv.classList.add("system-message");
    msgDiv.innerHTML = `
      <div class="system-text">[SYSTEM] ${msg.text}</div>
      <div class="timestamp">${timeStr}</div>
    `;
  } else {
    msgDiv.classList.add(msg.senderId === currentUser.uid ? "my-message" : "other-message");
    msgDiv.innerHTML = `
      <div class="sender"><strong>${senderLabel}</strong></div>
      <div class="text">${msg.text}</div>
      <div class="timestamp">${timeStr}</div>
    `;
  }

  messagesContainer.appendChild(msgDiv);
}

// ============================
// Send message function
// ============================
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  const messagesRef = ref(rtdb, `support_cases/${caseId}/messages`);
  const newMsgRef = push(messagesRef);

  let msgData;

  if (sendAsCheckbox.checked) {
    // SYSTEM message
    msgData = {
      senderId: "SYSTEM",
      text: text,
      timestamp: Date.now(),
      type: "system"
    };
  } else {
    // Normal message from admin
    msgData = {
      senderId: currentUser.uid,
      text: text,
      timestamp: Date.now(),
      type: "text"
    };
  }

  set(newMsgRef, msgData);

  messageInput.value = "";
  scrollToBottom();
}

// ============================
// Auto-scroll
// ============================
function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
