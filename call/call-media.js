// ================================
// CALL MEDIA JS
// WEBRTC MEDIA
// ================================


let localStream = null;
let peerConnection = null;


// STUN SERVER

const rtcConfig = {

    iceServers:[
        {
            urls:
            "stun:stun.l.google.com:19302"
        }
    ]

};



// ================================
// GET MICROPHONE
// ================================

export async function getAudioStream(){

    localStream =
    await navigator.mediaDevices
    .getUserMedia({

        audio:true,
        video:false

    });


    return localStream;

}



// ================================
// GET VIDEO
// ================================

export async function getVideoStream(){

    localStream =
    await navigator.mediaDevices
    .getUserMedia({

        audio:true,
        video:true

    });


    return localStream;

}



// ================================
// CREATE PEER
// ================================

export function createPeer(){

    peerConnection =
    new RTCPeerConnection(
        rtcConfig
    );


    if(localStream){

        localStream
        .getTracks()
        .forEach(track=>{

            peerConnection
            .addTrack(
                track,
                localStream
            );

        });

    }


    return peerConnection;

}



// ================================
// REMOTE STREAM
// ================================

export function onRemoteStream(
callback
){

    if(!peerConnection)
    return;


    peerConnection
    .ontrack =
    event=>{


        const stream =
        event.streams[0];


        callback(stream);


    };


}



// ================================
// ICE
// ================================

export function onIceCandidate(
callback
){

    if(!peerConnection)
    return;


    peerConnection
    .onicecandidate =
    event=>{


        if(event.candidate){

            callback(
                event.candidate
            );

        }


    };

}



// ================================
// CLOSE
// ================================

export function closeMedia(){


    if(localStream){

        localStream
        .getTracks()
        .forEach(track=>{

            track.stop();

        });

    }


    if(peerConnection){

        peerConnection.close();

    }


    localStream = null;

    peerConnection = null;


}
