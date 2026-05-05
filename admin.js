function updateProduct(id){

  let newPrice = Number(document.getElementById(`price-${id}`).value);
  let newOldPrice = Number(document.getElementById(`oldPrice-${id}`).value || 0);

  if (newOldPrice && newOldPrice < newPrice) {
    alert("Giá gốc phải lớn hơn giá bán");
    return;
  }

  products = products.map(p => {
    if(p.id === id){
      return {
        ...p,
        price: (!isNaN(newPrice) && newPrice > 0) ? newPrice : p.price,
        oldPrice: (!isNaN(newOldPrice)) ? newOldPrice : p.oldPrice
      };
    }
    return p;
  });

  save();
  render();
}
/* =========================
   🧹 AUTO FIX DATA CŨ
========================= */
function fixOldData() {
  let list = JSON.parse(localStorage.getItem("products")) || [];

  let changed = false;

  list = list.map(p => {
    let price = Number(p.price) || 0;
    let oldPrice = Number(p.oldPrice) || 0;

    // 🔥 nếu bị đảo (giá bán > giá gốc) thì sửa lại
    if (oldPrice && oldPrice < price) {
      [price, oldPrice] = [oldPrice, price];
      changed = true;
    }

    return {
      ...p,
      price,
      oldPrice
    };
  });

  if (changed) {
    console.log("🛠 Đã fix dữ liệu giá bị lỗi");
    localStorage.setItem("products", JSON.stringify(list));
  }
}

/* chạy 1 lần khi load */
fixOldData();