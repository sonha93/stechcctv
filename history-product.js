import {
  collection,
  query,
  where,
  getDocs,
  limit,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-init.js";
function formatDate(timestamp) {
  if (!timestamp) return "";

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  return date.toLocaleDateString("vi-VN");
}

function formatMoney(value) {
  if (value === undefined || value === null) return "0đ";

  return Number(value).toLocaleString("vi-VN") + "đ";
}
const btn = document.getElementById("searchBtn");
const input = document.getElementById("productId");

function clearUI(){
  document.getElementById("order-id").innerText = "";
  document.getElementById("product-id").innerText = "";
  document.getElementById("product-name").innerText = "";
  document.getElementById("purchase-date").innerText = "";
  document.getElementById("original-price").innerText = "";
  document.getElementById("discount").innerText = "";
  document.getElementById("used-points").innerText = "";
  document.getElementById("earned-points").innerText = "";
  document.getElementById("final-price").innerText = "";
  document.getElementById("order-status").innerText = "";
}

// CLICK SEARCH
btn.addEventListener("click", async () => {
  const orderId = input.value.trim();

  if (!orderId) {
    alert("Nhập ID đơn hàng");
    return;
  }

  clearUI();

 await loadOrderById(orderId);
});

// =========================
// LOAD ORDER THEO ID
// =========================
async function loadOrderById(orderId) {
  try {

    let data = null;
    let realId = null;

    // 1. search theo document ID
    const docRef = doc(db, "orders", orderId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      data = snap.data();
      realId = snap.id;
    }

    // 2. nếu không có → search ALL field (an toàn hơn)
    if (!data) {
      const q = query(collection(db, "orders"));
      const res = await getDocs(q);

      res.forEach(d => {
        const dData = d.data();

        if (
          dData.orderId === orderId ||
          d.id === orderId
        ) {
          data = dData;
          realId = d.id;
        }
      });
    }

    // 3. không tìm thấy
    if (!data) {
      document.getElementById("order-status").innerText =
        "Không tìm thấy đơn hàng";
      return;
    }

    // ================= UI =================
    document.getElementById("order-id").innerText =
      data.orderId || realId;

    document.getElementById("product-id").innerText =
      data.productIds?.[0] || "";

    document.getElementById("product-name").innerText =
      data.productName || "Không có dữ liệu";

    document.getElementById("purchase-date").innerText =
      formatDate(data.createdAt);

    document.getElementById("original-price").innerText =
      formatMoney(data.originalPrice);

    document.getElementById("discount").innerText =
      formatMoney(data.discount);

    document.getElementById("used-points").innerText =
      data.usedPoints ?? 0;

    document.getElementById("earned-points").innerText =
      data.earnedPoints ?? 0;

    document.getElementById("final-price").innerText =
      formatMoney(data.total);

    document.getElementById("order-status").innerText =
      data.status || "";

  } catch (err) {
    console.error(err);
    alert("Lỗi load đơn hàng");
  }
}
