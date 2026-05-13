/* =========================
   FIREBASE INIT
========================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain: "stech-73b89.firebaseapp.com",
  projectId: "stech-73b89",
  storageBucket: "stech-73b89.appspot.com",
  messagingSenderId: "873739162979",
  appId: "1:873739162979:web:978f1a4043f025b1cdaf56"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================
   FETCH PRODUCTS FROM FIRESTORE
========================= */
async function fetchProducts() {
  try {
    const querySnapshot = await getDocs(collection(db,"products"));
    let arr = [];
    querySnapshot.forEach(doc => {
      arr.push({
        id: doc.id,
        ...doc.data(),
        featured: doc.data().featured === true || doc.data().featured === "true"
      });
    });
    localStorage.setItem("products", JSON.stringify(arr));
    return arr;
  } catch(err){
    console.error(err);
    return [];
  }
}

/* =========================
   GET PRODUCTS FROM LOCALSTORAGE
========================= */
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

/* =========================
   NORMALIZE PRODUCT
========================= */
function normalizeProduct(p) {
  return {
    ...p,
    price: Number(p.price) || 0,
    oldPrice: Number(p.oldPrice) || 0,
    id: p.id || Date.now(),
    name: p.name || "",
    img: p.img || "",
    category: p.category || "",
    model: p.model || "",
    xuatXu: p.xuatXu || "",
    baoHanh: p.baoHanh || "",
    doPhanGiai: p.doPhanGiai || "",
    gocNhin: p.gocNhin || "",
    ketNoi: p.ketNoi || "",
    thietKe: p.thietKe || "",
    chatLieu: p.chatLieu || "",
    congSuat: p.congSuat || "",
    moTa: p.moTa || "",
    featured: p.featured === true || p.featured === "true"
  };
}

function normalizeList(list) {
  return list.map(normalizeProduct);
}

/* =========================
   PAGE CATEGORY
========================= */
function getPageCategory() {
  const page = window.location.pathname.toLowerCase();
  if(page.includes("the-nho")) return "sd";
  if(page.includes("camera-trong-nha")) return "cam-in";
  if(page.includes("camera-ngoai-troi")) return "cam-ngoai";
  if(page.includes("combo")) return "combo";
  return null;
}

/* =========================
   GO DETAIL
========================= */
window.goDetail = function(id){
  window.location.href = `logo.html?id=${id}`;
};


/* =========================
   RENDER PRODUCTS
========================= */
function render(list) {
  const box = document.getElementById("products");
  if(!box) return;

  const category = getPageCategory();

  const isIndex =
    !window.location.pathname.includes("the-nho") &&
    !window.location.pathname.includes("camera-trong-nha") &&
    !window.location.pathname.includes("camera-ngoai-troi") &&
    !window.location.pathname.includes("combo");

  if(!list) list = normalizeList(getProducts());

  if(isIndex){
    list = list.filter(p => p.featured === true);
  }

  if(!isIndex && category){
    list = list.filter(p => p.category === category);
  }

  box.innerHTML = "";

  if(list.length === 0){
    box.innerHTML = "<p>Chưa có sản phẩm</p>";
    return;
  }

  list.forEach(p => {

    const id = String(p.id);
    const price = Number(p.price) || 0;
    const oldPrice = Number(p.oldPrice) || 0;

    const hasDiscount = oldPrice > price;

    const percent = hasDiscount
      ? Math.round((1 - price / oldPrice) * 100)
      : 0;

    box.innerHTML += `
      <div class="item">

        ${percent ? `<div class="discount-text">-${percent}%</div>` : ""}

        <img
          src="${p.img}"
          onclick="goDetail('${id}')"
          style="cursor:pointer;"
        >

        <h4>${p.name}</h4>

        <div class="price-box">

          <span class="price">
            ${price.toLocaleString()}đ
          </span>

          ${
            hasDiscount
              ? `<span class="old-price">${oldPrice.toLocaleString()}đ</span>`
              : ""
          }

        </div>

        <button
          class="spec-btn"
          onclick="goDetail('${id}')"
        >
          ⚙️ Xem chi tiết
        </button>

        <button
          class="cart-btn"
         onclick='addToCart(${JSON.stringify(p)})'
        >
          🛒 Thêm vào giỏ
        </button>

      </div>
    `;

  });

}
/* =========================
   ADD TO CART
========================= */
/* =========================
   ADD TO CART
========================= */
window.addToCart = function(product){

  let cart =
    JSON.parse(localStorage.getItem("cart")) || [];

  const exist =
    cart.find(item =>
      String(item.id) === String(product.id)
    );

  if(exist){

    exist.qty = (exist.qty || 1) + 1;

  } else {

    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      img: product.img,
      qty: 1
    });

  }

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  alert("Đã thêm vào giỏ 🛒");
};

/* =========================
   MENU
========================= */
window.toggleMenu = function(){
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  if(!sidebar || !overlay) return;
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
};

/* =========================
   SEARCH
========================= */
const search = document.getElementById("search");
if(search){
  search.addEventListener("input", e => {
    const key = e.target.value.toLowerCase();
    let data = normalizeList(getProducts());
    const category = getPageCategory();
    const isIndex = !window.location.pathname.includes("the-nho") &&
                    !window.location.pathname.includes("camera-trong-nha") &&
                    !window.location.pathname.includes("camera-ngoai-troi") &&
                    !window.location.pathname.includes("combo");
    if(isIndex) data = data.filter(p => p.featured === true);
    if(!isIndex && category) data = data.filter(p => p.category === category);
    render(data.filter(p => (p.name || "").toLowerCase().includes(key)));
  });
}

/* =========================
   FIX OLD DATA
========================= */
function fixOldData(){
  let list = JSON.parse(localStorage.getItem("products")) || [];
  let changed = false;

  list = list.map(p => {
    let price = Number(p.price) || 0;
    let oldPrice = Number(p.oldPrice) || 0;
    if(oldPrice && oldPrice < price) [price, oldPrice] = [oldPrice, price];
    return {...p, price, oldPrice, model:p.model||"", xuatXu:p.xuatXu||"", baoHanh:p.baoHanh||"", doPhanGiai:p.doPhanGiai||"", gocNhin:p.gocNhin||"", ketNoi:p.ketNoi||"", thietKe:p.thietKe||"", chatLieu:p.chatLieu||"", congSuat:p.congSuat||"", moTa:p.moTa||""};
  });

  if(changed) localStorage.setItem("products", JSON.stringify(list));
}
fixOldData();

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  await fetchProducts(); // 🔹 load sản phẩm từ Firestore
  render();              // 🔹 render lại trang hiện tại (trang chủ + Featured)
});

/* =========================
   AUTO SLIDER
========================= */
const slider = document.querySelector(".product-slider");
let isTouching = false;
if(slider){
  slider.addEventListener("touchstart", ()=> isTouching = true);
  slider.addEventListener("touchend", ()=> isTouching = false);
  setInterval(()=>{
    if(isTouching) return;
    slider.scrollLeft += 0.5;
    if(slider.scrollLeft >= slider.scrollWidth - slider.clientWidth) slider.scrollLeft = 0;
  },20);
}


