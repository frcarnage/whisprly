// src/firebase.js

// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Firebase config for your Whisprly project
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

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and Authentication service instances
const database = getDatabase(app);
const auth = getAuth(app);

// Export initialized services for use in your admin panel
export { app, database, auth };
