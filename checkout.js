import { auth, db } from "./firebase-init.js";

const cartBox = document.getElementById("cart");
const totalBox = document.getElementById("total");
let currentUser = null;
let currentCart = [];

function formatPrice(n){ return Number(n).toLocaleString("vi-VN") + "đ"; }

async function loadCart(){
  if(!currentUser) return;
  const snapshot = await db.collection("users").doc(currentUser.uid).collection("cart").get();
  currentCart = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  currentCart.forEach(item => { if(item.checked===undefined) item.checked=true; });
  renderCheckout();
}

function renderCheckout(){
  if(!cartBox || !totalBox) return;
  cartBox.innerHTML = "";
  if(currentCart.length===0){ cartBox.innerHTML="<p>Giỏ hàng trống 🛒</p>"; totalBox.innerText=formatPrice(0); return; }
  let total=0;
  currentCart.forEach((item,index)=>{
    const qty=item.qty||1;
    const price=Number(item.price)||0;
    const oldPrice=Number(item.oldPrice)||0;
    const subTotal=qty*price;
    if(item.checked) total+=subTotal;
    const hasDiscount=oldPrice>price;
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
  totalBox.innerText=formatPrice(total);
}

async function toggleItem(index){
  if(!currentCart[index]) return;
  currentCart[index].checked=!currentCart[index].checked;
  await db.collection("users").doc(currentUser.uid).collection("cart").doc(currentCart[index].id).update({checked:currentCart[index].checked});
  renderCheckout();
}

async function changeQty(index,delta){
  if(!currentCart[index]) return;
  const item=currentCart[index];
  item.qty=(item.qty||1)+delta;
  if(item.qty<1) item.qty=1;
  await db.collection("users").doc(currentUser.uid).collection("cart").doc(item.id).update({qty:item.qty});
  renderCheckout();
}

async function removeItem(index){
  if(!currentCart[index]) return;
  const item=currentCart[index];
  await db.collection("users").doc(currentUser.uid).collection("cart").doc(item.id).delete();
  currentCart.splice(index,1);
  renderCheckout();
}

async function clearCart(){
  if(!currentUser) return;
  const cartRef = db.collection("users").doc(currentUser.uid).collection("cart");
  const snapshot = await cartRef.get();
  snapshot.forEach(doc => doc.ref.delete());
  currentCart=[];
  renderCheckout();
}

async function checkout(){
  if(!currentUser) return;
  const cartRef = db.collection("users").doc(currentUser.uid).collection("cart");
  const snapshot = await cartRef.get();
  snapshot.forEach(doc => doc.ref.delete());
  currentCart=[];
  renderCheckout();
  window.location.href="checkout.html";
}

auth.onAuthStateChanged(user=>{
  currentUser=user;
  if(user) loadCart();
  else { currentCart=[]; renderCheckout(); }
});
