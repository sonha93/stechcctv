// cart-functions.js

// Firebase SDK đã include trong HTML
const firebaseConfig = {
  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain: "stech-73b89.firebaseapp.com",
  databaseURL: "https://stech-73b89-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stech-73b89",
  storageBucket: "stech-73b89.appspot.com",
  messagingSenderId: "873739162979",
  appId: "1:873739162979:web:978f1a4043f025b1cdaf56"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

let currentUser = null;

// DOM
const cartCountEl = document.getElementById("cartCount");
const addCartButtons = document.querySelectorAll(".add-to-cart-btn");
const cartListEl = document.getElementById("cartList"); // trong cart.html
const totalPriceEl = document.getElementById("totalPrice");

// === Kiểm tra đăng nhập ===
auth.onAuthStateChanged(user => {
  if (!user) return;
  currentUser = user;
  updateCartCount();
  if (cartListEl) loadCartItems(); // nếu đang ở cart.html
});

// === Thêm sản phẩm vào giỏ hàng ===
addCartButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (!currentUser) return;
    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const price = parseInt(btn.dataset.price);

    const cartRef = db.ref(`carts/${currentUser.uid}/${id}`);
    cartRef.once('value').then(snap => {
      if (snap.exists()) {
        cartRef.update({ quantity: snap.val().quantity + 1 });
      } else {
        cartRef.set({ name, price, quantity: 1 });
      }
      updateCartCount();
    });
  });
});

// === Cập nhật số lượng trên icon ===
function updateCartCount() {
  if (!currentUser) return;
  db.ref(`carts/${currentUser.uid}`).once('value').then(snap => {
    let total = 0;
    snap.forEach(item => total += parseInt(item.val().quantity) || 1);
    if (cartCountEl) cartCountEl.innerText = total;
  });
}

// === Load giỏ hàng ra cart.html ===
function loadCartItems() {
  if (!currentUser || !cartListEl) return;
  db.ref(`carts/${currentUser.uid}`).once('value').then(snap => {
    cartListEl.innerHTML = '';
    let total = 0;
    if (!snap.exists()) {
      cartListEl.innerHTML = '<p>Giỏ hàng trống</p>';
      if (totalPriceEl) totalPriceEl.innerText = '0₫';
      return;
    }

    snap.forEach(s => {
      const item = s.val();
      total += item.price * item.quantity;

      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <span>${item.name}</span>
        <span>${item.quantity} x ${item.price.toLocaleString()}₫</span>
        <button data-id="${s.key}" class="remove-btn">Xóa</button>
      `;
      cartListEl.appendChild(div);

      // Xóa sản phẩm
      div.querySelector('.remove-btn').addEventListener('click', () => {
        db.ref(`carts/${currentUser.uid}/${s.key}`).remove().then(() => {
          div.remove();
          updateCartCount();
          loadCartItems();
        });
      });
    });

    if (totalPriceEl) totalPriceEl.innerText = total.toLocaleString() + '₫';
  });
}

// === Xóa toàn bộ giỏ hàng (tùy chọn) ===
function clearCart() {
  if (!currentUser) return;
  db.ref(`carts/${currentUser.uid}`).remove().then(() => {
    updateCartCount();
    if (cartListEl) loadCartItems();
  });
}
