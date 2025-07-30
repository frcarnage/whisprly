import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

const ADMIN_UID = "zFyUd81jkaevJ3NLXFbvV0heRop2";

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (!user || user.uid !== ADMIN_UID) {
    window.location.href = "/admin/login.html";
  }
});
