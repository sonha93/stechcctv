document.addEventListener("DOMContentLoaded", function(){

  const box = document.getElementById("notify-box");
  if(!box) return;

  function showNotify(text, link = null){

    const div = document.createElement("div");
    div.className = "notify";
    div.innerText = text;

    if(link){
      div.onclick = () => window.location.href = link;
    }

    box.appendChild(div);

    setTimeout(()=>{
      div.remove();
    }, 5000);
  }

  // =========================
  // 🛒 NHẮC GIỎ HÀNG
  // =========================
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if(cart.length > 0){
    showNotify(
      `🛒 Bạn có ${cart.length} sản phẩm trong giỏ. Nhấn để thanh toán`,
      "cart.html"
    );
  }

});