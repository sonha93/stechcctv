import { db } from "../firebase-init.js";

export async function createMember(name, phone){

    const snapshot =
        await db.collection("members").get();

    const count = snapshot.size + 1;

    const memberCode =
        "TV" + String(count).padStart(5, "0");

    await db.collection("members").add({

        name,
        phone,

        memberCode,

        points: 0,

        totalSpent: 0,

        rank: "Member",

        createdAt:
            firebase.firestore.FieldValue.serverTimestamp()

    });

    return memberCode;
}
