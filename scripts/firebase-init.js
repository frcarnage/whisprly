// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Helper: Check if admin is logged in
function checkAdmin(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user?.uid === "zFyUd81jkaevJ3NLXFbvV0heRop2") {
      callback(user);
    } else {
      window.location.href = "/admin/login";
    }
  });
}

// Helper: Sign out
function logout() {
  signOut(auth).then(() => {
    window.location.href = "/admin/login";
  });
}

// Export for use in admin panel
export {
  app,
  auth,
  db,
  checkAdmin,
  logout,
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc
};
