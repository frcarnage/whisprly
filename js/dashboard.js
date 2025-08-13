import { auth, db, rtdb } from './firebaseconfig.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const casesTable = document.getElementById("casesTable");

// ===== Logout =====
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "admin-login.html";
});

// ===== Auth guard =====
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "admin-login.html";
    return;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (!userDoc.exists() || userDoc.data().role !== "admin") {
    await signOut(auth);
    window.location.href = "admin-login.html";
    return;
  }

  loadCases();
});

// ===== Load & Render Cases =====
function loadCases() {
  const casesRef = ref(rtdb, "support_cases");

  onValue(casesRef, (snapshot) => {
    casesTable.innerHTML = "";
    if (!snapshot.exists()) {
      casesTable.innerHTML = `<tr><td colspan='6' style="text-align:center;color:#888;">No cases found</td></tr>`;
      return;
    }

    const data = snapshot.val();
    let casesArray = [];

    Object.entries(data).forEach(([key, caseItem]) => {
      const id = caseItem.caseId || key;
      let createdAt = typeof caseItem.createdAt === "number" ? caseItem.createdAt : null;
      casesArray.push({ ...caseItem, caseId: id, createdAt });
    });

    // Sort priority: open & unassigned first, then newest
    casesArray.sort((a, b) => {
      const aPri = a.status === 'open' && (!a.assignedTo || !a.assignedTo.trim()) ? 1 : 0;
      const bPri = b.status === 'open' && (!b.assignedTo || !b.assignedTo.trim()) ? 1 : 0;
      if (aPri !== bPri) return bPri - aPri;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    // Render each case row
    casesArray.forEach(caseItem => {
      const tr = document.createElement("tr");

      // Date formatting
      const createdAtDisplay = caseItem.createdAt
        ? new Date(caseItem.createdAt).toLocaleString()
        : "N/A";

      // Status badge with colors
      const status = (caseItem.status || "").toLowerCase();
      let statusClass = "";
      if (status === "open") statusClass = "status-badge open";
      else if (status === "assigned") statusClass = "status-badge assigned";
      else if (status === "resolved") statusClass = "status-badge resolved";

      // Assigned display
      const assignedDisplay = caseItem.assignedTo && caseItem.assignedTo.trim() !== ""
        ? caseItem.assignedTo
        : "<span style='color:#aaa;'>—</span>";

      tr.innerHTML = `
        <td>${caseItem.caseId}</td>
        <td>${caseItem.reason || ""}</td>
        <td><span class="${statusClass}">${caseItem.status || ""}</span></td>
        <td>${assignedDisplay}</td>
        <td>${createdAtDisplay}</td>
        <td>
          <button class="action-btn view-btn" data-id="${caseItem.caseId}">View</button>
        </td>
      `;

      casesTable.appendChild(tr);
    });

    // Action handlers
    document.querySelectorAll(".view-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        window.location.href = `case.html?id=${id}`;
      });
    });
  });
}
