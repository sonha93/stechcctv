import { db } from "../firebase-init.js";
import { calculateRank } from "./member-rank.js";

export async function refundPoints({

    memberId,
    refundAmount,
    orderId

}){

    const minusPoints =
        Math.floor(refundAmount / 1000);

    const memberRef =
        db.collection("members").doc(memberId);

    await db.runTransaction(async(transaction)=>{

        const memberDoc =
            await transaction.get(memberRef);

        const member =
            memberDoc.data();

        const currentPoints =
            member.points || 0;

        const currentSpent =
            member.totalSpent || 0;

        const newPoints =
            Math.max(0, currentPoints - minusPoints);

        const newSpent =
            Math.max(0, currentSpent - refundAmount);

        const newRank =
            calculateRank(newSpent);

        transaction.update(memberRef, {

            points: newPoints,

            totalSpent: newSpent,

            rank: newRank

        });

    });

    await db.collection("member_points_history").add({

        memberId,

        type: "refund",

        amount: refundAmount,

        points: -minusPoints,

        orderId,

        createdAt:
            firebase.firestore.FieldValue.serverTimestamp()

    });

}
