/* =========================
   ADD TO CART - FIREBASE READY
========================= */
window.addToCart = function(id) {
  const product = getProducts().find(p => String(p.id) === String(id));
  if (!product) return;

  // Kiểm tra user login
  if (!firebase.auth().currentUser) {
    return alert("Bạn cần đăng nhập để thêm sản phẩm vào giỏ!");
  }

  const uid = firebase.auth().currentUser.uid;
  const cartRef = firebase.database().ref("carts/" + uid);

  cartRef.once("value").then(snapshot => {
    let cart = snapshot.val() || [];
    const index = cart.findIndex(item => String(item.id) === String(id));

    if (index !== -1) {
      // nếu đã có sản phẩm -> tăng số lượng
      cart[index].quantity = (cart[index].quantity || 1) + 1;
    } else {
      // nếu chưa có -> thêm mới
      cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        img: product.img || "",
        quantity: 1
      });
    }

    cartRef.set(cart).then(() => {
      alert("Đã thêm vào giỏ 🛒");
      // Cập nhật badge realtime (nếu bạn đã có element cartCount)
      const cartCountEl = document.getElementById("cartCount");
      if (cartCountEl) {
        const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCountEl.innerText = count;
      }
    });
  });
};
