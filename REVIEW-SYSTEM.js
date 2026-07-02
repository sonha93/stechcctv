
import { app, rtdb } from "./auth.js";
import { getVerifiedBadge }
from "./verified-users.js";
import {
getFirestore,
collection,
addDoc,
getDocs,
query,
where,
orderBy,
serverTimestamp,
doc,
getDoc,
updateDoc,
increment,
arrayUnion
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
getAuth
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
ref,
get
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
const db = getFirestore(app);
const auth = getAuth(app);

const productId =
new URLSearchParams(location.search).get("id");
const reviewSummary =
document.getElementById("reviewSummary");
const reviewList =
document.getElementById("reviewList");

const reviewForm =
document.getElementById("reviewForm");
const commentForm =
document.getElementById("commentForm");

const commentList =
document.getElementById("commentList");
let formRating = 5;
let previewRating = 5;
let currentFilter = "all";
async function uploadToCloudinary(file,type="image"){

const formData = new FormData();

formData.append("file",file);
formData.append("upload_preset","stech_upload");

const endpoint =
type === "video"
? "https://api.cloudinary.com/v1_1/dmz9gpp1b/video/upload"
: "https://api.cloudinary.com/v1_1/dmz9gpp1b/image/upload";

const res = await fetch(endpoint,{
method:"POST",
body:formData
});

const data = await res.json();

return data.secure_url;

}
async function hasPurchased(uid){

const orders = await getDocs(

query(
collection(db,"orders"),
where("uid","==",uid)
)

);

let purchased = false;

orders.forEach(doc=>{

const data = doc.data();

if(data.status !== "completed")
return;

(data.items || []).forEach(item=>{

if(item.productId === productId){

purchased = true;

}

});

});

return purchased;

}
function timeAgo(timestamp){

if(!timestamp) return "";

const now = Date.now();

const diff =
Math.floor(
(now - timestamp.toMillis())
/1000
);

if(diff < 60)
return `${diff} giây trước`;

if(diff < 3600)
return `${Math.floor(diff/60)} phút trước`;

if(diff < 86400)
return `${Math.floor(diff/3600)} giờ trước`;

return `${Math.floor(diff/86400)} ngày trước`;

}
async function buildForm(){

const user = auth.currentUser;

if(!user) return;





reviewForm.innerHTML=`



<div
id="reviewPopup"
style="
display:none;
position:fixed;
inset:0;
background:rgba(0,0,0,.6);
z-index:99999;
overflow:auto;
"
>

<div
style="
background:#fff;
max-width:700px;
margin:50px auto;
padding:20px;
border-radius:12px;
"
>

<div style="
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:15px;
">

<b>Đánh giá sản phẩm</b>

<span
id="closeReviewPopup"
style="
cursor:pointer;
font-size:24px;
"
>
✕
</span>

</div>
<div class="review-stars">

<span data-rate="1">★</span>
<span data-rate="2">★</span>
<span data-rate="3">★</span>
<span data-rate="4">★</span>
<span data-rate="5">★</span>

</div>
<textarea

id="reviewContent"

placeholder="Chia sẻ cảm nhận về sản phẩm..."

></textarea>



<div class="review-upload">



<label class="upload-review-btn">



📷 Thêm tối đa 5 ảnh và 1 video



<input

type="file"

id="reviewImages"

multiple

accept="image/*"

hidden

>



<input

type="file"

id="reviewVideo"

accept="video/*"

hidden

>



</label>



<div id="uploadPreview"></div>



<button

class="review-btn"

id="submitReview"

>

Gửi đánh giá

</button>



</div>

</div>

</div>

</div>

`;

document
.getElementById("submitReview")
.onclick = submitReview;
document
.getElementById("closeReviewPopup")
.onclick = ()=>{

document
.getElementById("reviewPopup")
.style.display = "none";

};
if(commentForm){

commentForm.innerHTML = `

<div class="comment-form">

<textarea
id="commentContent"
placeholder="Nhập nội dung bình luận..."
></textarea>

<div class="comment-upload">

<label class="upload-review-btn">
📷
<input
type="file"
id="commentImages"
multiple
accept="image/*"
hidden>
</label>

<label class="upload-review-btn">
🎥 
<input
type="file"
id="commentVideo"
accept="video/*"
hidden>
</label>

<div id="commentPreview"></div>

<button
id="submitComment"
class="review-btn"
>
Gửi bình luận
</button>

</div>

</div>

`;
document
.getElementById("submitComment")
.onclick = submitComment;
const commentImageInput =
document.getElementById("commentImages");

if(commentImageInput){

commentImageInput.addEventListener("change",()=>{

const preview =
document.getElementById("commentPreview");
preview.innerHTML = "";

[...commentImageInput.files].forEach(file=>{

const img =
document.createElement("img");

img.src =
URL.createObjectURL(file);

img.style.width = "70px";
img.style.height = "70px";
img.style.objectFit = "cover";
img.style.borderRadius = "8px";
img.style.margin = "4px";

preview.appendChild(img);

});

});

}
}
const imageInput =
document.getElementById("reviewImages");

imageInput.addEventListener("change",()=>{

const preview =
document.getElementById("uploadPreview");

preview.innerHTML = "";

[...imageInput.files].forEach(file=>{

const img =
document.createElement("img");

img.src =
URL.createObjectURL(file);

preview.appendChild(img);

});

});
document.querySelectorAll("#reviewForm .review-stars span")
.forEach(star=>{

star.style.color="#ffb400";

star.onclick = () => {
  formRating = Number(star.dataset.rate);

  document
    .querySelectorAll("#reviewForm .review-stars span")
    .forEach(s => {
      s.style.color =
        Number(s.dataset.rate) <= formRating
          ? "#ffb400"
          : "#ccc";
    });
};

});
}
async function submitReview(){

const user = auth.currentUser;
const oldReview =
await getDocs(

query(
collection(db,"reviews"),
where("uid","==",user.uid),
where("productId","==",productId)
)

);

if(!oldReview.empty){

showToast("Bạn đã đánh giá rồi");

return;

}
const userDoc = await getDoc(
  doc(db,"users",user.uid)
);

const userData =
  userDoc.exists()
  ? userDoc.data()
  : {};


const purchased =
await hasPurchased(user.uid);
  if(!purchased){

showToast(
"Bạn cần mua sản phẩm trước khi đánh giá"
);

return;

}
const content =
document
.getElementById("reviewContent")
.value
.trim();

if(!content){

showToast("Nhập nội dung");

return;

}
  const imageFiles =
document
.getElementById("reviewImages")
.files;

let images=[];

for(const file of imageFiles){

const url =
await uploadToCloudinary(
file,
"image"
);

images.push(url);

}
  const videoFile =
document
.getElementById("reviewVideo")
.files[0];

let video="";

if(videoFile){

video =
await uploadToCloudinary(
videoFile,
"video"
);

}

await addDoc(
collection(db,"reviews"),
{
  replies:[],
  productId,

  uid:user.uid,

  userName:
  userData.name ||
  userData.displayName ||
  user.displayName ||
  user.email ||
  "Khách hàng",
  
  position: userData.position || "",



avatar:
userData.avatar || "",

position:
userData.position || "",

verified:purchased,

content,
rating: formRating,
likes:0,
likedBy:[],
createdAt:serverTimestamp(),
images:images,
video:video,
}
);
showToast("Cảm ơn bạn đã đánh giá sản phẩm");

document
.getElementById("reviewContent")
.value = "";
previewRating = 5;

document
.querySelectorAll(".review-stars span")
.forEach(s=>{
s.style.color="#ffb400";
});

document.getElementById("reviewImages").value="";
document.getElementById("reviewVideo").value="";
loadReviews();

document
.getElementById("reviewPopup")
.style.display = "none";
}
async function submitComment(){

const user =
auth.currentUser;

if(!user){

showToast("Đăng nhập trước");

return;

}

const content =
document
.getElementById("commentContent")
.value
.trim();

if(!content){

showToast("Nhập nội dung");

return;

}

const userDoc =
await getDoc(
doc(db,"users",user.uid)
);
const purchased =
await hasPurchased(user.uid);
const userData =
userDoc.exists()
? userDoc.data()
: {};
const imageFiles =
document.getElementById("commentImages").files;

let images=[];

for(const file of imageFiles){

const url =
await uploadToCloudinary(
file,
"image"
);

images.push(url);

}

const videoFile =
document.getElementById("commentVideo").files[0];

let video="";

if(videoFile){

video =
await uploadToCloudinary(
videoFile,
"video"
);

}
await addDoc(
collection(db,"comments"),
{
productId,

uid:user.uid,

userName:
userData.name ||
user.displayName ||
user.email ||
"Khách hàng",

avatar:
userData.avatar || "",

position:
userData.position || "",

verified:purchased,

content,

likes:0,

likedBy:[],

replies:[],

createdAt:serverTimestamp(),
images:images,
video:video,
}
);

document
.getElementById("commentContent")
.value="";
document.getElementById("commentImages").value="";
document.getElementById("commentVideo").value="";

const preview =
document.getElementById("commentPreview");

if(preview){
preview.innerHTML="";
}
loadComments();

}
async function loadReviews(){

const snap =
await getDocs(
query(
collection(db,"reviews"),
where(
"productId",
"==",
productId
)
)
);
reviewList.innerHTML = "";

let totalRating = 0;

const allReviews = [];

snap.forEach(docu=>{

 const r = {
   id: docu.id,
   ...docu.data()
 };

 allReviews.push(r);

 totalRating += Number(r.rating || 5);

});

const totalReview = allReviews.length;
const commentCount =
document.getElementById("commentCount");
const commentSnap = await getDocs(
  query(
    collection(db,"comments"),
    where("productId","==",productId)
  )
);

const totalComment = commentSnap.size;
const totalInteraction = totalReview + totalComment;
const avg =
totalReview
? (
totalRating /
totalReview
).toFixed(1)
: 0;
let count5 = 0;
let count4 = 0;
let count3 = 0;
let count2 = 0;
let count1 = 0;

snap.forEach(docu => {

  const r = docu.data();

  switch(Number(r.rating)){

    case 5:
      count5++;
      break;

    case 4:
      count4++;
      break;

    case 3:
      count3++;
      break;

    case 2:
      count2++;
      break;

    case 1:
      count1++;
      break;

  }

});
  const p5 = totalReview ? (count5*100/totalReview) : 0;
const p4 = totalReview ? (count4*100/totalReview) : 0;
const p3 = totalReview ? (count3*100/totalReview) : 0;
const p2 = totalReview ? (count2*100/totalReview) : 0;
const p1 = totalReview ? (count1*100/totalReview) : 0;
const summary = reviewSummary;

if(summary){

summary.innerHTML = `

<div class="rating-overview">

  <div class="rating-score">

 <div class="avg">
  ${avg}
</div>

<div class="review-stars review-stars-top">
  <span data-rate="1">★</span>
  <span data-rate="2">★</span>
  <span data-rate="3">★</span>
  <span data-rate="4">★</span>
  <span data-rate="5">★</span>
</div>

<div class="count">
  ${totalReview} lượt đánh giá
</div>

<div style="margin-top:15px">

<button
id="openReviewBtn"
class="review-btn"
>
Viết đánh giá
</button>

</div>
  </div>

  <div class="rating-bars">

    <div class="rating-row">
      <span>5⭐</span>
      <div class="bar">
        <div class="fill" style="width:${p5}%"></div>
      </div>
      <span>${count5}</span>
    </div>

    <div class="rating-row">
      <span>4⭐</span>
      <div class="bar">
        <div class="fill" style="width:${p4}%"></div>
      </div>
      <span>${count4}</span>
    </div>

    <div class="rating-row">
      <span>3⭐</span>
      <div class="bar">
        <div class="fill" style="width:${p3}%"></div>
      </div>
      <span>${count3}</span>
    </div>

    <div class="rating-row">
      <span>2⭐</span>
      <div class="bar">
        <div class="fill" style="width:${p2}%"></div>
      </div>
      <span>${count2}</span>
    </div>

    <div class="rating-row">
      <span>1⭐</span>
      <div class="bar">
        <div class="fill" style="width:${p1}%"></div>
      </div>
      <span>${count1}</span>
    </div>

  </div>

</div>

`;

if(commentCount){

commentCount.innerHTML = `
<span class="comment-text">
    ${totalInteraction} Bình luận
</span>

<div class="review-filter">

<button data-rate="all"
class="${currentFilter==="all"?"active":""}">
Tất cả
</button>

<button data-rate="5"
class="${currentFilter==="5"?"active":""}">
5 ⭐
</button>

<button data-rate="4"
class="${currentFilter==="4"?"active":""}">
4 ⭐
</button>

<button data-rate="3"
class="${currentFilter==="3"?"active":""}">
3 ⭐
</button>

<button data-rate="2"
class="${currentFilter==="2"?"active":""}">
2 ⭐
</button>

<button data-rate="1"
class="${currentFilter==="1"?"active":""}">
1 ⭐
</button>

</div>
`;
}
}
  setTimeout(()=>{
document
.querySelectorAll(".review-stars-top span")
.forEach(star=>{

star.style.color="#ffb400";

star.onclick=()=>{

selectedRating =
Number(star.dataset.rate);

document
.querySelectorAll(".review-stars-top span")
.forEach(s=>{

s.style.color =
Number(s.dataset.rate)
<= selectedRating
? "#ffb400"
: "#ccc";

});

};

});
document
.querySelectorAll(".review-filter button")
.forEach(btn=>{

btn.onclick = ()=>{

currentFilter = btn.dataset.rate;

loadReviews();

};

});
const reviewBtn =
document.getElementById("openReviewBtn");

if(reviewBtn){

reviewBtn.onclick = ()=>{

document
.getElementById("reviewPopup")
.style.display = "block";

};

}
},50);
for (const r of allReviews) {

const userSnap = await getDoc(doc(db,"users",r.uid));

if(userSnap.exists()){

const latestUser = userSnap.data();

r.userName =
latestUser.name ||
r.userName;

r.avatar =
latestUser.avatar ||
r.avatar;

r.position =
latestUser.position ||
r.position;

}
if (r.replies?.length) {

  for (const rep of r.replies) {

    if (!rep.uid) continue;

    const repSnap = await getDoc(doc(db, "users", rep.uid));

    if (repSnap.exists()) {

      const latest = repSnap.data();

      rep.name =
        latest.name || rep.name;

      rep.avatar =
        latest.avatar || rep.avatar;

      rep.position =
        latest.position || rep.position;
    }
  }

}
 if(
   currentFilter !== "all" &&
   Number(r.rating) !== Number(currentFilter)
 ){
   return;
 }
  
 reviewList.innerHTML += `
 
<div class="review-card">

<div class="review-user">

<img
class="review-avatar"
src="${r.avatar || 'https://i.ibb.co/Z1kv9nJj/logo.png'}"
>

<div>

<div class="review-name">
  ${r.userName}
  ${getVerifiedBadge(r.uid)}

  ${r.position ? `
    <span class="admin-badge">
      ${r.position}
    </span>
  ` : ""}
</div>

<div class="review-time-row">
  <span class="review-time-text">
    ${timeAgo(r.createdAt)}
  </span>

  ${r.verified ? `
    <span class="verified-badge">
      <svg class="verified-icon" viewBox="0 0 24 24">
        <path fill="#0aa06e"
          d="M12 0l2.6 2.1 3.3-.6 1.6 3 3.3.7-.7 3.3 2.1 2.5-2.1 2.5.7 3.3-3.3.7-1.6 3-3.3-.6L12 24l-2.6-2.1-3.3.6-1.6-3-3.3-.7.7-3.3L0 12l2.1-2.5-.7-3.3 3.3-.7 1.6-3 3.3.6z"/>
        <path fill="#fff"
          d="M10.2 15.8l-3-3 1.4-1.4 1.6 1.6 5-5 1.4 1.4z"/>
      </svg>
      Đã mua hàng tại Stech
    </span>
  ` : ""}
</div>
</div>

</div>
<div style="
color:#ffb400;
font-size:18px;
margin:6px 0;
">

${"★".repeat(r.rating || 5)}
${"☆".repeat(5 - (r.rating || 5))}
</div>
<div class="review-content">

${r.content}

</div>
<div>

${(r.images || [])
.map(img=>`

<img
src="${img}"
style="
width:90px;
height:90px;
object-fit:cover;
border-radius:10px;
margin:5px;
cursor:pointer;
"
onclick="openImage('${img}')"
>

`)
.join("")}

</div>
${r.video ? `

<video
controls
width="250"
style="
margin-top:10px;
border-radius:10px;
"
>

<source src="${r.video}">

</video>

` : ""}
<div class="review-actions">

<div
class="review-like"
onclick="likeReview('${r.id}')"
>
👍 ${r.likes || 0}
</div>

<div
class="reply-btn"
onclick="toggleReply('${r.id}')"
>
Trả lời
</div>

</div>
<div
id="replyBox-${r.id}"
class="reply-box"
style="display:none;"
>

<div class="reply-header">
↩ Đang trả lời:
<b>${r.userName}</b>

<span
class="reply-close"
onclick="toggleReply('${r.id}')"
>
✕
</span>
</div>

<textarea
id="replyInput-${r.id}"
placeholder="Nhập nội dung trả lời..."
></textarea>

<button
class="reply-send-btn"
onclick="replyReview('${r.id}')"
>
Gửi
</button>

</div>
</div>

<div style="margin-top:10px;">

${(r.replies || []).map((rep,index) =>`
<div style="
margin-top:8px;
margin-left:40px;
padding:10px;
background:#fff;
border-left:3px solid #00b894;
border-radius:12px;
box-shadow:0 2px 8px rgba(0,0,0,.05);
">

<div style="
  display:flex;
  align-items:center;
  gap:2px;
  flex-wrap:wrap;
  font-weight:bold;
  color:#00b894;
  margin-bottom:4px;
">
↳ ${rep.name || rep.userName || "Khách hàng"}

${getVerifiedBadge(rep.uid)}

${rep.position ? `
<span class="admin-badge">
${rep.position}
</span>
` : ""}

<span style="
font-size:12px;
font-weight:400;
color:#888;
">
${rep.createdAt ? timeAgo({toMillis:()=>rep.createdAt}) : ""}
</span>

</div>

<div style="margin-left:18px;">
  ${rep.content}
</div>
<div style="
display:flex;
gap:15px;
margin-left:18px;
margin-top:6px;
">

<span
style="cursor:pointer;color:#666;"
onclick="likeReviewReply('${r.id}', ${index})">
👍 ${rep.likes || 0}
</span>

</div>
</div>

`).join("")}

</div>

</div>

`;

}
}

window.toggleReply = function(id){

const box =
document.getElementById(
`replyBox-${id}`
);

if(!box) return;

box.style.display =
box.style.display === "none"
? "block"
: "none";

};
async function loadComments(){

if(!commentList)
return;

const snap =
await getDocs(

query(

collection(db,"comments"),

where(
"productId",
"==",
productId
)

)

);

commentList.innerHTML="";

for (const docu of snap.docs){

const c = {
id: docu.id,
...docu.data()
};

const userSnap =
await getDoc(doc(db,"users",c.uid));

if(userSnap.exists()){

const latestUser =
userSnap.data();

c.userName =
latestUser.name ||
c.userName;

c.avatar =
latestUser.avatar ||
c.avatar;

c.position =
latestUser.position ||
c.position;

}


if (c.replies?.length) {

    for (const rep of c.replies) {

        if (!rep.uid) continue;

        const repSnap = await getDoc(doc(db, "users", rep.uid));

        if (repSnap.exists()) {

            const latest = repSnap.data();

            rep.name =
                latest.name ||
                rep.name;

            rep.avatar =
                latest.avatar ||
                rep.avatar;

            rep.position =
                latest.position ||
                rep.position;
        }
    }

}
commentList.innerHTML += `

<div class="review-card question-card">

<div class="review-user">

<img
class="review-avatar"
src="${
c.avatar ||
'https://i.ibb.co/Z1kv9nJj/logo.png'
}">

<div>
<div class="review-name">

${c.userName}
${getVerifiedBadge(c.uid)}

${c.position ? `
<span class="admin-badge">
${c.position}
</span>
` : ""}

</div>

<div class="review-time-row">

<span class="review-time-text">
${timeAgo(c.createdAt)}
</span>

${c.verified ? `
<span class="verified-badge">
<svg class="verified-icon" viewBox="0 0 24 24">
<path fill="#0aa06e"
d="M12 0l2.6 2.1 3.3-.6 1.6 3 3.3.7-.7 3.3 2.1 2.5-2.1 2.5.7 3.3-3.3.7-1.6 3-3.3-.6L12 24l-2.6-2.1-3.3.6-1.6-3-3.3-.7.7-3.3L0 12l2.1-2.5-.7-3.3 3.3-.7 1.6-3 3.3.6z"/>
<path fill="#fff"
d="M10.2 15.8l-3-3 1.4-1.4 1.6 1.6 5-5 1.4 1.4z"/>
</svg>
Đã mua hàng tại Stech
</span>
` : ""}

</div>

</div>
</div>
<div class="review-content question-content">
${c.content}
</div>

<div>

${(c.images || [])
.map(img=>`

<img
src="${img}"
style="
width:90px;
height:90px;
object-fit:cover;
border-radius:10px;
margin:5px;
cursor:pointer;
"
onclick="openImage('${img}')"
>

`)
.join("")}

</div>

${c.video ? `

<video
controls
width="250"
style="
margin-top:10px;
border-radius:10px;
"
>
<source src="${c.video}">
</video>

` : ""}
<div>

<div class="review-actions">

<div
class="review-like"
onclick="likeComment('${c.id}')">

👍 ${c.likes || 0}

</div>

<div
class="reply-btn"
onclick="toggleCommentReply('${c.id}')">

Trả lời

</div>

</div>

<div
id="commentReplyBox-${c.id}"
class="reply-box"
style="display:none;">

<textarea
id="commentReplyInput-${c.id}"
placeholder="Nhập nội dung trả lời...">
</textarea>

<button
class="reply-send-btn"
onclick="replyComment('${c.id}')">

Gửi

</button>

</div>

</div>
<div style="margin-top:10px;">

${(c.replies || []).map((rep,index) => `
<div style="
margin-top:8px;
margin-left:40px;
padding:10px;
background:#fff;
border-left:3px solid #00b894;
border-radius:12px;
box-shadow:0 2px 8px rgba(0,0,0,.05);
">

<div style="
display:flex;
align-items:center;
gap:2px;
flex-wrap:wrap;
font-weight:bold;
color:#00b894;
margin-bottom:4px;
">

<span>
↳ ${rep.name || rep.userName || "Khách hàng"}
</span>

${getVerifiedBadge(rep.uid)}

${rep.position ? `
<span class="admin-badge">
${rep.position}
</span>
` : ""}

<span style="
font-size:12px;
font-weight:400;
color:#888;
">
${rep.createdAt
 ? timeAgo({ toMillis:()=>rep.createdAt })
 : ""}
</span>

</div>

<div style="
word-break:break-word;
margin-left:18px;
">
${rep.content}
</div>

<div style="
display:flex;
gap:15px;
margin-left:18px;
margin-top:6px;
">

<span
style="cursor:pointer;color:#666;"
onclick="likeCommentReply('${c.id}', ${index})">
👍 ${rep.likes || 0}
</span>

</div>

</div>

`).join("")}

</div>
`;

}
}
window.replyReview = async function(id){

const input =
document.getElementById(
`replyInput-${id}`
);

const text =
input.value.trim();

if(!text) return;

const user =
auth.currentUser;

if(!user){
showToast("Đăng nhập trước");
return;
}

// LẤY TỪ REALTIME DATABASE
const userDoc = await getDoc(
  doc(db,"users",user.uid)
);

const userData =
  userDoc.exists()
  ? userDoc.data()
  : {};
await updateDoc(
doc(db,"reviews",id),
{
replies: arrayUnion({
  uid: user.uid,
  name: userData.name || user.displayName || user.email || "Khách hàng",
   position: userData.position || "",
  content: text,
  createdAt: Date.now(),
  likes: 0,
  likedBy: []
})
}
);

input.value="";

loadReviews();

};

window.likeReview =
async function(id){

const user =
auth.currentUser;

if(!user){

showToast("Đăng nhập trước");

return;

}

const reviewRef =
doc(db,"reviews",id);

const reviewSnap =
await getDoc(reviewRef);

const review =
reviewSnap.data();

if(
(review.likedBy || [])
.includes(user.uid)
){

showToast("Bạn đã thích rồi");

return;

}

await updateDoc(
reviewRef,
{
likes: increment(1),
likedBy: arrayUnion(user.uid)
}
);

loadReviews();

};
window.openImage=function(url){

const popup =
document.createElement("div");

popup.style=`
position:fixed;
inset:0;
background:rgba(0,0,0,.9);
display:flex;
justify-content:center;
align-items:center;
z-index:999999;
`;

popup.innerHTML=`

<img
src="${url}"
style="
max-width:90%;
max-height:90%;
"
>

`;

popup.onclick=()=>popup.remove();

document.body.appendChild(popup);

}


window.toggleCommentReply = function(id){

const box =
document.getElementById(
`commentReplyBox-${id}`
);

if(!box) return;

box.style.display =
box.style.display === "none"
? "block"
: "none";

}
window.likeComment = async function(id){

const user = auth.currentUser;

if(!user){
showToast("Đăng nhập trước");
return;
}

const commentRef =
doc(db,"comments",id);

const commentSnap =
await getDoc(commentRef);

const comment =
commentSnap.data();

if(
(comment.likedBy || [])
.includes(user.uid)
){
showToast("Bạn đã thích rồi");
return;
}

await updateDoc(
commentRef,
{
likes: increment(1),
likedBy: arrayUnion(user.uid)
}
);

loadComments();

}
window.replyComment = async function(id){

const user =
auth.currentUser;

if(!user){
showToast("Đăng nhập trước");
return;
}

const input =
document.getElementById(
`commentReplyInput-${id}`
);

const text =
input.value.trim();

if(!text) return;

const userDoc =
await getDoc(
doc(db,"users",user.uid)
);

const userData =
userDoc.exists()
? userDoc.data()
: {};

await updateDoc(
doc(db,"comments",id),
{
replies: arrayUnion({

  uid:user.uid,

  name:userData.name || "Khách hàng",

  avatar:userData.avatar || "",

  position:userData.position || "",

  content:text,

  createdAt: Date.now(),
  likes: 0,
likedBy: []
})
}
);

loadComments();

}
auth.onAuthStateChanged(async user=>{

await buildForm();

await loadReviews();

await loadComments();

});
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
window.likeReviewReply = async function(reviewId, index){

  const user = auth.currentUser;

  if(!user){
    showToast("Đăng nhập trước");
    return;
  }

  const reviewRef = doc(db, "reviews", reviewId);
  const snap = await getDoc(reviewRef);

  if(!snap.exists()) return;

  const data = snap.data();
  const replies = data.replies || [];

  if(!replies[index]) return;

  if((replies[index].likedBy || []).includes(user.uid)){
    showToast("Bạn đã thích rồi");
    return;
  }

  replies[index].likes = (replies[index].likes || 0) + 1;
  replies[index].likedBy = [
    ...(replies[index].likedBy || []),
    user.uid
  ];

  await updateDoc(reviewRef, {
    replies: replies
  });

  loadReviews();
};
window.likeCommentReply = async function(commentId, index){

  const user = auth.currentUser;

  if(!user){
    showToast("Đăng nhập trước");
    return;
  }

  const commentRef = doc(db, "comments", commentId);
  const snap = await getDoc(commentRef);

  if(!snap.exists()) return;

  const data = snap.data();
  const replies = data.replies || [];

  if(!replies[index]) return;

  if((replies[index].likedBy || []).includes(user.uid)){
    showToast("Bạn đã thích rồi");
    return;
  }

  replies[index].likes = (replies[index].likes || 0) + 1;
  replies[index].likedBy = [
    ...(replies[index].likedBy || []),
    user.uid
  ];

  await updateDoc(commentRef, {
    replies: replies
  });

  loadComments();
};
