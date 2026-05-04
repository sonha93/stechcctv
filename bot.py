import requests

TOKEN = "8470541434:AAF8-2eveInGsShGx2zHhLpDgRRPnQvjyVk"
CHAT_ID = "847054134"

def send_order(order_id, name, phone, total):
    text = f"""
🛒 ĐƠN HÀNG MỚI

🆔 Mã: {order_id}
👤 KH: {name}
📞 SĐT: {phone}
💰 Tổng: {total}
"""

    url = f"https://api.telegram.org/bot{TOKEN}/sendMessage"

    requests.post(url, data={
        "chat_id": CHAT_ID,
        "text": text
    })


# TEST THỬ
send_order("DH001", "Nguyễn Văn A", "090xxxxxxx", "250,000đ")