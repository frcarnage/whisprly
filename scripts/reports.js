import {
  db,
  checkAdmin,
  collection,
  getDocs,
  doc,
  updateDoc
} from "../firebase/firebase-init.js";

const tableBody = document.getElementById("reports-table-body");

checkAdmin(async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "reports"));

    querySnapshot.forEach((docSnap) => {
      const report = docSnap.data();
      const id = docSnap.id;

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${report.type}</td>
        <td>${report.reportedUserId || "-"}</td>
        <td>${report.postId || "-"}</td>
        <td>${report.reason}</td>
        <td>${report.description}</td>
        <td>${report.reporterId}</td>
        <td>${report.status}</td>
        <td>
          <select data-id="${id}" class="status-selector">
            <option value="pending" ${report.status === "pending" ? "selected" : ""}>Pending</option>
            <option value="reviewed" ${report.status === "reviewed" ? "selected" : ""}>Reviewed</option>
            <option value="actioned" ${report.status === "actioned" ? "selected" : ""}>Actioned</option>
          </select>
        </td>
      `;

      tableBody.appendChild(row);
    });

    // Handle status changes
    document.querySelectorAll(".status-selector").forEach((selector) => {
      selector.addEventListener("change", async (e) => {
        const id = e.target.getAttribute("data-id");
        const newStatus = e.target.value;

        await updateDoc(doc(db, "reports", id), {
          status: newStatus,
        });

        alert(`Report ${id} status updated to ${newStatus}`);
      });
    });

  } catch (err) {
    console.error("Error loading reports:", err);
    tableBody.innerHTML = `<tr><td colspan="8">Failed to load reports.</td></tr>`;
  }
});
