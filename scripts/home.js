import { db } from './firebase-init.js';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const postContainer = document.getElementById('postContainer');

// Get user data using userId from post
async function getUser(userId) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? { uid: userId, ...userSnap.data() } : null;
}

// Load and render posts
async function loadPosts() {
  try {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    postContainer.innerHTML = ""; // Clear previous posts

    if (querySnapshot.empty) {
      postContainer.innerHTML = "<p>No posts yet. Be the first to share something!</p>";
      return;
    }

    for (const docSnap of querySnapshot.docs) {
      const post = docSnap.data();
      const user = await getUser(post.userId);

      const postDiv = document.createElement("div");
      postDiv.className = "post";
      postDiv.style = `
        border: 1px solid #ccc;
        padding: 1rem;
        margin-bottom: 1.5rem;
        border-radius: 10px;
        background: #fff;
      `;

      postDiv.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 1rem; cursor: pointer;">
          <img src="${user?.profilePic || 'https://via.placeholder.com/40'}"
               alt="Profile Picture"
               style="width: 40px; height: 40px; border-radius: 50%; margin-right: 0.8rem;"
               onclick="window.location.href='users-profile.html?uid=${user?.uid}'" />
          <strong onclick="window.location.href='users-profile.html?uid=${user?.uid}'"
                  style="font-size: 1rem;">${user?.username || "Unknown User"}</strong>
        </div>

        <h3>${post.title || ""}</h3>
        <p>${post.content || ""}</p>

        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post Image" style="max-width:100%; border-radius:10px; margin-top:1rem;">` : ""}

        <p style="margin-top: 0.5rem;">
          <small>❤️ ${post.likes?.length || 0} Likes | 💬 ${post.commentsCount || 0} Comments</small>
        </p>
        <time style="font-size: 0.8rem; color: gray;">
          ${post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleString() : ""}
        </time>
      `;

      postContainer.appendChild(postDiv);
    }

  } catch (error) {
    console.error("Error loading posts:", error);
    postContainer.innerHTML = `<p>Error loading posts. Check console for details.</p>`;
  }
}

// Load posts after DOM loads
window.addEventListener("DOMContentLoaded", loadPosts);
