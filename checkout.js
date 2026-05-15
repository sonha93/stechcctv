/* =========================
   📦 GET CART
========================= */
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

/* =========================
   💰 FORMAT PRICE
========================= */
function formatPrice(n) {
  return Number(n).toLocaleString("vi-VN") + "đ";
}

/* =========================
   📲 SEND TELEGRAM
========================= */
function sendTelegramNotification(
  orderNumber,
  customerName,
  phone,
  address,
  cartItems,
  total
) {

  const botToken =
    "BOT_TOKEN";

  const chatId =
    "CHAT_ID";

  let itemsText = cartItems.map(item => {
    return `• ${item.name}
- Giá: ${formatPrice(item.price)}
- SL: ${item.qty}`;
  }).join("\n");

  const message = `
📦 Đơn hàng mới

🆔 Mã đơn: ${orderNumber}

👤 Khách: ${customerName}

📞 SĐT: ${phone}

📍 Địa chỉ:
${address}

🛒 Sản phẩm:
${itemsText}

💰 Tổng:
${total}
`;

  fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`
  )
  .then(res => res.json())
  .then(data => {
    console.log("Telegram:", data);
  })
  .catch(err => {
    console.error(err);
  });
}

/* =========================
   🖥 RENDER CART
========================= */
function renderCheckout() {

  const box =
    document.getElementById("cartBox");

  if (!box) return;

  const cart = getCart();

  box.innerHTML = "";

  if (cart.length === 0) {

    box.innerHTML =
      "<p>🛒 Giỏ hàng trống</p>";

    return;
  }

  let originalTotal = 0;
  let finalTotal = 0;

  cart.forEach(item => {

    const price =
      Number(item.price) || 0;

    const oldPrice =
      Number(item.oldPrice) || price;

    const qty =
      Number(item.qty) || 1;

    const subTotal =
      price * qty;

    const oldTotal =
      oldPrice * qty;

    finalTotal += subTotal;
    originalTotal += oldTotal;

    box.innerHTML += `

      <div class="item">

        <img src="${item.img}">

        <div>

          <b>${item.name}</b>

          <div class="calc">

            <div class="sale-price">
              ${formatPrice(price)}
            </div>

            ${
              oldPrice > price
              ? `
              <div class="old-price">
                ${formatPrice(oldPrice)}
              </div>
              `
              : ""
            }

            <div>
              ${qty} × ${formatPrice(price)}
              =
              ${formatPrice(subTotal)}
            </div>

          </div>

        </div>

      </div>
    `;
  });

  const discount =
    originalTotal - finalTotal;

  box.innerHTML += `

    <div class="total-box">

      <div class="row">
        <span>Tổng giá gốc</span>
        <b>${formatPrice(originalTotal)}</b>
      </div>

      <div class="row discount">
        <span>Tiết kiệm</span>
        <b>- ${formatPrice(discount)}</b>
      </div>

      <div class="row final">
        <span>Cần thanh toán</span>
        <b>${formatPrice(finalTotal)}</b>
      </div>

    </div>
  `;
}

/* =========================
   🏦 UPDATE QR BANK
========================= */
function updateBank() {

  const payment =
    document.getElementById("payment").value;

  const bankBox =
    document.getElementById("bankInfo");

  const qr =
    document.getElementById("qr");

  const cart = getCart();

  const total = cart.reduce((sum, item) => {

    return sum +
      (Number(item.price) || 0)
      *
      (Number(item.qty) || 1);

  }, 0);

  if (payment === "bank") {

    bankBox.style.display = "block";

    qr.src =
      `https://img.vietqr.io/image/ICB-101005245058-compact2.png?amount=${total}&addInfo=Thanh%20toan`;

  } else {

    bankBox.style.display = "none";

  }
}

/* =========================
   🛒 PLACE ORDER
========================= */
function placeOrder() {

  const cart = getCart();

  if (cart.length === 0) {

    alert("🛒 Giỏ hàng trống!");

    return;
  }

  const name =
    document.getElementById("name").value.trim();

  const phone =
    document.getElementById("phone").value.trim();

  const address =
    document.getElementById("address").value.trim();

  if (!name || !phone || !address) {

    alert("⚠️ Nhập đầy đủ thông tin!");

    return;
  }

  const phoneRegex =
    /^(03|05|07|08|09)\d{8}$/;

  if (!phoneRegex.test(phone)) {

    alert("⚠️ SĐT không hợp lệ!");

    return;
  }

  const total = cart.reduce((sum, item) => {

    return sum +
      (Number(item.price) || 0)
      *
      (Number(item.qty) || 1);

  }, 0);

  const orderId = Date.now();

  /* TELEGRAM */
  sendTelegramNotification(
    orderId,
    name,
    phone,
    address,
    cart,
    formatPrice(total)
  );

  /* SAVE ORDER */
  const order = {

    id: orderId,
    name,
    phone,
    address,
    cart,
    total,

    time:
      new Date().toLocaleString()

  };

  let orders =
    JSON.parse(localStorage.getItem("orders"))
    || [];

  orders.push(order);

  localStorage.setItem(
    "orders",
    JSON.stringify(orders)
  );

  /* CLEAR CART */
  localStorage.removeItem("cart");

  /* LOADING */
  document.getElementById("loading")
    .style.display = "flex";

  document.querySelector(".btn")
    .disabled = true;

  setTimeout(() => {

    window.location.href =
      "success.html";

  }, 1000);
}

/* =========================
   📞 PHONE ONLY NUMBER
========================= */
document
.getElementById("phone")
.addEventListener("input", function () {

  this.value =
    this.value.replace(/\D/g, "");

});

/* =========================
   🚀 INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {

  renderCheckout();

  updateBank();

  document
    .getElementById("payment")
    .addEventListener("change", updateBank);

});

/* =========================
   🌍 EXPORT WINDOW
========================= */
window.placeOrder = placeOrder;
