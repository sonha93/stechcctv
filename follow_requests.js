// ================================
// FOLLOW REQUEST
// ================================

import { app, auth } from "./auth.js";

import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    getDoc,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    setDoc,
    increment,
    serverTimestamp,
    documentId
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore(app);
export async function sendFollowRequest(targetUid){

    if(!auth.currentUser) return false;

    const myUid = auth.currentUser.uid;

    if(myUid === targetUid) return false;

    const old = await getDocs(

        query(

            collection(db,"follow_requests"),

            where("from","==",myUid),

            where("to","==",targetUid),

            where("status","==","pending")

        )

    );

    if(!old.empty){

        return false;

    }

    await addDoc(

        collection(db,"follow_requests"),

        {

            from:myUid,

            to:targetUid,

            status:"pending",

            createdAt:serverTimestamp()

        }

    );

    return true;

}
// ================================
// DANH SÁCH LỜI MỜI
// ================================

export async function getMyFollowRequests(){

    if(!auth.currentUser) return [];

    const snap = await getDocs(

        query(

            collection(db,"follow_requests"),

            where("to","==",auth.currentUser.uid),

            where("status","==","pending")

        )

    );

    return snap.docs;

}
// ================================
// CHẤP NHẬN
// ================================

export async function acceptFollowRequest(requestId){

    const requestRef = doc(db,"follow_requests",requestId);

    const requestSnap = await getDoc(requestRef);

    if(!requestSnap.exists()) return;

    const data = requestSnap.data();

    const fromUid = data.from;
    const toUid = data.to;

    // A following B
    await setDoc(

        doc(db,"users",fromUid,"following",toUid),

        {
            time:Date.now()
        }

    );

    // B followers
    await setDoc(

        doc(db,"users",toUid,"followers",fromUid),

        {
            time:Date.now()
        }

    );

    await updateDoc(

        doc(db,"users",fromUid),

        {
            followingCount:increment(1)
        }

    );

    await updateDoc(

        doc(db,"users",toUid),

        {
            followerCount:increment(1)
        }

    );

    await updateDoc(

        requestRef,

        {
            status:"accepted"
        }

    );

}
// ================================
// TỪ CHỐI
// ================================

export async function rejectFollowRequest(requestId){

    await updateDoc(

        doc(db,"follow_requests",requestId),

        {
            status:"rejected"
        }

    );

}

// ================================
// HỦY LỜI MỜI
// ================================

export async function cancelFollowRequest(targetUid){

    if(!auth.currentUser) return;

    const snap = await getDocs(

        query(

            collection(db,"follow_requests"),

            where("from","==",auth.currentUser.uid),

            where("to","==",targetUid),

            where("status","==","pending")

        )

    );

    for(const d of snap.docs){

        await deleteDoc(d.ref);

    }

}
// ================================
// ĐÃ GỬI LỜI MỜI?
// ================================

export async function hasPendingFollowRequest(targetUid){

    if(!auth.currentUser) return false;

    const snap = await getDocs(

        query(

            collection(db,"follow_requests"),

            where("from","==",auth.currentUser.uid),

            where("to","==",targetUid),

            where("status","==","pending")

        )

    );

    return !snap.empty;

}
// ================================
// ĐÃ FOLLOW?
// ================================

export async function isFollowing(targetUid){

    if(!auth.currentUser) return false;

    const snap = await getDoc(

        doc(
            db,
            "users",
            auth.currentUser.uid,
            "following",
            targetUid
        )

    );

    return snap.exists();

}
// ================================
// KIỂM TRA BẠN BÈ
// ================================

export async function isFriend(targetUid){

    if(!auth.currentUser) return false;

    const myUid = auth.currentUser.uid;

    const meFollow = await getDoc(

        doc(
            db,
            "users",
            myUid,
            "following",
            targetUid
        )

    );

    if(!meFollow.exists()) return false;

    const theyFollow = await getDoc(

        doc(
            db,
            "users",
            targetUid,
            "following",
            myUid
        )

    );

    return theyFollow.exists();

}
