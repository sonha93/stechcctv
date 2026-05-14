// =================== FIREBASE INIT ===================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey:"AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
  authDomain:"stech-73b89.firebaseapp.com",
  projectId:"stech-73b89",
  storageBucket:"stech-73b89.firebasestorage.app",
  messagingSenderId:"873739162979",
  appId:"1:873739162979:web:978f1a4043f025b1cdaf56"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =================== PARAM + DATA ===================
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let products = [];
let product = null;

// =================== LOAD PRODUCT ===================
async function loadProduct() {
  const querySnapshot = await getDocs(collection(db,"products"));
  querySnapshot.forEach(doc => products.push(doc.data()));
  product = products.find(p => String(p.id) === String(id));
  if(!product) return;

  document.getElementById("detailImg").src = product.img || "";
  document.getElementById("panelProductImg").src = product.img || "";
  document.getElementById("detailName").innerText = product.name || "";
  document.getElementById("panelProductName").innerText = product.name || "";
  document.getElementById("detailPrice").innerText = Number(product.price || 0).toLocaleString()+"đ";
  document.getElementById("detailOldPrice").innerText = product.oldPrice ? Number(product.oldPrice).toLocaleString()+"đ" : "";
  document.getElementById("detailDesc").innerText = product.desc || "Không có mô tả";
  document.getElementById("detailModel").innerText = product.model || "Đang cập nhật";
  document.getElementById("detailOrigin").innerText = product.xuatXu || "Đang cập nhật";
  document.getElementById("detailWarranty").innerText = product.baoHanh || "Đang cập nhật";
  document.getElementById("detailResolution").innerText = product.doPhanGiai || "Đang cập nhật";
  document.getElementById("detailConnect").innerText = product.ketNoi || "Đang cập nhật";
  document.getElementById("detailViewAngle").innerText = product.gocNhin || "Đang cập nhật";
  document.getElementById("detailThietKe").innerText = product.thietKe || "Đang cập nhật";
  document.getElementById("detailChatLieu").innerText = product.chatLieu || "Đang cập nhật";
  document.getElementById("detailCongSuat").innerText = product.congSuat || "Đang cập nhật";

  const saleBox = document.getElementById("detailSale");
  if(product.oldPrice && Number(product.oldPrice) > Number(product.price)){
    const sale = Math.round(((Number(product.oldPrice) - Number(product.price)) / Number(product.oldPrice))*100);
    saleBox.style.display = "inline-block";
    saleBox.innerText = "-" + sale + "%";
  }else{
    saleBox.style.display = "none";
  }
}
loadProduct();

// =================== SIDEBAR TOGGLE ===================
function toggleMenu(){
  document.getElementById("sidebar").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}
document.getElementById("overlay").onclick = toggleMenu;

