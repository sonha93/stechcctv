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
            src="${p.img || "no-image.png"}"
            width="70"
            height="70"
            style="
              object-fit:cover;
              border-radius:8px;
              border:1px solid #ddd;
            "
          >

          <div>

            <b>
              ${p.name || ""}
            </b>

            <div>
              ${qty} × ${format(price)}
            </div>

            <div>
              = ${format(sub)}
            </div>

          </div>

        </div>

      `;
    });

    box.innerHTML += `

      <div class="order-box" style="
        background:#fff;
        border-radius:10px;
        padding:15px;
        margin-bottom:20px;
        border:1px solid #ddd;
      ">

        <h3>
          🧾 Đơn #${order.id}
        </h3>

        <p>
          🕒 ${
            order.createdAt
            ? new Date(order.createdAt)
              .toLocaleString("vi-VN")
            : ""
          }
        </p>

        <p>
          📦 ${
            order.status || "pending"
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
      margin:0 10px;
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
