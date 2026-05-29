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
    let date;

    if (typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    } else if (typeof timestamp === "number") {
      date = new Date(timestamp);
    } else {
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
    // CHỈ TÍNH DOANH THU ĐƠN HOÀN THÀNH
    // ============================
    let revenue = 0;

    snapshot.forEach(doc => {

      const order = doc.data();

      // chỉ cộng doanh thu khi hoàn thành
      if (order.status === "completed") {
        revenue += Number(order.total || 0);
      }

      // ============================
      // KHÓA STATUS KHI HOÀN THÀNH
      // ============================
      const isCompleted = order.status === "completed";

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

          <!-- STATUS ADMIN -->
          <td>

            <select 
              class="order-status" 
              data-id="${doc.id}"
              ${isCompleted ? "disabled" : ""}
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

            </select>

            ${isCompleted ? `
              <div style="color:green;font-size:12px;margin-top:4px;">
                Đã khóa trạng thái
              </div>
            ` : ""}

          </td>

          <!-- NGÀY TẠO -->
          <td>
            ${formatDate(order.createdAt)}
          </td>

          <!-- TRẠNG THÁI KHÁCH -->
          <td>

            ${order.customerCancelled ? `
              <span style="color:red;font-weight:bold;">
                Khách đã hủy
              </span>
            ` : ""}

          </td>

        </tr>
      `;
    });

    ordersTable.innerHTML = html;

    // ============================
    // TOTAL ORDERS
    // ============================
    if (totalOrders) {
      totalOrders.textContent = snapshot.size;
    }

    // ============================
    // TOTAL REVENUE
    // ============================
    if (totalRevenue) {
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
        ${item.name || "Sản phẩm"} x${item.qty || 1}
      </div>
    `;

  }).join("");
}

// ============================
// BIND EVENTS
// ============================
function bindEvents() {

  // ============================
  // UPDATE STATUS
  // ============================
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

        // nếu completed -> khóa select
        if (status === "completed") {
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
