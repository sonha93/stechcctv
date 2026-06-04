import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { addToCart as firebaseAddToCart }
from "./cart.js";

const firebaseConfig = {

  apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",

  authDomain: "stech-73b89.firebaseapp.com",

  projectId: "stech-73b89",

  storageBucket: "stech-73b89.firebasestorage.app",

  messagingSenderId: "873739162979",

  appId: "1:873739162979:web:978f1a4043f025b1cdaf56"

};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const params =
new URLSearchParams(window.location.search);

const productId =
params.get("id");

async function loadDetail(){

  if(!productId){

    alert("Thiếu ID sản phẩm");
    return;

  }

  try{

    const ref =
    doc(db,"products",productId);

    const snap =
    await getDoc(ref);

    if(!snap.exists()){

      alert("Không tìm thấy sản phẩm");
      return;

    }

    const product = {

      id:snap.id,
      ...snap.data()

    };

    renderDetail(product);

  }

  catch(err){

    console.log(err);

    alert("Lỗi load sản phẩm");

  }

}

function renderDetail(product){

  const box =
  document.getElementById("detail");

  if(!box) return;

  box.innerHTML = `

    <div class="detail-box">

      <img
        src="${product.img || ''}"
        width="300"
      >

      <h1>
        ${product.name || ''}
      </h1>

      <h2>
        ${Number(product.price || 0)
          .toLocaleString()}đ
      </h2>

      <button id="buyBtn">
        🛒 Thêm vào giỏ
      </button>

    </div>

  `;

  document
  .getElementById("buyBtn")
  .onclick = async() => {

    await firebaseAddToCart(product);

    alert("Đã thêm vào giỏ 🛒");

  };

}

loadDetail();
