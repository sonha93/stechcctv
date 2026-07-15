// ===============================
// Upload State
// ===============================
import {
    db,
    auth,
    FieldValue
} from "./firebase-init.js";
let uploadTask = null;

let isUploading = false;
const CLOUD_NAME = "dmz9gpp1b";
const UPLOAD_PRESET = "stech_up";
// ===============================
// Voice Recorder
// HTML + CSS + JS
// Firebase v8 Ready
// ===============================

let mediaRecorder = null;
let audioChunks = [];
let audioBlob = null;

let timer = null;
let seconds = 0;
// ===============================
// RESET TIMER
// ===============================
function resetTimer() {

    clearInterval(timer);

    timer = null;
    seconds = 0;

    const timeEl = document.getElementById("recordTime");

    if (timeEl) {
        timeEl.textContent = "00:00";
    }
}
// ===============================
// State
// ===============================

let mediaStream = null;
// ===============================
// Audio Wave
// ===============================

let audioContext = null;

let analyser = null;

let sourceNode = null;

let animationFrame = null;

let dataArray = null;
let isRecording = false;

let isPaused = false;

const MAX_RECORD_SECONDS = 300;


const openBtn = document.getElementById("openRecorderBtn");
const panel = document.getElementById("voicePanel");

const recordTime = document.getElementById("recordTime");

const cancelBtn = document.getElementById("cancelRecordBtn");
const sendBtn = document.getElementById("sendRecordBtn");
const audio = document.createElement("audio");
const waveCanvas = document.getElementById("waveCanvas");

const waveCtx = waveCanvas 
    ? waveCanvas.getContext("2d") 
    : null;
// ===============================
// Open
// ===============================

if (openBtn) {
    openBtn.addEventListener("click", startRecorder);
}

// ===============================
// Timer
// ===============================

function startTimer(){

    clearInterval(timer);

    timer = setInterval(()=>{

        if(!isRecording) return;

        seconds++;

        if(seconds>=MAX_RECORD_SECONDS){

         mediaRecorder.stop();

            return;

        }

        const m = String(
            Math.floor(seconds/60)
        ).padStart(2,"0");

        const s = String(
            seconds%60
        ).padStart(2,"0");

     if(recordTime){
    recordTime.textContent=`${m}:${s}`;
}

    },1000);

}

// ===============================
// Recorder
// ===============================

async function startRecorder(){

    if(isRecording) return;

    if(
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ){

        alert("Trình duyệt không hỗ trợ ghi âm.");

        return;

    }

    try{

       mediaStream = await navigator.mediaDevices.getUserMedia({
    audio:true
});
audioContext=new AudioContext();
if(audioContext.state==="suspended"){

    await audioContext.resume();

}
sourceNode=

audioContext.createMediaStreamSource(

    mediaStream

);

analyser=

audioContext.createAnalyser();

analyser.fftSize=256;

sourceNode.connect(analyser);

dataArray=

new Uint8Array(

    analyser.frequencyBinCount

);

drawWave();
        audioChunks = [];

        audioBlob = null;

        resetTimer();
        if(!window.MediaRecorder){

    alert("Trình duyệt không hỗ trợ ghi âm");

    return;

}
        mediaRecorder = new MediaRecorder(mediaStream);

        mediaRecorder.ondataavailable = (e)=>{

            if(e.data && e.data.size>0){

                audioChunks.push(e.data);

            }

        };

       

        mediaRecorder.onerror=(err)=>{

            console.error(err);

            cleanupRecorder();
            
        };
       
           isRecording = true;

        mediaRecorder.start(200);

        isPaused = false;

      panel.classList.remove("hidden");

        startTimer();

    }catch(err){

        console.error(err);

        alert("Không thể truy cập microphone.");

    }

}





// ===============================
// Finish
// ===============================

function finishRecorder(){

    audioBlob = new Blob(audioChunks,{
        type:"audio/webm"
    });

    audioChunks=[];

}



// ===============================
// Cancel
// ===============================
cancelBtn.onclick = ()=>{

    cleanupRecorder();

    audioBlob = null;

    audioChunks = [];

    panel.classList.add("hidden");

    resetTimer();

};
// ===============================
// Send
// ===============================

sendBtn.onclick = async ()=>{

    if(!mediaRecorder){
        return;
    }

    mediaRecorder.onstop = async ()=>{

        audioBlob = new Blob(audioChunks,{
            type:"audio/webm"
        });

        const voiceData = {

            type:"audio",

            blob:audioBlob,

            duration:seconds,

            fileName:`voice_${Date.now()}.webm`

        };


      await uploadVoiceToCloudinary(voiceData);


        panel.classList.add("hidden");


        cleanupRecorder();


        resetTimer();

    };


    if(mediaRecorder.state === "recording"){

        mediaRecorder.stop();

    }

};
function resetRecorderUI(){

    panel.classList.add("hidden");

}
function cleanupRecorder(){

clearInterval(timer);
timer = null;
    isRecording = false;

    isPaused = false;

    if(mediaStream){

        mediaStream
            .getTracks()
            .forEach(track=>track.stop());

        mediaStream = null;

    }

    cancelAnimationFrame(animationFrame);

    if(audioContext){

        audioContext.close();

        audioContext = null;

    }

    mediaRecorder = null;

    uploadTask = null;

    isUploading = false;

}
function drawWave(){

    if(!analyser || !dataArray || !waveCtx){
        return;
    }

    animationFrame =
    requestAnimationFrame(drawWave);


    analyser.getByteFrequencyData(dataArray);


    waveCtx.clearRect(
        0,
        0,
        waveCanvas.width,
        waveCanvas.height
    );


    const width = 4;
    const gap = 2;

    let x = 0;


    for(let i=0;i<40;i++){

        const value =
        dataArray[i] / 255;


        const h =
        value * 55 + 4;


        waveCtx.fillStyle="#0084ff";


        waveCtx.fillRect(
            x,
            waveCanvas.height-h,
            width,
            h
        );


        x += width + gap;

    }

}
async function saveVoiceMessage(audioUrl, duration){

    const receiver = window.currentChatUid;

    console.log("receiver:", receiver);
    console.log("sender:", auth.currentUser.uid);


    if(!receiver){

        console.error("Không có người nhận!");

        alert("Chưa chọn người chat");

        return;

    }


    await db.collection("messages").add({

        type:"audio",

        audioUrl,

        duration,

        senderId: auth.currentUser.uid,

        receiverId: receiver,

        createdAt: FieldValue.serverTimestamp(),

        seen:false,

        recalled:false,

        deleted:false

    });

}
