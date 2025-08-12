// auth.js (v10 modular)

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
    // Sign in
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check role in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      throw new Error('User record not found.');
    }

    const userData = userSnap.data();
    if (userData.role !== 'admin') {
      throw new Error('Access denied. Admins only.');
    }

    // Redirect to admin dashboard
    window.location.href = 'admin-dashboard.html';

  } catch (error) {
    console.error(error);
    errorMsg.textContent = error.message;
  }
});
