// =========================
// FORCE MOBILE VIEWPORT
// =========================
(function(){

  let meta = document.querySelector('meta[name="viewport"]');

  if(!meta){

    meta = document.createElement("meta");

    meta.name = "viewport";

    meta.content =
    "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";

    document.head.appendChild(meta);

  }

})();


// =========================
// STECH ULTRA 3D BANNER MOBILE PRO
// =========================

document.addEventListener("DOMContentLoaded", function(){

  // =========================
  // MOBILE DETECT
  // =========================
  const isMobile =
    /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i
    .test(navigator.userAgent);

  document.body.classList.add(
    isMobile ? "is-mobile" : "is-desktop"
  );


  // =========================
  // CSS
  // =========================
  const style = document.createElement("style");

  style.innerHTML = `

  *{
    box-sizing:border-box;
  }

  body{
    overflow-x:hidden;
  }

  /* =========================
     MAIN BANNER
  ========================= */
  .vip-banner{

    width:calc(100% - 20px);

    margin:10px auto;

    padding:28px;

    border-radius:34px;

    background:
    linear-gradient(
      135deg,
      #0b3b2e,
      #106b4d,
      #19a56f
    );

    display:flex;

    align-items:center;

    justify-content:space-between;

    gap:20px;

    position:relative;

    overflow:hidden;

    color:#fff;

    box-shadow:
      0 20px 50px rgba(0,0,0,0.35),
      inset 0 1px 0 rgba(255,255,255,0.12);
  }


  /* LIGHT EFFECT */
  .vip-banner::before{

    content:"";

    position:absolute;

    width:420px;
    height:420px;

    border-radius:50%;

    background:
    radial-gradient(
      circle,
      rgba(255,255,255,0.18),
      transparent 70%
    );

    top:-220px;
    right:-160px;
  }


  .vip-banner::after{

    content:"";

    position:absolute;

    width:220px;
    height:220px;

    border-radius:50%;

    background:
    rgba(255,255,255,0.05);

    bottom:-120px;
    left:-80px;
  }


  /* =========================
     LEFT
  ========================= */
  .vip-left{

    width:55%;

    position:relative;

    z-index:2;
  }


  /* TAG */
  .vip-tag{

    display:inline-flex;

    align-items:center;

    gap:8px;

    padding:9px 18px;

    border-radius:999px;

    background:
    linear-gradient(
      135deg,
      #ff1744,
      #ff4d6d
    );

    font-size:12px;

    font-weight:700;

    letter-spacing:1px;

    margin-bottom:18px;

    box-shadow:
      0 10px 25px rgba(255,0,85,0.35);
  }


  /* 3D LOGO */
  .stech-3d{

    position:relative;

    display:inline-block;

    font-size:58px;

    font-weight:900;

    letter-spacing:4px;

    margin-bottom:14px;

    color:#fff;

    text-transform:uppercase;

    transform-style:preserve-3d;

    transform:
      perspective(900px)
      rotateX(12deg)
      rotateY(-10deg);

    text-shadow:
      0 1px 0 #ffffff,
      0 2px 0 #d1fae5,
      0 3px 0 #a7f3d0,
      0 4px 0 #6ee7b7,
      0 5px 12px rgba(0,0,0,0.35);

    animation:logo3d 4s ease-in-out infinite;
  }


  .stech-3d::after{

    content:"STECH";

    position:absolute;

    inset:0;

    color:rgba(255,255,255,0.18);

    transform:
      translateZ(-20px)
      translateY(8px);

    filter:blur(3px);

    z-index:-1;
  }


  @keyframes logo3d{

    0%{
      transform:
        perspective(900px)
        rotateX(12deg)
        rotateY(-10deg)
        translateY(0px);
    }

    50%{
      transform:
        perspective(900px)
        rotateX(12deg)
        rotateY(-10deg)
        translateY(-5px);
    }

    100%{
      transform:
        perspective(900px)
        rotateX(12deg)
        rotateY(-10deg)
        translateY(0px);
    }

  }


  /* TITLE */
  .vip-left h2{

    font-size:34px;

    font-weight:800;

    line-height:1.3;

    margin-bottom:12px;
  }


  /* LINKS */
  .vip-links{

    display:flex;

    flex-wrap:wrap;

    gap:10px;

    align-items:center;

    font-size:14px;

    margin-bottom:24px;
  }

  .vip-links a{

    color:#fff;

    text-decoration:none;

    font-weight:600;

    transition:0.3s;
  }

  .vip-links a:hover{

    color:#d1fae5;

    transform:translateY(-1px);
  }


  /* BUTTON */
  .vip-btn{

    border:none;

    padding:14px 26px;

    border-radius:999px;

    background:
    linear-gradient(
      135deg,
      #ffffff,
      #d1fae5
    );

    color:#0f5132;

    font-size:15px;

    font-weight:800;

    cursor:pointer;

    transition:0.35s;

    box-shadow:
      0 10px 25px rgba(0,0,0,0.25);
  }


  .vip-btn:hover{

    transform:
      translateY(-3px)
      scale(1.05);

    background:#000;

    color:#fff;
  }


  /* =========================
     RIGHT
  ========================= */
  .vip-right{

    width:45%;

    display:flex;

    justify-content:center;

    align-items:center;

    position:relative;

    z-index:2;
  }


  /* CAMERA STAGE */
  .camera-stage{

    position:relative;

    width:320px;

    height:220px;
  }


  /* CAMERA CARD */
  .cam-card{

    position:absolute;

    width:105px;

    height:105px;

    border-radius:26px;

    background:
    linear-gradient(
      135deg,
      rgba(255,255,255,0.20),
      rgba(255,255,255,0.06)
    );

    backdrop-filter:blur(10px);

    display:flex;

    align-items:center;

    justify-content:center;

    box-shadow:
      0 15px 30px rgba(0,0,0,0.28),
      inset 0 1px 0 rgba(255,255,255,0.18);

    animation:camFloat 4s ease-in-out infinite;
  }


  .cam-card span{

    font-size:48px;
  }


  .cam1{
    left:0;
    top:40px;
  }

  .cam2{
    left:105px;
    top:0;
    z-index:2;
    animation-delay:.7s;
  }

  .cam3{
    right:0;
    top:55px;
    animation-delay:1.3s;
  }


  @keyframes camFloat{

    0%{
      transform:translateY(0px);
    }

    50%{
      transform:translateY(-10px);
    }

    100%{
      transform:translateY(0px);
    }

  }


  /* =========================
     MOBILE
  ========================= */
  @media(max-width:768px){

    .vip-banner{

      width:calc(100% - 16px);

      margin:8px auto;

      padding:18px;

      border-radius:24px;

      flex-direction:column;

      align-items:flex-start;

      gap:18px;
    }

    .vip-left{
      width:100%;
    }

    .vip-tag{

      font-size:11px;

      padding:7px 14px;

      margin-bottom:12px;
    }

    .stech-3d{

      font-size:38px;

      letter-spacing:2px;

      margin-bottom:12px;

      line-height:1;
    }

    .vip-left h2{

      font-size:22px;

      line-height:1.4;

      margin-bottom:14px;
    }

    .vip-links{

      gap:8px;

      font-size:14px;

      line-height:1.7;

      margin-bottom:18px;
    }

    .vip-btn{

      width:100%;

      height:52px;

      font-size:16px;

      border-radius:18px;
    }

    .vip-right{

      width:100%;

      justify-content:center;
    }

    .camera-stage{

      width:100%;

      height:auto;

      display:flex;

      justify-content:center;

      align-items:center;

      gap:10px;
    }

    .cam-card{

      position:relative !important;

      left:auto !important;

      right:auto !important;

      top:auto !important;

      width:78px;

      height:78px;

      border-radius:20px;
    }

    .cam-card span{

      font-size:34px;
    }

  }

  `;

  document.head.appendChild(style);


  // =========================
  // HTML
  // =========================
  const banner = `

  <section class="vip-banner">

    <div class="vip-left">

      <span class="vip-tag">
        🔥 HOT SALE 40%
      </span>

      <div class="stech-3d">
        STECH
      </div>

      <h2>
        Camera IMOU Chính Hãng
      </h2>

      <div class="vip-links">

        <a href="camera-trong-nha.html">
          Camera trong nhà
        </a>

        •

        <a href="camera-ngoai-troi.html">
          Camera ngoài trời
        </a>

        •

        <a href="bao-hanh.html">
          Chính sách bảo hành
        </a>

      </div>

      <button 
        class="vip-btn"
        onclick="window.location.href='camera-trong-nha.html'"
      >
        Mua ngay
      </button>

    </div>

    <div class="vip-right">

      <div class="camera-stage">

        <div class="cam-card cam1">
          <span>📷</span>
        </div>

        <div class="cam-card cam2">
          <span>📹</span>
        </div>

        <div class="cam-card cam3">
          <span>🎥</span>
        </div>

      </div>

    </div>

  </section>

  `;


  // =========================
  // RENDER
  // =========================
  const header = document.querySelector("header");

  if(header){

    header.insertAdjacentHTML(
      "afterend",
      banner
    );

  }

});
