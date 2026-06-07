import { db } from "./firebase-init.js";

async function loadAuditHistory(){

    const auditList =
    document.getElementById("auditList");

    auditList.innerHTML = "";

    const snap =
await db
.collection("audit_entries")
.limit(500)
.get();

const audits = {};

snap.forEach(docSnap=>{

    const d = docSnap.data();

    if(!audits[d.auditId]){
        audits[d.auditId] = [];
    }

    audits[d.auditId].push(d);

});

Object.keys(audits)
.reverse()
.forEach(auditId=>{

    auditList.innerHTML += `

    <div style="
        background:#111;
        color:white;
        padding:15px;
        margin:20px 0 10px;
        border-radius:10px;
        font-size:18px;
        font-weight:bold;
    ">
        📋 KỲ KIỂM KÊ: ${auditId}
    </div>

    `;

    audits[auditId].forEach(d=>{
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

    <h3>${d.productName}</h3>

    <div class="audit-grid">

        <div class="audit-card">
            <span>Audit ID</span>
            <b>${d.auditId || "-"}</b>
        </div>

        <div class="audit-card">
            <span>Thời gian</span>
            <b>${d.auditDateTime || "-"}</b>
        </div>

        <div class="audit-card">
            <span>Product ID</span>
            <b>${d.productId || "-"}</b>
        </div>

        <div class="audit-card">
            <span>Tồn hệ thống</span>
            <b>${d.systemStock}</b>
        </div>

        <div class="audit-card">
            <span>Tồn thực tế</span>
            <b>${d.countedStock}</b>
        </div>

        <div class="audit-card">
            <span>Chênh lệch</span>
            <b class="${diffClass}">
                ${diffText}
            </b>
        </div>

        <div class="audit-card">
            <span>Giá nhập</span>
            <b>${Number(d.importPrice || 0).toLocaleString()}</b>
        </div>

        <div class="audit-card">
            <span>Giá bán</span>
            <b>${Number(d.salePrice || 0).toLocaleString()}</b>
        </div>

        <div class="audit-card">
            <span>Giá trị thất thoát</span>
            <b class="summary-loss">
                ${Number(d.lossValue || 0).toLocaleString()}
            </b>
        </div>

        <div class="audit-card">
            <span>Lợi nhuận thất thoát</span>
            <b class="summary-loss">
                ${Number(d.profitLossValue || 0).toLocaleString()}
            </b>
        </div>

        <div class="audit-card">
            <span>Giá trị hàng dư</span>
            <b class="summary-more">
                ${Number(d.extraValue || 0).toLocaleString()}
            </b>
        </div>

        <div class="audit-card">
            <span>Lợi nhuận hàng dư</span>
            <b class="summary-more">
                ${Number(d.extraProfitValue || 0).toLocaleString()}
            </b>
        </div>

    </div>

    <div class="summary-total">
        Tổng ảnh hưởng:
        ${Number(d.totalImpact || 0).toLocaleString()}
    </div>

</div>

`;

   });

});

}

loadAuditHistory();
