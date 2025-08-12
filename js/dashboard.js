// /js/dashboard.js

import { auth, db, rtdb } from './firebaseconfig.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const casesTable = document.getElementById("casesTable");

// ============================
// Logout button handler
// ============================
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "admin-login.html";
});

// ============================
// Auth state listener
// ============================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "admin-login.html";
    return;
  }

  // Check if logged-in user is admin via Firestore
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists() || userDoc.data().role !== "admin") {
    await signOut(auth);
    window.location.href = "admin-login.html";
    return;
  }

  // Load cases for admin
  loadCases();
});

// ============================
// Load and render cases
// ============================
function loadCases() {
  const casesRef = ref(rtdb, "support_cases");

  onValue(casesRef, (snapshot) => {
    casesTable.innerHTML = "";
    if (!snapshot.exists()) {
      casesTable.innerHTML = "<tr><td colspan='6'>No cases found</td></tr>";
      return;
    }

    const data = snapshot.val();
    let casesArray = [];

    // Convert object to array with key as fallback caseId
    Object.entries(data).forEach(([key, caseItem]) => {
      const id = caseItem.caseId || key;
      let createdAt = null;
      if (typeof caseItem.createdAt === "number") {
        createdAt = caseItem.createdAt;
      }
      casesArray.push({
        ...caseItem,
        caseId: id,
        createdAt: createdAt
      });
    });

    // Sort — open/unassigned first, then newest date
    casesArray.sort((a, b) => {
      // First: open/unassigned at top
      const aPriority = (a.status === 'open' && (!a.assignedTo || a.assignedTo === "")) ? 1 : 0;
      const bPriority = (b.status === 'open' && (!b.assignedTo || b.assignedTo === "")) ? 1 : 0;
      if (aPriority !== bPriority) return bPriority - aPriority;

      // Then: newest first
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    // Render rows
    casesArray.forEach(caseItem => {
      const tr = document.createElement("tr");

      let createdAtDisplay = "N/A";
      if (caseItem.createdAt) {
        createdAtDisplay = new Date(caseItem.createdAt).toLocaleString();
      }

      tr.innerHTML = `
        <td>${caseItem.caseId}</td>
        <td>${caseItem.reason || ""}</td>
        <td>${caseItem.status || ""}</td>
        <td>${caseItem.assignedTo && caseItem.assignedTo.trim() !== "" ? caseItem.assignedTo : "-"}</td>
        <td>${createdAtDisplay}</td>
        <td>
          <button class="viewBtn" data-id="${caseItem.caseId}">View</button>
        </td>
      `;

      casesTable.appendChild(tr);
    });

    // Attach button listeners
    document.querySelectorAll(".viewBtn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        window.location.href = `case.html?id=${id}`;
      });
    });
  });
}
