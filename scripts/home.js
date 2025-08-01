import { db } from './firebase-init.js';
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const postContainer = document.getElementById('postContainer');

async function loadPosts() {
  try {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    postContainer.innerHTML = ""; // Clear existing posts

    if (querySnapshot.empty) {
      postContainer.innerHTML = "<p>No posts yet. Be the first to share something!</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const post = doc.data();

      const postDiv = document.createElement("div");
      postDiv.className = "post";

      const createdAt = post.createdAt?.toDate?.().toLocaleString() ?? "Unknown";

      postDiv.innerHTML = `
        <h3>${post.title ?? "Untitled Post"}</h3>
        <p>${post.content ?? ""}</p>
        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post Image" style="max-width:100%;border-radius:10px;margin-top:10px;">` : ""}
        <p><small>Likes: ${post.likes?.length ?? 0} | Comments: ${post.commentsCount ?? 0}</small></p>
        <time>${createdAt}</time>
      `;

      postContainer.appendChild(postDiv);
    });

  } catch (error) {
    console.error("Error loading posts:", error);
    postContainer.innerHTML = `<p>Error loading posts. Check console for details.</p>`;
  }
}

window.addEventListener("DOMContentLoaded", loadPosts);
