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
