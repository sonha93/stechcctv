// ================= FIREBASE =================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  increment,
  getDoc
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ================= CONFIG =================

const firebaseConfig = {

  apiKey:"AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",

  authDomain:"stech-73b89.firebaseapp.com",

  projectId:"stech-73b89",

  storageBucket:"stech-73b89.firebasestorage.app",

  messagingSenderId:"873739162979",

  appId:"1:873739162979:web:978f1a4043f025b1cdaf56"

};


// ================= INIT =================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


// ================= PARAM =================

const params = new URLSearchParams(location.search);

const id = params.get("id");

let products = [];

let product = null;

let currentUser = null;


// ================= AUTH =================

onAuthStateChanged(auth,(user)=>{

  currentUser = user;

});


// ================= LOAD PRODUCT =================

async function loadProduct(){

  const querySnapshot =
  await getDocs(
    collection(db,"products")
  );

  products = [];

  querySnapshot.forEach(doc=>{

    products.push(doc.data());

  });

  product =
  products.find(
    p => String(p.id) === String(id)
  );

  if(!product) return;

  setText("detailName",product.name);

  setText("panelProductName",product.name);

  setText(
    "detailPrice",
    formatPrice(product.price)
  );

  setText(
    "detailOldPrice",
    product.oldPrice
    ?
    formatPrice(product.oldPrice)
    :
    ""
  );

  setText(
    "detailDesc",
    product.desc || "Không có mô tả"
  );

  setText(
    "detailModel",
    product.model || "Đang cập nhật"
  );

  setText(
    "detailOrigin",
    product.xuatXu || "Đang cập nhật"
  );

  setText(
    "detailWarranty",
    product.baoHanh || "Đang cập nhật"
  );

  setText(
    "detailResolution",
    product.doPhanGiai || "Đang cập nhật"
  );

  setText(
    "detailConnect",
    product.ketNoi || "Đang cập nhật"
  );

  setText(
    "detailViewAngle",
    product.gocNhin || "Đang cập nhật"
  );

  setText(
    "detailThietKe",
    product.thietKe || "Đang cập nhật"
  );

  setText(
    "detailChatLieu",
    product.chatLieu || "Đang cập nhật"
  );

  setText(
    "detailCongSuat",
    product.congSuat || "Đang cập nhật"
  );

  setImage("detailImg",product.img);

  setImage("panelProductImg",product.img);

  renderSale();

}

loadProduct();


// ================= UI HELPERS =================

function setText(id,text){

  document.getElementById(id)
  .innerText = text || "";

}

function setImage(id,src){

  document.getElementById(id)
  .src = src || "";

}

function formatPrice(price){

  return Number(price || 0)
  .toLocaleString() + "đ";

}


// ================= SALE =================

function renderSale(){

  const saleBox =
  document.getElementById("detailSale");

  if(
    product.oldPrice &&
    Number(product.oldPrice)
    >
    Number(product.price)
  ){

    const sale = Math.round(

      (
        (
          Number(product.oldPrice)
          -
          Number(product.price)
        )

        /

        Number(product.oldPrice)

      ) * 100

    );

    saleBox.style.display =
    "inline-block";

    saleBox.innerText =
    "-" + sale + "%";

  }

  else{

    saleBox.style.display = "none";

  }

}


// ================= SIDEBAR =================

function toggleMenu(){

  document
  .getElementById("sidebar")
  .classList
  .toggle("active");

  document
  .getElementById("overlay")
  .classList
  .toggle("active");

}

document
.getElementById("overlay")
.onclick = toggleMenu;


// ================= PANEL =================

function openPanel(){

  document
  .getElementById("specPanel")
  .classList
  .add("active");

  document
  .getElementById("panelOverlay")
  .classList
  .add("active");

}

function closePanel(){

  document
  .getElementById("specPanel")
  .classList
  .remove("active");

  document
  .getElementById("panelOverlay")
  .classList
  .remove("active");

}

function showTab(tabId,btn){

  document
  .querySelectorAll(".spec-content")
  .forEach(el=>{

    el.classList.remove("active");

  });

  document
  .querySelectorAll(".spec-tab")
  .forEach(el=>{

    el.classList.remove("active");

  });

  document
  .getElementById(tabId)
  .classList
  .add("active");

  btn.classList.add("active");

}


