// ==========================
// FIREBASE
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

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.database();

let currentUser = null;

// ==========================
// AUTH
// ==========================
auth.onAuthStateChanged(user => {

  if(!user){
    currentUser = null;
    return;
  }

  currentUser = user;

  loadCartCount();

});

// ==========================
// LOAD BADGE
// ==========================
function loadCartCount(){

  if(!currentUser) return;

  const cartRef = db.ref(
    "carts/" + currentUser.uid
  );

  cartRef.on("value", snapshot => {

    const cart = snapshot.val() || [];

    let total = 0;

    cart.forEach(item => {
      total += item.quantity || 1;
    });

    const badge =
      document.getElementById("cartCount");

    if(badge){
      badge.innerText = total;
    }

  });

}

// ==========================
// ADD TO CART FIREBASE
// ==========================
async function addToCartFirebase(product){

  if(!currentUser){

    alert("Bạn cần đăng nhập!");

    return;
  }

  const cartRef = db.ref(
    "carts/" + currentUser.uid
  );

  const snapshot =
    await cartRef.once("value");

  let cart = snapshot.val() || [];

  const existIndex = cart.findIndex(
    item =>
      String(item.id) === String(product.id)
  );

  if(existIndex !== -1){

    cart[existIndex].quantity =
      (cart[existIndex].quantity || 1) + 1;

  }else{

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

  alert("Đã thêm vào giỏ 🛒");

}
