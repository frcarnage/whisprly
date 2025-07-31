// /scripts/utils.js

export function showToast(msg, type = 'success') {
  alert(`${type.toUpperCase()}: ${msg}`);
}

export function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

export function validatePassword(password) {
  return password.length >= 6;
}

export function showLoader(btn, loadingText = "Loading...") {
  btn.dataset.originalText = btn.innerText;
  btn.innerText = loadingText;
  btn.disabled = true;
}

export function hideLoader(btn) {
  btn.innerText = btn.dataset.originalText || "Submit";
  btn.disabled = false;
}
