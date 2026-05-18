
/* =========================
   🔥 FLASH SALE MODULE
   FILE: flash-sale.js
========================= */

/* =========================
   CÀI ĐẶT
========================= */

/*
  ĐỔI CATEGORY Ở ĐÂY
  ví dụ:
  "camera-trong-nha"
  "camera-ngoai-troi"
  "the-nho"
  "combo"

*/

const FLASH_CATEGORY = "camera-ngoai-troi";

/*
  % GIẢM TỐI THIỂU
*/

const MIN_DISCOUNT = 11;


/* =========================
   ĐỢI PRODUCTS LOAD
========================= */

const waitProducts = setInterval(()=>{

  if(window.allProducts){

    clearInterval(waitProducts);

    renderFlashSale();

  }

},500);


/* =========================
   RENDER FLASH SALE
========================= */

function renderFlashSale(){

  const allProducts =
    window.allProducts || [];

  /* FILTER */

  const products = allProducts.filter(p=>{

    /* ĐÚNG CATEGORY */

    if(p.category !== FLASH_CATEGORY)
      return false;

    /* CÓ GIÁ CŨ */

    if(!p.oldPrice)
      return false;

    /* % GIẢM */

    const percent = Math.round(
      (1 - p.price / p.oldPrice) * 100
    );

    return percent >= MIN_DISCOUNT;

  });

  if(products.length <= 0) return;

  /* HTML */

  let html = `

  <section class="flash-sale-wrap">

    <div class="flash-header">

      <div class="flash-left">

        ⚡ FLASH SALE

      </div>

      <div class="flash-right">

        <span id="flashH">00</span> :
        <span id="flashM">00</span> :
        <span id="flashS">00</span>

      </div>

    </div>

    <div class="flash-products">

  `;

  /* LOOP */

  products.forEach(p=>{

    const percent = Math.round(
      (1 - p.price / p.oldPrice) * 100
    );

    html += `

    <div class="flash-card">

      <div class="flash-percent">
        -${percent}%
      </div>

      <img
        src="${p.img}"
        onclick="goDetail('${p.id}')"
      >

      <h3>${p.name}</h3>

      <div class="flash-price">

        <span class="new-price">
          ${Number(p.price).toLocaleString()}đ
        </span>

        <span class="old-price">
          ${Number(p.oldPrice).toLocaleString()}đ
        </span>

      </div>

      <button
        onclick="addToCart('${p.id}')"
      >
        🛒 Thêm vào giỏ
      </button>

    </div>

    `;

  });

  html += `
    </div>
  </section>
  `;

  /* CHÈN VÀO WEB */

  const productsBox =
    document.getElementById("products");

  if(productsBox){

    productsBox.insertAdjacentHTML(
      "beforebegin",
      html
    );

  }

  startFlashTimer();

}


/* =========================
   TIMER
========================= */

function startFlashTimer(){

  let total = 5 * 60 * 60;

  setInterval(()=>{

    total--;

    if(total <= 0){

      total = 5 * 60 * 60;

    }

    const h = String(
      Math.floor(total / 3600)
    ).padStart(2,"0");

    const m = String(
      Math.floor((total % 3600)/60)
    ).padStart(2,"0");

    const s = String(
      total % 60
    ).padStart(2,"0");

    document.getElementById("flashH").innerText = h;
    document.getElementById("flashM").innerText = m;
    document.getElementById("flashS").innerText = s;

  },1000);

}


/* =========================
   CSS AUTO
========================= */

const style = document.createElement("style");

style.innerHTML = `

.flash-sale-wrap{

  margin:20px 0;
  background:#fff;
  border-radius:16px;
  overflow:hidden;

  box-shadow:
  0 3px 10px rgba(0,0,0,0.1);

}

/* HEADER */

.flash-header{

  display:flex;
  justify-content:space-between;
  align-items:center;

  padding:14px;

  background:
  linear-gradient(
    90deg,
    #ff0000,
    #ff6600
  );

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

/* PRODUCTS */

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

/* DISCOUNT */

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

/* PRICE */

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

/* BUTTON */

.flash-card button{

  width:100%;

  border:none;

  padding:10px;

  border-radius:10px;

  background:#111;
  color:#fff;

  cursor:pointer;

}

/* MOBILE */

@media(max-width:768px){

  .flash-left{

    font-size:16px;

  }

  .flash-right{

    font-size:14px;

  }

  .flash-card{

    min-width:160px;

  }

  .flash-card img{

    height:130px;

  }

}

`;

document.head.appendChild(style);           
