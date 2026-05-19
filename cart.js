import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { app, auth } from "./auth.js";

// FIRESTORE
const db = getFirestore(app);

// USER
let currentUser = null;

// DOM
let cartBox, totalBox, actionBox;

// ============================
// RENDER CART
// ============================
async function renderCart() {

  cartBox = document.getElementById("cartList");
  totalBox = document.getElementById("total");
  actionBox = document.getElementById("cartAction");

  if (!cartBox || !totalBox) return;

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
  let html = "";

  snapshot.forEach(docSnap => {

    const p = docSnap.data();

    const qty = Number(p.qty) || 1;
    const price = Number(p.price) || 0;

    total += qty * price;

    html += `
      <div class="item">
        <img src="${p.img || ''}">

        <div class="info">
          <b>${p.name || ''}</b>

          <div class="price-row">
            <div class="price-new">
              ${price.toLocaleString()}đ
            </div>
          </div>

          <div class="qty">
            <button onclick="updateQty('${docSnap.id}', ${qty - 1})">-</button>
            <span>${qty}</span>
            <button onclick="updateQty('${docSnap.id}', ${qty + 1})">+</button>
          </div>
        </div>

        <button class="remove"
          onclick="removeItem('${docSnap.id}')">
          🗑
        </button>
      </div>
    `;
  });

  cartBox.innerHTML = html;

  totalBox.innerHTML = "Tổng tiền: " + total.toLocaleString() + "đ";

  if (actionBox) {
    actionBox.innerHTML = `
      <button class="checkout" onclick="checkout()">
        Đặt hàng
      </button>
    `;
  }
}

// ============================
// ADD TO CART (FIX TRÙNG ID)
// ============================
let adding = false;

export async function addToCart(product) {

  if (adding) return;
  adding = true;

  if (!currentUser) {
    alert("Bạn cần đăng nhập!");
    adding = false;
    return;
  }

  const id = String(product.id);

  const itemRef = doc(db, "users", currentUser.uid, "cart", id);

  try {

    const snap = await getDoc(itemRef);

    let oldQty = 0;
    if (snap.exists()) {
      oldQty = Number(snap.data().qty) || 0;
    }

    await setDoc(itemRef, {
      id,
      name: product.name || "",
      price: Number(product.price) || 0,
      img: product.img || "",
      qty: oldQty + 1
    });

    renderCart();

  } catch (err) {
    console.error(err);
  }

  adding = false;
}

// ============================
// REMOVE ITEM
// ============================
window.removeItem = async function(itemId) {
  if (!currentUser) return;

  await deleteDoc(doc(db, "users", currentUser.uid, "cart", itemId));
  renderCart();
};

// ============================
// UPDATE QTY
// ============================
window.updateQty = async function(itemId, qty) {
  if (!currentUser) return;

  qty = Math.max(1, Number(qty));

  await updateDoc(doc(db, "users", currentUser.uid, "cart", itemId), {
    qty
  });

  renderCart();
};

// ============================
// CHECKOUT
// ============================
window.checkout = function() {
  window.location.href = "checkout.html";
};

// ============================
// AUTH
// ============================
onAuthStateChanged(auth, async user => {
  currentUser = user;
  await renderCart();
});

window.renderCart = renderCart;
