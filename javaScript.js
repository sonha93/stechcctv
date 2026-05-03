let products = JSON.parse(localStorage.getItem("products")) || [];

/* =========================
   🟡 RENDER SẢN PHẨM
========================= */
function render(list = products) {
  const box = document.getElementById("products");
  if (!box) return;

  box.innerHTML = "";

  list.forEach(p => {
    box.innerHTML += `
      <div class="item">

        <img src="${p.img}" onclick="openZoom('${p.img}')">

        <h4>${p.name}</h4>

        <p>
          💰 ${Number(p.price).toLocaleString()}đ
        </p>

        <button onclick="toggleSpec(${p.id})">
          ⚙️ Xem thông số
        </button>

        <div id="spec-${p.id}" style="display:none;">
          💾 Dung lượng: ${p.spec?.dungLuong || ""}<br>
          ⚡ Tốc độ: ${p.spec?.tocDo || ""}<br>
          📦 Loại: ${p.spec?.loai || ""}<br>
          🛡 Bảo hành: ${p.spec?.baoHanh || ""}
        </div>

      </div>
    `;
  });
}

/* =========================
   ⚙️ TOGGLE SPEC
========================= */
function toggleSpec(id){
  const el = document.getElementById("spec-" + id);
  if(!el) return;

  el.style.display = el.style.display === "block" ? "none" : "block";
}

/* =========================
   🖼 ZOOM ẢNH
========================= */
function openZoom(src){
  const box = document.getElementById("imgZoom");
  const img = document.getElementById("zoomImg");

  img.src = src;
  box.style.display = "flex";
}

function closeZoom(){
  document.getElementById("imgZoom").style.display = "none";
}

/* =========================
   🚀 INIT
========================= */
render();