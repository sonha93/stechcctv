import { auth, db } from "./firebase-init.js";

let currentPage = 1;
const perPage = 10;
let allOrders = [];

function format(n){
  return Number(n || 0).toLocaleString("vi-VN") + "đ";
}

/* =========================
LOAD ORDERS
========================= */
function loadOrders(userUid){

  const box = document.getElementById("orders");

  if(!box) return;

  db.collection("orders")
    .where("uid", "==", userUid)
    .onSnapshot(snapshot => {

      if(snapshot.empty){

        box.innerHTML = `
          <p>Chưa có đơn hàng</p>
        `;

        return;
      }

      allOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).reverse();

      renderOrders();

    });
}

/* =========================
RENDER
========================= */
function renderOrders(){

  const box = document.getElementById("orders");

  if(!box) return;

  box.innerHTML = "";

  let start = (currentPage - 1) * perPage;
  let end = start + perPage;

  let pageOrders = allOrders.slice(start,end);

  pageOrders.forEach(order => {

    let total = 0;

    let itemsHTML = "";

    (order.items || []).forEach(p => {

      const qty = p.qty || 1;

      const price = Number(p.price) || 0;

      const sub = qty * price;

      total += sub;

      itemsHTML += `
        <div class="item">

          <img src="${p.img || ''}" width="70">

          <div>

            <b>${p.name || ''}</b>

            <div>
              ${qty} × ${format(price)}
            </div>

            <div>
              = ${format(sub)}
            </div>

          </div>

        </div>

        <hr>
      `;
    });

    box.innerHTML += `
      <div class="order-box">

        <h3>
          🧾 Đơn hàng
        </h3>

        <p>
          🕒 ${order.time || ""}
        </p>

        ${itemsHTML}

        <h4>
          Tổng:
          ${format(total)}
        </h4>

      </div>
    `;
  });

  renderPagination();
}

/* =========================
PAGINATION
========================= */
function renderPagination(){

  const box = document.getElementById("orders");

  let totalPages =
    Math.ceil(allOrders.length / perPage);

  if(totalPages <= 1) return;

  let html = `
    <div style="margin-top:20px;text-align:center;">
  `;

  if(currentPage > 1){

    html += `
      <button onclick="changePage(${currentPage - 1})">
        ←
      </button>
    `;
  }

  html += `
    Trang ${currentPage}/${totalPages}
  `;

  if(currentPage < totalPages){

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
window.changePage = function(page){

  currentPage = page;

  renderOrders();
};

/* =========================
AUTH
========================= */
auth.onAuthStateChanged(user => {

  const box = document.getElementById("orders");

  if(!user){

    box.innerHTML = `
      <p>Vui lòng đăng nhập</p>
    `;

    return;
  }

  loadOrders(user.uid);

});
