import { auth, db } from './firebase-init.js';
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dmfnzqs0q/image/upload";
const CLOUDINARY_PRESET = "whisprly";

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_PRESET);
  const res = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  return data.secure_url;
}

window.signup = async function signup() {
  const fullName = document.getElementById("fullName").value.trim();
  const dob = document.getElementById("dob").value;
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value.trim().toLowerCase();
  const file = document.getElementById("profilePhoto").files[0];
  const message = document.getElementById("message");

  if (!fullName || !dob || !email || !password || !username || !file) {
    message.innerText = "All fields are required.";
    return;
  }

  try {
    message.innerText = "Creating account...";
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const photoUrl = await uploadToCloudinary(file);

    const userDoc = {
      uid,
      fullName,
      dob,
      email,
      username,
      profilePic: photoUrl,
      bio: "",
      followers: [],
      following: [],
      isVerified: false,
      createdAt: serverTimestamp()
    };

    await setDoc(doc(db, "users", uid), userDoc);

    message.innerText = "Account created successfully! Redirecting...";
    window.location.href = "/home.html";
  } catch (error) {
    message.innerText = error.message;
  }
};
