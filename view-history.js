// ===== SAVE VIEW HISTORY =====

window.addEventListener("DOMContentLoaded", () => {

    const historyWrap =
        document.getElementById("historyProducts");

    document.getElementById("historyNext").onclick = () => {

        historyWrap.scrollBy({
            left:300,
            behavior:"smooth"
        });
    };

    document.getElementById("historyPrev").onclick = () => {

        historyWrap.scrollBy({
            left:-300,
            behavior:"smooth"
        });
    };
});
// ===== LOAD VIEW HISTORY =====

async function loadViewedProducts() {

    const user = auth.currentUser;

    if (!user) return;

    const uid = user.uid;

    const ref = db.ref(`view_history/${uid}`);

    ref.on("value", (snapshot) => {

        const data = snapshot.val();

        if (!data) return;

        let products = Object.values(data);

        // sort newest
        products.sort((a, b) => b.viewedAt - a.viewedAt);

        // limit 20
        products = products.slice(0, 20);

        renderViewedProducts(products);
    });
}

// ===== RENDER =====

function renderViewedProducts(products){

    const wrapper = document.getElementById("viewedWrapper");

    wrapper.innerHTML = "";

    products.forEach(product => {

        wrapper.innerHTML += `

            <a href="${product.url || '#'}" class="viewed-card">

                <img src="${product.image}" alt="">

                <div class="viewed-info">

                    <div class="viewed-name">
                        ${product.name}
                    </div>

                    <div>

                        <span class="viewed-price">
                            ${product.price}
                        </span>

                        <span class="viewed-old-price">
                            ${product.oldPrice || ''}
                        </span>

                        <span class="viewed-discount">
                            ${product.discount || ''}
                        </span>

                    </div>

                </div>

            </a>
        `;
    });
}

// ===== SLIDER BUTTON =====

const viewedWrapper = document.getElementById("viewedWrapper");

document.getElementById("viewPrev")
.addEventListener("click", () => {

    viewedWrapper.scrollLeft -= 400;
});

document.getElementById("viewNext")
.addEventListener("click", () => {

    viewedWrapper.scrollLeft += 400;
});

// ===== AUTO LOAD =====

auth.onAuthStateChanged((user) => {

    if(user){

        loadViewedProducts();
    }
});
