import { app } from "./auth.js";

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

if(!user) return;

const canReview =
await hasPurchased(user.uid);

if(!canReview){

reviewForm.innerHTML=`

<div style="
padding:15px;
background:#fff3cd;
border-radius:12px;
">

Bạn cần mua sản phẩm này
để đánh giá.

</div>

`;

return;
}

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

<input
type="file"
id="reviewImages"
multiple
accept="image/*"
>

<input
type="file"
id="reviewVideo"
accept="video/*"
>

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
const userDoc =
await getDoc(
doc(db,"users",user.uid)
);

const userData =
userDoc.data();
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

verified:true,

content,

rating:selectedRating,

likes:0,

likedBy:[],

createdAt:
serverTimestamp(),

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

<div>

<div class="review-name">
${r.userName}

<span class="verified-badge">
✔ Đã mua hàng tại Stech
</span>

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

</div>

<div style="margin-top:10px;">

<input
type="text"
id="reply-${docu.id}"
placeholder="Trả lời bình luận..."
style="
width:250px;
padding:6px;
"
>

<button
onclick="replyReview('${docu.id}')"
>
Trả lời
</button>

</div>

<div style="margin-top:10px;">

${(r.replies || []).map(rep => `

<div style="
padding:8px;
background:#f5f5f5;
margin-top:5px;
border-radius:8px;
">

<b>${rep.name}</b>

: ${rep.content}

</div>

`).join("")}

</div>

</div>

`;

});

}
window.likeReview =
async function(id){
window.replyReview =
async function(id){

const input =
document.getElementById(`reply-${id}`);

const text =
input.value.trim();

if(!text) return;

const user =
auth.currentUser;

if(!user){
alert("Đăng nhập trước");
return;
}

const userDoc =
await getDoc(
doc(db,"users",user.uid)
);

const userData =
userDoc.data();

await updateDoc(
doc(db,"reviews",id),
{
replies: arrayUnion({

name:
userData.name ||
userData.displayName ||
"Admin",

content:text,

createdAt: Date.now()

})
}
);

input.value="";

loadReviews();

};
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

}
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
