import { auth, db, rtdb } from './firebaseconfig.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const casesTable = document.getElementById("casesTable");

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "admin-login.html";
});

// Auth check
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "admin-login.html";
    return;
  }

  // Firestore role check
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists() || userDoc.data().role !== "admin") {
    await signOut(auth);
    window.location.href = "admin-login.html";
    return;
  }

  // Load all cases
  loadCases();
});

function loadCases() {
  const casesRef = ref(rtdb, "support_cases");

  onValue(casesRef, (snapshot) => {
    casesTable.innerHTML = "";
    if (!snapshot.exists()) {
      casesTable.innerHTML = "<tr><td colspan='6'>No cases found</td></tr>";
      return;
    }

    const data = snapshot.val();

    Object.entries(data).forEach(([key, caseItem]) => {
      const tr = document.createElement("tr");

      let createdAt = "N/A";
      if (typeof caseItem.createdAt === "number") {
        createdAt = new Date(caseItem.createdAt).toLocaleString();
      }

      tr.innerHTML = `
        <td>${caseItem.caseId || key}</td>
        <td>${caseItem.reason || ""}</td>
        <td>${caseItem.status || ""}</td>
        <td>${caseItem.assignedTo || "-"}</td>
        <td>${createdAt}</td>
        <td><button class="viewBtn" data-id="${key}">View</button></td>
      `;

      casesTable.appendChild(tr);
    });

    // Attach listeners
    document.querySelectorAll(".viewBtn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        window.location.href = `case.html?id=${id}`;
      });
    });
  });
}
