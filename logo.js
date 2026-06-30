window.goDetail = function(id){
  window.location.href =
  `logo.html?id=${id}`;

};
/* =========================
   FIREBASE
========================= */

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",

  authDomain: "stech-73b89.firebaseapp.com",

  projectId: "stech-73b89",

  storageBucket: "stech-73b89.firebasestorage.app",

  messagingSenderId: "873739162979",

  appId: "1:873739162979:web:978f1a4043f025b1cdaf56"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { addToCart as firebaseAddToCart }
from "./cart.js";
const auth = getAuth(app); // Khởi tạo auth Modular
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
/* =========================
    CHỈ LOAD DỮ LIỆU CHO COMBO
========================= */

let allProducts = [];

/* =========================
   GET PRODUCTS
========================= */

async function getProducts(){

  try{

    const querySnapshot =
    await getDocs(
      collection(db,"products")
    );

    let arr = [];

   querySnapshot.forEach(doc => {
  const data = doc.data();

  arr.push({
    id: doc.id,
    name: data.name || "Không tên",
    img: data.img || "",
    category: data.category || "",
    price: Number(data.price) || 0,
    oldPrice: Number(data.oldPrice) || 0,
    featured: data.featured || false,
    spec: data.spec || {}
  });
});
  

    return arr;

  }

  catch(err){

    console.log(err);

    return [];

  }

}

/* =========================
   FIX DATA
========================= */

function fixData(list){

  return list.map(p => ({

    ...p,

    price:Number(p.price) || 0,

    oldPrice:Number(p.oldPrice) || 0

  }));

}

/* =========================
   RENDER
========================= */

function render(list){

  const box = document.getElementById("products");
  if(!box) return;

  list = fixData(list);

  /* chỉ load dữ liệu logo */
list = list.filter(
 p => p.category === "logo"
);
  box.innerHTML = "";

  if(list.length === 0){

    box.innerHTML =
      "<p>Chưa có sản phẩm</p>";

    return;

  }

  list.forEach(p => {

 const id =
String(p.id);

    const price =
      Number(p.price) || 0;

    const oldPrice =
      Number(p.oldPrice) || 0;

    const hasDiscount =
      oldPrice > price;

    const percent =
      hasDiscount
      ? Math.round(
          (1 - price / oldPrice) * 100
        )
      : 0;

    box.innerHTML += `
    <div class="item">

      ${
  percent
  ? `
    <div class="discount-badge">
      -${percent}%
    </div>
  `
  : ""
}

        <div class="img-box">

          <img
            src="${p.img || ''}"
            alt="${p.name || ''}"
          onclick="goDetail('${p.id}')"
            style="cursor:pointer;"
          >

        </div>

        <h4>
          ${p.name || "Không tên"}
        </h4>

       <div class="price-box">

  <span class="price">
    ${price.toLocaleString()}đ
  </span>

  <span class="old-price">
    ${oldPrice ? oldPrice.toLocaleString() + "đ" : ""}
  </span>

</div>
<button
  class="cart-btn"
 onclick="addToCart('${p.id}')"
>
  🛒 Thêm vào giỏ
</button>
      </div>

    `;

  });

}

/* =========================
   DETAIL
========================= */

window.addToCart = async function(id) {
  if (!allProducts || allProducts.length === 0) {
    alert("Sản phẩm chưa load xong, thử lại sau!");
    return;
  }

  // Thêm || p.id để tránh trường hợp dữ liệu cũ
const product = allProducts.find(
  p => String(p.id) === String(id)
);

if (!product) {
  alert("Không tìm thấy sản phẩm!");
  return;
}

  await firebaseAddToCart(product); // gọi cart.js
  await updateCartCount();

  alert("Đã thêm vào giỏ 🛒");
};
/* =========================
   SEARCH
========================= */

function initSearch(){

  const input = document.getElementById("searchInput");
  const box = document.getElementById("searchResults");

  if(!input || !box) return;

  input.addEventListener("input",e=>{

    const key=e.target.value.trim().toLowerCase();

    if(!key){
      box.innerHTML="";
      render(allProducts);
      return;
    }

    const result=allProducts.filter(p=>
      p.category==="logo" &&
      p.name.toLowerCase().includes(key)
    );

    render(result);
    renderSearchResults(result);

  });

  document.addEventListener("click",e=>{

    if(!e.target.closest(".search-box")){
      box.innerHTML="";
    }

  });

}
/* =========================
   MENU
========================= */

window.toggleMenu = function(){

  const sidebar =
  document.getElementById("sidebar");

  const overlay =
  document.getElementById("overlay");

  if(!sidebar || !overlay)
  return;

  sidebar.classList.toggle("active");

  overlay.classList.toggle("active");

};

/* =========================
   INIT
========================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    allProducts =
    await getProducts();

    render(allProducts);
    initSearch();
    onAuthStateChanged(auth, async(user)=>{

      if(user){

        await updateCartCount();

      }

    });

  }
);

/* =========================
   CART COUNT
========================= */

async function updateCartCount() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const cartRef = collection(db, "users", user.uid, "cart");
    const snapshot = await getDocs(cartRef);

    let total = 0;
    snapshot.forEach(docSnap => {
      const p = docSnap.data();
      total += p.qty || 1;
    });

    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
      cartCount.innerText = total;
    }

  } catch (err) {
    console.error("Lỗi updateCartCount:", err);
  }
}
function formatPrice(n){
  return Number(n || 0).toLocaleString() + "đ";
}

function renderSearchResults(list){

  const box = document.getElementById("searchResults");
  if(!box) return;

  box.innerHTML = "";

  if(list.length === 0){
    box.innerHTML = `<div style="padding:10px;">Không tìm thấy sản phẩm</div>`;
    return;
  }

  list.forEach(p=>{

    const div = document.createElement("div");
    div.className = "search-item";

    div.innerHTML = `
      <img src="${p.img}" onerror="this.src='https://via.placeholder.com/100'">

      <div class="search-info">

        <div class="search-name">${p.name}</div>

        <div class="search-price">
          ${formatPrice(p.price)}
        </div>

        ${
          p.oldPrice > p.price
          ? `<div class="search-oldprice">${formatPrice(p.oldPrice)}</div>`
          : ""
        }

      </div>
    `;

    div.onclick = ()=>{
      window.location.href=`logo.html?id=${p.id}`;
    };

    box.appendChild(div);

  });

}
