import {
  collection,
  query,
  where,
  getDocs
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
FORMAT
========================= */

function format(n){

  return Number(n || 0)
    .toLocaleString("vi-VN") + "đ";
}

function formatDate(createdAt){

  try{

    if(!createdAt) return "";

    // NUMBER TIMESTAMP
    if(typeof createdAt === "number"){

      return new Date(createdAt)
        .toLocaleString("vi-VN");
    }

    // FIRESTORE TIMESTAMP
    if(createdAt.toDate){

      return createdAt
        .toDate()
        .toLocaleString("vi-VN");
    }

    return "";

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
    <p>Đang tải đơn hàng...</p>
  `;

  try{

    const q = query(

      collection(db, "orders"),

      where("uid", "==", userUid)

    );

    const snapshot =
      await getDocs(q);

    allOrders =
      snapshot.docs.map(doc => ({

        id: doc.id,

        ...doc.data()

      }));

    // SORT NEWEST
  allOrders.sort((a,b)=>{

  const timeA =
    a.createdAt?.toDate
      ? a.createdAt.toDate().getTime()
      : Number(a.createdAt || 0);

  const timeB =
    b.createdAt?.toDate
      ? b.createdAt.toDate().getTime()
      : Number(b.createdAt || 0);

  return timeB - timeA;

});

    console.log(allOrders);

    if(allOrders.length === 0){

      box.innerHTML = `
        <p>Chưa có đơn hàng</p>
      `;

      return;
    }

    currentPage = 1;

    renderOrders();

  }catch(err){

    console.error(err);

    box.innerHTML = `
      <p>Lỗi tải đơn hàng</p>
    `;
  }
}

/* =========================
RENDER
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

    items.forEach(p => {
const qty =
  Number(p.qty || 1);

const price =
  Number(p.price || 0);

const oldPrice =
  Number(
    p.oldPrice ||
    p.originalPrice ||
    price
  );
const sub =
  qty * price;

      total += sub;

      itemsHTML += `

        <div class="item" style="
          display:flex;
          gap:12px;
          margin-bottom:14px;
          padding-bottom:14px;
          border-bottom:1px solid #eee;
        ">

      <a href="logo.html?id=${p.productId || p.id}" style="display:inline-block;">
  <img
    src="${p.img || 'no-image.png'}"
    width="72"
    height="72"
    style="
      object-fit:cover;
      border-radius:10px;
      border:1px solid #ddd;
      cursor:pointer;
    "
  >
</a>
          <div>

            <b style="
              display:block;
              margin-bottom:6px;
            ">
              ${p.name || ""}
            </b>

         <div class="calc">

  <div style="
    color:#e53935;
    font-weight:bold;
    font-size:16px;
  ">
    ${format(price)}
  </div>

  ${
    oldPrice > price
    ? `
      <div style="
        text-decoration:line-through;
        color:#999;
        font-size:13px;
        margin-top:2px;
      ">
        ${format(oldPrice)}
      </div>
    `
    : ""
  }

  <div>
    ${qty} × ${format(price)}
    =
    ${format(sub)}
  </div>

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

      <div class="order-box" style="
        background:#fff;
        border-radius:14px;
        padding:20px;
        margin-bottom:20px;
        border:1px solid #ddd;
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

            <h3 style="
              margin-bottom:6px;
            ">
              🧾 Đơn #${order.id}
            </h3>

            <p style="
              color:#666;
              font-size:14px;
            ">
              🕒 ${formatDate(order.createdAt)}
            </p>

          </div>

          <div style="
            background:#fff3cd;
            color:#856404;
            padding:8px 14px;
            border-radius:999px;
            font-size:13px;
            font-weight:700;
          ">
            ${order.status || "pending"}
          </div>

        </div>

        ${itemsHTML}

        <div style="
          margin-top:18px;
          text-align:right;
          font-size:24px;
          font-weight:800;
          color:#d70018;
        ">
          ${format(total)}
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
      text-align:center;
      margin-top:20px;
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
      margin:0 12px;
      font-weight:700;
    ">
      Trang
      ${currentPage}/${totalPages}
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

  loadOrders(user.uid);

});
