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

        seconds++;

        const m = String(Math.floor(seconds/60)).padStart(2,"0");
        const s = String(seconds%60).padStart(2,"0");

        recordTime.textContent = `${m}:${s}`;

    },1000);

}

function stopTimer(){

    clearInterval(timer);

}

function resetTimer(){

    stopTimer();

    seconds = 0;

    recordTime.textContent = "00:00";

}

// ===============================
// Recorder
// ===============================

async function startRecorder(){

    try{

        const stream = await navigator.mediaDevices.getUserMedia({
            audio:true
        });

        audioChunks = [];

        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable=(e)=>{

            audioChunks.push(e.data);

        };

        mediaRecorder.onstop=finishRecorder;

        mediaRecorder.start();

        panel.classList.remove("hidden");

        player.classList.add("hidden");

        pauseBtn.classList.remove("hidden");

        resumeBtn.classList.add("hidden");

        startTimer();

    }catch(err){

        alert("Không thể sử dụng microphone.");

        console.error(err);

    }

}

// ===============================
// Pause
// ===============================

pauseBtn.onclick=()=>{

    if(!mediaRecorder) return;

    mediaRecorder.pause();

    stopTimer();

    pauseBtn.classList.add("hidden");

    resumeBtn.classList.remove("hidden");

};

// ===============================
// Resume
// ===============================

resumeBtn.onclick=()=>{

    if(!mediaRecorder) return;

    mediaRecorder.resume();

    startTimer();

    resumeBtn.classList.add("hidden");

    pauseBtn.classList.remove("hidden");

};

// ===============================
// Stop
// ===============================

stopBtn.onclick=()=>{

    if(!mediaRecorder) return;

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

    audio.src = URL.createObjectURL(audioBlob);

    player.classList.remove("hidden");

    duration.textContent = recordTime.textContent;

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

    if(audio.src){

        URL.revokeObjectURL(audio.src);

    }

    audio.pause();

    audio.src="";

    audioBlob=null;

    player.classList.add("hidden");

    panel.classList.add("hidden");

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