// ================= CART =================

function addToCart(){

  if(!product) return;

  let cart =
  JSON.parse(
    localStorage.getItem("cart")
  ) || [];

  const exist =
  cart.find(
    x => String(x.id)
    ===
    String(product.id)
  );

  if(exist){

    exist.qty += 1;

  }

  else{

    cart.push({

      ...product,

      qty:1

    });

  }

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  updateCartCount();

  alert("Đã thêm vào giỏ");

}

function updateCartCount(){

  const cart =
  JSON.parse(
    localStorage.getItem("cart")
  ) || [];

  const total =
  cart.reduce(
    (a,b)=>a+(b.qty||1),
    0
  );

  document
  .getElementById("cartCount")
  .innerText = total;

}

updateCartCount();


// ================= SEARCH =================

function searchProduct(){

  const term =
  document
  .getElementById("searchInput")
  .value
  .toLowerCase();

  const resultBox =
  document.getElementById(
    "searchResults"
  );

  resultBox.innerHTML = "";

  if(!term) return;

  const filtered =
  products.filter(
    p =>
    p.name
    .toLowerCase()
    .includes(term)
  );

  filtered.forEach(p=>{

    const div =
    document.createElement("div");

    div.className =
    "search-result-item";

    div.innerHTML = `

      <img src="${p.img}">

      <div>

        <strong>
          ${p.name}
        </strong>

        <div
        style="
        color:red;
        font-weight:bold;
        ">

          ${formatPrice(p.price)}

        </div>

      </div>

    `;

    div.onclick = ()=>{

      location.href =
      "logo.html?id=" + p.id;

    };

    resultBox.appendChild(div);

  });

}


// ================= RATING =================

const stars =
document.querySelectorAll(
  "#starRating span"
);

let currentRating = 0;

stars.forEach(star=>{

  star.addEventListener(
    "mouseover",
    ()=>highlightStars(
      star.dataset.value
    )
  );

  star.addEventListener(
    "mouseout",
    ()=>highlightStars(
      currentRating
    )
  );

  star.addEventListener(
    "click",
    ()=>{

      currentRating =
      star.dataset.value;

      document
      .getElementById(
        "ratingValue"
      )
      .innerText =
      `${currentRating}/5`;

      saveRating(currentRating);

    }
  );

});

function highlightStars(r){

  stars.forEach(s=>{

    s.classList.remove(
      "hover",
      "selected"
    );

    if(s.dataset.value <= r){

      s.classList.add("hover");

    }

  });

}

function saveRating(r){

  const ratings =
  JSON.parse(
    localStorage.getItem("ratings")
    || "{}"
  );

  ratings[id] = r;

  localStorage.setItem(
    "ratings",
    JSON.stringify(ratings)
  );

}

const savedRatings =
JSON.parse(
  localStorage.getItem("ratings")
  || "{}"
);

if(savedRatings[id]){

  currentRating =
  savedRatings[id];

  document
  .getElementById("ratingValue")
  .innerText =
  `${currentRating}/5`;

  highlightStars(currentRating);

}


// ================= COMMENTS =================

async function submitComment(){

  if(!currentUser){

    alert("Đăng nhập trước");

    return;

  }

  const text =
  document
  .getElementById("commentText")
  .value
  .trim();

  if(!text){

    alert("Nhập bình luận");

    return;

  }

  const fileInput =
  document.getElementById(
    "commentImage"
  );

  let imageUrl = "";

  if(fileInput.files[0]){

    const file =
    fileInput.files[0];

    if(
      !file.type.startsWith("image/")
    ){

      alert("Chỉ upload ảnh");

      return;

    }

    const formData =
    new FormData();

    formData.append(
      "file",
      file
    );

    formData.append(
      "upload_preset",
      "stech_upload"
    );

    const res =
    await fetch(
      "https://api.cloudinary.com/v1_1/dmz9gpp1b/image/upload",
      {
        method:"POST",
        body:formData
      }
    );

    const data =
    await res.json();

    imageUrl =
    data.secure_url || "";

  }

  await addDoc(
    collection(db,"comments"),
    {

      productId:id,

      uid:currentUser.uid,

      name:
      currentUser.displayName
      || "User",

      avatar:
      currentUser.photoURL
      ||
      "https://i.ibb.co/7W2vT5J/avatar.png",

      text:text,

      image:imageUrl,

      likes:0,

      replies:[],

      createdAt:
      serverTimestamp()

    }
  );

  document
  .getElementById("commentText")
  .value = "";

  document
  .getElementById("commentImage")
  .value = "";

}


