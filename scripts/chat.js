import { db, auth } from './firebase-init.js';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const chatList = document.getElementById("chatList");
const searchInput = document.getElementById("searchInput");

let currentUser = null;
let followers = [];

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await loadFollowers();
    renderChatList();
  } else {
    window.location.href = "/login.html";
  }
});

// 🔹 Load user's followers to show who they can chat with
async function loadFollowers() {
  try {
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    if (userDoc.exists()) {
      followers = userDoc.data().following || []; // You can also use .followers if you prefer
    }
  } catch (err) {
    console.error("Error loading followers:", err);
  }
}

// 🔹 Load and render chat list (followers only)
async function renderChatList() {
  chatList.innerHTML = "";

  if (followers.length === 0) {
    chatList.innerHTML = "<p style='text-align:center;'>You are not following anyone yet.</p>";
    return;
  }

  for (const uid of followers) {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const user = userDoc.data();
      const userItem = document.createElement("div");

      userItem.className = "chat-item";
      userItem.style = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
      `;

      userItem.innerHTML = `
        <img src="${user.profilePic || 'https://via.placeholder.com/40'}"
             alt="Profile"
             style="width: 45px; height: 45px; border-radius: 50%;" />

        <div style="flex-grow: 1;">
          <div style="font-weight: bold;">${user.username || "User"}</div>
          <div style="font-size: 0.9rem; color: gray;">Tap to chat</div>
        </div>
      `;

      userItem.onclick = () => {
        window.location.href = `chat-detail.html?uid=${uid}`;
      };

      chatList.appendChild(userItem);
    }
  }
}

// 🔍 Live search from followers
searchInput.addEventListener("input", () => {
  const searchValue = searchInput.value.toLowerCase();
  const items = document.querySelectorAll(".chat-item");

  items.forEach(item => {
    const name = item.querySelector("div").textContent.toLowerCase();
    item.style.display = name.includes(searchValue) ? "flex" : "none";
  });
});
