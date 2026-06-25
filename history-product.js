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
    let ref = doc(db, "orders", orderId);
    let snap = await getDoc(ref);

    let data = null;
    let realId = orderId;

    if (snap.exists()) {
      data = snap.data();
    } else {
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
        realId = d.id; // ✅ FIX đúng cách
      });
    }

    // =========================
    // RENDER UI (FIXED)
    // =========================
    document.getElementById("order-id").innerText =
      data.orderId || realId; // ✅ FIX

    document.getElementById("product-id").innerText =
      data.productIds && data.productIds.length
        ? data.productIds[0]
        : "";

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
