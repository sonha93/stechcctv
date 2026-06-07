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
    <div class="auditTableWrap">

    <table class="auditTable">

    <thead>
    <tr>
        <th>Sản phẩm</th>
        <th>Tồn HT</th>
        <th>Tồn TT</th>
        <th>Chênh lệch</th>
        <th>Giá nhập</th>
        <th>Giá bán</th>
        <th>Giá trị lệch</th>
        <th>Lợi nhuận lệch</th>
    </tr>
    </thead>

    <tbody>
    `;

    audits[auditId].forEach(d=>{

        auditList.innerHTML += `
        <tr>

            <td>${d.productName}</td>

            <td>${d.systemStock}</td>

            <td>${d.countedStock}</td>

            <td class="${
                d.difference > 0
                ? "more"
                : d.difference < 0
                ? "loss"
                : "good"
            }">
                ${d.difference}
            </td>

            <td>
                ${Number(d.importPrice || 0).toLocaleString()}
            </td>

            <td>
                ${Number(d.salePrice || 0).toLocaleString()}
            </td>

            <td>
                ${Number(
                    d.lossValue || d.extraValue || 0
                ).toLocaleString()}
            </td>

            <td>
                ${Number(
                    d.profitLossValue ||
                    d.extraProfitValue ||
                    0
                ).toLocaleString()}
            </td>

        </tr>
        `;
    });

    auditList.innerHTML += `
        </tbody>
        </table>
        </div>
    `;
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
