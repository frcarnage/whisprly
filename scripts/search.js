// js/search.js
import { db } from './firebase-init.js';
import {
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

searchInput.addEventListener('input', async () => {
  const searchText = searchInput.value.trim().toLowerCase();
  searchResults.innerHTML = '';

  if (searchText === '') return;

  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);

  snapshot.forEach(docSnap => {
    const user = docSnap.data();
    if (user.username.toLowerCase().includes(searchText)) {
      const userDiv = document.createElement('div');
      userDiv.classList.add('search-user');
      userDiv.innerHTML = `
        <img src="${user.profilePic}" alt="pic" class="avatar">
        <div class="user-info">
          <strong>${user.username}</strong><br />
          <small>${user.bio || ''}</small>
        </div>
      `;
      userDiv.addEventListener('click', () => {
        window.location.href = `other-user.html?uid=${docSnap.id}`;
      });

      searchResults.appendChild(userDiv);
    }
  });
});
