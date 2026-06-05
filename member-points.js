import { db } from "../firebase-init.js";
import { calculateRank } from "./member-rank.js";

export async function earnPoints({

    memberId,
    amount,
    orderId

}){

    const earnPoints =
        Math.floor(amount / 1000);

    const memberRef =
        db.collection("members").doc(memberId);

    await db.runTransaction(async(transaction)=>{

        const memberDoc =
            await transaction.get(memberRef);

        const member =
            memberDoc.data();

        const newSpent =
            (member.totalSpent || 0) + amount;

        const newPoints =
            (member.points || 0) + earnPoints;

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

        type: "earn",

        amount,

        points: earnPoints,

        orderId,

        createdAt:
            firebase.firestore.FieldValue.serverTimestamp()

    });

}
