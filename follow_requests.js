// ================================
// FOLLOW REQUEST (FIREBASE V8)
// ================================

import { db, auth } from "./firebase-init.js";
// ================================
// GỬI LỜI MỜI
// ================================

export async function sendFollowRequest(targetUid){

    if(!auth.currentUser) return false;

    const myUid = auth.currentUser.uid;

    if(myUid === targetUid) return false;

    const requestId = `${myUid}_${targetUid}`;

    const requestRef = db
        .collection("follow_requests")
        .doc(requestId);

    const requestSnap = await requestRef.get();

    if(requestSnap.exists){
        return false;
    }

    await requestRef.set({

        from: myUid,
        to: targetUid,
        status: "pending",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()

    });

   const notifyRef = db
    .collection("notifications")
    .doc(requestId);

await notifyRef.set({

    userId: targetUid,
    receiverId: targetUid,

    senderId: myUid,
    requestId: requestId,

    type: "follow_request",

    read: false,

    createdAt: firebase.firestore.FieldValue.serverTimestamp()

});
    return true;

}
// ================================
// DANH SÁCH LỜI MỜI
// ================================

export async function getMyFollowRequests(){

    if(!auth.currentUser) return [];

    const snap = await db
    .collection("follow_requests")
    .where("to","==",auth.currentUser.uid)
    .where("status","==","pending")
    .get();

    return snap.docs;
}

// ================================
// CHẤP NHẬN
// ================================

export async function acceptFollowRequest(requestId){

    const requestRef = db.collection("follow_requests").doc(requestId);

    const requestSnap = await requestRef.get();

    if(!requestSnap.exists) return;

    const { from, to } = requestSnap.data();

    const batch = db.batch();

    batch.set(
        db.collection("users").doc(from).collection("following").doc(to),
        { time: Date.now() },
        { merge:true }
    );

    batch.set(
        db.collection("users").doc(to).collection("followers").doc(from),
        { time: Date.now() },
        { merge:true }
    );

    batch.set(
        db.collection("users").doc(to).collection("following").doc(from),
        { time: Date.now() },
        { merge:true }
    );

    batch.set(
        db.collection("users").doc(from).collection("followers").doc(to),
        { time: Date.now() },
        { merge:true }
    );

    batch.update(
        db.collection("users").doc(from),
        {
            followingCount: firebase.firestore.FieldValue.increment(1),
            followerCount: firebase.firestore.FieldValue.increment(1),
            friendCount: firebase.firestore.FieldValue.increment(1)
        }
    );

    batch.update(
        db.collection("users").doc(to),
        {
            followingCount: firebase.firestore.FieldValue.increment(1),
            followerCount: firebase.firestore.FieldValue.increment(1),
            friendCount: firebase.firestore.FieldValue.increment(1)
        }
    );

    batch.delete(requestRef);
    batch.delete(
    db.collection("notifications").doc(requestId)
);
    await batch.commit();

}
// ================================
// TỪ CHỐI
// ================================

export async function rejectFollowRequest(requestId){

    await db.collection("follow_requests")
        .doc(requestId)
        .delete();

    await db.collection("notifications")
        .doc(requestId)
        .delete();

}

// ================================
// HỦY LỜI MỜI
// ================================

export async function cancelFollowRequest(targetUid){

    if(!auth.currentUser) return;

    const myUid = auth.currentUser.uid;

    const requestId = `${myUid}_${targetUid}`;

    await db
        .collection("follow_requests")
        .doc(requestId)
        .delete()
        .catch(()=>{});

    await db
        .collection("notifications")
        .doc(requestId)
        .delete()
        .catch(()=>{});

}
// ================================
// ĐÃ GỬI LỜI MỜI ?
// ================================

export async function hasPendingFollowRequest(targetUid){

    if(!auth.currentUser) return false;

    const requestId = `${auth.currentUser.uid}_${targetUid}`;

    const snap = await db
        .collection("follow_requests")
        .doc(requestId)
        .get();

    return snap.exists;

}
// ================================
// ĐÃ FOLLOW ?
// ================================

export async function isFollowing(targetUid){

    if(!auth.currentUser) return false;

    const snap = await db
    .collection("users")
    .doc(auth.currentUser.uid)
    .collection("following")
    .doc(targetUid)
    .get();

    return snap.exists;

}

// ================================
// KIỂM TRA BẠN BÈ
// ================================

export async function isFriend(targetUid){

    if(!auth.currentUser) return false;

    const myUid = auth.currentUser.uid;

    const meFollow = await db
    .collection("users")
    .doc(myUid)
    .collection("following")
    .doc(targetUid)
    .get();

    if(!meFollow.exists){
        return false;
    }

    const theyFollow = await db
    .collection("users")
    .doc(targetUid)
    .collection("following")
    .doc(myUid)
    .get();

    return theyFollow.exists;

}
