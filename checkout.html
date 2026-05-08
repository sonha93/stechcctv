let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Chỉ cho nhập số ở SĐT
document.getElementById("phone").addEventListener("input", function(){
  this.value = this.value.replace(/\D/g, "");
});

// Hiển thị giỏ hàng
function renderCart(){
  const box = document.getElementById("cartBox");
  box.innerHTML = "";

  if(cart.length === 0){
    box.innerHTML = "🛒 Giỏ hàng trống";
    return;
  }

  let originalTotal = 0;
  let finalTotal = 0;

  cart.forEach(p=>{
    let qty = p.qty || 1;
    let price = Number(p.price) || 0;
    let old = Number(p.oldPrice) || price;

    let subFinal = qty * price;
    let subOld = qty * old;

    finalTotal += subFinal;
    originalTotal += subOld;

    box.innerHTML += `
      <div class="item">
        <img src="${p.img}">
        <div>
          <b>${p.name}</b>
          <div class="calc">
            <div class="sale-price">${price.toLocaleString()}đ</div>
            ${old > price ? `<div class="old-price">${old.toLocaleString()}đ</div>` : ""}
            <div>${qty} × ${price.toLocaleString()}đ = ${subFinal.toLocaleString()}đ</div>
          </div>
        </div>
      </div>
    `;
  });

  let discount = originalTotal - finalTotal;

  box.innerHTML += `
    <div class="total-box">
      <div class="row">
        <span>Tổng giá gốc</span>
        <b>${originalTotal.toLocaleString()}đ</b>
      </div>
      <div class="row discount">
        <span>Tiết kiệm</span>
        <b>-${discount.toLocaleString()}đ</b>
      </div>
      <div class="row final">
        <span>Cần thanh toán</span>
        <b>${finalTotal.toLocaleString()}đ</b>
      </div>
    </div>
  `;
}

// Hiển thị/ẩn thông tin ngân hàng
document.getElementById("payment").addEventListener("change", updateBank);

function updateBank(){
  let payment = document.getElementById("payment").value;
  let bank = document.getElementById("bankInfo");

  let total = cart.reduce((sum,p)=> sum + p.price*(p.qty||1), 0);

  if(payment === "bank"){
    bank.style.display = "block";
    document.getElementById("qr").src =
      "https://img.vietqr.io/image/ICB-101005245058-compact2.png?amount=" + total + "&addInfo=Thanh%20toan";
  } else {
    bank.style.display = "none";
  }
}

// 🔹 Gửi Telegram
function sendTelegramNotification(order, total) {
  if(!order || !total) return;

  const botToken = "8752443026:AAEHrvCIDLqEDfE_inDeAAI9dzClm3WZyz4";
  const chatId = "6087791909";

  const productList = order.cart.map(p => `- ${p.name} x${p.qty} (${p.price.toLocaleString()}đ)`).join("\n");

  const message = `
📦 Đơn hàng mới!
Mã đơn: ${order.id}
Khách hàng: ${order.name}
SĐT: ${order.phone}
Địa chỉ: ${order.address}
Tổng tiền: ${total.toLocaleString()}đ
${productList ? "\nSản phẩm:\n" + productList : ""}
`;

  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "
