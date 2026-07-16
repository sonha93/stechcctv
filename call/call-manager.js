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



    const audioBtn =
    document.getElementById(
        "audioCallBtn"
    );


    const videoBtn =
    document.getElementById(
        "videoCallBtn"
    );



    if(audioBtn){

        audioBtn.onclick = ()=>{

            startCall(
                "audio"
            );

        };

    }



    if(videoBtn){

        videoBtn.onclick = ()=>{

            startCall(
                "video"
            );

        };

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
