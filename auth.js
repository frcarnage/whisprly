// auth.js

// LOGIN
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = "home.html"; // Redirect to home page
      })
      .catch((error) => {
        document.getElementById("loginError").innerText = error.message;
      });
  });
}

// SIGNUP
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fullName = document.getElementById("signupFullName").value;
    const username = document.getElementById("signupUsername").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Save user info to Firestore
        return db.collection("users").doc(user.uid).set({
          uid: user.uid,
          fullName: fullName,
          username: username,
          email: email,
          profilePicUrl: "",
          bio: "",
          followers: [],
          following: [],
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      })
      .then(() => {
        window.location.href = "home.html"; // Redirect to home page
      })
      .catch((error) => {
        document.getElementById("signupError").innerText = error.message;
      });
  });
}

// REDIRECT IF LOGGED IN
auth.onAuthStateChanged((user) => {
  const currentPath = window.location.pathname;

  if (user && (currentPath.includes("login.html") || currentPath.includes("signup.html") || currentPath === "/")) {
    // If logged in and on auth pages, go to home
    window.location.href = "home.html";
  }

  if (!user && currentPath.includes("home.html")) {
    // If not logged in and on home, go to login
    window.location.href = "login.html";
  }
});
