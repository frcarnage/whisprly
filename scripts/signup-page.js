// /scripts/signup-page.js
import { signupUser } from './auth.js';

const form = document.getElementById('signup-form');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    try {
      await signupUser(email, password);
      window.location.href = "/home.html";
    } catch (err) {
      alert("Signup failed: " + err.message);
    }
  });
}
