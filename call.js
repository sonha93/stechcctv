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



peer.onicecandidate = e => {

    if(e.candidate){

        addIceCandidate(
            callId,
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
    endBtn.style.display = "flex";

}

async function startCaller(){

    createPeer();

    await openMic();


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
    const offer =
await peer.createOffer();


await peer.setLocalDescription(
    offer
);


await db.collection("calls")
.doc(callId)
.update({

    offer:{
        type:offer.type,
        sdp:offer.sdp
    }

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

  stopVibrate();
ringtone.pause();


if(!peer){

    createPeer();

}


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


await peer.setLocalDescription(
    answer
);


await db.collection("calls")
.doc(callId)
.update({

answer:{

    type:answer.type,

    sdp:answer.sdp

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


    await endCall(callId);


    window.close();


};
