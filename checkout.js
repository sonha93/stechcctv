```js
import { auth, db } from "./firebase-init.js";

const cartBox = document.getElementById("cart");
const totalBox = document.getElementById("total");

let currentUser = null;
let currentCart = [];

function formatPrice(n){
  return Number(n || 0).toLocaleString("vi-VN") + "đ";
}

// ============================
// LOAD CART
// ============================
async function loadCart(){

  try{

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

  }catch(err){

    console.error(err);

    if(cartBox){
      cartBox.innerHTML = `
        <p>Lỗi tải giỏ hàng</p>
      `;
    }
  }
}

// ============================
// RENDER CHECKOUT
// ============================
function renderCheckout(){

  if(!cartBox || !totalBox) return;

  cartBox.innerHTML = "";

  if(currentCart.length === 0){

    cartBox.innerHTML = `
      <p>Giỏ hàng trống 🛒</p>
    `;

    totalBox.innerText = formatPrice(0);

    return;
  }

  let total = 0;

  currentCart.forEach((item,index)=>{

    const qty = Number(item.qty || 1);

    const price = Number(item.price || 0);

    const subTotal = qty * price;

    if(item.checked){
      total += subTotal;
    }

    cartBox.innerHTML += `
      <div class="cart-item">

        <input
          type="checkbox"
          ${item.checked ? "checked" : ""}
          onclick="toggleItem(${index})"
        >

        <img
          src="${item.img || "no-image.png"}"
          onerror="this.src='no-image.png'"
        >

        <div>

          <h4>${item.name || ""}</h4>

          <div>
            ${qty} × ${formatPrice(price)}
            = ${formatPrice(subTotal)}
          </div>

        </div>

        <button onclick="removeItem(${index})">
          🗑
        </button>

      </div>
    `;
  });

  totalBox.innerText = formatPrice(total);
}

// ============================
// TOGGLE ITEM
// ============================
async function toggleItem(index){

  try{

    if(!currentCart[index]) return;

    currentCart[index].checked =
      !currentCart[index].checked;

    await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("cart")
      .doc(currentCart[index].id)
      .update({
        checked: currentCart[index].checked
      });

    renderCheckout();

  }catch(err){

    console.error(err);

    alert("Lỗi cập nhật giỏ hàng");
  }
}

// ============================
// CHANGE QUANTITY
// ============================
async function changeQty(index, delta){

  try{

    if(!currentCart[index]) return;

    const item = currentCart[index];

    item.qty = (item.qty || 1) + delta;

    if(item.qty < 1){
      item.qty = 1;
    }

    await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("cart")
      .doc(item.id)
      .update({
        qty: item.qty
      });

    renderCheckout();

  }catch(err){

    console.error(err);

    alert("Lỗi cập nhật số lượng");
  }
}

// ============================
// REMOVE ITEM
// ============================
async function removeItem(index){

  try{

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

  }catch(err){

    console.error(err);

    alert("Lỗi xoá sản phẩm");
  }
}

// ============================
// CLEAR CART
// ============================
async function clearCart(){

  try{

    if(!currentUser) return;

    const cartRef = db
      .collection("users")
      .doc(currentUser.uid)
      .collection("cart");

    const snapshot = await cartRef.get();

    for(const doc of snapshot.docs){
      await doc.ref.delete();
    }

    currentCart = [];

    renderCheckout();

  }catch(err){

    console.error(err);

    alert("Lỗi xoá giỏ hàng");
  }
}

// ============================
// CHECKOUT
// ============================
async function checkout(){

  try{

    if(!currentUser){

      alert("Vui lòng đăng nhập");

      return;
    }

    const itemsToOrder =
      currentCart.filter(i => i.checked);

    if(itemsToOrder.length === 0){

      alert("Chưa chọn sản phẩm");

      return;
    }

    const total = itemsToOrder.reduce((sum,item)=>{

      return sum +
        (Number(item.qty || 1) *
        Number(item.price || 0));

    },0);

    await db.collection("orders").add({

      uid: currentUser.uid,

      items: itemsToOrder,

      total: total,

      status: "pending",

      createdAt: Date.now()

    });

    for(const item of itemsToOrder){

      await db
        .collection("users")
        .doc(currentUser.uid)
        .collection("cart")
        .doc(item.id)
        .delete();
    }

    currentCart =
      currentCart.filter(i => !i.checked);

    renderCheckout();

    alert("Đặt hàng thành công");

    window.location.href = "orders.html";

  }catch(err){

    console.error(err);

    alert("Lỗi đặt hàng");
  }
}

// ============================
// AUTH STATE
// ============================
auth.onAuthStateChanged(user=>{

  currentUser = user;

  if(user){

    loadCart();

  }else{

    currentCart = [];

    renderCheckout();
  }
});

// ============================
// GLOBAL
// ============================
window.removeItem = removeItem;
window.toggleItem = toggleItem;
window.changeQty = changeQty;
window.clearCart = clearCart;
window.checkout = checkout;
window.renderCheckout = renderCheckout;
```
