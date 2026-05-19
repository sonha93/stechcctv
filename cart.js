import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  updateDoc,
  increment
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
let cartBox = null;
let totalBox = null;
let actionBox = null;

/* =========================
   RENDER CART
========================= */
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

  try {

    const cartRef = collection(db, "users", currentUser.uid, "cart");
    const snapshot = await getDocs(cartRef);

    if (snapshot.empty) {
      cartBox.innerHTML = "<div class='empty'>Giỏ hàng trống 🛒</div>";
      if (actionBox) actionBox.innerHTML = "";
      return;
    }

    let total = 0;

    snapshot.forEach(docSnap => {

      const p = docSnap.data();

      const qty = Number(p.qty) || 1;
      const price = Number(p.price) || 0;

      total += qty * price;

      cartBox.innerHTML += `
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

          <button class="remove" onclick="removeItem('${docSnap.id}')">🗑</button>

        </div>
      `;
    });

    totalBox.innerHTML = "Tổng tiền: " + total.toLocaleString() + "đ";

    if (actionBox) {
      actionBox.innerHTML = `
        <button class="checkout" onclick="checkout()">
          Đặt hàng
        </button>
      `;
    }

  } catch (err) {
    console.error("Lỗi renderCart:", err);
  }
}

/* =========================
   ADD TO CART (FIX CHUẨN)
========================= */
export async function addToCart(product) {

  if (!currentUser) {
    alert("Bạn cần đăng nhập!");
    return;
  }

  if (!product?.id) return;

  const itemRef = doc(db, "users", currentUser.uid, "cart", String(product.id));

  try {

    await setDoc(itemRef, {
      id: product.id,
      name: product.name || "",
      price: Number(product.price) || 0,
      img: product.img || "",
      qty: increment(1)
    }, { merge: true });

    renderCart();

  } catch (err) {
    console.error("addToCart error:", err);
  }
}

/* =========================
   REMOVE ITEM
========================= */
window.removeItem = async function(itemId) {

  if (!currentUser) return;

  await deleteDoc(
    doc(db, "users", currentUser.uid, "cart", itemId)
  );

  renderCart();
};

/* =========================
   UPDATE QTY
========================= */
window.updateQty = async function(itemId, qty) {

  if (!currentUser) return;

  qty = Math.max(1, Number(qty));

  await updateDoc(
    doc(db, "users", currentUser.uid, "cart", itemId),
    { qty }
  );

  renderCart();
};

/* =========================
   CHECKOUT
========================= */
window.checkout = function() {

  window.location.href = "checkout.html";
};

/* =========================
   AUTH
========================= */
onAuthStateChanged(auth, async user => {
  currentUser = user;
  await renderCart();
});

window.renderCart = renderCart;
