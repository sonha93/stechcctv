// loadProducts.js

// Lấy div chứa sản phẩm
const productContainer = document.getElementById('productContainer');

// Lấy danh sách sản phẩm từ localStorage (đã được app.js load)
const products = JSON.parse(localStorage.getItem('products')) || [];

if (productContainer && products.length > 0) {
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.img}" alt="${product.name}" onclick="goDetail(${product.id})">
      <h3>${product.name}</h3>
      <p class="price">${Number(product.price).toLocaleString()}đ</p>
    `;
    productContainer.appendChild(card);
  });
}

// Khi bấm vào hình, chuyển qua trang chi tiết
function goDetail(id) {
  window.location.href = `detail.html?id=${id}`;
}