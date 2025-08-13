import { auth, db, rtdb } from './firebaseconfig.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { ref, onValue, push, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const urlParams = new URLSearchParams(window.location.search);
const caseId = urlParams.get("id");

const caseTitle = document.getElementById("caseTitle");
const caseStatus = document.getElementById("caseStatus");
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");

const backBtn = document.getElementById("backBtn");
const logoutBtn = document.getElementById("logoutBtn");
const sendBtn = document.getElementById("sendBtn");
const updateStatusBtn = document.getElementById("updateStatusBtn");
const assignSelfBtn = document.getElementById("assignSelfBtn");
const statusSelect = document.getElementById("statusSelect");
const sendAsSystemCheckbox = document.getElementById("sendAsSystem");

// Back navigation
backBtn.addEventListener("click", () => {
  window.location.href = "admin-dashboard.html";
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "admin-login.html";
});

let currentAdminId = null;

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

  currentAdminId = user.uid;

  loadCaseData();
  loadMessages();

  // Send message
  sendBtn.addEventListener("click", () => {
    const text = messageInput.value.trim();
    if (!text) return;

    const msgRef = ref(rtdb, `support_cases/${caseId}/messages`);
    const type = sendAsSystemCheckbox.checked ? "system" : "admin";

    push(msgRef, {
      senderId: currentAdminId,
      text,
      timestamp: Date.now(),
      type
    });
    messageInput.value = "";
    sendAsSystemCheckbox.checked = false;
  });

  // Update case status
  updateStatusBtn.addEventListener("click", () => {
    const newStatus = statusSelect.value;
    update(ref(rtdb, `support_cases/${caseId}`), { status: newStatus });
  });

  // Assign case to me
  assignSelfBtn.addEventListener("click", () => {
    update(ref(rtdb, `support_cases/${caseId}`), {
      assignedTo: currentAdminId,
      status: "assigned"
    });
    const messagesRef = ref(rtdb, `support_cases/${caseId}/messages`);
    push(messagesRef, {
      senderId: currentAdminId,
      text: "Admin has joined the chat.",
      timestamp: Date.now(),
      type: "system"
    });
  });
});

function loadCaseData() {
  const caseRef = ref(rtdb, `support_cases/${caseId}`);
  onValue(caseRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    caseTitle.textContent = `Case: ${data.caseId}`;

    // Apply status badge styling
    caseStatus.textContent = data.status;
    caseStatus.className = "status-badge " + (data.status || "").toLowerCase();

    statusSelect.value = data.status;
  });
}

function loadMessages() {
  const messagesRef = ref(rtdb, `support_cases/${caseId}/messages`);
  onValue(messagesRef, (snapshot) => {
    chatBox.innerHTML = "";
    const data = snapshot.val();
    if (!data) {
      chatBox.innerHTML = "<p>No messages yet.</p>";
      return;
    }

    Object.values(data)
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach(msg => {
        const div = document.createElement("div");

        // SYSTEM messages
        if (msg.type === "system") {
          div.className = "message system";
          div.textContent = msg.text;
        }
        // This admin's own messages
        else if (msg.senderId === currentAdminId) {
          div.className = "message user";
          div.textContent = msg.text;
        }
        // Other messages (users or other admins)
        else {
          div.className = "message other";
          div.textContent = msg.text;
        }

        chatBox.appendChild(div);
      });

    chatBox.scrollTop = chatBox.scrollHeight;
  });
}
