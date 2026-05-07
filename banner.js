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
// STECH MINI CLEAN BANNER
// =========================

document.addEventListener("DOMContentLoaded", function(){

  const style = document.createElement("style");

  style.innerHTML = `

  *{
    box-sizing:border-box;
  }

  body{
    overflow-x:hidden;
  }

  /* =========================
     BANNER
  ========================= */
  .vip-banner{

    width:calc(100% - 12px);

    margin:6px auto;

    padding:14px;

    border-radius:22px;

    background:
    linear-gradient(
      135deg,
      #0b3b2e,
      #106b4d,
      #19a56f
    );

    position:relative;

    overflow:hidden;

    color:#fff;

    box-shadow:
      0 10px 30px rgba(0,0,0,0.25);
  }

  /* GLOW */
  .vip-banner::before{

    content:"";

    position:absolute;

    width:220px;
    height:220px;

    border-radius:50%;

    background:
    radial-gradient(
      circle,
      rgba(255,255,255,0.12),
      transparent 70%
    );

    top:-120px;
    right:-90px;
  }


  /* =========================
     CONTENT
  ========================= */
  .vip-content{

    position:relative;

    z-index:2;
  }


  /* TAG */
  .vip-tag{

    display:inline-flex;

    align-items:center;

    padding:4px 10px;

    border-radius:999px;

    background:
    linear-gradient(
      135deg,
      #ff1744,
      #ff4d6d
    );

    font-size:9px;

    font-weight:700;

    margin-bottom:8px;
  }


  /* =========================
     LOGO 3D ĐỘNG
  ========================= */
  .stech-3d{

    position:relative;

    display:inline-block;

    font-size:28px;

    font-weight:900;

    letter-spacing:2px;

    margin-bottom:6px;

    line-height:1;

    text-transform:uppercase;

    color:#fff;

    transform-style:preserve-3d;

    animation:logo3dFloat 3.5s ease-in-out infinite;

    text-shadow:
      0 1px 0 #ffffff,
      0 2px 0 #d1fae5,
      0 3px 0 #86efac,
      0 4px 12px rgba(0,0,0,0.35);
  }


  /* PHẢN CHIẾU */
  .stech-3d::before{

    content:"STECH";

    position:absolute;

    inset:0;

    color:rgba(255,255,255,0.16);

    transform:
      translateY(8px)
      scaleY(-1);

    filter:blur(4px);

    opacity:.5;
  }


  /* GLOW */
  .stech-3d::after{

    content:"";

    position:absolute;

    inset:-8px;

    border-radius:12px;

    background:
      radial-gradient(
        circle,
        rgba(255,255,255,0.15),
        transparent 70%
      );

    z-index:-1;

    animation:glowPulse 3s ease-in-out infinite;
  }


  /* FLOAT */
  @keyframes logo3dFloat{

    0%{
      transform:
        perspective(700px)
        rotateX(8deg)
        rotateY(-8deg)
        translateY(0px);
    }

    50%{
      transform:
        perspective(700px)
        rotateX(8deg)
        rotateY(-8deg)
        translateY(-4px);
    }

    100%{
      transform:
        perspective(700px)
        rotateX(8deg)
        rotateY(-8deg)
        translateY(0px);
    }

  }


  /* GLOW */
  @keyframes glowPulse{

    0%{
      opacity:.4;
      transform:scale(1);
    }

    50%{
      opacity:.8;
      transform:scale(1.08);
    }

    100%{
      opacity:.4;
      transform:scale(1);
    }

  }


  /* TITLE */
  .vip-content h2{

    font-size:15px;

    line-height:1.4;

    margin-bottom:10px;

    font-weight:700;
  }


  /* LINKS */
  .vip-links{

    display:flex;

    align-items:center;

    gap:6px;

    overflow-x:auto;

    white-space:nowrap;

    margin-bottom:12px;

    scrollbar-width:none;
  }

  .vip-links::-webkit-scrollbar{
    display:none;
  }

  .vip-links a{

    color:#fff;

    text-decoration:none;

    font-size:11px;

    font-weight:600;

    opacity:0.95;

    flex:none;
  }


  /* BUTTON */
  .vip-btn{

    border:none;

    height:36px;

    padding:0 16px;

    border-radius:12px;

    background:#fff;

    color:#0f5132;

    font-size:12px;

    font-weight:800;

    cursor:pointer;

    box-shadow:
      0 6px 14px rgba(0,0,0,0.18);

    transition:.2s;
  }

  .vip-btn:active{
    transform:scale(0.97);
  }

  .vip-btn:hover{

    background:#000;

    color:#fff;
  }

  `;

  document.head.appendChild(style);


  // =========================
  // HTML
  // =========================
  const banner = `

  <section class="vip-banner">

    <div class="vip-content">

      <span class="vip-tag">
        🔥 SALE 40%
      </span>

      <div class="stech-3d">
        STECH
      </div>

      <h2>
        Camera IMOU Chính Hãng
      </h2>

      <div class="vip-links">

        <a href="camera-trong-nha.html">
          Trong nhà
        </a>

        •

        <a href="camera-ngoai-troi.html">
          Ngoài trời
        </a>

        •

        <a href="bao-hanh.html">
          Bảo hành
        </a>

      </div>

      <button
        class="vip-btn"
        onclick="window.location.href='camera-trong-nha.html'"
      >
        Mua ngay
      </button>

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
