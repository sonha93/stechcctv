// =========================
// FIREBASE INIT
// =========================
const firebaseConfig = {
  apiKey:"AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain:"stech-73b89.firebaseapp.com",
  databaseURL:"https://stech-73b89-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:"stech-73b89",
  storageBucket:"stech-73b89.appspot.com",
  messagingSenderId:"873739162979",
  appId:"1:873739162979:web:978f1a4043f025b1cdaf56",
  measurementId:"G-98Q3927PHZ"
};
firebase.initializeApp(firebaseConfig);

// =========================
// GLOBAL
// =========================
let currentUserUID = null; 
let cart = [];

// =========================
// GET / SAVE CART theo UID
// =========================
function getCart(uid){
  return JSON.parse(localStorage.getItem(`cart_user_${uid}`)) || [];
}

function saveCart(uid, cart){
  localStorage.setItem(`cart_user_${uid}`, JSON.stringify(cart));
}

// =========================
// GET PRODUCTS
// =========================
function getProducts(){
  return JSON.parse(localStorage.getItem("products")) || [];
}

// =========================
// RENDER CART
// =========================
function renderCart() {
  const box = document.getElementById("cartList");
  const totalBox = document.getElementById("total");
  const actionBox = document.getElementById("cartAction");

  if(!currentUserUID){
    box.innerHTML = "<div class='empty'>Vui lòng đăng nhập để xem giỏ hàng 🛒</div>";
    totalBox.innerHTML = "";
    actionBox.innerHTML = "";
    return;
  }

  cart = getCart(currentUserUID);

  if(cart.length === 0){
    box.innerHTML = "<div class='empty'>Giỏ hàng trống 🛒</div>";
    totalBox.innerHTML = "";
    renderCartAction();
    return;
  }

  let total = 0;
  const products = getProducts();

  box.innerHTML = cart.map((item,index) => {
    const p = products.find(x => String(x.id) === String(item.id));
    if(!p) return "";

    const price = Number(p.price) || 0;
    const qty = item.quantity || 1;
    const itemTotal = price * qty;
    total += itemTotal;

    return `
      <div class="item">
        <img src="${p.img || ''}">
        <div class="info">
          <h4>${p.name || 'Không tên'}</h4>
          <div class="price">
            ${price.toLocaleString()}đ × ${qty} = 
            <b style="color:#e53935">${itemTotal.toLocaleString()}đ</b>
          </div>
        </div>
        <button class="remove" onclick="removeItem(${index})">Xoá</button>
      </div>
    `;
  }).join("");

  totalBox.innerHTML = "Tổng tiền: " + total.toLocaleString() + "đ";
  renderCartAction();
}

// =========================
// CART ACTION
// =========================
function renderCartAction(){
  const actionBox = document.getElementById("cartAction");
  if(!actionBox) return;

  if(cart.length > 0){
    actionBox.innerHTML = `<a href="checkout.html"><button class="checkout">💳 Thanh toán</button></a>`;
  } else {
    actionBox.innerHTML = `<div class="empty-box">
      <a href="index.html"><button class="checkout" style="background:#2196f3">🛍️ Quay lại mua hàng</button></a>
    </div>`;
  }
}

// =========================
// REMOVE ITEM
// =========================
function removeItem(index){
  if(!currentUserUID) return;
  cart.splice(index,1);
  saveCart(currentUserUID,cart);
  renderCart();
}

// =========================
// ADD TO CART (global)
// =========================
window.addToCart = function(product){
  if(!currentUserUID) return alert("Vui lòng đăng nhập trước");

  cart = getCart(currentUserUID);
  const idx = cart.findIndex(i => i.id === product.id);
  if(idx !== -1){
    cart[idx].quantity = (cart[idx].quantity||1) + 1;
  } else {
    cart.push({id:product.id, quantity:1});
  }
  saveCart(currentUserUID, cart);
  renderCart();
}

// =========================
// FIREBASE AUTH STATE
// =========================
firebase.auth().onAuthStateChanged(user=>{
  currentUserUID = user ? user.uid : null;
  cart = currentUserUID ? getCart(currentUserUID) : [];
  renderCart(); // render ngay sau khi có UID
});
