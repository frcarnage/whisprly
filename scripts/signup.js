import { auth, db } from './firebase-init.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create Firestore user document
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      name,
      bio: "",
      profilePicUrl: "",
      createdAt: new Date().toISOString(),
    });

    window.location.href = "/home.html"; // Redirect to home/feed
  } catch (error) {
    alert(`Signup failed: ${error.message}`);
  }
});
