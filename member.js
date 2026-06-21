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
    ${data.email || "-"}
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
                        colspan="8"
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
