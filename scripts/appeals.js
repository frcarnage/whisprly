import {
  db,
  checkAdmin,
  collection,
  getDocs,
  doc,
  updateDoc
} from "../firebase/firebase-init.js";

const tableBody = document.getElementById("appeals-table-body");

checkAdmin(async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "appeals"));

    querySnapshot.forEach((docSnap) => {
      const appeal = docSnap.data();
      const id = docSnap.id;

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${appeal.userId}</td>
        <td>${appeal.message}</td>
        <td>${appeal.status || "pending"}</td>
        <td>
          <select data-id="${id}" class="status-selector">
            <option value="pending" ${appeal.status === "pending" ? "selected" : ""}>Pending</option>
            <option value="reviewed" ${appeal.status === "reviewed" ? "selected" : ""}>Reviewed</option>
            <option value="reinstated" ${appeal.status === "reinstated" ? "selected" : ""}>Reinstated</option>
            <option value="rejected" ${appeal.status === "rejected" ? "selected" : ""}>Rejected</option>
          </select>
        </td>
      `;

      tableBody.appendChild(row);
    });

    // Handle status change
    document.querySelectorAll(".status-selector").forEach((selector) => {
      selector.addEventListener("change", async (e) => {
        const id = e.target.getAttribute("data-id");
        const newStatus = e.target.value;

        await updateDoc(doc(db, "appeals", id), {
          status: newStatus,
        });

        alert(`Appeal ${id} status updated to ${newStatus}`);
      });
    });

  } catch (err) {
    console.error("Error loading appeals:", err);
    tableBody.innerHTML = `<tr><td colspan="4">Failed to load appeals.</td></tr>`;
  }
});
