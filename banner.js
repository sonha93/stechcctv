// =========================
// STECH ULTRA 3D BANNER V2
// =========================

document.addEventListener("DOMContentLoaded", function(){

  // =========================
  // CSS
  // =========================
  const style = document.createElement("style");

  style.innerHTML = `

  /* =========================
     MAIN BANNER
  ========================= */
  .vip-banner{

    margin:14px;

    padding:30px;

    border-radius:34px;

    background:
    linear-gradient(
      135deg,
      #052e16,
      #065f46,
      #0f766e
    );

    display:flex;

    align-items:center;

    justify-content:space-between;

    gap:20px;

    position:relative;

    overflow:hidden;

    color:#fff;

    box-shadow:
      0 25px 55px rgba(0,0,0,0.35),
      inset 0 1px 0 rgba(255,255,255,0.08);
  }


  /* LIGHT */
  .vip-banner::before{

    content:"";

    position:absolute;

    width:420px;
    height:420px;

    border-radius:50%;

    background:
    radial-gradient(
      circle,
      rgba(255,255,255,0.15),
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

    font-size:60px;

    font-weight:900;

    letter-spacing:4px;

    margin-bottom:14px;

    color:#fff;

    text-transform:uppercase;

    transform-style:preserve-3d;

    transform:
      perspective(900px)
      rotateX(14deg)
      rotateY(-10deg);

    text-shadow:
      0 1px 0 #ffffff,
      0 2px 0 #bbf7d0,
      0 3px 0 #86efac,
      0 4px 0 #4ade80,
      0 5px 16px rgba(0,0,0,0.35);

    animation:logo3d 4s ease-in-out infinite;
  }


  .stech-3d::after{

    content:"STECH";

    position:absolute;

    inset:0;

    color:rgba(255,255,255,0.15);

    transform:
      translateZ(-20px)
      translateY(8px);

    filter:blur(4px);

    z-index:-1;
  }


  @keyframes logo3d{

    0%{
      transform:
        perspective(900px)
        rotateX(14deg)
        rotateY(-10deg)
        translateY(0px);
    }

    50%{
      transform:
        perspective(900px)
        rotateX(14deg)
        rotateY(-10deg)
        translateY(-6px);
    }

    100%{
      transform:
        perspective(900px)
        rotateX(14deg)
        rotateY(-10deg)
        translateY(0px);
    }

  }


  /* TITLE */
  .vip-left h2{

    font-size:34px;

    font-weight:800;

    line-height:1.3;

    margin-bottom:18px;
  }


  /* LINKS */
  .vip-links{

    display:flex;

    flex-wrap:wrap;

    gap:10px;

    align-items:center;

    margin-bottom:24px;
  }

  .vip-links a{

    color:#fff;

    text-decoration:none;

    font-weight:600;

    font-size:14px;

    transition:.3s;
  }

  .vip-links a:hover{

    color:#bbf7d0;

    transform:translateY(-2px);
  }


  /* BUTTON */
  .vip-btn{

    border:none;

    padding:14px 28px;

    border-radius:999px;

    background:
    linear-gradient(
      135deg,
      #ffffff,
      #d1fae5
    );

    color:#065f46;

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

    height:240px;
  }


  /* CAMERA 3D */
  .cam-3d{

    position:absolute;

    width:110px;

    height:110px;

    border-radius:30px;

    background:
    linear-gradient(
      145deg,
      rgba(255,255,255,0.20),
      rgba(255,255,255,0.05)
    );

    backdrop-filter:blur(10px);

    display:flex;

    align-items:center;

    justify-content:center;

    box-shadow:
      0 20px 35px rgba(0,0,0,0.30),
      inset 0 1px 0 rgba(255,255,255,0.18);

    animation:camFloat 4s ease-in-out infinite;
  }


  /* CAMERA ICON */
  .cam-icon{

    font-size:54px;

    filter:
      drop-shadow(
        0 8px 18px rgba(0,0,0,0.35)
      );
  }


  .cam1{
    left:0;
    top:50px;
    transform:rotate(-10deg);
  }

  .cam2{
    left:105px;
    top:0;
    z-index:2;
    transform:scale(1.15);
    animation-delay:.7s;
  }

  .cam3{
    right:0;
    top:60px;
    transform:rotate(10deg);
    animation-delay:1.3s;
  }


  @keyframes camFloat{

    0%{
      transform:translateY(0px);
    }

    50%{
      transform:translateY(-12px);
    }

    100%{
      transform:translateY(0px);
    }

  }


  /* MOBILE */
  @media(max-width:768px){

    .vip-banner{

      flex-direction:column;

      padding:18px;

      border-radius:24px;
    }

    .vip-left,
    .vip-right{
      width:100%;
    }

    .stech-3d{
      font-size:38px;
    }

    .vip-left h2{
      font-size:22px;
    }

    .camera-stage{

      width:240px;

      height:170px;

      margin:auto;
    }

    .cam-3d{

      width:78px;

      height:78px;
    }

    .cam-icon{
      font-size:38px;
    }

    .cam2{
      left:80px;
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

        <div class="cam-3d cam1">
          <div class="cam-icon">📷</div>
        </div>

        <div class="cam-3d cam2">
          <div class="cam-icon">📹</div>
        </div>

        <div class="cam-3d cam3">
          <div class="cam-icon">🎥</div>
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
