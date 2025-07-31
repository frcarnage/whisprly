import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { firebaseConfig } from "./firebase-init.js";

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch & Display Reports
async function loadReports() {
  const tableBody = document.querySelector("#reportsTable tbody");
  tableBody.innerHTML = "";

  const reportsRef = collection(db, "reports");
  const snapshot = await getDocs(reportsRef);

  const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  reports.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

  for (const report of reports) {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${report.reporterId}</td>
      <td>${report.reportedUserId}</td>
      <td>${report.type}</td>
      <td>${report.type === "post" ? report.postId : "-"}</td>
      <td>${report.reason}</td>
      <td>${report.description}</td>
      <td>${report.status}</td>
      <td>${report.timestamp?.toDate ? report.timestamp.toDate().toLocaleString() : "-"}</td>
      <td>
        <button onclick="updateStatus('${report.id}', 'resolved')">✅</button>
        <button onclick="updateStatus('${report.id}', 'rejected')">❌</button>
      </td>
    `;

    tableBody.appendChild(row);
  }
}

// Update Report Status
window.updateStatus = async (reportId, newStatus) => {
  const reportDoc = doc(db, "reports", reportId);
  await updateDoc(reportDoc, { status: newStatus });
  alert(`Report marked as ${newStatus}`);
  loadReports();
};

// Load reports on page load
loadReports();
