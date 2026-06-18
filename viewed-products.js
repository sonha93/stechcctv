// =============================
// RECENTLY VIEWED PRODUCTS
// =============================

// Lưu sản phẩm đã xem
export function saveViewedProduct(product) {

  if (!product || !product.id) return;

  let viewed =
    JSON.parse(localStorage.getItem("viewedProducts")) || [];

  // xoá trùng
  viewed = viewed.filter(p => p.id !== product.id);

  // thêm lên đầu
  viewed.unshift({
    id: product.id,
    name: product.name,
    img: product.img,
    price: product.price
  });

  // giới hạn 10 sản phẩm
  if (viewed.length > 10) {
    viewed = viewed.slice(0, 10);
  }

  localStorage.setItem("viewedProducts", JSON.stringify(viewed));
}

// Hiển thị danh sách
export function renderViewedProducts() {

  const box = document.getElementById("viewedList");
  if (!box) return;

  let viewed =
    JSON.parse(localStorage.getItem("viewedProducts")) || [];

  box.innerHTML = "";

  viewed.forEach(p => {

    const item = document.createElement("div");
    item.className = "viewed-item";

    item.innerHTML = `
      <img src="${p.img}" />
      <p>${p.name}</p>
      <b style="color:red">
        ${Number(p.price || 0).toLocaleString()}đ
      </b>
    `;

    item.onclick = () => {
      window.location.href = "logo.html?id=" + p.id;
    };

    box.appendChild(item);
  });
}
