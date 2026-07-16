// ================================
// GLOBAL CALL LISTENER
// ================================

import { auth, db } from "../firebase-init.js";

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



async function incomingCall(call){


    console.log(
        "CUỘC GỌI ĐẾN",
        call
    );


    const userSnap = await db
    .collection("users")
    .doc(call.from)
    .get();


    const userData =
    userSnap.exists
    ? userSnap.data()
    : {};


    const userName =
    userData.name ||
    userData.displayName ||
    userData.username ||
    "Người dùng";


    const userAvatar =
    userData.avatar ||
    userData.photoURL ||
    userData.photo ||
    userData.image ||
    "default-avatar.png";



    window.open(

        `call.html?uid=${call.from}&callId=${call.id}&name=${encodeURIComponent(userName)}&avatar=${encodeURIComponent(userAvatar)}&incoming=1&type=${call.type}`,

        "callWindow",

        "width=420,height=700"

    );


}
