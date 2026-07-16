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

    status:"calling",

    offer:null,

    answer:null,

    createdAt:
    firebase.firestore.FieldValue.serverTimestamp(),

    acceptedAt:null,

    endedAt:null

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

export async function updateCallStatus(callId,status){

    const data={

        status

    };

    if(status==="accepted"){

        data.acceptedAt=
        firebase.firestore.FieldValue.serverTimestamp();

    }

    if(

        status==="ended" ||

        status==="rejected" ||

        status==="busy" ||

        status==="timeout"

    ){

        data.endedAt=
        firebase.firestore.FieldValue.serverTimestamp();

    }

    return db.collection("calls")

    .doc(callId)

    .update(data);

}

// =====================================
// END CALL
// =====================================

export async function endCall(callId){

    await updateCallStatus(
        callId,
        "ended"
    );

    return removeCall(callId);

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
// =====================================
// SAVE OFFER
// =====================================

export async function saveOffer(callId, offer){

    return db.collection("calls")

    .doc(callId)

    .update({

        offer

    });

}



// =====================================
// SAVE ANSWER
// =====================================

export async function saveAnswer(callId, answer){

    return db.collection("calls")

    .doc(callId)

    .update({

        answer

    });

}



// =====================================
// LISTEN SIGNAL (OFFER / ANSWER)
// =====================================

export function listenSignal(callId, callback){

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
// ADD ICE CANDIDATE
// =====================================

export async function addIceCandidate(callId, candidate){

    return db.collection("calls")

    .doc(callId)

    .collection("candidates")

    .add(candidate);

}



// =====================================
// LISTEN ICE CANDIDATES
// =====================================

export function listenIceCandidates(callId, callback){

    return db.collection("calls")

    .doc(callId)

    .collection("candidates")

    .onSnapshot(snapshot=>{

        snapshot.docChanges().forEach(change=>{

            if(change.type !== "added")
            return;

            callback(change.doc.data());

        });

    });

}
// =====================================
// CALL TIMEOUT
// =====================================

export async function timeoutCall(callId){

    return db.collection("calls")

    .doc(callId)

    .update({

        status:"timeout",

        endedAt:
        firebase.firestore.FieldValue.serverTimestamp()

    });

}
// =====================================
// ADD ICE CANDIDATE
// =====================================

export async function addIceCandidate(
    callId,
    candidate
){

    return db.collection("calls")
    .doc(callId)
    .collection("candidates")
    .add({

        candidate:
        candidate

    });

}



// =====================================
// LISTEN ICE CANDIDATES
// =====================================

export function listenIceCandidates(
    callId,
    callback
){

    return db.collection("calls")
    .doc(callId)
    .collection("candidates")
    .onSnapshot(snapshot=>{


        snapshot.docChanges()
        .forEach(change=>{


            if(change.type !== "added")
            return;


            callback(
                change.doc.data()
            );


        });


    });

}
