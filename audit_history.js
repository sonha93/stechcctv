import { db } from "./firebase-init.js";
async function loadAuditStatus(){

    const auditDoc =
    await db.collection("system")
    .doc("audit")
    .get();

    const auditOpen =
    auditDoc.data()?.auditOpen || false;

    const auditStatus =
    document.getElementById("auditStatus");

    auditStatus.innerHTML =
    auditOpen
    ? "🟢 ĐANG MỞ KIỂM KÊ"
    : "🔴 ĐANG ĐÓNG KIỂM KÊ";

}
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
function renderAudit(auditId, audits, auditList){

    auditList.innerHTML = `
    <div style="
    background:#111;
    color:#fff;
    padding:15px;
    margin-bottom:15px;
    border-radius:10px;
    font-weight:bold;
    font-size:18px;
    ">
    📋 KỲ KIỂM KÊ: ${auditId}
    </div>
    `;

    audits[auditId].forEach(d=>{

        let diffClass = "good";
        let diffText = "Khớp";

        if(d.difference < 0){
            diffClass = "loss";
            diffText = `- ${Math.abs(d.difference)}`;
        }

        if(d.difference > 0){
            diffClass = "more";
            diffText = `+ ${d.difference}`;
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
snap.forEach(docSnap=>{

    const d = docSnap.data();

    if(!audits[d.auditId]){
        audits[d.auditId] = [];
    }

    audits[d.auditId].push(d);

});

const auditIds = Object.keys(audits).sort((a,b)=>{

    const timeA = Math.max(
        ...audits[a].map(x => x.createdAt?.seconds || 0)
    );

    const timeB = Math.max(
        ...audits[b].map(x => x.createdAt?.seconds || 0)
    );

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

renderAudit(
    selectedAuditId,
    audits,
    auditList
);

if(auditSelect){
    auditSelect.addEventListener("change",(e)=>{
        renderAudit(
            e.target.value,
            audits,
            auditList
        );
    });
}

  

document
.getElementById("latestAudit")
.addEventListener("click",()=>{

    auditSelect.value = auditIds[0];

    renderAudit(
        auditIds[0],
        audits,
        auditList
    );

});

document
.getElementById("searchAudit")
.addEventListener("click",()=>{

    const date =
    document
    .getElementById("auditDateFilter")
    .value;

    if(!date){
        alert("Chọn ngày");
        return;
    }

    const key =
    date.replaceAll("-","");

    const found =
    auditIds.find(id=>id.includes(key));

    if(!found){
        alert("Không tìm thấy");
        return;
    }

    auditSelect.value = found;

    renderAudit(
        found,
        audits,
        auditList
    );

});

    }

loadAuditHistory();
const openAuditBtn = document.getElementById("openAudit");
const closeAuditBtn = document.getElementById("closeAudit");
if(openAuditBtn){

  openAuditBtn.addEventListener("click",async ()=>{

        try{

            await db.collection("system")
.doc("audit")
.set({
    auditOpen:true
});

alert("Đã mở kiểm kê");

loadAuditStatus();

        }catch(err){

            console.log(err);
            alert(err.message);

        }

    });

}
if(closeAuditBtn){

   closeAuditBtn.addEventListener("click",async ()=>{

        try{

          await db.collection("system")
.doc("audit")
.set({
    auditOpen:false
});

alert("Đã đóng kiểm kê");

loadAuditHistory();
loadAuditStatus();

        }catch(err){

            console.log(err);
            alert(err.message);

        }

    });

}
