import { initializeApp }
from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain: "stech-73b89.firebaseapp.com",
  projectId: "stech-73b89",
  storageBucket: "stech-73b89.appspot.com",
  messagingSenderId: "873739162979",
  appId: "1:873739162979:web:978f1a4043f025b1cdaf56"
};

// INIT FIREBASE
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

const cartBox = document.getElementById("cartList");
const totalBox = document.getElementById("total");
// ============================
// RENDER CART
// ============================
async function renderCart() {

  if (!cartBox || !totalBox) {
    console.error("Không tìm thấy cartList hoặc total");
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

            <h4>${p.name || ''}</h4>

            <div class="row-info">

              <span>
                Số lượng:
                <input
                  type="number"
                  min="1"
                  value="${qty}"
                  onchange="updateQty('${docSnap.id}', this.value)"
                >
              </span>

              <span>
                Đơn giá:
                ${price.toLocaleString()}đ
              </span>

              <span>
                Thành tiền:
                ${subTotal.toLocaleString()}đ
              </span>

            </div>

          </div>

          <button
            class="remove"
            onclick="removeItem('${docSnap.id}')"
          >
            Xoá
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
