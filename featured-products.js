import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore();

let autoSlide;

function startAutoSlide(wrap) {
    clearInterval(autoSlide);

    // nếu không đủ item để scroll thì không chạy
    if (!wrap || wrap.scrollWidth <= wrap.clientWidth) return;

    autoSlide = setInterval(() => {
        const maxScroll = wrap.scrollWidth - wrap.clientWidth;

        if (wrap.scrollLeft >= maxScroll - 5) {
            wrap.scrollTo({ left: 0, behavior: "smooth" });
        } else {
            wrap.scrollBy({ left: 300, behavior: "smooth" });
        }
    }, 3000);
}

function getImage(p) {
    let img = p.image || p.img || p.imageUrl || "";

    if (Array.isArray(img)) img = img[0];

    if (!img || img.trim() === "") return "./images/default.jpg";

    if (img.startsWith("//")) img = "https:" + img;

    return img;
}

async function renderFeaturedProducts() {

    const wrap = document.querySelector(".featured-wrap");
    const next = document.getElementById("featuredNext");
    const prev = document.getElementById("featuredPrev");

    if (!wrap || !next || !prev) return;

    // NEXT / PREV
    next.onclick = () => {
        wrap.scrollBy({ left: 300, behavior: "smooth" });
    };

    prev.onclick = () => {
        wrap.scrollBy({ left: -300, behavior: "smooth" });
    };

    wrap.innerHTML = "Đang tải...";

    try {
        const snap = await getDocs(collection(db, "products"));

        let products = [];

        snap.forEach(doc => {
            products.push({
                ...doc.data(),
                docId: doc.id
            });
        });

        products = products.slice(0, 10);

        wrap.innerHTML = "";

        products.forEach(p => {

            const price = Number(String(p.price || 0).replace(/\D/g, ''));
            const originalPrice = Number(String(p.oldPrice || 0).replace(/\D/g, ''));

            let discount = 0;
            if (originalPrice > price) {
                discount = Math.round(((originalPrice - price) / originalPrice) * 100);
            }

            const html = `
                <a href="logo.html?id=${p.docId}" class="featured-card">

                    <div class="featured-thumb">
                        <img 
                            src="${getImage(p)}"
                            loading="lazy"
                            onerror="this.src='./images/default.jpg'"
                        >

                        ${discount > 0
                            ? `<div class="discount-badge">-${discount}%</div>`
                            : ""
                        }
                    </div>

                    <div class="featured-name">${p.name || ""}</div>

                    <div class="featured-price-wrap">

                        <div class="featured-price">
                            ${price.toLocaleString()}đ
                        </div>

                        ${originalPrice > price
                            ? `<div class="featured-original-price">
                                ${originalPrice.toLocaleString()}đ
                               </div>`
                            : ""
                        }

                    </div>

                </a>
            `;

            wrap.innerHTML += html;
        });

        // 🔥 AUTO SLIDE SAU KHI RENDER XONG
        setTimeout(() => {
            startAutoSlide(wrap);
        }, 300);

        // pause khi hover
        wrap.addEventListener("mouseenter", () => {
            clearInterval(autoSlide);
        });

        wrap.addEventListener("mouseleave", () => {
            startAutoSlide(wrap);
        });

    } catch (err) {
        console.log(err);
        wrap.innerHTML = "Lỗi tải sản phẩm";
    }
}

renderFeaturedProducts();
