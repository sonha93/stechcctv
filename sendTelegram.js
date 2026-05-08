// telegram.js
function sendTelegramNotification(orderNumber, customerName, phone, address, cart) {
  const botToken = "8752443026:AAEHrvCIDLqEDfE_inDeAAI9dzClm3WZyz4";
  const chatId = "6087791909";

  // Tạo danh sách sản phẩm
  const productList = cart.map(p => `- ${p.name} x${p.qty} (${Number(p.price).toLocaleString()}đ)`).join("\n");

  const total = cart.reduce((sum, p) => sum + p.price*(p.qty||1), 0);

  const message = `
📦 Đơn hàng mới!
Mã đơn: ${orderNumber}
Khách hàng: ${customerName}
SĐT: ${phone}
Địa chỉ: ${address}
Tổng tiền: ${total.toLocaleString()}đ
${productList ? "\nSản phẩm:\n" + productList : ""}
`;

  fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`)
    .then(res => res.json())
    .then(data => {
      if(data.ok) console.log("Đã gửi Telegram!");
      else console.error("Lỗi Telegram:", data);
    })
    .catch(err => console.error("Lỗi fetch Telegram:", err));
}

// Test nhanh:
// sendTelegramNotification("123456", "Nguyen Van A", "0909123456", "Hà Nội", [{name:"SP1", price:100000, qty:2}, {name:"SP2", price:200000, qty:1}]);
