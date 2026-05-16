// ============================
// CART.JS - FIREBASE VERSION
// ============================

import { getFirestore, collection, getDocs, doc, deleteDoc, setDoc, updateDoc } 
    from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } 
    from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

let currentUser = null;

// DOM Elements
const cartBox = document.getElementById("cartList");
const totalBox = document.getElementById("total");

// ============================
// RENDER CART
// ============================
async function renderCart() {
  cartBox.innerHTML = "";
  totalBox.innerHTML = "";

  if (!currentUser) {
    cartBox.innerHTML = "<div class='empty'>Bạn chưa đăng nhập 🛒</div>";
    return;
  }

  const cartRef = collection(db, "users", currentUser.uid, "cart");
  const snapshot = await getDocs(cartRef);

  if (snapshot.empty) {
    cartBox.innerHTML = "<div class='empty'>Giỏ hàng trống 🛒</div>";
    return;
  }

  let total = 0;

  snapshot.forEach(docSnap => {
    const p = docSnap.data();
    const subTotal = (Number(p.price) || 0) * (Number(p.qty) || 1);
    total += subTotal;

    cartBox.innerHTML += `
      <div class="item">
        <img src="${p.img}">
        <div class="info">
          <h4>${p.name}</h4>
          <div class="row-info">
            <span>Số lượng: <input type="number" min="1" value="${p.qty}" onchange="updateQty('${docSnap.id}', this.value)"></span>
            <span>Đơn giá: ${Number(p.price).toLocaleString()}đ</span>
            <span>Thành tiền: ${subTotal.toLocaleString()}đ</span>
          </div>
        </div>
        <button class="remove" onclick="removeItem('${docSnap.id}')">Xoá</button>
      </div>
    `;
  });

  totalBox.innerHTML = "Tổng tiền: " + total.toLocaleString() + "đ";
}

// ============================
// ADD ITEM TO CART
// ============================
export async function addToCart(product) {
  if (!currentUser) return alert("Bạn cần đăng nhập để thêm giỏ hàng!");

  const itemRef = doc(db, "users", currentUser.uid, "cart", product.id);
  await setDoc(itemRef, product);
  renderCart();
}

// ============================
// REMOVE ITEM
// ============================
window.removeItem = async function(itemId) {
  if (!currentUser) return;
  await deleteDoc(doc(db, "users", currentUser.uid, "cart", itemId));
  renderCart();
}

// ============================
// UPDATE QUANTITY
// ============================
window.updateQty = async function(itemId, qty) {
  if (!currentUser) return;
  qty = Number(qty);
  if (qty < 1) qty = 1;

  const itemRef = doc(db, "users", currentUser.uid, "cart", itemId);
  await updateDoc(itemRef, { qty: qty });
  renderCart();
}

// ============================
// AUTH STATE CHANGE
// ============================
onAuthStateChanged(auth, user => {
  currentUser = user;
  renderCart();
});

// ============================
// INIT
// ============================
document.addEventListener("DOMContentLoaded", () => {
  renderCart();
});
