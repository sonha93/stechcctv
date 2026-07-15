import { app, auth } from "./auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    query,
    where,
    serverTimestamp,
    doc,
setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore(app);
let followLock = false;
// ===============================
// FOLLOW
// ===============================

export async function followUser(targetUid) {

    if (followLock) return false;

    followLock = true;

    try {

        if (!auth.currentUser) return false;

        const myUid = auth.currentUser.uid;

        if (myUid === targetUid) return false;


        // đã follow thì không tạo thêm
       
        if (await isFollowing(targetUid)) {
            return true;
        }


        await setDoc(
    doc(db,"follows",`${myUid}_${targetUid}`),
    {
        fromUid: myUid,
        toUid: targetUid,
        createdAt: serverTimestamp()
    }
);

await setDoc(
    doc(db,"users",myUid,"following",targetUid),
    {
        uid: targetUid,
        createdAt: serverTimestamp()
    }
);


await setDoc(
    doc(db,"users",targetUid,"followers",myUid),
    {
        uid: myUid,
        createdAt: serverTimestamp()
    }
);
        await addDoc(collection(db,"notifications"),{

            receiverId: targetUid,
            senderId: myUid,
            type:"follow",
            read:false,
            createdAt:serverTimestamp()

        });


        return true;


    } finally {

        followLock = false;

    }

}

// ===============================
// UNFOLLOW
// ===============================

export async function unfollowUser(targetUid) {

    if (!auth.currentUser) return;

    await deleteDoc(
    doc(
        db,
        "follows",
        `${auth.currentUser.uid}_${targetUid}`
    )
);
await deleteDoc(
    doc(
        db,
        "users",
        auth.currentUser.uid,
        "following",
        targetUid
    )
);


await deleteDoc(
    doc(
        db,
        "users",
        targetUid,
        "followers",
        auth.currentUser.uid
    )
);
}

// ===============================
// ĐÃ FOLLOW?
// ===============================

export async function isFollowing(targetUid) {

    if (!auth.currentUser) return false;

    const q = query(
        collection(db, "follows"),
        where("fromUid", "==", auth.currentUser.uid),
        where("toUid", "==", targetUid)
    );

    const snap = await getDocs(q);

    return !snap.empty;
}

// ===============================
// DANH SÁCH FOLLOW
// ===============================

export async function loadMyFollow(uid) {

    const q = query(
        collection(db, "follows"),
        where("fromUid", "==", uid)
    );

    const snap = await getDocs(q);

    return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

// ===============================
// ĐẾM FOLLOW
// ===============================

export async function getFollowerCount(uid){

    const snap = await getDocs(
        collection(db,"users",uid,"followers")
    );

    return snap.size;
}
export async function getFollowingCount(uid){

    const snap = await getDocs(
        collection(db,"users",uid,"following")
    );

    return snap.size;
}
