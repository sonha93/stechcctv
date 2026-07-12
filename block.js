// block.js

import { db } from "./firebase-init.js";

export async function isBlocked(myUid, otherUid){

    if(!myUid || !otherUid){

        return{
            iBlocked:false,
            blockedMe:false
        };

    }

    const [mySnap, otherSnap] = await Promise.all([

        db.collection("users")
        .doc(myUid)
        .get(),

        db.collection("users")
        .doc(otherUid)
        .get()

    ]);

    const myBlock =

        mySnap.exists
        ? (mySnap.data().blockedUsers || [])
        : [];

    const otherBlock =

        otherSnap.exists
        ? (otherSnap.data().blockedUsers || [])
        : [];

    return{

        iBlocked: myBlock.includes(otherUid),

        blockedMe: otherBlock.includes(myUid)

    };

}
