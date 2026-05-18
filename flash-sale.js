/* =========================
   🔥 FLASH SALE FIREBASE v9
========================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* =========================
   FIREBASE CONFIG
   (IMPORT từ file của bạn)
========================= */

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================
   CONFIG
========================= */

const FLASH_CATEGORY = "cam-in";
const MIN_DISCOUNT = 11;
const FLASH_HOURS = 5;

/* =========================
   STATE
========================= */

let flashRendered = false;
let timer = null;

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  loadFlashSale();
});

/* =========================
   LOAD DATA FIREBASE
========================= */

async function loadFlashSale() {

  try {

    const snap = await getDocs(collection(db, "products"));

    let products = [];

    snap.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    renderFlashSale(products);

  } catch (err) {
    console.error("Flash sale error:", err);
  }
}

/* =========================
   RENDER
========================= */

function renderFlashSale(allProducts) {

  if (flashRendered) return;

  const products = allProducts.filter(p => {

  if (!p?.img || !p?.price || !p?.oldPrice) return false;

  if (!p.category) return false;

  if (p.category.trim().toLowerCase() !== FLASH_CATEGORY) return false;

  const price = Number(p.price);
  const oldPrice = Number(p.oldPrice);

  if (!price || !oldPrice || oldPrice <= price) return false;

  const percent = Math.round((1 - price / oldPrice) * 100);

  return percent >= MIN_DISCOUNT;
});

  if (!products.length) return;

  let html = `
  <section class="flash-sale-wrap">
    <div class="flash-header">
      <div class="flash-left">⚡ FLASH SALE</div>

      <div class="flash-right">
        <span id="flashH">00</span> :
        <span id="flashM">00</span> :
        <span id="flashS">00</span>
      </div>
    </div>

    <div class="flash-products">
  `;

  products.forEach(p => {

    const percent = Math.round((1 - p.price / p.oldPrice) * 100);

    html += `
      <div class="flash-card">

        <div class="flash-percent">-${percent}%</div>

        <img src="${p.img}" onclick="goDetail('${p.id}')">

        <h3>${p.name}</h3>

        <div class="flash-price">
          <span class="new-price">${Number(p.price).toLocaleString()}đ</span>
          <span class="old-price">${Number(p.oldPrice).toLocaleString()}đ</span>
        </div>

        <button onclick="addToCart('${p.id}')">🛒 Thêm vào giỏ</button>

      </div>
    `;
  });

  html += `</div></section>`;

  const box = document.getElementById("products");

  if (box) box.insertAdjacentHTML("beforebegin", html);

  flashRendered = true;

  startTimer();
}

/* =========================
   TIMER
========================= */

function startTimer() {

  if (timer) clearInterval(timer);

  let total = FLASH_HOURS * 60 * 60;

  timer = setInterval(() => {

    total--;

    if (total <= 0) total = FLASH_HOURS * 60 * 60;

    const h = String(Math.floor(total / 3600)).padStart(2, "0");
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");

    document.getElementById("flashH").innerText = h;
    document.getElementById("flashM").innerText = m;
    document.getElementById("flashS").innerText = s;

  }, 1000);
}
