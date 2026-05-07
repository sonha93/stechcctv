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
// STECH ULTRA VIP AI BANNER
// =========================

document.addEventListener("DOMContentLoaded", function(){

  const style = document.createElement("style");

  style.innerHTML = `

  *{
    box-sizing:border-box;
  }

  body{
    overflow-x:hidden;
    background:#f5f5f5;
  }

  /* =========================
     VIP BANNER
  ========================= */
  .vip-banner{

    width:calc(100% - 12px);

    margin:8px auto;

    padding:18px;

    border-radius:30px;

    position:relative;

    overflow:hidden;

    color:#fff;

    background:
      linear-gradient(
        rgba(0,0,0,0.30),
        rgba(0,0,0,0.74)
      ),

      url("https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?q=80&w=1600&auto=format&fit=crop");

    background-size:cover;

    background-position:center;

    box-shadow:
      0 20px 50px rgba(0,0,0,.35);

    isolation:isolate;
  }


  /* GLASS */
  .vip-banner::before{

    content:"";

    position:absolute;

    inset:0;

    background:
      linear-gradient(
        135deg,
        rgba(255,255,255,.10),
        rgba(255,255,255,.02)
      );

    backdrop-filter:blur(2px);

    z-index:0;
  }


  /* LIGHT EFFECT */
  .vip-banner::after{

    content:"";

    position:absolute;

    width:320px;
    height:320px;

    border-radius:50%;

    background:
      radial-gradient(
        circle,
        rgba(0,255,170,.16),
        transparent 70%
      );

    top:-140px;
    right:-100px;

    animation:lightMove 6s ease-in-out infinite;
  }

  @keyframes lightMove{

    0%{
      transform:scale(1);
      opacity:.7;
    }

    50%{
      transform:scale(1.15);
      opacity:1;
    }

    100%{
      transform:scale(1);
      opacity:.7;
    }

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

    padding:5px 13px;

    border-radius:999px;

    background:
      linear-gradient(
        135deg,
        #ff1744,
        #ff4d6d
      );

    font-size:9px;

    font-weight:900;

    margin-bottom:12px;

    box-shadow:
      0 6px 16px rgba(255,0,80,.35);
  }


  /* =========================
     LOGO 3D
  ========================= */
  .stech-3d{

    position:relative;

    display:inline-block;

    font-size:42px;

    font-weight:900;

    letter-spacing:3px;

    line-height:1;

    margin-bottom:10px;

    color:#fff;

    text-transform:uppercase;

    animation:floatLogo 4s ease-in-out infinite;

    text-shadow:
      0 1px 0 #ffffff,
      0 2px 0 #d1d5db,
      0 3px 0 #9ca3af,
      0 4px 0 #6b7280,
      0 5px 20px rgba(0,0,0,.50);
  }


  /* REFLECTION */
  .stech-3d::before{

    content:"STECH";

    position:absolute;

    inset:0;

    color:rgba(255,255,255,.16);

    transform:
      translateY(11px)
      scaleY(-1);

    filter:blur(5px);

    opacity:.35;
  }


  /* OUTER GLOW */
  .stech-3d::after{

    content:"";

    position:absolute;

    inset:-10px;

    border-radius:16px;

    background:
      radial-gradient(
        circle,
        rgba(255,255,255,.12),
        transparent 70%
      );

    z-index:-1;

    animation:logoGlow 3s ease-in-out infinite;
  }

  @keyframes floatLogo{

    0%{
      transform:
        perspective(900px)
        rotateX(8deg)
        rotateY(-8deg)
        translateY(0px);
    }

    50%{
      transform:
        perspective(900px)
        rotateX(8deg)
        rotateY(-8deg)
        translateY(-5px);
    }

    100%{
      transform:
        perspective(900px)
        rotateX(8deg)
        rotateY(-8deg)
        translateY(0px);
    }

  }

  @keyframes logoGlow{

    0%{
      opacity:.4;
      transform:scale(1);
    }

    50%{
      opacity:.9;
      transform:scale(1.08);
    }

    100%{
      opacity:.4;
      transform:scale(1);
    }

  }


  /* TITLE */
  .vip-content h2{

    font-size:18px;

    line-height:1.5;

    margin-bottom:14px;

    font-weight:800;

    text-shadow:
      0 2px 10px rgba(0,0,0,.45);
  }


  /* LINKS */
  .vip-links{

    display:flex;

    align-items:center;

    gap:8px;

    overflow-x:auto;

    white-space:nowrap;

    margin-bottom:15px;

    scrollbar-width:none;
  }

  .vip-links::-webkit-scrollbar{
    display:none;
  }

  .vip-links a{

    color:#fff;

    text-decoration:none;

    font-size:11px;

    font-weight:700;

    opacity:.96;

    flex:none;

    transition:.25s;
  }

  .vip-links a:hover{

    color:#86efac;
  }


  /* =========================
     VIP BUTTON
  ========================= */
  .vip-btn{

    border:none;

    height:32px;

    padding:0 16px;

    border-radius:999px;

    background:#fff;

    color:#111;

    font-size:11px;

    font-weight:900;

    cursor:pointer;

    box-shadow:
      0 6px 14px rgba(0,0,0,.22);

    transition:.25s;
  }

  .vip-btn:hover{

    transform:translateY(-2px);

    background:#111;

    color:#fff;
  }

  .vip-btn:active{

    transform:scale(.96);
  }


  /* =========================
     MOBILE
  ========================= */
  @media(max-width:768px){

    .vip-banner{

      padding:16px;

      border-radius:24px;
    }

    .stech-3d{

      font-size:34px;

      letter-spacing:2px;
    }

    .vip-content h2{

      font-size:14px;
    }

    .vip-links a{

      font-size:10px;
    }

    .vip-btn{

      height:30px;

      padding:0 14px;

      font-size:10px;
    }

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
        Camera AI Security IMOU Chính Hãng
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
