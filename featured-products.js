import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore();

async function renderFeaturedProducts() {
    const wrap = document.getElementById("featuredProducts");
    if (!wrap) return;

    wrap.innerHTML = "Đang tải...";

    try {
        const snap = await getDocs(collection(db, "products"));

        let products = [];

        snap.forEach(doc => {
            products.push({
                id: doc.id,
                ...doc.data()
            });
        });

        products = products.slice(0, 6);

        wrap.innerHTML = "";

        products.forEach(p => {

            // 🔥 FIX CHẮC ĂN ĐƯỜNG DẪN ẢNH
            let img = (p.image || "").trim();

            // bỏ / hoặc images/ nếu Firestore lưu sai
            img = img.replace(/^\/+/, "");
            img = img.replace(/^images\//, "");

            const imgSrc = `images/${img}`;

            wrap.innerHTML += `
                <a href="logo.html?id=${p.id}" class="featured-card">
                    <img 
                        src="${imgSrc}" 
                        alt="${p.name}"
                        onerror="this.src='images/no-image.png'"
                    >
                    <div class="featured-name">${p.name}</div>
                    <div class="featured-price">
                        ${Number(p.price || 0).toLocaleString()}đ
                    </div>
                </a>
            `;
        });

    } catch (err) {
        console.log(err);
        wrap.innerHTML = "Lỗi tải sản phẩm";
    }
}

renderFeaturedProducts();
