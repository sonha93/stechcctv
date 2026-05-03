
/* =========================
   QUẢN LÝ ĐƠN HÀNG
========================= */

function getOrders() {
    return JSON.parse(localStorage.getItem("orders")) || [];
}

function saveOrders(orders) {
    localStorage.setItem("orders", JSON.stringify(orders));
}

/* ===== THÊM ĐƠN HÀNG ===== */
function addOrder(order) {

    // 🔥 CHECK SĐT (THÊM MỚI)
    if(order.phone && !validatePhone(order.phone)){
        alert("📵 Số điện thoại không hợp lệ!");
        return false;
    }

    let orders = getOrders();
    orders.push(order);
    saveOrders(orders);

    return true;
}

/* ===== XÓA TẤT CẢ ĐƠN ===== */
function clearOrders() {
    localStorage.removeItem("orders");
}

/* =========================
   VALIDATE SỐ ĐIỆN THOẠI VN (MỚI THÊM)
========================= */
function validatePhone(phone){

    // chỉ số
    if(!/^\d+$/.test(phone)) return false;

    // 10 số
    if(phone.length !== 10) return false;

    // đầu số hợp lệ Việt Nam
    const validPrefixes = [
        "03","05","07","08","09","02"
    ];

    return validPrefixes.includes(phone.substring(0,2));
}