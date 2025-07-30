import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { app } from './firebase-init.js';

const db = getFirestore(app);

const usersTableBody = document.getElementById("users-table-body");

async function loadUsers() {
  const usersSnapshot = await getDocs(collection(db, "users"));
  usersTableBody.innerHTML = "";

  usersSnapshot.forEach((docSnap) => {
    const user = docSnap.data();
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${user.uid}</td>
      <td>${user.username || "Anonymous"}</td>
      <td>${user.email || "-"}</td>
      <td>${user.isBanned ? "Banned" : "Active"}</td>
      <td>
        <button onclick="toggleBan('${user.uid}', ${user.isBanned})">
          ${user.isBanned ? "Unban" : "Ban"}
        </button>
      </td>
    `;

    usersTableBody.appendChild(row);
  });
}

window.toggleBan = async function(uid, isBanned) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { isBanned: !isBanned });
  alert(`User has been ${!isBanned ? "banned" : "unbanned"}.`);
  loadUsers();
};

loadUsers();
