import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
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
let actionBox = null;
// ============================
// UPDATE CART COUNT
// ============================
async function updateCartCount() {

  const badge = document.getElementById("cartCount");

  if (!badge) return;

  if (!currentUser) {

    badge.innerText = "0";
    return;

  }

  const snapshot = await getDocs(
    collection(
      db,
      "users",
      currentUser.uid,
      "cart"
    )
  );

  let totalQty = 0;

  snapshot.forEach(doc => {

    totalQty += Number(doc.data().qty) || 0;

  });

  badge.innerText = totalQty;

}
// ============================
// RENDER CART
// ============================
async function renderCart() {

  cartBox = document.getElementById("cartList");
 totalBox = document.getElementById("total");
actionBox = document.getElementById("cartAction");

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

   
    if (snapshot.empty) {

  cartBox.innerHTML =
    "<div class='empty'>Giỏ hàng trống 🛒</div>";

  totalBox.innerHTML = "";

  if(actionBox){
    actionBox.innerHTML = "";
  }

  return;
}

    let total = 0;
let total = 0;

for (const docSnap of snapshot.docs) {
      const p = docSnap.data();
      const productSnap = await getDoc(
  doc(db, "products", p.productId)
);

if (!productSnap.exists()) {

  await deleteDoc(
    doc(
      db,
      "users",
      currentUser.uid,
      "cart",
      docSnap.id
    )
  );

  await renderCart();   // <-- thêm dòng này
  return;               // <-- thêm dòng này
}

const product = productSnap.data();
      const qty = Number(p.qty) || 1;
      const price = Number(product.price) || 0;

      const subTotal = qty * price;

      total += subTotal;

 cartBox.innerHTML += `
<div class="item">

 <a href="logo.html?id=${p.productId}">
  <img src="${product.img || ''}">
</a>
  <div class="info">

    <b>${product.name || ''}</b>

   <div class="price-row">

  ${
    product.oldPrice
      ? `<div class="price-old">
           ${Number(product.oldPrice).toLocaleString()}đ
         </div>`
      : ""
  }

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
  class="remove-x"
  onclick="removeItem('${docSnap.id}')"
>
  ×
</button>

</div>
`;
}
    await updateCartCount();
    totalBox.innerHTML =
      "Tạm tính: " +
      total.toLocaleString() +
      "đ";
if(actionBox){

  actionBox.innerHTML = `
    <button
      class="checkout"
      onclick="checkout()"
    >
     Tạm tính
    </button>
  `;

}
  } catch (err) {

    console.error("Lỗi renderCart:", err);

  }

}

// ============================
// ADD TO CART
// ============================
export async function addToCart(product) {

  if (!currentUser) {
  showToast("Bạn cần đăng nhập!");
    return;
  }

  if (!product.id) {
    console.error("Thiếu product.id");
    return;
  }
const productId =
  String(product.id);
  try {

    const itemRef = doc(
      db,
      "users",
      currentUser.uid,
      "cart",
      productId
    );

    const snapshot = await getDocs(
      collection(
        db,
        "users",
        currentUser.uid,
        "cart"
      )
    );

    let oldQty = 0;

    snapshot.forEach(d => {

      if(d.id === productId){
        oldQty = Number(d.data().qty) || 0;
      }

    });

 await setDoc(itemRef, {
  productId: product.id,
  qty: oldQty + 1
});


  await renderCart();
await updateCartCount();

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

await renderCart();
await updateCartCount();

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

await renderCart();
await updateCartCount();
};
// ============================
// CHECKOUT
// ============================
window.checkout = function(){


  window.location.href = "checkout.html";

};

// ============================
// AUTH
// ============================
onAuthStateChanged(auth, async user => {

  currentUser = user;



 await renderCart();
await updateCartCount();

});

window.renderCart = renderCart;
function showToast(message){

const toast = document.createElement("div");

toast.innerText = message;

toast.style.cssText = `
position:fixed;
left:50%;
bottom:30px;
transform:translateX(-50%);
background:#222;
color:#fff;
padding:12px 20px;
border-radius:8px;
font-size:14px;
z-index:999999;
box-shadow:0 4px 12px rgba(0,0,0,.3);
`;

document.body.appendChild(toast);

setTimeout(()=>{
toast.remove();
},2500);

}
