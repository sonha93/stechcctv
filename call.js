// ================================
// CALL UI JS
// ================================

import {
    updateCallStatus,
    endCall
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


const incoming =
params.get("incoming")==="1";
console.log("incoming =", incoming);
console.log("name =", params.get("name"));
console.log("avatar =", params.get("avatar"));

callName.textContent =
decodeURIComponent(
params.get("name") || "Người dùng"
);


callAvatar.src =
decodeURIComponent(
params.get("avatar") || "default-avatar.png"
);



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

    // Người gọi không được thấy nút bắt máy
    acceptBtn.style.display = "none";
    rejectBtn.style.display = "none";
    endBtn.style.display = "flex";

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



if(peer)

peer.close();



await endCall(callId);



window.close();


};
