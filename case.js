import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getDatabase, ref, onValue, push, update, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const auth = getAuth();
const db = getFirestore();
const rtdb = getDatabase();

const urlParams = new URLSearchParams(window.location.search);
const caseId = urlParams.get("id");

const caseTitle = document.getElementById("caseTitle");
const caseStatus = document.getElementById("caseStatus");
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");

document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "admin-dashboard.html";
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
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

  loadCaseData();
  loadMessages();

  // Send message
  document.getElementById("sendBtn").addEventListener("click", () => {
    const text = messageInput.value.trim();
    if (!text) return;
    const msgRef = ref(rtdb, `support_cases/${caseId}/messages`);
    push(msgRef, {
      senderId: user.uid,
      text,
      timestamp: Date.now(),
      type: "admin"
    });
    messageInput.value = "";
  });

  // Update status
  document.getElementById("updateStatusBtn").addEventListener("click", () => {
    const newStatus = document.getElementById("statusSelect").value;
    update(ref(rtdb, `support_cases/${caseId}`), { status: newStatus });
  });

  // Assign to self
  document.getElementById("assignSelfBtn").addEventListener("click", () => {
    update(ref(rtdb, `support_cases/${caseId}`), {
      assignedTo: user.uid,
      status: "assigned"
    });
    const messagesRef = ref(rtdb, `support_cases/${caseId}/messages`);
    push(messagesRef, {
      senderId: user.uid,
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
    document.getElementById("statusSelect").value = data.status;
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
        const p = document.createElement("p");
        if (msg.type === "system") {
          p.innerHTML = `<em>${msg.text}</em>`;
        } else if (msg.type === "admin") {
          p.innerHTML = `<b>Admin:</b> ${msg.text}`;
        } else {
          p.innerHTML = `<b>User:</b> ${msg.text}`;
        }
        chatBox.appendChild(p);
      });
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}
