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

  const box =
    document.getElementById("orders");

  if(!box) return;

  box.innerHTML = `
    <p>Đang tải...</p>
  `;

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

    const data = snapshot.val() || {};

    console.log("ALL ORDERS:", data);

    allOrders = Object.keys(data)
      .map(key => {

        return {
          id: key,
          ...data[key]
        };

      })
      .filter(order => {

        return (

          order.uid === userUid ||

          order.userUid === userUid ||

          order.userId === userUid ||

          order?.user?.uid === userUid

        );

      })
      .sort((a,b) => {

        return (
          Number(b.createdAt || 0) -
          Number(a.createdAt || 0)
        );

      });

    console.log("FILTERED:", allOrders);

    if(allOrders.length === 0){

      box.innerHTML = `
        <p>Bạn chưa có đơn hàng</p>
      `;

      return;
    }

    currentPage = 1;

    renderOrders();

  }catch(err){

    console.error("LOAD ORDER ERROR:", err);

    box.innerHTML = `
      <p>Lỗi tải đơn hàng</p>
    `;
  }
}

/* =========================
RENDER ORDERS
========================= */
function renderOrders(){

  const box =
    document.getElementById("orders");

  if(!box) return;

  box.innerHTML = "";

  const start =
    (currentPage - 1) * perPage;

  const end =
    start + perPage;

  const pageOrders =
    allOrders.slice(start, end);

  pageOrders.forEach(order => {

    let total = 0;

    let itemsHTML = "";

    const items = Array.isArray(order.items)
      ? order.items
      : Object.values(order.items || {});

    if(items.length === 0){

      itemsHTML = `
        <p>Không có sản phẩm</p>
      `;
    }

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
          align-items:flex-start;
        ">

          <img
            src="${p.img || "no-image.png"}"
            width="70"
            height="70"
            style="
              object-fit:cover;
              border-radius:6px;
              border:1px solid #ddd;
              background:#fff;
            "
            onerror="this.src='no-image.png'"
          >

          <div>

            <b>
              ${p.name || "Sản phẩm"}
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
        background:#fff;
      ">

        <h3 style="
          margin-top:0;
        ">
          🧾 Đơn hàng #${order.id}
        </h3>

        <p>
          🕒 ${
            order.time ||
            (
              order.createdAt
              ? new Date(order.createdAt)
                .toLocaleString("vi-VN")
              : ""
            )
          }
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
    <span style="
      margin:0 10px;
    ">
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

  console.log(
    "LOGGED UID:",
    user.uid
  );

  loadOrders(user.uid);

});
