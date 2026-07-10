import { db, auth } from "./firebase-init.js";

import {
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const notifySound = new Audio("./assets/sounds/message.mp3");

notifySound.preload = "auto";
notifySound.volume = 0.7;


// mở khóa âm thanh mobile
function unlockSound(){

    notifySound.play()
    .then(()=>{

        notifySound.pause();
        notifySound.currentTime = 0;

    })
    .catch(()=>{});

}


document.addEventListener(
    "touchstart",
    unlockSound,
    {once:true}
);

document.addEventListener(
    "click",
    unlockSound,
    {once:true}
);



auth.onAuthStateChanged(user=>{

    if(!user) return;


    const q = query(
        collection(db,"notifications"),
        where("receiverId","==",user.uid),
        where("read","==",false)
    );


    onSnapshot(q,(snap)=>{


        snap.docChanges().forEach(change=>{


            if(change.type==="added"){


                notifySound.currentTime = 0;


                notifySound.play()
                .then(()=>{

                })
                .catch(err=>{

                    console.log(
                    "Không phát được âm thanh:",
                    err
                    );

                });


            }


        });


    });


});
