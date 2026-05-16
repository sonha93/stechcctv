// ==========================
// AUTH.JS - FIREBASE CART CHUẨN
// ==========================

// IMPORT FIREBASE INIT
import { auth, db } from "./firebase-init.js";   // firebase-init.js phải export auth, db
import { renderCart } from "./cart.js";          // cart.js phải export renderCart
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// USER HIỆN TẠI
let currentUser = null;

// SELECTOR BADGE
const cartCountEl = document.querySelector(".header-icons .cart-count");

// ==========================
// LẮNG NGHE AUTH
// ==========================
auth.onAuthStateChanged(async user => {
  if (!user) {
    window.location.href = "index.html"; // nếu chưa đăng nhập
    return;
  }

  currentUser = user;

  // Hiển thị cart từ Firestore
  await renderCart();

  // Cập nhật badge
  await updateBadge();
});

// ==========================
// CẬP NHẬT BADGE SỐ LƯỢNG
// ==========================
async function updateBadge() {
  if (!cartCountEl || !currentUser) return;

  const cartRef = collection(db, "users", currentUser.uid, "cart");
  const snapshot = await getDocs(cartRef);

  let count = 0;
  snapshot.forEach(docSnap => {
    const item = docSnap.data();
    count += item.qty || 1;
  });

  cartCountEl.textContent = count;
}

// ==========================
// EXPORT (nếu cần dùng bên ngoài)
// ==========================
export { currentUser, updateBadge };
