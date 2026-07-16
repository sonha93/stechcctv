// ================================
// GLOBAL CALL LISTENER
// ================================

import { auth } from "../firebase-init.js";

import {
    listenIncomingCall
} from "./call-firebase.js";



auth.onAuthStateChanged(user=>{

    if(!user)
    return;


    listenIncomingCall(
        user.uid,
        incomingCall
    );


});



function incomingCall(call){


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