// =================== PANEL ===================
function openPanel(){
  document.getElementById("specPanel").classList.add("active");
  document.getElementById("panelOverlay").classList.add("active");
}
function closePanel(){
  document.getElementById("specPanel").classList.remove("active");
  document.getElementById("panelOverlay").classList.remove("active");
}
function showTab(tabId,btn){
  document.querySelectorAll(".spec-content").forEach(el=>el.classList.remove("active"));
  document.querySelectorAll(".spec-tab").forEach(el=>el.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  btn.classList.add("active");
}

// =================== CART ===================
function addToCart(){
  if(!product) return;
  let cart = JSON.parse(localStorage.getItem("cart"))||[];
  const exist = cart.find(x=>String(x.id)===String(product.id));
  if(exist) exist.qty +=1;
  else cart.push({...product,qty:1});
  localStorage.setItem("cart",JSON.stringify(cart));
  updateCartCount();
  alert("Đã thêm vào giỏ");
}
function updateCartCount(){
  const cart = JSON.parse(localStorage.getItem("cart"))||[];
  let total = cart.reduce((a,b)=>a+(b.qty||1),0);
  document.getElementById("cartCount").innerText = total;
}
updateCartCount();

// =================== SEARCH ===================
function searchProduct(){
  const term = document.getElementById("searchInput").value.toLowerCase();
  const resultBox = document.getElementById("searchResults");
  resultBox.innerHTML="";
  if(term==="") return;
  const filtered = products.filter(p=>p.name.toLowerCase().includes(term));
  filtered.forEach(p=>{
    const div = document.createElement("div");
    div.className="search-result-item";
    div.innerHTML = `
      <img src="${p.img}">
      <div>
        <strong>${p.name}</strong>
        <div style="color:red;font-weight:bold;">
          ${Number(p.price).toLocaleString()}đ
        </div>
      </div>
    `;
    div.onclick = ()=>{ window.location.href="logo.html?id="+p.id; };
    resultBox.appendChild(div);
  });
}

// =================== RATING ===================
const stars = document.querySelectorAll("#starRating span");
let currentRating = 0;

stars.forEach(star=>{
  star.addEventListener("mouseover", ()=>highlightStars(star.dataset.value));
  star.addEventListener("mouseout", ()=>highlightStars(currentRating));
  star.addEventListener("click", ()=>{
    currentRating=star.dataset.value;
    document.getElementById("ratingValue").innerText=`${currentRating}/5`;
    saveRating(currentRating);
  });
});

function highlightStars(r){
  stars.forEach(s=>{ s.classList.remove("hover","selected"); if(s.dataset.value<=r) s.classList.add("hover"); });
  if(r==currentRating) stars.forEach(s=>{ if(s.dataset.value<=r) s.classList.add("selected"); });
}

function saveRating(r){
  const ratings = JSON.parse(localStorage.getItem("ratings")||"{}");
  ratings[id]=r;
  localStorage.setItem("ratings",JSON.stringify(ratings));
}

const savedRatings = JSON.parse(localStorage.getItem("ratings")||"{}");
if(savedRatings[id]){
  currentRating=savedRatings[id];
  document.getElementById("ratingValue").innerText=`${currentRating}/5`;
  highlightStars(currentRating);
}

// =================== COMMENTS ===================
let comments = JSON.parse(localStorage.getItem("comments")||"{}");
if(!comments[id]) comments[id]=[];

function submitComment(){
  const name=document.getElementById("commentName").value.trim();
  const text=document.getElementById("commentText").value.trim();
  const fileInput=document.getElementById("commentImage");
  if(!name||!text) return alert("Vui lòng nhập tên và nội dung");

  let reader=new FileReader();
  reader.onload=function(e){
    const newComment={id:Date.now(),name,text,img:e.target.result||"",time:new Date().toISOString(),likes:0,replies:[]};
    comments[id].push(newComment);
    localStorage.setItem("comments",JSON.stringify(comments));
    renderComments();
    document.getElementById("commentName").value="";
    document.getElementById("commentText").value="";
    fileInput.value="";
  };
  if(fileInput.files[0]) reader.readAsDataURL(fileInput.files[0]);
  else reader.onload({target:{result:""}});
}

function renderComments(){
  const list=document.getElementById("commentList");
  list.innerHTML="";
  const productComments = comments[id]||[];
  productComments.forEach(c=>{
    const div=document.createElement("div");
    div.className="comment-item";
    div.innerHTML=`
      <img src="${c.img||'https://i.ibb.co/7W2vT5J/avatar.png'}" class="comment-avatar">
      <div class="comment-content">
        <div class="comment-name">${c.name}</div>
        <div class="comment-time">${timeAgo(c.time)}</div>
        <div class="comment-text">${c.text}</div>
        <div class="comment-actions">
          <span onclick="likeComment(${c.id})">👍 ${c.likes}</span>
          <span onclick="replyComment(${c.id})">Trả lời</span>
        </div>
        <div class="comment-replies" id="replies-${c.id}"></div>
      </div>
    `;
    // render replies
    c.replies.forEach(r=>{
      const rDiv = document.createElement("div");
      rDiv.innerHTML=`<strong>${r.name}</strong> ${timeAgo(r.time)}<br>${r.text}`;
      div.querySelector(`#replies-${c.id}`).appendChild(rDiv);
    });
    list.appendChild(div);
  });
}
renderComments();

// Like comment
function likeComment(commentId){
  const c = comments[id].find(x=>x.id===commentId);
  if(c){ c.likes++; localStorage.setItem("comments",JSON.stringify(comments)); renderComments(); }
}

// Reply comment
function replyComment(commentId){
  const replyText = prompt("Nhập nội dung trả lời:");
  if(!replyText) return;
  const rName = prompt("Nhập tên của bạn:");
  if(!rName) return;
  const c = comments[id].find(x=>x.id===commentId);
  c.replies.push({name:rName,text:replyText,time:new Date().toISOString()});
  localStorage.setItem("comments",JSON.stringify(comments));
  renderComments();
}

// Format thời gian
function timeAgo(date){
  const d = new Date(date);
  const diff = Math.floor((new Date()-d)/1000); // giây
  if(diff<60) return "Vừa xong";
  if(diff<3600) return Math.floor(diff/60)+" phút trước";
  if(diff<86400) return Math.floor(diff/3600)+" giờ trước";
  return Math.floor(diff/86400)+" ngày trước";
}

// =================== EXPOSE HÀM CHO HTML ===================
window.toggleMenu = toggleMenu;
window.openPanel = openPanel;
window.closePanel = closePanel;
window.showTab = showTab;
window.addToCart = addToCart;
window.searchProduct = searchProduct;
window.submitComment = submitComment;
