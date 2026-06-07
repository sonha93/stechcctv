import { db } from "./firebase-init.js";

async function loadAuditHistory(){

    const auditList =
    document.getElementById("auditList");

    auditList.innerHTML = "";

    const snap =
    await db
    .collection("audit_entries")
    .orderBy("createdAt","desc")
    .get();

    snap.forEach(docSnap=>{

        const d = docSnap.data();

        let diffClass = "good";
        let diffText = "Khớp";

        if(d.difference < 0){

            diffClass = "loss";
            diffText =
            `Thiếu ${Math.abs(d.difference)}`;

        }

        if(d.difference > 0){

            diffClass = "more";
            diffText =
            `Dư ${d.difference}`;

        }

        auditList.innerHTML += `

        <div class="audit-row">

            <b>${d.productName}</b>

            <div>
                Tồn hệ thống:
                ${d.systemStock}
            </div>

            <div>
                Tồn thực tế:
                ${d.countedStock}
            </div>

            <div class="${diffClass}">
                ${diffText}
            </div>

        </div>

        `;

    });

}

loadAuditHistory();
