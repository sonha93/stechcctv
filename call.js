// ================================
// CALL UI JS
// ================================

import { db } from "./firebase-init.js";
import {
    updateCallStatus,
    endCall,
    listenCallStatus,
    timeoutCall,
    addIceCandidate,
    listenIceCandidates
} from "./call/call-firebase.js";

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
const callingTone =
document.getElementById("callingTone");
const remoteAudio =
document.getElementById("remoteAudio");
const localVideo =
document.getElementById("localVideo");

const remoteVideo =
document.getElementById("remoteVideo");
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
let candidateUnsubscribe = null;

let callUnsubscribe = null;

let callTimeout = null;
let timer=null;

let seconds=0;
// ================================
// WEBRTC STATE
// ================================

let pendingCandidates = [];

let remoteDescriptionReady = false;

let answerListener = null;


// ================================
// WAIT ICE GATHERING
// ================================

function waitIceComplete() {

    return new Promise(resolve => {

        if (!peer) {

            resolve();

            return;

        }

        if (peer.iceGatheringState === "complete") {

            resolve();

            return;

        }

        const fn = () => {

            console.log(
                "ICE GATHERING:",
                peer.iceGatheringState
            );

            if (peer.iceGatheringState === "complete") {

                peer.removeEventListener(
                    "icegatheringstatechange",
                    fn
                );

                resolve();

            }

        };

        peer.addEventListener(
            "icegatheringstatechange",
            fn
        );

    });

}


// ================================
// APPLY PENDING ICE
// ================================

async function applyPendingCandidates() {

    while (pendingCandidates.length) {

        const c = pendingCandidates.shift();

        try {

            await peer.addIceCandidate(
                new RTCIceCandidate(c)
            );

        } catch (e) {

            console.error(
                "ADD PENDING ICE ERROR",
                e
            );

        }

    }

}
// ================================
// VIBRATION
// ================================

function startVibrate(){

    if(navigator.vibrate){

        navigator.vibrate([
    1000,
    500,
    1000,
    500,
    1000
]);
    

    }

}


function stopVibrate(){

    if(navigator.vibrate){

        navigator.vibrate(0);

    }

}


const params =
new URLSearchParams(location.search);
console.log(location.href);

const callId =
params.get("callId");
const incoming =
params.get("incoming")==="1";
const callType =
params.get("type") || "audio";
const userName = params.get("name");
const userAvatar = params.get("avatar");
callUnsubscribe =
listenCallStatus(callId, async (call) => {
    
    if(!call){
        return;
    }

    // NHẬN ANSWER TỪ BÊN KIA
    if (
    call.answer &&
    peer &&
    !peer.currentRemoteDescription
) {

    await peer.setRemoteDescription(
        new RTCSessionDescription(call.answer)
    );

    remoteDescriptionReady = true;

    await applyPendingCandidates();

}
    switch (call.status) {

     case "calling":

    if(incoming){
        callStatus.textContent = "Cuộc gọi đến";
    }else{
        callStatus.textContent = "Đang gọi...";
    }

break;
    case "accepted":

    ringtone.pause();

    if(callingTone){
        callingTone.pause();
    }


    // ẨN NÚT NHẬN / TỪ CHỐI
    acceptBtn.style.display = "none";
    rejectBtn.style.display = "none";


    // HIỆN MIC / LOA / KẾT THÚC
    muteBtn.style.display = "flex";
    speakerBtn.style.display = "flex";
    endBtn.style.display = "flex";


    if (!peer) {

        createPeer();

        await openMedia();

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


case "timeout":

    ringtone.pause();

    callStatus.textContent =
    "Không trả lời";


    setTimeout(()=>{

        window.close();

    },1000);


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

    iceServers: [

        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302"
            ]
        }

    ],

    iceCandidatePoolSize: 10

});
    peer.oniceconnectionstatechange = () => {

    console.log(
        "ICE:",
        peer.iceConnectionState
    );

    if (

        peer.iceConnectionState === "failed" ||

        peer.iceConnectionState === "disconnected"

    ) {

        try {

            peer.restartIce();

            console.log(
                "ICE RESTART"
            );

        } catch(e){

            console.error(e);

        }

    }

};



