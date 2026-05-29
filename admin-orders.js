import { auth, db } from "./firebase-init.js";

// ============================
// ADMIN ORDERS
// ============================

const ordersTable = document.getElementById("ordersTable");
const totalOrders = document.getElementById("totalOrders");
const totalRevenue = document.getElementById("totalRevenue");

let currentAdmin = null;

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
    const date = timestamp.toDate();

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

    if (snapshot.empty) {
      ordersTable.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;padding:20px;">
            Chưa có đơn hàng nào
          </td>
        </tr>
      `;

      if(totalOrders){
    totalOrders.textContent = 0;
}

if(totalRevenue){
    totalRevenue.textContent = formatPrice(0);
}
      return;
    }

    let html = "";
    let revenue = 0;

    snapshot.forEach(doc => {
      const order = doc.data();

      revenue += Number(order.total || 0);

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
            <select class="order-status" data-id="${doc.id}">
              <option value="pending" ${order.status === "pending" ? "selected" : ""}>Chờ xử lý</option>
              <option value="confirmed" ${order.status === "confirmed" ? "selected" : ""}>Đã xác nhận</option>
              <option value="shipping" ${order.status === "shipping" ? "selected" : ""}>Đang giao</option>
              <option value="completed" ${order.status === "completed" ? "selected" : ""}>Hoàn thành</option>
              <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>Đã hủy</option>
            </select>
          </td>

          <td>
            ${formatDate(order.createdAt)}
          </td>

          <td>
            <button class="delete-btn" data-id="${doc.id}">
              Xóa
            </button>
          </td>
        </tr>
      `;
    });

    ordersTable.innerHTML = html;

   if(totalOrders){
    totalOrders.textContent = snapshot.size;
}

if(totalRevenue){
    totalRevenue.textContent = formatPrice(revenue);
}
    bindEvents();

  } catch (error) {
    console.error(error);

    ordersTable.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;padding:20px;color:red;">
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
        ${item.name || "Sản phẩm"}
   x${item.qty || 1}
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

    select.addEventListener("change", async () => {

      const id = select.dataset.id;
      const status = select.value;

      try {

        await db.collection("orders")
          .doc(id)
          .update({
            status
          });

        alert("Cập nhật trạng thái thành công");

      } catch (error) {
        console.error(error);
        alert("Lỗi cập nhật trạng thái");
      }
    });
  });

  // DELETE ORDER
  document.querySelectorAll(".delete-btn").forEach(btn => {

    btn.addEventListener("click", async () => {

      const id = btn.dataset.id;

      const confirmDelete = confirm("Bạn có chắc muốn xóa đơn này?");

      if (!confirmDelete) return;

      try {

        await db.collection("orders")
          .doc(id)
          .delete();

        alert("Đã xóa đơn hàng");

        loadOrders();

      } catch (error) {
        console.error(error);
        alert("Lỗi xóa đơn hàng");
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
