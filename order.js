function calcOrder(items){

  let total = 0;
  let originalTotal = 0;

  items.forEach(item => {

    const qty = Number(item.qty || 1);
    const price = Number(item.price || 0);

   const original = Number(
  item.originalPrice ||
  item.oldPrice ||
  price
);
    total += price * qty;
    originalTotal += original * qty;
  });

  return {
    total,
    originalTotal,
    savings: originalTotal - total
  };
}
import { auth, db } from "./firebase-init.js";

/* =========================
STATE
========================= */

let currentPage = 1;
const perPage = 10;
let allOrders = [];
let reviewedProducts = [];
/* =========================
FORMAT
========================= */

function format(n){
  return Number(n || 0)
    .toLocaleString("vi-VN") + "đ";
}

function formatDate(createdAt){

  try{

    if(!createdAt) return "";

    let date;

    // firestore timestamp
    if(typeof createdAt.toDate === "function"){

      date = createdAt.toDate();

    }else{

      date = new Date(createdAt);
    }

    return date.toLocaleString("vi-VN");

  }catch{

    return "";
  }
}
/* =========================
LOAD ORDERS
========================= */

async function loadOrders(userUid){

  const box =
    document.getElementById("orders");

  if(!box) return;

  box.innerHTML = `
    <div style="
      padding:30px;
      text-align:center;
      color:#666;
    ">
      Đang tải đơn hàng...
    </div>
  `;

  try{

    const snapshot = await db
      .collection("orders")
      .where("uid", "==", userUid)
      .orderBy("createdAt", "desc")
      .get();
const reviewSnap = await db
  .collection("reviews")
  .where("uid","==",userUid)
  .get();

reviewedProducts = [];

reviewSnap.forEach(doc=>{

  const r = doc.data();

  reviewedProducts.push(r.productId);

});
   allOrders = await Promise.all(

  snapshot.docs.map(async doc => {

    const data = doc.data();

    // load thêm giá gốc
    if(Array.isArray(data.items)){

      data.items = await Promise.all(

        data.items.map(async item => {

          // nếu đã có originalPrice
          // thì giữ nguyên
        if(item.originalPrice || item.oldPrice){

  return {
    ...item,
    originalPrice:
      Number(
        item.originalPrice ||
        item.oldPrice ||
        item.price
      )
  };
}

          try{

            // lấy product từ collection products
            const productDoc = await db
              .collection("products")
            .doc(item.productId || item.id)
              .get();

            if(productDoc.exists){

              const product =
                productDoc.data();

              return {

                ...item,

                originalPrice:
                  Number(
                    product.originalPrice ||
                    product.oldPrice ||
                    product.price ||
                    item.price
                  )
              };
            }

          }catch(err){

            console.error(
              "Lỗi load giá gốc:",
              err
            );
          }

          // fallback nếu lỗi
          return {

            ...item,
            originalPrice: item.price
          };

        })
      );
    }

    return {

      id: doc.id,
      ...data
    };

  })
);


    if(allOrders.length === 0){

      box.innerHTML = `
        <div style="
          padding:40px;
          text-align:center;
          color:#666;
        ">
          🧾 Chưa có đơn hàng
        </div>
      `;

      return;
    }

    currentPage = 1;

    renderOrders();

  }catch(err){

    console.error(err);

    box.innerHTML = `
      <div style="
        padding:40px;
        text-align:center;
        color:red;
      ">
        ❌ Lỗi tải đơn hàng
      </div>
    `;
  }
}

