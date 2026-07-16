// call/call-firebase.js

import { db } from "../firebase-init.js";


// =====================================
// CREATE CALL
// =====================================

export async function createCall(from, to, type = "audio") {

    const callData = {

        from,

        to,

        type,

        status: "calling",

        createdAt:
        firebase.firestore.FieldValue.serverTimestamp()

    };


    const ref =
    await db.collection("calls")
    .add(callData);


    return ref.id;

}



// =====================================
// LISTEN INCOMING CALL
// =====================================

export function listenIncomingCall(uid, callback) {

    let firstSnapshot = true;

    return db.collection("calls")

        .where("to","==",uid)

        .where("status","==","calling")

        .onSnapshot(snapshot=>{

            if(firstSnapshot){
                firstSnapshot = false;
                return;
            }

            snapshot.docChanges().forEach(change=>{

                if(change.type !== "added") return;

                callback({

                    id: change.doc.id,

                    ...change.doc.data()

                });

            });

        });

}
// =====================================
// LISTEN CALL STATUS
// =====================================

export function listenCallStatus(callId,callback){


    return db.collection("calls")

    .doc(callId)

    .onSnapshot(doc=>{


        if(!doc.exists)
        return;


        callback({

            id:doc.id,

            ...doc.data()

        });



    });


}





// =====================================
// ACCEPT CALL
// =====================================

export async function acceptCall(callId){


    return db.collection("calls")

    .doc(callId)

    .update({

        status:"accepted",

        acceptedAt:
        firebase.firestore.FieldValue.serverTimestamp()

    });


}



// =====================================
// REJECT CALL
// =====================================

export async function rejectCall(callId){


    return db.collection("calls")

    .doc(callId)

    .update({

        status:"rejected",

        endedAt:
        firebase.firestore.FieldValue.serverTimestamp()

    });



}


// =====================================
// UPDATE CALL STATUS
// =====================================

export async function updateCallStatus(callId, status){


    return db.collection("calls")

    .doc(callId)

    .update({

        status: status

    });


}

// =====================================
// END CALL
// =====================================

export async function endCall(callId){


    return db.collection("calls")

    .doc(callId)

    .update({

        status:"ended",

        endedAt:
        firebase.firestore.FieldValue.serverTimestamp()

    });


}




// =====================================
// BUSY
// =====================================

export async function busyCall(callId){


    return db.collection("calls")

    .doc(callId)

    .update({

        status:"busy"

    });



}





// =====================================
// DELETE CALL
// =====================================

export async function removeCall(callId){


    return db.collection("calls")

    .doc(callId)

    .delete();


}





// =====================================
// GET CALL INFO
// =====================================

export async function getCall(callId){


    const snap =
    await db.collection("calls")

    .doc(callId)

    .get();



    if(!snap.exists)
    return null;



    return {

        id:snap.id,

        ...snap.data()

    };


}
