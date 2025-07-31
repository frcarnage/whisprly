import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";
import { app } from "./firebaseConfig.js";

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Elements
const postsContainer = document.getElementById("postsContainer");
const createPostBtn = document.getElementById("createPostBtn");
const postModal = document.getElementById("postModal");
const closeModal = document.querySelector(".close");
const submitPostBtn = document.getElementById("submitPostBtn");

createPostBtn.onclick = () => postModal.style.display = "flex";
closeModal.onclick = () => postModal.style.display = "none";
window.onclick = (e) => {
  if (e.target === postModal) postModal.style.display = "none";
};

// Load Posts
async function loadPosts() {
  postsContainer.innerHTML = "";
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  snapshot.forEach((doc) => {
    const post = doc.data();
    const postDiv = document.createElement("div");
    postDiv.className = "post";
    postDiv.innerHTML = `
      <strong>${post.username || "Unknown User"}</strong><br/>
      <p>${post.content || ""}</p>
      ${post.imageUrl ? `<img src="${post.imageUrl}" />` : ""}
      <small>${post.createdAt?.toDate().toLocaleString() || ""}</small>
    `;
    postsContainer.appendChild(postDiv);
  });
}

// Submit Post
submitPostBtn.onclick = async () => {
  const content = document.getElementById("postContent").value.trim();
  const imageFile = document.getElementById("postImage").files[0];
  if (!content && !imageFile) return alert("Add text or image.");

  const user = auth.currentUser;
  if (!user) return alert("Not logged in.");

  let imageUrl = null;

  if (imageFile) {
    const imageRef = storageRef(storage, `posts/${user.uid}_${Date.now()}`);
    await uploadBytes(imageRef, imageFile);
    imageUrl = await getDownloadURL(imageRef);
  }

  await addDoc(collection(db, "posts"), {
    uid: user.uid,
    username: user.displayName || user.email || "Anonymous",
    content,
    imageUrl,
    createdAt: serverTimestamp()
  });

  postModal.style.display = "none";
  document.getElementById("postContent").value = "";
  document.getElementById("postImage").value = "";
  loadPosts();
};

// Load after auth
onAuthStateChanged(auth, (user) => {
  if (!user) {
    location.href = "login.html";
  } else {
    loadPosts();
  }
});
