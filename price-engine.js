/* =========================
   📦 GET / SAVE DATA
========================= */
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

function saveProducts(list) {
  localStorage.setItem("products", JSON.stringify(list));
}

/* =========================
   🧠 NORMALIZE (CHỈ ÉP KIỂU - KHÔNG SỬA GIÁ)
========================= */
function normalizeProduct(p) {
  return {
    ...p,
    price: Number(p.price) || 0,
    oldPrice: Number(p.oldPrice) || 0,
    name: p.name || "",
    img: p.img || ""
  };
}

/* =========================
   ➕ ADD PRODUCT
========================= */
function addProduct(product) {
  let list = getProducts();

  const clean = normalizeProduct(product);

  list.push(clean);
  saveProducts(list);
}

/* =========================
   🔄 LOAD + FIX DATA 1 LẦN
========================= */
function loadProducts() {
  return getProducts().map(normalizeProduct);
}

/* =========================
   🖥️ RENDER
========================= */
function renderProducts(containerId = "products") {
  const box = document.getElementById(containerId);
  if (!box) return;

  const list = loadProducts();

  box.innerHTML = "";

  list.forEach(p => {
    box.innerHTML += `
      <div class="item">
        <img src="${p.img}" />
        <h3>${p.name}</h3>

        <div class="price-box">
          <span class="price">${formatPrice(p.price)}</span>
          ${p.oldPrice > p.price ? `<span class="old-price">${formatPrice(p.oldPrice)}</span>` : ""}
        </div>
      </div>
    `;
  });
}

/* =========================
   💰 FORMAT GIÁ
========================= */
function formatPrice(n) {
  return n.toLocaleString("vi-VN") + "đ";
}
function loadProducts() {
  return getProducts().map(p => ({
    ...p,
    price: Number(p.price) || 0,
    oldPrice: Number(p.oldPrice) || 0,

    // 🔥 XÓA HOÀN TOÀN DẤU VẾT KM
    salePrice: 0,
    saleStart: "",
    saleEnd: ""
  }));
}