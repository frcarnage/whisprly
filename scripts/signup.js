// /scripts/signup.js
import { auth, db } from './firebase-init.js';
import {
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Function called when signup button is clicked
window.signup = async function () {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await setDoc(doc(db, "users", uid), {
      uid: uid,
      email: email,
      bio: "",
      name: "",
      username: "",
      profileImageUrl: "",
      followers: [],
      following: [],
      createdAt: serverTimestamp()
    });

    alert("Signup successful ✅");
    window.location.href = "/home.html"; // or wherever
  } catch (error) {
    console.error("Signup error ❌", error);
    alert(error.message);
  }
}
