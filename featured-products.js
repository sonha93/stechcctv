import "./firebase.js";

import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore();
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore();

function makeSlug(text){
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

    products = products.slice(0, 10);

    wrap.innerHTML = `
      <button class="fp-arrow left" id="fpPrev">❮</button>
      <div class="fp-track" id="fpTrack"></div>
      <button class="fp-arrow right" id="fpNext">❯</button>
    `;

    const track = document.getElementById("fpTrack");

    products.forEach(p => {

      const price = Number(p.price || 0);
      const oldPrice = Number(
        p.oldPrice || p.originalPrice || 0
      );

      const discount =
        oldPrice > price
          ? Math.round(
              ((oldPrice - price) / oldPrice) * 100
            )
          : 0;

      track.innerHTML += `
        <a href="logo.html?id=${makeSlug(p.name)}"
           class="featured-card">

          <img
            src="${p.image || p.img}"
            alt="${p.name}">

          <div class="featured-name">
            ${p.name}
          </div>

          <div class="featured-old">
            ${
              oldPrice
                ? oldPrice.toLocaleString() + "đ"
                : ""
            }
          </div>

          <div class="featured-price-row">
            <div class="featured-price">
              ${price.toLocaleString()}đ
            </div>

            ${
              discount
                ? `<span class="featured-sale">
                     -${discount}%
                   </span>`
                : ""
            }
          </div>

        </a>
      `;
    });

    document
      .getElementById("fpNext")
      .onclick = () => {
        track.scrollBy({
          left: 300,
          behavior: "smooth"
        });
      };

    document
      .getElementById("fpPrev")
      .onclick = () => {
        track.scrollBy({
          left: -300,
          behavior: "smooth"
        });
      };

  } catch (err) {
    console.log(err);
    wrap.innerHTML = "Lỗi tải sản phẩm";
  }
}

renderFeaturedProducts();
