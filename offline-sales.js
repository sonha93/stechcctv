import { db } from "./firebase-init.js";
window.currentCart = [];

window.offlineProducts = [];
async function createOfflineSale() {

  const customerName =
document.getElementById("offlineCustomer").value.trim();

const phone =
document.getElementById("offlinePhone").value.trim();
    const items =
        window.currentCart || [];

    if (!items.length) {
        alert("Chưa có sản phẩm");
        return;
    }

    let total = 0;

    items.forEach(item => {
        total += Number(item.price || 0) * Number(item.qty || 0);
    });
const useCashbackPoints =
Number(
document.getElementById("useCashback")
?.value || 0
);

const useCashback =
useCashbackPoints;
total -= useCashback;

if(total < 0){
  total = 0;
}
    // ============================
// MEMBER OFFLINE
// ============================

let memberId = null;
 if(phone){

  const memberSnap = await db
    .collection("members")
    .where("phone","==",phone)
    .limit(1)
    .get();

  let memberData = null;

  // đã có member
  if(!memberSnap.empty){

    memberId = memberSnap.docs[0].id;
    memberData = memberSnap.docs[0].data();
   const currentPoints =
    Number(memberData.points || 0);
    if(useCashbackPoints > currentPoints * 100){

    alert("Cashback không hợp lệ");
    return;

}
  }else{

    // tự tạo member mới
    const newMemberRef = await db
      .collection("members")
      .add({

        name: customerName || "Khách hàng",

        phone: phone,

        points: 0,

        totalSpent: 0,

        level: "Silver",

        createdAt: new Date()

      });

    memberId = newMemberRef.id;

    memberData = {
      points: 0,
      totalSpent: 0
    };
  }

const earnPoints =
    Math.floor(total / 10000);

const usedPoints =
    Number(useCashback) / 100;

await db
  .collection("members")
  .doc(memberId)
  .update({

    points:
      Number(memberData.points || 0)
      - usedPoints
      + earnPoints,

    totalSpent:
      Number(memberData.totalSpent || 0)
      + total

  });

  await db
    .collection("member_history")
    .add({

      memberId,

      type: "offline_sale",

      points: earnPoints,

      total,

      createdAt: Date.now()

    });

}
   const orderData = {

    customerName:
        customerName || "Khách lẻ",

    phone:
        phone || "",

    address: "Mua tại cửa hàng",

    source: "offline",

    status: "completed",

    offlineSale: true,
    memberId: memberId,
    createdAt: new Date(),

    items: items.map(i => ({
        productId: String(i.productId),
        name: String(i.name),
        price: Number(i.price),
        qty: Number(i.qty)
    })),

    total,

    paidAmount:
        Number(
            document.getElementById("customerPaid")?.value || 0
        ),

    changeAmount:
        Number(
            document.getElementById("customerPaid")?.value || 0
        ) - total,

    customerCancelled: false,

    adminCancelled: false
};
   try {

    const orderRef =
        await db.collection("orders")
        .add(orderData);

  
        for (const item of items) {

           const productRef =
    db.collection("products")
    .doc(String(item.productId));
            const productDoc =
                await productRef.get();

            if (!productDoc.exists)
                continue;

            const product =
                productDoc.data();

            const currentStock =
                Number(product.stock || 0);

            const qty =
                Number(item.qty || 0);

            const newStock =
                currentStock - qty;

            await productRef.update({
                stock: newStock
            });

            await db.collection("sales_history").add({

                orderId:
                    orderRef.id,

               productId:
    String(item.productId),
                productName:
                    item.name,

                qty,

                importPrice:
                    Number(product.importPrice || 0),

                sellPrice:
                    Number(item.price || 0),

                revenue:
                    Number(item.price || 0) * qty,

                capital:
                    Number(product.importPrice || 0) * qty,

                profit:
                    (Number(item.price || 0) -
                     Number(product.importPrice || 0)) * qty,

                createdAt: new Date()
            });

            await db.collection("stock_movements").add({

                productId:
                    item.productId,

                productName:
                    item.name,

                qty: -qty,

                type: "SALE",

                reason:
                    "Bán tại cửa hàng",

                stockAfter:
                    newStock,

                createdAt: new Date()

            });

        }

  await loadOfflineSales();
alert("Đã tạo đơn bán offline");

window.currentCart = [];

renderOfflineCart();

document.getElementById("offlineSearch").value = "";
document.getElementById("offlineSearchResults").innerHTML = "";
    
} catch (err) {

    console.error(err);

    alert(err.message);

}

}

window.createOfflineSale =
    createOfflineSale;
