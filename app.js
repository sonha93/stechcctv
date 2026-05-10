/* =========================
   🔥 FIREBASE CONFIG & INIT
========================= */
import { initializeApp } from "https://gstatic.com";
import { getDatabase, ref, onValue } from "https://gstatic.com";

const firebaseConfig = {
  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain: "://firebaseapp.com",
  databaseURL: "https://firebasedatabase.app",
  projectId: "stech-73b89",
  storageBucket: "://appspot.com",
  messagingSenderId: "873739162979",
  appId: "1:873739162979:web:978f1a4043f025b1cdaf56"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Biến toàn cục để lưu sản phẩm lấy từ Firebase
let GLOBAL_PRODUCTS = [];

/* =========================
   🧠 NORMALIZE (Chuẩn hóa dữ liệu)
========================= */
function normalizeProduct(p, id) {
  return {
    ...p,
    id: id || p.id, // Ưu tiên ID từ Firebase Key
    price: Number(p.price) || 0,
    oldPrice: Number(p.oldPrice) || 0,
    name: p.name || "Sản phẩm không tên",
    img: p.img || "",
    featured: p.featured === true || p.featured === "true"
  };
}

/* =========================
   🖥 RENDER PRODUCTS
========================= */
function render(list) {
  const box = document.getElementById("products");
  if (!box) return;

  const category = getPageCategory();
  const isIndex = !["the-nho", "camera-trong-nha", "camera-ngoai-troi", "combo"].some(path => 
    window.location.pathname.toLowerCase().includes(path)
  );

  let displayList = list || GLOBAL_PRODUCTS;

  // Lọc theo Trang chủ (Sản phẩm nổi bật)
  if (isIndex) {
    displayList = displayList.filter(p => p.featured === true);
  } 
  // Lọc theo Danh mục
  else if (category) {
    displayList = displayList.filter(p => p.category === category);
  }

  box.innerHTML = "";
  if (displayList.length === 0) {
    box.innerHTML = "<p>Đang tải sản phẩm hoặc chưa có dữ liệu...</p>";
    return;
  }

  displayList.forEach(p => {
    const price = Number(p.price);
    const oldPrice = Number(p.oldPrice);
    const hasDiscount = oldPrice > price;
    const percent = hasDiscount ? Math.round((1 - price / oldPrice) * 100) : 0;

    box.innerHTML += `
      <div class="item">
        <img src="${p.img}" onclick="goDetail('${p.id}')" style="cursor:pointer;">
        <h4>${p.name}</h4>
        <div class="price-box">
          <span class="price">${price.toLocaleString()}đ</span>
          ${hasDiscount ? `<span class="old-price">${oldPrice.toLocaleString()}đ</span>` : ""}
          ${percent ? `<span class="discount-text">-${percent}%</span>` : ""}
        </div>
        <button class="spec-btn" onclick="goDetail('${p.id}')">⚙️ Xem chi tiết</button>
        <button class="cart-btn" onclick="addToCart('${p.id}')">🛒 Thêm vào giỏ</button>
      </div>
    `;
  });
}

/* =========================
   🛒 ADD TO CART (Sửa lỗi ID)
========================= */
window.addToCart = function(id) {
  // Tìm sản phẩm trong danh sách vừa lấy từ Firebase
  const product = GLOBAL_PRODUCTS.find(p => String(p.id) === String(id));

  if (!product) {
    alert("Lỗi: Không tìm thấy ID sản phẩm!");
    return;
  }

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const exist = cart.find(item => String(item.id) === String(id));

  if (exist) {
    exist.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.img,
      qty: 1
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`Đã thêm ${product.name} vào giỏ 🛒`);
};

/* =========================
   📡 LẤY DỮ LIỆU TỪ FIREBASE
========================= */
const productsRef = ref(db, 'products'); // Chắc chắn bảng trên Firebase là 'products'
onValue(productsRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    GLOBAL_PRODUCTS = Object.keys(data).map(key => normalizeProduct(data[key], key));
    render(GLOBAL_PRODUCTS);
  } else {
    render([]);
  }
});

/* =========================
   🔗 HÀM PHỤ TRỢ (Giữ nguyên logic của bạn)
========================= */
function getPageCategory() {
  const page = window.location.pathname.toLowerCase();
  if (page.includes("the-nho")) return "sd";
  if (page.includes("camera-trong-nha")) return "cam-in";
  if (page.includes("camera-ngoai-troi")) return "cam-ngoai";
  if (page.includes("combo")) return "combo";
  return null;
}

window.goDetail = function(id) {
  window.location.href = `logo.html?id=${id}`;
};
