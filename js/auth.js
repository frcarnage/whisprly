import { auth, db } from './firebaseconfig.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// Disable right-click context menu on entire page
document.addEventListener('contextmenu', event => event.preventDefault());

loginBtn.addEventListener('click', async () => {
  errorMsg.textContent = '';
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value; // optionally .trim()

  if (!email || !password) {
    errorMsg.textContent = 'Please fill in both fields.';
    resetButton();
    return;
  }

  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch user record to get role
    const userSnap = await getDoc(doc(db, 'users', user.uid));
    if (!userSnap.exists()) {
      throw new Error('User record not found.');
    }

    const { role } = userSnap.data();

    // Role-based redirect
    if (role === 'admin') {
      window.location.href = 'admin-dashboard.html';   // Admin panel
    } else if (role === 'user') {
      window.location.href = 'home.html';              // Normal user home
    } else {
      throw new Error('Access denied. Unrecognized role.');
    }

  } catch (error) {
    console.error(error);
    errorMsg.textContent = error.message || 'Login failed. Please try again.';
    resetButton();
  }
});

function resetButton() {
  loginBtn.disabled = false;
  loginBtn.textContent = 'Login';
}
