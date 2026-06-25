import { db } from "./firebase-init.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const btn = document.getElementById("searchBtn");
const input = document.getElementById("productId");

// CLICK SEARCH
btn.addEventListener("click", async () => {
  const orderId = input.value.trim();

  if (!orderId) {
    alert("Nhập ID đơn hàng");
    return;
  }

  clearUI();

  await loadOrderById(orderId);
  await loadReturnByOrderId(orderId);
});


// =========================
// LOAD ORDER THEO ID
// =========================
async function loadOrderById(orderId) {
  try {
    // 1. thử lấy theo doc.id trước
    let ref = doc(db, "orders", orderId);
    let snap = await getDoc(ref);

    let data = null;

    if (snap.exists()) {
      data = snap.data();
    } else {
      // 2. nếu không có → tìm theo field orderId
      const { collection, query, where, getDocs } =
        await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

      const q = query(
        collection(db, "orders"),
        where("orderId", "==", orderId)
      );

      const res = await getDocs(q);

      if (res.empty) {
        document.getElementById("order-status").innerText =
          "Không tìm thấy đơn hàng";
        return;
      }

      res.forEach(d => {
        data = d.data();
        orderId = d.id;
      });
    }

    // render UI
    document.getElementById("product-id").innerText =
      data.productIds?.[0] || "";

    document.getElementById("product-name").innerText =
      data.productName || "";

    document.getElementById("order-id").innerText =
      data.orderId || orderId;

    document.getElementById("purchase-date").innerText =
      formatDate(data.createdAt);

    document.getElementById("original-price").innerText =
      formatMoney(data.originalPrice);

    document.getElementById("discount").innerText =
      formatMoney(data.discount);

    document.getElementById("used-points").innerText =
      data.usedPoints || 0;

    document.getElementById("earned-points").innerText =
      data.earnedPoints || 0;

    document.getElementById("final-price").innerText =
      formatMoney(data.total);

    document.getElementById("order-status").innerText =
      data.status || "";

  } catch (err) {
    console.error(err);
    alert("Lỗi load đơn hàng");
  }
}


// =========================
// LOAD RETURN THEO ORDER ID
// =========================
async function loadReturnByOrderId(orderId) {
  const { collection, query, where, getDocs } =
    await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

  const q = query(
    collection(db, "returns"),
    where("orderId", "==", orderId)
  );

  const snap = await getDocs(q);

  if (snap.empty) return;

  snap.forEach(doc => {
    const r = doc.data();

    document.getElementById("return-request-date").innerText =
      r.requestDate || "";

    document.getElementById("return-approved-date").innerText =
      r.approvedDate || "";

    document.getElementById("return-status").innerText =
      r.status || "";

    document.getElementById("refund-amount").innerText =
      formatMoney(r.refundAmount);

    document.getElementById("deducted-points").innerText =
      r.deductedPoints || 0;

    document.getElementById("current-points").innerText =
      r.currentPoints || 0;
  });
}


// =========================
// CLEAR UI
// =========================
function clearUI() {
  document.querySelectorAll(".field div:last-child")
    .forEach(el => el.innerText = "");
}


// =========================
// FORMAT
// =========================
function formatMoney(v) {
  if (!v) return "0";
  return Number(v).toLocaleString("vi-VN") + " đ";
}

function formatDate(t) {
  if (!t) return "";
  if (t.toDate) return t.toDate().toLocaleString("vi-VN");
  return new Date(t).toLocaleString("vi-VN");
}
