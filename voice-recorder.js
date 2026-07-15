// ===============================
// Upload State
// ===============================
import {
    db,
    auth,
    FieldValue,
     storage
} from "./firebase-init.js";
let uploadTask = null;

let isUploading = false;
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

let objectURL = null;
const openBtn = document.getElementById("openRecorderBtn");
const panel = document.getElementById("voicePanel");

const recordTime = document.getElementById("recordTime");

const cancelBtn = document.getElementById("cancelRecordBtn");
const pauseBtn = document.getElementById("pauseRecordBtn");
const resumeBtn = document.getElementById("resumeRecordBtn");
const stopBtn = document.getElementById("stopRecordBtn");
const sendBtn = document.getElementById("sendRecordBtn");

const player = document.getElementById("voicePlayer");
const playBtn = document.getElementById("playVoiceBtn");

const progress = document.getElementById("voiceProgress");
const duration = document.getElementById("voiceDuration");

const audio = document.getElementById("voiceAudio");
const waveCanvas = document.getElementById("waveCanvas");

const waveCtx = waveCanvas 
    ? waveCanvas.getContext("2d") 
    : null;
// ===============================
// Open
// ===============================

openBtn.addEventListener("click", startRecorder);

// ===============================
// Timer
// ===============================

function startTimer(){

    clearInterval(timer);

    timer = setInterval(()=>{

        if(!isRecording) return;

        seconds++;

        if(seconds>=MAX_RECORD_SECONDS){

            stopBtn.click();

            return;

        }

        const m = String(
            Math.floor(seconds/60)
        ).padStart(2,"0");

        const s = String(
            seconds%60
        ).padStart(2,"0");

        recordTime.textContent=`${m}:${s}`;

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

        mediaRecorder.onstop = finishRecorder;

        mediaRecorder.onerror=(err)=>{

            console.error(err);

            cleanupRecorder();
            
        };
       
           isRecording = true;

        mediaRecorder.start(200);

        isPaused = false;

        panel.classList.remove("hidden");

        player.classList.add("hidden");

        pauseBtn.classList.remove("hidden");

        resumeBtn.classList.add("hidden");

        startTimer();

    }catch(err){

        console.error(err);

        alert("Không thể truy cập microphone.");

    }

}

// ===============================
// Pause
// ===============================

pauseBtn.onclick = () => {

    if (!mediaRecorder) return;

    if (mediaRecorder.state !== "recording") return;

    mediaRecorder.pause();

    isPaused = true;

    stopTimer();

    pauseBtn.classList.add("hidden");

    resumeBtn.classList.remove("hidden");

};
// ===============================
// Resume
// ===============================

resumeBtn.onclick = () => {

    if (!mediaRecorder) return;

    if (mediaRecorder.state !== "paused") return;

    mediaRecorder.resume();

    isPaused = false;

    startTimer();

    resumeBtn.classList.add("hidden");

    pauseBtn.classList.remove("hidden");

};

// ===============================
// Stop
// ===============================

stopBtn.onclick = () => {

    if (!mediaRecorder) return;

    if (mediaRecorder.state === "inactive") return;

    mediaRecorder.stop();

    stopTimer();

};

// ===============================
// Finish
// ===============================

function finishRecorder(){

    audioBlob = new Blob(audioChunks,{
        type:"audio/webm"
    });


    objectURL =
    URL.createObjectURL(audioBlob);


    audio.src = objectURL;


    player.classList.remove("hidden");


    audioChunks=[];


    cleanupRecorder();

}
// ===============================
// Play
// ===============================

playBtn.onclick=()=>{

    if(audio.paused){

        audio.play();

        playBtn.innerHTML=`
        <svg viewBox="0 0 24 24">
            <path fill="currentColor"
            d="M7 5h4v14H7zm6 0h4v14h-4z"/>
        </svg>`;

    }else{

        audio.pause();

        playBtn.innerHTML=`
        <svg viewBox="0 0 24 24">
            <path fill="currentColor"
            d="M8 5v14l11-7z"/>
        </svg>`;

    }

};

// ===============================
// Progress
// ===============================

audio.addEventListener("timeupdate",()=>{

    progress.value =

        audio.currentTime /
        audio.duration
        *100 || 0;

});

progress.oninput=()=>{

    audio.currentTime=

    progress.value/100
    *audio.duration;

};

audio.onended=()=>{

    progress.value=0;

    playBtn.innerHTML=`
    <svg viewBox="0 0 24 24">
        <path fill="currentColor"
        d="M8 5v14l11-7z"/>
    </svg>`;

};

// ===============================
// Cancel
// ===============================
cancelBtn.onclick=()=>{

    cancelUpload();
    cleanupRecorder();

    if(objectURL){

        URL.revokeObjectURL(objectURL);

        objectURL=null;

    }

    audio.pause();

    audio.removeAttribute("src");

    audio.load();

    audioBlob=null;

    audioChunks=[];

    progress.value=0;

    player.classList.add("hidden");
    resetRecorderUI();


};
function cancelUpload(){

    if(uploadTask){

        uploadTask.cancel();

    }

}
async function saveVoiceMessage(

    audioUrl,

    duration

){

    await db
    .collection("messages")
    .add({

        type:"audio",

        audioUrl,

        duration,

        senderId:

        auth.currentUser.uid,

        receiverId:

        window.currentChatUid,

           createdAt:
FieldValue.serverTimestamp(),
        seen:false,

        recalled:false,

        deleted:false

    });

}
// ===============================
// Send
// ===============================

sendBtn.onclick = async ()=>{

    if(!audioBlob){

        alert("Chưa có đoạn ghi âm.");

        return;

    }

    const voiceData={

        type:"audio",

        blob:audioBlob,

        duration:seconds,

        fileName:`voice_${Date.now()}.webm`

    };

  await uploadVoiceToFirebase(

    voiceData

);

    panel.classList.add("hidden");

    resetTimer();

};
function resetRecorderUI(){

    pauseBtn.classList.remove("hidden");

    resumeBtn.classList.add("hidden");

    player.classList.add("hidden");

    progress.value = 0;

}
function cleanupRecorder(){

    stopTimer();

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
async function uploadVoiceToFirebase(voice){

    if(isUploading) return;

    isUploading = true;

    try{

       if(!auth.currentUser){

    alert("Chưa đăng nhập");

    isUploading=false;

    return;

}

const uid = auth.currentUser.uid;

        const filePath =
        `voices/${uid}/${voice.fileName}`;

        const storageRef =
storage.ref()
.child(filePath);
        uploadTask =
        storageRef.put(voice.blob);

        uploadTask.on(

            "state_changed",

            snapshot=>{

                const percent = Math.floor(

                    snapshot.bytesTransferred
                    /
                    snapshot.totalBytes
                    *100

                );

                console.log(
                    "Upload:",
                    percent+"%"
                );

            },

            err=>{

                console.error(err);

                isUploading=false;

                alert("Upload thất bại.");

            },

            async()=>{

                const audioUrl =
                await storageRef.getDownloadURL();

                await saveVoiceMessage(

                    audioUrl,

                    voice.duration

                );

                isUploading=false;

            }

        );

    }catch(err){

        console.error(err);

        isUploading=false;

    }

}
