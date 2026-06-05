import { db } from "../firebase-init.js";
import { earnPoints } from "../members/member-points.js";

export async function confirmOrder(orderId){

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

    if(order.status === "confirmed"){
        alert("Đơn đã xác nhận");
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
                (product.stock || 0) - item.qty;

            transaction.update(productRef, {
                stock: newStock
            });

        });

    }

    await orderRef.update({

        status: "confirmed",

        confirmedAt:
            firebase.firestore.FieldValue.serverTimestamp()

    });

    if(order.memberId){

        await earnPoints({

            memberId: order.memberId,

            amount: order.total,

            orderId

        });

    }

    alert("Xác nhận đơn thành công");

}
