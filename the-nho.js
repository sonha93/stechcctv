const products = [
  {
    id: 1,
    name: "IMOU MicroSD 32GB Class 10",
    price: 85000,
    oldPrice: 120000,
    badge: "GIẢM SỐC",
    img: "https://via.placeholder.com/300",
    spec: {
      dungLuong: "32GB",
      loai: "MicroSDHC",
      tocDoDoc: "80MB/s",
      tocDoGhi: "30MB/s",
      class: "Class 10",
      uhs: "UHS-I",
      app: "A1",
      nhietDo: "-25°C ~ 85°C",
      baoHanh: "12 tháng",
      tuongThich: "Camera IMOU / điện thoại / máy quay"
    }
  },
  {
    id: 2,
    name: "IMOU MicroSD 64GB High Speed",
    price: 125000,
    oldPrice: 180000,
    badge: "BEST SELL",
    img: "https://via.placeholder.com/300",
    spec: {
      dungLuong: "64GB",
      loai: "MicroSDXC",
      tocDoDoc: "100MB/s",
      tocDoGhi: "60MB/s",
      class: "Class 10",
      uhs: "UHS-I U1",
      app: "A1",
      nhietDo: "-25°C ~ 85°C",
      baoHanh: "12 tháng",
      tuongThich: "Camera 2K / IMOU / DVR"
    }
  },
  {
    id: 3,
    name: "IMOU MicroSD 128GB Ultra",
    price: 190000,
    oldPrice: 280000,
    badge: "HOT",
    img: "https://via.placeholder.com/300",
    spec: {
      dungLuong: "128GB",
      loai: "MicroSDXC",
      tocDoDoc: "120MB/s",
      tocDoGhi: "80MB/s",
      class: "Class 10",
      uhs: "UHS-I U3",
      app: "A2",
      nhietDo: "-25°C ~ 85°C",
      baoHanh: "24 tháng",
      tuongThich: "Camera 4K / AI camera / IMOU"
    }
  },
  {
    id: 4,
    name: "IMOU MicroSD 256GB Pro Max",
    price: 320000,
    oldPrice: 450000,
    badge: "PRO",
    img: "https://via.placeholder.com/300",
    spec: {
      dungLuong: "256GB",
      loai: "MicroSDXC",
      tocDoDoc: "160MB/s",
      tocDoGhi: "100MB/s",
      class: "Class 10",
      uhs: "UHS-I U3",
      app: "A2",
      nhietDo: "-25°C ~ 85°C",
      baoHanh: "24 tháng",
      tuongThich: "Camera AI 4K / đầu ghi / điện thoại"
    }
  }
];

// ===== RENDER =====
function render() {
  const box = document.getElementById("products");
  if (!box) return;

  box.innerHTML = "";

  products.forEach(p => {
    box.innerHTML += `
      <div class="card">
        <img src="${p.img}" alt="${p.name}">

        <div class="info">
          <div class="title">${p.name}</div>

          <div class="price">${p.price.toLocaleString()}đ</div>
          <div class="old">${p.oldPrice.toLocaleString()}đ</div>

          <div class="tag">${p.badge}</div>

          <button class="btn" onclick="toggleSpec(${p.id})">
            ⚙️ Xem thông số kỹ thuật
          </button>

          <div class="spec" id="spec-${p.id}">
            📦 Dung lượng: ${p.spec.dungLuong}<br>
            💾 Loại: ${p.spec.loai}<br>
            ⚡ Tốc độ đọc: ${p.spec.tocDoDoc}<br>
            ⚡ Tốc độ ghi: ${p.spec.tocDoGhi}<br>
            📊 Class: ${p.spec.class}<br>
            🚀 UHS: ${p.spec.uhs}<br>
            📱 App: ${p.spec.app}<br>
            🌡 Nhiệt độ: ${p.spec.nhietDo}<br>
            🛡 Bảo hành: ${p.spec.baoHanh}<br>
            📷 Tương thích: ${p.spec.tuongThich}
          </div>
        </div>
      </div>
    `;
  });
}

// ===== TOGGLE SPEC =====
function toggleSpec(id) {
  const el = document.getElementById("spec-" + id);
  if (!el) return;
  el.style.display = (el.style.display === "block") ? "none" : "block";
}

// ===== MENU =====
function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", render);