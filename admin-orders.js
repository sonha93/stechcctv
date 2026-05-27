// admin-orders.js

import { rtdb } from "./firebase-init.js";
const ordersTable =
document.getElementById("ordersTable");

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

        const snapshot =
        await rtdb.ref("orders")
        .once("value");

        const orders = snapshot.val();

        if(!orders){

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

        Object.entries(orders)
        .reverse()
        .forEach(([orderId,order])=>{

            const status =
            order.status || "pending";

            const itemsHtml =
            (order.items || [])
            .map(item => `
                ${item.name} x${item.quantity}
            `)
            .join("<br>");

            const tr =
            document.createElement("tr");

            tr.innerHTML = `
                <td>${orderId}</td>

                <td>
                    ${order.customer || ""}
                    <br>
                    ${order.phone || ""}
                </td>

                <td>${itemsHtml}</td>

                <td>
                    ${(order.total || 0)
                    .toLocaleString()}đ
                </td>

                <td>
                    <span class="status ${status}">
                        ${status}
                    </span>
                </td>

                <td>
                    ${order.time || ""}
                </td>

                <td>-</td>
            `;

            ordersTable.appendChild(tr);

        });

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
   BIND BUTTONS
========================= */

function bindButtons(){

    /* CONFIRM */

    document
    .querySelectorAll(".confirm-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            async ()=>{

                button.disabled = true;

                button.innerText =
                "Đang xử lý...";

                const orderId =
                button.dataset.id;

                await confirmOrder(orderId);

            }
        );

    });

    /* CANCEL */

    document
    .querySelectorAll(".cancel-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            async ()=>{

                const orderId =
                button.dataset.id;

                await cancelOrder(orderId);

            }
        );

    });

}

/* =========================
   CONFIRM ORDER
========================= */

async function confirmOrder(orderId){

    try{

        const orderRef = db
        .collection("orders")
        .doc(orderId);

        await db.runTransaction(
            async(transaction)=>{

                const orderSnap =
                await transaction.get(orderRef);

                if(!orderSnap.exists){

                    throw new Error(
                        "Không tìm thấy đơn"
                    );
                }

                const order =
                orderSnap.data();

                /* CHẶN DOUBLE */

                if(
                    order.status !== "pending"
                ){

                    throw new Error(
                        "Đơn đã xử lý"
                    );
                }

                /* CHECK STOCK */

                for(
                    const item of order.items
                ){

                    const productRef = db
                    .collection("products")
                    .doc(item.id);

                    const productSnap =
                    await transaction.get(
                        productRef
                    );

                    if(!productSnap.exists){

                        throw new Error(
                            `Không tìm thấy sản phẩm "${item.name}"`
                        );
                    }

                    const product =
                    productSnap.data();

                    const currentStock =
                    product.stock || 0;

                    /* HẾT HÀNG */

                    if(
                        currentStock
                        < item.quantity
                    ){

                        throw new Error(
                            `"${item.name}" không đủ tồn kho`
                        );
                    }

                    /* UPDATE STOCK */

                    transaction.update(
                        productRef,
                        {

                            stock:
                                currentStock
                                - item.quantity,

                            sold:
                                firebase
                                .firestore
                                .FieldValue
                                .increment(
                                    item.quantity
                                )

                        }
                    );

                }

                /* UPDATE ORDER */

                transaction.update(
                    orderRef,
                    {

                        status:"confirmed"

                    }
                );

            }
        );

        alert("Đã xác nhận đơn");

        loadOrders();

    }catch(error){

        console.error(error);

        alert(
            error.message
            || "Lỗi xác nhận đơn"
        );
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

        const orderRef = db
        .collection("orders")
        .doc(orderId);

        const orderSnap =
        await orderRef.get();

        if(!orderSnap.exists){

            alert("Không tìm thấy đơn");

            return;
        }

        const order =
        orderSnap.data();

        if(
            order.status !== "pending"
        ){

            alert(
                "Không thể huỷ đơn này"
            );

            return;
        }

        await orderRef.update({

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
