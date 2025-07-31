import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, deleteDoc, doc, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { app } from './firebase-init.js';

const db = getFirestore(app);
const postsTableBody = document.getElementById("posts-table-body");

async function loadPosts() {
  const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(postsQuery);
  postsTableBody.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const post = docSnap.data();
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${docSnap.id}</td>
      <td>${post.authorUsername || "Unknown"}</td>
      <td>${post.content?.slice(0, 80)}</td>
      <td>
        ${post.imageUrl ? `<img src="${post.imageUrl}" alt="img" width="50"/>` : "—"}
      </td>
      <td>${post.createdAt?.toDate().toLocaleString()}</td>
      <td>${post.likes?.length || 0}</td>
      <td>${post.commentCount || 0}</td>
      <td><button onclick="deletePost('${docSnap.id}')">Delete</button></td>
    `;

    postsTableBody.appendChild(row);
  });
}

window.deletePost = async function(postId) {
  const confirmDelete = confirm("Are you sure you want to delete this post?");
  if (!confirmDelete) return;

  await deleteDoc(doc(db, "posts", postId));
  alert("Post deleted.");
  loadPosts();
};

loadPosts();
