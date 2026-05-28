// admin-orders.js
import { rtdb } from "./firebase-init.js";

const ordersTable =
document.getElementById("ordersTable");

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

        console.log(orders);

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
        .forEach(([orderId, order]) => {

            const tr =
            document.createElement("tr");

            tr.innerHTML = `
                <td>${orderId}</td>

                <td>
                    ${order.customer || ""}
                    <br>
                    ${order.phone || ""}
                </td>

                <td>
                    ${Array.isArray(order.items)
                    ? order.items.length
                    : 0}
                    sản phẩm
                </td>

                <td>
                    ${order.status || ""}
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

loadOrders();
