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

        audioChunks = [];

        audioBlob = null;

        resetTimer();

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

        mediaRecorder.start(200);

        isRecording = true;

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

    cleanupRecorder();
function resetRecorderUI(){

    pauseBtn.classList.remove("hidden");

    resumeBtn.classList.add("hidden");

    player.classList.add("hidden");

    progress.value = 0;

}
    if(objectURL){

        URL.revokeObjectURL(objectURL);

    }

    objectURL = URL.createObjectURL(audioBlob);

    audio.src = objectURL;

    player.classList.remove("hidden");

    duration.textContent = recordTime.textContent;

}
cleanupRecorder();

if(objectURL){

    URL.revokeObjectURL(objectURL);

}

objectURL = URL.createObjectURL(audioBlob);

audio.src = objectURL;
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
    panel.classList.add("hidden");
    resetRecorderUI();
    resetTimer();

};
// ===============================
// Send
// ===============================

sendBtn.onclick=()=>{

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

    console.log(voiceData);

    // ==================================
    // Firebase v8
    // uploadVoice(voiceData)
    // ==================================

    document.dispatchEvent(

        new CustomEvent("voiceRecorded",{

            detail:voiceData

        })

    );

    panel.classList.add("hidden");

    resetTimer();

};
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

    mediaRecorder = null;

}
