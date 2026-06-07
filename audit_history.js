import { db } from "./firebase-init.js";

async function loadAuditHistory(){

    const auditList =
    document.getElementById("auditList");
  
    auditList.innerHTML = "";

 const snap =
await db
.collection("audit_entries")
.orderBy("createdAt","desc")
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

const auditIds =
Object.keys(audits).sort((a,b)=>{

    const timeA =
    audits[a][0]?.createdAt?.seconds || 0;

    const timeB =
    audits[b][0]?.createdAt?.seconds || 0;

    return timeB - timeA;

});
const auditSelect =
document.getElementById("auditSelect");

if(auditSelect){

    auditSelect.innerHTML = "";

    auditIds.forEach(id=>{

        auditSelect.innerHTML += `
            <option value="${id}">
                ${id}
            </option>
        `;

    });

}
if(auditIds.length === 0){
    auditList.innerHTML =
    "Chưa có dữ liệu kiểm kê";
    return;
}

let selectedAuditId =
auditIds[0];
auditList.innerHTML += `
<div style="
background:#111;
color:#fff;
padding:15px;
margin-bottom:15px;
border-radius:10px;
font-weight:bold;
font-size:18px;
">
📋 KỲ KIỂM KÊ:${selectedAuditId}
</div>
`;
 

    audits[selectedAuditId].forEach(d=>{
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

}

loadAuditHistory();
