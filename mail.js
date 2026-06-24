// ======================================
// MAIL SYSTEM V1
// mail.js
// ======================================

const db = firebase.firestore();
const auth = firebase.auth();

const mailPopup =
    document.getElementById("mailPopup");

const mailList =
    document.getElementById("mailList");

const closeMailPopup =
    document.getElementById("closeMailPopup");

const mailIcon =
    document.getElementById("mailIcon");

const mailBadge =
    document.getElementById("mailBadge");

let currentUser = null;

let unreadCount = 0;

let unsubscribeMail = null;

// ======================================
// FORMAT DATE
// ======================================

function formatMailDate(timestamp){

    if(!timestamp){
        return "-";
    }

    try{

        return timestamp
            .toDate()
            .toLocaleString("vi-VN");

    }catch(err){

        return "-";

    }

}

// ======================================
// OPEN POPUP
// ======================================

function openMailPopup(){

    if(!mailPopup){
        return;
    }

    mailPopup.style.display = "flex";

}

// ======================================
// CLOSE POPUP
// ======================================

function closeMail(){

    if(!mailPopup){
        return;
    }

    mailPopup.style.display = "none";

}

if(closeMailPopup){

    closeMailPopup.onclick = closeMail;

}

if(mailPopup){

    mailPopup.addEventListener("click",(e)=>{

        if(e.target === mailPopup){

            closeMail();

        }

    });

}

// ======================================
// BADGE
// ======================================

function updateBadge(count){

    unreadCount = count;

    if(!mailBadge){
        return;
    }

    if(count <= 0){

        mailBadge.style.display = "none";
        mailBadge.innerHTML = "";

        return;

    }

    mailBadge.style.display = "flex";

    mailBadge.innerHTML =
        count > 99
        ? "99+"
        : count;

}

// ======================================
// RENDER EMPTY
// ======================================

function renderEmpty(){

    mailList.innerHTML = `

        <div class="mail-empty">

            Không có thông báo

        </div>

    `;

}

// ======================================
// FIREBASE LOGIN
// ======================================

auth.onAuthStateChanged(user=>{

    if(!user){

        currentUser = null;

        renderEmpty();

        updateBadge(0);

        return;

    }

    currentUser = user;

    startMailListener();

});

// ======================================
// REALTIME
// ======================================

function startMailListener(){

    if(!currentUser){
        return;
    }

    if(unsubscribeMail){

        unsubscribeMail();

    }

    unsubscribeMail = db
        .collection("notifications")
        .where(
            "userId",
            "==",
            currentUser.uid
        )
        .orderBy(
            "createdAt",
            "desc"
        )
        .onSnapshot(snapshot=>{

            let html = "";

            let unread = 0;

            if(snapshot.empty){

                renderEmpty();

                updateBadge(0);

                return;

            }

            snapshot.forEach(doc=>{

                const data = doc.data();

                if(!data.read){

                    unread++;

                }

                html += renderMailItem(
                    doc.id,
                    data
                );

            });

            mailList.innerHTML = html;

            updateBadge(unread);

            bindMailEvents();

        });

}

// ======================================
// RENDER ITEM
// ======================================

function renderMailItem(id,data){

    return `

<div
class="mail-item ${data.read ? "" : "unread"}"
data-id="${id}"
>

<div class="mail-subject">

${data.title || "Thông báo"}

</div>

<div class="mail-time">

${formatMailDate(data.createdAt)}

</div>

<div class="mail-content">

${data.message || ""}

</div>

</div>

`;

}
// ======================================
// BIND CLICK EVENT
// ======================================

function bindMailEvents(){

    document
        .querySelectorAll(".mail-item")
        .forEach(item=>{

            if(item.dataset.bound){
                return;
            }

            item.dataset.bound = "true";

            item.addEventListener("click",async()=>{

                const id =
                    item.dataset.id;

                await openMail(id);

            });

        });

}

// ======================================
// OPEN MAIL
// ======================================

async function openMail(mailId){

    try{

        const doc =
            await db
            .collection("notifications")
            .doc(mailId)
            .get();

        if(!doc.exists){

            alert("Thông báo không tồn tại");

            return;

        }

        const data =
            doc.data();

        // Đánh dấu đã đọc

        if(!data.read){

            await db
                .collection("notifications")
                .doc(mailId)
                .update({

                    read:true

                });

        }

        showMailContent(data);

    }catch(err){

        console.log(err);

        alert(err.message);

    }

}

// ======================================
// SHOW DETAIL
// ======================================

function showMailContent(data){

    const old =
        document.getElementById(
            "mailDetailPopup"
        );

    if(old){

        old.remove();

    }

    const popup =
        document.createElement("div");

    popup.id =
        "mailDetailPopup";

    popup.style.position = "fixed";
    popup.style.left = "0";
    popup.style.top = "0";
    popup.style.right = "0";
    popup.style.bottom = "0";
    popup.style.background = "rgba(0,0,0,.45)";
    popup.style.display = "flex";
    popup.style.alignItems = "center";
    popup.style.justifyContent = "center";
    popup.style.zIndex = "999999";

    popup.innerHTML = `

<div
style="
width:700px;
max-width:95%;
background:#fff;
border-radius:12px;
overflow:hidden;
box-shadow:0 15px 40px rgba(0,0,0,.25);
"
>

<div
style="
background:#111;
color:#fff;
padding:15px 20px;
display:flex;
justify-content:space-between;
align-items:center;
"
>

<b>

${data.title || "Thông báo"}

</b>

<button
id="closeMailDetail"
style="
border:none;
background:none;
color:#fff;
font-size:22px;
cursor:pointer;
"
>

✕

</button>

</div>

<div
style="
padding:20px;
line-height:1.8;
max-height:70vh;
overflow:auto;
white-space:pre-line;
"
>

<div
style="
color:#888;
font-size:13px;
margin-bottom:15px;
"
>

${formatMailDate(data.createdAt)}

</div>

${data.message || ""}

</div>

</div>

`;

    document.body.appendChild(popup);

    document
        .getElementById(
            "closeMailDetail"
        )
        .onclick = ()=>{

            popup.remove();

        };

    popup.onclick=(e)=>{

        if(e.target===popup){

            popup.remove();

        }

    };

}

