console.log("DB =", db);
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

    try{

        console.log("LOAD");

        const snap =
        await getDocs(
            collection(db,"products")
        );

        console.log("SIZE =", snap.size);

    }
    catch(err){

        console.error("ERR =", err);

    }

}
loadProducts();
