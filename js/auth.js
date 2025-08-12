// /js/auth.js (Firebase v10 Modular)

import { auth, db } from './firebaseconfig.js';
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
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch role from Firestore
    const userSnap = await getDoc(doc(db, 'users', user.uid));
    if (!userSnap.exists()) {
      throw new Error('User record not found.');
    }

    const { role } = userSnap.data();
    if (role !== 'admin') {
      throw new Error('Access denied. Admins only.');
    }

    // Redirect to dashboard
    window.location.href = 'admin-dashboard.html';

  } catch (error) {
    console.error(error);
    errorMsg.textContent = error.message;
  }
});
