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

    const snap = await db.collection("orders").doc(orderId).get();

    if (snap.exists) {
      data = snap.data();
    } else {
      const res = await db
        .collection("orders")
        .where("orderId", "==", orderId)
        .limit(1)
        .get();

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
    // FIX chống undefined (QUAN TRỌNG)
    document.getElementById("order-id").innerText = data.orderId || realId;

document.getElementById("product-id").innerText =
  data.items?.[0]?.productId ||
  data.items?.[0]?.id ||
  data.productIds?.[0] ||
  data.productId ||
  "Không có";
    document.getElementById("product-name").innerText =
      data.productName || (data.items && data.items[0]?.name) || "Không có dữ liệu";

    document.getElementById("purchase-date").innerText =
      formatDate(data.createdAt);

   document.getElementById("original-price").innerText =
  formatMoney(
    data.items?.[0]?.originalPrice ??
    data.items?.[0]?.oldPrice ??
    data.originalPrice ??
    0
  );
  const item = data.items?.[0];

const discount = (item?.originalPrice || 0) - (item?.price || 0);

document.getElementById("discount").innerText =
  "-" + formatMoney(discount);

   document.getElementById("used-points").innerText =
  data.usedPoints ?? data.pointsUsed ?? 0;

document.getElementById("earned-points").innerText =
  data.earnedPoints ??
  data.pointsEarned ??
  data.rewardPoints ??
  data.addedPoints ??
  0;

    document.getElementById("final-price").innerText =
      formatMoney(data.total || data.payment?.total || 0);

    document.getElementById("order-status").innerText =
      data.status || "";
// =========================
// RETURN INFO PANEL (FIX ĐÚNG CHỖ)
// =========================
document.getElementById("return-request-date").innerText =
  data.returnRequestedAt ? formatDate(data.returnRequestedAt) : "-";

document.getElementById("return-approved-date").innerText =
  data.returnApprovedAt ? formatDate(data.returnApprovedAt) : "-";

document.getElementById("return-status").innerText =
  data.returnStatus || "-";

document.getElementById("refund-amount").innerText =
  formatMoney(data.refundAmount || 0);

document.getElementById("deducted-points").innerText =
  data.usedPoints || 0;

document.getElementById("current-points").innerText =
  data.memberPoints || 0;
  } catch (err) {
    console.log(err);
    alert("Lỗi load đơn hàng");
  }
}