// ================= LOAD COMMENTS =================

const q = query(

  collection(db,"comments"),

  orderBy("createdAt","desc")

);

onSnapshot(q,(snapshot)=>{

  const list =
  document.getElementById(
    "commentList"
  );

  list.innerHTML = "";

  snapshot.forEach(docSnap=>{

    const c = docSnap.data();

    if(
      String(c.productId)
      !==
      String(id)
    ) return;

    const div =
    document.createElement("div");

    div.className =
    "comment-item";

    div.innerHTML = `

      <img
      src="${
        c.avatar ||
        'https://i.ibb.co/7W2vT5J/avatar.png'
      }"
      class="comment-avatar">

      <div class="comment-content">

        <div class="comment-name">
          ${c.name}
        </div>

        <div class="comment-time">

          ${
            c.createdAt
            ?
            timeAgo(
              c.createdAt.toDate()
            )
            :
            "Vừa xong"
          }

        </div>

        <div class="comment-text">
          ${c.text}
        </div>

        ${
          c.image
          ?
          `
          <img
          src="${c.image}"
          class="comment-image">
          `
          :
          ""
        }

        <div class="comment-actions">

          <span
          onclick="
          likeComment(
            '${docSnap.id}'
          )
          ">

          👍 ${c.likes || 0}

          </span>

          <span
          onclick="
          replyComment(
            '${docSnap.id}'
          )
          ">

          Trả lời

          </span>

        </div>

        <div
        class="comment-replies"
        id="replies-${docSnap.id}">
        </div>

      </div>

    `;

    if(c.replies){

      c.replies.forEach(r=>{

        const rDiv =
        document.createElement("div");

        rDiv.className =
        "reply-item";

        rDiv.innerHTML = `

          <strong>
            ${r.name}
          </strong>

          <div class="comment-time">

            ${timeAgo(r.time)}

          </div>

          <div>

            ${r.text}

          </div>

        `;

        div
        .querySelector(
          `#replies-${docSnap.id}`
        )
        .appendChild(rDiv);

      });

    }

    list.appendChild(div);

  });

});


// ================= LIKE =================

async function likeComment(commentId){

  const refDoc =
  doc(
    db,
    "comments",
    commentId
  );

  await updateDoc(
    refDoc,
    {
      likes:increment(1)
    }
  );

}


// ================= REPLY =================

async function replyComment(commentId){

  if(!currentUser){

    alert("Đăng nhập trước");

    return;

  }

  const text =
  prompt("Nhập trả lời");

  if(!text) return;

  const refDoc =
  doc(
    db,
    "comments",
    commentId
  );

  const snap =
  await getDoc(refDoc);

  const data =
  snap.data();

  const replies =
  data.replies || [];

  replies.push({

    name:
    currentUser.displayName
    || "User",

    text:text,

    time:new Date()

  });

  await updateDoc(
    refDoc,
    {
      replies:replies
    }
  );

}


// ================= TIME =================

function timeAgo(date){

  const diff =
  Math.floor(
    (
      new Date() - date
    ) / 1000
  );

  if(diff < 60)
    return "Vừa xong";

  if(diff < 3600)
    return Math.floor(diff/60)
    + " phút trước";

  if(diff < 86400)
    return Math.floor(diff/3600)
    + " giờ trước";

  return Math.floor(diff/86400)
  + " ngày trước";

}


// ================= EXPORT =================

window.toggleMenu = toggleMenu;

window.openPanel = openPanel;

window.closePanel = closePanel;

window.showTab = showTab;

window.addToCart = addToCart;

window.searchProduct = searchProduct;

window.submitComment = submitComment;

window.likeComment = likeComment;

window.replyComment = replyComment;
