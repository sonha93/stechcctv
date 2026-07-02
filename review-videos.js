import { db } from "./firebase-init.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const wrap = document.getElementById("reviewVideos");

const snap = await getDocs(collection(db,"products"));

snap.forEach(doc=>{

    const data = doc.data();

    if(!data.videos?.length) return;

    data.videos.forEach(video=>{
   console.log(video);
        wrap.innerHTML += `
            <div class="review-video-card">
                <video
                    controls
                    preload="metadata">
                    <source src="${video}" type="video/mp4">
                </video>
            </div>
        `;

    });

});
