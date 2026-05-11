/* =========================
   🔥 HOME PAGE JS
========================= */

/* =========================
   FIRESTORE INIT
========================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
   GET PRODUCTS FROM FIRESTORE
========================= */
let allProducts = [];

async function getProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    let arr = [];
    querySnapshot.forEach(doc => {
      arr.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return arr;
  } catch (err) {
    console.log(err);
    return [];
  }
}

/* =========================
   RENDER SPEC
========================= */
function renderSpec(p) {
  const s = p.spec || {};
  return `
    - Độ phân giải: ${s.doPhanGiai || "—"}<br>
    - Góc nhìn: ${s.gocNhin || "—"}<br>
    - Kết nối: ${s.ketNoi || "—"}<br>
    - Bảo hành: ${s.baoHanh || "—"}<br>
  `;
}

/* =========================
   RENDER HOME
========================= */
function renderHome() {
  const box = document.getElementById("products");
  if (!box) return;

  // Chỉ lấy sản phẩm category "home" hoặc featured
  const featured = allProducts.filter(p => p.featured === true && p.category === "home");

  box.innerHTML = "";

  if (featured.length === 0) {
    box.innerHTML = "<p>Chưa có sản phẩm nổi bật</p>";
    return;
  }

  featured.forEach(p => {
    const id = String(p.id);
    let percentText = "";
    if (p.oldPrice && p.oldPrice > p.price) {
      const percent = Math.round((1 - p.price / p.oldPrice) * 100);
      percentText = `-${percent}%`;
    }
    let imgUrl = p.img || "https://via.placeholder.com/300";

    box.innerHTML += `
      <div class="item">
        <img 
          src="${imgUrl}" 
          onclick="openZoom('${imgUrl}')"
          onerror="this.src='https://via.placeholder.com/300'"
        >
        <h4>${p.name}</h4>
        <div class="price-box">
          <span class="price">${Number(p.price).toLocaleString()}đ</span>
          ${p.oldPrice && p.oldPrice > p.price ? `<span class="old-price">${Number(p.oldPrice).toLocaleString()}đ</span>` : ""}
          ${percentText ? `<span class="discount-text">${percentText}</span>` : ""}
        </div>
        <button class="spec-btn" onclick="toggleSpec('${id}')">⚙️ Xem thông số</button>
        <button class="cart-btn" onclick="addToCart('${id}')">🛒 Mua ngay</button>
        <div class="spec-box" id="spec-${id}" style="display:none;">${renderSpec(p)}</div>
      </div>
    `;
  });
}

/* =========================
   TOGGLE SPEC
========================= */
window.toggleSpec = function(id){
  const el = document.getElementById("spec-" + id);
  if (!el) return;
  el.style.display = (el.style.display === "block") ? "none" : "block";
};

/* =========================
   ADD TO CART
========================= */
window.addToCart = function(id){
  const product = allProducts.find(p => String(p.id) === String(id));
  if (!product) return;
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const exist = cart.find(item => String(item.id) === String(id));
  if (exist) exist.quantity = (exist.quantity || 1) + 1;
  else cart.push({...product, quantity:1});
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Đã thêm vào giỏ 🛒");
};

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
  allProducts = await getProducts();
  renderHome();
});
