import { app, auth } from "./auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore(app);

// ===============================
// FOLLOW
// ===============================

export async function followUser(targetUid) {

    if (!auth.currentUser) return false;

    if (auth.currentUser.uid === targetUid) return false;

    if (await isFollowing(targetUid)) return true;

  await addDoc(collection(db, "follows"), {

    fromUid: auth.currentUser.uid,
    toUid: targetUid,
    createdAt: serverTimestamp()

});


await addDoc(collection(db,"notifications"),{

    receiverId: targetUid,
    senderId: auth.currentUser.uid,
    type:"follow",
    read:false,
    createdAt: serverTimestamp()

});
    return true;
}

// ===============================
// UNFOLLOW
// ===============================

export async function unfollowUser(targetUid) {

    if (!auth.currentUser) return;

    const q = query(
        collection(db, "follows"),
        where("fromUid", "==", auth.currentUser.uid),
        where("toUid", "==", targetUid)
    );

    const snap = await getDocs(q);

    for (const docSnap of snap.docs) {
        await deleteDoc(docSnap.ref);
    }
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

export async function getFollowCount(uid) {

    const q = query(
        collection(db, "follows"),
        where("fromUid", "==", uid)
    );

    const snap = await getDocs(q);

    return snap.size;
}
