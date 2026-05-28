import {
  get,
  ref
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
  auth,
  rtdb
} from "./firebase-init.js";

let currentPage = 1;
const perPage = 10;
let allOrders = [];

/* =========================
FORMAT MONEY
========================= */
function format(n){

  return Number(n || 0)
    .toLocaleString("vi-VN") + "đ";
}

/* =========================
LOAD ORDERS
========================= */
async function loadOrders(userUid){

  const box = document.getElementById("orders");

  if(!box) return;

  box.innerHTML = "<p>Đang tải...</p>";

  try{

    const snapshot = await get(
      ref(rtdb, "orders")
    );

    if(!snapshot.exists()){

      box.innerHTML = `
        <p>Chưa có đơn hàng</p>
      `;

      return;
    }

    const data = snapshot.val();

    console.log("Orders:", data);
    console.log("User UID:", userUid);

    allOrders = Object.keys(data || {})
      .map(key => ({

        id: key,
        ...data[key]

      }))
      .filter(order => {

        return (
          order.uid === userUid ||
          order.userUid === userUid
        );

      })
      .sort((a,b) => {

        return (
          Number(b.createdAt || 0) -
          Number(a.createdAt || 0)
        );

      });

    console.log("Filtered Orders:", allOrders);

    if(allOrders.length === 0){

      box.innerHTML = `
        <p>Bạn chưa có đơn hàng</p>
      `;

      return;
    }

    renderOrders();

  }catch(err){

    console.error(err);

    box.innerHTML = `
      <p>Lỗi tải đơn hàng</p>
    `;
  }
}

/* =========================
RENDER ORDERS
========================= */
function renderOrders(){

  const box = document.getElementById("orders");

  if(!box) return;

  box.innerHTML = "";

  const start =
    (currentPage - 1) * perPage;

  const end =
    start + perPage;

  const pageOrders =
    allOrders.slice(start,end);

  pageOrders.forEach(order => {

    let total = 0;

    let itemsHTML = "";

    const items = Array.isArray(order.items)
      ? order.items
      : Object.values(order.items || {});

    items.forEach(p => {

      const qty =
        Number(p.qty || 1);

      const price =
        Number(p.price || 0);

      const sub =
        qty * price;

      total += sub;

      itemsHTML += `
        <div class="item" style="
          display:flex;
          gap:10px;
          margin-bottom:10px;
        ">

          <img
            src="${p.img || ''}"
            width="70"
            height="70"
            style="
              object-fit:cover;
              border-radius:6px;
            "
          >

          <div>

            <b>
              ${p.name || ''}
            </b>

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
      <div class="order-box" style="
        border:1px solid #ddd;
        padding:15px;
        margin-bottom:20px;
        border-radius:10px;
      ">

        <h3>
          🧾 Đơn hàng #${order.id}
        </h3>

        <p>
          🕒 ${order.time || ''}
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

  const box =
    document.getElementById("orders");

  const totalPages =
    Math.ceil(
      allOrders.length / perPage
    );

  if(totalPages <= 1) return;

  let html = `
    <div style="
      margin-top:20px;
      text-align:center;
    ">
  `;

  if(currentPage > 1){

    html += `
      <button
        onclick="changePage(${currentPage - 1})"
      >
        ←
      </button>
    `;
  }

  html += `
    <span style="margin:0 10px;">
      Trang ${currentPage}/${totalPages}
    </span>
  `;

  if(currentPage < totalPages){

    html += `
      <button
        onclick="changePage(${currentPage + 1})"
      >
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

  const box =
    document.getElementById("orders");

  if(!box) return;

  if(!user){

    box.innerHTML = `
      <p>Vui lòng đăng nhập</p>
    `;

    return;
  }

  console.log("Logged in:", user.uid);

  loadOrders(user.uid);

});
