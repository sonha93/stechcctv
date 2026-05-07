// =========================
// BANNER 3D STECH
// =========================

function renderBanner3D() {

  const banner = `
  
  <section class="banner-3d-wrap">
    <div class="banner-3d">

      <div class="banner-text">
        <span>🔥 Sản phẩm nổi bật</span>
        <h2>Ưu đãi STech hôm nay</h2>
        <p>Giảm đến 40% – Số lượng có hạn!</p>
        <button>Mua ngay</button>
      </div>

      <div class="banner-img">
        <img src="https://cdn-icons-png.flaticon.com/512/2921/2921222.png">
      </div>

    </div>
  </section>

  `;

  // CHÈN SAU HEADER
  const header = document.querySelector("header");

  if(header){
    header.insertAdjacentHTML("afterend", banner);
  }

}


// =========================
// CSS AUTO
// =========================
const style = document.createElement("style");

style.innerHTML = `

.banner-3d-wrap{
  padding:12px;
  perspective:1200px;
}

.banner-3d{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:18px;
  border-radius:20px;

  background: linear-gradient(135deg,#00c853,#64dd17);

  transform: rotateX(6deg) rotateY(-6deg);

  box-shadow:
    0 15px 30px rgba(0,0,0,0.25),
    inset 0 1px 0 rgba(255,255,255,0.4);

  transition: all 0.4s ease;
}

.banner-3d:hover{
  transform: rotateX(0deg) rotateY(0deg) scale(1.03);
}

.banner-text{
  width:65%;
  color:white;
}

.banner-text span{
  font-size:13px;
  opacity:0.9;
}

.banner-text h2{
  font-size:20px;
  margin:6px 0;
  font-weight:bold;
}

.banner-text p{
  font-size:13px;
  margin-bottom:12px;
}

.banner-text button{
  background: rgba(255,255,255,0.95);
  color:#00c853;
  border:none;
  padding:8px 16px;
  border-radius:25px;
  font-weight:bold;
  box-shadow:0 5px 15px rgba(0,0,0,0.25);
  cursor:pointer;
  transition:0.3s;
}

.banner-text button:hover{
  background:#000;
  color:#fff;
}

.banner-img{
  display:flex;
  align-items:center;
  justify-content:center;
}

.banner-img img{
  width:85px;
  filter: drop-shadow(0 15px 20px rgba(0,0,0,0.35));
}

@media(max-width:768px){

  .banner-3d{
    padding:15px;
  }

  .banner-text{
    width:70%;
  }

  .banner-text h2{
    font-size:18px;
  }

  .banner-text p{
    font-size:12px;
  }

  .banner-img img{
    width:70px;
  }

}

`;

document.head.appendChild(style);


// =========================
// START
// =========================
document.addEventListener("DOMContentLoaded", function(){
  renderBanner3D();
});