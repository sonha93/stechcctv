import { auth, db } from "./firebase-init.js";

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

    const snapshot = await db
      .collection("orders")
      .where("uid", "==", userUid)
      .orderBy("createdAt", "desc")
      .get();

    allOrders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(allOrders);

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

    console.error(err);

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
RENDER
========================= */

function renderOrders(){

  const box =
    document.getElementById("orders");

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

items.slice(0,2).forEach(item => {

      const qty =
        Number(item.qty || 1);

      const price =
        Number(item.price || 0);

      const sub =
        qty * price;

      total += sub;

      itemsHTML += `

        <div class="item">

          <img
            src="${item.img || ''}"
          >

          <div style="flex:1;">

            <div style="
              font-weight:bold;
              margin-bottom:5px;
            ">
              ${item.name || ""}
            </div>

            <div class="sale-price">
              ${format(price)}
            </div>

            <div class="calc">
              ${qty} × ${format(price)}
            </div>

            <div style="
              color:#e53935;
              font-weight:bold;
              margin-top:4px;
            ">
              ${format(sub)}
            </div>

          </div>

        </div>

      `;
    });
let hiddenHTML = "";

if(items.length > 2){

  items.slice(2).forEach(item => {

    const qty =
      Number(item.qty || 1);

    const price =
      Number(item.price || 0);

    const sub = qty * price;

    hiddenHTML += `

      <div style="
        display:flex;
        gap:14px;
        padding:12px 0;
        border-bottom:1px solid #eee;
      ">

        <img
          src="${item.img || "no-image.png"}"
          width="72"
          height="72"
          style="
            object-fit:cover;
            border-radius:10px;
            border:1px solid #ddd;
          "
        >

        <div>

          <div style="
            font-weight:700;
          ">
            ${item.name || ""}
          </div>

          <div>
            ${qty} × ${format(price)}
          </div>

          <div style="
            color:#d70018;
            font-weight:700;
          ">
            ${format(sub)}
          </div>

        </div>

      </div>

    `;
  });

}
    box.innerHTML += `

      <div class="order-box">

        <div class="order-title">
          🧾 Đơn #${order.id}
        </div>

        <div style="
          color:#666;
          font-size:13px;
          margin-bottom:10px;
        ">
          ${formatDate(order.createdAt)}
        </div>

        ${itemsHTML}
        ${
  items.length > 2
  ? `
    <div
      onclick="toggleItems('${order.id}')"
      style="
        margin-top:10px;
        cursor:pointer;
        color:#0ea5e9;
        font-weight:700;
      "
    >
      và ${items.length - 2} sản phẩm khác ▼
    </div>

    <div
      id="more-${order.id}"
      style="display:none;"
    >
      ${hiddenHTML}
    </div>
  `
  : ""
}
        <div class="total-box">

          <div class="row final">
            <span>Tổng tiền</span>
            <b>${format(total)}</b>
          </div>

        </div>

      </div>

    `;
  });

}

/* =========================
AUTH
========================= */

auth.onAuthStateChanged(user => {

  const box =
    document.getElementById("orders");

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
window.toggleItems = function(id){

  const box =
    document.getElementById(`more-${id}`);

  if(!box) return;

  if(box.style.display === "none"){

    box.style.display = "block";

  }else{

    box.style.display = "none";

  }
};
