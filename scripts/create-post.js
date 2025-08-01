import { db, auth } from "./firebase-init.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Cloudinary config
const cloudName = "dxzv3lzbg";
const uploadPreset = "whisprly";

const submitBtn = document.getElementById("submitPost");

submitBtn.addEventListener("click", async () => {
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const imageFile = document.getElementById("image").files[0];

  if (!title || !content) {
    alert("Please fill in all fields.");
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;

      let imageUrl = "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", uploadPreset);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        imageUrl = data.secure_url;
      }

      const postData = {
        postId: `${uid}_${Date.now()}`,
        userId: uid,
        title,
        content,
        imageUrl,
        createdAt: serverTimestamp(),
        likes: [],
        commentsCount: 0,
        isEdited: false,
        isDeleted: false,
      };

      try {
        await addDoc(collection(db, "posts"), postData);
        alert("Post created successfully!");
        window.location.href = "home.html";
      } catch (err) {
        console.error("Error posting:", err);
        alert("Failed to create post.");
      }
    } else {
      alert("You must be logged in to post.");
      window.location.href = "login.html";
    }
  });
});
