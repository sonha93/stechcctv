let currentUserUID = null; // UID user hiện tại
let cart = []; // giỏ hàng hiện tại

// hàm lấy cart từ localStorage theo UID
function getCart(uid){
  return JSON.parse(localStorage.getItem(`cart_user_${uid}`)) || [];
}

// hàm lưu cart theo UID
function saveCart(uid, cart){
  localStorage.setItem(`cart_user_${uid}`, JSON.stringify(cart));
}

/* =========================
   GET PRODUCTS (an toàn)
========================= */
function getProducts(){
  return JSON.parse(localStorage.getItem("products")) || [];
}

/* =========================
   RENDER CART
========================= */
function renderCart() {
  const box = document.getElementById("cartList");
  const totalBox = document.getElementById("total");

  box.innerHTML = "";

  if (cart.length === 0) {
    box.innerHTML = "<div class='empty'>Giỏ hàng trống 🛒</div>";
    totalBox.innerHTML = "";
    renderCartAction();
    return;
  }

  let total = 0;
  const products = getProducts();

  cart.forEach((item, index) => {

    const p = products.find(x => String(x.id) === String(item.id));
    if (!p) return;

    const price = Number(p.price) || 0;
    const qty = item.quantity || item.qty || 1;

    const itemTotal = price * qty;
    total += itemTotal;

    box.innerHTML += `
      <div class="item">
        <img src="${p.img || ''}">

        <div class="info">
          <h4>${p.name || 'Không tên'}</h4>

          <div class="price">
            ${price.toLocaleString()}đ × ${qty} = 
            <b style="color:#e53935">
              ${itemTotal.toLocaleString()}đ
            </b>
          </div>
        </div>

        <button class="remove" onclick="removeItem(${index})">
          Xoá
        </button>
      </div>
    `;
  });

  totalBox.innerHTML = "Tổng tiền: " + total.toLocaleString() + "đ";

  renderCartAction();
}

/* =========================
   REMOVE ITEM
========================= */
function removeItem(index) {
  cart.splice(index, 1);
 
  renderCart();
}

/* =========================
   CART ACTION
========================= */
function renderCartAction() {
  const actionBox = document.getElementById("cartAction");
  if (!actionBox) return;

  if (cart.length > 0) {
    actionBox.innerHTML = `
      <a href="checkout.html">
        <button class="checkout">💳 Thanh toán</button>
      </a>
    `;
  } else {
    actionBox.innerHTML = `
      <div class="empty-box">
        <a href="index.html">
          <button class="checkout" style="background:#2196f3">
            🛍️ Quay lại mua hàng
          </button>
        </a>
      </div>
    `;
  }
}

/* =========================
   ADD TO CART (FIX CHUẨN)
========================= */
function addToCart(product){

  
  let index = cart.findIndex(item => item.id === product.id);

  if(index !== -1){
    cart[index].quantity = (cart[index].quantity || 1) + 1;
  } else {
    cart.push({
      id: product.id,
      quantity: 1
    });
  }

  

/* =========================
   INIT
========================= */
renderCart();
