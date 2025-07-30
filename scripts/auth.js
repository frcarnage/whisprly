import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { app } from "./firebase-init.js";

const auth = getAuth(app);
const adminUID = "zFyUd81jkaevJ3NLXFbvV0heRop2";

onAuthStateChanged(auth, (user) => {
  if (!user || user.uid !== adminUID) {
    window.location.href = "/admin/login.html";
  }
});

window.logout = () => {
  signOut(auth).then(() => {
    window.location.href = "/admin/login.html";
  });
};
