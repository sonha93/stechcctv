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

        // lấy 6 sản phẩm đầu
        products = products.slice(0,6);

        wrap.innerHTML = "";

        products.forEach(p => {
            const html = `
                <a href="logo.html?id=${p.id}" class="featured-card">
               <img src="/images/${p.image}" alt="${p.name}">
                    <div class="featured-name">${p.name}</div>
                    <div class="featured-price">
                        ${Number(p.price).toLocaleString()}đ
                    </div>
                </a>
            `;

            wrap.innerHTML += html;
        });

    } catch(err){
        console.log(err);
        wrap.innerHTML = "Lỗi tải sản phẩm";
    }
}

renderFeaturedProducts();
