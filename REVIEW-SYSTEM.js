import { app, rtdb } from "./auth.js";
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
let selectedRating = 5;
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
console.log("photoURL =", user.photoURL);
if(!user) return;



reviewForm.innerHTML=`

<div class="review-form">

<div class="review-stars">

<span data-rate="1">★</span>
<span data-rate="2">★</span>
<span data-rate="3">★</span>
<span data-rate="4">★</span>
<span data-rate="5">★</span>

</div>

<textarea
id="reviewContent"
placeholder="Nhập đánh giá..."
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

`;

document
.getElementById("submitReview")
.onclick = submitReview;
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
document
.querySelectorAll(".review-stars span")
.forEach(star=>{

star.style.color="#ffb400";

star.onclick=()=>{

selectedRating =
Number(star.dataset.rate);

document
.querySelectorAll(".review-stars span")
.forEach(s=>{

s.style.color =
Number(s.dataset.rate)
<= selectedRating
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

alert("Bạn đã đánh giá rồi");

return;

}
const userSnap = await get(
  ref(rtdb, user.uid)
);

const userData = userSnap.val() || {};
console.log("UID LOGIN =", user.uid);
console.log("USER DATA =", userData);
const purchased =
await hasPurchased(user.uid);
console.log("USER DATA:", userData);
const content =
document
.getElementById("reviewContent")
.value
.trim();

if(!content){

alert("Nhập nội dung");

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
  user.email ||
  "Khách hàng",
  
  position: userData.position || "",



avatar:
userData.avatar || "",

position:
userData.position || "",

verified:purchased,

content,
rating:selectedRating,
likes:0,
likedBy:[],
createdAt:serverTimestamp(),
images:images,
video:video
}
);
alert("Đã gửi đánh giá");

document
.getElementById("reviewContent")
.value = "";
selectedRating = 5;

document
.querySelectorAll(".review-stars span")
.forEach(s=>{
s.style.color="#ffb400";
});

document.getElementById("reviewImages").value="";
document.getElementById("reviewVideo").value="";
loadReviews();
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
let totalReview = snap.size;

snap.forEach(docu=>{

const r = docu.data();

totalRating += Number(
r.rating || 5
);

});

const avg =
totalReview
? (
totalRating /
totalReview
).toFixed(1)
: 0;

const summary = reviewSummary;

if(summary){

summary.innerHTML = `
<div style="
padding:15px;
background:#fff;
border-radius:12px;
margin-bottom:15px;
font-size:18px;
font-weight:bold;
">
${avg} ⭐
(${totalReview} đánh giá)
</div>
`;

}
snap.forEach(docu=>{

const r = docu.data();

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

${r.position ? `
<span class="admin-badge">
${r.position}
</span>
` : ""}

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

<div class="review-time">
${timeAgo(r.createdAt)}
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
onclick="likeReview('${docu.id}')"
>
👍 ${r.likes || 0}
</div>

<div
class="reply-btn"
onclick="toggleReply('${docu.id}')"
>
Trả lời
</div>

</div>
<div
id="replyBox-${docu.id}"
class="reply-box"
style="display:none;"
>

<div class="reply-header">
↩ Đang trả lời:
<b>${r.userName}</b>

<span
class="reply-close"
onclick="toggleReply('${docu.id}')"
>
✕
</span>
</div>

<textarea
id="replyInput-${docu.id}"
placeholder="Nhập nội dung trả lời..."
></textarea>

<button
class="reply-send-btn"
onclick="replyReview('${docu.id}')"
>
Gửi
</button>

</div>
</div>

<div style="margin-top:10px;">

${(r.replies || []).map(rep => `

<div style="
margin-top:8px;
margin-left:40px;
padding:10px;
background:#f8f8f8;
border-left:3px solid #00b894;
border-radius:8px;
">

<div style="
font-weight:bold;
color:#00b894;
margin-bottom:4px;
">
↳ ${rep.name}
${rep.position ? `
<span class="admin-badge">
${rep.position}
</span>
` : ""}
</div>

<div>
${rep.content}
</div>

</div>

`).join("")}

</div>

</div>

`;

});
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

window.replyReview =
async function(id){

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
alert("Đăng nhập trước");
return;
}

const userSnap = await get(
  ref(rtdb, user.uid)
);

const userData = userSnap.val() || {};

await updateDoc(
doc(db,"reviews",id),
{
replies: arrayUnion({
name:
userData.name ||
user.email ||
"Khách hàng",

position:
userData.position || "",

content:text,

createdAt: Date.now()
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

alert("Đăng nhập trước");

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

alert("Bạn đã thích rồi");

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
auth.onAuthStateChanged(async user=>{

await buildForm();

await loadReviews();

});
