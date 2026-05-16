import { auth, db } from "./firebase-init.js";
import { renderCart } from "./cart.js"; // từ cart.js

let currentUser = null;
const cartCountEl = document.querySelector(".header-icons .cart-count");

auth.onAuthStateChanged(async user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUser = user;
  await renderCart();
  await updateBadge();
});

async function updateBadge() {
  if (!cartCountEl || !currentUser) return;
  const snapshot = await db.collection("users").doc(currentUser.uid).collection("cart").get();
  let count = 0;
  snapshot.forEach(docSnap => {
    count += docSnap.data().qty || 1;
  });
  cartCountEl.textContent = count;
}

export { currentUser, updateBadge };
