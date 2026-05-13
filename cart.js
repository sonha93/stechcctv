<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>

<script>
  // =========================
  // 🔥 FIREBASE INIT
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
  const db = firebase.database();

  // =========================
  // GLOBAL VARIABLES
  // =========================
  let currentUserUID = null;
  let cart = [];
  let sessionToken = null;

  // =========================
  // LOGIN
  // =========================
  function loginUser(uid) {
    currentUserUID = uid;
    startSession(uid, () => {
      loadCart();
    });
  }

  // =========================
  // CART FUNCTIONS
  // =========================
  function getCart(uid) {
    return JSON.parse(localStorage.getItem(`cart_user_${uid}`)) || [];
  }

  function saveCart(uid, cart) {
    localStorage.setItem(`cart_user_${uid}`, JSON.stringify(cart));
  }

  function saveCartToFirebase(uid, cart) {
    db.ref('carts/' + uid).set({ cart });
  }

  function getCartFromFirebase(uid, callback) {
    db.ref('carts/' + uid).once('value', snapshot => {
      if (snapshot.exists()) callback(snapshot.val().cart || []);
      else callback([]);
    });
  }

  function loadCart() {
    if (!currentUserUID) return;
    getCartFromFirebase(currentUserUID, firebaseCart => {
      cart = firebaseCart.length ? firebaseCart : getCart(currentUserUID);
      renderCart();
    });
  }

  function addToCart(product) {
    validateSession(valid => {
      if (!valid) return;
      if (!currentUserUID) { alert("Bạn chưa đăng nhập!"); return; }

      const index = cart.findIndex(p => p.id === product.id);
      if (index >= 0) cart[index].quantity += 1;
      else cart.push({ ...product, quantity: 1 });

      saveCart(currentUserUID, cart);
      saveCartToFirebase(currentUserUID, cart);
      renderCart();
    });
  }

  function removeFromCart(productId) {
    validateSession(valid => {
      if (!valid) return;

      cart = cart.filter(p => p.id !== productId);
      saveCart(currentUserUID, cart);
      saveCartToFirebase(currentUserUID, cart);
      renderCart();
    });
  }

  function updateQuantity(productId, quantity) {
    validateSession(valid => {
      if (!valid) return;

      const index = cart.findIndex(p => p.id === productId);
      if (index >= 0) {
        cart[index].quantity = quantity;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
        saveCart(currentUserUID, cart);
        saveCartToFirebase(currentUserUID, cart);
        renderCart();
      }
    });
  }

  // =========================
  // RENDER CART
  // =========================
  function renderCart() {
    const cartContainer = document.getElementById("cart-items");
    if (!cartContainer) return;

    cartContainer.innerHTML = cart.map(p => `
      <div class="cart-item">
        <span>${p.name}</span>
        <input type="number" value="${p.quantity}" min="1" onchange="updateQuantity('${p.id}', parseInt(this.value))">
        <button onclick="removeFromCart('${p.id}')">Xóa</button>
      </div>
    `).join("");

    const countEl = document.getElementById("cart-count");
    if (countEl) countEl.innerText = cart.reduce((sum, p) => sum + p.quantity, 0);
  }

  // =========================
  // SESSION FUNCTIONS
  // =========================
  function generateSessionToken() {
    return Date.now() + "_" + Math.random().toString(36).substring(2,10);
  }

  function startSession(uid, callback) {
    sessionToken = generateSessionToken();
    db.ref('sessions/' + uid).set({ token: sessionToken }, error => {
      if (error) console.error("Lưu session thất bại:", error);
      else {
        console.log("Session token lưu thành công!");
        if (callback) callback();
      }
    });
  }

  function validateSession(callback) {
    if (!currentUserUID) return callback(false);

    db.ref('sessions/' + currentUserUID).once('value', snapshot => {
      const token = snapshot.val()?.token;
      if (token !== sessionToken) {
        alert("Tài khoản này đang đăng nhập trên thiết bị khác!");
        return callback(false);
      }
      callback(true);
    });
  }

  // =========================
  // EXAMPLE USAGE
  // =========================
  // loginUser("user123"); // Gọi khi user login
  // addToCart({ id: "sp1", name: "Camera A", price: 1500 }); // Thêm sản phẩm test
</script>
