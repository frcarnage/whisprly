import { auth, db } from './firebase-init.js';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  addDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Parse UID from URL
const urlParams = new URLSearchParams(window.location.search);
const profileUid = urlParams.get('uid');

if (!profileUid) {
  alert("User not found.");
  window.location.href = "home.html";
}

const usernameEl = document.getElementById('username');
const profilePicEl = document.getElementById('profilePic');
const bioEl = document.getElementById('bio');
const followBtn = document.getElementById('followBtn');
const messageBtn = document.getElementById('messageBtn');
const userPostsEl = document.getElementById('userPosts');
const optionsBtn = document.getElementById('optionsBtn');
const optionsMenu = document.getElementById('optionsMenu');
const reportBtn = document.getElementById('reportBtn');
const blockBtn = document.getElementById('blockBtn');
const verifiedBadge = document.getElementById('verifiedBadge');

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please login first.");
    window.location.href = "/login.html";
    return;
  }

  currentUser = user;

  if (currentUser.uid === profileUid) {
    followBtn.style.display = "none";
    messageBtn.style.display = "none";
    optionsBtn.style.display = "none";
  }

  await loadUserProfile();
  await checkFollowStatus();
  loadUserPosts();
});

// Load profile data
async function loadUserProfile() {
  const userDoc = await getDoc(doc(db, "users", profileUid));
  if (userDoc.exists()) {
    const userData = userDoc.data();
    usernameEl.textContent = userData.username || "No Name";
    profilePicEl.src = userData.profilePic || "./assets/default-avatar.png";
    bioEl.textContent = userData.bio || "";

    if (userData.isVerified) {
      verifiedBadge.style.display = "inline";
    }
  }
}

// Follow / Unfollow
async function checkFollowStatus() {
  const currentUserDoc = await getDoc(doc(db, "users", currentUser.uid));
  const currentData = currentUserDoc.data();
  const isFollowing = currentData.following?.includes(profileUid);

  followBtn.textContent = isFollowing ? "Unfollow" : "Follow";

  followBtn.onclick = async () => {
    const currentRef = doc(db, "users", currentUser.uid);
    const targetRef = doc(db, "users", profileUid);

    if (isFollowing) {
      // Unfollow logic
      await updateDoc(currentRef, {
        following: currentData.following.filter(uid => uid !== profileUid)
      });
      const targetDoc = await getDoc(targetRef);
      const targetData = targetDoc.data();
      await updateDoc(targetRef, {
        followers: targetData.followers.filter(uid => uid !== currentUser.uid)
      });
      followBtn.textContent = "Follow";
    } else {
      // Follow logic
      await updateDoc(currentRef, {
        following: arrayUnion(profileUid)
      });
      await updateDoc(targetRef, {
        followers: arrayUnion(currentUser.uid)
      });
      followBtn.textContent = "Unfollow";
    }
  };
}

// Load user posts
async function loadUserPosts() {
  const q = query(
    collection(db, "posts"),
    where("uid", "==", profileUid)
  );
  const querySnapshot = await getDocs(q);
  userPostsEl.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const post = doc.data();
    const postEl = document.createElement("img");
    postEl.src = post.imageUrl;
    postEl.alt = "Post Image";
    postEl.style.width = "100%";
    postEl.style.borderRadius = "10px";
    userPostsEl.appendChild(postEl);
  });
}

// Message / Create Chat
messageBtn.addEventListener("click", async () => {
  const chatsRef = collection(db, "chats");
  const q = query(chatsRef, where("participants", "array-contains", currentUser.uid));
  const snapshot = await getDocs(q);

  let existingChat = null;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.participants.includes(profileUid)) {
      existingChat = doc.id;
    }
  });

  if (existingChat) {
    window.location.href = `chat.html?chatId=${existingChat}`;
  } else {
    const chatDoc = await addDoc(chatsRef, {
      participants: [currentUser.uid, profileUid],
      createdAt: serverTimestamp(),
    });
    window.location.href = `chat.html?chatId=${chatDoc.id}`;
  }
});

// Options Menu (⋮)
optionsBtn.onclick = () => {
  optionsMenu.style.display = optionsMenu.style.display === "block" ? "none" : "block";
};

window.addEventListener("click", (e) => {
  if (!optionsBtn.contains(e.target) && !optionsMenu.contains(e.target)) {
    optionsMenu.style.display = "none";
  }
});

// Report
reportBtn.onclick = async () => {
  const reportRef = collection(db, "reports");
  await addDoc(reportRef, {
    type: "user",
    reporterId: currentUser.uid,
    reportedId: profileUid,
    timestamp: serverTimestamp()
  });
  alert("User reported.");
  optionsMenu.style.display = "none";
};

// Block
blockBtn.onclick = async () => {
  const userRef = doc(db, "users", currentUser.uid);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();

  await updateDoc(userRef, {
    blocked: arrayUnion(profileUid)
  });

  alert("User blocked.");
  optionsMenu.style.display = "none";
};
