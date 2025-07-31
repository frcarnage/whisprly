import { auth, db } from './firebase-init.js';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      // Create the user document if it doesn't exist
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: "", // Can be updated later
        bio: "",
        profilePicUrl: "",
        createdAt: new Date().toISOString(),
      });
    }

    window.location.href = "/home.html"; // Redirect to main feed/dashboard
  } catch (error) {
    alert(`Login failed: ${error.message}`);
  }
});
