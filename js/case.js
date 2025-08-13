import { auth, db, rtdb } from './firebaseconfig.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { ref, onValue, push, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const urlParams = new URLSearchParams(window.location.search);
const caseId = urlParams.get("id");

// DOM refs
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

let currentAdminId = null;
let currentAdminEmail = null;
let currentAdminName = null;

backBtn.addEventListener("click", () => {
  window.location.href = "admin-dashboard.html";
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "admin-login.html";
});

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
  currentAdminEmail = user.email;
  currentAdminName = userDoc.data().name || user.email.split("@")[0];

  loadCaseData();
  loadMessages();

  sendBtn.addEventListener("click", () => {
    const text = messageInput.value.trim();
    if (!text) return;

    const msgRef = ref(rtdb, `support_cases/${caseId}/messages`);
    const type = sendAsSystemCheckbox.checked ? "system" : "admin";

    push(msgRef, {
      senderId: currentAdminId,
      senderEmail: currentAdminEmail,
      senderName: currentAdminName,
      senderRole: "admin",
      text,
      timestamp: Date.now(),
      type
    });

    messageInput.value = "";
    sendAsSystemCheckbox.checked = false;
  });

  updateStatusBtn.addEventListener("click", () => {
    const newStatus = statusSelect.value;
    update(ref(rtdb, `support_cases/${caseId}`), { status: newStatus });
  });

  assignSelfBtn.addEventListener("click", () => {
    update(ref(rtdb, `support_cases/${caseId}`), {
      assignedTo: currentAdminId,
      status: "assigned"
    });
    const msgRef = ref(rtdb, `support_cases/${caseId}/messages`);
    push(msgRef, {
      senderId: currentAdminId,
      senderEmail: currentAdminEmail,
      senderName: currentAdminName,
      senderRole: "admin",
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
    caseStatus.textContent = data.status;
    caseStatus.className = "status-badge " + (data.status || "").toLowerCase();
    statusSelect.value = data.status;
  });
}

function loadMessages() {
  const msgRef = ref(rtdb, `support_cases/${caseId}/messages`);
  onValue(msgRef, (snapshot) => {
    chatBox.innerHTML = "";
    const data = snapshot.val();
    if (!data) {
      chatBox.innerHTML = "<p>No messages yet.</p>";
      return;
    }

    // Sort chronologically
    Object.values(data)
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach(msg => {
        const bubble = document.createElement("div");

        // SYSTEM message
        if (msg.type === "system") {
          bubble.className = "message system";
          bubble.textContent = msg.text;
        }
        // My own messages
        else if (msg.senderId === currentAdminId) {
          bubble.className = "message user";
          bubble.innerHTML = `<strong>You:</strong> ${msg.text}`;
        }
        // Other admin
        else if (msg.senderRole === "admin") {
          const label = msg.senderName || msg.senderEmail?.split("@")[0] || "Admin";
          bubble.className = "message other";
          bubble.innerHTML = `<strong>Admin (${label}):</strong> ${msg.text}`;
        }
        // Customer
        else {
          const label = msg.senderName || msg.senderEmail?.split("@")[0] || "Customer";
          bubble.className = "message other";
          bubble.innerHTML = `<strong>${label}:</strong> ${msg.text}`;
        }

        chatBox.appendChild(bubble);
      });

    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}
