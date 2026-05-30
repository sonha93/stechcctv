

import { auth, db } from "./firebase-init.js";

let allOrders = [];
let currentPage = 1;
const perPage = 10;
// ============================
// ADMIN ORDERS
// ============================

const ordersTable = document.getElementById("ordersTable");
const totalOrders = document.getElementById("totalOrders");
const totalRevenue = document.getElementById("totalRevenue");

let currentAdmin = null;
// ============================
// SEARCH EVENT
// ============================
const searchInput =
  document.getElementById("searchOrder");

if (searchInput) {

  searchInput.addEventListener("input", () => {

    currentPage = 1;
    loadOrders();

  });

}
// ============================
// FORMAT PRICE
// ============================
function formatPrice(number) {
  return Number(number || 0).toLocaleString("vi-VN") + "đ";
}

// ============================
// FORMAT DATE
// ============================
function formatDate(timestamp) {

  if (!timestamp) return "-";

  try {

    let date;

    // firestore timestamp
    if (typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    }

    // timestamp number
    else if (typeof timestamp === "number") {
      date = new Date(timestamp);
    }

    // string
    else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) return "-";

    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  } catch (err) {
    return "-";
  }
}

// ============================
// CHECK ADMIN
// ============================
auth.onAuthStateChanged(async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentAdmin = user;

  loadOrders();
});

// ============================
// LOAD ORDERS
// ============================
async function loadOrders() {

  try {

    ordersTable.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;padding:20px;">
          Đang tải đơn hàng...
        </td>
      </tr>
    `;

    const snapshot = await db
      .collection("orders")
      .orderBy("createdAt", "desc")
      .get();

    // ============================
    // EMPTY
    // ============================
    if (snapshot.empty) {

      ordersTable.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;padding:20px;">
            Chưa có đơn hàng nào
          </td>
        </tr>
      `;

      if (totalOrders) {
        totalOrders.textContent = 0;
      }

      if (totalRevenue) {
        totalRevenue.textContent = formatPrice(0);
      }

      return;
    }

  let html = "";

// ============================
// SEARCH
// ============================
const searchKeyword =
  searchInput
    ? searchInput.value.trim().toLowerCase()
    : "";

// lưu toàn bộ orders
allOrders = snapshot.docs.filter(doc => {

  if (!searchKeyword) return true;

  return doc.id
    .toLowerCase()
    .includes(searchKeyword);

});

// ============================
// PAGINATION
// ============================
const start =
  (currentPage - 1) * perPage;

const end = start + perPage;

const pageOrders =
  allOrders.slice(start, end);

// ============================
// REVENUE
// ============================
let revenue = 0;

const revenueByDate = {};

// tính doanh thu toàn bộ
snapshot.forEach(doc => {

  const order = doc.data();

  if (
    order.status === "completed" &&
    !order.customerCancelled
  ) {

    revenue += Number(order.total || 0);

    let dateKey = "-";

    try {

      const dateObj =
        typeof order.createdAt?.toDate === "function"
          ? order.createdAt.toDate()
          : new Date(order.createdAt);

      dateKey = dateObj.toLocaleDateString("vi-VN");

    } catch {}

    if (!revenueByDate[dateKey]) {
      revenueByDate[dateKey] = 0;
    }

    revenueByDate[dateKey] +=
      Number(order.total || 0);
  }

});

// ============================
// RENDER TABLE
// ============================
pageOrders.forEach(doc => {

  const order = doc.data();

  const isCompleted =
    order.status === "completed";

  const isCustomerCancelled =
    order.customerCancelled === true;

  const lockStatus =
    isCompleted || isCustomerCancelled;

  html += `
    <tr>

      <td>${doc.id}</td>

      <td>
        ${order.customerName || "-"}<br>
        <small>${order.phone || ""}</small>
      </td>

      <td>
        ${order.address || "-"}
      </td>

      <td>
        ${renderProducts(order.items || [])}
      </td>

      <td>
        ${formatPrice(order.total)}
      </td>

      <td>

        ${order.customerCancelled ? `
          <span style="color:red;font-weight:bold;">
            Khách đã hủy
          </span>
        ` : ""}

      </td>

      <td>
        ${formatDate(order.createdAt)}
      </td>

      <td>

        <select
          class="order-status"
          data-id="${doc.id}"
          ${lockStatus ? "disabled" : ""}
        >

          <option value="pending"
            ${order.status === "pending" ? "selected" : ""}>
            Chờ xử lý
          </option>

          <option value="confirmed"
            ${order.status === "confirmed" ? "selected" : ""}>
            Đã xác nhận
          </option>

          <option value="shipping"
            ${order.status === "shipping" ? "selected" : ""}>
            Đang giao
          </option>

          <option value="completed"
            ${order.status === "completed" ? "selected" : ""}>
            Đã giao thành công
          </option>

          <option value="cancelled"
            ${order.status === "cancelled" ? "selected" : ""}>
            Đã hủy
          </option>

        </select>

        ${lockStatus ? `
          <div style="
            color:${isCustomerCancelled ? "red" : "green"};
            font-size:12px;
            margin-top:5px;
            font-weight:bold;
          ">
            ${
              isCustomerCancelled
                ? "Khách đã hủy đơn"
                : "Đã khóa trạng thái"
            }
          </div>
        ` : ""}

      </td>

    </tr>
  `;
});

// empty search
if (!html) {

  html = `
    <tr>
      <td colspan="8"
        style="text-align:center;padding:20px;">
        Không tìm thấy đơn hàng
      </td>
    </tr>
  `;
}
    ordersTable.innerHTML = html;
    renderPagination();
    // ============================
    // TOTAL ORDERS
    // ============================
    if (totalOrders) {
   totalOrders.textContent = allOrders.length;
    }

    // ============================
    // TOTAL REVENUE
    // ============================
    if (totalRevenue) {
      totalRevenue.textContent = formatPrice(revenue);
    }
    
const revenueBox =
  document.getElementById("revenueByDate");

if(revenueBox){

  let revenueHTML = "";

  Object.entries(revenueByDate)
    .sort((a,b) => {

      return new Date(b[0]) - new Date(a[0]);

    })
    .forEach(([date,total]) => {

      revenueHTML += `
        <div style="
          padding:8px 0;
          border-bottom:1px solid #eee;
        ">
          <b>${date}</b>:
          ${formatPrice(total)}
        </div>
      `;
    });

  revenueBox.innerHTML = revenueHTML;

}
    bindEvents();

  } catch (error) {

    console.error(error);

    ordersTable.innerHTML = `
      <tr>
        <td colspan="8"
          style="text-align:center;padding:20px;color:red;">
          Lỗi tải đơn hàng
        </td>
      </tr>
    `;
  }
}

