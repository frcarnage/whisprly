// /scripts/login.js

export async function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorMsg = document.getElementById('error-msg');

  try {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Check for specific admin UID
    if (user.uid === 'zFyUd81jkaevJ3NLXFbvV0heRop2') {
      sessionStorage.setItem('adminUID', user.uid);
      window.location.href = '/admin-pannel/dashboard.html';
    } else {
      firebase.auth().signOut();
      errorMsg.textContent = 'Access denied. You are not the admin.';
    }
  } catch (err) {
    errorMsg.textContent = 'Invalid credentials. Please try again.';
    console.error(err.message);
  }
}