/* =========================
RENDER
========================= */
function renderOrders(){

  const box =
    document.getElementById("orders");

  box.innerHTML = "";

  const start =
    (currentPage - 1) * perPage;

  const end =
    start + perPage;

  const pageOrders =
    allOrders.slice(start, end);

  pageOrders.forEach(order => {

    const items = Array.isArray(order.items)
      ? order.items
      : [];

    const {
      total,
      originalTotal,
      savings
    } = calcOrder(items);
    const pointDiscount =
  Number(order.cashbackAmount || 0);

const finalTotal =
  Math.max(
    total - pointDiscount,
    0
  );
    // =========================
    // ORDER STATUS TEXT
    // =========================
   let statusText = "Chờ xử lý";
let statusColor = "#f59e0b";

switch(order.status){

  case "confirmed":
    statusText = "Đã xác nhận";
    statusColor = "#0ea5e9";
    break;

  case "shipping":
    statusText = "Đang giao";
    statusColor = "#8b5cf6";
    break;

  case "completed":
    statusText = "Đơn hàng đã giao";
    statusColor = "#16a34a";
    break;

  case "return_requested":
    statusText = "Đã gửi yêu cầu trả hàng";
    statusColor = "#ff9800";
    break;

  case "return_approved":
    statusText = "Đã chấp nhận trả hàng";
    statusColor = "#2196f3";
    break;

  case "returned":
    statusText = "Đã trả hàng";
    statusColor = "#9c27b0";
    break;

  case "refund_completed":
    statusText = "Đã hoàn tiền";
    statusColor = "#4caf50";
    break;

  case "cancelled":
    statusText = "Đã hủy";
    statusColor = "#dc2626";
    break;
}
    
    

    let itemsHTML = "";

    items.slice(0,2).forEach(item => {

      const qty = Number(item.qty || 1);
      const price = Number(item.price || 0);
      const sub = qty * price;

      itemsHTML += `

        <div class="item">

<a href="logo.html?id=${item.productId || item.id}">
  <img 
    src="${item.img || ''}" 
    style="cursor:pointer"
  >
</a>
          <div style="flex:1;">

            <div style="
              font-weight:bold;
              margin-bottom:5px;
            ">
              ${item.name || ""}
            </div>

            <div class="sale-price">
              ${format(price)}
            </div>

            ${Number(item.originalPrice) > Number(price) ? `
              <div style="
                text-decoration: line-through;
                color:#999;
                font-size:13px;
              ">
                ${format(item.originalPrice)}
              </div>
            ` : ""}

            <div class="calc">
              ${qty} × ${format(price)}
            </div>

            <div style="
              color:#e53935;
              font-weight:bold;
              margin-top:4px;
            ">
              ${format(sub)}
            </div>

          </div>

        </div>
      `;
    });

    // =========================
    // HIDDEN ITEMS
    // =========================
    let hiddenHTML = "";

    if(items.length > 2){

      items.slice(2).forEach(item => {

  const qty =
    Number(item.qty || 1);

  const price =
    Number(item.price || 0);

 const original = Number(
  item.originalPrice ||
  item.oldPrice ||
  price
);

  const sub = qty * price;

hiddenHTML += `
  <div style="
    display:flex;
    gap:14px;
    padding:12px 0;
    border-bottom:1px solid #eee;
  ">

    <a href="logo.html?id=${item.productId || item.id}">
      <img
        src="${item.img || 'no-image.png'}"
        width="72"
        height="72"
        style="
          object-fit:cover;
          border-radius:10px;
          border:1px solid #ddd;
          cursor:pointer;
        "
      >
    </a>

    <div>
      <div style="font-weight:700;">
        ${item.name || ""}
      </div>

      <div style="color:#d70018;font-weight:700;">
        ${format(price)}
      </div>

      ${original > price ? `
        <div style="text-decoration:line-through;color:#999;font-size:13px;">
          ${format(original)}
        </div>
      ` : ""}

      <div>
        ${qty} × ${format(price)}
      </div>

      <div style="color:#d70018;font-weight:700;">
        ${format(sub)}
      </div>
    </div>

  </div>
`;
});
}
    // =========================
    // DISABLE CANCEL
    // =========================
   const disableCancel =
  order.customerCancelled ||
  order.status !== "pending";

    // =========================
    // HTML
    // =========================
    box.innerHTML += `

      <div class="order-box">

        <div class="order-title">
          🧾 Đơn #${order.id}
        </div>

        <div style="
          color:#666;
          font-size:13px;
          margin-bottom:10px;
        ">
          ${formatDate(order.createdAt)}
        </div>

        <!-- STATUS -->
        <div style="
          margin-bottom:15px;
        ">

          <span style="
            background:${statusColor};
            color:#fff;
            padding:7px 14px;
            border-radius:999px;
            font-size:13px;
            font-weight:bold;
          ">
            ${statusText}
          </span>

        </div>

        ${itemsHTML}

        ${
          items.length > 2
          ? `
          <div
 id="toggle-${order.id}"
 onclick="toggleItems('${order.id}', ${items.length - 2})"
 style="
   margin-top:10px;
   cursor:pointer;
   color:#0ea5e9;
   font-weight:600;
   display:flex;
   align-items:center;
   gap:6px;
 "
>
  <span>và ${items.length - 2} sản phẩm khác</span>
  <span style="font-size:12px;">▼</span>
</div>

            <div
              id="more-${order.id}"
              style="display:none;"
            >
              ${hiddenHTML}
            </div>
          `
          : ""
        }

    <div class="total-box">

  <div class="row">
    <span>Tổng giá gốc</span>
    <b>${format(originalTotal)}</b>
  </div>

  <div class="row discount">
    <span>Tiết kiệm</span>
    <b>-${format(savings)}</b>
  </div>

 <div class="row discount">
  <span>Dùng điểm</span>
  <b>-${format(order.cashbackAmount || 0)}</b>
</div>

<div class="row final">
  <span>Cần thanh toán</span>
  <b>${format(finalTotal)}</b>
</div>

${
  order.status === "completed" &&
  !order.returnRequested &&
  (Date.now() - Number(order.createdAt)) <= 7 * 24 * 60 * 60 * 1000
  ? `
  <button
    onclick="requestReturn('${order.id}')"
    style="
      width:100%;
      margin-top:10px;
      background:#ff9800;
      color:#fff;
      border:none;
      padding:12px;
      border-radius:8px;
      cursor:pointer;
      font-weight:bold;
    "
  >
    🔄 Yêu cầu trả hàng
  </button>
  `
  : ""
}

${
order.returnStatus === "pending"
? `
<div style="
  margin-top:10px;
  padding:12px;
  background:#e8f5e9;
  border:1px solid #4caf50;
  color:#2e7d32;
  border-radius:8px;
  text-align:center;
  font-weight:bold;
">
✅ Đã gửi yêu cầu trả hàng
</div>
`

: order.returnStatus === "rejected"

? `
<div style="
  margin-top:10px;
  padding:12px;
  background:#ffebee;
  border:1px solid #f44336;
  color:#c62828;
  border-radius:8px;
  text-align:center;
  font-weight:bold;
">
❌ Đã từ chối yêu cầu trả hàng
</div>
`

: order.returnStatus === "approved"

? `
<div style="
  margin-top:10px;
  padding:12px;
  background:#e3f2fd;
  border:1px solid #2196f3;
  color:#1565c0;
  border-radius:8px;
  text-align:center;
  font-weight:bold;
">
✅ Yêu cầu trả hàng đã được chấp nhận
</div>
`

: order.status === "returned"

? `
<div style="
  margin-top:10px;
  padding:12px;
  background:#f3e5f5;
  border:1px solid #9c27b0;
  color:#7b1fa2;
  border-radius:8px;
  text-align:center;
  font-weight:bold;
">
📦 Đã trả hàng
</div>
`

: ""
}
${
  order.status === "completed"
  ? `
  <div style="margin-top:15px">
  ${items
.filter(item =>
  !reviewedProducts.includes(
    item.productId || item.id
  )
)
.map(item => `
      <a
       href="logo.html?id=${item.productId || item.id}"
        style="
          display:block;
          background:#ff9800;
          color:#fff;
          text-align:center;
          padding:10px;
          border-radius:8px;
          text-decoration:none;
          margin-top:8px;
        ">
        ⭐ Đánh giá ${item.name}
      </a>
    `).join("")}
  </div>
  `
  : ""
}

</div>

        <!-- CANCEL BUTTON -->
        <div style="margin-top:18px;">

        ${
  order.customerCancelled
  ? `
    <button
      class="recall-order-btn"
      data-id="${order.id}"
      style="
        background:#16a34a;
        color:#fff;
        border:none;
        padding:10px 18px;
        border-radius:8px;
        cursor:pointer;
        font-weight:bold;
      "
    >
      Đặt lại đơn
    </button>
  `
  : `
    <button
      class="cancel-order-btn"
      data-id="${order.id}"
      ${disableCancel ? "disabled" : ""}
      style="
        background:${disableCancel ? "#fff" : "#ef4444"};
        color:#fff;
        border:none;
        padding:10px 18px;
        border-radius:8px;
        cursor:${disableCancel ? "not-allowed" : "pointer"};
        font-weight:bold;
      "
    >
      ${
        disableCancel
          ? ""
          : "Hủy đơn hàng"
      }
    </button>
  `
}

        </div>

      </div>
    `;
  });
  bindCancelEvents();
bindRecallEvents();
renderPagination();;
}
function renderPagination(){   
  const box = document.getElementById("orders");

  const totalPages = Math.ceil(allOrders.length / perPage);

  const html = `
    <div style="display:flex;gap:10px;justify-content:center;margin:20px 0;">
      
      <button onclick="prevPage()" ${currentPage === 1 ? "disabled" : ""}>
        ◀
      </button>

      <span>Trang ${currentPage} / ${totalPages}</span>

      <button onclick="nextPage()" ${currentPage === totalPages ? "disabled" : ""}>
        ▶
      </button>

    </div>
  `;

  box.insertAdjacentHTML("beforeend", html);
}
// =========================
// CANCEL ORDER
// =========================
function bindCancelEvents(){

  document
    .querySelectorAll(".cancel-order-btn")
    .forEach(btn => {

     btn.addEventListener("click", async () => {

  if(btn.disabled) return;
        const id = btn.dataset.id;

        const confirmCancel = confirm(
          "Bạn có chắc muốn hủy đơn hàng này?"
        );

if(!confirmCancel) return;

// khóa nút tránh spam click
btn.disabled = true;
btn.innerText = "Đang hủy...";

try{
       const orderRef = db
  .collection("orders")
  .doc(id);

const orderDoc = await orderRef.get();

if(!orderDoc.exists){
  throw new Error("Không tìm thấy đơn");
}
const orderData = orderDoc.data();
if(orderData.status === "cancelled"){
  throw new Error("Đơn đã hủy");
}
// hoàn điểm nếu đơn có dùng điểm
if(
  orderData.memberId &&
  Number(orderData.usedPoints || 0) > 0 &&
    !orderData.pointsRefunded
){

  await db
    .collection("members")
    .doc(orderData.memberId)
    .update({
      points: firebase.firestore.FieldValue.increment(
        Number(orderData.usedPoints)
      )
    });

  await db.collection("member_history").add({
    memberId: orderData.memberId,
    type: "refund_points",
    points: Number(orderData.usedPoints),
    orderId: id,
    createdAt: Date.now()
  });
}

// cập nhật trạng thái đơn
const updateData = {
  customerCancelled: true,
  status: "cancelled"
};

if(
  orderData.memberId &&
  Number(orderData.usedPoints || 0) > 0
){
  updateData.pointsRefunded = true;
}

await orderRef.update(updateData);
alert("Đã hủy đơn hàng");

// update local UI luôn
allOrders = allOrders.map(order => {

  if(order.id === id){

    return {
      ...order,
      status: "cancelled",
      customerCancelled: true
    };
  }

  return order;
});

// render lại
renderOrders();


       }catch(err){

  console.error(err);

  alert("Lỗi hủy đơn hàng");

  // mở lại nút nếu lỗi
  btn.disabled = false;
  btn.innerText = "Hủy đơn hàng";
}
      });
    });
}
function bindRecallEvents(){

  document
    .querySelectorAll(".recall-order-btn")
    .forEach(btn=>{

      btn.addEventListener("click", async()=>{

        const id = btn.dataset.id;

        if(!confirm("Bạn muốn đặt lại đơn này?")) return;

        try{

        const orderRef = db.collection("orders").doc(id);
const orderDoc = await orderRef.get();

if (!orderDoc.exists) {
  throw new Error("Không tìm thấy đơn");
}

const order = orderDoc.data();

// Nếu đơn đã từng hoàn điểm thì trừ lại điểm trước
if (
  order.memberId &&
  Number(order.usedPoints || 0) > 0 &&
  order.pointsRefunded
) {

  const memberRef = db.collection("members").doc(order.memberId);
  const memberDoc = await memberRef.get();

  if (!memberDoc.exists) {
    throw new Error("Không tìm thấy thành viên");
  }

  const member = memberDoc.data();

  if (Number(member.points || 0) < Number(order.usedPoints)) {
    throw new Error("Điểm hiện tại không đủ để đặt lại đơn");
  }

  await memberRef.update({
    points: firebase.firestore.FieldValue.increment(
      -Number(order.usedPoints)
    )
  });
}

await orderRef.update({
  status: "pending",
  customerCancelled: false,
  pointsRefunded: false,
  recalledAt: Date.now()
});
          alert("Đặt lại đơn thành công");

          const user = auth.currentUser;
          if(user){
            loadOrders(user.uid);
          }

        }catch(err){

          console.error(err);
          alert("Không thể đặt lại đơn");

        }

      });

    });

}
/* =========================
AUTH
========================= */

