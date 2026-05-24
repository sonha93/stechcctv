import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getDatabase,
ref,
onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* =========================
FIREBASE
========================= */
const firebaseConfig = {
apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
authDomain: "stech-73b89.firebaseapp.com",
databaseURL:
"https://stech-73b89-default-rtdb.asia-southeast1.firebasedatabase.app",
projectId: "stech-73b89",
storageBucket: "stech-73b89.appspot.com",
messagingSenderId: "873739162979",
appId: "1:873739162979:web:978f1a4043f025b1cdaf56"
};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

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
function loadOrders() {

const box = document.getElementById("orders");

if (!box) return;

onValue(ref(db, "orders"), (snapshot) => {

```
const data = snapshot.val();

if (!data) {

  box.innerHTML = `
    <p>Chưa có đơn hàng</p>
  `;

  return;
}

allOrders = [];

Object.values(data).forEach(userOrders => {

  Object.values(userOrders).forEach(order => {

    allOrders.push(order);

  });

});

allOrders.reverse();

renderOrders();

/* =========================
RENDER ORDERS
========================= */
function renderOrders() {

const box = document.getElementById("orders");

if (!box) return;

box.innerHTML = "";

let start = (currentPage - 1) * perPage;

let end = start + perPage;

let pageOrders = allOrders.slice(start, end);

pageOrders.forEach(order => {

```
let totalOld = 0;

let totalFinal = 0;

let itemsHTML = "";

(order.items || []).forEach(p => {

  let qty = p.qty || 1;

  let price = Number(p.price) || 0;

  let old = Number(p.oldPrice) || price;

  let subFinal = price * qty;

  let subOld = old * qty;

  totalFinal += subFinal;

  totalOld += subOld;

  itemsHTML += `
    <div class="item">

      <img src="${p.img || 'no-image.png'}" />

      <div>

        <b>${p.name}</b>

        <div>

          <div>${format(price)}</div>

          ${old > price
            ? `<div>${format(old)}</div>`
            : ""
          }

          <div>
            ${qty} × ${format(price)}
            =
            ${format(subFinal)}
          </div>

        </div>

      </div>

    </div>
  `;
});

let discount = totalOld - totalFinal;

box.innerHTML += `
  <div class="order-box">

    <h3>
      🧾 Đơn #${order.id || "N/A"}
    </h3>

    <p>
      👤 ${order.customer || ""}
    </p>

    <p>
      📞 ${order.phone || ""}
    </p>

    <p>
      📍 ${order.address || ""}
    </p>

    <p>
      🕒 ${order.time || ""}
    </p>

    <hr>

    ${itemsHTML}

    <p>
      <b>Tổng:</b>
      ${format(totalFinal)}
    </p>

  </div>
`;
```

});

renderPagination();
}

/* =========================
PAGINATION
========================= */
function renderPagination() {

const box = document.getElementById("orders");

let totalPages = Math.max(
1,
Math.ceil(allOrders.length / perPage)
);
let html = `     <div style="text-align:center;margin-top:15px;">
  `;

if (currentPage > 1) {

```
html += `
  <button onclick="changePage(${currentPage - 1})">
    ←
  </button>
`;
```

}

html += `     Trang ${currentPage}/${totalPages}
  `;

if (currentPage < totalPages) {

```
html += `
  <button onclick="changePage(${currentPage + 1})">
    →
  </button>
`;
```

}

html += `     </div>
  `;

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
INIT
========================= */
document.addEventListener(
"DOMContentLoaded",
loadOrders
);
