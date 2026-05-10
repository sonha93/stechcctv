// ==========================
// FIREBASE INIT
// ==========================
const firebaseConfig = {
  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain: "stech-73b89.firebaseapp.com",
  databaseURL: "https://stech-73b89-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "stech-73b89",
  storageBucket: "stech-73b89.appspot.com",
  messagingSenderId: "873739162979",
  appId: "1:873739162979:web:978f1a4043f025b1cdaf56"
};

// Init Firebase
if(!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

let currentUser = null;
let cartRef = null;
let firebaseReady = false;

// ==========================
// AUTH STATE
// ==========================
auth.onAuthStateChanged(user => {
  if(!user){
    currentUser = null;
    cartRef = null;
    firebaseReady = true; // firebase init xong nhưng chưa login
    return;
  }

  currentUser = user;
  cartRef = db.ref("carts/" + currentUser.uid);
  firebaseReady = true;
  loadCartCount();
});

// ==========================
// LOAD CART COUNT
// ==========================
function loadCartCount(){
  if(!currentUser || !cartRef) return;

  cartRef.on("value", snapshot => {
    let cart = snapshot.val() || [];
    if(!Array.isArray(cart)) cart = Object.values(cart);

    const badge = document.getElementById("cartCount");
    if(badge){
      let total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      badge.innerText = total;
    }
  });
}

// ==========================
// ADD TO CART (FULL READY)
// ==========================
window.addToCart = async function(productId){

  if(!firebaseReady){
    alert("Firebase chưa sẵn sàng, vui lòng chờ 1–2 giây");
    return;
  }

  if(!currentUser || !cartRef){
    alert("Bạn cần đăng nhập để thêm vào giỏ hàng!");
    return;
  }

  const products = JSON.parse(localStorage.getItem("products")) || [];
  const product = products.find(p => String(p.id) === String(productId));
  if(!product){
    alert("Không tìm thấy sản phẩm");
    return;
  }

  try {
    const snapshot = await cartRef.once("value");
    let cart = snapshot.val() || [];
    if(!Array.isArray(cart)) cart = Object.values(cart);

    const existIndex = cart.findIndex(item => String(item.id) === String(productId));
    if(existIndex !== -1){
      cart[existIndex].quantity = (cart[existIndex].quantity || 1) + 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name || "",
        price: Number(product.price) || 0,
        oldPrice: Number(product.oldPrice) || 0,
        img: product.img || "",
        quantity: 1
      });
    }

    await cartRef.set(cart);
    loadCartCount(); // cập nhật badge
    alert("✅ Đã thêm vào giỏ hàng");

  } catch(err){
    console.error("AddToCart Error:", err);
    alert("Lỗi khi thêm sản phẩm vào giỏ: "+err.message);
  }
};
