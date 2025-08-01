// js/chat.js
import { db, auth } from './firebase-init.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentUser;

auth.onAuthStateChanged(user => {
  if (user) currentUser = user;
});

// Load all chats for current user
export async function loadChats() {
  if (!currentUser) return;

  const chatListEl = document.getElementById('chatList');
  chatListEl.innerHTML = '';

  const q = query(collection(db, 'chats'), where('participants', 'array-contains', currentUser.uid));
  const snapshot = await getDocs(q);

  snapshot.forEach(async docSnap => {
    const chatData = docSnap.data();
    const otherUID = chatData.participants.find(uid => uid !== currentUser.uid);
    const userSnap = await getDoc(doc(db, 'users', otherUID));
    const otherUser = userSnap.data();

    const chatItem = document.createElement('div');
    chatItem.classList.add('chat-item');
    chatItem.innerHTML = `
      <img src="${otherUser.profilePic}" class="avatar">
      <div class="chat-info">
        <strong>${otherUser.username}</strong>
        <span>Tap to open chat</span>
      </div>
    `;
    chatItem.addEventListener('click', () => {
      window.location.href = `chat-detail.html?chatId=${docSnap.id}`;
    });

    chatListEl.appendChild(chatItem);
  });
}

// Load chat messages in chat-detail.html
export function loadChatDetail(chatId) {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  const chatMessages = document.getElementById('chatMessages');
  chatMessages.innerHTML = '';

  onSnapshot(q, async (snapshot) => {
    chatMessages.innerHTML = '';

    for (const docSnap of snapshot.docs) {
      const msg = docSnap.data();
      const isMine = msg.senderId === currentUser.uid;

      const msgEl = document.createElement('div');
      msgEl.classList.add('chat-msg', isMine ? 'sent' : 'received');
      msgEl.textContent = msg.text;
      chatMessages.appendChild(msgEl);
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  // Load chat user name
  getDoc(doc(db, 'chats', chatId)).then(chatSnap => {
    const chatData = chatSnap.data();
    const otherUID = chatData.participants.find(uid => uid !== currentUser.uid);
    getDoc(doc(db, 'users', otherUID)).then(userSnap => {
      document.getElementById('chatUserName').textContent = userSnap.data().username;
    });
  });
}

// Send message
export async function sendMessage(chatId, text) {
  const message = {
    text,
    senderId: currentUser.uid,
    timestamp: serverTimestamp(),
  };

  await addDoc(collection(db, 'chats', chatId, 'messages'), message);
  document.getElementById('messageInput').value = '';
}
