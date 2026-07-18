// ================================
// GLOBAL CALL LISTENER
// ================================

import { auth } from "../firebase-init.js";

import {
    listenIncomingCall
} from "./call-firebase.js";
const ringtone = new Audio("../assets/sounds/ring.mp3");

ringtone.loop = true;


auth.onAuthStateChanged(user=>{

    if(!user)
    return;


    listenIncomingCall(
        user.uid,
        incomingCall
    );


});



async function incomingCall(call){
ringtone.currentTime = 0;

ringtone.play().catch(console.error);

    console.log(
        "CUỘC GỌI ĐẾN",
        call
    );


    


    window.open(

`call.html?uid=${call.from}&callId=${call.id}&incoming=1&type=${call.type}`,

"callWindow",

"width=420,height=700"

);

}
