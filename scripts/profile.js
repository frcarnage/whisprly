import { auth, db } from './firebase-init.js';
import { doc, getDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "login.html");

  const uid = user.uid;

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    document.getElementById("fullname").textContent = data.fullName;
    document.getElementById("username").textContent = "@" + data.username;
    document.getElementById("bio").textContent = data.bio || '';
    document.getElementById("pfp").src = data.profilePicUrl || 'https://via.placeholder.com/120';
  }

  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where("creatorId", "==", uid));
  const postSnap = await getDocs(q);

  const grid = document.getElementById("postGrid");
  postSnap.forEach(doc => {
    const post = doc.data();
    const img = document.createElement("img");
    img.src = post.imageUrl;
    grid.appendChild(img);
  });
});