auth.onAuthStateChanged(user => {

  const box =
    document.getElementById("orders");

  if(!user){

    box.innerHTML = `
      <div style="
        padding:40px;
        text-align:center;
        color:#666;
      ">
        🔐 Vui lòng đăng nhập
      </div>
    `;

    return;
  }

  loadOrders(user.uid);

});
window.toggleItems = function(id, itemsCount){

  const box =
    document.getElementById(`more-${id}`);

  const btn =
    document.getElementById(`toggle-${id}`);

  if(!box) return;

  if(box.style.display === "none"){

    box.style.display = "block";

    if(btn){
      btn.innerHTML =
        `và ${itemsCount} sản phẩm khác ▲`;
    }

  }else{

    box.style.display = "none";

    if(btn){
      btn.innerHTML =
        `và ${itemsCount} sản phẩm khác ▼`;
    }
  }
};
window.nextPage = function(){
  const totalPages = Math.ceil(allOrders.length / perPage);

  if(currentPage < totalPages){
    currentPage++;
    renderOrders();
  }
};

window.prevPage = function(){
  if(currentPage > 1){
    currentPage--;
    renderOrders();
  }
};
window.requestReturn = async function(orderId){

  const ok = confirm("Bạn muốn gửi yêu cầu trả hàng?");
  if(!ok) return;

 await db.collection("orders").doc(orderId).update({
  returnRequested: true,
  returnRequestedAt: Date.now(),
  returnStatus: "pending"
});

  alert("Đã gửi yêu cầu trả hàng");

  allOrders = allOrders.map(order => {
    if(order.id === orderId){
      return {
        ...order,
        status: "return_requested",
        returnRequested: true
      };
    }
    return order;
  });

  renderOrders();
};
