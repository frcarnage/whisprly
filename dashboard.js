import { getAuth, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getDatabase, ref, onValue } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { app } from "./firebaseconfig.js"; // if you export `app` there

const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

const casesTable = document.getElementById("casesTable");

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "admin-login.html";
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "admin-login.html";
    return;
  }

  // Verify admin role
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists() || userDoc.data().role !== "admin") {
    await signOut(auth);
    window.location.href = "admin-login.html";
    return;
  }

  loadCases();
});

function loadCases() {
  const casesRef = ref(rtdb, "support_cases");
  onValue(casesRef, (snapshot) => {
    casesTable.innerHTML = "";
    const data = snapshot.val();
    if (!data) {
      casesTable.innerHTML = "<tr><td colspan='6'>No cases found</td></tr>";
      return;
    }

    Object.values(data).forEach(caseItem => {
      const tr = document.createElement("tr");

      const createdAt = caseItem.createdAt
        ? new Date(caseItem.createdAt).toLocaleString()
        : "N/A";

      tr.innerHTML = `
        <td>${caseItem.caseId || ""}</td>
        <td>${caseItem.reason || ""}</td>
        <td>${caseItem.status || ""}</td>
        <td>${caseItem.assignedTo || "-"}</td>
        <td>${createdAt}</td>
        <td><button class="viewBtn" data-id="${caseItem.caseId}">View</button></td>
      `;

      casesTable.appendChild(tr);
    });

    document.querySelectorAll(".viewBtn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        window.location.href = `case.html?id=${id}`;
      });
    });
  });
}
