// /scripts/login-page.js
import { loginUser } from './auth.js';

const form = document.getElementById('login-form');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    try {
      await loginUser(email, password);
      window.location.href = "/home.html"; // ✅ Redirect on success
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  });
}
