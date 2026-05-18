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

const db = getFirestore(app);

let currentUser = null;

// ============================
// RENDER CART
// ============================
async function renderCart() {

  const cartBox = document.getElementById("cartList");
  const totalBox = document.getElementById("total");
  const actionBox = document.getElementById("cartAction");

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

  for (const docSnap of snapshot.docs) {

    const item = docSnap.data();

    // 🔥 FIX LẤY GIÁ CHUẨN
    const productRef = doc(db, "products", item.productId || item.id);
    const productSnap = await getDoc(productRef);

    let price = 0;

    if (productSnap.exists()) {
      const product = productSnap.data();
      price = Number(product.price) || 0;
    }

    const qty = Number(item.qty) || 1;

    total += price * qty;

    cartBox.innerHTML += `
      <div class="item">

        <img src="${item.img || ''}">

        <div class="info">

          <b>${item.name || ''}</b>

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
  }

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
// ADD TO CART
// ============================
export async function addToCart(product) {

  if (!currentUser) {
    alert("Bạn cần đăng nhập!");
    return;
  }

  const itemRef = doc(
    db,
    "users",
    currentUser.uid,
    "cart",
    String(product.id)
  );

  const snapshot = await getDocs(
    collection(db, "users", currentUser.uid, "cart")
  );

  let oldQty = 0;

  snapshot.forEach(d => {
    if (d.id === String(product.id)) {
      oldQty = Number(d.data().qty) || 0;
    }
  });

  await setDoc(itemRef, {
    productId: product.id,
    name: product.name || "",
    img: product.img || "",
    qty: oldQty + 1
  });

  renderCart();
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

  await updateDoc(
    doc(db, "users", currentUser.uid, "cart", itemId),
    { qty }
  );

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
