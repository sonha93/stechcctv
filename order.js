import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  auth,
  db
} from "./firebase-init.js";

/* =========================
STATE
========================= */

let currentPage = 1;

const perPage = 10;

let allOrders = [];

/* =========================
FORMAT PRICE
========================= */

function format(n){

  return Number(n || 0)
    .toLocaleString("vi-VN") + "đ";
}

/* =========================
FORMAT DATE
========================= */

function formatDate(createdAt){

  try{

    if(!createdAt) return "";

    // FIREBASE TIMESTAMP
    if(createdAt.toDate){

      return createdAt
        .toDate()
        .toLocaleString("vi-VN");
    }

    // NUMBER / STRING
    return new Date(createdAt)
      .toLocaleString("vi-VN");

  }catch{

    return "";
  }
}

/* =========================
LOAD ORDERS
========================= */

async function loadOrders(userUid){

  const box =
    document.getElementById("orders");

  if(!box) return;

  box.innerHTML = `
    <div style="
      padding:30px;
      text-align:center;
      color:#666;
    ">
      Đang tải đơn hàng...
    </div>
  `;

  try{

    /* =========================
    FIX FIELD UID
    ========================= */

   const q = query(

  collection(db, "orders"),

  where("uid", "==", userUid),

  orderBy("createdAt", "desc")

);

    const snapshot =
      await getDocs(q);

    allOrders =
      snapshot.docs.map(doc => ({

        id: doc.id,

        ...doc.data()

      }));

    console.log("ORDERS:", allOrders);

    if(allOrders.length === 0){

      box.innerHTML = `
        <div style="
          padding:40px;
          text-align:center;
          color:#666;
        ">
          🧾 Chưa có đơn hàng
        </div>
      `;

      return;
    }

    currentPage = 1;

    renderOrders();

  }catch(err){

    console.error("LOAD ORDER ERROR:", err);

    box.innerHTML = `
      <div style="
        padding:40px;
        text-align:center;
        color:red;
      ">
        ❌ Lỗi tải đơn hàng
      </div>
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

    const items =
      Array.isArray(order.items)
      ? order.items
      : [];

    items.forEach(item => {

      const qty =
        Number(item.qty || 1);

      const price =
        Number(item.price || 0);

      const sub =
        qty * price;

      total += sub;

      itemsHTML += `

        <div style="
          display:flex;
          gap:14px;
          padding:12px 0;
          border-bottom:1px solid #eee;
        ">

          <img
            src="${item.img || "no-image.png"}"
            onerror="this.src='no-image.png'"
            width="72"
            height="72"
            style="
              object-fit:cover;
              border-radius:10px;
              border:1px solid #ddd;
              flex-shrink:0;
            "
          >

          <div style="
            flex:1;
          ">

            <div style="
              font-weight:700;
              margin-bottom:6px;
              line-height:1.5;
            ">
              ${item.name || ""}
            </div>

            <div style="
              color:#666;
              font-size:14px;
            ">
              ${qty} × ${format(price)}
            </div>

            <div style="
              color:#d70018;
              font-weight:700;
              margin-top:4px;
            ">
              ${format(sub)}
            </div>

          </div>

        </div>

      `;
    });

    box.innerHTML += `

      <div style="
        background:#fff;
        border-radius:18px;
        padding:22px;
        margin-bottom:22px;
        border:1px solid #e5e7eb;
        box-shadow:0 2px 10px rgba(0,0,0,.03);
      ">

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:18px;
          flex-wrap:wrap;
          gap:10px;
        ">

          <div>

            <div style="
              font-size:18px;
              font-weight:800;
              margin-bottom:6px;
            ">
              🧾 Đơn #${order.id}
            </div>

            <div style="
              color:#666;
              font-size:14px;
            ">
              🕒 ${formatDate(order.createdAt)}
            </div>

          </div>

          <div style="
            padding:8px 14px;
            border-radius:999px;
            background:#fff3cd;
            color:#856404;
            font-size:13px;
            font-weight:700;
          ">
            ${order.status || "pending"}
          </div>

        </div>

        ${itemsHTML}

        <div style="
          margin-top:18px;
          display:flex;
          justify-content:flex-end;
          align-items:center;
          gap:10px;
        ">

          <span style="
            color:#666;
          ">
            Tổng:
          </span>

          <span style="
            font-size:24px;
            font-weight:800;
            color:#d70018;
          ">
            ${format(total)}
          </span>

        </div>

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

  if(!box) return;

  const totalPages =
    Math.ceil(
      allOrders.length / perPage
    );

  if(totalPages <= 1) return;

  let html = `

    <div style="
      display:flex;
      justify-content:center;
      align-items:center;
      gap:10px;
      margin-top:30px;
    ">

  `;

  if(currentPage > 1){

    html += `

      <button
        onclick="changePage(${currentPage - 1})"
        style="
          height:42px;
          padding:0 18px;
          border:none;
          border-radius:12px;
          cursor:pointer;
          font-weight:700;
        "
      >
        ←
      </button>

    `;
  }

  html += `

    <div style="
      font-weight:700;
    ">
      Trang ${currentPage}/${totalPages}
    </div>

  `;

  if(currentPage < totalPages){

    html += `

      <button
        onclick="changePage(${currentPage + 1})"
        style="
          height:42px;
          padding:0 18px;
          border:none;
          border-radius:12px;
          cursor:pointer;
          font-weight:700;
        "
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

      <div style="
        padding:40px;
        text-align:center;
        color:#666;
      ">
        🔐 Vui lòng đăng nhập
      </div>

    `;

    return;
  }

  loadOrders(user.uid);

});
