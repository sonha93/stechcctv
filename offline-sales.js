import { db } from "./firebase-init.js";
window.currentCart = [];

let offlineProducts = [];
async function createOfflineSale() {

  const customerName =
document.getElementById("offlineCustomer").value.trim();

const phone =
document.getElementById("offlinePhone").value.trim();
    const items =
        window.currentCart || [];

    if (!items.length) {
        alert("Chưa có sản phẩm");
        return;
    }

    let total = 0;

    items.forEach(item => {
        total += Number(item.price || 0) * Number(item.qty || 0);
    });

    const orderData = {

        customerName:
            customerName || "Khách lẻ",

        phone:
            phone || "",

        address: "Mua tại cửa hàng",

        source: "offline",

        status: "completed",

        offlineSale: true,

        createdAt:
            firebase.firestore.FieldValue.serverTimestamp(),

        items,

        total,

        customerCancelled: false,

        adminCancelled: false
    };

    try {

        const orderRef =
            await db.collection("orders")
            .add(orderData);

        for (const item of items) {

            const productRef =
                db.collection("products")
                .doc(item.productId);

            const productDoc =
                await productRef.get();

            if (!productDoc.exists)
                continue;

            const product =
                productDoc.data();

            const currentStock =
                Number(product.stock || 0);

            const qty =
                Number(item.qty || 0);

            const newStock =
                currentStock - qty;

            await productRef.update({
                stock: newStock
            });

            await db.collection("sales_history").add({

                orderId:
                    orderRef.id,

                productId:
                    item.productId,

                productName:
                    item.name,

                qty,

                importPrice:
                    Number(product.importPrice || 0),

                sellPrice:
                    Number(item.price || 0),

                revenue:
                    Number(item.price || 0) * qty,

                capital:
                    Number(product.importPrice || 0) * qty,

                profit:
                    (Number(item.price || 0) -
                     Number(product.importPrice || 0)) * qty,

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            });

            await db.collection("stock_movements").add({

                productId:
                    item.productId,

                productName:
                    item.name,

                qty: -qty,

                type: "SALE",

                reason:
                    "Bán tại cửa hàng",

                stockAfter:
                    newStock,

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            });

        }

        alert("Đã tạo đơn bán offline");

        window.currentCart = [];

    } catch (err) {

        console.error(err);

        alert("Lỗi tạo đơn");

    }

}

window.createOfflineSale =
    createOfflineSale;
async function loadOfflineProducts(){

    const snap =
        await db.collection("products").get();

    offlineProducts =
        snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

}
document
.getElementById("offlineSearch")
.addEventListener("input", e => {

    const keyword =
        e.target.value.toLowerCase();

    const result =
        offlineProducts.filter(p =>
            (p.name || "")
            .toLowerCase()
            .includes(keyword)
        );

    document.getElementById(
        "offlineSearchResults"
    ).innerHTML = result.map(p => `

        <div
            onclick="addOfflineItem('${p.id}')"
            style="
                padding:10px;
                border:1px solid #ddd;
                margin-bottom:5px;
                cursor:pointer;
            "
        >
            ${p.name}
            - ${Number(p.price || 0).toLocaleString()}đ
            - Tồn ${p.stock || 0}
        </div>

    `).join("");

});
window.addOfflineItem = function(productId){

    const product =
        offlineProducts.find(
            x => x.id === productId
        );

    if(!product) return;

    const existed =
        window.currentCart.find(
            x => x.productId === productId
        );

    if(existed){

        existed.qty++;

    }else{

        window.currentCart.push({

            productId: product.id,

            name: product.name,

            price: product.price,

            qty: 1

        });

    }

    renderOfflineCart();

}
function renderOfflineCart(){

    let total = 0;

    document.getElementById(
        "offlineCart"
    ).innerHTML = window.currentCart.map(item => {

        total +=
            Number(item.price) *
            Number(item.qty);

        return `
            <div style="
                padding:10px;
                border-bottom:1px solid #ddd;
            ">
                ${item.name}
                x${item.qty}
                =
                ${(item.price * item.qty)
                    .toLocaleString()}đ
            </div>
        `;

    }).join("");

    document.getElementById(
        "offlineTotal"
    ).innerText =
        total.toLocaleString() + "đ";

}
loadOfflineProducts();
document
.getElementById("saveOfflineSale")
.addEventListener("click", createOfflineSale);
