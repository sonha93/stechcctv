import {
  auth,
  db
} from "./firebase-init.js";

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

    const snapshot = await db
      .collection("orders")
      .where("uid","==",userUid)
      .get();

    allOrders = snapshot.docs.map(doc => ({

      id: doc.id,
      ...doc.data()

    }));

    allOrders.sort((a,b)=>{

      return new Date(b.time) -
             new Date(a.time);

    });

    console.log("ORDERS:", allOrders);

    if(allOrders.length === 0){

      box.innerHTML = `
        <p>Bạn chưa có đơn hàng</p>
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
    allOrders.slice(start,end);

  pageOrders.forEach(order=>{

    let total = 0;

    let itemsHTML = "";

    const items =
      Array.isArray(order.items)
      ? order.items
      : [];

    items.forEach(item=>{

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
          gap:10px;
          margin-bottom:10px;
        ">

          <img
            src="${item.img || ''}"
            width="70"
            height="70"
            style="
              object-fit:cover;
              border-radius:6px;
            "
          >

          <div>

            <b>
              ${item.name || ''}
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

        <h3>
          🧾 Đơn hàng #${order.id}
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
auth.onAuthStateChanged(user=>{

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
