import { db, auth } from "./firebase-init.js";

import {
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// âm thanh
const notifySound = new Audio();

notifySound.src = "./assets/sounds/message.mp3";
notifySound.preload = "auto";
notifySound.volume = 0.7;


// trạng thái đã mở khóa
let soundUnlocked = false;


// mở khóa âm thanh mobile
function unlockSound(){

    if(soundUnlocked) return;

    const tempSound = new Audio("./assets/sounds/message.mp3");

    tempSound.volume = 0;

    tempSound.play()
    .then(()=>{

        tempSound.pause();
        tempSound.currentTime = 0;

        soundUnlocked = true;

        console.log("Âm thanh đã mở khóa");

    })
    .catch(err=>{

        console.log("Unlock lỗi:",err);

    });

}



document.addEventListener(
    "touchstart",
    unlockSound,
    {once:true, passive:true}
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


                if(!soundUnlocked){

                    console.log("Chưa mở khóa âm thanh");
                    return;

                }



                notifySound.currentTime = 0;


                notifySound.play()

                .then(()=>{

                    console.log("Đã phát chuông");

                })

                .catch(err=>{

                    console.log(
                        "Lỗi phát âm thanh:",
                        err
                    );

                });


            }


        });


    });


});
