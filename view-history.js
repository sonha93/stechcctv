// ===== IMAGE =====

function getImage(p) {

    let img = p.image || p.img || p.imageUrl || "";

    if (Array.isArray(img)) {
        img = img[0];
    }

    if (!img || img.trim() === "") {
        return "./images/default.jpg";
    }

    if (img.startsWith("//")) {
        img = "https:" + img;
    }

    return img;
}

// ===== LOAD HISTORY =====

async function loadViewedProducts() {

    const user = auth.currentUser;

    if (!user) return;

    const uid = user.uid;

    const historyRef = db.ref(`view_history/${uid}`);

    historyRef.on("value", (snapshot) => {

        const data = snapshot.val();

        const wrapper =
            document.getElementById("historyProducts");

        if (!wrapper) return;

        if (!data) {

            wrapper.innerHTML =
                "<p>Chưa có sản phẩm đã xem</p>";

            return;
        }

        let products = Object.values(data);

        // newest first
        products.sort(
            (a, b) => b.viewedAt - a.viewedAt
        );

        // limit
        products = products.slice(0, 20);

        renderViewedProducts(products);
    });
}

// ===== RENDER =====

function renderViewedProducts(products) {

    const wrapper =
        document.getElementById("historyProducts");

    if (!wrapper) return;

    wrapper.innerHTML = "";

    products.forEach(product => {

        const price = Number(
            String(product.price || 0)
            .replace(/\D/g, '')
        );

        const oldPrice = Number(
            String(product.oldPrice || 0)
            .replace(/\D/g, '')
        );

        let discount = 0;

        if (oldPrice > price) {

            discount = Math.round(
                ((oldPrice - price) / oldPrice) * 100
            );
        }

        wrapper.innerHTML += `

            <a href="${product.url || '#'}"
               class="featured-card">

                <div class="featured-thumb">

                    <img
                        src="${getImage(product)}"
                        alt="${product.name}"
                        loading="lazy"
                        onerror="this.onerror=null;this.src='./images/default.jpg'"
                    >

                    ${
                        discount > 0
                        ? `
                        <div class="discount-badge">
                            -${discount}%
                        </div>
                        `
                        : ""
                    }

                </div>

                <div class="featured-name">
                    ${product.name || ""}
                </div>

                <div class="featured-price-wrap">

                    <div class="featured-price">
                        ${price.toLocaleString()}đ
                    </div>

                    ${
                        oldPrice > price
                        ? `
                        <div class="featured-original-price">
                            ${oldPrice.toLocaleString()}đ
                        </div>
                        `
                        : ""
                    }

                </div>

            </a>
        `;
    });
}

// ===== SLIDER =====

window.addEventListener("DOMContentLoaded", () => {

    const historyWrap =
        document.getElementById("historyProducts");

    const nextBtn =
        document.getElementById("historyNext");

    const prevBtn =
        document.getElementById("historyPrev");

    if(nextBtn){

        nextBtn.onclick = () => {

            historyWrap.scrollBy({
                left: 300,
                behavior: "smooth"
            });
        };
    }

    if(prevBtn){

        prevBtn.onclick = () => {

            historyWrap.scrollBy({
                left: -300,
                behavior: "smooth"
            });
        };
    }
});

// ===== AUTO LOAD =====

auth.onAuthStateChanged((user) => {

    console.log("USER:", user);

    if (user) {

        loadViewedProducts();
    }
});
