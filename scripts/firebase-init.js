// /scripts/firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAGJntf2pacqzkhyvj7P80NsNQkSAGX29g",
  authDomain: "whisprly-5415a.firebaseapp.com",
  databaseURL: "https://whisprly-5415a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "whisprly-5415a",
  storageBucket: "whisprly-5415a.firebasestorage.app",
  messagingSenderId: "269867240239",
  appId: "1:269867240239:web:377d0a7c3d1c3870c7efda",
  measurementId: "G-2CXWX5ZWH5
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
