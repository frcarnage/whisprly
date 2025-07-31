<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Whisprly — Signup</title>
  <link rel="stylesheet" href="styles/auth.css" />
  <script src="https://upload-widget.cloudinary.com/global/all.js" type="text/javascript"></script>
</head>
<body>
  <div class="auth-container">
    <img src="assets/logo.png" alt="Whisprly Logo" class="auth-logo" />

    <h2>Create Account</h2>
    <form id="signup-form">
      <input type="text" id="name" placeholder="Full Name" required />
      <input type="text" id="username" placeholder="Username" required />
      <input type="email" id="email" placeholder="Email" required />
      <input type="password" id="password" placeholder="Password" required />
      <input type="date" id="dob" required />

      <div class="upload-section">
        <button type="button" id="upload_widget">Upload Profile Picture</button>
        <p id="upload-status">No image uploaded</p>
        <input type="hidden" id="profile-pic-url" />
      </div>

      <button type="submit">Create Profile</button>
      <p id="signup-error" class="error-msg"></p>
    </form>

    <p>Already have an account? <a href="login.html">Log in</a></p>
  </div>

  <script type="module">
    import { signupUser, initCloudinaryWidget } from './scripts/auth.js';

    initCloudinaryWidget();

    const form = document.getElementById('signup-form');
    const errorEl = document.getElementById('signup-error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.textContent = '';

      const name = document.getElementById('name').value.trim();
      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const dob = document.getElementById('dob').value;
      const profilePic = document.getElementById('profile-pic-url').value;

      if (!profilePic) {
        errorEl.textContent = "Please upload a profile picture.";
        return;
      }

      try {
        await signupUser({ name, username, email, password, dob, profilePic });
        window.location.href = 'home.html';
      } catch (err) {
        console.error(err);
        errorEl.textContent = err.message || "Signup failed. Please try again.";
      }
    });
  </script>
</body>
</html>
