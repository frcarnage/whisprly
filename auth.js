// auth.js (for user login)

import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');

loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  errorMsg.textContent = '';

  if (!email || !password) {
    errorMsg.textContent = 'Please fill in both fields.';
    return;
  }

  try {
    // Sign in
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Optional: Fetch user document to verify existence in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      errorMsg.textContent = 'No profile found. Please sign up first.';
      return;
    }

    // ✅ Redirect to home
    window.location.href = 'home.html';

  } catch (error) {
    console.error(error);
    errorMsg.textContent = error.message;
  }
});
