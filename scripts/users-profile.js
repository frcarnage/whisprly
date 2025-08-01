import { db, auth } from "./firebase-init.js";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Get user ID from query param
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("uid");

if (!userId) {
  alert("User not found!");
}

// Fetch user data
const userRef = doc(db, "users", userId);
const userSnap = await getDoc(userRef);

if (userSnap.exists()) {
  const userData = userSnap.data();
  document.getElementById("profile-pic").src = userData.profilePic || "/assets/avatar.png";
  document.getElementById("username").textContent = "@" + userData.username;
  document.getElementById("fullname").textContent = userData.fullName || "Unknown";
  document.getElementById("followers-count").textContent = userData.followers?.length || 0;
  document.getElementById("following-count").textContent = userData.following?.length || 0;

  if (userData.isVerified) {
    document.getElementById("verified-icon").style.display = "inline-block";
  }

  // Load user's posts
  const postsQuery = query(
    collection(db, "posts"),
    where("userId", "==", userId)
  );

  const postsSnap = await getDocs(postsQuery);
  const postsContainer = document.getElementById("posts-container");
  postsSnap.forEach(doc => {
    const post = doc.data();
    const postElement = document.createElement("div");
    postElement.innerHTML = `
      <h4>${post.title}</h4>
      <p>${post.content}</p>
    `;
    postsContainer.appendChild(postElement);
  });
}

// Buttons
document.getElementById("follow-btn").addEventListener("click", () => {
  alert("Follow feature will be added.");
});

document.getElementById("message-btn").addEventListener("click", () => {
  window.location.href = `/chat.html?uid=${userId}`;
});

document.getElementById("more-btn").addEventListener("click", () => {
  const action = prompt("Options:\n1. Report\n2. Block");
  if (action === "1") alert("Reported!");
  else if (action === "2") alert("Blocked!");
});
