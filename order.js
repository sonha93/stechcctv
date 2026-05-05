/* =========================
   📦 GET ORDERS
========================= */
function getOrders(){
  return JSON.parse(localStorage.getItem("orders")) || [];
}

/* =========================
   ➕ ADD ORDER
========================= */
function addOrder(order){
  let list = getOrders();
  list.unshift(order);
  localStorage.setItem("orders", JSON.stringify(list));
  return true;
}

/* =========================
   💰 FORMAT TIỀN
========================= */
function format(n){
  return Number(n || 0).toLocaleString("vi-VN") + "đ";
}

/* =========================
   🔢 PAGINATION
========================= */
let currentPage = 1;
const perPage = 10;

/* =========================
   🖥️ RENDER ORDERS
========================= */
function renderOrders(){
  const box = document.getElementById("orders");
  if(!box) return;

  const orders = getOrders();

  if(orders.length === 0){
    box.innerHTML = "<p>Chưa có đơn hàng</p>";
    return;
  }

  box.innerHTML = "";

  // 👉 chia trang
  let start = (currentPage - 1) * perPage;
  let end = start + perPage;
  let pageOrders = orders.slice(start, end);

  pageOrders.forEach(order => {

    let totalOld = 0;
    let totalFinal = 0;

    let itemsHTML = "";

    order.cart.forEach(p => {

      let qty = p.qty || 1;
      let price = Number(p.price) || 0;
      let old = Number(p.oldPrice) || price;

      let subFinal = price * qty;
      let subOld = old * qty;

      totalFinal += subFinal;
      totalOld += subOld;

      itemsHTML += `
        <div class="item">
          <img src="${p.img}" />

          <div>
            <b>${p.name}</b>

            <div style="margin-top:5px;">
              <div class="price-new">
                ${format(price)}
              </div>

              ${
                old > price
                ? `<div class="price-old">${format(old)}</div>`
                : ""
              }

              <div class="calc">
                ${qty} × ${format(price)} = ${format(subFinal)}
              </div>
            </div>
          </div>
        </div>
      `;
    });

    let discount = totalOld - totalFinal;

    box.innerHTML += `
      <div class="order-box">

        <div class="order-header-wrap">
          <div style="width:70px;"></div>

          <div class="order-header">
            <h3>🧾 Đơn #${order.id}</h3>

            <p>👤 ${order.name || "Không có tên"}</p>
            <p>📞 ${order.phone || ""}</p>
            <p>📍 ${order.address || ""}</p>

            <p style="font-size:12px;color:#888;">
              🕒 ${order.time}
            </p>
          </div>
        </div>

        <hr>

        ${itemsHTML}

        <div class="total-box">
          <div class="row">
            <span>Tổng giá gốc</span>
            <b>${format(totalOld)}</b>
          </div>

          <div class="row discount">
            <span>Giảm giá</span>
            <b>-${format(discount)}</b>
          </div>

          <div class="row final">
            <span>Thanh toán</span>
            <b>${format(totalFinal)}</b>
          </div>
        </div>

      </div>
    `;
  });

  renderPagination(orders.length);
}

/* =========================
   🔘 PAGINATION UI
========================= */
function renderPagination(total){
  let totalPages = Math.ceil(total / perPage);
  let html = `<div style="text-align:center;margin-top:15px;">`;

  if(currentPage > 1){
    html += `<button onclick="changePage(${currentPage - 1})">←</button>`;
  }

  html += ` Trang ${currentPage}/${totalPages} `;

  if(currentPage < totalPages){
    html += `<button onclick="changePage(${currentPage + 1})">→</button>`;
  }

  html += `</div>`;

  document.getElementById("orders").innerHTML += html;
}

/* =========================
   🔁 CHANGE PAGE
========================= */
function changePage(page){
  currentPage = page;
  renderOrders();
}

/* =========================
   🚀 INIT
========================= */
document.addEventListener("DOMContentLoaded", renderOrders);