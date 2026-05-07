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
// STECH MINI MOBILE BANNER
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

    display:flex;

    align-items:center;

    justify-content:space-between;

    gap:10px;

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
     LEFT
  ========================= */
  .vip-left{

    width:60%;

    position:relative;

    z-index:2;
  }

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

    margin-bottom:7px;
  }

  /* LOGO */
  .stech-3d{

    font-size:26px;

    font-weight:900;

    letter-spacing:1px;

    margin-bottom:5px;

    line-height:1;

    color:#fff;

    text-shadow:
      0 1px 0 #d1fae5,
      0 2px 6px rgba(0,0,0,0.35);
  }

  .vip-left h2{

    font-size:14px;

    line-height:1.4;

    margin-bottom:8px;

    font-weight:700;
  }

  /* LINKS */
  .vip-links{

    display:flex;

    gap:6px;

    overflow-x:auto;

    white-space:nowrap;

    margin-bottom:10px;

    scrollbar-width:none;
  }

  .vip-links::-webkit-scrollbar{
    display:none;
  }

  .vip-links a{

    color:#fff;

    text-decoration:none;

    font-size:10px;

    font-weight:600;

    opacity:0.92;

    flex:none;
  }

  /* BUTTON */
  .vip-btn{

    border:none;

    height:34px;

    padding:0 14px;

    border-radius:12px;

    background:#fff;

    color:#0f5132;

    font-size:11px;

    font-weight:700;

    cursor:pointer;
  }


  /* =========================
     RIGHT
  ========================= */
  .vip-right{

    width:40%;

    display:flex;

    justify-content:flex-end;

    position:relative;

    z-index:2;
  }

  .camera-stage{

    width:115px;

    height:90px;

    position:relative;
  }

  .cam-card{

    position:absolute;

    width:46px;

    height:46px;

    border-radius:14px;

    background:
    linear-gradient(
      135deg,
      rgba(255,255,255,0.18),
      rgba(255,255,255,0.06)
    );

    backdrop-filter:blur(8px);

    display:flex;

    align-items:center;

    justify-content:center;

    box-shadow:
      0 10px 18px rgba(0,0,0,0.25);

    animation:camFloat 4s ease-in-out infinite;
  }

  .cam-card span{

    font-size:22px;
  }

  .cam1{
    left:0;
    top:30px;
  }

  .cam2{
    left:34px;
    top:0;
    z-index:2;
    animation-delay:.7s;
  }

  .cam3{
    right:0;
    top:34px;
    animation-delay:1.3s;
  }

  @keyframes camFloat{

    0%{
      transform:translateY(0px);
    }

    50%{
      transform:translateY(-6px);
    }

    100%{
      transform:translateY(0px);
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
        🔥 SALE
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

  const header = document.querySelector("header");

  if(header){

    header.insertAdjacentHTML(
      "afterend",
      banner
    );

  }

});
