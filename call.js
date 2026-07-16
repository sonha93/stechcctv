// ================================
// CALL UI JS
// ================================

import { db } from "./firebase-init.js";

import {
    updateCallStatus,
    endCall,
    listenCallStatus
} from "./call-firebase.js";

// ================================
// ELEMENT
// ================================

const callAvatar =
document.getElementById("callAvatar");

const callName =
document.getElementById("callName");

const callStatus =
document.getElementById("callStatus");

const callTimer =
document.getElementById("callTimer");
if(callTimer){
    callTimer.textContent = "";
}
const ringtone =
document.getElementById("ringtone");

const remoteAudio =
document.getElementById("remoteAudio");

const muteBtn =
document.getElementById("muteBtn");

const speakerBtn =
document.getElementById("speakerBtn");

const acceptBtn =
document.getElementById("acceptBtn");

const rejectBtn =
document.getElementById("rejectBtn");

const endBtn =
document.getElementById("endBtn");



// ================================
// DATA
// ================================

let localStream=null;

let peer=null;

let muted=false;

let timer=null;

let seconds=0;



const params =
new URLSearchParams(location.search);
console.log(location.href);

const callId =
params.get("callId");

listenCallStatus(callId, async (call) => {

    // NHẬN ANSWER TỪ BÊN KIA
    if (
        call.answer &&
        peer &&
        !peer.currentRemoteDescription
    ) {

        await peer.setRemoteDescription(
            new RTCSessionDescription(call.answer)
        );

    }

    switch (call.status) {

        case "calling":
    callStatus.textContent = "";
break;
        case "accepted":

            ringtone.pause();

            if (!peer) {
                createPeer();
                await openMic();
            }

            callStatus.textContent = "Đã kết nối";

            if (!timer)
                startTimer();

            break;

        case "rejected":

            ringtone.pause();

            callStatus.textContent = "Đã từ chối";

            setTimeout(() => {
                window.close();
            }, 1000);

            break;

        case "ended":

            ringtone.pause();

            clearInterval(timer);

            callStatus.textContent = "Cuộc gọi kết thúc";

            if (localStream)
                localStream.getTracks().forEach(t => t.stop());

            if (peer)
                peer.close();

            setTimeout(() => {
                window.close();
            }, 1000);

            break;

        case "busy":

            ringtone.pause();

            callStatus.textContent = "Máy bận";

            setTimeout(() => {
                window.close();
            }, 1000);

            break;

    }

});

const incoming =
params.get("incoming")==="1";
const userName = params.get("name");
const userAvatar = params.get("avatar");

if(userName){
    callName.textContent = decodeURIComponent(userName);
}

if(userAvatar){
    callAvatar.src = decodeURIComponent(userAvatar);
}
callAvatar.onerror = () => {
    callAvatar.src = "./default-avatar.png";
};


// ================================
// WEBRTC
// ================================


function createPeer(){


peer = new RTCPeerConnection({

    iceServers:[

        {
        urls:
        "stun:stun.l.google.com:19302"
        }

    ]

});



peer.ontrack=e=>{

    remoteAudio.srcObject =
    e.streams[0];

};



peer.onicecandidate=e=>{


if(e.candidate){


db.collection("calls")
.doc(callId)
.collection("candidates")
.add({

candidate:
e.candidate.toJSON()

});


}


};



db.collection("calls")
.doc(callId)
.collection("candidates")
.onSnapshot(snapshot => {

    snapshot.docChanges().forEach(async change => {

        if (change.type !== "added") return;

        try {

            await peer.addIceCandidate(
                new RTCIceCandidate(
                    change.doc.data().candidate
                )
            );

        } catch (e) {
            console.error(e);
        }

    });

});

}

// ================================
// MIC
// ================================


async function openMic(){


localStream =
await navigator.mediaDevices.getUserMedia({

audio:true

});


localStream
.getTracks()
.forEach(track=>{

peer.addTrack(
track,
localStream
);

});


}



// ================================
// TIMER
// ================================


function startTimer(){


timer=setInterval(()=>{


seconds++;


callTimer.textContent =

String(
Math.floor(seconds/60)
).padStart(2,"0")

+":"

+
String(seconds%60)
.padStart(2,"0");


},1000);


}



// ================================
// INCOMING
// ================================


// ================================
// INCOMING
// ================================
if (incoming) {

    callStatus.textContent = "Cuộc gọi đến";

    acceptBtn.style.display = "flex";
    rejectBtn.style.display = "flex";
    endBtn.style.display = "none";

} else {

    callStatus.textContent = "Đang gọi...";

    ringtone.play().catch(() => {});

    startCaller();

    acceptBtn.style.display = "none";
    rejectBtn.style.display = "none";
    endBtn.style.display = "flex";

}

async function startCaller(){

    createPeer();

    await openMic();

    const offer = await peer.createOffer();

    await peer.setLocalDescription(offer);

    await db.collection("calls")
    .doc(callId)
    .update({
        offer
    });

    db.collection("calls")
    .doc(callId)
    .onSnapshot(async snap=>{

        const data = snap.data();

        if(
            data &&
            data.answer &&
            !peer.currentRemoteDescription
        ){

            await peer.setRemoteDescription(
                new RTCSessionDescription(data.answer)
            );

        }

    });

}

// ================================
// ACCEPT
// ================================


acceptBtn.onclick =
async()=>{


ringtone.pause();


createPeer();


await openMic();



await updateCallStatus(
callId,
"accepted"
);



const offerSnap =
await db.collection("calls")
.doc(callId)
.get();



const offer =
offerSnap.data().offer;



await peer.setRemoteDescription(
new RTCSessionDescription(offer)
);



const answer =
await peer.createAnswer();


await peer.setLocalDescription(answer);



await db.collection("calls")
.doc(callId)
.update({

answer:
answer

});

db.collection("calls")
.doc(callId)
.collection("candidates")
.onSnapshot(snapshot => {

    snapshot.docChanges().forEach(async change => {

        if (change.type !== "added") return;

        try {

            await peer.addIceCandidate(
                new RTCIceCandidate(
                    change.doc.data().candidate
                )
            );

        } catch(e){}

    });

});

acceptBtn.style.display="none";

rejectBtn.style.display="none";

endBtn.style.display="flex";


callStatus.textContent =
"Đã kết nối";


startTimer();


};




// ================================
// MUTE
// ================================


muteBtn.onclick=()=>{


if(!localStream)
return;


muted=!muted;


localStream
.getAudioTracks()
.forEach(t=>{

t.enabled=!muted;

});


muteBtn.style.opacity =
muted?.45:1;


};




// ================================
// SPEAKER
// ================================


speakerBtn.onclick=()=>{


remoteAudio.muted =
!remoteAudio.muted;


speakerBtn.style.opacity =
remoteAudio.muted?.45:1;


};




// ================================
// REJECT
// ================================


rejectBtn.onclick=
async()=>{


ringtone.pause();


await updateCallStatus(
callId,
"rejected"
);


window.close();


};




// ================================
// END
// ================================


endBtn.onclick=
async()=>{


ringtone.pause();


clearInterval(timer);



if(localStream)

localStream
.getTracks()
.forEach(t=>t.stop());



if(peer){

peer.ontrack = null;
peer.onicecandidate = null;
peer.close();
peer = null;

}



await endCall(callId);



window.close();


};
