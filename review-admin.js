
// review-admin.js

import { app } from "./auth.js";

import {
getFirestore,
collection,
getDocs,
deleteDoc,
doc,
query,
getDoc,
updateDoc,
arrayUnion,
orderBy,
limit
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore(app);

const reviewsTable =
document.getElementById("reviewsTable");

const questionsTable =
document.getElementById("questionsTable");


// =======================
// TAB
// =======================

document
.querySelectorAll(".tab-btn")
.forEach(btn=>{

btn.onclick = ()=>{

document
.querySelectorAll(".tab-btn")
.forEach(b=>b.classList.remove("active"));

btn.classList.add("active");

const tab =
btn.dataset.tab;

document
.querySelectorAll(".tab-content")
.forEach(c=>c.classList.remove("active"));

if(tab==="reviews"){

document
.getElementById("reviewsTab")
.classList.add("active");

}else{

document
.getElementById("questionsTab")
.classList.add("active");

}

};

});


// =======================
// LOAD REVIEWS
// =======================

async function loadReviews(){

reviewsTable.innerHTML = "";

const snap =
await getDocs(
query(
collection(db,"reviews"),
orderBy("createdAt","desc"),
limit(100)
)
);

for(const docu of snap.docs){

const r = {
id:docu.id,
...docu.data()
};

let phone = "";
let productName = "";
let productLink = "#";

if(r.productId){

const productSnap =
await getDoc(
doc(db,"products",r.productId)
);

if(productSnap.exists()){

const product =
productSnap.data();

productName =
product.name || "";

productLink =
`https://sonha93.github.io/stechcctv/logo.html?id=${r.productId}`;
}

}
if(r.uid){

const userSnap =
await getDoc(
doc(db,"users",r.uid)
);

if(userSnap.exists()){

phone =
userSnap.data().phone || "";

}

}

reviewsTable.innerHTML += `
<tr>
  <td>${r.userName || ""}</td>

  <td>${phone}</td>

  <td>
    <a href="${productLink}" target="_blank" style="color:#00b894;font-weight:bold;">
      ${productName}
    </a>
  </td>

  <td>${r.rating || 0} ⭐</td>

  <td>${r.content || ""}</td>

  <!-- ⭐ REPLY HIỂN THỊ ĐÚNG 1 CỘT -->
  <td>
    ${(r.replies || [])
      .map(rep => `
        <div style="
          background:#f1f1f1;
          padding:6px;
          margin:4px 0;
          border-radius:6px;
          font-size:12px;
        ">
          <b>${rep.name}</b>: ${rep.content}
        </div>
      `)
      .join("")}
  </td>

  <td>
    ${(r.images || [])
      .map(img => `
        <img src="${img}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;margin:2px;">
      `)
      .join("")}

    ${r.video ? `
      <br>
      <video src="${r.video}" controls width="120"></video>
    ` : ""}
  </td>

  <td>
    ${r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : ""}
  </td>

  <td>
    <button onclick="adminReplyReview('${r.id}')">Reply</button>
  </td>

  <td>
    <button onclick="deleteReview('${r.id}')">Xóa</button>
  </td>
</tr>
`;
}

}

// =======================
// LOAD COMMENTS
// =======================

async function loadQuestions(){

questionsTable.innerHTML = "";

const snap =
await getDocs(
query(
collection(db,"comments"),
orderBy("createdAt","desc"),
limit(100)
)
);
for(const docu of snap.docs){

const c = {
id:docu.id,
...docu.data()
};

let phone = "";
let productName = "";
let productLink = "#";

if(c.productId){

const productSnap =
await getDoc(
doc(db,"products",c.productId)
);

if(productSnap.exists()){

const product =
productSnap.data();

productName =
product.name || "";

productLink =
`https://sonha93.github.io/stechcctv/logo.html?id=${c.productId}`;

}

}
if(c.uid){

const userSnap =
await getDoc(
doc(db,"users",c.uid)
);

if(userSnap.exists()){

phone =
userSnap.data().phone || "";

}

}

questionsTable.innerHTML += `

<tr>

<td>
${c.userName || ""}
</td>

<td>
${phone}
</td>

<td>
<a
href="${productLink}"
target="_blank"
style="
color:#00b894;
font-weight:bold;
">
${productName}
</a>
</td>

<td>${c.content || ""}</td>

<td>
  ${(c.replies || [])
    .map(rep => `
      <div style="
        background:#f1f1f1;
        padding:6px;
        margin:4px 0;
        border-radius:6px;
        font-size:12px;
      ">
        <b>${rep.name}</b>: ${rep.content}
      </div>
    `)
    .join("")}
</td>
<td>
  ${(c.replies || [])
    .map(rep => `
      <div style="
        background:#f1f1f1;
        padding:6px;
        margin:4px 0;
        border-radius:6px;
        font-size:12px;
      ">
        <b>${rep.name}</b>: ${rep.content}
      </div>
    `)
    .join("")}
</td>
<td>

${(c.images || [])
.map(img=>`
<img
src="${img}"
style="
width:60px;
height:60px;
object-fit:cover;
border-radius:6px;
margin:2px;
">
`)
.join("")}

${c.video ? `
<br>
<video
src="${c.video}"
controls
width="120">
</video>
` : ""}

</td>

<td>

${c.createdAt?.toDate
? c.createdAt.toDate().toLocaleString()
: ""
}

</td>

<td>

<button
onclick="adminReplyQuestion('${c.id}')">

Reply

</button>

</td>

<td>

<button
onclick="deleteQuestion('${c.id}')">

Xóa

</button>

</td>

</tr>

`;

}

}


// =======================
// DELETE REVIEW
// =======================

window.deleteReview =
async function(id){

if(
!confirm("Xóa đánh giá này?")
)
return;

await deleteDoc(
doc(db,"reviews",id)
);

loadReviews();

};


// =======================
// DELETE QUESTION
// =======================

window.deleteQuestion =
async function(id){

if(
!confirm("Xóa câu hỏi này?")
)
return;

await deleteDoc(
doc(db,"comments",id)
);

loadQuestions();

};


window.adminReplyReview =
async function(id){

const text =
prompt("Nhập nội dung trả lời");

if(!text) return;

await updateDoc(
doc(db,"reviews",id),
{
replies:arrayUnion({

name:"StechCctv",

position:"Quản trị viên",

content:text,

createdAt:Date.now()

})
}
);

loadReviews();

};

window.adminReplyQuestion =
async function(id){

const text =
prompt("Nhập câu trả lời");

if(!text) return;

await updateDoc(
doc(db,"comments",id),
{
replies:arrayUnion({

name:"Hoàng Anh Sơn",

position:"Quản trị viên",

content:text,

createdAt:Date.now()

})
}
);

loadQuestions();

}
loadReviews();
loadQuestions();
function showToast(message){

const toast = document.createElement("div");

toast.innerText = message;

toast.style.cssText = `
position:fixed;
left:50%;
bottom:30px;
transform:translateX(-50%);
background:#222;
color:#fff;
padding:12px 20px;
border-radius:8px;
font-size:14px;
z-index:999999;
box-shadow:0 4px 12px rgba(0,0,0,.3);
`;

document.body.appendChild(toast);

setTimeout(()=>{
toast.remove();
},2500);

}
