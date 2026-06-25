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
    let realId = orderId;

    // 1. lấy theo document ID
    const ref = doc(db, "orders", orderId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      data = snap.data();
    } else {
      // 2. fallback query theo field orderId
      const q = query(
        collection(db, "orders"),
        where("orderId", "==", orderId),
        limit(1)
      );

      const res = await getDocs(q);

      if (res.empty) {
        document.getElementById("order-status").innerText =
          "Không tìm thấy đơn hàng";
        return;
      }

      res.forEach(d => {
        data = d.data();
        realId = d.id;
      });
    }

    if (!data) {
      document.getElementById("order-status").innerText =
        "Không có dữ liệu";
      return;
    }

    // ================= RENDER =================
const item = data.items?.[0] || {};

// giá gốc
const original =
  Number(item.originalPrice || item.price || data.originalPrice || 0);

// tiền giảm
const discount =
  Number(item.discount || data.discount || 0);

// giá cuối
const finalPrice = original - discount;

// render
document.getElementById("original-price").innerText =
  formatMoney(original);

document.getElementById("discount").innerText =
  formatMoney(discount);

document.getElementById("final-price").innerText =
  formatMoney(finalPrice);

document.getElementById("discount").innerText =
  formatMoney(original - finalPrice);

document.getElementById("final-price").innerText =
  formatMoney(finalPrice);
    document.getElementById("used-points").innerText =
      data.usedPoints ?? data.pointsUsed ?? 0;

    document.getElementById("earned-points").innerText =
      data.earnedPoints ?? data.pointsEarned ?? 0;

    document.getElementById("order-status").innerText =
      data.status || "";

  } catch (err) {
    console.log(err);
    alert("Lỗi load đơn hàng");
  }
}
