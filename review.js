import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDYVcBEYJN1HUCta3XdJAUBe4TGLnmy7y4",
    authDomain: "stech-73b89.firebaseapp.com",
    projectId: "stech-73b89",
    storageBucket: "stech-73b89.firebasestorage.app",
    messagingSenderId: "873739162979",
    appId: "1:873739162979:web:978f1a4043f025b1cdaf56"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const container = document.getElementById("reviewProducts");

document.addEventListener("DOMContentLoaded", loadReview);

async function loadReview(){

    const snap = await getDocs(collection(db,"products"));

    container.innerHTML = "";

    snap.forEach(docSnap=>{

        const p = docSnap.data();

        if(!p.videos || !p.videos.length) return;

        const video =
    (typeof p.videos[0] === "string"
        ? p.videos[0]
        : p.videos[0].url)
    .replace(
        "/upload/",
        "/upload/f_auto,q_auto:best,w_1080/"
    );

        container.insertAdjacentHTML("beforeend",`
        <div class="video-item">

            <video
                class="review-video"
                src="${video}"
                playsinline
                webkit-playsinline
                preload="auto"
                loop
                muted
                controlslist="nodownload"
                disablepictureinpicture
            ></video>

            <div class="info">
                <div>${p.name}</div>

                <button class="buy-btn"
                    onclick="location.href='logo.html?id=${docSnap.id}'">
                    Mua ngay
                </button>
            </div>

        </div>
        `);

    });

    setupVideo();
}

function setupVideo(){

    const videos=document.querySelectorAll(".review-video");

    let currentVideo=null;

    const observer=new IntersectionObserver(entries=>{

        entries.forEach(entry=>{

            const video=entry.target;

            if(entry.isIntersecting && entry.intersectionRatio>=0.8){

                if(currentVideo && currentVideo!==video){

                    currentVideo.pause();
                    currentVideo.currentTime=0;
                    currentVideo.muted=true;

                }

                currentVideo=video;

                video.play().catch(()=>{});

            }else{

                video.pause();

            }

        });

    },{
        threshold:0.8
    });

    videos.forEach(video=>{

        observer.observe(video);

        video.addEventListener("click",()=>{

            video.muted=!video.muted;

            if(!video.paused){

                video.play().catch(()=>{});

            }

        });

        video.addEventListener("ended",()=>{

            video.currentTime=0;
            video.play().catch(()=>{});

        });

        video.addEventListener("loadedmetadata",()=>{

            video.playbackRate=1;

            video.volume=1;

        });

    });

    document.addEventListener("visibilitychange",()=>{

        if(document.hidden){

            videos.forEach(v=>v.pause());

        }else{

            if(currentVideo){

                currentVideo.play().catch(()=>{});

            }

        }

    });

}
