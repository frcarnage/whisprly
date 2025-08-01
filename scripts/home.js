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

// 🔹 Get user data using userId from post
async function getUser(userId) {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? { uid: userId, ...userSnap.data() } : null;
  } catch (err) {
    console.error("Error fetching user:", err);
    return null;
  }
}

// 🔹 Load and render all posts
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
        border: 1px solid #ddd;
        padding: 1rem;
        margin-bottom: 1.5rem;
        border-radius: 12px;
        background: #ffffff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      `;

      postDiv.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 1rem;">
          <img src="${user?.profilePic || 'https://via.placeholder.com/40'}"
               alt="Profile"
               style="width: 42px; height: 42px; border-radius: 50%; margin-right: 0.75rem; cursor: pointer;"
               onclick="window.location.href='users-profile.html?uid=${user?.uid}'" />

          <span onclick="window.location.href='users-profile.html?uid=${user?.uid}'"
                style="font-weight: bold; font-size: 1rem; cursor: pointer;">
            ${user?.username || "Unknown User"}
            ${user?.isVerified ? `<img src="verified.png" alt="verified" style="width: 16px; height: 16px; margin-left: 4px;">` : ""}
          </span>
        </div>

        <h3 style="margin: 0 0 0.5rem;">${post.title || ""}</h3>
        <p style="margin: 0 0 1rem;">${post.content || ""}</p>

        ${post.imageUrl
          ? `<img src="${post.imageUrl}" alt="Post Image"
                  style="max-width: 100%; border-radius: 10px; margin-top: 0.75rem; margin-bottom: 1rem;">`
          : ""
        }

        <div style="font-size: 0.9rem; color: #555;">
          ❤️ ${post.likes?.length || 0} Likes &nbsp;&nbsp; 💬 ${post.commentsCount || 0} Comments
        </div>

        <time style="font-size: 0.8rem; color: gray;">
          ${post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleString() : ""}
        </time>
      `;

      postContainer.appendChild(postDiv);
    }

  } catch (error) {
    console.error("❌ Error loading posts:", error);
    postContainer.innerHTML = `<p style="color:red;">Error loading posts. Check console for details.</p>`;
  }
}

window.addEventListener("DOMContentLoaded", loadPosts);
