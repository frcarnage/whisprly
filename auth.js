// auth.js
import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('loginError'); // Make sure you have <p id="loginError">

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.textContent = '';
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!email || !password) {
    errorMsg.textContent = 'Please fill in both fields.';
    return;
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Optional: Check Firestore profile exists
    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      errorMsg.textContent = 'No profile found. Please sign up first.';
      return;
    }
    window.location.href = 'home.html';
  } catch (error) {
    errorMsg.textContent = error.message;
  }
});
