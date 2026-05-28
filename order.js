import {
getAuth,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getDatabase,
ref,
onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* =========================
FIREBASE
========================= */
const firebaseConfig = {
apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
authDomain: "stech-73b89.firebaseapp.com",
databaseURL:
"https://stech-73b89-default-rtdb.asia-southeast1.firebasedatabase.app",
projectId: "stech-73b89",
storageBucket: "stech-73b89.appspot.com",
messagingSenderId: "873739162979",
appId: "1:873739162979:web:978f1a4043f025b1cdaf56"
};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

const auth = getAuth(app);

/* =========================
FORMAT
========================= */
function format(n){

return Number(n || 0)
.toLocaleString("vi-VN") + "đ";

}

/* =========================
LOAD ORDERS
========================= */
function loadOrders(uid){

const box = document.getElementById("orders");

if(!box) return;

onValue(ref(db,"orders"), snapshot => {

const data = snapshot.val();

if(!data){

box.innerHTML = `
<p>Chưa có đơn hàng</p>
`;

return;

}

const orders = Object.values(data)
.filter(order => order.uid === uid)
.reverse();

if(orders.length === 0){

box.innerHTML = `
<p>Chưa có đơn hàng</p>
`;

return;

}

renderOrders(orders);

});

}

/* =========================
RENDER
========================= */
function renderOrders(orders){

const box = document.getElementById("orders");

box.innerHTML = "";

orders.forEach(order => {

let itemsHTML = "";

(order.items || []).forEach(item => {

itemsHTML += `
<div style="
display:flex;
gap:10px;
margin:10px 0;
align-items:center;
">

<img
src="${item.img || ""}"
style="
width:70px;
height:70px;
object-fit:cover;
border-radius:10px;
"
>

<div>
<div>
<b>${item.name || ""}</b>
</div>

<div>
${item.qty || 1}
×
${format(item.price || 0)}
</div>
</div>

</div>
`;

});

box.innerHTML += `
<div class="order-box"
style="
background:#fff;
padding:20px;
border-radius:14px;
margin-bottom:20px;
">

<h3>
🧾 Đơn hàng
</h3>

<p>
🕒 ${order.time || ""}
</p>

${itemsHTML}

<h4>
Tổng:
${format(order.total || 0)}
</h4>

</div>
`;

});

}

/* =========================
INIT
========================= */
document.addEventListener(
"DOMContentLoaded",
() => {

onAuthStateChanged(auth, user => {

const box =
document.getElementById("orders");

if(!user){

box.innerHTML = `
<p>Vui lòng đăng nhập</p>
`;

return;

}

loadOrders(user.uid);

});

}
);
