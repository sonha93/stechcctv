import { auth, db } from "./firebase-init.js";
import { loadProfilePage } from "./profile-staff.js";
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
let currentPermissions = {};
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
    case "return_requested":
  return "Chờ duyệt trả hàng";
    default:
      return "";
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
        window.location.href = "login-admin.html";
        return;
    }

    currentAdmin = user;

    const adminNameEl =
        document.getElementById("adminName");

    try {

        const snap = await firebase.database()
    .ref("/" + user.uid)
    .once("value");

        const data = snap.val();
        currentPermissions =
  data?.permissions || {};
adminNameEl.textContent =
    data?.display ||
    data?.name ||
    data?.displayName ||
    data?.fullName ||
    user.email;

    } catch (err) {

        console.error(err);

        adminNameEl.textContent =
            user.email;

    }

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
if(order.offlineSale === true){
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
        <td colspan="9" style="text-align:center;padding:20px;">
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
          <td colspan="9" style="text-align:center;padding:20px;">
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

  const matchSearch =
    !searchKeyword ||
    doc.id.toLowerCase().includes(searchKeyword);

  // Ẩn đơn offline khi xem bình thường
  // nhưng vẫn cho hiện khi tìm đúng ID
  if (order.offlineSale === true && !matchSearch) {
    return false;
  }
  let matchDate = true;

  if (selectedDate) {

    try {

      const dateObj =
        typeof order.createdAt?.toDate === "function"
          ? order.createdAt.toDate()
          : new Date(order.createdAt);

      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");

      const orderDate = `${yyyy}-${mm}-${dd}`;

      matchDate = orderDate === selectedDate;

    } catch {

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

    } catch {
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
  order.status === "completed" ||
  order.status === "returned";

const isCustomerCancelled =
  order.customerCancelled === true;

const isAdminCancelled =
  order.adminCancelled === true;

const lockStatus =
  isCompleted ||
  isCustomerCancelled ||
  isAdminCancelled;

// nếu đơn đã completed rồi thì dù khách có bấm trả hàng
// cột Hành động vẫn khóa ở "Đã giao thành công
 
  html += `
    <tr>

     <td>
  ${doc.id}
  <br>
  <small style="color:#666;">
    ${formatDate(order.createdAt)}
  </small>
</td>

      <td>
        ${order.customerName || "-"}<br>
        <small>${order.phone || ""}</small>
      </td>

      <td>
        ${order.address || ""}
      </td>
        
      <td>
        ${renderProducts(order.items || [])}
      </td>
        
      <td>
        ${formatPrice(order.total)}
      </td>
     <td>
  ${
    order.returnRequested === true
      ? `
        <select 
          class="return-status" 
          data-id="${doc.id}"
          ${
            order.returnStatus === "approved" ||
            order.returnStatus === "rejected"
              ? "disabled"
              : ""
          }
        >
          <option value="pending" ${order.returnStatus === "pending" ? "selected" : ""}>Chờ xử lý</option>
          <option value="approved" ${order.returnStatus === "approved" ? "selected" : ""}>Duyệt trả</option>
          <option value="rejected" ${order.returnStatus === "rejected" ? "selected" : ""}>Từ chối</option>
        </select>
      `
      : `<span style="color:#999;">--</span>`
  }
</td>
      <td>

    
${
  order.customerCancelled
  ? `
    <span style="
      background:#ffffff;
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
      background:#ffffff;
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
   <div>
  <span style="
    background:#ffffff;
    color:#2e7d32;
    padding:5px 10px;
    border-radius:20px;
    font-size:12px;
    font-weight:bold;
    display:inline-block;
  ">
 ${
  order.returnRequested === true && order.returnStatus === "pending"
    ? "Chờ duyệt trả hàng"
    : order.returnStatus === "approved"
    ? "Đã trả hàng"
    : getStatusText(order.status)
}
  </span>

 
</div>
`
}
      </td>
      
     <td>
  <span style="white-space:nowrap;">
    ${order.handledBy || "-"}
  </span>
</td>

      <td>
    <select
  class="order-status status-${order.status}"
  data-id="${doc.id}"
  ${lockStatus ? "disabled" : ""}
>
  <option value="pending" ${order.status === "pending" ? "selected" : ""}>
    Chờ xử lý
  </option>

  <option value="confirmed" ${order.status === "confirmed" ? "selected" : ""}>
    Đã xác nhận
  </option>

  <option value="shipping" ${order.status === "shipping" ? "selected" : ""}>
    Đang giao
  </option>

  <option value="completed" ${order.status === "completed" ? "selected" : ""}>
    Đã giao thành công
  </option>

  <option value="returned" ${order.status === "returned" ? "selected" : ""}>
    Đã trả hàng
  </option>

  <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>
    Đã hủy
  </option>
</select>
   ${lockStatus ? `
  <div style="
    color:${
      isCustomerCancelled
        ? "red"
        : isAdminCancelled
        ? "#ffffff"
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
      <td colspan="9"
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
        <td colspan="9"
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
const offlineSalesSection =
document.getElementById("offlineSalesSection");
  // UPDATE STATUS
  document.querySelectorAll(".order-status").forEach(select => {

  // chống bind trùng
  if(select.dataset.bound === "true"){
    return;
  }

  select.dataset.bound = "true";

  select.addEventListener("change", async () => {
  if (
  currentPermissions.confirmOrders === false
){
  alert("Bạn không có quyền xác nhận đơn");
  loadOrders();
  return;
}
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
  status: status,
  handledBy: document.getElementById("adminName").textContent
};


// nếu chuyển sang cancelled
// thì khóa luôn
if(status === "cancelled"){
  updateData.adminCancelled = true;
}


if(
  status === "completed" &&
  orderData.status !== "completed" &&
  orderData.memberId &&
  !orderData.pointsProcessed
){
for(const item of (orderData.items || [])){

  try{

   let productId =
  item.productId ||
  item.id ||
  item._id;

let productRef =
  db.collection("products")
  .doc(productId);

let productDoc =
  await productRef.get();

// fallback tìm bằng slug
if(!productDoc.exists && item.slug){

  const slugSnap = await db
    .collection("products")
    .where("slug", "==", item.slug)
    .limit(1)
    .get();

  if(!slugSnap.empty){

    productDoc = slugSnap.docs[0];

    productId = productDoc.id;

    productRef =
      db.collection("products")
      .doc(productId);
  }
}

if(!productDoc.exists){

  console.error(
    "Không tìm thấy sản phẩm:",
    item
  );

  continue;
}
    const product =
      productDoc.data();

    const qty =
      Number(item.qty || 0);

    const currentStock =
      Number(product.stock || 0);

    if(currentStock < qty){

      console.error(
        "Không đủ tồn kho:",
        item.name
      );

      continue;
    }

    const existed = await db
      .collection("sales_history")
      .where("orderId","==",id)
      .where("productId","==",productId)
      .limit(1)
      .get();

    if(!existed.empty){
      continue;
    }

    const importPrice =
      Number(product.importPrice || 0);

    const sellPrice =
      Number(item.price || product.price || 0);

    const revenue =
      sellPrice * qty;

    const capital =
      importPrice * qty;

    const profit =
      revenue - capital;

    await db
      .collection("sales_history")
      .add({

        orderId:id,

        productId: productId,

        productName:
          item.name || product.name,

        qty,

        importPrice,

        sellPrice,

        revenue,

        capital,

        profit,

        createdAt:
          firebase.firestore
          .FieldValue
          .serverTimestamp()

      });

    const newStock =
      currentStock - qty;

    await productRef.update({
      stock: newStock
    });

    await db
      .collection("stock_movements")
      .add({

        productId: productId,

        productName:
          item.name || product.name,

        type: "SALE",

        qty: -qty,

        reason: `Đơn hàng ${id}`,
         staffName: document.getElementById("adminName")?.textContent || "",
        stockAfter: newStock,
        createdAt:
          firebase.firestore
          .FieldValue
          .serverTimestamp()

      });

  }catch(err){

    console.error(
      "Lỗi xử lý sản phẩm:",
      item,
      err
    );

  }

}
} 
  // ============================
// MEMBER POINTS
// ============================
if(
  status === "completed" &&
  orderData.status !== "completed" &&
  orderData.memberId
){
  const memberRef = db
    .collection("members")
    .doc(orderData.memberId);

  const memberDoc =
    await memberRef.get();

  if(memberDoc.exists){

    const member =
      memberDoc.data();
const cashbackUsed =
  Number(
    orderData.cashbackAmount ||
    orderData.cashbackUsed ||
    0
  );

const usedPoints =
  Math.floor(cashbackUsed / 100);

const finalTotal =
  Number(orderData.total || 0);

const earnPoints =
  Math.floor(finalTotal / 10000);

const currentPoints =
  Number(member.points || 0);

const oldLevel =
  member.level || "Silver";

const newSpent =
  Number(member.totalSpent || 0)
  + Number(orderData.total || 0);

let level = "Silver";
let bonusPoints = 0;

// VIP
if(newSpent >= 10000000){

  level = "VIP";

  if(oldLevel !== "VIP"){
    bonusPoints = 200; // 20k
  }

}
// GOLD
else if(newSpent >= 5000000){

  level = "Gold";

  if(oldLevel === "Silver"){
    bonusPoints = 100; // 10k
  }

}

const newPoints =
  currentPoints
  - usedPoints
  + earnPoints
  + bonusPoints;

  await memberRef.update({
  points: Math.max(0,newPoints),
  totalSpent: newSpent,
  level: level
});
await db
  .collection("orders")
  .doc(id)
  .update({
    pointsProcessed: true
  });
    
if(bonusPoints > 0){

  await db
    .collection("member_history")
    .add({

      memberId:
        orderData.memberId,

      orderId: id,

      type: "level_up",

      level: level,

      points: bonusPoints,

      createdAt: Date.now()

    });

    await db
      .collection("member_history")
      .add({

        memberId:
          orderData.memberId,

        orderId: id,

        points: earnPoints,

        total:
          Number(orderData.total || 0),

        createdAt:
          Date.now()

      });

  }

}
        
// CANCEL → rollback points (FIXED)
if (
  status === "cancelled" &&
  orderData.status !== "cancelled" &&
  orderData.memberId
) {

  const memberRef = db.collection("members").doc(orderData.memberId);
  const memberDoc = await memberRef.get();

  if (memberDoc.exists) {

    const member = memberDoc.data();

    const cashbackUsed =
      Number(orderData.cashbackAmount || orderData.cashbackUsed || 0);

  const usedPoints =
  Number(orderData.usedPoints || 0);
    const earnPoints = Math.floor(Number(orderData.total || 0) / 10000);

    const rollbackKey = orderData.rollbackProcessed;
    if (rollbackKey === true) return;

    let newPoints =
      Number(member.points || 0)
      - earnPoints
     

    let newSpent =
      Number(member.totalSpent || 0)
      - Number(orderData.total || 0);

    if (newPoints < 0) newPoints = 0;
    if (newSpent < 0) newSpent = 0;

await memberRef.update({
  points: firebase.firestore.FieldValue.increment(
    usedPoints
  ),
  totalSpent: newSpent,
  lockedPoints: firebase.firestore.FieldValue.increment(
    -usedPoints
  )
});
    await db.collection("member_history").add({
      memberId: orderData.memberId,
      orderId: id,
      type: "rollback_cancel",
      points: +usedPoints,
      createdAt: Date.now()
    });
  }

  await db.collection("orders").doc(id).update({
    pointsProcessed: false,
    rollbackProcessed: true
  });
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
// ============================
// LIVE DATE TIME
// ============================

function updateLiveDateTime() {

  const el =
    document.getElementById("liveDateTime");

  if (!el) return;

  const now = new Date();

  const date =
    now.toLocaleDateString("vi-VN");

  const time =
    now.toLocaleTimeString("vi-VN");

  el.innerHTML = `
    ${date} - ${time}
  `;
}

// chạy ngay
updateLiveDateTime();

// cập nhật mỗi giây
setInterval(updateLiveDateTime, 1000);    
const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await auth.signOut();

            window.location.href =
                "login-admin.html";

        } catch (err) {

            console.error(err);
            alert("Không thể đăng xuất");

        }

    });

}
// ============================
// SWITCH MODULE
// ============================

document
.querySelectorAll('input[name="adminView"]')
.forEach(radio => {

    radio.addEventListener("change", () => {

        const value = radio.value;

        document.getElementById("ordersSection").style.display =
            value === "orders" ? "block" : "none";

        document.getElementById("inventorySection").style.display =
            value === "inventory" ? "block" : "none";

        document.getElementById("importSection").style.display =
            value === "import" ? "block" : "none";

        document.getElementById("movementsSection").style.display =
            value === "movements" ? "block" : "none";

        document.getElementById("historySection").style.display =
            value === "history" ? "block" : "none";

        document.getElementById("lossSection").style.display =
            value === "loss" ? "block" : "none";

        document.getElementById("logsSection").style.display =
            value === "logs" ? "block" : "none";

        document.getElementById("salesSection").style.display =
            value === "sales" ? "block" : "none";
      document.getElementById("membersSection").style.display =
    value === "members" ? "block" : "none";
        document.getElementById("profileSection").style.display =
    value === "profile" ? "block" : "none";
        // OFFLINE SALES
        const offlineSection =
            document.getElementById("offlineSalesSection");

       if (offlineSection) {
    offlineSection.style.display =
        value === "offlineSales" ? "block" : "none";
}
      if (value === "profile") {
    loadProfilePage();
}
    });

});

document.getElementById("changePasswordBtn")
?.addEventListener("click", () => {
    document.getElementById("changePasswordModal").style.display = "block";
});

document.getElementById("savePasswordBtn")
?.addEventListener("click", async () => {

    const newPassword =
        document.getElementById("newPassword").value.trim();

    if (newPassword.length < 6) {
        alert("Mật khẩu tối thiểu 6 ký tự");
        return;
    }

    try {

        await auth.currentUser.updatePassword(newPassword);

        alert("Đổi mật khẩu thành công");

        document.getElementById("changePasswordModal").style.display = "none";

    } catch (err) {

        alert(err.message);

    }

});
const settingBtn =
document.getElementById("settingBtn");

const settingMenu =
document.getElementById("settingMenu");
if(settingBtn){

    settingBtn.addEventListener("click",()=>{

        settingMenu.classList.toggle("show");

    });

}
const closeModalBtn = document.getElementById('closePasswordModalBtn');
const modal = document.getElementById('changePasswordModal');

if (closeModalBtn && modal) {
  closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}
const profileBtn =
document.getElementById("profileBtn");

if(profileBtn){

    profileBtn.addEventListener("click",()=>{

        document.getElementById("ordersSection").style.display = "none";
        document.getElementById("inventorySection").style.display = "none";
        document.getElementById("importSection").style.display = "none";
        document.getElementById("movementsSection").style.display = "none";
        document.getElementById("historySection").style.display = "none";
        document.getElementById("lossSection").style.display = "none";
        document.getElementById("logsSection").style.display = "none";
        document.getElementById("salesSection").style.display = "none";
        document.getElementById("offlineSalesSection").style.display = "none";

        document.getElementById("profileSection").style.display = "block";

        loadProfilePage();

        settingMenu.classList.remove("show");

    });

}
if(!window.showToast){

window.showToast = function(message){

const toast = document.createElement("div");

toast.innerText = message;

toast.style.cssText = `
position:fixed;
left:50%;
bottom:30px;
transform:translateX(-50%);
background:#222;
color:#fff;
padding:12px 20px;
border-radius:8px;
font-size:14px;
z-index:999999;
`;

document.body.appendChild(toast);

setTimeout(()=>{
toast.remove();
},2500);

};

window.alert = window.showToast;

}
window.approveReturn = async function(orderId){

  const ok = confirm("Duyệt trả hàng đơn này?");
  if(!ok) return;

  const orderRef = db.collection("orders").doc(orderId);
  const orderSnap = await orderRef.get();

  if(!orderSnap.exists) return;

  const order = orderSnap.data();

  if(order.status !== "return_requested"){
    alert("Không hợp lệ");
    return;
  }

  const batch = db.batch();

  // =========================
  // 1. HOÀN STOCK
  // =========================
  for(const item of order.items || []){

    const productRef =
      db.collection("products").doc(item.productId);

    batch.update(productRef, {
      stock: firebase.firestore.FieldValue.increment(
        Number(item.qty || 0)
      )
    });
  }

  // =========================
  // 2. HOÀN ĐIỂM (QUAN TRỌNG)
  // trả lại đúng số đã dùng
  // =========================
 const usedPoints =
  Number(order.usedPoints || 0);

const earnPoints =
  Math.floor(
    Number(order.total || 0) / 10000
  );

if(order.memberId){

  const memberRef =
    db.collection("members").doc(order.memberId);

  batch.update(memberRef, {

    points:
      firebase.firestore.FieldValue.increment(
        usedPoints - earnPoints
      ),

    totalSpent:
      firebase.firestore.FieldValue.increment(
        -Number(order.total || 0)
      )

  });

}

    const historyRef = db.collection("member_history").doc();

batch.set(historyRef,{
  memberId: order.memberId,
  orderId,
  type: "refund_return",
  earnPoints: earnPoints,
  points: usedPoints,
  createdAt: Date.now()
});
  }

  // =========================
  // 3. UPDATE ORDER STATUS
  // =========================
 batch.update(orderRef, {
  status: "returned",
  returnApprovedAt: Date.now(),
  pointsProcessed: false
});
  
const revenueRef = db.collection("revenue_adjustments").doc();

batch.set(revenueRef, {
  orderId: orderId,
  type: "RETURN_REFUND",
  amount: Number(order.total || 0),
  createdAt: Date.now()
});
  await batch.commit();

  alert("Đã duyệt trả hàng");

loadOrders();

function loadReturns(){

  const body = document.getElementById("returnsBody");
  if(!body) return;

  db.collection("orders")
    .where("returnRequested", "==", true)
    .orderBy("returnRequestedAt", "desc")
    .onSnapshot(snapshot => {

      body.innerHTML = "";

      snapshot.forEach(doc => {

        const o = doc.data();

        body.innerHTML += `
          <tr>
            <td>${new Date(o.returnRequestedAt || o.createdAt).toLocaleString()}</td>
            <td>${doc.id}</td>
            <td>${o.customerName || ""}</td>
            <td>${(o.items || []).map(i => i.name).join(", ")}</td>
            <td>${o.returnQty || 1}</td>
            <td>${o.refundAmount || 0}</td>
            <td>${o.returnReason || ""}</td>
          </tr>
        `;
      });
    });
}
document.addEventListener("change", async (e) => {
  const select = e.target;

  if (!select.classList.contains("return-status")) return;

  console.log("RETURN CHANGE OK");

  const orderId = select.dataset.id;
  const value = select.value;

  console.log(orderId, value);

  try {
    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      alert("Đơn không tồn tại");
      loadOrders();
      return;
    }

    const order = orderSnap.data();

    if (order.returnRequested !== true) {
      alert("Đơn này chưa có yêu cầu trả hàng");
      loadOrders();
      return;
    }

    if (
      order.returnStatus === "approved" ||
      order.returnStatus === "rejected"
    ) {
      select.disabled = true;
      return;
    }

    const update = {
      returnStatus: value,
      returnHandledBy: document.getElementById("adminName")?.textContent || "",
      returnUpdatedAt: Date.now()
    };

    if (value === "approved") {
      update.status = "returned";
      update.returnApprovedAt = Date.now();
    }

    if (value === "rejected") {
      update.status = "completed";
      update.returnRejectedAt = Date.now();
    }

    await orderRef.update(update);

    select.disabled = (value === "approved" || value === "rejected");

    alert("Đã cập nhật trạng thái trả hàng");
    loadOrders();

  } catch (err) {
    console.error(err);
    alert("Lỗi cập nhật trạng thái trả hàng");
  }
});
