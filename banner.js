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


  /* LOGO */
  .stech-3d{

    font-size:28px;

    font-weight:900;

    letter-spacing:1px;

    margin-bottom:5px;

    line-height:1;

    color:#fff;

    text-shadow:
      0 1px 0 #d1fae5,
      0 2px 8px rgba(0,0,0,0.35);
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
  }

  .vip-btn:active{
    transform:scale(0.97);
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
