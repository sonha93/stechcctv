
// Firebase config

const firebaseConfig={
  apiKey:"AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain:"stech-73b89.firebaseapp.com",
  databaseURL:"https://stech-73b89-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:"stech-73b89",
  storageBucket:"stech-73b89.appspot.com",
  messagingSenderId:"873739162979",
  appId:"1:873739162979:web:978f1a4043f025b1cdaf56"
};





const auth = firebase.auth();
const db = firebase.database();

let currentUser = null;
let cart = [];

// Badge giỏ hàng nếu có header khác
const cartCountEl = document.querySelector(".header-icons .cart-count");

// ================== LOAD USER + CART ==================
auth.onAuthStateChanged(user=>{
  if(!user) return window.location.href="index.html";
  currentUser = user;
  loadCart();
});

function loadCart(){
  if(!currentUser) return;
  db.ref("carts/"+currentUser.uid).on("value", snap=>{
    cart = snap.val() || [];
    renderCart();
    updateBadge();
  });
}

// ================== RENDER CART ==================
function renderCart(){
  const box = document.getElementById("cartList");
  const totalBox = document.getElementById("total");
  const actionBox = document.getElementById("cartAction");

  if(cart.length === 0){
    box.innerHTML = "<p class='empty'>Giỏ hàng trống 🛒</p>";
    totalBox.innerHTML = "";
    actionBox.innerHTML = "";
    return;
  }

  let total = 0;
  box.innerHTML = cart.map((item,i)=>{
    const qty = item.qty || 1;
    total += (item.price || 0) * qty;

    return `
      <div class="item">
        <img src="${item.img || ''}">
        <div class="info">
          <b>${item.name}</b><br>
          <div class="price-new">${item.price.toLocaleString()}đ</div>
          ${item.oldPrice ? `<div class="price-old">${item.oldPrice.toLocaleString()}đ</div>`: ''}
          <div class="qty">
            <button onclick="changeQty(${i},-1)">-</button>
            <span>${qty}</span>
            <button onclick="changeQty(${i},1)">+</button>
          </div>
        </div>
        <button class="remove" onclick="removeItem(${i})">🗑</button>
      </div>
    `;
  }).join("");

  totalBox.innerHTML = "Tổng: "+total.toLocaleString()+"đ";
  actionBox.innerHTML = `<button class="checkout" onclick="checkout()">Đặt hàng</button>`;
}

// ================== UPDATE BADGE ==================
function updateBadge(){
  if(cartCountEl){
    let count = 0;
    cart.forEach(i=>count += i.qty || 1);
    cartCountEl.innerText = count;
  }
}

// ================== CHANGE QTY ==================
function changeQty(i, delta){
  cart[i].qty = (cart[i].qty || 1) + delta;
  if(cart[i].qty < 1) cart[i].qty = 1;
  saveCart();
}

// ================== REMOVE ITEM ==================
function removeItem(i){
  cart.splice(i,1);
  saveCart();
}

// ================== SAVE CART ==================
function saveCart(){
  if(!currentUser) return;
  db.ref("carts/"+currentUser.uid).set(cart);
}

// ================== CHECKOUT ==================
function checkout(){
  if(!currentUser) return;
  db.ref("carts/"+currentUser.uid).remove().then(()=>{
    cart = [];
    renderCart();
    updateBadge();
    window.location.href = "checkout.html";
  });
}
