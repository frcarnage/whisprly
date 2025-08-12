<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Support Case</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div class="case-container">
    <button id="backBtn">⬅ Back to Dashboard</button>
    <button id="logoutBtn">Logout</button>

    <h2 id="caseTitle">Case: Loading...</h2>
    <p>Status: <span id="caseStatus">Loading...</span></p>

    <label for="statusSelect">Change Status:</label>
    <select id="statusSelect">
      <option value="open">Open</option>
      <option value="assigned">Assigned</option>
      <option value="resolved">Resolved</option>
      <option value="closed">Closed</option>
    </select>
    <button id="updateStatusBtn">Update Status</button>
    <button id="assignSelfBtn">Assign to Me</button>

    <h3>Chat</h3>
    <div id="chatBox" style="border:1px solid #ccc; padding:10px; height:200px; overflow-y:auto;">
      Loading messages...
    </div>
    <input type="text" id="messageInput" placeholder="Type a message...">
    <button id="sendBtn">Send</button>
  </div>

  <script type="module">
    import { app } from './js/firebaseconfig.js';
    import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
    import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
    import { getDatabase, ref, onValue, push, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

    const auth = getAuth(app);
    const db = getFirestore(app);
    const rtdb = getDatabase(app);

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
          timestamp: { ".sv": "timestamp" },
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
          timestamp: { ".sv": "timestamp" },
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
  </script>
</body>
</html>