async function loadOfflineProducts(){

    const snap =
        await db.collection("products").get();

  window.offlineProducts =
    snap.docs.map(doc => ({
        ...doc.data(),
        _id: doc.id
    }));
}

document.addEventListener("input", e => {

    if (e.target.id !== "offlineSearch") return;

    const keyword =
        e.target.value.toLowerCase().trim();

    const box =
        document.getElementById("offlineSearchResults");

    if (!keyword) {
        box.innerHTML = "";
        return;
    }

    const result =
        window.offlineProducts.filter(p =>
            (p.name || "")
                .toLowerCase()
                .includes(keyword)
        );

    box.innerHTML = "";

    result.forEach(p => {

        const btn =
            document.createElement("button");

        btn.type = "button";

        btn.style.width = "100%";
        btn.style.textAlign = "left";
        btn.style.padding = "12px";
        btn.style.border = "1px solid #ddd";
        btn.style.background = "#fff";
        btn.style.marginBottom = "5px";
        btn.style.cursor = "pointer";

        btn.innerText =
            `${p.name} - ${Number(p.price || 0).toLocaleString()}đ - Tồn ${p.stock || 0}`;

        btn.onclick = () => {
    window.addOfflineItem(p._id);
};

        box.appendChild(btn);

    });

});
window.addOfflineItem = function(productId){

  const product =
    window.offlineProducts.find(
        x => x._id === productId
    );

    if(!product) return;

    const existed =
        window.currentCart.find(
            x => x.productId === productId
        );

    if(existed){

        existed.qty++;

    }else{

     window.currentCart.push({
    productId: product._id,
    name: product.name,
    price: product.price,
    qty: 1
});
    }

   
 renderOfflineCart();

   document.getElementById("offlineSearch").value = "";
   document.getElementById("offlineSearchResults").innerHTML = "";

}
window.changeQty = function(productId, delta){

    const item =
        window.currentCart.find(
            x => x.productId === productId
        );

    if(!item) return;

    item.qty += delta;

    if(item.qty <= 0){
        window.removeOfflineItem(productId);
        return;
    }

    renderOfflineCart();
};

