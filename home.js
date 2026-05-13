function renderHome() {
  const box = document.getElementById("products");
  if (!box) return;

  // Hiển thị tất cả sản phẩm có category "home"
  const productsToShow = allProducts.filter(p => p.category === "home");

  box.innerHTML = "";

  if (!productsToShow || productsToShow.length === 0) {
    box.innerHTML = "<p>Chưa có sản phẩm nào</p>";
    return;
  }

  productsToShow.forEach(p => {
    const id = String(p.id || p.docId); // fix: đảm bảo id luôn tồn tại
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
