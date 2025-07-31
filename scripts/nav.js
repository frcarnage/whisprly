// /scripts/nav.js
export function highlightCurrentTab(id) {
  document.querySelectorAll(".nav-icon").forEach(icon => {
    icon.classList.remove("active");
  });

  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

export function redirectIfNotLoggedIn() {
  const uid = sessionStorage.getItem('uid');
  if (!uid) {
    window.location.href = "/login.html";
  }
}
