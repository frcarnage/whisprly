// /scripts/auth.js
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
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Save UID in session
const storeSession = (uid) => sessionStorage.setItem('uid', uid);
const getSessionUID = () => sessionStorage.getItem('uid');

// Login
export async function loginUser(email, password) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  storeSession(userCred.user.uid);

  // Check user doc exists
  const docRef = doc(db, 'users', userCred.user.uid);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    throw new Error("User document not found.");
  }
  return userCred.user;
}

// Signup
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
    createdAt: Date.now(),
    followers: [],
    following: [],
    posts: [],
  };

  await setDoc(doc(db, "users", uid), userDoc);
  storeSession(uid);
  return uid;
}

// Logout
export function logoutUser() {
  sessionStorage.clear();
  return signOut(auth);
}

// Check login status
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
