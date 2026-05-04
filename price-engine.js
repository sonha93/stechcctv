/* =========================
   🔥 PRICE ENGINE FIXED STABLE
========================= */

function toTime(v){
  if(!v) return null;

  // hỗ trợ cả datetime-local (quan trọng)
  const t = new Date(v.replace("T", " ")).getTime();

  return isNaN(t) ? null : t;
}

/* =========================
   ⏰ CHECK SALE
========================= */
function isSaleActive(p){
  const start = toTime(p.saleStart);
  const end = toTime(p.saleEnd);

  if(!start || !end) return false;

  const now = Date.now();
  return now >= start && now <= end;
}

/* =========================
   💰 GIÁ GỐC CHUẨN TUYỆT ĐỐI
   (KHÔNG BAO GIỜ BỊ GHI ĐÈ)
========================= */
function getBasePrice(p){
  if(p.oldPrice && Number(p.oldPrice) > 0){
    return Number(p.oldPrice);
  }
  return Number(p.price);
}

/* =========================
   💰 GIÁ HIỆN TẠI CHUẨN
========================= */
function getFinalPrice(p){

  const base = getBasePrice(p);

  if(isSaleActive(p) && p.salePrice){
    return Number(p.salePrice);
  }

  return base;
}

/* =========================
   🛒 FIX CART PRICE (SAFE)
========================= */
function syncCartPrice(){

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let products = JSON.parse(localStorage.getItem("products")) || [];

  let changed = false;

  cart = cart.map(item => {

    const real = products.find(p => String(p.id) === String(item.id));
    if(!real) return item;

    const newPrice = getFinalPrice(real);

    if(Number(item.price) !== Number(newPrice)){
      item.price = newPrice;
      changed = true;
    }

    return item;
  });

  if(changed){
    localStorage.setItem("cart", JSON.stringify(cart));
  }
}

/* =========================
   🔁 AUTO SYNC (KHÔNG GÂY GIẬT)
========================= */
setInterval(syncCartPrice, 10000);
syncCartPrice();