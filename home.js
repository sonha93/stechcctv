import { auth, db } from "./firebase-init.js";
import { addToCart } from "./cart.js"; // từ cart.js

let allProducts = [];

// Fetch products Firestore
async function getProducts(){
  const snapshot = await db.collection("products").get();
  const arr = [];
  snapshot.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
  return arr;
}

// Render products
function render(list){
  const box = document.getElementById("products");
  if(!box) return;
  box.innerHTML = "";
  list.forEach(p => {
    const id = String(p.id);
    const price = Number(p.price) || 0;
    const oldPrice = Number(p.oldPrice) || 0;
    const percent = oldPrice > price ? Math.round((1 - price/oldPrice)*100) : 0;

    box.innerHTML += `
      <div class="item">
        ${percent ? `<div class="discount-badge">-${percent}%</div>` : ""}
        <div class="img-box">
          <img src="${p.img}" alt="${p.name}" onclick="goDetail('${id}')" style="cursor:pointer;">
        </div>
        <h4>${p.name}</h4>
        <div class="price-box">
          <span class="price">${price.toLocaleString()}đ</span>
          ${hasDiscount ? `<span class="old-price">${oldPrice.toLocaleString()}đ</span>` : ""}
        </div>
        <button class="cart-btn" onclick="addToCartHandler('${id}')">🛒 Thêm vào giỏ</button>
      </div>`;
  });
}

window.goDetail = function(id){ window.location.href = `logo.html?id=${id}`; };

window.addToCartHandler = async function(id){
  const user = auth.currentUser;
  if(!user){ alert("Vui lòng đăng nhập!"); return; }
  const product = allProducts.find(p => String(p.id) === String(id));
  if(!product) return;
  await addToCart({ id: product.id, name: product.name, price: product.price, img: product.img, qty:1 });
  alert("Đã thêm vào giỏ 🛒");
};

document.addEventListener("DOMContentLoaded", async () => {
  allProducts = await getProducts();
  render(allProducts);
});