peer.onconnectionstatechange = () => {

    console.log(

        "CONNECTION:",

        peer.connectionState

    );

};



peer.onsignalingstatechange = () => {

    console.log(

        "SIGNALING:",

        peer.signalingState

    );

};



peer.onicegatheringstatechange = () => {

    console.log(

        "GATHER:",

        peer.iceGatheringState

    );

};

   

peer.ontrack = async e => {

    const stream = e.streams[0];

    console.log(
        "TRACK:",
        e.track.kind,
        e.track.readyState
    );

    e.track.onmute = () => {

        console.log(
            e.track.kind,
            "MUTED"
        );

    };

    e.track.onunmute = () => {

        console.log(
            e.track.kind,
            "UNMUTED"
        );

    };

    e.track.onended = () => {

        console.log(
            e.track.kind,
            "ENDED"
        );

    };

    if (remoteVideo) {

        remoteVideo.srcObject = stream;

        remoteVideo.autoplay = true;

        remoteVideo.playsInline = true;

        remoteVideo.muted = false;

        remoteVideo.onloadedmetadata = async () => {

            try {

                await remoteVideo.play();

            } catch(e){

                console.error(
                    "VIDEO PLAY",
                    e
                );

                setTimeout(()=>{

                    remoteVideo.play()
                    .catch(()=>{});

                },500);

            }

        };

    }

    if (remoteAudio) {

        remoteAudio.srcObject = stream;

        remoteAudio.autoplay = true;

        remoteAudio.muted = false;

        remoteAudio.play().catch(()=>{});

    }

};


peer.onicecandidate = e => {

    if(!e.candidate)
        return;

    console.log(
        "SEND ICE"
    );

    addIceCandidate(

        callId,

        e.candidate.toJSON()

    );

};
// ================================
// LISTEN REMOTE ICE
// ================================

candidateUnsubscribe =
listenIceCandidates(
    callId,
    async data=>{

        if(!peer)
            return;

        if(!remoteDescriptionReady){

            pendingCandidates.push(
                data.candidate
            );

            console.log(
                "QUEUE ICE"
            );

            return;

        }

        try{

            await peer.addIceCandidate(

                new RTCIceCandidate(
                    data.candidate
                )

            );

            console.log(
                "ICE ADDED"
            );

        }catch(e){

            console.error(
                "ICE ERROR",
                e
            );

        }

    }
);
// ================================
// MIC
// ================================

