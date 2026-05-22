(function(){

  function startFlashSale() {

    if(!window.allProducts || window.allProducts.length === 0) return;

    const dealProducts = window.allProducts.filter(p => p.featured === "home");
    if(dealProducts.length === 0) return;
    const product = dealProducts[Math.floor(Math.random() * dealProducts.length)];

    const banner = document.createElement("div");
    banner.id = "flash-sale-banner";
    banner.style.cssText = `
      position: fixed;
      top: 0;
      width: 100%;
      background: #ff4d4f;
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      z-index: 9999;
      font-family: sans-serif;
    `;

    banner.innerHTML = `
      <div style="display:flex; align-items:center;">
        <img src="${product.img}" alt="${product.name}" style="height:50px;margin-right:10px;object-fit:cover;">
        <div>
          <div style="font-weight:bold;">${product.name}</div>
          <div style="font-size:14px;">${Number(product.price).toLocaleString()}đ</div>
        </div>
      </div>
      <div>
        <span id="flash-countdown" style="font-weight:bold; font-size:16px;"></span>
        <button id="flash-buy-btn" style="margin-left:10px;background:#fff;color:#ff4d4f;border:none;padding:5px 10px;cursor:pointer;font-weight:bold;">Mua ngay</button>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById("flash-buy-btn").onclick = function(){
      window.addToCartById(product.id);
    };

    const endTime = new Date().getTime() + 1000*60*60; // countdown 1 giờ
    const countdownEl = document.getElementById("flash-countdown");

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;
      if(distance <= 0){
        clearInterval(timer);
        banner.style.display = "none";
        return;
      }
      const hours = Math.floor((distance % (1000*60*60*24)) / (1000*60*60));
      const minutes = Math.floor((distance % (1000*60*60)) / (1000*60));
      const seconds = Math.floor((distance % (1000*60)) / 1000);
      countdownEl.innerText = `${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
  }

  // Chờ allProducts load xong
  const waitProducts = setInterval(() => {
    if(allProducts && allProducts.length > 0){
      clearInterval(waitProducts);
      startFlashSale();
    }
  }, 200);

})();
