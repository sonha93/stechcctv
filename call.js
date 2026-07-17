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
// ELEMENTa
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
const videoBox =
document.getElementById("videoBox");
if (localVideo) {

    let lastTap = 0;

    localVideo.addEventListener("touchend", (e) => {

        e.preventDefault();

        const now = Date.now();

        if (now - lastTap < 300) {

            switchCamera();

        }

        lastTap = now;

    }, { passive: false });

}
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
let currentFacingMode = "user";
let peer=null;

let muted=false;
let candidateUnsubscribe = null;

let callUnsubscribe = null;

let callTimeout = null;
let timer=null;

let seconds=0;
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
const callType = params.get("type") || "voice";
if (callType === "video") {
    document.body.classList.add("video-call");
} else {
    document.body.classList.add("voice-call");
}
const userName = params.get("name");
const userAvatar = params.get("avatar");
window.addEventListener("DOMContentLoaded", () => {
    const videoBox = document.getElementById("videoBox");

    if (videoBox && callType !== "video") {
        videoBox.style.display = "none";
    }
});
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
    document.body.classList.add("call-connected");

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

    document.body.classList.remove("call-connected");

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
                "stun:stun.relay.metered.ca:80"
            ]
        },

        {
            urls: [
                "turn:global.relay.metered.ca:80",
                "turn:global.relay.metered.ca:80?transport=tcp",
                "turn:global.relay.metered.ca:443",
                "turns:global.relay.metered.ca:443?transport=tcp"
            ],
            username: "abe1eee5863e2d36f4d1f02c",
            credential: "V+AEzR4I23Qa1Oh9"
        }

    ]

});



peer.ontrack = e => {

    const stream = e.streams[0];

    if (remoteVideo) {
        remoteVideo.srcObject = stream;
remoteVideo.autoplay = true;
remoteVideo.playsInline = true;
remoteVideo.muted = false;

remoteVideo.play().catch(console.error);
    }

    if (remoteAudio) {
        remoteAudio.srcObject = stream;
        remoteAudio.muted = false;
        remoteAudio.play().catch(() => {});
    }

};


peer.onicecandidate = e => {

    if (e.candidate) {

        addIceCandidate(
            callId,
            incoming ? "answer" : "offer",
            e.candidate.toJSON()
        );

    }

};
// ================================
// LISTEN REMOTE ICE
// ================================

candidateUnsubscribe =
listenIceCandidates(
    callId,
    incoming ? "offer" : "answer",
    async data=>{

        if(!peer)
        return;

        try{

            await peer.addIceCandidate(

                new RTCIceCandidate(
                    data.candidate
                )

            );

        }catch(e){

            console.error(
                "ICE ERROR",
                
            );

        }

    }
);
}

// ================================
// MIC
// ================================

async function openMedia() {

    localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video"
    });

   if (callType === "video" && localVideo) {

    localVideo.srcObject = localStream;
    localVideo.muted = true;
    localVideo.autoplay = true;
    localVideo.playsInline = true;

    localVideo.play().catch(console.error);
}
    localStream.getTracks().forEach(track => {
        peer.addTrack(track, localStream);
    });
}

async function switchCamera() {

    if (callType !== "video" || !localStream || !peer) return;

    currentFacingMode =
        currentFacingMode === "user"
        ? "environment"
        : "user";

    const newStream =
    await navigator.mediaDevices.getUserMedia({

        video: {
            facingMode: {
                exact: currentFacingMode
            }
        },

        audio: false

    }).catch(async () => {

        return navigator.mediaDevices.getUserMedia({

            video: {
                facingMode: currentFacingMode
            },

            audio: false

        });

    });

    const newVideoTrack =
    newStream.getVideoTracks()[0];

    const sender =
    peer.getSenders().find(s =>
        s.track &&
        s.track.kind === "video"
    );

    if (sender) {

        await sender.replaceTrack(newVideoTrack);

    }

    localStream
        .getVideoTracks()
        .forEach(t => t.stop());

    localStream.removeTrack(
        localStream.getVideoTracks()[0]
    );

    localStream.addTrack(newVideoTrack);

    localVideo.srcObject = localStream;

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
    const offer = await peer.createOffer();

await peer.setLocalDescription(offer);

await db.collection("calls")
.doc(callId)
.update({

    offer:{
        type: peer.localDescription.type,
        sdp: peer.localDescription.sdp
    }

});
candidateUnsubscribe =
listenIceCandidates(
    callId,
    "answer",
    async data => {

        try{

            await peer.addIceCandidate(
                new RTCIceCandidate(data.candidate)
            );

        }catch(e){

            console.error("ICE", e);

        }

    }
);
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



const answer =
await peer.createAnswer();

await peer.setLocalDescription(answer);

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
    "offer",
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


let speakerOff = false;

speakerBtn.onclick = () => {

    speakerOff = !speakerOff;

    if (remoteAudio) {
        remoteAudio.muted = speakerOff;
    }

    if (remoteVideo) {
        remoteVideo.muted = speakerOff;
    }

    speakerBtn.style.opacity = speakerOff ? "0.45" : "1";
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

        peer.close();

        peer=null;

    }

    document.body.classList.remove("call-connected");
    await endCall(callId);


    window.close();


};
