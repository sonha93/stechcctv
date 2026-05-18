import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { app, onAuthStateChangedListener } from "./auth.js";

const db = getFirestore(app);

let currentUID = null;

/* =========================
   LOGIN CHECK
========================= */
onAuthStateChangedListener((user) => {
  if (user) {
    currentUID = user.uid;
    renderOrders();
  } else {
    currentUID = null;
    document.getElementById("orders").innerHTML =
      "<p>Chưa đăng nhập</p>";
  }
});

/* =========================
   GET ORDERS
========================= */
async function getOrders() {
  if (!currentUID) return [];

  const q = query(
    collection(db, "orders"),
    where("uid", "==", currentUID)
  );

  const snap = await getDocs(q);

  let list = [];

  snap.forEach(doc => {
    list.push({ id: doc.id, ...doc.data() });
  });

  return list;
}

/* =========================
   FORMAT TIỀN
========================= */
function format(n) {
  return Number(n || 0).toLocaleString("vi-VN") + "đ";
}

/* =========================
   RENDER ORDERS
========================= */
async function renderOrders() {
  const box = document.getElementById("orders");
  if (!box) return;

  const orders = await getOrders();

  if (!orders || orders.length === 0) {
    box.innerHTML = "<p>Chưa có đơn hàng</p>";
    return;
  }

  box.innerHTML = "";

  orders.forEach(order => {

    let total = 0;

    let htmlItems = (order.cart || []).map(p => {

      let qty = Number(p.qty ?? 1);
      let price = Number(p.price ?? 0);

      total += price * qty;

      return `
        <div style="padding:5px 0;border-bottom:1px solid #eee">
          <b>${p.name || ""}</b><br>
          ${qty} x ${format(price)} = ${format(price * qty)}
        </div>
      `;
    }).join("");

    box.innerHTML += `
      <div class="order-box">
        <h3>🧾 Đơn #${order.id}</h3>

        <p>👤 ${order.name || ""}</p>
        <p>📞 ${order.phone || ""}</p>
        <p>📍 ${order.address || ""}</p>
        <p>🕒 ${order.time || ""}</p>

        <hr>

        ${htmlItems}

        <h4>Tổng: ${format(total)}</h4>
      </div>
    `;
  });
}
