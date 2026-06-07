
import { db } from "./firebase-init.js";

document
.getElementById("closeAudit")
.addEventListener("click",()=>{

    auditOpen = false;

    auditStatus.innerHTML =
    "🔴 ĐANG ĐÓNG";

});
async function loadProducts(){

    const auditProducts =
    document.getElementById("auditProducts");

    auditProducts.innerHTML = "";

    const snap =
    await db.collection("products").get();

 let stt = 1;

snap.forEach(docSnap => {

    const p = docSnap.data();

  auditProducts.innerHTML += `

<div class="audit-item">

    <div class="audit-top">

        <span class="audit-stt">
            #${String(stt).padStart(3,"0")}
        </span>

    </div>

    <div class="audit-product-name">
        ${p.name}
    </div>

    <div class="audit-product-id">
        ID: ${docSnap.id}
    </div>

    <input
        type="number"
        class="actualStock"
        data-id="${docSnap.id}"
        data-name="${p.name}"
        data-system="${p.stock || 0}"
        placeholder="Nhập số lượng đếm thực tế"
    >

</div>

`;

stt++;
});
}
loadProducts();

document.addEventListener("input",(e)=>{

    if(!e.target.classList.contains("actualStock")){
        return;
    }

    const card =
    e.target.closest(".audit-item");

    if(e.target.value !== ""){
        card.classList.add("done");
    }else{
        card.classList.remove("done");
    }

});

document
.getElementById("submitAudit")
.addEventListener("click", async ()=>{

    const submitBtn =
    document.getElementById("submitAudit");

    submitBtn.disabled = true;

    if(!auditOpen){

        alert("Chưa mở kiểm kê");

        submitBtn.disabled = false;

        return;
    }
    const auditId =
"AUD-" +
new Date().toISOString().slice(0,10).replaceAll("-","") +
"-" +
Date.now();
    const rows =
    document.querySelectorAll(".actualStock");

    for(const row of rows){
if(row.value === ""){
    continue;
}
        const counted =
        Number(row.value || 0);

      const productDoc =
await db
.collection("products")
.doc(row.dataset.id)
.get();

const systemStock =
Number(productDoc.data()?.stock || 0);

const productData =
productDoc.data();

const importPrice =
Number(productData.importPrice || 0);

const salePrice =
Number(productData.price || 0);

const diff =
counted - systemStock;
const qtyDiff =
Math.abs(diff);
let lossValue = 0;
let profitLossValue = 0;
let extraValue = 0;
let extraProfitValue = 0;

if(diff < 0){

    lossValue =
    qtyDiff * importPrice;

    profitLossValue =
    qtyDiff *
    (salePrice - importPrice);

}

if(diff > 0){

    extraValue =
    qtyDiff * importPrice;

    extraProfitValue =
    qtyDiff *
    (salePrice - importPrice);

}



const totalImpact =
lossValue +
profitLossValue +
extraValue +
extraProfitValue;

await db.collection("audit_entries").add({

    auditId,

    productId: row.dataset.id,

    productName: row.dataset.name,

    systemStock,

    countedStock: counted,

    difference: diff,

    importPrice,

    salePrice,

    lossValue,

profitLossValue,

extraValue,

extraProfitValue,

totalImpact,

auditDateTime:
    new Date()
    .toLocaleString("vi-VN"),

createdAt:
firebase.firestore.FieldValue.serverTimestamp()
});

    }

    alert("Đã lưu kiểm kê");
    submitBtn.disabled = false;
    auditOpen = false;

auditStatus.innerHTML =
"🔴 ĐANG ĐÓNG";
});
