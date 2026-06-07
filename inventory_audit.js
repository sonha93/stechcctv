
import { db } from "./firebase-init.js";


let auditOpen = false;

const auditStatus =
document.getElementById("auditStatus");

document
.getElementById("openAudit")
.addEventListener("click",()=>{

    auditOpen = true;

    auditStatus.innerHTML =
    "🟢 ĐANG MỞ KIỂM KÊ";

});

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

            <h3>${p.name}</h3>

            <div class="audit-name">
    ${p.name}
</div>

<input
    type="number"
    class="actualStock"
    data-id="${docSnap.id}"
    data-name="${p.name}"
    data-system="${p.stock || 0}"
    placeholder="Số lượng đếm thực tế"
>

        </div>

        `;

    });

}
loadProducts();
document
.getElementById("submitAudit")
.addEventListener("click", async ()=>{

    if(!auditOpen){

        alert("Chưa mở kiểm kê");

        return;
    }

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

await db
.collection("audit_entries")
.add({

    productId: row.dataset.id,

    productName: row.dataset.name,

    systemStock,

    countedStock: counted,

    difference:
        counted - systemStock,

    createdAt:
    firebase.firestore.FieldValue.serverTimestamp()

});

    }

    alert("Đã lưu kiểm kê");
    auditOpen = false;

auditStatus.innerHTML =
"🔴 ĐANG ĐÓNG";
});
