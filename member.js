// ============================
// MEMBER SYSTEM
// ============================

import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    getDoc,
    query,
    where,
    orderBy,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-init.js";

// ============================
// CREATE MEMBER
// ============================

window.createMember = async function(){

    const name =
        document.getElementById("memberName")
        ?.value
        .trim();

    const phone =
        document.getElementById("memberPhone")
        ?.value
        .trim();

    if(!name || !phone){

        alert("Nhập thiếu dữ liệu");
        return;

    }

    try{

        await addDoc(
            collection(db,"members"),
            {
                name,
                phone,
                points:0,
                totalSpent:0,
                level:"Thường",
                createdAt:serverTimestamp()
            }
        );

        alert("Đã tạo member");

        loadMembers();

    }catch(err){

        console.log(err);

    }

};

// ============================
// LOAD MEMBERS
// ============================

window.loadMembers = async function(){

    const tbody =
        document.getElementById("memberBody");

    if(!tbody) return;

    try{

        const snap =
            await getDocs(
                collection(db,"members")
            );

        let html = "";

        snap.forEach(docSnap=>{

            const data =
                docSnap.data();

            html += `
                <tr>

                    <td>
                        ${docSnap.id}
                    </td>

                    <td>
                        ${data.name || "-"}
                    </td>

                    <td>
                        ${data.phone || "-"}
                    </td>

                    <td>
                        ${data.points || 0}
                    </td>

                    <td>
                        ${formatVND(
                            data.totalSpent || 0
                        )}
                    </td>

                    <td>
                        ${data.level || "Thường"}
                    </td>

                  <td>

    <button
        onclick="giftPoints('${docSnap.id}')"
    >
        🎁 Tặng điểm
    </button>
        <button onclick="showMemberHistory('${docSnap.id}')">
📜 Lịch sử
</button>
    <button
        onclick="
            deleteMember(
                '${docSnap.id}'
            )
        "
    >
        Xóa
    </button>

</td>

                </tr>
            `;

        });

        if(!html){

            html = `
                <tr>
                    <td
                        colspan="7"
                        style="
                            text-align:center;
                            padding:20px;
                        "
                    >
                        Chưa có member
                    </td>
                </tr>
            `;

        }

        tbody.innerHTML = html;

    }catch(err){

        console.log(err);

    }

};

// ============================
// DELETE MEMBER
// ============================

window.deleteMember = async function(id){

    const ok =
        confirm("Xóa member?");

    if(!ok) return;

    try{

        await deleteDoc(
            doc(db,"members",id)
        );

        loadMembers();

    }catch(err){

        console.log(err);

    }

};

// ============================
// ADD POINTS
// ============================

window.addPointsToMember =
async function(memberId,orderTotal){

    try{

        const ref =
            doc(db,"members",memberId);

        const snap =
            await getDoc(ref);

        if(!snap.exists()) return;

        const data =
            snap.data();

        const oldPoints =
            Number(data.points || 0);

        const oldSpent =
            Number(data.totalSpent || 0);

        // 10k = 1 point
        const addPoints =
            Math.floor(
                orderTotal / 10000
            );

        const newPoints =
            oldPoints + addPoints;

        const newSpent =
            oldSpent + orderTotal;

        // LEVEL
        let level = "Thường";

        if(newSpent >= 5000000){

            level = "Kim Cương";

        }else if(newSpent >= 2000000){

            level = "Vàng";

        }else if(newSpent >= 500000){

            level = "Bạc";

        }

        await updateDoc(
            ref,
            {
                points:newPoints,
                totalSpent:newSpent,
                level
            }
        );

    }catch(err){

        console.log(err);

    }

};

// ============================
// FIND MEMBER BY PHONE
// ============================

window.findMemberByPhone =
async function(phone){

    try{

        const snap =
            await getDocs(
                collection(db,"members")
            );

        let found = null;

        snap.forEach(docSnap=>{

            const data =
                docSnap.data();

            if(
                String(data.phone)
                ===
                String(phone)
            ){

                found = {
                    id:docSnap.id,
                    ...data
                };

            }

        });

        return found;

    }catch(err){

        console.log(err);
        return null;

    }

};
// ==========================
// SWITCH TAB
// ==========================

const memberRadio =
    document.querySelector(
        'input[value="member"]'
    );

const memberSection =
    document.getElementById(
        "memberSection"
    );

if(memberRadio){

    memberRadio.addEventListener(
        "change",
        ()=>{

            if(memberRadio.checked){

                memberSection.style.display =
                    "block";

                loadMembers();

            }

        }
    );

}
// ============================
// GIFT POINTS
// ============================

window.giftPoints = async function(memberId){

    const input = prompt("Nhập số điểm muốn tặng:");

    if(input === null) return;

    const points = Number(input);

    if(isNaN(points) || points <= 0){

        alert("Điểm không hợp lệ");
        return;

    }

    try{

        const ref = doc(db,"members",memberId);

        const snap = await getDoc(ref);

        if(!snap.exists()) return;

        const data = snap.data();

        await updateDoc(ref,{
            points:Number(data.points || 0) + points
        });

        await addDoc(collection(db,"member_history"),{
            memberId,
            type:"gift_points",
            points,
            createdAt:serverTimestamp()
        });

        alert("Đã tặng " + points + " điểm");

        loadMembers();

    }catch(err){

        console.log(err);
        alert("Lỗi tặng điểm");

    }

};
window.showMemberHistory = async function(memberId){

    const box = document.getElementById("memberHistoryBox");
    const tbody = document.getElementById("memberHistoryBody");

    if(!box || !tbody) return;

    box.style.display = "block";

    tbody.innerHTML =
    "<tr><td colspan='8'>Đang tải...</td></tr>";

    const q = query(
        collection(db,"member_history"),
        where("memberId","==",memberId),
        orderBy("createdAt","desc")
    );

    const snap = await getDocs(q);

    let html="";

    snap.forEach(docSnap=>{

        const h=docSnap.data();

        html+=`
        <tr>

        <td>${
        h.orderDate
        ? new Date(h.orderDate).toLocaleString("vi-VN")
        : "-"
        }</td>

        <td>${
        (h.items||[])
        .map(i=>`${i.name} x${i.qty}`)
        .join("<br>")
        }</td>

        <td>${formatVND(h.subtotal||0)}</td>

        <td>${h.usedPoints||0}</td>

        <td>${formatVND(h.discountAmount||0)}</td>

        <td>${formatVND(h.total||0)}</td>

        <td>${h.earnPoints||0}</td>

        <td>${h.remainPoints||0}</td>

        </tr>
        `;
    });

    if(!html){

        html="<tr><td colspan='8'>Chưa có lịch sử</td></tr>";

    }

    tbody.innerHTML=html;

}
    tbody.innerHTML = html;

    document.getElementById("memberHistoryBox").style.display="block";

};
