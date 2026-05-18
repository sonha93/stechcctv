import { auth, db } from "./firebase-init.js";

const cartBox = document.getElementById("cart");
const totalBox = document.getElementById("total");
let currentUser = null;
let currentCart = [];

function formatPrice(n){ 
  return Number(n).toLocaleString("vi-VN") + "đ"; 
}

// ============================
// LOAD CART
// ============================
async function loadCart(){
  if(!currentUser) return;

  const snapshot = await db
    .collection("users")
    .doc(currentUser.uid)
    .collection("cart")
    .get();

  currentCart = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  currentCart.forEach(item => {
    if(item.checked === undefined){
      item.checked = true;
    }
  });

  renderCheckout();
}

// ============================
// RENDER CHECKOUT
// ============================
function renderCheckout(){
  if(!cartBox || !totalBox) return;
  cartBox.innerHTML = "";
  if(currentCart.length===0){
    cartBox.innerHTML = "<p>Giỏ hàng trống 🛒</p>"; 
    totalBox.innerText = formatPrice(0); 
    return; 
  }

  let total = 0;

  currentCart.forEach((item,index)=>{
    const qty = item.qty || 1;
    const price = Number(item.price) || 0;
    const subTotal = qty * price;
    if(item.checked) total += subTotal;

    cartBox.innerHTML += `
      <div class="cart-item">
        <input type="checkbox" ${item.checked?"checked":""} onclick="toggleItem(${index})">
        <img src="${item.img}">
        <div>
          <h4>${item.name}</h4>
          <div>${qty} × ${formatPrice(price)} = ${formatPrice(subTotal)}</div>
        </div>
        <button onclick="removeItem(${index})">🗑</button>
      </div>`;
  });

  totalBox.innerText = formatPrice(total);
}

// ============================
// TOGGLE ITEM
// ============================
async function toggleItem(index){
  if(!currentCart[index]) return;
  currentCart[index].checked = !currentCart[index].checked;
  await db
    .collection("users")
    .doc(currentUser.uid)
    .collection("cart")
    .doc(currentCart[index].id)
    .update({checked: currentCart[index].checked});
  renderCheckout();
}

// ============================
// CHANGE QUANTITY
// ============================
async function changeQty(index, delta){
  if(!currentCart[index]) return;
  const item = currentCart[index];
  item.qty = (item.qty || 1) + delta;
  if(item.qty < 1) item.qty = 1;

  await db
    .collection("users")
    .doc(currentUser.uid)
    .collection("cart")
    .doc(item.id)
    .update({qty: item.qty});

  renderCheckout();
}

// ============================
// REMOVE ITEM
// ============================
async function removeItem(index){
  if(!currentCart[index]) return;
  const item = currentCart[index];
  await db
    .collection("users")
    .doc(currentUser.uid)
    .collection("cart")
    .doc(item.id)
    .delete();

  currentCart.splice(index,1);
  renderCheckout();
}

// ============================
// CLEAR CART
// ============================
async function clearCart(){
  if(!currentUser) return;
  const cartRef = db.collection("users").doc(currentUser.uid).collection("cart");
  const snapshot = await cartRef.get();
  snapshot.forEach(doc => doc.ref.delete());
  currentCart = [];
  renderCheckout();
}

// ============================
// CHECKOUT
// ============================
async function checkout(){
  if(!currentUser) return;
  await clearCart();
  window.location.href = "checkout.html";
}

// ============================
// AUTH STATE
// ============================
auth.onAuthStateChanged(user=>{
  currentUser = user;
  if(user) loadCart();
  else { currentCart = []; renderCheckout(); }
});

// Đưa các hàm ra global để onclick HTML có thể gọi
window.removeItem = removeItem;
window.toggleItem = toggleItem;
window.changeQty = changeQty;
window.clearCart = clearCart;
window.checkout = checkout;
window.renderCheckout = renderCheckout;
