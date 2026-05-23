

import { auth, db } from "./firebase-init.js";

/* =========================
   CONFIG
========================= */
let currentPage = 1;
const perPage = 10;

let allOrders = [];

/* =========================
   FORMAT
========================= */
function format(n) {
  return Number(n || 0).toLocaleString("vi-VN") + "đ";
}

/* =========================
   LOAD ORDERS
========================= */
async function loadOrders(user) {

  const box = document.getElementById("orders");

  if (!box) return;

  const snapshot = await db
    .collection("orders")
    .where("uid", "==", user.uid)
    .get();

  if (snapshot.empty) {

    box.innerHTML = `
      <p style="padding:20px;text-align:center;">
        Chưa có đơn hàng
      </p>
    `;

    return;
  }

  allOrders = snapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    .sort((a, b) => b.createdAt - a.createdAt);

  currentPage = 1;

  renderOrders();
}

/* =========================
   RENDER ORDERS
========================= */
function renderOrders() {

  const box = document.getElementById("orders");

  if (!box) return;

  box.innerHTML = "";

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;

  const pageOrders = allOrders.slice(start, end);

  pageOrders.forEach(order => {

    let itemsHTML = "";

    (order.items || []).forEach(p => {

      const qty = p.qty || 1;
      const price = Number(p.price) || 0;
      const subTotal = qty * price;

      itemsHTML += `
        <div class="item">
          <img src="${p.img || 'no-image.png'}" />

          <div>
            <b>${p.name || "Sản phẩm"}</b>

            <div>
              ${qty} × ${format(price)}
            </div>

            <div>
              = ${format(subTotal)}
            </div>
          </div>
        </div>
      `;
    });

    box.innerHTML += `
      <div class="order-box">

        <h3>🧾 Đơn #${order.id}</h3>

        <p>👤 ${order.customer || ""}</p>

        <p>📧 ${order.email || ""}</p>

        <p>🕒 ${order.time || ""}</p>

        <p>
          📦 Trạng thái:
          <b>${order.status || "Đang xử lý"}</b>
        </p>

        <hr>

        ${itemsHTML}

        <p>
          <b>Tổng:</b>
          ${format(order.total || 0)}
        </p>

      </div>
    `;
  });

  renderPagination();
}

/* =========================
   PAGINATION
========================= */
function renderPagination() {

  const box = document.getElementById("orders");

  const totalPages = Math.max(
    1,
    Math.ceil(allOrders.length / perPage)
  );

  let html = `
    <div style="text-align:center;margin-top:15px;">
  `;

  if (currentPage > 1) {

    html += `
      <button onclick="changePage(${currentPage - 1})">
        ←
      </button>
    `;
  }

  html += `
    Trang ${currentPage}/${totalPages}
  `;

  if (currentPage < totalPages) {

    html += `
      <button onclick="changePage(${currentPage + 1})">
        →
      </button>
    `;
  }

  html += `</div>`;

  box.innerHTML += html;
}

/* =========================
   CHANGE PAGE
========================= */
window.changePage = function(page) {

  currentPage = page;

  renderOrders();
};

/* =========================
   AUTH
========================= */
auth.onAuthStateChanged(user => {

  const box = document.getElementById("orders");

  if (!box) return;

  if (user) {

    loadOrders(user);

  } else {

    box.innerHTML = `
      <p style="padding:20px;text-align:center;">
        Vui lòng đăng nhập
      </p>
    `;
  }
});
