 // ================================
// CHAT SERVICE JS (FIREBASE V8)
// ================================


import {
    db
} from "./firebase.js";




// ================================
// FIND EXISTING CONVERSATION
// ================================

export async function findConversation(
    uid1,
    uid2
){

try{


    const snap =
    await db
    .collection("conversations")
    .where(
        "members",
        "array-contains",
        uid1
    )
    .get();



    let result = null;



    snap.forEach(doc=>{


        const data =
        doc.data();



        if(
            data.members &&
            data.members.includes(uid2)
        ){

            result = {

                id:doc.id,

                ...data

            };

        }


    });



    return result;



}catch(err){


    console.error(
        "Tìm conversation lỗi:",
        err
    );


    return null;


}


}






// ================================
// CREATE CONVERSATION
// ================================

export async function createConversation(
    user
){

try{


    const current =
    firebase.auth()
    .currentUser;



    if(!current)
    return null;



    const old =
    await findConversation(
        current.uid,
        user.uid
    );



    if(old){

        return old.id;

    }




    const ref =
    await db
    .collection("conversations")
    .add({

        members:[

            current.uid,

            user.uid

        ],


        name:
        user.name ||
        "Người dùng",


        avatar:
        user.avatar ||
        "",


        lastMessage:"",


        updatedAt:
        firebase.firestore
        .Timestamp
        .now()


    });



    return ref.id;



}catch(err){


    console.error(
        "Tạo conversation lỗi:",
        err
    );


    return null;


}

}






// ================================
// SEND MESSAGE
// ================================

export async function sendChatMessage(
    conversationId,
    text
){

try{


    const user =
    firebase.auth()
    .currentUser;



    if(!user)
    return;



    if(!text.trim())
    return;




    const now =
    firebase.firestore
    .Timestamp
    .now();




    await db
    .collection("messages")
    .doc(conversationId)
    .collection("items")
    .add({

        senderId:
        user.uid,


        text:
        text.trim(),


        createdAt:
        now


    });





    await db
    .collection("conversations")
    .doc(conversationId)
    .update({

        lastMessage:
        text.trim(),


        updatedAt:
        now


    });



}catch(err){


    console.error(
        "Gửi message lỗi:",
        err
    );


}


}






// ================================
// GET CONVERSATION
// ================================

export async function getConversation(
    id
){

try{


    const doc =
    await db
    .collection("conversations")
    .doc(id)
    .get();



    if(!doc.exists)
    return null;



    return {

        id:doc.id,

        ...doc.data()

    };



}catch(err){


    console.error(
        "Lấy conversation lỗi:",
        err
    );


    return null;


}


}
