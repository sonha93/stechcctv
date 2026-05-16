// 1. HÀM HIỂN THỊ SẢN PHẨM (Giữ nguyên logic của bạn)
function renderHome() {
  const box = document.getElementById("products");
  if (!box) return;

  const productsToShow = allProducts.filter(p => p.category === "home");
  box.innerHTML = "";

  if (!productsToShow || productsToShow.length === 0) {
    box.innerHTML = "<p>Chưa có sản phẩm nào</p>";
    console.log("No products to show!", allProducts);
    return;
  }

  productsToShow.forEach(p => {
    const id = String(p.id);
    let percentText = "";
    if (p.oldPrice && p.oldPrice > p.price) {
      const percent = Math.round((1 - p.price / p.oldPrice) * 100);
      percentText = `-${percent}%`;
    }
    const imgUrl = p.img;

    box.innerHTML += `
      <div class="item">
        <img 
          src="${imgUrl}" 
          onclick="openZoom('${imgUrl}')"
          onerror="this.src='https://via.placeholder.com/300'"
        >
        <h4>${p.name}</h4>
        <div class="price-box">
          <span class="price">${Number(p.price).toLocaleString()}đ</span>
          ${p.oldPrice && p.oldPrice > p.price ? `<span class="old-price">${Number(p.oldPrice).toLocaleString()}đ</span>` : ""}
          ${percentText ? `<span class="discount-text">${percentText}</span>` : ""}
        </div>
        <button class="spec-btn" onclick="toggleSpec('${id}')">⚙️ Xem thông số</button>
        <button class="cart-btn" onclick="addToCart('${id}')">🛒 Mua ngay</button>
        <div class="spec-box" id="spec-${id}" style="display:none;">${renderSpec(p)}</div>
      </div>
    `;
  });
}

// 2. HÀM THÊM VÀO GIỎ HÀNG CHUẨN HÓA (Đảm bảo đồng bộ với trang giỏ hàng)
async function addToCart(id) {
  // Tìm sản phẩm trong mảng tổng dựa vào ID
  const product = allProducts.find(p => String(p.id) === String(id));
  if (!product) {
    alert("Không tìm thấy thông tin sản phẩm!");
    return;
  }

  // Lấy dữ liệu giỏ hàng tạm thời từ localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Kiểm tra xem sản phẩm đã nằm trong giỏ chưa
  const existingItem = cart.find(item => String(item.id) === String(id));

  if (existingItem) {
    existingItem.qty = (existingItem.qty || 1) + 1;
  } else {
    // Đẩy cấu trúc dữ liệu chuẩn mà trang cart.html cần vào mảng
    cart.push({
      id: String(product.id),
      name: product.name,
      img: product.img,
      price: Number(product.price) || 0,
      oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
      qty: 1,
      checked: true
    });
  }

  // Lưu lại vào localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Tự động đồng bộ thẳng lên Firebase Realtime Database nếu người dùng đã đăng nhập
  if (typeof auth !== "undefined" && auth.currentUser && typeof db !== "undefined") {
    try {
      await db.ref("carts/" + auth.currentUser.uid).set(cart);
    } catch (error) {
      console.error("Lỗi đồng bộ Firebase:", error);
    }
  }

  alert(`Đã thêm "${product.name}" vào giỏ hàng thành công!`);
}
