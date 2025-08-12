// Auth for admin login
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  if (!email || !password) {
    errorMsg.textContent = "Please fill all fields.";
    return;
  }

  try {
    // Firebase login
    const userCred = await signInWithEmailAndPassword(auth, email, password);

    // Check role in Firestore
    const userDoc = await getDoc(doc(db, "users", userCred.user.uid));

    if (!userDoc.exists()) {
      throw new Error("No user record found.");
    }

    const role = userDoc.data().role || "user";
    if (role !== "admin") {
      await auth.signOut();
      throw new Error("Access denied. Admins only.");
    }

    // Go to admin dashboard
    window.location.href = "admin-dashboard.html";

  } catch (error) {
    errorMsg.textContent = error.message;
  }
});
