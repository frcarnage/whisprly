import { getFirestore, collection, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-lite.js";
import { app } from "./firebase-init.js";

const db = getFirestore(app);

async function loadStats() {
  const userSnap = await getCountFromServer(collection(db, "users"));
  const postSnap = await getCountFromServer(collection(db, "posts"));
  const reportSnap = await getCountFromServer(collection(db, "reports"));

  document.getElementById("userCount").innerText = `Total Users: ${userSnap.data().count}`;
  document.getElementById("postCount").innerText = `Total Posts: ${postSnap.data().count}`;
  document.getElementById("reportCount").innerText = `Pending Reports: ${reportSnap.data().count}`;
}

window.onload = () => {
  loadStats();
};
