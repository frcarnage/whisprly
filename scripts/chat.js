import { auth, db } from './firebase-init.js';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  serverTimestamp,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const urlParams = new URLSearchParams(window.location.search);
const receiverId = urlParams.get('uid');
let currentUser = null;

const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatUserName = document.getElementById('chatUserName');
const typingStatus = document.getElementById('typingStatus');

let chatId = null;
let typingTimeout = null;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await loadReceiverInfo();
    await initChatRoom();
    listenForMessages();
    listenForTyping();
  } else {
    window.location.href = "/login.html";
  }
});

async function loadReceiverInfo() {
  const receiverDoc = await getDoc(doc(db, "users", receiverId));
  if (receiverDoc.exists()) {
    const user = receiverDoc.data();
    chatUserName.textContent = user.username || "User";
  }
}

function generateChatId(uid1, uid2) {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}

async function initChatRoom() {
  chatId = generateChatId(currentUser.uid, receiverId);
  const chatRef = doc(db, "chats", chatId);
  const chatSnap = await getDoc(chatRef);
  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      participants: [currentUser.uid, receiverId],
      createdAt: serverTimestamp()
    });
  }
}

function listenForMessages() {
  const messagesRef = collection(db, "chats", chatId, "messages");
  onSnapshot(messagesRef, (snapshot) => {
    chatMessages.innerHTML = "";
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const isMe = msg.senderId === currentUser.uid;
      const msgEl = document.createElement("div");

      msgEl.style = `
        background: ${isMe ? "#DCF8C6" : "#eee"};
        padding: 8px 12px;
        border-radius: 10px;
        margin: 4px;
        max-width: 60%;
        align-self: ${isMe ? "flex-end" : "flex-start"};
      `;

      msgEl.innerHTML = `
        <div>${msg.text}</div>
        <div style="font-size: 0.7rem; color: gray; text-align: right;">${msg.timestamp?.toDate().toLocaleTimeString()}</div>
      `;

      chatMessages.appendChild(msgEl);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

sendButton.onclick = async () => {
  const text = messageInput.value.trim();
  if (text === "") return;

  const messagesRef = collection(db, "chats", chatId, "messages");
  await addDoc(messagesRef, {
    senderId: currentUser.uid,
    receiverId,
    text,
    timestamp: serverTimestamp()
  });

  await updateDoc(doc(db, "chats", chatId), {
    lastMessage: text,
    lastUpdated: serverTimestamp()
  });

  messageInput.value = "";
  sendTypingStatus(false);
};

messageInput.addEventListener("input", () => {
  sendTypingStatus(true);

  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    sendTypingStatus(false);
  }, 1500);
});

async function sendTypingStatus(isTyping) {
  const typingRef = doc(db, "chats", chatId, "typing", currentUser.uid);
  await setDoc(typingRef, { isTyping }, { merge: true });
}

function listenForTyping() {
  const typingRef = doc(db, "chats", chatId, "typing", receiverId);
  onSnapshot(typingRef, (docSnap) => {
    if (docSnap.exists()) {
      typingStatus.textContent = docSnap.data().isTyping ? "Typing..." : "";
    }
  });
}
