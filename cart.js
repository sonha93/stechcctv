import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  updateDoc
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
// ============================
// RENDER CART
// ============================
async function renderCart() {

  cartBox = document.getElementById("cartList");
  totalBox = document.getElementById("total");

  // Nếu không phải trang cart thì bỏ qua
  if (!cartBox || !totalBox) {
    return;
  }

  cartBox.innerHTML = "";
  totalBox.innerHTML = "";

  if (!currentUser) {
    cartBox.innerHTML =
      "<div class='empty'>Bạn chưa đăng nhập 🛒</div>";
    return;
  }

  try {

    const cartRef = collection(
      db,
      "users",
      currentUser.uid,
      "cart"
    );

    const snapshot = await getDocs(cartRef);

    console.log(
      "FIREBASE CART:",
      snapshot.docs.map(d => d.data())
    );

    if (snapshot.empty) {
      cartBox.innerHTML =
        "<div class='empty'>Giỏ hàng trống 🛒</div>";
      return;
    }

    let total = 0;

    snapshot.forEach(docSnap => {

      const p = docSnap.data();

      const qty = Number(p.qty) || 1;
      const price = Number(p.price) || 0;

      const subTotal = qty * price;

      total += subTotal;

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

      <button onclick="updateQty('${docSnap.id}', ${qty - 1})">
        -
      </button>

      <span>${qty}</span>

      <button onclick="updateQty('${docSnap.id}', ${qty + 1})">
        +
      </button>

    </div>

  </div>

  <button
    class="remove"
    onclick="removeItem('${docSnap.id}')"
  >
    🗑
  </button>

</div>
`;
    });

    totalBox.innerHTML =
      "Tổng tiền: " +
      total.toLocaleString() +
      "đ";

  } catch (err) {

    console.error("Lỗi renderCart:", err);

  }

}

// ============================
// ADD TO CART
// ============================
export async function addToCart(product) {

  console.log("PRODUCT:", product);

  if (!currentUser) {
    alert("Bạn cần đăng nhập!");
    return;
  }

  if (!product.id) {
    console.error("Thiếu product.id");
    return;
  }

  try {

    const itemRef = doc(
      db,
      "users",
      currentUser.uid,
      "cart",
      String(product.id)
    );

    await setDoc(itemRef, {
      id: product.id,
      name: product.name || "",
      price: Number(product.price) || 0,
      img: product.img || "",
      qty: 1
    });

    console.log("Đã thêm cart");

    renderCart();

  } catch (err) {

    console.error("Lỗi addToCart:", err);

  }

}
// ============================
// REMOVE ITEM
// ============================
window.removeItem = async function(itemId) {

  if (!currentUser) return;

  await deleteDoc(
    doc(
      db,
      "users",
      currentUser.uid,
      "cart",
      itemId
    )
  );

  renderCart();

};

// ============================
// UPDATE QTY
// ============================
window.updateQty = async function(itemId, qty) {

  if (!currentUser) return;

  qty = Number(qty);

  if (qty < 1) qty = 1;

  const itemRef = doc(
    db,
    "users",
    currentUser.uid,
    "cart",
    itemId
  );

  await updateDoc(itemRef, {
    qty: qty
  });

  renderCart();

};

// ============================
// AUTH
// ============================
onAuthStateChanged(auth, async user => {

  currentUser = user;

  console.log("USER:", user);

  await renderCart();

});
window.renderCart = renderCart;
