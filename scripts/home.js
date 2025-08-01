import { auth, db } from './firebase-init.js';
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Navigate function for button clicks
window.goTo = function (path) {
  window.location.href = path;
};

// Function to render a single post
function renderPost(postData, username) {
  const container = document.getElementById("postContainer");

  const postEl = document.createElement("div");
  postEl.className = "post";

  postEl.innerHTML = `
    <h3>@${username}</h3>
    <p>${postData.content}</p>
    <time>${new Date(postData.timestamp?.seconds * 1000 || Date.now()).toLocaleString()}</time>
  `;

  container.appendChild(postEl);
}

// Function to load posts from Firestore
async function loadPosts() {
  const postsRef = collection(db, "posts");
  const q = query(postsRef, orderBy("timestamp", "desc"));
  const querySnapshot = await getDocs(q);

  for (const docSnap of querySnapshot.docs) {
    const post = docSnap.data();

    let username = "Unknown";
    try {
      const userDoc = await getDoc(doc(db, "users", post.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        username = userData.username || "Anonymous";
      }
    } catch (e) {
      console.error("Failed to get user for post:", e);
    }

    renderPost(post, username);
  }
}

// Auth check
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadPosts();
  } else {
    window.location.href = "login.html";
  }
});
