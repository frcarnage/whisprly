import { signupUser } from './auth.js';

const form = document.getElementById('signup-form');
const profilePicInput = document.getElementById('profilePic');

let uploadedPicUrl = "";

profilePicInput.addEventListener("change", async () => {
  const file = profilePicInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "whisprly");

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/dmfnzqs0q/image/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    uploadedPicUrl = data.secure_url;
    alert("Profile picture uploaded!");
  } catch (error) {
    console.error("Cloudinary Upload Failed:", error);
    alert("Failed to upload image");
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const name = document.getElementById('name').value.trim();
  const username = document.getElementById('username').value.trim();
  const dob = document.getElementById('dob').value;

  if (!uploadedPicUrl) {
    alert("Please upload a profile picture first.");
    return;
  }

  try {
    await signupUser({ email, password, name, username, dob, profilePic: uploadedPicUrl });
    window.location.href = "/home.html";
  } catch (err) {
    console.error(err);
    alert("Signup failed: " + err.message);
  }
});