// ============================
// RENDER PRODUCTS
// ============================
function renderProducts(items) {

  if (!items.length) return "-";

  return items.map(item => {

    return `
      <div style="margin-bottom:6px;">
        ${item.name || "Sản phẩm"} x${item.qty || 1}
      </div>
    `;

  }).join("");
}

// ============================
// BIND EVENTS
// ============================
function bindEvents() {

  // UPDATE STATUS
  document.querySelectorAll(".order-status").forEach(select => {

  // chống bind trùng
  if(select.dataset.bound === "true"){
    return;
  }

  select.dataset.bound = "true";

  select.addEventListener("change", async () => {

      const id = select.dataset.id;
      const status = select.value;

      try {

      const orderDoc = await db
  .collection("orders")
  .doc(id)
  .get();

if(!orderDoc.exists){

  alert("Đơn hàng không tồn tại");
  return;
}

const orderData = orderDoc.data();

// khách đã hủy
if(orderData.customerCancelled){

  alert(
    "Khách đã hủy đơn, không thể cập nhật trạng thái."
  );

  // reset select về cancelled
  select.value = "cancelled";

  // khóa luôn select
  select.disabled = true;

  return;
}
const updateData = {
  status: status
};

// nếu chuyển sang cancelled
// thì khóa luôn
if(status === "cancelled"){
  updateData.customerCancelled = true;
}

await db
  .collection("orders")
  .doc(id)
  .update(updateData);
        // completed => khóa
     if (
  status === "completed" ||
  status === "cancelled"
) {

  select.disabled = true;
}
        alert("Cập nhật trạng thái thành công");

      } catch (error) {

        console.error(error);
        alert("Lỗi cập nhật trạng thái");
      }
    });
  });
}

// ============================
// REALTIME UPDATE
// ============================
db.collection("orders")
  .orderBy("createdAt", "desc")
  .onSnapshot(() => {

    if (currentAdmin) {
      loadOrders();
    }

  });
// ============================
// PAGINATION
// ============================
function renderPagination() {

  const pagination =
    document.getElementById("pagination");

  if (!pagination) return;

  const totalPages =
    Math.ceil(allOrders.length / perPage);

  let html = "";

  for (let i = 1; i <= totalPages; i++) {

    html += `
      <button
        class="page-btn"
        data-page="${i}"
        style="
          margin:0 4px;
          padding:6px 10px;
          cursor:pointer;
          ${i === currentPage
            ? "background:black;color:white;"
            : ""}
        "
      >
        ${i}
      </button>
    `;
  }

  pagination.innerHTML = html;

  document
    .querySelectorAll(".page-btn")
    .forEach(btn => {

      btn.addEventListener("click", () => {

        currentPage =
          Number(btn.dataset.page);

        loadOrders();

      });

    });
}