window.removeOfflineItem = function(productId){

    window.currentCart =
        window.currentCart.filter(
            x => x.productId !== productId
        );

    renderOfflineCart();
};
function renderOfflineCart(){

    let total = 0;

    document.getElementById(
        "offlineCart"
    ).innerHTML = window.currentCart.map(item => {

        total +=
            Number(item.price) *
            Number(item.qty);
return `
<div style="
    padding:10px;
    border-bottom:1px solid #ddd;
    display:flex;
    justify-content:space-between;
    align-items:center;
">

    <div>
        ${item.name}
        x${item.qty}
        =
        ${(item.price * item.qty).toLocaleString()}đ
    </div>

    <div>

        <button onclick="window.changeQty('${item.productId}',1)">
            +
        </button>

        <button onclick="window.changeQty('${item.productId}',-1)">
            -
        </button>

        <button onclick="window.removeOfflineItem('${item.productId}')">
            X
        </button>

    </div>

</div>
`;

  
    }).join("");

const cashback =
Number(
document.getElementById("useCashback")?.value || 0
);

const finalTotal =
Math.max(0, total - cashback);

document.getElementById(
    "offlineTotal"
).innerText =
    finalTotal.toLocaleString() + "đ";

const earnPoints =
Math.floor(finalTotal / 10000);

const earnBox =
document.getElementById("earnPointsText");

if(earnBox){
    earnBox.innerText =
        earnPoints.toLocaleString();
}

const paid =
Number(
document.getElementById("customerPaid")?.value || 0
);

const changeBox =
document.getElementById("changeMoney");

if(changeBox){
    changeBox.value =
    (paid - finalTotal).toLocaleString() + "đ";
}
}
loadOfflineProducts();
document.addEventListener("input", e => {

    if(e.target.id !== "customerPaid") return;
    const paid =
        Number(e.target.value || 0);

    const total =
window.currentCart.reduce(
(sum,item)=>
sum + Number(item.price)*Number(item.qty),
0
);

const cashback =
Number(
document.getElementById("useCashback")?.value || 0
);

const finalTotal =
Math.max(0, total - cashback);

document.getElementById("changeMoney").value =
    (paid - finalTotal).toLocaleString() + "đ";
});
async function loadOfflineSales(){

    const selectedDate =
        document.getElementById("offlineSaleDate")?.value;

    let query = db
        .collection("orders")
        .where("offlineSale","==",true);

    if(selectedDate){

        const start = new Date(selectedDate);
        start.setHours(0,0,0,0);

        const end = new Date(selectedDate);
        end.setHours(23,59,59,999);

        query = query
            .where("createdAt", ">=", start)
            .where("createdAt", "<=", end);
    }else{

        // mặc định hôm nay
        const start = new Date();
        start.setHours(0,0,0,0);

        const end = new Date();
        end.setHours(23,59,59,999);

        query = query
            .where("createdAt", ">=", start)
            .where("createdAt", "<=", end);
    }
    const snap = await query.get();

    const body =
        document.getElementById("offlineSalesBody");

    if(!body) return;

    body.innerHTML = "";

    snap.docs.forEach(doc => {

        const o = doc.data();

        let dateText = "-";

        try{
            dateText =
                o.createdAt.toDate()
                .toLocaleString("vi-VN");
        }catch(err){}

        body.innerHTML += `
        <tr>
            <td>${doc.id}</td>
            <td>${o.customerName || ""}</td>
            <td>${o.phone || ""}</td>
            <td>${Number(o.total || 0).toLocaleString()}đ</td>
            <td>${dateText}</td>
        </tr>
        `;
    });

}
window.loadOfflineSales = loadOfflineSales;
document.getElementById("offlinePhone")
.addEventListener("input", async () => {

  const phone =
    document.getElementById("offlinePhone")
    .value
    .trim();

  if(!phone) return;

  const snap = await db
    .collection("members")
    .where("phone","==",phone)
    .limit(1)
    .get();
console.log("PHONE =", phone);
console.log("FOUND =", snap.size);
 if(snap.empty){
   const orderSnap = await db
    .collection("orders")
    .where("phone","==",phone)
    .limit(1)
    .get();
if(!orderSnap.empty){

    document.getElementById("offlineCustomer").value =
        orderSnap.docs[0].data().customerName || "";

}else{

    document.getElementById("offlineCustomer").value = "";

}
window.memberPoints = 0;
window.memberCashback = 0;
const cashbackInput =
document.getElementById("useCashback");

if(
    Number(cashbackInput.value || 0)
    > window.memberCashback
){
    cashbackInput.value =
        window.memberCashback;
}
 document.getElementById("memberPointsText").innerText = "0";

 document.getElementById("cashbackText").innerText = "0đ";

 document.getElementById("useCashback").value = 0;

 renderOfflineCart();

 return;
}

const m = snap.docs[0].data();
document.getElementById("offlineCustomer").value =
    m.name || "";

window.memberPoints =
    Number(m.points || 0);
window.memberCashback =
    Number(m.points || 0) * 100;
document.getElementById("memberPointsText").innerText =
    window.memberCashback.toLocaleString() + "đ";
document.getElementById("cashbackText").innerText =
    window.memberCashback.toLocaleString() + "đ";
  const cashbackInput =
document.getElementById("useCashback");

if(
   Number(cashbackInput.value || 0)
   > window.memberCashback
){
   cashbackInput.value =
   window.memberCashback;
}

renderOfflineCart();
});
const dateInput =
document.getElementById("offlineSaleDate");

if(dateInput){
    dateInput.value =
    new Date().toISOString().split("T")[0];
}

loadOfflineSales();
const paymentBtn =
document.getElementById("paymentBtn");

if(paymentBtn){

paymentBtn.addEventListener("click",()=>{

if(!window.currentCart.length){
    alert("Chưa có sản phẩm");
    return;
}

document.getElementById(
"paymentModal"
).style.display="block";

});

}

// tiền mặt

document.getElementById(
"cashBtn"
).addEventListener("click",async()=>{

document.getElementById(
"paymentModal"
).style.display="none";

await createOfflineSale();

});

// chuyển khoản

document.getElementById(
"bankBtn"
).addEventListener("click",()=>{

const total =
window.currentCart.reduce(
(sum,item)=>
sum + Number(item.price)*Number(item.qty),
0
);

document.getElementById(
"bankArea"
).style.display="block";

document.getElementById(
"paymentQr"
).src =
`https://img.vietqr.io/image/970415-101005245058-compact2.png?amount=${total}`;

});

// xác nhận đã nhận tiền

document.getElementById(
"confirmTransferBtn"
).addEventListener("click",async()=>{

document.getElementById(
"paymentModal"
).style.display="none";

await createOfflineSale();

});
document.getElementById("useCashback")
?.addEventListener("input", (e) => {

    let value =
        Number(e.target.value || 0);

   const maxPoints =
    Number(window.memberCashback || 0);

    if(value > maxPoints){

        value = maxPoints;
        e.target.value = maxPoints;

    }

    if(value < 0){

        value = 0;
        e.target.value = 0;

    }

    renderOfflineCart();

});
