
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
loadReview();

async function loadReview(){

    const snap = await getDocs(collection(db,"products"));

    container.innerHTML = "";

    snap.forEach(docSnap=>{

        const product = docSnap.data();

        if(!product.videos || product.videos.length===0) return;

        const id = docSnap.id;

        const video =
        typeof product.videos[0] === "string"
        ? product.videos[0]
        : product.videos[0].url;

        const oldPrice = Number(product.oldPrice||0);
        const price = Number(product.price||0);

        const sale =
        oldPrice>0
        ? Math.round((oldPrice-price)/oldPrice*100)
        : 0;

        container.innerHTML += `

<section class="review-item">

<video
class="review-video"
src="${video}"
playsinline
controls
preload="metadata">
</video>

<div class="review-info">

<h3>${product.name}</h3>

<div style="margin-top:8px;">

<div style="
font-size:24px;
font-weight:bold;
color:red;
">
${price.toLocaleString()}đ
</div>

<div style="
color:#888;
text-decoration:line-through;
">
${oldPrice.toLocaleString()}đ
</div>

<div style="
display:inline-block;
margin-top:6px;
padding:4px 10px;
background:red;
color:#fff;
border-radius:20px;
">
-${sale}%
</div>

</div>

<button
class="buy-btn"
onclick="location.href='logo.html?id=${id}'">

Mua ngay

</button>

</div>

</section>

`;

    });

    autoPlay();

}

function autoPlay(){

    const observer = new IntersectionObserver(entries=>{

        entries.forEach(entry=>{

            const video = entry.target;

            if(entry.isIntersecting){

                document
                .querySelectorAll(".review-video")
                .forEach(v=>{

                    if(v!==video){

                        v.pause();
                        v.currentTime=0;

                    }

                });

                video.play().catch(()=>{});

            }else{

                video.pause();

            }

        });

    },{

        threshold:0.7

    });

    document
    .querySelectorAll(".review-video")
    .forEach(video=>observer.observe(video));

}
