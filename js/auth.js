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
  const password = passwordInput.value; // password trimmed if you want: .trim()

  if (!email || !password) {
    errorMsg.textContent = 'Please fill in both fields.';
    resetButton();
    return;
  }

  if (email !== 'vinitjha2712@gmail.com') {
    errorMsg.textContent = 'Unauthorized: Only admins can log in.';
    resetButton();
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userSnap = await getDoc(doc(db, 'users', user.uid));
    if (!userSnap.exists()) {
      throw new Error('User record not found.');
    }

    const { role } = userSnap.data();
    if (role !== 'admin') {
      throw new Error('Access denied. Admins only.');
    }

    // Redirect to admin dashboard
    window.location.href = 'admin-dashboard.html';

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
