import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore();

async function renderFeaturedProducts() {
   const wrap = document.getElementById("featuredProducts");

document.getElementById("featuredNext").onclick = () => {
    wrap.scrollBy({
        left:300,
        behavior:"smooth"
    });
};

document.getElementById("featuredPrev").onclick = () => {
    wrap.scrollBy({
        left:-300,
        behavior:"smooth"
    });
};
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
  console.log(p);
  const price = Number(
    String(p.price || 0).replace(/\D/g,'')
);

const originalPrice = Number(
    String(p.originalPrice || 0).replace(/\D/g,'')
);

    // tính % giảm
    let discount = 0;

    if (originalPrice > price) {
        discount = Math.round(
            ((originalPrice - price) / originalPrice) * 100
        );
    }

    const html = `
        <a href="logo.html?id=${p.id}" class="featured-card">

            <div class="featured-thumb">
                <img 
                    src="${getImage(p)}"
                    alt="${p.name || 'product'}"
                    loading="lazy"
                    onerror="this.onerror=null;this.src='./images/default.jpg'"
                >

                ${
                    discount > 0
                    ? `<div class="discount-badge">-${discount}%</div>`
                    : ""
                }
            </div>

            <div class="featured-name">${p.name}</div>

            <div class="featured-price-wrap">

                <div class="featured-price">
                    ${price.toLocaleString()}đ
                </div>

                ${
                    originalPrice > price
                    ? `
                    <div class="featured-original-price">
                        ${originalPrice.toLocaleString()}đ
                    </div>
                    `
                    : ""
                }

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
function getImage(p) {
    let img = p.image || p.img || p.imageUrl || "";

    if (Array.isArray(img)) img = img[0];

    if (!img || img.trim() === "") {
        return "./images/default.jpg";
    }

    if (img.startsWith("//")) {
        img = "https:" + img;
    }

    return img;
}
renderFeaturedProducts();
