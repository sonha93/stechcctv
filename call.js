// ================================
// CALL UI JS
// ================================

import { auth, db } from "./firebase-init.js";
import {
    updateCallStatus
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

let localStream = null;

let muted = false;

let speaker = true;

let timer = null;

let seconds = 0;


// ================================
// URL PARAM
// ================================

const params =
new URLSearchParams(location.search);

const uid =
params.get("uid");
const callId =
params.get("callId");
const name =
params.get("name") ||
"Người dùng";

const avatar =
params.get("avatar") ||
"default-avatar.png";

const incoming =
params.get("incoming") === "1";


// ================================
// LOAD
// ================================

callName.textContent =
decodeURIComponent(name);

callAvatar.src =
decodeURIComponent(avatar);


// ================================
// STATUS
// ================================

if(incoming){

    callStatus.textContent =
    "Cuộc gọi đến";

}else{

    callStatus.textContent =
    "Đang gọi...";

    ringtone.play().catch(()=>{});

}


// ================================
// TIMER
// ================================

function startTimer(){

    clearInterval(timer);

    seconds = 0;

    timer = setInterval(()=>{

        seconds++;

        const m =
        String(Math.floor(seconds/60))
        .padStart(2,"0");

        const s =
        String(seconds%60)
        .padStart(2,"0");

        callTimer.textContent =
        `${m}:${s}`;

    },1000);

}


// ================================
// MICROPHONE
// ================================

if(muteBtn){

muteBtn.onclick = ()=>{

    if(!localStream)
    return;

    muted =
    !muted;

    localStream
    .getAudioTracks()
    .forEach(track=>{

        track.enabled =
        !muted;

    });

    muteBtn.style.opacity =
    muted ? .45 : 1;

};

}




// ================================
// SPEAKER
// ================================

if(speakerBtn){

speakerBtn.onclick = ()=>{

    speaker =
    !speaker;

    remoteAudio.muted =
    !speaker;

    speakerBtn.style.opacity =
    speaker ? 1 : .45;

};

}


// ================================
// ACCEPT
// ================================

acceptBtn.onclick =
async()=>{

    ringtone.pause();


   await updateCallStatus(
    callId,
    "accepted"
);


    try{

        localStream =
        await navigator
        .mediaDevices
        .getUserMedia({

            audio:true

        });

    }catch(e){

        alert("Không cấp quyền microphone.");

        return;

    }


    acceptBtn.style.display =
    "none";

    rejectBtn.style.display =
    "none";

    endBtn.style.display =
    "flex";

    callStatus.textContent =
    "Đã kết nối";

    startTimer();

};


// ================================
// REJECT
// ================================

rejectBtn.onclick = async()=>{

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

endBtn.onclick = ()=>{

    ringtone.pause();

    clearInterval(timer);

    if(localStream){

        localStream
        .getTracks()
        .forEach(track=>{

            track.stop();

        });

    }

    window.close();

};


// ================================
// UNLOAD
// ================================

window.addEventListener(
"beforeunload",
()=>{

    if(localStream){

        localStream
        .getTracks()
        .forEach(track=>{

            track.stop();

        });

    }

});
