import { auth, db } from "./firebase-init.js";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const chatTitle = document.getElementById("chatTitle");
const chatUserPic = document.getElementById("chatUserPic");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesContainer = document.getElementById("messagesContainer");

let currentUser;
let selectedUserId;
let selectedUser;
let chatId;

onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "/login.html");
  currentUser = user;

  const urlParams = new URLSearchParams(window.location.search);
  selectedUserId = urlParams.get("uid");
  if (!selectedUserId) return alert("No user selected for chat");

  // Get selected user's profile info
  const userDocRef = doc(db, "users", selectedUserId);
  const userDoc = await getDoc(userDocRef);
  if (!userDoc.exists()) return alert("User not found");

  selectedUser = userDoc.data();
  chatTitle.innerText = selectedUser.username || selectedUser.fullName || "Chat";
  chatUserPic.src = selectedUser.profilePic || "/default.png";

  // Setup chat between two users (combine uids to form unique chatId)
  const combinedId = [currentUser.uid, selectedUserId].sort().join("_");
  chatId = combinedId;

  // Ensure chat document exists
  await setDoc(
    doc(db, "chats", chatId),
    {
      participants: [currentUser.uid, selectedUserId],
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  listenToMessages();
});

// Listen to messages in real-time
function listenToMessages() {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const messagesQuery = query(messagesRef, orderBy("timestamp"));

  onSnapshot(messagesQuery, (snapshot) => {
    messagesContainer.innerHTML = "";
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const msgDiv = document.createElement("div");
      msgDiv.classList.add("message");
      msgDiv.classList.add(msg.senderId === currentUser.uid ? "sent" : "received");
      msgDiv.innerHTML = `
        <div class="msg-bubble">
          <p>${msg.text}</p>
          <span class="timestamp">${formatTimestamp(msg.timestamp)}</span>
        </div>
      `;
      messagesContainer.appendChild(msgDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  });
}

// Send message
sendBtn.addEventListener("click", async () => {
  const text = messageInput.value.trim();
  if (text === "") return;

  await addDoc(collection(db, "chats", chatId, "messages"), {
    senderId: currentUser.uid,
    receiverId: selectedUserId,
    text,
    timestamp: serverTimestamp(),
  });

  messageInput.value = "";
});

function formatTimestamp(ts) {
  if (!ts) return "";
  const date = ts.toDate();
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
}
