// call/call-firebase.js

import { db } from "../firebase-init.js";

// Tạo cuộc gọi
export async function createCall(from, to, type) {

    const ref = await db.collection("calls").add({
        from,
        to,
        type,
        status: "calling",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return ref.id;
}

// Lắng nghe cuộc gọi đến
export function listenIncomingCall(uid, callback) {

    return db.collection("calls")
    .where("to", "==", uid)
    .where("status", "==", "calling")
    .onSnapshot(snapshot => {

        snapshot.docChanges().forEach(change => {

            if (change.type === "added") {

                callback({
                    id: change.doc.id,
                    ...change.doc.data()
                });

            }

        });

    });

}

// Cập nhật trạng thái
export async function updateCallStatus(callId, status) {

    return db.collection("calls")
    .doc(callId)
    .update({
        status
    });

}

// Xóa cuộc gọi
export async function removeCall(callId) {

    return db.collection("calls")
    .doc(callId)
    .delete();

}
