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

    snap.forEach(docSnap => {

        const product = docSnap.data();
        if(!product.videos || product.videos.length === 0) return;

        const id = docSnap.id;

        const video = typeof product.videos[0] === "string"
            ? product.videos[0]
            : product.videos[0].url;

        container.innerHTML += `
        <div class="video-item">

            <video class="review-video"
                src="${video}"
                playsinline
                muted
                loop
                preload="metadata">
            </video>

            <div class="info">
                <div>${product.name}</div>

                <button class="buy-btn"
                onclick="location.href='logo.html?id=${id}'">
                    Mua ngay
                </button>
            </div>

        </div>`;
    });

    setupVideo();
}

function setupVideo(){

    const videos = document.querySelectorAll(".review-video");

    const observer = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            const video = entry.target;

            if(entry.isIntersecting){

                videos.forEach(v=>{
                    if(v !== video){
                        v.pause();
                        v.currentTime = 0;
                        v.muted = true;
                    }
                });

                video.play().catch(()=>{});

            }else{
                video.pause();
            }

        });

    }, { threshold: 0.8 });

    videos.forEach(video => {

        // 🔥 click để bật/tắt tiếng (QUAN TRỌNG)
        video.addEventListener("click", () => {

            video.muted = !video.muted;

            if(!video.muted){
                video.play();
            }
        });

        observer.observe(video);
    });
}
