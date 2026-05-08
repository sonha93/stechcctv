// telegram.js
function sendTelegramNotification(orderNumber, customerName, total) {
  const botToken = "8752443026:AAEHrvCIDLqEDfE_inDeAAI9dzClm3WZyz4";
  const chatId = "6087791909";

  const message = `📦 Đơn hàng mới!\nMã đơn: ${orderNumber}\nKhách hàng: ${customerName}\nTổng tiền: ${total}`;

  fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`)
    .then(res => res.json())
    .then(data => {
      if(data.ok) console.log("Đã gửi Telegram!");
      else console.error("Lỗi Telegram:", data);
    })
    .catch(err => console.error("Lỗi fetch Telegram:", err));
}

// Nếu muốn test nhanh:
// sendTelegramNotification("123456", "Nguyen Van A", "1.000.000đ");