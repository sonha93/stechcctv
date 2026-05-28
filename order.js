
import { db } from "./firebase-init.js";

/* CONFIG */
let currentPage = 1;
const perPage = 10;
let allOrders = [];

/* FORMAT */
function format(n) {
  return Number(n || 0).toLocaleString("vi-VN") + "đ";
}

/* LOAD ORDERS */
async function loadOrders(){

  const box = document.getElementById("orders");

  if(!box) return;

  const snapshot = await db
    .collection("orders")
    .orderBy("createdAt", "desc")
    .get();

  allOrders = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  renderOrders();
}

/* RENDER ORDERS */
function renderOrders() {

  const box = document.getElementById("orders");

  if (!box) return;

  box.innerHTML = "";

  let start = (currentPage - 1) * perPage;
  let end = start + perPage;

  let pageOrders = allOrders.slice(start, end);
pageOrders.forEach(order => {

  let totalFinal = 0;

  let itemsHTML = "";

  (order.items || []).forEach(p => {

   let qty = p.quantity || 1;
    let price = Number(p.price) || 0;

    let subFinal = price * qty;

    totalFinal += subFinal;

    itemsHTML += `
      <div class="item">

        <img 
          src="${p.img || p.image || p.imageUrl || 'no-image.png'}"
        />

        <div>

          <b>${p.name || "Sản phẩm"}</b>

          <div>
            ${qty} × ${format(price)}
            =
            ${format(subFinal)}
          </div>

        </div>

      </div>
    `;
  });

  box.innerHTML += `
    <div class="order-box">

      <h3>
        🧾 Đơn #${order.orderId || "N/A"}
      </h3>

      <p>
        👤 ${order.customer || ""}
      </p>

      <p>
        📞 ${order.phone || ""}
      </p>

      <p>
        🕒 ${
  order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleString("vi-VN")
    : ""
}
      </p>

      <hr>

      ${itemsHTML}

      <p>
        <b>Tổng:</b>
        ${format(totalFinal)}
      </p>

    </div>
  `;
});

  renderPagination();

}

/* PAGINATION */
function renderPagination() {

  const box = document.getElementById("orders");

  let totalPages = Math.max(
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

  html += `
    </div>
  `;

  box.innerHTML += html;

}

/* CHANGE PAGE */
window.changePage = function(page) {

  currentPage = page;

  renderOrders();

};

/* INIT */
document.addEventListener(
  "DOMContentLoaded",
  loadOrders
);