// ======================================
// OPEN FROM ICON
// ======================================

if(mailIcon){

    mailIcon.addEventListener("click",()=>{

        openMailPopup();

    });

}

// ======================================
// CLOSE BY ESC
// ======================================

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        closeMail();

        const detail =
            document.getElementById(
                "mailDetailPopup"
            );

        if(detail){

            detail.remove();

        }

    }

});

// ======================================
// AUTO SCROLL TOP
// ======================================

function scrollMailTop(){

    if(mailList){

        mailList.scrollTop = 0;

    }

}
// ======================================
// SEND NOTIFICATION
// ======================================

async function sendNotification({

    userId,

    title,

    message,

    type = "SYSTEM",

    orderId = "",

    productId = "",

    productName = ""

}){

    try{

        if(!userId){
            return;
        }

        await db
            .collection("notifications")
            .add({

                userId,

                title,

                message,

                type,

                orderId,

                productId,

                productName,

                read:false,

                createdAt:
                    firebase
                    .firestore
                    .FieldValue
                    .serverTimestamp()

            });

    }catch(err){

        console.log(err);

    }

}

// ======================================
// RETURN APPROVED
// ======================================

async function sendReturnApprovedMail(order){

    if(!order){
        return;
    }

    let text = "";

    text +=
`Yêu cầu trả hàng của bạn đã được chấp nhận.

`;

    text +=
`Mã đơn: ${order.id || "-"}

`;

    text +=
`Ngày mua: ${order.orderDate || "-"}

`;

    text +=
"Sản phẩm:\n\n";

    (order.items || []).forEach(item=>{

        text +=
`${item.name}

Số lượng: ${item.qty}

Đơn giá: ${Number(item.price || 0).toLocaleString("vi-VN")}đ

----------------------------

`;

    });

    text +=
`Tổng tiền:

${Number(order.total || 0).toLocaleString("vi-VN")}đ

`;

    text +=
"Vui lòng chờ hệ thống hoàn tiền.";

    await sendNotification({

        userId:
            order.userId,

        title:
            "Đã chấp nhận trả hàng",

        message:
            text,

        type:
            "RETURN_APPROVED",

        orderId:
            order.id

    });

}

// ======================================
// RETURN REJECTED
// ======================================

async function sendReturnRejectedMail(

    order,

    reason

){

    if(!order){
        return;
    }

    let text = "";

    text +=
`Yêu cầu trả hàng của bạn đã bị từ chối.

`;

    text +=
`Mã đơn: ${order.id || "-"}

`;

    text +=
`Ngày mua:

${order.orderDate || "-"}

`;

    text +=
"Sản phẩm:\n\n";

    (order.items || []).forEach(item=>{

        text +=
`${item.name}

Số lượng: ${item.qty}

Đơn giá: ${Number(item.price || 0).toLocaleString("vi-VN")}đ

----------------------------

`;

    });

    text +=
`Tổng tiền:

${Number(order.total || 0).toLocaleString("vi-VN")}đ

`;

    text +=
"Lý do từ chối:\n\n";

    text +=
reason || "Không có";

    await sendNotification({

        userId:
            order.userId,

        title:
            "Từ chối trả hàng",

        message:
            text,

        type:
            "RETURN_REJECTED",

        orderId:
            order.id

    });

}

// ======================================
// NEW ORDER
// ======================================

async function sendOrderSuccessMail(order){

    if(!order){
        return;
    }

    let text = "";

    text +=
"Cảm ơn bạn đã đặt hàng.\n\n";

    text +=
`Mã đơn:

${order.id}

`;

    text +=
"Sản phẩm:\n\n";

    (order.items || []).forEach(item=>{

        text +=
`${item.name}

SL: ${item.qty}

${Number(item.price).toLocaleString("vi-VN")}đ

------------------------

`;

    });

    text +=
`Tổng thanh toán:

${Number(order.total).toLocaleString("vi-VN")}đ`;

    await sendNotification({

        userId:
            order.userId,

        title:
            "Đặt hàng thành công",

        message:
            text,

        type:
            "ORDER_SUCCESS",

        orderId:
            order.id

    });

}

// ======================================
// CANCEL ORDER
// ======================================

async function sendOrderCancelMail(

    order,

    reason

){

    if(!order){
        return;
    }

    await sendNotification({

        userId:
            order.userId,

        title:
            "Đơn hàng đã bị hủy",

        message:

`Đơn hàng ${order.id}

đã bị hủy.

Lý do:

${reason || "-"}`,

        type:
            "ORDER_CANCEL",

        orderId:
            order.id

    });

}

// ======================================
// POINTS
// ======================================

async function sendPointMail(

    userId,

    point,

    content

){

    await sendNotification({

        userId,

        title:
            "Điểm thành viên",

        message:

`${content}

Điểm thay đổi:

${point}`,

        type:
            "POINT"

    });

}

// ======================================
// PROMOTION
// ======================================

async function sendPromotionMail(

    userId,

    title,

    content

){

    await sendNotification({

        userId,

        title,

        message:content,

        type:"PROMOTION"

    });

}
