// ==========================
// FIXED CART.JS
// ==========================

let cartData = [];
let currentUserUID = null;

// BADGE
const cartCountEl = document.querySelector(".header-icons .cart-count");

// ==========================
// AUTH STATE CHANGE
// ==========================
firebase.auth().onAuthStateChanged(user => {
    currentUserUID = user ? user.uid : null;

    // Load cart nếu có user
    const cartKey = currentUserUID ? "cart_" + currentUserUID : null;
    cartData = cartKey ? JSON.parse(localStorage.getItem(cartKey)) || [] : [];
    renderCart();
    updateBadge();
});

// ==========================
// RENDER CART
// ==========================
function renderCart() {
    const box = document.getElementById("cartList");
    const totalBox = document.getElementById("total");
    const actionBox = document.getElementById("cartAction");
    if (!box || !totalBox || !actionBox) return;

    if (!cartData || cartData.length === 0) {
        box.innerHTML = "<p class='empty'>Giỏ hàng trống 🛒</p>";
        totalBox.innerHTML = "";
        actionBox.innerHTML = "";
        return;
    }

    let total = 0;
    box.innerHTML = cartData.map((item, i) => {
        const qty = item.qty || 1;
        total += (item.price || 0) * qty;
        return `
        <div class="item">
            <img src="${item.img || ''}">
            <div class="info">
                <b>${item.name || ''}</b>
                <br>
                <div class="price-new">${(item.price || 0).toLocaleString()}đ</div>
                ${item.oldPrice ? `<div class="price-old">${item.oldPrice.toLocaleString()}đ</div>` : ''}
                <div class="qty">
                    <button onclick="changeQty(${i}, -1)">-</button>
                    <span>${qty}</span>
                    <button onclick="changeQty(${i}, 1)">+</button>
                </div>
            </div>
            <button class="remove" onclick="removeItem(${i})">🗑</button>
        </div>`;
    }).join("");

    totalBox.innerHTML = `Tổng: ${total.toLocaleString()}đ`;
    actionBox.innerHTML = `<button class="checkout" onclick="checkout()">Đặt hàng</button>`;
}

// ==========================
// ADD / REMOVE / CHANGE QTY
// ==========================
function saveCart() {
    if (!currentUserUID) return;
    localStorage.setItem("cart_" + currentUserUID, JSON.stringify(cartData));
    renderCart();
    updateBadge();
}

function addToCart(id) {
    if (!window.allProducts) return;
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    const existing = cartData.find(item => item.id === id);
    if (existing) existing.qty = (existing.qty || 1) + 1;
    else cartData.push({ ...product, qty: 1 });

    saveCart();
}

function changeQty(i, delta) {
    if (!cartData[i]) return;
    cartData[i].qty = (cartData[i].qty || 1) + delta;
    if (cartData[i].qty < 1) cartData[i].qty = 1;
    saveCart();
}

function removeItem(i) {
    cartData.splice(i, 1);
    saveCart();
}

function checkout() {
    if (!currentUserUID) return;
    localStorage.removeItem("cart_" + currentUserUID);
    cartData = [];
    renderCart();
    updateBadge();
    window.location.href = "checkout.html";
}

// ==========================
// BADGE
// ==========================
function updateBadge() {
    if (!cartCountEl) return;
    const count = cartData.reduce((sum, item) => sum + (item.qty || 1), 0);
    cartCountEl.innerText = count;
}

// ==========================
// GLOBAL
// ==========================
window.cartData = cartData;
window.renderCart = renderCart;
window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeItem = removeItem;
window.checkout = checkout;
