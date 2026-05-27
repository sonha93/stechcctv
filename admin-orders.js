// admin-orders.js


import { db } from "./firebase-init.js";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const ordersTable = document.getElementById("ordersTable");

/* =========================
   LOAD ORDERS
========================= */

async function loadOrders(){

    ordersTable.innerHTML = `
        <tr>
            <td colspan="7" class="empty">
                Đang tải đơn hàng...
            </td>
        </tr>
    `;

    try{

        const snapshot = await getDocs(
            collection(db,"orders")
        );

        if(snapshot.empty){

            ordersTable.innerHTML = `
                <tr>
                    <td colspan="7" class="empty">
                        Chưa có đơn hàng
                    </td>
                </tr>
            `;

            return;
        }

        ordersTable.innerHTML = "";

        snapshot.forEach(docSnap => {

            const order = docSnap.data();

            const orderId = docSnap.id;

            const status = order.status || "pending";

            const itemsHtml = (order.items || [])
            .map(item => `
                ${item.name} x${item.quantity}
            `)
            .join("<br>");

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${orderId}</td>

                <td>
                    ${order.name || "Không có tên"}<br>
                    ${order.phone || ""}
                </td>

                <td>${itemsHtml}</td>

                <td>
                    ${(order.total || 0).toLocaleString()}đ
                </td>

                <td>
                    <span class="status ${status}">
                        ${status}
                    </span>
                </td>

                <td>
                    ${order.createdAt || ""}
                </td>

                <td>

                    <div class="actions">

                        ${
                            status === "pending"
                            ? `
                                <button 
                                    class="confirm-btn"
                                    data-id="${orderId}"
                                >
                                    Xác nhận
                                </button>

                                <button 
                                    class="cancel-btn"
                                    data-id="${orderId}"
                                >
                                    Huỷ
                                </button>
                            `
                            : "-"
                        }

                    </div>

                </td>
            `;

            ordersTable.appendChild(tr);

        });

        bindButtons();

    }catch(error){

        console.error(error);

        ordersTable.innerHTML = `
            <tr>
                <td colspan="7" class="empty">
                    Lỗi tải đơn hàng
                </td>
            </tr>
        `;
    }
}

/* =========================
   BIND BUTTON EVENTS
========================= */

function bindButtons(){

    /* CONFIRM */

    document.querySelectorAll(".confirm-btn")
    .forEach(button => {

        button.addEventListener("click", async () => {

            const orderId = button.dataset.id;

            await confirmOrder(orderId);

        });

    });

    /* CANCEL */

    document.querySelectorAll(".cancel-btn")
    .forEach(button => {

        button.addEventListener("click", async () => {

            const orderId = button.dataset.id;

            await cancelOrder(orderId);

        });

    });

}

/* =========================
   CONFIRM ORDER
========================= */

async function confirmOrder(orderId){

    try{

        const orderRef = doc(db,"orders",orderId);

        const orderSnap = await getDoc(orderRef);

        if(!orderSnap.exists()){

            alert("Không tìm thấy đơn");

            return;
        }

        const order = orderSnap.data();
if(order.status !== "pending"){

    alert("Đơn đã xử lý");

    return;
}
        /* =========================
           CHECK + TRỪ STOCK
        ========================= */

        for(const item of order.items){

            const productRef = doc(
                db,
                "products",
                item.id
            );

            const productSnap = await getDoc(productRef);

            if(!productSnap.exists()) continue;

            const product = productSnap.data();

            const currentStock = product.stock || 0;

            /* HẾT HÀNG */

            if(currentStock < item.quantity){

                alert(
                    `Sản phẩm "${item.name}" không đủ tồn kho`
                );

                return;
            }

            /* UPDATE STOCK */

            await updateDoc(productRef,{

                stock: currentStock - item.quantity,

                sold: increment(item.quantity)

            });

        }

        /* =========================
           UPDATE ORDER STATUS
        ========================= */

        await updateDoc(orderRef,{

            status:"confirmed"

        });

        alert("Đã xác nhận đơn");

        loadOrders();

    }catch(error){

        console.error(error);

        alert("Lỗi xác nhận đơn");
    }
}

/* =========================
   CANCEL ORDER
========================= */

async function cancelOrder(orderId){

    const ok = confirm(
        "Bạn có chắc muốn huỷ đơn này ?"
    );

    if(!ok) return;

    try{

        const orderRef = doc(
            db,
            "orders",
            orderId
        );

        await updateDoc(orderRef,{

            status:"cancelled"

        });

        alert("Đã huỷ đơn");

        loadOrders();

    }catch(error){

        console.error(error);

        alert("Lỗi huỷ đơn");
    }
}

/* =========================
   START
========================= */

loadOrders();
