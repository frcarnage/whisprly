import { auth, db } from './firebase-init.js';
import {
  doc, getDoc, updateDoc, onSnapshot, arrayUnion, arrayRemove,
  collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const uid = urlParams.get('uid');

// UI references
const profilePic = document.getElementById('profilePic');
const usernameEl = document.getElementById('username');
const nameEl = document.getElementById('name');
const bioEl = document.getElementById('bio');
const followersCountEl = document.getElementById('followersCount');
const followingCountEl = document.getElementById('followingCount');
const followBtn = document.getElementById('followBtn');
const messageBtn = document.getElementById('messageBtn');
const userPosts = document.getElementById('userPosts');

let currentUser;
let viewedUser;

// 🔹 Fetch and show user profile
async function loadUserProfile() {
  if (!uid) {
    alert("User ID not found in URL");
    return;
  }

  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists()) {
      alert("User not found");
      return;
    }

    viewedUser = { uid, ...userDoc.data() };

    profilePic.src = viewedUser.profilePic || "https://via.placeholder.com/80";
    usernameEl.textContent = viewedUser.username || "unknown";
    nameEl.textContent = viewedUser.name || "";
    bioEl.textContent = viewedUser.bio || "";

    // Count followers & following
    followersCountEl.textContent = viewedUser.followers?.length || 0;
    followingCountEl.textContent = viewedUser.following?.length || 0;

    // 🔹 Check current user to show Follow or Message button
    auth.onAuthStateChanged(user => {
      if (user) {
        currentUser = user;
        if (currentUser.uid === uid) {
          followBtn.style.display = "none";
          messageBtn.style.display = "none";
        } else {
          updateFollowButton();
          followBtn.style.display = "inline-block";
          messageBtn.style.display = "inline-block";
        }
      }
    });

    loadUserPosts();
  } catch (err) {
    console.error("Error loading profile:", err);
  }
}

// 🔹 Follow/Unfollow logic
async function toggleFollow() {
  if (!currentUser || !viewedUser) return;

  const myRef = doc(db, "users", currentUser.uid);
  const theirRef = doc(db, "users", viewedUser.uid);

  const isFollowing = viewedUser.followers?.includes(currentUser.uid);

  try {
    if (isFollowing) {
      await updateDoc(myRef, { following: arrayRemove(viewedUser.uid) });
      await updateDoc(theirRef, { followers: arrayRemove(currentUser.uid) });
    } else {
      await updateDoc(myRef, { following: arrayUnion(viewedUser.uid) });
      await updateDoc(theirRef, { followers: arrayUnion(currentUser.uid) });
    }
  } catch (err) {
    console.error("Follow/unfollow failed:", err);
  }
}

// 🔹 Update follow button text
function updateFollowButton() {
  const isFollowing = viewedUser.followers?.includes(currentUser.uid);
  followBtn.textContent = isFollowing ? "Unfollow" : "Follow";
}

// 🔹 Show user's posts
async function loadUserPosts() {
  try {
    const q = query(collection(db, "posts"), where("userId", "==", uid));
    const snapshot = await getDocs(q);
    userPosts.innerHTML = "";

    if (snapshot.empty) {
      userPosts.innerHTML = "<p>No posts yet.</p>";
      return;
    }

    snapshot.forEach(docSnap => {
      const post = docSnap.data();
      const postDiv = document.createElement("div");
      postDiv.innerHTML = `
        <img src="${post.imageUrl || 'https://via.placeholder.com/200'}" alt="Post" style="width: 100%; border-radius: 12px;">
        <p style="font-weight: bold;">${post.title || ""}</p>
      `;
      userPosts.appendChild(postDiv);
    });
  } catch (err) {
    console.error("Error loading user posts:", err);
  }
}

// 🔹 Handle button clicks
followBtn.addEventListener("click", toggleFollow);
messageBtn.addEventListener("click", () => {
  if (viewedUser && currentUser) {
    window.location.href = `chat.html?uid=${viewedUser.uid}`;
  }
});

// 🔹 Listen to real-time changes
onSnapshot(doc(db, "users", uid), (docSnap) => {
  if (docSnap.exists()) {
    viewedUser = { uid, ...docSnap.data() };
    followersCountEl.textContent = viewedUser.followers?.length || 0;
    followingCountEl.textContent = viewedUser.following?.length || 0;
    if (currentUser) updateFollowButton();
  }
});

window.addEventListener("DOMContentLoaded", loadUserProfile);
