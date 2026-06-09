import { db } from "./firebase-init.js";

async function createOfflineSale() {

    const customerName =
        document.getElementById("customerName").value.trim();

    const phone =
        document.getElementById("customerPhone").value.trim();

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
