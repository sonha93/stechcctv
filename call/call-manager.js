// ================================
// CALL MANAGER JS
// CONNECT ALL CALL SYSTEM
// ================================


import {
    createCall,
    listenIncomingCall,
    updateCallStatus,
    removeCall
}
from "./call-firebase.js";


import {
    getAudioStream,
    getVideoStream,
    createPeer,
    onRemoteStream,
    onIceCandidate,
    closeMedia
}
from "./call-media.js";


// ================================
// DATA
// ================================

let db = null;
let auth = null;
let conversationId = null;
let currentUser = null;

let currentCallId = null;

let peer = null;


// ================================
// INIT
// ================================

export function initCallSystem(data){
console.log("CALL INIT OK");

    db = data.db;

    auth = data.auth;

    conversationId =
    data.conversationId;

    currentUser =
    data.currentUser;



    listenIncomingCall(
        currentUser.uid,
        incomingCall
    );



   const audioBtn = document.querySelector("#audioCallBtn");

console.log("TÌM NÚT GỌI:", audioBtn);


if(audioBtn){

    audioBtn.addEventListener("click", ()=>{

        console.log("ĐÃ BẤM GỌI");

        startCall("audio");

    });

}else{

    console.log("KHÔNG CÓ NÚT GỌI");

}


    if(audioBtn){

        audioBtn.onclick = ()=>{
 console.log("ĐÃ BẤM GỌI");
            startCall(
                "audio"
            );

        };

    }



    
    }


}



// ================================
// START CALL
// ================================

async function startCall(type){


    const conv =
    await db
    .collection("conversations")
    .doc(conversationId)
    .get();



    const otherUid =
    conv.data()
    .members
    .find(
        uid=>uid!==currentUser.uid
    );



    currentCallId =
    await createCall(
        currentUser.uid,
        otherUid,
        type
    );

// MỞ GIAO DIỆN CUỘC GỌI

const userSnap = await db
.collection("users")
.doc(otherUid)
.get();

const userData = userSnap.exists
? userSnap.data()
: {};


window.open(
`call.html?uid=${otherUid}&callId=${currentCallId}&name=${encodeURIComponent(userData.name || "Người dùng")}&avatar=${encodeURIComponent(userData.avatar || "")}&incoming=0&type=${type}`,
"callWindow",
"width=420,height=700"
);

    if(type==="video"){

        await getVideoStream();

    }else{

        await getAudioStream();

    }



    peer =
    createPeer();



    onRemoteStream(
        stream=>{

            const audio =
            document.getElementById(
                "remoteAudio"
            );

            if(audio){

                audio.srcObject =
                stream;

            }

        }
    );



    onIceCandidate(
        candidate=>{


            db.collection("calls")
            .doc(currentCallId)
            .collection("candidates")
            .add(
                candidate
            );


        }
    );


}



// ================================
// INCOMING CALL
// ================================

async function incomingCall(call){


    currentCallId =
    call.id;

window.open(
    `call.html?uid=${call.from}
    &callId=${call.id}
    &incoming=1
    &type=${call.type}`,
    "callWindow",
    "width=420,height=700"
);

    console.log(
        "Có cuộc gọi đến",
        call
    );



    const accept =
    document.getElementById(
        "acceptBtn"
    );


    if(accept){

        accept.onclick =
        async()=>{


            await updateCallStatus(
                currentCallId,
                "accepted"
            );


            if(call.type==="video"){

                await getVideoStream();

            }else{

                await getAudioStream();

            }


            peer =
            createPeer();



        };

    }



    const reject =
    document.getElementById(
        "rejectBtn"
    );


    if(reject){

        reject.onclick =
        async()=>{


            await updateCallStatus(
                currentCallId,
                "rejected"
            );


            await removeCall(
                currentCallId
            );


        };

    }


}



// ================================
// END CALL
// ================================

export async function endCall(){


    if(currentCallId){

        await removeCall(
            currentCallId
        );

    }


    closeMedia();


    currentCallId = null;


}
