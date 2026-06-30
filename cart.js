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
let allProducts = [];
async function loadProducts(){

  const snap = await getDocs(collection(db,"products"));

  allProducts = [];

  snap.forEach(doc=>{

    const d = doc.data();

    allProducts.push({
      id:doc.id,
      name:d.name || "",
      img:d.img || "",
      price:Number(d.price)||0,
      oldPrice:Number(d.oldPrice)||0
    });

  });

}
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

    for (const docSnap of snapshot.docs) {

      const p = docSnap.data();
      const productSnap = await getDoc(
  doc(db, "products", p.productId)
);

if (!productSnap.exists()) continue;

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

  await loadProducts();   // thêm

  initSearch();           // thêm

  await renderCart();
  await updateCartCount();

});

window.renderCart = renderCart;
function formatPrice(n){
  return Number(n).toLocaleString()+"đ";
}

function renderSearchResults(list){

  const box=document.getElementById("searchResults");

  if(!box) return;

  box.innerHTML="";

  if(list.length===0){

    box.innerHTML="<div style='padding:10px'>Không tìm thấy sản phẩm</div>";
    return;

  }

  list.forEach(p=>{

    box.innerHTML+=`

<div class="search-item">

<img src="${p.img}" onerror="this.src='https://via.placeholder.com/100'">

<div class="search-info">

<div class="search-name">${p.name}</div>

<div class="search-price">${formatPrice(p.price)}</div>

${p.oldPrice>p.price?
`<div class="search-oldprice">${formatPrice(p.oldPrice)}</div>`:""}

</div>

</div>

`;

  });

  box.querySelectorAll(".search-item").forEach((item,index)=>{

      item.onclick=()=>{

          location.href=`logo.html?id=${list[index].id}`;

      };

  });

}

function initSearch(){

  const input=document.getElementById("searchInput");
  const box=document.getElementById("searchResults");

  if(!input || !box) return;

  input.addEventListener("input",()=>{

      const key=input.value.trim().toLowerCase();

      if(!key){

          box.innerHTML="";
          return;

      }

      const result=allProducts.filter(p=>

          p.name.toLowerCase().includes(key)

      );

      renderSearchResults(result);

  });

  document.addEventListener("click",(e)=>{

      if(!e.target.closest(".search-box")){

          box.innerHTML="";

      }

  });

}
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