async function openMedia() {

   localStream = await navigator.mediaDevices.getUserMedia({

    audio: true,

    video: callType === "video"

});

console.log("LOCAL STREAM");
console.log(localStream);

console.log(
    "VIDEO:",
    localStream.getVideoTracks()
);

console.log(
    "AUDIO:",
    localStream.getAudioTracks()
);
   if (callType === "video" && localVideo) {

    localVideo.srcObject = localStream;
    localVideo.muted = true;
    localVideo.autoplay = true;
    localVideo.playsInline = true;

    localVideo.play().catch(console.error);
}
    localStream.getTracks().forEach(track => {

    console.log(
        "ADD TRACK:",
        track.kind
    );

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
if (incoming) {

    callStatus.textContent = "Cuộc gọi đến";
callTimeout = setTimeout(async()=>{

    const snap =
    await db.collection("calls")
    .doc(callId)
    .get();

    if(
        snap.exists &&
        snap.data().status==="calling"
    ){

        await timeoutCall(callId);

        ringtone.pause();

        window.close();

    }

},60000);
    startVibrate();

    if (ringtone) {
        ringtone.currentTime = 0;
        ringtone.loop = true;
        ringtone.play().catch(e => console.log(e));
    }

    acceptBtn.style.display = "flex";
    rejectBtn.style.display = "flex";
    endBtn.style.display = "none";

} else {

    callStatus.textContent = "Đang gọi...";

    if (callingTone) {
        callingTone.loop = true;
        callingTone.play().catch(() => {});
    }


    startCaller();


    acceptBtn.style.display = "none";
    rejectBtn.style.display = "none";


    // HIỆN NÚT KHI ĐANG GỌI
    muteBtn.style.display = "flex";
    speakerBtn.style.display = "flex";
    endBtn.style.display = "flex";

}

async function startCaller(){

    createPeer();

await openMedia();

    callTimeout =
    setTimeout(async()=>{

        const snap =
        await db.collection("calls")
        .doc(callId)
        .get();


        if(
            snap.exists &&
            snap.data().status==="calling"
        ){

            await timeoutCall(callId);

            window.close();

        }

},60000);
    const offer = await peer.createOffer({

    offerToReceiveAudio: true,

    offerToReceiveVideo: callType === "video"

});

await peer.setLocalDescription(offer);

// CHỜ ICE GATHERING HOÀN TẤT
await waitIceComplete();

await db.collection("calls")
.doc(callId)
.update({

    offer:{

        type: peer.localDescription.type,

        sdp: peer.localDescription.sdp

    }

});
}
// ================================
// ACCEPT
// ================================


acceptBtn.onclick =
async()=>{

  stopVibrate();
ringtone.pause();


if(!peer){

    createPeer();

}


await openMedia();



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


if(!offer){

    console.error(
        "Không có offer"
    );

    return;

}


await peer.setRemoteDescription(

    new RTCSessionDescription({

        type: offer.type,

        sdp: offer.sdp

    })

);

remoteDescriptionReady = true;

await applyPendingCandidates();

const answer =
await peer.createAnswer();

await peer.setLocalDescription(answer);

// CHỜ ICE GATHERING
await waitIceComplete();

await db.collection("calls")
.doc(callId)
.update({

    answer:{

        type: peer.localDescription.type,

        sdp: peer.localDescription.sdp

    }

});

candidateUnsubscribe =
listenIceCandidates(
    callId,
    async data=>{

        try{

            await peer.addIceCandidate(

                new RTCIceCandidate(
                    data.candidate
                )

            );

        }catch(e){

            console.error(
                "ICE ERROR",
                e
            );

        }

    }
);

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


if(!localStream){
    return;
}


muted = !muted;


localStream
.getAudioTracks()
.forEach(track=>{

    track.enabled = !muted;

});


muteBtn.style.opacity =
muted ? "0.45" : "1";


};




// ================================
// SPEAKER
// ================================


speakerBtn.onclick=()=>{


remoteVideo.muted =
!remoteVideo.muted;


remoteAudio.muted =
remoteVideo.muted;


speakerBtn.style.opacity =
remoteVideo.muted ? "0.45" : "1";


};



// ================================
// REJECT
// ================================


rejectBtn.onclick =
async()=>{

    stopVibrate();

ringtone.pause();
if(callingTone){
    callingTone.pause();
}

if(callTimeout){

    clearTimeout(callTimeout);

    callTimeout=null;

}


await updateCallStatus(

    callId,

    "rejected"

);


if(localStream){

    localStream
    .getTracks()
    .forEach(t=>t.stop());

    localStream=null;

}


if(peer){

    peer.close();

    peer=null;

}


window.close();


};




// ================================
// END
// ================================


endBtn.onclick =
async()=>{

 stopVibrate();
    ringtone.pause();
if(callingTone){
    callingTone.pause();
}

    if(timer){

        clearInterval(timer);

        timer=null;

    }


    if(callTimeout){

        clearTimeout(callTimeout);

        callTimeout=null;

    }


    if(candidateUnsubscribe){

        candidateUnsubscribe();

        candidateUnsubscribe=null;

    }


    if(callUnsubscribe){

        callUnsubscribe();

        callUnsubscribe=null;

    }


    if(localStream){

        localStream
        .getTracks()
        .forEach(t=>{

            t.stop();

        });

        localStream=null;

    }


    if(peer){

        peer.ontrack=null;

        peer.onicecandidate=null;
        pendingCandidates = [];

remoteDescriptionReady = false;
        peer.close();

        peer=null;

    }


    await endCall(callId);


    window.close();


};
