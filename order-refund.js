import { db } from "../firebase-init.js";
import { refundPoints } from "../members/member-refund.js";

export async function refundOrder(orderId){

    const orderRef =
        db.collection("orders").doc(orderId);

    const orderSnap =
        await orderRef.get();

    if(!orderSnap.exists){
        alert("Không tìm thấy đơn");
        return;
    }

    const order =
        orderSnap.data();

    if(order.status === "refunded"){
        alert("Đơn đã hoàn");
        return;
    }

    for(const item of order.items){

        const productRef =
            db.collection("products").doc(item.productId);

        await db.runTransaction(async(transaction)=>{

            const productDoc =
                await transaction.get(productRef);

            const product =
                productDoc.data();

            const newStock =
                (product.stock || 0) + item.qty;

            transaction.update(productRef, {
                stock: newStock
            });

        });

    }

    await orderRef.update({

        status: "refunded",

        refundedAt:
            firebase.firestore.FieldValue.serverTimestamp()

    });

    if(order.memberId){

        await refundPoints({

            memberId: order.memberId,

            refundAmount: order.total,

            orderId

        });

    }

    alert("Hoàn đơn thành công");

}
