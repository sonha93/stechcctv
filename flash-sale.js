/* =========================
   🔥 FLASH SALE PRO MODULE
   CLEAN VERSION
========================= */

/* =========================
   CONFIG
========================= */

// CATEGORY cần lọc flash sale
const FLASH_CATEGORY = "cam-in";

// % giảm tối thiểu
const MIN_DISCOUNT = 11;

// thời gian countdown (giờ)
const FLASH_HOURS = 5;


/* =========================
   STATE
========================= */

let flashRendered = false;
let flashInterval = null;


/* =========================
   WAIT PRODUCTS LOAD
========================= */

const waitProducts = setInterval(() => {

  if (Array.isArray(window.allProducts) && window.allProducts.length > 0) {

    clearInterval(waitProducts);

    renderFlashSale();

  }

}, 500);


/* =========================
   RENDER FLASH SALE
========================= */

function renderFlashSale() {

  if (flashRendered) return; // chống render trùng

  if (!window.allProducts?.length) return;

  const products = window.allProducts.filter(p => {

    if (!p || !p.id || !p.img || !p.price || !p.oldPrice) return false;

    if (p.category !== FLASH_CATEGORY) return false;

    const percent = Math.round((1 - p.price / p.oldPrice) * 100);

    return percent >= MIN_DISCOUNT;

  });

  if (!products.length) return;

  let html = `
  <section class="flash-sale-wrap">
    <div class="flash-header">
      <div class="flash-left">⚡ FLASH SALE</div>

      <div class="flash-right">
        <span id="flashH">00</span> :
        <span id="flashM">00</span> :
        <span id="flashS">00</span>
      </div>
    </div>

    <div class="flash-products">
  `;

  products.forEach(p => {

    const percent = Math.round((1 - p.price / p.oldPrice) * 100);

    html += `
      <div class="flash-card">

        <div class="flash-percent">-${percent}%</div>

        <img src="${p.img}" onclick="goDetail('${p.id}')">

        <h3>${p.name}</h3>

        <div class="flash-price">
          <span class="new-price">${Number(p.price).toLocaleString()}đ</span>
          <span class="old-price">${Number(p.oldPrice).toLocaleString()}đ</span>
        </div>

        <button onclick="addToCart('${p.id}')">🛒 Thêm vào giỏ</button>

      </div>
    `;
  });

  html += `
    </div>
  </section>
  `;

  const box = document.getElementById("products");

  if (box) {
    box.insertAdjacentHTML("beforebegin", html);
  }

  flashRendered = true;

  startFlashTimer();
}


/* =========================
   TIMER (FIX CHỒNG INTERVAL)
========================= */

function startFlashTimer() {

  if (flashInterval) clearInterval(flashInterval);

  let total = FLASH_HOURS * 60 * 60;

  flashInterval = setInterval(() => {

    total--;

    if (total <= 0) {
      total = FLASH_HOURS * 60 * 60;
    }

    const h = String(Math.floor(total / 3600)).padStart(2, "0");
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");

    const hEl = document.getElementById("flashH");
    const mEl = document.getElementById("flashM");
    const sEl = document.getElementById("flashS");

    if (hEl) hEl.innerText = h;
    if (mEl) mEl.innerText = m;
    if (sEl) sEl.innerText = s;

  }, 1000);
}


/* =========================
   AUTO CSS (CLEAN)
========================= */

const style = document.createElement("style");

style.innerHTML = `
.flash-sale-wrap{
  margin:20px 0;
  background:#fff;
  border-radius:16px;
  overflow:hidden;
  box-shadow:0 3px 10px rgba(0,0,0,0.1);
}

.flash-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:14px;
  background:linear-gradient(90deg,#ff0000,#ff6600);
  color:#fff;
}

.flash-left{
  font-size:22px;
  font-weight:bold;
}

.flash-right{
  font-size:18px;
  font-weight:bold;
}

.flash-right span{
  background:#fff;
  color:#ff0000;
  padding:4px 8px;
  border-radius:6px;
}

.flash-products{
  display:flex;
  gap:12px;
  overflow-x:auto;
  padding:12px;
}

.flash-card{
  min-width:200px;
  border:1px solid #ddd;
  border-radius:14px;
  padding:10px;
  position:relative;
  background:#fff;
  flex-shrink:0;
  text-align:center;
}

.flash-card img{
  width:100%;
  height:170px;
  object-fit:cover;
  border-radius:10px;
  cursor:pointer;
}

.flash-card h3{
  font-size:15px;
  margin:10px 0;
}

.flash-percent{
  position:absolute;
  top:8px;
  left:8px;
  background:red;
  color:#fff;
  padding:4px 8px;
  border-radius:8px;
  font-size:12px;
  font-weight:bold;
}

.flash-price{
  margin:10px 0;
}

.new-price{
  color:red;
  font-weight:bold;
  display:block;
}

.old-price{
  color:#999;
  text-decoration:line-through;
  font-size:13px;
}

.flash-card button{
  width:100%;
  border:none;
  padding:10px;
  border-radius:10px;
  background:#111;
  color:#fff;
  cursor:pointer;
}

@media(max-width:768px){
  .flash-left{font-size:16px;}
  .flash-right{font-size:14px;}
  .flash-card{min-width:160px;}
  .flash-card img{height:130px;}
}
`;

document.head.appendChild(style);
