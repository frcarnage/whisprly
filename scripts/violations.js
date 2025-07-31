import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { firebaseConfig } from "./firebase-init.js";

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Load Reviewed Violations
async function loadViolations() {
  const tableBody = document.querySelector("#violationsTable tbody");
  tableBody.innerHTML = "";

  const reportsRef = collection(db, "reports");
  const q = query(
    reportsRef,
    where("status", "!=", "pending"),
    orderBy("status"),
    orderBy("timestamp", "desc")
  );

  const snapshot = await getDocs(q);
  const violations = snapshot.docs.map(doc => doc.data());

  for (const v of violations) {
    const row = document.createElement("tr");

    const timestamp = v.timestamp?.toDate?.() || null;
    const readableTime = timestamp
      ? new Date(timestamp).toLocaleString()
      : "-";

    row.innerHTML = `
      <td>${v.reportedUserId}</td>
      <td>${v.type}</td>
      <td>${v.reason}</td>
      <td style="color: ${v.status === 'resolved' ? 'green' : 'orange'}">
        ${v.status}
      </td>
      <td>${readableTime}</td>
    `;

    tableBody.appendChild(row);
  }
}

// Run on page load
loadViolations();
