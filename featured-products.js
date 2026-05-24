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
            const data = doc.data();

            products.push({
                id: doc.id,
                ...data
            });
        });

        products = products.slice(0, 6);

        wrap.innerHTML = "";

        products.forEach(p => {

            // 🔥 FIX QUAN TRỌNG: xử lý đường dẫn ảnh an toàn
            let imgSrc = p.image || "";

            // nếu Firestore lỡ lưu full path thì cắt bỏ
            imgSrc = imgSrc.replace(/^\/+/, "");
            imgSrc = imgSrc.replace(/^images\//, "");

            imgSrc = `images/${imgSrc}`;

            const html = `
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

            wrap.innerHTML += html;
        });

    } catch (err) {
        console.log(err);
        wrap.innerHTML = "Lỗi tải sản phẩm";
    }
}

renderFeaturedProducts();
