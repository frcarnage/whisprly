import { auth, db } from './firebase-init.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Save UID in session
const storeSession = (uid) => sessionStorage.setItem('uid', uid);
const getSessionUID = () => sessionStorage.getItem('uid');

// ==================
// LOGIN
// ==================
export async function loginUser(email, password) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  storeSession(userCred.user.uid);

  // Check Firestore doc exists
  const docRef = doc(db, 'users', userCred.user.uid);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    throw new Error("User document not found.");
  }
  return userCred.user;
}

// ==================
// SIGNUP (with Cloudinary Image URL)
// ==================
export async function signupUser({ email, password, name, username, dob, profilePic }) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCred.user.uid;

  const userDoc = {
    uid,
    email,
    name,
    username,
    dob,
    bio: "",
    profilePic,
    createdAt: serverTimestamp(),
    followers: [],
    following: [],
    posts: [],
  };

  await setDoc(doc(db, "users", uid), userDoc);
  storeSession(uid);
  return uid;
}

// ==================
// LOGOUT
// ==================
export function logoutUser() {
  sessionStorage.clear();
  return signOut(auth);
}

// ==================
// AUTH STATE CHECK
// ==================
export function checkAuthState(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      storeSession(user.uid);
      callback(true, user.uid);
    } else {
      callback(false, null);
    }
  });
}

// ==================
// CLOUDINARY UPLOAD HANDLER
// ==================
export function initCloudinaryWidget() {
  const uploadBtn = document.getElementById("upload_widget");
  const picUrlInput = document.getElementById("profile-pic-url");
  const uploadStatus = document.getElementById("upload-status");

  if (!uploadBtn || !picUrlInput || !uploadStatus) return;

  let uploadedImageUrl = "";

  uploadBtn.addEventListener("click", function () {
    cloudinary.openUploadWidget(
      {
        cloudName: "dmfnzqs0q",       // 🔁 Replace with your Cloudinary cloud name
        uploadPreset: "whisprly",        // 🔁 Replace with your unsigned preset
        multiple: false,
        cropping: true,
        sources: ["local", "url", "camera"],
        folder: "whisprly_profiles",
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          uploadedImageUrl = result.info.secure_url;
          picUrlInput.value = uploadedImageUrl;
          uploadStatus.textContent = "✅ Image uploaded successfully!";
        } else if (error) {
          console.error("Upload failed:", error);
          uploadStatus.textContent = "❌ Upload failed. Try again.";
        }
      }
    );
  });
}
