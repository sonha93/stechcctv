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

  const ngay = date.toLocaleDateString("vi-VN");

  const gio = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  return `${ngay}\n${gio}`;
}

function formatMoney(value) {
  if (value === undefined || value === null) return "0đ";

  return Number(value).toLocaleString("vi-VN") + "đ";
}
const btn = document.getElementById("searchBtn");
const input = document.getElementById("productId");

function clearUI(){
  document.getElementById("order-id").innerText = "";
 document.getElementById("customer-name").innerText="";
document.getElementById("customer-phone").innerText="";
document.getElementById("order-items").innerHTML="";
  
  document.getElementById("purchase-date").innerText = "";


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

document.getElementById("customer-name").innerText =
    data.customerName ||
    data.shippingAddress?.name ||
    "-";

document.getElementById("customer-phone").innerText =
    data.phone ||
    data.shippingAddress?.phone ||
    "-";

    document.getElementById("purchase-date").innerText =
      formatDate(data.createdAt);



  const usedPoints = data.usedPoints ?? data.pointsUsed ?? 0;

document.getElementById("used-points").innerText =
  formatMoney(usedPoints * 100);

const earnedPoints =
  data.earnedPoints ??
  data.pointsEarned ??
  data.rewardPoints ??
  data.addedPoints ??
  0;

document.getElementById("earned-points").innerText =
  formatMoney(earnedPoints * 100);

    document.getElementById("final-price").innerText =
      formatMoney(data.total || data.payment?.total || 0);

    document.getElementById("order-status").innerText =
      data.status || "";
    const tbody = document.getElementById("order-items");

tbody.innerHTML="";

(data.items || []).forEach(item=>{

   const qty =
  Number(item.qty || item.quantity || 1);

const price =
  Number(item.price || 0);

tbody.innerHTML += `
<tr>
    <td data-label="Sản phẩm">${item.name}</td>
    <td data-label="Số lượng">${qty}</td>
    <td data-label="Đơn giá">${formatMoney(price)}</td>
    <td data-label="Thành tiền">${formatMoney(price * qty)}</td>
</tr>`;
});
  if (!data.returnStatus) {
  document.querySelector(".return-section").style.display = "none";
}
// =========================
// RETURN INFO PANEL (FIX CHUẨN)
// =========================

const returnSection = document.querySelector(".return-section");

// CHẶN NULL AN TOÀN
const hasReturn =
  !!data.returnStatus ||
  !!data.returnRequestedAt ||
  !!data.returnApprovedAt ||
  (data.refundAmount && data.refundAmount > 0);

// RESET UI TRƯỚC (QUAN TRỌNG)
document.getElementById("return-request-date").innerText = "-";
document.getElementById("return-approved-date").innerText = "-";
document.getElementById("return-status").innerText = "-";
document.getElementById("refund-amount").innerText = "0đ";
document.getElementById("deducted-points").innerText = "0";
document.getElementById("current-points").innerText = "0";

if (!hasReturn) {
  returnSection.style.display = "none";
  return;
}

returnSection.style.display = "block";

document.getElementById("return-request-date").innerText =
  data.returnRequestedAt ? formatDate(data.returnRequestedAt) : "-";

document.getElementById("return-approved-date").innerText =
  data.returnApprovedAt ? formatDate(data.returnApprovedAt) : "-";

document.getElementById("return-status").innerText =
  data.returnStatus || "-";

document.getElementById("refund-amount").innerText =
  formatMoney(data.refundAmount || 0);

const deductedPoints = data.returnDeductPoints ?? 0;

document.getElementById("deducted-points").innerText =
  formatMoney(deductedPoints * 100);

let currentPoints = 0;

if (data.memberId) {

  const memberSnap = await db
    .collection("members")
    .doc(data.memberId)
    .get();

  if (memberSnap.exists) {
    currentPoints =
      Number(memberSnap.data().points || 0);
  }
}

document.getElementById("current-points").innerText =
  formatMoney(currentPoints * 100);
} catch (err) {
    console.log(err);
    alert("Lỗi load đơn hàng");
  }
}
