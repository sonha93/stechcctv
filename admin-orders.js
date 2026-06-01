import { auth, db } from "./firebase-init.js";
let allSnapshotOrders = [];
let allOrders = [];
let revenueByDate = {};

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
function getStatusText(status){

  switch(status){

    case "pending":
      return "Chờ xử lý";

    case "confirmed":
      return "Đã xác nhận";

    case "shipping":
      return "Đang giao";

    case "completed":
      return "Đã giao thành công";

    case "cancelled":
      return "Đã hủy";

    default:
      return "-";
  }
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
// FILTER DATE EVENT
// ============================

const filterDate =
  document.getElementById("filterDate");

const clearDate =
  document.getElementById("clearDate");


// mặc định ngày hôm nay
if (filterDate) {

  const today = new Date();

  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  filterDate.value = `${yyyy}-${mm}-${dd}`;

}

// ============================
// FILTER REVENUE RANGE
// ============================

const startDate =
  document.getElementById("startDate");

const endDate =
  document.getElementById("endDate");

const filterRangeBtn =
  document.getElementById("filterRangeBtn");

if(filterRangeBtn){

  filterRangeBtn.addEventListener("click", () => {

    let total = 0;

    const start =
      startDate?.value
        ? new Date(startDate.value)
        : null;

    const end =
      endDate?.value
        ? new Date(endDate.value)
        : null;

    // set cuối ngày
    if(end){
      end.setHours(23,59,59,999);
    }

  allSnapshotOrders.forEach(doc => {
      const order = doc.data();

      // chỉ tính completed
      if(
        order.status !== "completed" ||
        order.customerCancelled ||
        order.adminCancelled
      ){
        return;
      }

      try{

        const dateObj =
          typeof order.createdAt?.toDate === "function"
            ? order.createdAt.toDate()
            : new Date(order.createdAt);

        // lọc từ ngày
        if(start && dateObj < start){
          return;
        }

        // lọc đến ngày
        if(end && dateObj > end){
          return;
        }

        total += Number(order.total || 0);

      }catch(err){}
    });
let revenueHTML = "";

Object.entries(revenueByDate)
  .sort((a,b)=>new Date(b[0])-new Date(a[0]))
  .forEach(([date,total])=>{

    const currentDate = new Date(date + "T23:59:59");

    if(start && currentDate < start){
      return;
    }

    if(end && currentDate > end){
      return;
    }
    revenueHTML += `
      <div style="
        padding:8px 0;
        border-bottom:1px solid #eee;
      ">
        <b>
          ${currentDate.toLocaleDateString("vi-VN")}
        </b>
        :
        ${formatPrice(total)}
      </div>
    `;
  });

document.getElementById("rangeRevenueDetail").innerHTML =
  revenueHTML || "Không có doanh thu";
    const rangeRevenue =
      document.getElementById("rangeRevenue");

    if(rangeRevenue){
      rangeRevenue.textContent =
        formatPrice(total);
    }

  });

}

if(filterDate){

  filterDate.addEventListener("change", () => {

    currentPage = 1;
    loadOrders();

  });

}

if(clearDate){

clearDate.addEventListener("click", () => {

  filterDate.value = "";

  currentPage = 1;

  loadOrders();

});

}

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
allSnapshotOrders = snapshot.docs;
    // ============================
    // EMPTY
    // ============================
    if (snapshot.empty) {
renderPagination();
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
// ============================
// SEARCH + FILTER DATE
// ============================

const searchKeyword =
  searchInput
    ? searchInput.value.trim().toLowerCase()
    : "";

const selectedDate =
  filterDate?.value || "";

// lưu toàn bộ orders
allOrders = snapshot.docs.filter(doc => {
  const order = doc.data();

  // SEARCH ID
  const matchSearch =
    !searchKeyword ||
    doc.id
      .toLowerCase()
      .includes(searchKeyword);

  // FILTER DATE
  let matchDate = true;

  if(selectedDate){

    try{

      const dateObj =
        typeof order.createdAt?.toDate === "function"
          ? order.createdAt.toDate()
          : new Date(order.createdAt);

      const yyyy =
        dateObj.getFullYear();

      const mm = String(
        dateObj.getMonth() + 1
      ).padStart(2,"0");

      const dd = String(
        dateObj.getDate()
      ).padStart(2,"0");

      const orderDate =
        `${yyyy}-${mm}-${dd}`;

      matchDate =
        orderDate === selectedDate;

    }catch{

      matchDate = false;

    }

  }

  return matchSearch && matchDate;

});
 const totalPages =
  Math.ceil(allOrders.length / perPage) || 1;

if(currentPage > totalPages){
  currentPage = 1;
}
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

revenueByDate = {};

let pendingCount = 0;
let shippingCount = 0;
let completedCount = 0;
let cancelledCount = 0;
    
// tính doanh thu toàn bộ
snapshot.forEach(doc => {

  const order = doc.data();
if(selectedDate){

  try{

    const dateObj =
      typeof order.createdAt?.toDate === "function"
        ? order.createdAt.toDate()
        : new Date(order.createdAt);

    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2,"0");
    const dd = String(dateObj.getDate()).padStart(2,"0");

    const orderDate = `${yyyy}-${mm}-${dd}`;

    if(orderDate !== selectedDate){
      return;
    }

  }catch{
    return;
  }
}
  // ============================
// COUNT STATUS
// ============================

if(order.status === "pending"){
  pendingCount++;
}

if(order.status === "shipping"){
  shippingCount++;
}

if(
  order.status === "completed" &&
  !order.customerCancelled &&
  !order.adminCancelled
){
  completedCount++;
}

if(
  order.status === "cancelled" ||
  order.customerCancelled ||
  order.adminCancelled
){
  cancelledCount++;
}
 if (
  order.status === "completed" &&
  !order.customerCancelled &&
  !order.adminCancelled
) {

    revenue += Number(order.total || 0);

    let dateKey = "-";

    try {

      const dateObj =
        typeof order.createdAt?.toDate === "function"
          ? order.createdAt.toDate()
          : new Date(order.createdAt);

   const yyyy = dateObj.getFullYear();
const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
const dd = String(dateObj.getDate()).padStart(2, "0");

dateKey = `${yyyy}-${mm}-${dd}`;

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

const isAdminCancelled =
  order.adminCancelled === true;

const lockStatus =
  isCompleted ||
  isCustomerCancelled ||
  isAdminCancelled;
 
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

    
${
  order.customerCancelled
  ? `
    <span style="
      background:#ffebee;
      color:#d32f2f;
      padding:5px 10px;
      border-radius:20px;
      font-size:12px;
      font-weight:bold;
      display:inline-block;
    ">
      Khách hủy đơn
    </span>
  `
  : order.adminCancelled
  ? `
    <span style="
      background:#fff3e0;
      color:#ef6c00;
      padding:5px 10px;
      border-radius:20px;
      font-size:12px;
      font-weight:bold;
      display:inline-block;
    ">
      Admin hủy đơn
    </span>
  `
  : `
    <span style="
      background:#e8f5e9;
      color:#2e7d32;
      padding:5px 10px;
      border-radius:20px;
      font-size:12px;
      font-weight:bold;
      display:inline-block;
    ">
   ${getStatusText(order.status)}
    </span>
  `
}

      </td>

      <td>
        ${formatDate(order.createdAt)}
      </td>

      <td>
    <select
  class="order-status status-${order.status}"
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
    color:${
      isCustomerCancelled
        ? "red"
        : isAdminCancelled
        ? "#ff9800"
        : "green"
    };
    font-size:12px;
    margin-top:5px;
    font-weight:bold;
  ">
    ${
      isCustomerCancelled
        ? ""
        : isAdminCancelled
        ? ""
        : ""
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
    const pendingBox =
  document.getElementById("pendingCount");

const shippingBox =
  document.getElementById("shippingCount");

const completedBox =
  document.getElementById("completedCount");

const cancelledBox =
  document.getElementById("cancelledCount");

if(pendingBox){
  pendingBox.textContent = pendingCount;
}

if(shippingBox){
  shippingBox.textContent = shippingCount;
}

if(completedBox){
  completedBox.textContent = completedCount;
}

if(cancelledBox){
  cancelledBox.textContent = cancelledCount;
}
const revenueBox =
  document.getElementById("revenueByDate");

if(revenueBox){

  const todayDate =
    filterDate?.value ||
    new Date().toISOString().split("T")[0];

  const todayRevenue =
    revenueByDate[todayDate] || 0;

  revenueBox.innerHTML = `
    <div style="
      padding:8px 0;
      border-bottom:1px solid #eee;
    ">
      <b>
        ${new Date(todayDate).toLocaleDateString("vi-VN")}
      </b>
      :
      ${formatPrice(todayRevenue)}
    </div>
  `;
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
  updateData.adminCancelled = true;
}

// Chỉ trừ kho khi giao thành công
if(
  status === "completed" &&
  orderData.status !== "completed"
){

  for(const item of (orderData.items || [])){

    const productRef =
      db.collection("products").doc(item.id);

    const productDoc =
      await productRef.get();

    if(productDoc.exists){

      const stock =
        Number(productDoc.data().stock || 0);

      await productRef.update({
        stock: stock - (item.qty || 1)
      });

    }

  }

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
  Math.ceil(allOrders.length / perPage) || 1;

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
