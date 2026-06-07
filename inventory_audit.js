
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
    placeholder="Số lượng đếm thực tế"
    data-id="${docSnap.id}"
    data-name="${p.name}"
    class="actualStock"
>

          <input
    type="number"
    placeholder="Nhập tồn thực tế"
    data-id="${docSnap.id}"
    data-name="${p.name}"
    class="actualStock"
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

        const counted =
        Number(row.value || 0);

        await db
        .collection("audit_entries")
        .add({

            productId:
            row.dataset.id,

            productName:
            row.dataset.name,

            countedStock:
            counted,

            createdAt:
            firebase.firestore.FieldValue.serverTimestamp()

        });

    }

    alert("Đã lưu kiểm kê");

});
