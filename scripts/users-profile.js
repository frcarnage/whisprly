import { db, auth } from './firebase-init.js';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const uid = new URLSearchParams(window.location.search).get("uid");
const loading = document.getElementById("loading");
const profileContent = document.getElementById("profileContent");

const profilePic = document.getElementById("profilePic");
const username = document.getElementById("username");
const fullName = document.getElementById("fullName");
const bio = document.getElementById("bio");
const followersCount = document.getElementById("followersCount");
const followingCount = document.getElementById("followingCount");
const verifiedBadge = document.getElementById("verifiedBadge");
const followBtn = document.getElementById("followBtn");
const messageBtn = document.getElementById("messageBtn");
const userPosts = document.getElementById("userPosts");

let currentUser;

onAuthStateChanged(auth, async (user) => {
  if (user && uid) {
    currentUser = user;
    await loadUserProfile(uid);
  } else {
    window.location.href = "/login.html";
  }
});

async function loadUserProfile(userId) {
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (!docSnap.exists()) {
      loading.innerText = "User not found.";
      return;
    }

    const data = docSnap.data();

    profilePic.src = data.profilePic || "https://via.placeholder.com/100";
    username.innerText = data.username || "";
    fullName.innerText = data.fullName || "";
    bio.innerText = data.bio || "";
    followersCount.innerText = data.followers?.length || 0;
    followingCount.innerText = data.following?.length || 0;

    if (data.isVerified) {
      verifiedBadge.innerHTML = `<img src="verified.png" style="width: 16px; vertical-align: middle;" />`;
    } else {
      verifiedBadge.innerHTML = "";
    }

    // 🔹 Set Follow / Unfollow
    if (currentUser.uid === userId) {
      followBtn.style.display = "none";
      messageBtn.style.display = "none";
    } else {
      const currentUserSnap = await getDoc(doc(db, "users", currentUser.uid));
      const currentUserData = currentUserSnap.data();
      const isFollowing = currentUserData.following?.includes(userId);

      followBtn.innerText = isFollowing ? "Unfollow" : "Follow";
      followBtn.style.display = "inline-block";
      followBtn.onclick = async () => {
        await toggleFollow(userId, isFollowing);
      };

      messageBtn.style.display = "inline-block";
      messageBtn.onclick = () => {
        window.location.href = `/chat-detail.html?uid=${userId}`;
      };
    }

    await loadPostsByUser(userId);

    loading.style.display = "none";
    profileContent.style.display = "block";
  } catch (e) {
    console.error("Error loading profile:", e);
    loading.innerText = "Something went wrong.";
  }
}

async function toggleFollow(targetUid, isFollowing) {
  const userRef = doc(db, "users", currentUser.uid);
  const targetRef = doc(db, "users", targetUid);

  const currentSnap = await getDoc(userRef);
  const targetSnap = await getDoc(targetRef);

  if (!currentSnap.exists() || !targetSnap.exists()) return;

  const currentData = currentSnap.data();
  const targetData = targetSnap.data();

  const newFollowing = isFollowing
    ? currentData.following.filter((id) => id !== targetUid)
    : [...(currentData.following || []), targetUid];

  const newFollowers = isFollowing
    ? targetData.followers.filter((id) => id !== currentUser.uid)
    : [...(targetData.followers || []), currentUser.uid];

  await Promise.all([
    updateDoc(userRef, { following: newFollowing }),
    updateDoc(targetRef, { followers: newFollowers }),
  ]);

  location.reload();
}

async function loadPostsByUser(userId) {
  const q = query(collection(db, "posts"), where("userId", "==", userId));
  const snap = await getDocs(q);
  userPosts.innerHTML = "";

  snap.forEach((doc) => {
    const data = doc.data();
    const div = document.createElement("div");
    div.style = "margin: 10px 0; padding: 10px; border: 1px solid #ccc;";
    div.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.content}</p>
      ${data.imageUrl ? `<img src="${data.imageUrl}" style="max-width: 100%;" />` : ""}
    `;
    userPosts.appendChild(div);
  });

  if (snap.empty) {
    userPosts.innerHTML = "<p style='text-align:center;'>No posts yet.</p>";
  }
}
