import { db, auth } from './firebase-init.js';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import {
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

const chatListEl = document.getElementById("chatList");
const noChatsEl = document.getElementById("noChats");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await loadChats(user.uid);
  } else {
    window.location.href = "/login.html";
  }
});

async function loadChats(uid) {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", uid)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    noChatsEl.style.display = "block";
    return;
  }

  for (const docSnap of snap.docs) {
    const chatData = docSnap.data();
    const chatId = docSnap.id;

    const otherUserId = chatData.participants.find(id => id !== auth.currentUser.uid);
    const otherUserSnap = await getDoc(doc(db, "users", otherUserId));
    const otherUser = otherUserSnap.data();

    const lastMessageSnap = await getDoc(doc(db, "chats", chatId, "messages", "last"));
    const lastMessage = lastMessageSnap.exists() ? lastMessageSnap.data().text : "Start chatting";

    const chatItem = document.createElement("div");
    chatItem.className = "chat-item";
    chatItem.onclick = () => {
      window.location.href = `/chat-detail.html?uid=${otherUserId}`;
    };

    chatItem.innerHTML = `
      <img src="${otherUser.profilePic || 'https://via.placeholder.com/100'}" alt="Profile" />
      <div class="chat-details">
        <div class="chat-name">${otherUser.username || 'User'}</div>
        <div class="chat-last-message">${lastMessage}</div>
      </div>
    `;

    chatListEl.appendChild(chatItem);
  }
}
