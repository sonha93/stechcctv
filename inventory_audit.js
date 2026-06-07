import { db } from "./firebase-init.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
    await getDocs(
        collection(db,"products")
    );

    snap.forEach(docSnap => {

        const p = docSnap.data();

        auditProducts.innerHTML += `

        <div class="audit-item">

            <h3>${p.name}</h3>

            <div>
                📦 Tồn hệ thống:
                <b>${p.stock || 0}</b>
            </div>

            <input
                type="number"
                placeholder="Nhập tồn thực tế"
                data-id="${docSnap.id}"
                class="actualStock"
            >

        </div>

        `;

    });

}
loadProducts();
