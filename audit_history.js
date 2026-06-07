import { db } from "./firebase-init.js";

async function loadAuditHistory(){

    const auditList =
    document.getElementById("auditList");

    auditList.innerHTML = "";

    const snap =
const snap =
await db
.collection("audit_entries")
.limit(50)
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

        <h3>
            ${d.productName}
        </h3>

        <div>
            Audit ID:
            <b>${d.auditId || "-"}</b>
        </div>

        <div>
            Thời gian:
            ${d.auditDateTime || "-"}
        </div>

        <div>
            Product ID:
            ${d.productId || "-"}
        </div>

        <hr>

        <div>
            Tồn hệ thống:
            <b>${d.systemStock}</b>
        </div>

        <div>
            Tồn thực tế:
            <b>${d.countedStock}</b>
        </div>

        <div class="${diffClass}">
            ${diffText}
        </div>

        <hr>

        <div>
            Giá nhập:
            ${Number(d.importPrice || 0).toLocaleString()}
        </div>

        <div>
            Giá bán:
            ${Number(d.salePrice || 0).toLocaleString()}
        </div>

        <hr>

        <div style="color:red">
            Giá trị thất thoát:
            ${Number(d.lossValue || 0).toLocaleString()}
        </div>

        <div style="color:red">
            Lợi nhuận thất thoát:
            ${Number(d.profitLossValue || 0).toLocaleString()}
        </div>

        <div style="color:green">
            Giá trị hàng dư:
            ${Number(d.extraValue || 0).toLocaleString()}
        </div>

        <div style="color:green">
            Lợi nhuận hàng dư:
            ${Number(d.extraProfitValue || 0).toLocaleString()}
        </div>

        <hr>

        <div style="
            font-weight:bold;
            font-size:18px;
        ">
            Tổng ảnh hưởng:
            ${Number(d.totalImpact || 0).toLocaleString()}
        </div>

    </div>

    `;

});
}

loadAuditHistory();
