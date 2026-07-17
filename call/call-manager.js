// ================================
// CALL MANAGER JS
// CONNECT ALL CALL SYSTEM
// ================================


import {
    createCall,
    listenIncomingCall,
    listenCallStatus,
    updateCallStatus,
    removeCall,
    saveOffer,
    saveAnswer,
    listenSignal,
    addIceCandidate,
    listenIceCandidates
}
from "./call-firebase.js";


import {
    getAudioStream,
    getVideoStream,
    createPeer,
    onRemoteStream,
    onIceCandidate,
    closeMedia
}
from "./call-media.js";


// ================================
// DATA
// ================================

let db = null;
let auth = null;
let conversationId = null;
let currentUser = null;

let currentCallId = null;

let peer = null;

let callStartTime = 0;
let callAccepted = false;
let callStatus = "missed";
// ================================
// INIT
// ================================

export function initCallSystem(data){


    db = data.db;

    auth = data.auth;

    conversationId =
    data.conversationId;

    currentUser =
    data.currentUser;



   



   const audioBtn = document.querySelector("#audioCallBtn");


if (!audioBtn) {

    console.log("KHÔNG CÓ NÚT GỌI");

} else {

    audioBtn.onclick = () => {

        console.log("ĐÃ BẤM GỌI");

        startCall("audio");

    };

}
listenIncomingCall(currentUser.uid, incomingCall);    
}
    
// ================================
// START CALL
// ================================

async function startCall(type){


    const conv =
    await db
    .collection("conversations")
    .doc(conversationId)
    .get();



    const otherUid =
    conv.data()
    .members
    .find(
        uid=>uid!==currentUser.uid
    );



    currentCallId =
    await createCall(
        currentUser.uid,
        otherUid,
        type
    );
    // ================================
// TỰ ĐỘNG KẾT THÚC SAU 60 GIÂY NẾU KHÔNG BẮT MÁY
// ================================

setTimeout(async ()=>{

    if(!callAccepted && currentCallId){

        console.log("Không bắt máy sau 60s - kết thúc");

        callStatus = "missed";

        await removeCall(currentCallId);

        closeMedia();

        currentCallId = null;

    }

},60000);
callAccepted = false;
callStatus = "missed";
callStartTime = Date.now();
// MỞ GIAO DIỆN CUỘC GỌI

const userSnap = await db
.collection("users")
.doc(otherUid)
.get();

const userData = userSnap.exists ? userSnap.data() : {};

const userName =
    userData.name ||
    userData.displayName ||
    userData.username ||
    "Người dùng";

const userAvatar =
    userData.avatar ||
    userData.photoURL ||
    userData.photo ||
    userData.image ||
    "default-avatar.png";


window.open(
    `call.html?uid=${otherUid}&callId=${currentCallId}&name=${encodeURIComponent(userName)}&avatar=${encodeURIComponent(userAvatar)}&incoming=0&type=${type}`,
    "callWindow",
    "width=420,height=700"
);

    if(type==="video"){

        await getVideoStream();

    }else{

        await getAudioStream();

    }



    peer =
    createPeer();



    onRemoteStream(
        stream=>{

            const audio =
            document.getElementById(
                "remoteAudio"
            );

            if(audio){

                audio.srcObject =
                stream;

            }

        }
    );



    onIceCandidate(candidate=>{

    addIceCandidate(currentCallId, candidate);

});

}

// ================================
// INCOMING CALL
// ================================
async function incomingCall(call){

    currentCallId = call.id;

    const userSnap = await db
        .collection("users")
        .doc(call.from)
        .get();

    const userData = userSnap.exists ? userSnap.data() : {};

    const userName =
        userData.name ||
        userData.displayName ||
        userData.username ||
        "Người dùng";

    const userAvatar =
        userData.avatar ||
        userData.photoURL ||
        userData.photo ||
        userData.image ||
        "default-avatar.png";

    window.open(
        `call.html?uid=${call.from}&callId=${currentCallId}&name=${encodeURIComponent(userName)}&avatar=${encodeURIComponent(userAvatar)}&incoming=1&type=${call.type}`,
        "callWindow",
        "width=420,height=700"
    );

    console.log("Có cuộc gọi đến", call);

    const accept = document.getElementById("acceptBtn");

    if (accept) {

        accept.onclick = async () => {
callAccepted = true;
callStatus = "ended";
callStartTime = Date.now();
            await updateCallStatus(currentCallId,"accepted");

            if(call.type==="video"){
                await getVideoStream();
            }else{
                await getAudioStream();
            }

            peer = createPeer();

        };

    }

    const reject = document.getElementById("rejectBtn");

    if (reject) {

        reject.onclick = async () => {
callStatus = "rejected";
            await updateCallStatus(currentCallId,"rejected");

            await removeCall(currentCallId);

        };

    }

}


// ================================
// END CALL
// ================================

// ================================
// END CALL
// ================================

export async function endCall() {

    if (!currentCallId) {
        closeMedia();
        return;
    }

    const duration = callAccepted
        ? Math.floor((Date.now() - callStartTime) / 1000)
        : 0;

    let text = "";

    if (callStatus === "rejected") {

        text = "📞 Cuộc gọi đã từ chối";

    } else if (callStatus === "missed") {

        text = "📞 Cuộc gọi nhỡ";

    } else {

        text = "📞 Cuộc gọi đi";

    }

    await db
        .collection("conversations")
        .doc(conversationId)
        .collection("messages")
        .add({

            senderId: currentUser.uid,

            type: "call",

            callType: "audio",

            status: callStatus,

            text: text,

            duration: duration,

            createdAt: firebase.firestore.Timestamp.now(),

            seenBy: [currentUser.uid]

        });

    await removeCall(currentCallId);

    closeMedia();

    currentCallId = null;

    callAccepted = false;
}
