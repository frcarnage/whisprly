// /scripts/firestore.js
import { db } from './firebase-init.js';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Fetch user by UID
export async function getUserByUID(uid) {
  const docSnap = await getDoc(doc(db, 'users', uid));
  return docSnap.exists() ? docSnap.data() : null;
}

// Update user profile
export async function updateUserProfile(uid, data) {
  return await updateDoc(doc(db, 'users', uid), data);
}

// Follow user
export async function followUser(currentUID, targetUID) {
  await updateDoc(doc(db, 'users', currentUID), {
    following: arrayUnion(targetUID)
  });
  await updateDoc(doc(db, 'users', targetUID), {
    followers: arrayUnion(currentUID)
  });
}

// Unfollow user
export async function unfollowUser(currentUID, targetUID) {
  await updateDoc(doc(db, 'users', currentUID), {
    following: arrayRemove(targetUID)
  });
  await updateDoc(doc(db, 'users', targetUID), {
    followers: arrayRemove(currentUID)
  });
}
