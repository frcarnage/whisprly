// scripts/firebase-init.js

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGJntf2pacqzkhyvj7P80NsNQkSAGX29g",
  authDomain: "whisprly-5415a.firebaseapp.com",
  databaseURL: "https://whisprly-5415a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "whisprly-5415a",
  storageBucket: "whisprly-5415a.appspot.com", // ✅ CORRECTED
  messagingSenderId: "269867240239",
  appId: "1:269867240239:web:377d0a7c3d1c3870c7efda",
  measurementId: "G-2CXWX5ZWH5"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
