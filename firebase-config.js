// firebase-config.js

// Import Firebase SDK modules (if using module bundler like Vite/webpack)
// If using <script> tags in HTML, skip imports
// import firebase from "firebase/app";
// import "firebase/auth";
// import "firebase/firestore";
// import "firebase/storage";

// ✅ Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGJntf2pacqzkhyvj7P80NsNQkSAGX29g",
  authDomain: "whisprly-5415a.firebaseapp.com",
  databaseURL: "https://whisprly-5415a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "whisprly-5415a",
  storageBucket: "whisprly-5415a.firebasestorage.app",
  messagingSenderId: "269867240239",
  appId: "1:269867240239:web:377d0a7c3d1c3870c7efda",
  measurementId: "G-2CXWX5ZWH5"
};

// ✅ Initialize Firebase only once (avoids duplicate initialization errors)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // use existing app
}

// ✅ References
const auth = firebase.auth();         // Authentication
const db = firebase.firestore();      // Firestore Database
const rtdb = firebase.database();     // Realtime Database
const storage = firebase.storage();   // Cloud Storage (if needed)

// ✅ Export for use in other files
// If using ES modules:
// export { auth, db, rtdb, storage };
